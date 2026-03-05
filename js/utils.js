// ============================================================
// Utility Functions
// ============================================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// AABB collision
function rectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Distance between two points
function dist(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Simple seeded random for deterministic textures
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Simplex-ish noise for textures (quick & dirty)
function noiseAt(x, y, seed) {
  const rng = seededRandom(Math.floor(x * 73 + y * 179 + seed * 337));
  return rng();
}

// Draw rounded rectangle
function drawRoundedRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Screen shake helper
const ScreenShake = {
  intensity: 0,
  duration: 0,
  timer: 0,

  trigger(intensity, duration) {
    this.intensity = intensity;
    this.duration = duration;
    this.timer = duration;
  },

  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer < 0) this.timer = 0;
    }
  },

  getOffset() {
    if (this.timer <= 0) return { x: 0, y: 0 };
    const progress = this.timer / this.duration;
    const mag = this.intensity * progress;
    return {
      x: (Math.random() - 0.5) * mag * 2,
      y: (Math.random() - 0.5) * mag * 2,
    };
  },
};

// Floating text particles (for damage messages, etc.)
class FloatingText {
  constructor(text, x, y, color, duration) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color || COLORS.danger;
    this.duration = duration || 2;
    this.timer = this.duration;
    this.vy = -40;
  }

  update(dt) {
    this.timer -= dt;
    this.y += this.vy * dt;
    this.vy *= 0.97;
  }

  isAlive() {
    return this.timer > 0;
  }

  getAlpha() {
    return clamp(this.timer / 0.5, 0, 1);
  }
}
