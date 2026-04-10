/**
 * AlfaZoo Voice Service — V9
 *
 * CORRECÇÕES DESTA VERSÃO:
 * - Fallback Web Speech usa SEMPRE pt-PT (nunca en, nunca es)
 * - pickVoice() — se não encontrar voz PT, não usa voz aleatória (evita espanhol)
 * - TTS prompt em português explícito ("fala em português de Portugal")
 * - Cache permanente localStorage (frases já geradas = instantâneas)
 * - Timeout 2.5s + contador de falhas (após 3 falhas vai directo ao fallback)
 * - Cancel ao trocar aba / sair da página
 * - reqId para descartar respostas antigas (zero sobreposição)
 */

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

// ── Cache permanente ──────────────────────────────────────────────────────────
const CACHE_KEY = 'az_audio_v9';
const MAX_CACHE = 80;

function loadCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function saveCache(c: Record<string, string>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {}
}
function getCached(key: string): string | null {
  return loadCache()[key] ?? null;
}
function setCached(key: string, b64: string) {
  const c    = loadCache();
  const keys = Object.keys(c);
  if (keys.length >= MAX_CACHE) {
    keys.slice(0, keys.length - MAX_CACHE + 1).forEach(k => delete c[k]);
  }
  c[key] = b64;
  saveCache(c);
}

// ── AudioContext ──────────────────────────────────────────────────────────────
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _ctx;
}
async function ensureCtx(): Promise<AudioContext> {
  const ctx = getCtx();
  if (ctx.state === 'suspended') await ctx.resume();
  return ctx;
}

// ── PCM16 → AudioBuffer ───────────────────────────────────────────────────────
function pcm16ToBuffer(u8: Uint8Array, sr = 24000): AudioBuffer {
  const ctx = getCtx();
  const n   = u8.byteLength / 2;
  const buf = ctx.createBuffer(1, n, sr);
  const ch  = buf.getChannelData(0);
  const dv  = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  for (let i = 0; i < n; i++) ch[i] = dv.getInt16(i * 2, true) / 32768;
  return buf;
}

async function b64ToBuffer(b64: string): Promise<AudioBuffer> {
  await ensureCtx();
  const bin = atob(b64);
  const u8  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  try {
    return await getCtx().decodeAudioData(u8.buffer.slice(0));
  } catch {
    return pcm16ToBuffer(u8);
  }
}

function playBuffer(buf: AudioBuffer): { source: AudioBufferSourceNode; promise: Promise<void> } {
  const ctx    = getCtx();
  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.connect(ctx.destination);
  const promise = new Promise<void>(resolve => { source.onended = () => resolve(); });
  source.start(0);
  return { source, promise };
}

// ── Classe principal ──────────────────────────────────────────────────────────
class VoiceService {
  private synth    = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private ptVoice: SpeechSynthesisVoice | null = null;
  private curSrc:  AudioBufferSourceNode | null = null;
  private reqId    = 0;
  private active   = false;
  private gemFails = 0;
  private readonly MAX_FAILS = 3;

  constructor() {
    this.pickVoice();
    if (this.synth) this.synth.onvoiceschanged = () => this.pickVoice();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.cancel();
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide',     () => this.cancel());
      window.addEventListener('beforeunload', () => this.cancel());
      // Acorda AudioContext no primeiro gesto
      const wake = () => ensureCtx();
      window.addEventListener('click',      wake, { once: true, passive: true });
      window.addEventListener('touchstart', wake, { once: true, passive: true });
    }
  }

  private pickVoice() {
    const vv = this.synth?.getVoices() ?? [];
    // IMPORTANTE: só aceita vozes em português.
    // Nunca usa voz de outra língua (evita espanhol/inglês no fallback).
    this.ptVoice =
      vv.find(v => /joana/i.test(v.name)) ||
      vv.find(v => /natural|neural|premium/i.test(v.name) && v.lang.startsWith('pt')) ||
      vv.find(v => v.lang === 'pt-PT') ||
      vv.find(v => v.lang === 'pt-BR') ||
      vv.find(v => v.lang.startsWith('pt')) ||
      null; // se não há voz PT disponível, fica null — o utterance.lang forçará pt-PT
  }

  public async speak(rawText: string, options: SpeakOptions = {}): Promise<void> {
    this.cancel();

    const text = rawText
      .replace(/\p{Emoji_Presentation}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) { options.onEnd?.(); return; }

    const myId     = ++this.reqId;
    this.active    = true;
    options.onStart?.();

    // ── 1. Cache local ────────────────────────────────────────────────────────
    const cacheKey = text.slice(0, 120).toLowerCase().replace(/\s+/g, '_');
    const cached   = getCached(cacheKey);

    if (cached) {
      try {
        const buf = await b64ToBuffer(cached);
        if (myId !== this.reqId || !this.active) return;
        const { source, promise } = playBuffer(buf);
        this.curSrc = source;
        await promise;
        if (myId === this.reqId && this.active) options.onEnd?.();
        this.active = false;
        return;
      } catch {
        const c = loadCache(); delete c[cacheKey]; saveCache(c);
      }
    }

    // ── 2. Gemini via /api/tts (com timeout 2.5s) ────────────────────────────
    if (this.gemFails < this.MAX_FAILS) {
      try {
        const ctrl    = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 2500);

        const res = await fetch('/api/tts', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text }),
          signal:  ctrl.signal,
        });
        clearTimeout(timeout);

        if (myId !== this.reqId || !this.active) return;

        if (res.ok) {
          const json = await res.json();
          if (json.audio) {
            setCached(cacheKey, json.audio);
            const buf = await b64ToBuffer(json.audio);
            if (myId !== this.reqId || !this.active) return;
            const { source, promise } = playBuffer(buf);
            this.curSrc   = source;
            this.gemFails = 0;
            await promise;
            if (myId === this.reqId && this.active) options.onEnd?.();
            this.active = false;
            return;
          }
        } else {
          if (res.status === 429) this.gemFails = this.MAX_FAILS;
          else this.gemFails++;
          console.warn('[voice] /api/tts status:', res.status);
        }
      } catch (e: any) {
        if (myId !== this.reqId) return;
        if (e?.name !== 'AbortError') this.gemFails++;
        console.warn('[voice] Gemini erro:', e?.message ?? e);
      }
    }

    // ── 3. Fallback Web Speech — FORÇADO em pt-PT ────────────────────────────
    if (!this.synth || !this.active || myId !== this.reqId) {
      options.onEnd?.();
      return;
    }

    if (!this.ptVoice) {
      await new Promise(r => setTimeout(r, 300));
      this.pickVoice();
    }

    const chunks = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    let i = 0;

    const sayNext = () => {
      if (!this.active || myId !== this.reqId || i >= chunks.length) {
        if (myId === this.reqId && this.active) options.onEnd?.();
        this.active = false;
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[i]);

      // CRÍTICO: força pt-PT mesmo sem voz instalada
      // Isto impede que o browser use espanhol ou inglês automaticamente
      if (this.ptVoice) {
        u.voice = this.ptVoice;
        u.lang  = this.ptVoice.lang; // ex: "pt-PT" ou "pt-BR"
      } else {
        u.lang = 'pt-PT'; // força sem voz específica
      }

      u.rate   = 0.82;
      u.pitch  = 1.25;
      u.volume = 1;
      u.onend   = () => { i++; setTimeout(sayNext, 160); };
      u.onerror = () => { options.onEnd?.(); this.active = false; };
      this.synth!.speak(u);
    };

    sayNext();
  }

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
      } catch {}
    }, 800);
  }

  public cancel(): void {
    this.active = false;
    this.reqId++;
    try { this.curSrc?.stop(); } catch {}
    this.curSrc = null;
    this.synth?.cancel();
  }
}

export const voiceService = new VoiceService();
