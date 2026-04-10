/**
 * AlfaZoo Voice Service v5
 * Calls /api/tts (Vercel serverless) for real Gemini TTS.
 * Caches audio in memory. Falls back to Web Speech API.
 * Audio starts instantly — no delay, no autoplay block.
 */

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

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

if (typeof window !== 'undefined') {
  const wake = () => ensureCtx();
  window.addEventListener('click',      wake, { once: true, passive: true });
  window.addEventListener('touchstart', wake, { once: true, passive: true });
}

function pcm16ToBuffer(bytes: Uint8Array, sr = 24000): AudioBuffer {
  const ctx = getCtx();
  const n   = bytes.byteLength / 2;
  const buf = ctx.createBuffer(1, n, sr);
  const ch  = buf.getChannelData(0);
  const dv  = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < n; i++) ch[i] = dv.getInt16(i * 2, true) / 32768;
  return buf;
}

async function b64ToAudioBuffer(b64: string): Promise<AudioBuffer> {
  const ctx = await ensureCtx();
  const bin = atob(b64);
  const u8  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  try {
    return await ctx.decodeAudioData(u8.buffer.slice(0));
  } catch {
    return pcm16ToBuffer(u8);
  }
}

const cache = new Map<string, AudioBuffer>();

class VoiceService {
  private synth    = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private ptVoice: SpeechSynthesisVoice | null = null;
  private active   = false;
  private curSrc: AudioBufferSourceNode | null = null;

  constructor() {
    if (!this.synth) return;
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
  }

  public async speak(rawText: string, options: SpeakOptions = {}): Promise<void> {
    this.cancel();
    this.active = true;
    const text = rawText.replace(/\p{Emoji_Presentation}/gu, '').replace(/\s+/g, ' ').trim();
    if (!text) { options.onEnd?.(); return; }
    options.onStart?.();

    try {
      const key = text.slice(0, 150).toLowerCase();
      let buf   = cache.get(key);
      if (!buf) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const j = await res.json();
          if (j.audio) { buf = await b64ToAudioBuffer(j.audio); cache.set(key, buf); }
        }
      }
      if (buf && this.active) {
        const ctx = await ensureCtx();
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        this.curSrc = src;
        await new Promise<void>(resolve => {
          src.onended = () => { this.curSrc = null; resolve(); };
          src.start(0);
        });
        if (this.active) options.onEnd?.();
        this.active = false;
        return;
      }
    } catch (e) { console.warn('[voice] fallback:', (e as Error).message); }

    if (!this.synth || !this.active) { options.onEnd?.(); return; }
    if (!this.ptVoice) {
      await new Promise(r => setTimeout(r, 250));
      const vv = this.synth.getVoices();
      this.ptVoice = vv.find(v => v.lang.startsWith('pt')) || vv[0] || null;
    }
    const u = new SpeechSynthesisUtterance(text);
    if (this.ptVoice) u.voice = this.ptVoice;
    u.lang = 'pt-PT'; u.pitch = 1.28; u.rate = 0.88; u.volume = 1;
    u.onend   = () => { if (this.active) options.onEnd?.(); this.active = false; };
    u.onerror = () => { options.onEnd?.(); this.active = false; };
    this.synth.speak(u);
  }

  public cancel(): void {
    this.active = false;
    if (this.curSrc) { try { this.curSrc.stop(); } catch {} this.curSrc = null; }
    this.synth?.cancel();
  }
}

export const voiceService = new VoiceService();
