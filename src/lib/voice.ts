/**
 * Voice Service for AlfaZoo
 * Focused on natural, neural-like expressive speech for children.
 */

import { GoogleGenAI, Modality } from "@google/genai";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  useGemini?: boolean;
}

class VoiceService {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private voice: SpeechSynthesisVoice | null = null;
  private isReady: boolean = false;
  private currentTimeout: any = null;
  private isProcessing: boolean = false;
  private ai: any = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
      this.warmUp();
    }
    
    // Initialize Gemini AI for high-quality TTS
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      }
    } catch (e) {
      console.error("Failed to initialize Gemini AI:", e);
    }
  }

  private warmUp() {
    if (!this.synth) return;
    const utterance = new SpeechSynthesisUtterance('\u200B');
    utterance.volume = 0;
    utterance.rate = 10;
    this.synth.speak(utterance);
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const priority = [
      (v: SpeechSynthesisVoice) => v.lang === 'pt-PT' && /natural|neural|premium|google|microsoft|apple/i.test(v.name) && /female|woman|joana|catarina|francisca/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang === 'pt-PT' && /female|woman|joana|catarina|francisca/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang === 'pt-PT' && /natural|neural|premium|google|microsoft|apple/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang === 'pt-PT',
      (v: SpeechSynthesisVoice) => v.lang.startsWith('pt') && /female|woman/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('pt'),
    ];

    for (const test of priority) {
      const found = voices.find(test);
      if (found) {
        this.voice = found;
        break;
      }
    }

    if (!this.voice && voices.length > 0) {
      this.voice = voices[0];
    }
    this.isReady = true;
  }

  private cleanText(text: string): string {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F093}\u{1F004}\u{1F400}-\u{1F4FF}\u{1F500}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F300}-\u{1F5FF}]/gu, '');
  }

  private naturalizeText(text: string): string {
    if (text.includes('...') || text.includes('!!!') || text.includes('... ')) {
      return text;
    }

    let natural = text;
    const interjections = ["Uau!", "Ei!", "Olha só!", "Incrível!", "Espetacular!", "Fixe!", "Boa!"];
    const randomInterjection = interjections[Math.floor(Math.random() * interjections.length)];

    natural = natural.replace(/^([A-Z]) de /i, (match, letter) => {
      return `${randomInterjection} ${letter}${letter.toLowerCase()}${letter.toLowerCase()}... ${match}`;
    });

    natural = natural.replace(/Muito bem\./g, 'Muito bem! Estás a ir lindamente!');
    natural = natural.replace(/Incrível\./g, 'Incrííível! Acertaste mesmo! Uau!');
    natural = natural.replace(/Quase\./g, 'Oooopa... quase! Mas não desistas!');
    natural = natural.replace(/quase lá/gi, 'quase, quase lá! Estás quase a conseguir!');
    natural = natural.replace(/Tenta outra vez\./g, 'Vamos tentar outra vez? Eu sei que consegues!');
    natural = natural.replace(/Olá!/g, 'Olá! Ei, que bom ver-te por aqui!');
    natural = natural.replace(/Boa tentativa!/g, 'Boa tentativa! Estás a aprender muito bem!');

    return natural;
  }

  private currentAudioSource: AudioBufferSourceNode | null = null;

  private async playAudio(base64Data: string) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
    
    if (!this.isProcessing) return; // Check if cancelled during decode

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    this.currentAudioSource = source;
    source.start(0);
    
    return new Promise<void>((resolve) => {
      source.onended = () => {
        if (this.currentAudioSource === source) {
          this.currentAudioSource = null;
        }
        resolve();
      };
    });
  }

  public async speak(text: string, options: SpeakOptions = {}) {
    // Hard stop any current processing
    this.cancel();

    const cleanedText = this.cleanText(text);
    const naturalText = this.naturalizeText(cleanedText);

    // Try Gemini TTS for premium quality if enabled and available
    // We use it for longer sentences to avoid latency on single letters
    const isLongSentence = naturalText.split(' ').length > 2;
    if (this.ai && (options.useGemini !== false) && isLongSentence) {
      try {
        this.isProcessing = true;
        if (options.onStart) options.onStart();

        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `Diz isto com entusiasmo, como uma apresentadora de televisão infantil animada e carinhosa: ${naturalText}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is usually a good clear female voice
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio && this.isProcessing) {
          await this.playAudio(base64Audio);
          if (options.onEnd) options.onEnd();
          this.isProcessing = false;
          return;
        }
      } catch (e) {
        console.error("Gemini TTS failed, falling back to local:", e);
      }
    }

    // Fallback to local SpeechSynthesis
    if (!this.synth) return;

    if (!this.voice) {
      this.loadVoices();
      if (!this.voice) {
        this.currentTimeout = setTimeout(() => this.speak(text, options), 100);
        return;
      }
    }

    const chunks = naturalText.split(/(?<=[.!?])\s+/);
    this.currentTimeout = setTimeout(() => {
      this.isProcessing = true;
      this.processChunks(chunks, 0, options);
    }, 50);
  }

  private processChunks(chunks: string[], index: number, options: SpeakOptions) {
    if (!this.isProcessing) return;

    if (index >= chunks.length) {
      this.isProcessing = false;
      if (options.onEnd) options.onEnd();
      return;
    }

    const chunk = chunks[index];
    if (!chunk.trim()) {
      this.processChunks(chunks, index + 1, options);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    if (this.voice) {
      utterance.voice = this.voice;
      utterance.lang = this.voice.lang;
    } else {
      utterance.lang = 'pt-PT';
    }

    utterance.rate = options.rate || 1.05 + (Math.random() * 0.06 - 0.03); // Slightly faster for fluidity
    utterance.pitch = options.pitch || 1.35 + (Math.random() * 0.1 - 0.05);
    utterance.volume = options.volume || 1;

    utterance.onstart = () => {
      if (index === 0 && options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (!this.isProcessing) return;
      const pauseTime = chunk.endsWith('...') ? 400 : 100; // Reduced pause for fluidity
      this.currentTimeout = setTimeout(() => this.processChunks(chunks, index + 1, options), pauseTime);
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesis Error:', event);
      this.isProcessing = false;
      if (options.onEnd) options.onEnd();
    };

    this.synth!.speak(utterance);
  }

  public cancel() {
    this.isProcessing = false;
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
      } catch (e) {}
      this.currentAudioSource = null;
    }
  }
}

export const voiceService = new VoiceService();
