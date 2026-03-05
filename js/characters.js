// ============================================================
// Character Drawing — Stylized Tel Aviv residents
// ============================================================

class CharacterRenderer {

  // Draw player character
  static drawPlayer(ctx, x, y, charDef, state, animFrame, direction) {
    ctx.save();

    // Flip if running right-to-left
    if (direction < 0) {
      ctx.translate(x + PLAYER_WIDTH / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(x + PLAYER_WIDTH / 2), 0);
    }

    const bobY = state === 'running' ? Math.sin(animFrame * 12) * 2 : 0;
    const lean = state === 'running' ? 3 : 0;

    switch (state) {
      case 'running':
        CharacterRenderer._drawRunning(ctx, x, y + bobY, charDef, animFrame, lean);
        break;
      case 'jumping':
        CharacterRenderer._drawJumping(ctx, x, y, charDef);
        break;
      case 'slipping':
        CharacterRenderer._drawSlipping(ctx, x, y, charDef);
        break;
      case 'trapped':
        CharacterRenderer._drawTrapped(ctx, x, y, charDef, animFrame);
        break;
      case 'stumble':
        CharacterRenderer._drawStumble(ctx, x, y, charDef, animFrame);
        break;
      default:
        CharacterRenderer._drawRunning(ctx, x, y, charDef, 0, 0);
    }

    ctx.restore();
  }

  static _drawRunning(ctx, x, y, c, frame, lean) {
    const legPhase = Math.sin(frame * 12);
    const armPhase = Math.cos(frame * 12);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back leg
    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + 10, y + 32);
    ctx.rotate(legPhase * 0.4);
    ctx.fillRect(-4, 0, 8, 18);
    // Shoe
    ctx.fillStyle = c.shoes;
    ctx.fillRect(-4, 16, 10, 4);
    ctx.restore();

    // Back arm
    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + 8, y + 14);
    ctx.rotate(armPhase * 0.5);
    ctx.fillRect(-3, 0, 6, 16);
    // Hand
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(0, 17, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body (tracksuit top)
    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + PLAYER_WIDTH / 2, y + 12);
    ctx.rotate(lean * 0.015);
    drawRoundedRect(ctx, -10, 0, 20, 22, 3);
    ctx.fill();

    // Tracksuit stripe
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(-9, 2, 2, 18);
    ctx.fillRect(7, 2, 2, 18);
    ctx.restore();

    // Front leg
    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + 18, y + 32);
    ctx.rotate(-legPhase * 0.4);
    ctx.fillRect(-4, 0, 8, 18);
    ctx.fillStyle = c.shoes;
    ctx.fillRect(-4, 16, 10, 4);
    ctx.restore();

    // Front arm
    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + 20, y + 14);
    ctx.rotate(-armPhase * 0.5);
    ctx.fillRect(-3, 0, 6, 16);
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(0, 17, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head
    CharacterRenderer._drawHead(ctx, x + PLAYER_WIDTH / 2, y + 4, c, 'panic');
  }

  static _drawJumping(ctx, x, y, c) {
    // Shadow (faded when high)
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(x + PLAYER_WIDTH / 2, GROUND_Y, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs tucked
    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + 10, y + 32);
    ctx.rotate(-0.5);
    ctx.fillRect(-4, 0, 8, 14);
    ctx.fillStyle = c.shoes;
    ctx.fillRect(-4, 12, 10, 4);
    ctx.restore();

    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + 18, y + 32);
    ctx.rotate(-0.3);
    ctx.fillRect(-4, 0, 8, 14);
    ctx.fillStyle = c.shoes;
    ctx.fillRect(-4, 12, 10, 4);
    ctx.restore();

    // Body
    ctx.fillStyle = c.tracksuit;
    drawRoundedRect(ctx, x + 4, y + 12, 20, 22, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x + 5, y + 14, 2, 18);
    ctx.fillRect(x + 21, y + 14, 2, 18);

    // Arms up
    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + 6, y + 14);
    ctx.rotate(-0.8);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(0, 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = c.tracksuit;
    ctx.save();
    ctx.translate(x + 22, y + 14);
    ctx.rotate(-0.6);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(0, 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head
    CharacterRenderer._drawHead(ctx, x + PLAYER_WIDTH / 2, y + 4, c, 'scared');
  }

  static _drawSlipping(ctx, x, y, c) {
    ctx.save();
    ctx.translate(x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT / 2);
    ctx.rotate(0.6);
    ctx.translate(-(x + PLAYER_WIDTH / 2), -(y + PLAYER_HEIGHT / 2));

    // Body tilted back
    ctx.fillStyle = c.tracksuit;
    drawRoundedRect(ctx, x + 2, y + 10, 20, 24, 3);
    ctx.fill();

    // Legs flailing
    ctx.fillStyle = c.tracksuit;
    ctx.fillRect(x + 5, y + 32, 8, 16);
    ctx.fillRect(x + 16, y + 30, 8, 18);
    ctx.fillStyle = c.shoes;
    ctx.fillRect(x + 5, y + 46, 10, 4);
    ctx.fillRect(x + 16, y + 46, 10, 4);

    // Arms
    ctx.fillStyle = c.tracksuit;
    ctx.fillRect(x - 5, y + 12, 14, 6);
    ctx.fillRect(x + 18, y + 8, 12, 6);

    // Head
    CharacterRenderer._drawHead(ctx, x + PLAYER_WIDTH / 2, y + 2, c, 'shock');

    ctx.restore();

    // Motion lines
    ctx.strokeStyle = 'rgba(200, 180, 150, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 5 - i * 8, y + 20 + i * 10);
      ctx.lineTo(x - 15 - i * 8, y + 20 + i * 10);
      ctx.stroke();
    }
  }

  static _drawTrapped(ctx, x, y, c, frame) {
    const fidget = Math.sin(frame * 8) * 1;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Standing still, fidgeting
    ctx.fillStyle = c.tracksuit;
    drawRoundedRect(ctx, x + 4 + fidget, y + 12, 20, 22, 3);
    ctx.fill();

    // Legs
    ctx.fillStyle = c.tracksuit;
    ctx.fillRect(x + 8, y + 32, 8, 18);
    ctx.fillRect(x + 18, y + 32, 8, 18);
    ctx.fillStyle = c.shoes;
    ctx.fillRect(x + 8, y + 48, 10, 4);
    ctx.fillRect(x + 18, y + 48, 10, 4);

    // Arms (crossed / frustrated)
    ctx.fillStyle = c.tracksuit;
    ctx.fillRect(x + 1, y + 18, 26, 6);
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(x + 1, y + 21, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 27, y + 21, 3, 0, Math.PI * 2);
    ctx.fill();

    // Head (annoyed)
    CharacterRenderer._drawHead(ctx, x + PLAYER_WIDTH / 2 + fidget, y + 4, c, 'annoyed');
  }

  static _drawStumble(ctx, x, y, c, frame) {
    const stagger = Math.sin(frame * 15) * 4;

    ctx.save();
    ctx.translate(x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT);
    ctx.rotate(Math.sin(frame * 10) * 0.3);
    ctx.translate(-(x + PLAYER_WIDTH / 2), -(y + PLAYER_HEIGHT));

    // Body
    ctx.fillStyle = c.tracksuit;
    drawRoundedRect(ctx, x + 4 + stagger, y + 12, 20, 22, 3);
    ctx.fill();

    // Legs wobbly
    ctx.fillStyle = c.tracksuit;
    ctx.fillRect(x + 6 + stagger, y + 32, 8, 18);
    ctx.fillRect(x + 18 + stagger, y + 32, 8, 18);
    ctx.fillStyle = c.shoes;
    ctx.fillRect(x + 6 + stagger, y + 48, 10, 4);
    ctx.fillRect(x + 18 + stagger, y + 48, 10, 4);

    // Head
    CharacterRenderer._drawHead(ctx, x + PLAYER_WIDTH / 2 + stagger, y + 4, c, 'dizzy');

    // Stars around head
    ctx.fillStyle = COLORS.warning;
    ctx.font = '10px Arial';
    ctx.fillText('★', x + stagger + 28, y);
    ctx.fillText('★', x + stagger - 5, y + 3);

    ctx.restore();
  }

  static _drawHead(ctx, cx, cy, c, expression) {
    // Head shape
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = c.hair;
    if (c.hairStyle === 'short_messy') {
      // Messy short hair
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 10, Math.PI * 0.9, Math.PI * 0.1, true);
      ctx.fill();
      // Messy tufts
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 8);
      ctx.lineTo(cx - 10, cy - 14);
      ctx.lineTo(cx - 4, cy - 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 2, cy - 10);
      ctx.lineTo(cx + 5, cy - 16);
      ctx.lineTo(cx + 7, cy - 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - 7);
      ctx.lineTo(cx + 11, cy - 12);
      ctx.lineTo(cx + 9, cy - 6);
      ctx.fill();
    } else {
      // Long messy hair
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 11, Math.PI * 0.85, Math.PI * 0.15, true);
      ctx.fill();
      // Flowing messy strands
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 4);
      ctx.quadraticCurveTo(cx - 14, cy + 5, cx - 10, cy + 12);
      ctx.lineTo(cx - 6, cy + 5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 9, cy - 4);
      ctx.quadraticCurveTo(cx + 14, cy + 5, cx + 10, cy + 12);
      ctx.lineTo(cx + 6, cy + 5);
      ctx.fill();
      // Top messy tufts
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 10);
      ctx.lineTo(cx - 2, cy - 16);
      ctx.lineTo(cx + 1, cy - 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 9);
      ctx.lineTo(cx + 8, cy - 15);
      ctx.lineTo(cx + 7, cy - 8);
      ctx.fill();
    }

    // Eyes
    switch (expression) {
      case 'panic':
        // Wide eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(cx - 3, cy, 3, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 3, cy, 3, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(cx - 3, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 3, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Open mouth
        ctx.fillStyle = '#8a4a4a';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 5, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'scared':
        // Big round eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 1, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 3, cy - 1, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 3, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Scream mouth
        ctx.fillStyle = '#7a3a3a';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 5, 3, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'shock':
        // Spiral eyes
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx - 3, cy, 2, 0, Math.PI * 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 3, cy, 2, 0, Math.PI * 3);
        ctx.stroke();
        break;

      case 'annoyed':
        // Half-lidded eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - 5, cy - 1, 4, 3);
        ctx.fillRect(cx + 1, cy - 1, 4, 3);
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 4, cy, 2, 2);
        ctx.fillRect(cx + 2, cy, 2, 2);
        // Frown
        ctx.strokeStyle = '#5a3a3a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy + 7, 3, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        break;

      case 'dizzy':
        // X eyes
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx - 5, cy - 2); ctx.lineTo(cx - 1, cy + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 1, cy - 2); ctx.lineTo(cx - 5, cy + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 1, cy - 2); ctx.lineTo(cx + 5, cy + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 5, cy - 2); ctx.lineTo(cx + 1, cy + 2); ctx.stroke();
        break;

      default:
        // Neutral
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(cx - 3, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 3, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
  }

  // Draw background NPC (simpler, smaller)
  static drawBackgroundNPC(ctx, x, y, seed, running) {
    const rng = seededRandom(seed);
    const shirtColor = `hsl(${rng() * 360}, ${30 + rng() * 30}%, ${40 + rng() * 20}%)`;
    const pantsColor = `hsl(${rng() * 360}, ${10 + rng() * 20}%, ${30 + rng() * 15}%)`;

    const scale = 0.7 + rng() * 0.2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const frame = Date.now() * 0.001 + seed;
    const bob = running ? Math.sin(frame * 10) * 2 : 0;

    // Legs
    ctx.fillStyle = pantsColor;
    if (running) {
      const legPhase = Math.sin(frame * 10);
      ctx.save();
      ctx.translate(-3, -14);
      ctx.rotate(legPhase * 0.3);
      ctx.fillRect(-3, 0, 6, 14);
      ctx.restore();
      ctx.save();
      ctx.translate(3, -14);
      ctx.rotate(-legPhase * 0.3);
      ctx.fillRect(-3, 0, 6, 14);
      ctx.restore();
    } else {
      ctx.fillRect(-6, -14, 5, 14);
      ctx.fillRect(1, -14, 5, 14);
    }

    // Body
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-8, -34 + bob, 16, 22);

    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.beginPath();
    ctx.arc(0, -40 + bob, 7, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = `hsl(${rng() * 40 + 10}, ${20 + rng() * 30}%, ${20 + rng() * 20}%)`;
    ctx.beginPath();
    ctx.arc(0, -43 + bob, 7, Math.PI, 0);
    ctx.fill();

    ctx.restore();
  }
}
