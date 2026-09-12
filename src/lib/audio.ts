// REST IN READ Sound Engine - Web Audio Synthesizer with zero missing-asset issues
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Off by default as required
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientRunning: boolean = false;
  private ambientRequested: boolean = false;
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
      if (this.ambientRequested) {
        this.startAmbientWind();
      }
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
    this.ambientRequested = true;
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
      filter.frequency.value = 220;
      this.ambientFilter = filter;

      // Layer in a low, eerie sub-drone (55 Hz harmonic)
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(55, ctx.currentTime);

      // Slow LFO for subtle pitch detune drift
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain);
      lfoGain.connect(drone.frequency);
      lfo.start();

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 3);
      drone.connect(droneGain);
      droneGain.connect(ctx.destination);
      drone.start();

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
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
    this.ambientRequested = false;
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

  // Harsh, loud, dissonant jumpscare sting with scream quality (<0.6s)
  playJumpscareSting() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;

    // --- Layer 1: Short high-amplitude noise burst (<0.25s) ---
    // Similar structure to playShovelDig's noise buffer, but louder gain & less filtering for harsh piercing bite
    const burstSize = Math.floor(ctx.sampleRate * 0.25);
    const burstBuf = ctx.createBuffer(1, burstSize, ctx.sampleRate);
    const burstData = burstBuf.getChannelData(0);
    for (let i = 0; i < burstSize; i++) {
      burstData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.045));
    }
    const burstSrc = ctx.createBufferSource();
    burstSrc.buffer = burstBuf;

    const burstFilter = ctx.createBiquadFilter();
    burstFilter.type = 'highpass';
    burstFilter.frequency.setValueAtTime(450, t);

    // Peaking presence for piercing grit
    const presenceFilter = ctx.createBiquadFilter();
    presenceFilter.type = 'peaking';
    presenceFilter.frequency.setValueAtTime(2600, t);
    presenceFilter.gain.setValueAtTime(9, t);
    presenceFilter.Q.setValueAtTime(1.8, t);

    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(0.0, t);
    burstGain.gain.linearRampToValueAtTime(1.0, t + 0.003); // loud immediate slam
    burstGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    burstSrc.connect(burstFilter);
    burstFilter.connect(presenceFilter);
    presenceFilter.connect(burstGain);
    burstGain.connect(ctx.destination);

    // --- Layer 2: Two dissonant scream oscillators (descending-then-jumping, <0.55s) ---
    const waveshaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 180) * x / (Math.PI + 180 * Math.abs(x));
    }
    waveshaper.curve = curve;

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0, t);
    oscGain.gain.linearRampToValueAtTime(0.85, t + 0.008);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    // Oscillator 1: Sawtooth starting high, sharply descending, then jumping up
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(1750, t);
    osc1.frequency.exponentialRampToValueAtTime(320, t + 0.22); // sharp descending
    osc1.frequency.exponentialRampToValueAtTime(1250, t + 0.40); // sharp screech jump
    osc1.frequency.exponentialRampToValueAtTime(450, t + 0.55);

    // Oscillator 2: Clashing dissonant interval for horrifying grating scream texture
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(1880, t); // dissonant clashing interval
    osc2.frequency.exponentialRampToValueAtTime(360, t + 0.22);
    osc2.frequency.exponentialRampToValueAtTime(1320, t + 0.40);
    osc2.frequency.exponentialRampToValueAtTime(490, t + 0.55);

    osc1.connect(waveshaper);
    osc2.connect(waveshaper);
    waveshaper.connect(oscGain);
    oscGain.connect(ctx.destination);

    // --- Layer 3: Chest-hitting low sub thud (95Hz -> 25Hz, 0.28s) ---
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, t);
    subOsc.frequency.exponentialRampToValueAtTime(25, t + 0.28);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.85, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    // Play all layers (<0.56s total duration)
    burstSrc.start(t);
    burstSrc.stop(t + 0.25);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.56);
    osc2.stop(t + 0.56);
    subOsc.start(t);
    subOsc.stop(t + 0.30);
  }
}

export const sound = new SoundEngine();
