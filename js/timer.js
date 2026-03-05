// ============================================================
// Countdown Timer
// ============================================================

class GameTimer {
  constructor(duration) {
    this.duration = duration;
    this.remaining = duration;
    this.running = false;
    this.penaltyFlash = 0;
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  reset(duration) {
    this.duration = duration || this.duration;
    this.remaining = this.duration;
    this.running = false;
    this.penaltyFlash = 0;
  }

  update(dt) {
    if (!this.running) return;
    this.remaining -= dt;
    if (this.penaltyFlash > 0) this.penaltyFlash -= dt;
    if (this.remaining <= 0) {
      this.remaining = 0;
      this.running = false;
    }
  }

  addPenalty(seconds) {
    this.remaining -= seconds;
    this.penaltyFlash = 0.5;
    if (this.remaining < 0) this.remaining = 0;
  }

  isExpired() {
    return this.remaining <= 0;
  }

  getFormatted() {
    const s = Math.max(0, Math.ceil(this.remaining));
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  getProgress() {
    return this.remaining / this.duration;
  }

  isLow() {
    return this.remaining <= 15;
  }

  isCritical() {
    return this.remaining <= 7;
  }
}
