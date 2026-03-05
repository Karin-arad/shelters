// ============================================================
// Touch Controls — Virtual Buttons for Mobile
// ============================================================

class TouchControls {
  constructor(canvas, input) {
    this.canvas = canvas;
    this.input = input;
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    this.activeTouches = {};

    // Button definitions (canvas coordinates)
    this.buttons = {
      left:  { x: 20,  y: CANVAS_HEIGHT - 90, w: 70, h: 70, code: 'ArrowLeft',  label: '←', pressed: false },
      right: { x: 100, y: CANVAS_HEIGHT - 90, w: 70, h: 70, code: 'ArrowRight', label: '→', pressed: false },
      jump:  { x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT - 90, w: 80, h: 80, code: 'Space', label: '⬆', pressed: false, round: true },
      enter: { x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT - 155, w: 80, h: 50, code: 'Enter', label: '↵', pressed: false },
    };

    if (this.isTouchDevice) {
      canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
      canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
      canvas.addEventListener('touchend', (e) => this._onTouchEnd(e), { passive: false });
      canvas.addEventListener('touchcancel', (e) => this._onTouchEnd(e), { passive: false });
    }
  }

  _canvasPos(touch) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
      y: (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height),
    };
  }

  _hitTest(pos) {
    for (const [name, btn] of Object.entries(this.buttons)) {
      if (pos.x >= btn.x && pos.x <= btn.x + btn.w &&
          pos.y >= btn.y && pos.y <= btn.y + btn.h) {
        return name;
      }
    }
    return null;
  }

  _onTouchStart(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const pos = this._canvasPos(touch);
      const btnName = this._hitTest(pos);
      if (btnName) {
        this.activeTouches[touch.identifier] = btnName;
        const btn = this.buttons[btnName];
        if (!btn.pressed) {
          btn.pressed = true;
          this.input.simulateDown(btn.code);
        }
      } else {
        // Tap outside buttons = general tap (for menus)
        this.activeTouches[touch.identifier] = '__tap__';
      }
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const pos = this._canvasPos(touch);
      const prevBtn = this.activeTouches[touch.identifier];
      const currBtn = this._hitTest(pos);

      // If finger moved off a button, release it
      if (prevBtn && prevBtn !== '__tap__' && prevBtn !== currBtn) {
        const btn = this.buttons[prevBtn];
        btn.pressed = false;
        this.input.simulateUp(btn.code);
      }

      // If finger moved onto a new button, press it
      if (currBtn && currBtn !== prevBtn) {
        const btn = this.buttons[currBtn];
        if (!btn.pressed) {
          btn.pressed = true;
          this.input.simulateDown(btn.code);
        }
        this.activeTouches[touch.identifier] = currBtn;
      } else if (!currBtn) {
        this.activeTouches[touch.identifier] = '__tap__';
      }
    }
  }

  _onTouchEnd(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const btnName = this.activeTouches[touch.identifier];
      if (btnName && btnName !== '__tap__') {
        const btn = this.buttons[btnName];
        btn.pressed = false;
        this.input.simulateUp(btn.code);
      }
      delete this.activeTouches[touch.identifier];
    }
  }

  draw(ctx) {
    if (!this.isTouchDevice) return;

    ctx.save();
    for (const [name, btn] of Object.entries(this.buttons)) {
      const alpha = btn.pressed ? 0.5 : 0.25;

      if (btn.round) {
        // Circle button (jump)
        const cx = btn.x + btn.w / 2;
        const cy = btn.y + btn.h / 2;
        const r = btn.w / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha + 0.15})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.3})`;
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, cx, cy);
      } else {
        // Rounded rectangle button
        const r = 10;
        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y, btn.w, btn.h, r);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha + 0.15})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.3})`;
        ctx.font = name === 'enter' ? 'bold 22px sans-serif' : 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
      }
    }
    ctx.restore();
  }

  // Get a tap position for menu/UI interaction (non-button touch)
  getTapPos() {
    return this._lastTapPos;
  }

  clearTap() {
    this._lastTapPos = null;
  }
}
