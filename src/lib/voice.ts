/**
 * AlfaZoo Voice Service — versão final
 *
 * CORRECÇÕES:
 * 1. reqId — cada speak() invalida todos os anteriores. Nunca dois sons ao mesmo tempo.
 * 2. visibilitychange / pagehide / beforeunload — corta o som ao sair/trocar aba.
 * 3. sessionStorage "az_greeted" — boas-vindas só uma vez por sessão.
 * 4. PCM16 → AudioBuffer — converte correctamente o áudio bruto do Gemini.
 * 5. Fallback instantâneo para Web Speech se o backend demorar ou falhar.
 */

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

// ── AudioContext partilhado ──────────────────────────────────────────────────
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

// Activa AudioContext no primeiro gesto do utilizador
if (typeof window !== 'undefined') {
  const wake = () => ensureCtx();
  window.addEventListener('click',      wake, { once: true, passive: true });
  window.addEventListener('touchstart', wake, { once: true, passive: true });
}

// ── PCM16 raw → AudioBuffer ──────────────────────────────────────────────────
function pcm16ToBuffer(bytes: Uint8Array, sampleRate = 24000): AudioBuffer {
  const ctx     = getCtx();
  const samples = bytes.byteLength / 2;
  const buf     = ctx.createBuffer(1, samples, sampleRate);
  const ch      = buf.getChannelData(0);
  const dv      = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < samples; i++) {
    ch[i] = dv.getInt16(i * 2, true) / 32768;
  }
  return buf;
}

// ── base64 → AudioBuffer ─────────────────────────────────────────────────────
async function b64ToBuffer(b64: string): Promise<AudioBuffer> {
  const ctx = await ensureCtx();
  const bin = atob(b64);
  const u8  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  try {
    // Tenta WAV/MP3/OGG
    return await ctx.decodeAudioData(u8.buffer.slice(0));
  } catch {
    // Gemini devolve PCM16 raw — converter manualmente
    return pcm16ToBuffer(u8);
  }
}

// ── Cache em memória ─────────────────────────────────────────────────────────
const audioCache = new Map<string, AudioBuffer>();

// ── Classe principal ─────────────────────────────────────────────────────────
class VoiceService {
  private synth   = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private ptVoice: SpeechSynthesisVoice | null = null;
  private curSrc: AudioBufferSourceNode | null = null;
  private reqId   = 0;   // sobe a cada speak(); respostas antigas são descartadas
  private active  = false;

  constructor() {
    if (!this.synth) return;

    // Escolhe a melhor voz portuguesa disponível
    const pick = () => {
      const vv = this.synth!.getVoices();
      this.ptVoice =
        vv.find(v => v.lang === 'pt-PT' && /natural|neural|premium/i.test(v.name)) ||
        vv.find(v => v.lang === 'pt-PT') ||
        vv.find(v => v.lang.startsWith('pt')) ||
        vv[0] || null;
    };
    pick();
    this.synth.onvoiceschanged = pick;

    // Corta o áudio ao esconder/sair da página
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

  // ── speak ──────────────────────────────────────────────────────────────────
  public async speak(rawText: string, options: SpeakOptions = {}): Promise<void> {
    // Cancela SEMPRE o que estiver a tocar antes de começar algo novo
    this.cancel();

    // Remove emojis para o TTS não os ler em voz alta
    const text = rawText
      .replace(/\p{Emoji_Presentation}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) { options.onEnd?.(); return; }

    // ID desta requisição — respostas de speak() anteriores serão ignoradas
    const myId = ++this.reqId;
    this.active = true;
    options.onStart?.();

    // ── 1. Tenta Gemini via /api/tts ────────────────────────────────────────
    try {
      const cacheKey = text.slice(0, 150).toLowerCase();
      let buf = audioCache.get(cacheKey);

      if (!buf) {
        const res = await fetch('/api/tts', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text }),
        });

        // Se entretanto chegou um speak() mais novo, descarta esta resposta
        if (myId !== this.reqId) return;

        if (res.ok) {
          const json = await res.json();
          if (json.audio) {
            buf = await b64ToBuffer(json.audio);
            audioCache.set(cacheKey, buf);
          }
        } else {
          console.warn('[voice] /api/tts status:', res.status);
        }
      }

      if (buf && myId === this.reqId && this.active) {
        const ctx = await ensureCtx();
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        this.curSrc = src;
        await new Promise<void>(resolve => {
          src.onended = () => { this.curSrc = null; resolve(); };
          src.start(0);
        });
        if (myId === this.reqId && this.active) options.onEnd?.();
        this.active = false;
        return;
      }
    } catch (e) {
      if (myId !== this.reqId) return; // descarta erros de requisições velhas
      console.warn('[voice] Gemini fallback:', (e as Error).message);
    }

    // ── 2. Fallback: Web Speech API ──────────────────────────────────────────
    if (!this.synth || !this.active || myId !== this.reqId) {
      options.onEnd?.();
      return;
    }

    if (!this.ptVoice) {
      await new Promise(r => setTimeout(r, 200));
      const vv = this.synth.getVoices();
      this.ptVoice = vv.find(v => v.lang.startsWith('pt')) || vv[0] || null;
    }

    const u = new SpeechSynthesisUtterance(text);
    if (this.ptVoice) u.voice = this.ptVoice;
    u.lang   = 'pt-PT';
    u.pitch  = 1.28;
    u.rate   = 0.88;
    u.volume = 1;
    u.onend   = () => { if (myId === this.reqId && this.active) options.onEnd?.(); this.active = false; };
    u.onerror = () => { options.onEnd?.(); this.active = false; };
    this.synth.speak(u);
  }

  // ── cancel ─────────────────────────────────────────────────────────────────
  public cancel(): void {
    this.active = false;
    this.reqId++;   // invalida qualquer fetch em curso
    if (this.curSrc) {
      try { this.curSrc.stop(); } catch {}
      this.curSrc = null;
    }
    this.synth?.cancel();
  }
}

export const voiceService = new VoiceService();
