// ============================================================
// Touch Controls — Virtual Buttons for Mobile
// ============================================================

class TouchControls {
  constructor(canvas, input) {
    this.canvas = canvas;
    this.input = input;
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    this.activeTouches = {};

    // Button definitions (canvas coordinates) — large for mobile thumbs
    const pad = 15;
    const btnH = 85;
    const btnW = 95;
    this.buttons = {
      left:  { x: pad, y: CANVAS_HEIGHT - pad - btnH, w: btnW, h: btnH, code: 'ArrowLeft',  label: '←', pressed: false },
      right: { x: pad + btnW + 10, y: CANVAS_HEIGHT - pad - btnH, w: btnW, h: btnH, code: 'ArrowRight', label: '→', pressed: false },
      jump:  { x: CANVAS_WIDTH - pad - 105, y: CANVAS_HEIGHT - pad - 105, w: 105, h: 105, code: 'Space', label: 'JUMP', pressed: false, round: true },
      enter: { x: CANVAS_WIDTH - pad - 200, y: CANVAS_HEIGHT - pad - 75, w: 85, h: 75, code: 'Enter', label: 'מקלט', pressed: false, color: 'rgba(46, 204, 113,' },
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
        // Tap outside buttons — store touch position for click simulation
        this.activeTouches[touch.identifier] = { type: '__tap__', clientX: touch.clientX, clientY: touch.clientY };
      }
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const pos = this._canvasPos(touch);
      const prev = this.activeTouches[touch.identifier];
      const prevBtn = (typeof prev === 'string') ? prev : null;
      const currBtn = this._hitTest(pos);

      // If finger moved off a button, release it
      if (prevBtn && prevBtn !== currBtn) {
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
        // Finger moved — cancel tap (it's a drag, not a tap)
        this.activeTouches[touch.identifier] = null;
      }
    }
  }

  _onTouchEnd(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const entry = this.activeTouches[touch.identifier];
      if (entry && typeof entry === 'object' && entry.type === '__tap__') {
        // Simulate click for menu/UI interaction
        this.canvas.dispatchEvent(new MouseEvent('click', {
          clientX: entry.clientX,
          clientY: entry.clientY,
          bubbles: true,
        }));
      } else if (entry && typeof entry === 'string') {
        const btn = this.buttons[entry];
        if (btn) {
          btn.pressed = false;
          this.input.simulateUp(btn.code);
        }
      }
      delete this.activeTouches[touch.identifier];
    }
  }

  draw(ctx) {
    if (!this.isTouchDevice) return;

    ctx.save();
    for (const [name, btn] of Object.entries(this.buttons)) {
      const alpha = btn.pressed ? 0.55 : 0.3;
      const baseColor = btn.color || 'rgba(255, 255, 255,';

      if (btn.round) {
        // Circle button (jump)
        const cx = btn.x + btn.w / 2;
        const cy = btn.y + btn.h / 2;
        const r = btn.w / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `${baseColor} ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `${baseColor} ${alpha + 0.2})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = `${baseColor} ${alpha + 0.4})`;
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, cx, cy);
      } else {
        // Rounded rectangle button
        const r = 12;
        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y, btn.w, btn.h, r);
        ctx.fillStyle = `${baseColor} ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `${baseColor} ${alpha + 0.2})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = `${baseColor} ${alpha + 0.4})`;
        ctx.font = name === 'enter' ? 'bold 20px sans-serif' : 'bold 34px sans-serif';
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
