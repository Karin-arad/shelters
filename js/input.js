// ============================================================
// Input Manager — Keyboard State Tracking
// ============================================================

class InputManager {
  constructor() {
    this.keys = {};
    this.justPressedKeys = {};
    this._justPressedBuffer = {};

    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter', 'Escape'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys[e.code]) {
        this._justPressedBuffer[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  isDown(code) {
    return !!this.keys[code];
  }

  isJustPressed(code) {
    return !!this.justPressedKeys[code];
  }

  // Touch input simulation
  simulateDown(code) {
    if (!this.keys[code]) {
      this._justPressedBuffer[code] = true;
    }
    this.keys[code] = true;
  }

  simulateUp(code) {
    this.keys[code] = false;
  }

  update() {
    this.justPressedKeys = this._justPressedBuffer;
    this._justPressedBuffer = {};
  }
}
