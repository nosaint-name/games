import { CharacterMood } from './storyData';

type MusicSection = 'title' | 'playing' | 'paused' | 'gameover';

const COOL_PROGRESSIONS: number[][] = [
  [146.83, 220.0, 261.63, 329.63], // Dm9 (D3 A3 C4 E4)
  [116.54, 174.61, 220.0, 293.66], // Bbmaj7 (Bb2 F3 A3 D4)
  [196.0, 233.08, 293.66, 349.23], // Gm7 (G3 Bb3 D4 F4)
  [110.0, 164.81, 220.0, 261.63], // Am7 (A2 E3 A3 C4)
];

const WARM_PROGRESSIONS: number[][] = [
  [174.61, 220.0, 261.63, 329.63], // Fmaj7 (F3 A3 C4 E4)
  [130.81, 196.0, 246.94, 293.66], // Cmaj9 (C3 G3 B3 D4)
  [146.83, 220.0, 261.63, 349.23], // Dm7 (D3 A3 C4 F4)
  [130.81, 164.81, 220.0, 293.66], // Am9/C (C3 E3 A3 D4)
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicBus: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private muted = false;
  private lastTickAt = 0;

  private musicTimer: number | null = null;
  private musicRunning = false;
  private stepIndex = 0;
  private currentMood: CharacterMood = 'neutral';
  private currentSection: MusicSection = 'title';

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (!this.muted && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private ensureMusicBus(ctx: AudioContext): GainNode {
    if (this.musicBus) return this.musicBus;

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0, ctx.currentTime);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(780, ctx.currentTime);
    lowpass.Q.setValueAtTime(0.7, ctx.currentTime);

    const delay = ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.38, ctx.currentTime);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.28, ctx.currentTime);
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(640, ctx.currentTime);

    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delayFilter.connect(ctx.destination);

    bus.connect(lowpass);
    lowpass.connect(ctx.destination);
    lowpass.connect(delay);

    this.musicBus = bus;
    this.delayNode = delay;
    return bus;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (muted) {
      if (this.musicBus) {
        this.musicBus.gain.cancelScheduledValues(now);
        this.musicBus.gain.setTargetAtTime(0.0001, now, 0.08);
      }
      if (this.ctx.state === 'running') {
        void this.ctx.suspend();
      }
    } else {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      if (this.musicBus && this.currentSection !== 'paused') {
        this.musicBus.gain.cancelScheduledValues(now);
        this.musicBus.gain.setTargetAtTime(0.65, now, 0.4);
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public startMusic(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const bus = this.ensureMusicBus(ctx);
    const now = ctx.currentTime;
    const targetGain = this.currentSection === 'paused' ? 0.0001 : 0.65;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setTargetAtTime(targetGain, now, 0.6);

    if (this.musicRunning) return;
    this.musicRunning = true;

    // Trigger opening bar immediately and advance every 4.2s
    this.scheduleMusicBar();
    this.musicTimer = window.setInterval(() => {
      this.scheduleMusicBar();
    }, 4200);
  }

  public stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.musicRunning = false;
    if (this.ctx && this.musicBus) {
      const now = this.ctx.currentTime;
      this.musicBus.gain.cancelScheduledValues(now);
      this.musicBus.gain.setTargetAtTime(0.0001, now, 0.15);
    }
  }

  public updateMusicState(mood: CharacterMood, section: MusicSection): void {
    this.currentMood = mood;
    this.currentSection = section;
    if (!this.ctx || !this.musicBus || this.muted) return;

    const now = this.ctx.currentTime;
    const targetGain =
      section === 'paused' ? 0.0001 : section === 'gameover' ? 0.45 : 0.65;
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setTargetAtTime(targetGain, now, 0.25);
  }

  private scheduleMusicBar(): void {
    if (
      this.muted ||
      !this.ctx ||
      !this.musicBus ||
      this.currentSection === 'paused' ||
      this.ctx.state !== 'running'
    ) {
      return;
    }

    const ctx = this.ctx;
    const bus = this.musicBus;
    const now = ctx.currentTime;
    const chords =
      this.currentMood === 'warm' ? WARM_PROGRESSIONS : COOL_PROGRESSIONS;
    const chord = chords[this.stepIndex % chords.length];
    this.stepIndex += 1;

    // Soft nocturnal pad chord (3.9s sustain)
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(idx % 2 === 0 ? -4 : 4, now);

      const peak = idx === 0 ? 0.042 : 0.024;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 1.1);
      gain.gain.setValueAtTime(peak * 0.85, now + 2.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.1);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 4.2);
    });

    // Delicate distant harp/celesta arpeggio droplets across the bar
    const arpPattern = [chord[1] * 2, chord[2] * 2, chord[3] * 2, chord[2] * 2];
    arpPattern.forEach((freq, idx) => {
      const t = now + 0.45 + idx * 0.9;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.018, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);

      osc.connect(gain);
      gain.connect(bus);
      if (this.delayNode) {
        gain.connect(this.delayNode);
      }
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  public playTypeTick(): void {
    if (this.muted) return;
    const nowMs = performance.now();
    if (nowMs - this.lastTickAt < 48) return;
    this.lastTickAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const jitter = 0.94 + Math.random() * 0.12;
    osc.frequency.setValueAtTime(520 * jitter, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.011, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playStudioBumper(): void {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    this.triggerBell(this.ctx, 293.66, now + 0.15, 0.04, 0.7);
    this.triggerBell(this.ctx, 440.0, now + 0.35, 0.045, 0.85);
    this.triggerBell(this.ctx, 587.33, now + 0.55, 0.05, 1.1);
  }

  public playStartChime(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const notes = [293.66, 369.99, 440.0, 587.33]; // D4 F#4 A4 D5
    notes.forEach((freq, i) => {
      this.triggerBell(ctx, freq, ctx.currentTime + i * 0.075, 0.045, 0.45);
    });
  }

  public playIntroBeat(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.triggerBell(ctx, 440.0, ctx.currentTime, 0.035, 0.55);
  }

  public playChoiceFeedback(pointsDelta: number): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (pointsDelta > 0) {
      this.triggerBell(ctx, 392.0, now, 0.05, 0.38);
      this.triggerBell(ctx, 493.88, now + 0.06, 0.045, 0.42);
      this.triggerBell(ctx, 587.33, now + 0.12, 0.04, 0.48);
    } else if (pointsDelta < 0) {
      this.triggerBell(ctx, 329.63, now, 0.045, 0.3);
      this.triggerBell(ctx, 261.63, now + 0.08, 0.04, 0.36);
    } else {
      this.triggerBell(ctx, 440.0, now, 0.04, 0.25);
    }
  }

  public playEndingCadence(positive: boolean): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = positive
      ? [329.63, 415.3, 493.88, 659.25]
      : [293.66, 349.23, 392.0, 293.66];
    notes.forEach((freq, i) => {
      this.triggerBell(ctx, freq, now + i * 0.11, 0.05, 0.65);
    });
  }

  private triggerBell(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    peakGain: number,
    duration: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }
}

export const soundEngine = new SoundEngine();
