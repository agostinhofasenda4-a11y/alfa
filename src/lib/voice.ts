/**
 * Voice Service para AlfaZoo
 * Chama o backend /api/tts para obter voz Gemini real e humana.
 * Fallback para voz do sistema se o servidor falhar.
 */

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

// Cache em memória para não repetir chamadas ao servidor
const audioCache = new Map<string, string>();

class VoiceService {
  private synth: SpeechSynthesis | null =
    typeof window !== 'undefined' ? window.speechSynthesis : null;
  private voice: SpeechSynthesisVoice | null = null;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;

  constructor() {
    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.voice =
      voices.find((v) => v.lang === 'pt-PT' && /natural|neural/i.test(v.name)) ||
      voices.find((v) => v.lang === 'pt-PT') ||
      voices.find((v) => v.lang.startsWith('pt')) ||
      voices[0] ||
      null;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private pcm16ToFloat32(buffer: ArrayBuffer): Float32Array {
    const int16 = new Int16Array(buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    return float32;
  }

  private async playBase64Audio(base64: string): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    let audioBuffer: AudioBuffer;

    try {
      // Tenta como ficheiro de áudio normal (wav/mp3/ogg)
      audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
    } catch {
      // Fallback: interpreta como PCM16 raw (24000 Hz mono)
      const sampleRate = 24000;
      const float32 = this.pcm16ToFloat32(bytes.buffer);
      audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
      audioBuffer.copyToChannel(float32, 0);
    }

    return new Promise<void>((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      this.currentSource = source;
      source.onended = () => {
        this.currentSource = null;
        this.isPlaying = false;
        resolve();
      };
      source.start(0);
    });
  }

  public async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    this.cancel();
    this.isPlaying = true;
    options.onStart?.();

    // 1. Tenta voz Gemini via backend
    try {
      const cacheKey = text.trim().toLowerCase();
      let base64Audio = audioCache.get(cacheKey);

      if (!base64Audio) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (res.ok) {
          const data = await res.json();
          base64Audio = data.audio;
          if (base64Audio) audioCache.set(cacheKey, base64Audio);
        } else {
          console.warn('Backend TTS falhou:', res.status);
        }
      }

      if (base64Audio && this.isPlaying) {
        await this.playBase64Audio(base64Audio);
        options.onEnd?.();
        return;
      }
    } catch (err) {
      console.warn('Erro a chamar /api/tts, usando fallback:', err);
    }

    // 2. Fallback: voz do sistema
    if (!this.synth || !this.isPlaying) {
      options.onEnd?.();
      return;
    }

    if (!this.voice) this.loadVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.lang = 'pt-PT';
    utterance.pitch = 1.3;
    utterance.rate = 0.88;
    utterance.volume = 1;
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = () => options.onEnd?.();
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public cancel() {
    this.isPlaying = false;
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch {}
      this.currentSource = null;
    }
    if (this.synth) this.synth.cancel();
    this.currentUtterance = null;
  }
}

export const voiceService = new VoiceService();
