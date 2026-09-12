// REST IN READ Sound Engine - Web Audio Synthesizer with zero missing-asset issues
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Off by default as required
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientRunning: boolean = false;
  private listeners: Array<(muted: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rest_in_read_muted');
      // Default to muted (true) unless explicitly unmuted
      this.isMuted = saved !== null ? saved === 'true' : true;
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rest_in_read_muted', String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopAmbientWind();
    } else {
      this.initCtx();
      this.startAmbientWind();
    }
    this.notify();
    return this.isMuted;
  }

  public subscribe(cb: (muted: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.isMuted));
  }

  // Shovel Dig: crunchy scraping burst through dry cemetery soil
  public playShovelDig() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    
    // Dirt scrape noise
    const bufferSize = ctx.sampleRate * 0.45;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + 0.4);
    filter.Q.setValueAtTime(3.0, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    // Shovel blade clank/grit
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.35);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.2, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(t);
    osc.start(t);
    noise.stop(t + 0.5);
    osc.stop(t + 0.5);
  }

  // Red Stamp: Heavy bureaucratic thud of the DECLARATION OF CLOSURE
  public playStamp() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.28);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    // Stamp slap high frequency transient
    const slapSize = ctx.sampleRate * 0.08;
    const slapBuf = ctx.createBuffer(1, slapSize, ctx.sampleRate);
    const slapData = slapBuf.getChannelData(0);
    for (let i = 0; i < slapSize; i++) {
      slapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    }
    const slap = ctx.createBufferSource();
    slap.buffer = slapBuf;
    const slapFilter = ctx.createBiquadFilter();
    slapFilter.type = 'highpass';
    slapFilter.frequency.value = 1200;

    const slapGain = ctx.createGain();
    slapGain.gain.setValueAtTime(0.3, t);
    slapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    slap.connect(slapFilter);
    slapFilter.connect(slapGain);
    slapGain.connect(ctx.destination);

    osc.start(t);
    slap.start(t);
    osc.stop(t + 0.35);
    slap.stop(t + 0.1);
  }

  // Pour One Out: liquid slosh and splash
  public playPourSplash() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (0.8 + 0.2 * Math.sin(i / 80));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 0.25);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.55);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.6);
  }

  // Planchette Scrape: wooden friction drag on polished Ouija board
  public playPlanchetteScrape() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / 12);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, t);
    filter.frequency.linearRampToValueAtTime(950, t + 0.12);
    filter.frequency.linearRampToValueAtTime(600, t + 0.24);
    filter.Q.value = 4.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.26);
  }

  // Cemetery Toll / Chime
  public playGraveToll() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    [130.81, 261.63, 392.00, 523.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      const initialVol = 0.2 / (idx + 1);
      gain.gain.setValueAtTime(initialVol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 2.3);
    });
  }

  // Soft Ambient Graveyard Wind Loop (mutable)
  public startAmbientWind() {
    if (this.isMuted || this.ambientRunning) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Simple pink noise approximation
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 280;
      this.ambientFilter = filter;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 3);
      this.ambientGain = gain;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.ambientRunning = true;
    } catch {
      // AudioContext might be in background
    }
  }

  public stopAmbientWind() {
    if (!this.ambientRunning || !this.ambientGain || !this.ctx) return;
    try {
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        this.ambientRunning = false;
        this.ambientGain = null;
        this.ambientFilter = null;
      }, 800);
    } catch {
      this.ambientRunning = false;
    }
  }

  // Jumpscare Sting: sharp broadband noise burst + fast pitch-drop oscillator
  // Visual overlay always fires; this method is only called when not muted.
  // Eerie digital glitch stutter
  public playEerieGlitch() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300 + Math.random() * 900, t + i * 0.04);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.04);
    }
  }

  // Muffled bass heartbeat
  public playHeartbeat() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.18].forEach(offset => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, t + offset);
      osc.frequency.exponentialRampToValueAtTime(35, t + offset + 0.12);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.16);
    });
  }

  playJumpscareSting() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;

    // --- Layer 1: sharp broadband noise burst (the "hit") ---
    const burstSize = Math.floor(ctx.sampleRate * 0.18);
    const burstBuf = ctx.createBuffer(1, burstSize, ctx.sampleRate);
    const burstData = burstBuf.getChannelData(0);
    for (let i = 0; i < burstSize; i++) {
      // Instant attack, fast exponential decay
      burstData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
    }
    const burstSrc = ctx.createBufferSource();
    burstSrc.buffer = burstBuf;

    const burstFilter = ctx.createBiquadFilter();
    burstFilter.type = 'highpass';
    burstFilter.frequency.setValueAtTime(800, t);

    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(0.0, t);
    burstGain.gain.linearRampToValueAtTime(0.9, t + 0.005); // near-instant slam
    burstGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    burstSrc.connect(burstFilter);
    burstFilter.connect(burstGain);
    burstGain.connect(ctx.destination);

    // --- Layer 2: pitch-drop oscillator (the "scream drop") ---
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);           // start high and screechy
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.55); // drop fast

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0, t);
    oscGain.gain.linearRampToValueAtTime(0.55, t + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    // Slight distortion via waveshaper for extra harshness
    const waveshaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
    }
    waveshaper.curve = curve;

    osc.connect(waveshaper);
    waveshaper.connect(oscGain);
    oscGain.connect(ctx.destination);

    // --- Layer 3: low sub-thud for physical impact feel ---
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.exponentialRampToValueAtTime(25, t + 0.3);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.7, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    // Fire everything
    burstSrc.start(t);
    burstSrc.stop(t + 0.2);
    osc.start(t);
    osc.stop(t + 0.6);
    subOsc.start(t);
    subOsc.stop(t + 0.35);
  }
}

export const sound = new SoundEngine();
