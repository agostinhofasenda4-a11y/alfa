/**
 * Voice Service for AlfaZoo — Versão Final Corrigida
 *
 * Correções aplicadas:
 *  1. Vite usa import.meta.env (não process.env)
 *  2. Variável deve chamar-se VITE_GEMINI_API_KEY na Vercel
 *  3. Modelo correto para TTS: gemini-2.5-flash-preview-tts
 *  4. Gemini devolve PCM16 raw — NÃO usar decodeAudioData diretamente
 *     É necessário converter PCM16 → Float32 manualmente
 */

import { GoogleGenAI, Modality } from "@google/genai";

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

class VoiceService {
  private synth: SpeechSynthesis | null =
    typeof window !== "undefined" ? window.speechSynthesis : null;
  private voice: SpeechSynthesisVoice | null = null;
  private ai: GoogleGenAI | null = null;
  private audioCtx: AudioContext | null = null;
  private cache = new Map<string, AudioBuffer>();
  private currentSource: AudioBufferSourceNode | null = null;
  private quotaExceeded = false;

  constructor() {
    // ── 1. Inicializar Gemini ──────────────────────────────
    // No Vite, variáveis de ambiente têm de começar com VITE_
    // Na Vercel: adiciona VITE_GEMINI_API_KEY (não GEMINI_API_KEY)
    const apiKey =
      (import.meta as any).env?.VITE_GEMINI_API_KEY ??
      (import.meta as any).env?.GEMINI_API_KEY ??
      "";

    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
        console.log("✅ Gemini TTS pronto! Voz humana activada.");
      } catch (e) {
        console.error("Erro ao iniciar Gemini:", e);
      }
    } else {
      console.warn(
        "⚠️ VITE_GEMINI_API_KEY não encontrada.\n" +
        "Na Vercel: Settings → Environment Variables → adiciona VITE_GEMINI_API_KEY"
      );
    }

    // ── 2. Carregar vozes do sistema (fallback) ────────────
    if (this.synth) {
      this.pickVoice();
      this.synth.onvoiceschanged = () => this.pickVoice();
    }
  }

  // ── Escolher a melhor voz portuguesa disponível ──────────
  private pickVoice() {
    const voices = this.synth?.getVoices() ?? [];
    const priority = [
      (v: SpeechSynthesisVoice) => /joana/i.test(v.name),
      (v: SpeechSynthesisVoice) =>
        /natural|neural/i.test(v.name) && v.lang.startsWith("pt"),
      (v: SpeechSynthesisVoice) => v.lang === "pt-PT",
      (v: SpeechSynthesisVoice) => v.lang.startsWith("pt"),
    ];
    for (const test of priority) {
      const found = voices.find(test);
      if (found) { this.voice = found; return; }
    }
    if (voices.length) this.voice = voices[0];
  }

  // ── Obter / criar AudioContext ────────────────────────────
  private getAC(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (
        window.AudioContext ?? (window as any).webkitAudioContext
      )();
    }
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();
    return this.audioCtx;
  }

  // ── Converter PCM16 base64 → AudioBuffer ─────────────────
  // CRÍTICO: Gemini devolve PCM16 raw a 24 kHz, 1 canal.
  // decodeAudioData() NÃO funciona com isso — precisamos converter manualmente.
  private async pcm16ToBuffer(base64: string): Promise<AudioBuffer> {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Interpretar como amostras PCM de 16 bits com sinal
    const pcm16 = new Int16Array(bytes.buffer);

    // Converter para Float32 (intervalo -1 a 1)
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }

    // Criar AudioBuffer a 24000 Hz (taxa do Gemini TTS)
    const ac = this.getAC();
    const buffer = ac.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    return buffer;
  }

  // ── Reproduzir AudioBuffer ────────────────────────────────
  private playBuffer(buffer: AudioBuffer): Promise<void> {
    const ac = this.getAC();
    const source = ac.createBufferSource();
    source.buffer = buffer;
    source.connect(ac.destination);
    this.currentSource = source;
    source.start(0);
    return new Promise((resolve) => {
      source.onended = () => {
        if (this.currentSource === source) this.currentSource = null;
        resolve();
      };
    });
  }

  // ── Falar com Gemini TTS ──────────────────────────────────
  private async speakGemini(text: string): Promise<boolean> {
    if (!this.ai || this.quotaExceeded) return false;

    // Cache: não pede ao Gemini duas vezes a mesma frase
    if (this.cache.has(text)) {
      await this.playBuffer(this.cache.get(text)!);
      return true;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts", // único modelo com TTS
        contents: [{
          parts: [{
            text: `Fala isto como uma professora de jardim de infância muito animada, 
                   carinhosa e alegre, com pausas naturais entre frases: ${text}`
          }]
        }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" }, // Kore = voz feminina calorosa
            },
          },
        },
      });

      const base64 =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64) return false;

      const buffer = await this.pcm16ToBuffer(base64);
      this.cache.set(text, buffer); // guardar em cache
      await this.playBuffer(buffer);
      return true;

    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        this.quotaExceeded = true;
        console.warn("Quota Gemini atingida — a usar voz do sistema.");
      } else {
        console.warn("Gemini TTS falhou:", msg);
      }
      return false;
    }
  }

  // ── Fallback: voz do sistema com chunking natural ─────────
  private speakSystem(text: string, opts: SpeakOptions = {}) {
    if (!this.synth) return;
    this.synth.cancel();

    // Dividir em frases para pausas naturais (180 ms entre frases)
    const chunks = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    let i = 0;

    const sayNext = () => {
      if (i >= chunks.length) { opts.onEnd?.(); return; }
      const u = new SpeechSynthesisUtterance(chunks[i]);
      if (this.voice) u.voice = this.voice;
      u.lang   = this.voice?.lang ?? "pt-PT";
      u.rate   = 0.78;  // ritmo calmo e claro
      u.pitch  = 1.22;  // tom ligeiramente mais agudo (infantil)
      u.volume = 1;
      if (i === 0) u.onstart = () => opts.onStart?.();
      u.onend = () => { i++; setTimeout(sayNext, 180); };
      u.onerror = () => { opts.onEnd?.(); };
      this.synth!.speak(u);
    };

    sayNext();
  }

  // ── API pública: speak() ──────────────────────────────────
  public async speak(text: string, opts: SpeakOptions = {}) {
    this.cancel();
    opts.onStart?.();

    const ok = await this.speakGemini(text);
    if (ok) {
      opts.onEnd?.();
    } else {
      this.speakSystem(text, opts);
    }
  }

  // ── Parar tudo ────────────────────────────────────────────
  public cancel() {
    this.synth?.cancel();
    try { this.currentSource?.stop(); } catch (_) {}
    this.currentSource = null;
  }
}

export const voiceService = new VoiceService();
