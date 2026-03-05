// ============================================================
// Shared Audio Context — unlocked on first user gesture
// ============================================================

const SharedAudio = {
  ctx: null,
  get() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },
  unlock() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
};

// Unlock audio on any user gesture (critical for mobile)
['touchstart', 'touchend', 'click', 'keydown'].forEach(evt => {
  document.addEventListener(evt, () => SharedAudio.unlock(), { once: false });
});

// ============================================================
// Sound — Air Raid Siren (Web Audio API)
// ============================================================

class SirenSound {
  constructor() {
    this.ctx = null;
    this.playing = false;
    this.gainNode = null;
    this.oscillator1 = null;
    this.oscillator2 = null;
    this.lfo = null;
    this._animFrame = null;
    this._startTime = 0;
  }

  _ensureContext() {
    this.ctx = SharedAudio.get();
  }

  start() {
    if (this.playing) return;
    this._ensureContext();

    const ctx = this.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Main siren oscillator
    this.oscillator1 = ctx.createOscillator();
    this.oscillator1.type = 'sawtooth';
    this.oscillator1.frequency.value = 400;

    // Second oscillator for thickness
    this.oscillator2 = ctx.createOscillator();
    this.oscillator2.type = 'sine';
    this.oscillator2.frequency.value = 400;

    // Gain nodes
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0.08;

    const gain2 = ctx.createGain();
    gain2.gain.value = 0.05;

    // LFO for vibrato
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 8;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.oscillator1.frequency);
    lfoGain.connect(this.oscillator2.frequency);

    // Connect
    this.oscillator1.connect(this.gainNode);
    this.oscillator2.connect(gain2);
    gain2.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    // Start
    this.oscillator1.start();
    this.oscillator2.start();
    this.lfo.start();

    this.playing = true;
    this._startTime = ctx.currentTime;
    this._animate();
  }

  _animate() {
    if (!this.playing) return;

    const ctx = this.ctx;
    const elapsed = ctx.currentTime - this._startTime;

    // 6-second cycle: 3s rising, 3s falling
    const cyclePos = (elapsed % 6) / 6;
    let freq;
    if (cyclePos < 0.5) {
      // Rising
      freq = 300 + (cyclePos / 0.5) * 500;
    } else {
      // Falling
      freq = 800 - ((cyclePos - 0.5) / 0.5) * 500;
    }

    this.oscillator1.frequency.setValueAtTime(freq, ctx.currentTime);
    this.oscillator2.frequency.setValueAtTime(freq * 1.003, ctx.currentTime);

    this._animFrame = requestAnimationFrame(() => this._animate());
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;

    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }

    // Fade out
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    }

    setTimeout(() => {
      try {
        if (this.oscillator1) this.oscillator1.stop();
        if (this.oscillator2) this.oscillator2.stop();
        if (this.lfo) this.lfo.stop();
      } catch (e) { /* already stopped */ }
      this.oscillator1 = null;
      this.oscillator2 = null;
      this.lfo = null;
      this.gainNode = null;
    }, 400);
  }
}

// ============================================================
// Explosion Sound Effect (Web Audio API)
// ============================================================

class ExplosionSound {
  constructor() {
    this.ctx = null;
    this._lastPlayed = 0;
  }

  _ensureContext() {
    this.ctx = SharedAudio.get();
  }

  play() {
    // Throttle: max 1 explosion sound per 0.5s
    const now = Date.now();
    if (now - this._lastPlayed < 500) return;
    this._lastPlayed = now;

    try {
      this._ensureContext();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;

      // Low rumble
      const rumble = ctx.createOscillator();
      rumble.type = 'sawtooth';
      rumble.frequency.setValueAtTime(80, t);
      rumble.frequency.exponentialRampToValueAtTime(30, t + 0.4);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.12, t);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      // Noise burst (white noise via buffer)
      const bufferSize = ctx.sampleRate * 0.3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      // Low-pass filter on noise
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);

      // Connect
      rumble.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // Play
      rumble.start(t);
      rumble.stop(t + 0.6);
      noise.start(t);
      noise.stop(t + 0.35);
    } catch (e) { /* audio not available */ }
  }
}

// ============================================================
// Footstep Sound (Web Audio API)
// ============================================================

class FootstepSound {
  constructor() {
    this.ctx = null;
    this._stepTimer = 0;
  }

  _ensureContext() {
    this.ctx = SharedAudio.get();
  }

  update(speed, isMoving, isGrounded, dt) {
    if (!isMoving || !isGrounded || speed < 0.5) {
      this._stepTimer = 0;
      return;
    }

    this._stepTimer += dt;

    // Step interval: faster = more frequent (0.4s at slow, 0.1s at max)
    const ratio = Math.min((speed - 0.5) / (PLAYER_MAX_SPEED - 0.5), 1);
    const stepInterval = 0.4 - ratio * 0.3;

    if (this._stepTimer >= stepInterval) {
      this._stepTimer = 0;
      this._playStep(speed);
    }
  }

  _playStep(speed) {
    try {
      this._ensureContext();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;

      // Short noise burst filtered to sound like footstep on concrete
      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.exp(-i / (bufferSize * 0.15));
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 300 + speed * 40;
      filter.Q.value = 1.5;

      const gain = ctx.createGain();
      gain.gain.value = 0.04 + (speed / PLAYER_MAX_SPEED) * 0.03;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(t);
      source.stop(t + 0.04);
    } catch (e) { /* audio unavailable */ }
  }

  reset() {
    this._stepTimer = 0;
  }
}

// ============================================================
// Stumble/Trip Sound (Web Audio API)
// ============================================================

class StumbleSound {
  constructor() {
    this.ctx = null;
  }

  _ensureContext() {
    this.ctx = SharedAudio.get();
  }

  play() {
    try {
      this._ensureContext();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;

      // Heavy low thud
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.15, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      // Impact noise burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.exp(-i / (bufferSize * 0.1));
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.15);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      // Body scrape
      const scrape = ctx.createOscillator();
      scrape.type = 'sawtooth';
      scrape.frequency.setValueAtTime(200, t + 0.05);
      scrape.frequency.exponentialRampToValueAtTime(80, t + 0.25);

      const scrapeGain = ctx.createGain();
      scrapeGain.gain.setValueAtTime(0.03, t + 0.05);
      scrapeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      // Connect
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      scrape.connect(scrapeGain);
      scrapeGain.connect(ctx.destination);

      // Play
      osc.start(t);
      osc.stop(t + 0.3);
      noise.start(t);
      noise.stop(t + 0.08);
      scrape.start(t + 0.05);
      scrape.stop(t + 0.25);
    } catch (e) { /* audio unavailable */ }
  }
}

// ============================================================
// Door Opening Sound (Web Audio API)
// ============================================================

class DoorSound {
  constructor() {
    this.ctx = null;
  }

  _ensureContext() {
    this.ctx = SharedAudio.get();
  }

  play() {
    try {
      this._ensureContext();
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;

      // Metal creak (frequency sweep)
      const creak = ctx.createOscillator();
      creak.type = 'sawtooth';
      creak.frequency.setValueAtTime(80, t);
      creak.frequency.linearRampToValueAtTime(180, t + 0.3);
      creak.frequency.linearRampToValueAtTime(120, t + 0.5);

      const creakGain = ctx.createGain();
      creakGain.gain.setValueAtTime(0, t);
      creakGain.gain.linearRampToValueAtTime(0.06, t + 0.05);
      creakGain.gain.linearRampToValueAtTime(0.04, t + 0.3);
      creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      const resonance = ctx.createBiquadFilter();
      resonance.type = 'bandpass';
      resonance.frequency.value = 300;
      resonance.Q.value = 8;

      // Metal clang on close
      const clang = ctx.createOscillator();
      clang.type = 'square';
      clang.frequency.setValueAtTime(220, t + 0.5);
      clang.frequency.exponentialRampToValueAtTime(110, t + 0.7);

      const clangGain = ctx.createGain();
      clangGain.gain.setValueAtTime(0, t);
      clangGain.gain.setValueAtTime(0.08, t + 0.5);
      clangGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      // Reverb tail
      const reverbSize = Math.floor(ctx.sampleRate * 0.3);
      const reverbBuf = ctx.createBuffer(1, reverbSize, ctx.sampleRate);
      const reverbData = reverbBuf.getChannelData(0);
      for (let i = 0; i < reverbSize; i++) {
        reverbData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (reverbSize * 0.2));
      }
      const reverb = ctx.createBufferSource();
      reverb.buffer = reverbBuf;

      const reverbFilter = ctx.createBiquadFilter();
      reverbFilter.type = 'lowpass';
      reverbFilter.frequency.value = 500;

      const reverbGain = ctx.createGain();
      reverbGain.gain.setValueAtTime(0, t);
      reverbGain.gain.setValueAtTime(0.06, t + 0.5);
      reverbGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      // Connect
      creak.connect(resonance);
      resonance.connect(creakGain);
      creakGain.connect(ctx.destination);
      clang.connect(clangGain);
      clangGain.connect(ctx.destination);
      reverb.connect(reverbFilter);
      reverbFilter.connect(reverbGain);
      reverbGain.connect(ctx.destination);

      // Play
      creak.start(t);
      creak.stop(t + 0.6);
      clang.start(t + 0.5);
      clang.stop(t + 0.8);
      reverb.start(t + 0.5);
      reverb.stop(t + 0.9);
    } catch (e) { /* audio unavailable */ }
  }
}
