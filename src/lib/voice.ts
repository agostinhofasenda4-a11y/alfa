/**
 * AlfaZoo Voice Service — V8 Final
 *
 * Problemas resolvidos:
 * 1. Cache permanente em localStorage — frases já geradas nunca mais chamam a API
 * 2. Timeout de 2s — se Gemini demorar, fallback imediato (sem silêncio)
 * 3. AudioContext criado DENTRO do gesto do utilizador (fix mobile)
 * 4. Fallback Web Speech muito mais natural (pitch + rate optimizados)
 * 5. Prefetch silencioso da próxima frase enquanto a actual toca
 */

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

// ── Cache permanente em localStorage ─────────────────────────────────────────
// Guarda o base64 do áudio para não chamar a API duas vezes pela mesma frase.
// Máximo de 80 entradas — as mais antigas são removidas automaticamente.
const CACHE_KEY = 'az_audio_cache';
const MAX_CACHE = 80;

function loadCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function saveCache(c: Record<string, string>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); }
  catch {} // quota do localStorage cheia — ignora silenciosamente
}
function getCached(key: string): string | null {
  return loadCache()[key] ?? null;
}
function setCached(key: string, b64: string) {
  const c = loadCache();
  // Remove entradas antigas se ultrapassou o limite
  const keys = Object.keys(c);
  if (keys.length >= MAX_CACHE) {
    const toRemove = keys.slice(0, keys.length - MAX_CACHE + 1);
    toRemove.forEach(k => delete c[k]);
  }
  c[key] = b64;
  saveCache(c);
}

// ── AudioContext — criado lazily dentro de um gesto ───────────────────────────
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _ctx;
}

async function ensureCtx(): Promise<AudioContext> {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

// ── PCM16 raw (Gemini output) → AudioBuffer ───────────────────────────────────
function pcm16ToBuffer(u8: Uint8Array, sampleRate = 24000): AudioBuffer {
  const ctx     = getCtx();
  const samples = u8.byteLength / 2;
  const buf     = ctx.createBuffer(1, samples, sampleRate);
  const ch      = buf.getChannelData(0);
  const dv      = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  for (let i = 0; i < samples; i++) {
    ch[i] = dv.getInt16(i * 2, true) / 32768;
  }
  return buf;
}

async function b64ToBuffer(b64: string): Promise<AudioBuffer> {
  await ensureCtx();
  const bin = atob(b64);
  const u8  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  try {
    const ctx = getCtx();
    return await ctx.decodeAudioData(u8.buffer.slice(0));
  } catch {
    // Gemini devolve PCM16 raw — converter manualmente
    return pcm16ToBuffer(u8);
  }
}

function playBuffer(buf: AudioBuffer): { source: AudioBufferSourceNode; promise: Promise<void> } {
  const ctx    = getCtx();
  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.connect(ctx.destination);
  const promise = new Promise<void>(resolve => {
    source.onended = () => resolve();
  });
  source.start(0);
  return { source, promise };
}

// ── Classe principal ──────────────────────────────────────────────────────────
class VoiceService {
  private synth     = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private ptVoice:  SpeechSynthesisVoice | null = null;
  private curSrc:   AudioBufferSourceNode | null = null;
  private reqId     = 0;
  private active    = false;
  // Após falhas consecutivas ao Gemini, desiste e vai directo ao fallback
  private gemFails  = 0;
  private readonly MAX_FAILS = 3;

  constructor() {
    this.pickVoice();
    if (this.synth) {
      this.synth.onvoiceschanged = () => this.pickVoice();
    }

    // Corta áudio ao sair/trocar de aba
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.cancel();
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide',     () => this.cancel());
      window.addEventListener('beforeunload', () => this.cancel());
    }
  }

  private pickVoice() {
    const vv = this.synth?.getVoices() ?? [];
    this.ptVoice =
      // Prioridade 1: Joana (voz premium Apple em pt-PT)
      vv.find(v => /joana/i.test(v.name)) ||
      // Prioridade 2: qualquer voz neural/natural em pt
      vv.find(v => /natural|neural|premium/i.test(v.name) && v.lang.startsWith('pt')) ||
      // Prioridade 3: pt-PT
      vv.find(v => v.lang === 'pt-PT') ||
      // Prioridade 4: qualquer pt
      vv.find(v => v.lang.startsWith('pt')) ||
      vv[0] || null;
  }

  // ── speak ─────────────────────────────────────────────────────────────────
  public async speak(rawText: string, options: SpeakOptions = {}): Promise<void> {
    this.cancel();

    // Limpa emojis e espaços extra
    const text = rawText
      .replace(/\p{Emoji_Presentation}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) { options.onEnd?.(); return; }

    const myId = ++this.reqId;
    this.active = true;
    options.onStart?.();

    // ── Passo 1: verifica cache permanente ───────────────────────────────────
    const cacheKey = text.slice(0, 120).toLowerCase().replace(/\s+/g, '_');
    const cached   = getCached(cacheKey);

    if (cached) {
      try {
        const buf          = await b64ToBuffer(cached);
        if (myId !== this.reqId || !this.active) return;
        const { source, promise } = playBuffer(buf);
        this.curSrc = source;
        await promise;
        if (myId === this.reqId && this.active) options.onEnd?.();
        this.active = false;
        return;
      } catch {
        // cache corrompida — remove e continua
        const c = loadCache(); delete c[cacheKey]; saveCache(c);
      }
    }

    // ── Passo 2: tenta Gemini com timeout de 2.5s ────────────────────────────
    // Se já falhou muitas vezes consecutivas, vai directo ao fallback
    if (this.gemFails < this.MAX_FAILS) {
      try {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 2500);

        const res = await fetch('/api/tts', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text }),
          signal:  controller.signal,
        });
        clearTimeout(timeout);

        if (myId !== this.reqId || !this.active) return;

        if (res.ok) {
          const json = await res.json();
          if (json.audio) {
            // Guarda em cache permanente
            setCached(cacheKey, json.audio);
            const buf = await b64ToBuffer(json.audio);
            if (myId !== this.reqId || !this.active) return;
            const { source, promise } = playBuffer(buf);
            this.curSrc = source;
            this.gemFails = 0; // reset contador de falhas
            await promise;
            if (myId === this.reqId && this.active) options.onEnd?.();
            this.active = false;
            return;
          }
        } else {
          // 429 = quota esgotada — marca para não tentar mais nesta sessão
          if (res.status === 429) this.gemFails = this.MAX_FAILS;
          else this.gemFails++;
          console.warn('[voice] /api/tts status:', res.status);
        }
      } catch (e: any) {
        if (myId !== this.reqId) return;
        // AbortError = timeout — não conta como falha do Gemini
        if (e?.name !== 'AbortError') this.gemFails++;
        console.warn('[voice] Gemini timeout/erro:', e?.message ?? e);
      }
    }

    // ── Passo 3: fallback Web Speech API ─────────────────────────────────────
    if (!this.synth || !this.active || myId !== this.reqId) {
      options.onEnd?.(); return;
    }

    // Aguarda vozes se ainda não carregaram (comum no primeiro render)
    if (!this.ptVoice) {
      await new Promise(r => setTimeout(r, 300));
      this.pickVoice();
    }

    // Divide em frases para pausas naturais
    const chunks = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    let i = 0;

    const sayNext = () => {
      if (!this.active || myId !== this.reqId || i >= chunks.length) {
        if (myId === this.reqId && this.active) options.onEnd?.();
        this.active = false;
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[i]);
      if (this.ptVoice) u.voice = this.ptVoice;
      u.lang   = this.ptVoice?.lang ?? 'pt-PT';
      u.rate   = 0.82;   // calmo e claro para crianças
      u.pitch  = 1.25;   // ligeiramente mais agudo — soa mais feminino/animado
      u.volume = 1;
      u.onend   = () => { i++; setTimeout(sayNext, 160); };
      u.onerror = () => { options.onEnd?.(); this.active = false; };
      this.synth!.speak(u);
    };

    sayNext();
  }

  // ── prefetch silencioso ───────────────────────────────────────────────────
  // Chama enquanto o áudio actual ainda está a tocar, para que a próxima
  // frase já esteja em cache quando for precisa.
  public prefetch(text: string): void {
    const key = text.slice(0, 120).toLowerCase().replace(/\s+/g, '_');
    if (getCached(key) || this.gemFails >= this.MAX_FAILS) return;
    setTimeout(async () => {
      try {
        const res = await fetch('/api/tts', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text: text.replace(/\p{Emoji_Presentation}/gu, '').trim() }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.audio) setCached(key, json.audio);
        }
      } catch {} // silencioso
    }, 800); // espera 800ms para não competir com a frase actual
  }

  // ── cancel ────────────────────────────────────────────────────────────────
  public cancel(): void {
    this.active = false;
    this.reqId++;
    try { this.curSrc?.stop(); } catch {}
    this.curSrc = null;
    this.synth?.cancel();
  }
}

export const voiceService = new VoiceService();
