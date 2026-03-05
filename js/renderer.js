// ============================================================
// Renderer — Machinarium-inspired Urban Environment
// ============================================================

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this._cachedTextures = {};
    this._initParticles();
  }

  // --- Dust particles for atmosphere ---
  _initParticles() {
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: randomFloat(1, 3),
        speed: randomFloat(5, 20),
        alpha: randomFloat(0.05, 0.2),
        drift: randomFloat(-8, 8),
      });
    }
  }

  clear() {
    this.ctx.fillStyle = COLORS.skyTop;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // ============================================================
  // PARALLAX BACKGROUND
  // ============================================================

  drawSky() {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#3a4556');
    grad.addColorStop(0.4, '#5a6a78');
    grad.addColorStop(0.7, '#8a8878');
    grad.addColorStop(1, '#a09888');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawDistantBuildings(cameraX) {
    const ctx = this.ctx;
    const parallax = cameraX * 0.1;
    const seed = seededRandom(42);

    for (let i = 0; i < 20; i++) {
      const bx = i * 120 - (parallax % 120) - 60;
      const bw = 40 + seed() * 70;
      const bh = 80 + seed() * 160;
      const by = CANVAS_HEIGHT - 100 - bh + 40;

      ctx.fillStyle = `rgba(60, 55, 50, ${0.3 + seed() * 0.2})`;
      ctx.fillRect(bx, by, bw, bh + 100);

      // Tiny windows
      const winSeed = seededRandom(i * 77);
      for (let wy = by + 8; wy < by + bh - 5; wy += 14) {
        for (let wx = bx + 6; wx < bx + bw - 6; wx += 12) {
          if (winSeed() > 0.4) {
            const glow = winSeed() > 0.6;
            ctx.fillStyle = glow
              ? `rgba(255, 220, 150, ${0.15 + winSeed() * 0.1})`
              : `rgba(80, 100, 120, 0.3)`;
            ctx.fillRect(wx, wy, 5, 6);
          }
        }
      }
    }
  }

  drawMidgroundBuildings(cameraX) {
    const ctx = this.ctx;
    const parallax = cameraX * 0.3;
    const seed = seededRandom(137);

    for (let i = 0; i < 14; i++) {
      const bx = i * 180 - (parallax % 180) - 90;
      const bw = 60 + seed() * 100;
      const bh = 120 + seed() * 180;
      const by = CANVAS_HEIGHT - 90 - bh + 80;

      // Building body
      const shade = 0.4 + seed() * 0.15;
      ctx.fillStyle = `rgb(${140 * shade + 40}, ${130 * shade + 30}, ${120 * shade + 20})`;
      ctx.fillRect(bx, by, bw, bh + 100);

      // Horizontal lines (floor separators)
      ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`;
      ctx.lineWidth = 1;
      for (let ly = by + 30; ly < by + bh; ly += 30 + seed() * 10) {
        ctx.beginPath();
        ctx.moveTo(bx, ly);
        ctx.lineTo(bx + bw, ly);
        ctx.stroke();
      }

      // Windows with some lit
      const winSeed = seededRandom(i * 99 + 7);
      for (let wy = by + 10; wy < by + bh - 8; wy += 22) {
        for (let wx = bx + 8; wx < bx + bw - 12; wx += 18) {
          if (winSeed() > 0.3) {
            const lit = winSeed() > 0.5;
            ctx.fillStyle = lit
              ? `rgba(255, 210, 130, ${0.2 + winSeed() * 0.15})`
              : COLORS.windowDark;
            ctx.fillRect(wx, wy, 8, 10);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(wx, wy, 8, 10);
          }
        }
      }

      // Occasional AC unit
      if (seed() > 0.5) {
        const acx = bx + bw - 18;
        const acy = by + 20 + seed() * 60;
        ctx.fillStyle = COLORS.acDark;
        ctx.fillRect(acx, acy, 16, 10);
        ctx.fillStyle = COLORS.ac;
        ctx.fillRect(acx + 1, acy + 1, 14, 4);
      }

      // Water tank on some roofs
      if (seed() > 0.7) {
        ctx.fillStyle = COLORS.metalDark;
        ctx.fillRect(bx + bw / 2 - 8, by - 18, 16, 18);
        ctx.fillStyle = COLORS.metal;
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2, by - 18, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ============================================================
  // FOREGROUND — MAIN BUILDING (gameplay area)
  // ============================================================

  drawMainBuilding(floor, cameraX) {
    const ctx = this.ctx;
    const offsetX = -cameraX;

    // Floor (ground plane)
    this._drawHallwayFloor(offsetX, floor);

    // Walls (top and bottom)
    this._drawHallwayWalls(offsetX, floor);

    // Architectural details
    this._drawBuildingDetails(offsetX, floor);

    // Apartment doors
    this._drawDoors(offsetX, floor);
  }

  _drawHallwayFloor(offsetX, floor) {
    const ctx = this.ctx;
    const y = GROUND_Y;

    // Floor base
    ctx.fillStyle = COLORS.floor;
    ctx.fillRect(0, y, CANVAS_WIDTH, CANVAS_HEIGHT - y);

    // Tiles
    const tileW = 40;
    const startTile = Math.floor(-offsetX / tileW);
    for (let i = startTile - 1; i < startTile + CANVAS_WIDTH / tileW + 2; i++) {
      const tx = i * tileW + offsetX;
      const shade = (i % 2 === 0) ? COLORS.floorTile : COLORS.floor;
      ctx.fillStyle = shade;
      ctx.fillRect(tx, y, tileW, 8);

      // Tile cracks
      const crackSeed = seededRandom(i * 31 + floor.index * 97);
      if (crackSeed() > 0.7) {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(tx + crackSeed() * tileW, y + 1);
        ctx.lineTo(tx + crackSeed() * tileW, y + 7);
        ctx.stroke();
      }
    }

    // Floor shadow at wall base
    const shadowGrad = ctx.createLinearGradient(0, y - 4, 0, y + 4);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.2)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, y - 4, CANVAS_WIDTH, 8);
  }

  _drawHallwayWalls(offsetX, floor) {
    const ctx = this.ctx;
    const wallTop = GROUND_Y - FLOOR_HEIGHT;

    // Ceiling
    ctx.fillStyle = COLORS.concreteDark;
    ctx.fillRect(0, wallTop - 30, CANVAS_WIDTH, 30);

    // Main wall
    const wallGrad = ctx.createLinearGradient(0, wallTop, 0, GROUND_Y);
    wallGrad.addColorStop(0, COLORS.wallDark);
    wallGrad.addColorStop(0.3, COLORS.wallMid);
    wallGrad.addColorStop(0.8, COLORS.wallLight);
    wallGrad.addColorStop(1, COLORS.wallMid);
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, wallTop, CANVAS_WIDTH, FLOOR_HEIGHT);

    // Wall texture (subtle noise pattern)
    const patchSeed = seededRandom(floor.index * 53);
    for (let i = 0; i < 30; i++) {
      const px = patchSeed() * CANVAS_WIDTH;
      const py = wallTop + patchSeed() * FLOOR_HEIGHT;
      const ps = 3 + patchSeed() * 12;
      ctx.fillStyle = `rgba(0,0,0,${0.02 + patchSeed() * 0.04})`;
      ctx.fillRect(px, py, ps, ps * (0.5 + patchSeed()));
    }

    // Baseboard
    ctx.fillStyle = COLORS.concreteDark;
    ctx.fillRect(0, GROUND_Y - 6, CANVAS_WIDTH, 6);
  }

  _drawBuildingDetails(offsetX, floor) {
    const ctx = this.ctx;
    const wallTop = GROUND_Y - FLOOR_HEIGHT;
    const detailSeed = seededRandom(floor.index * 200 + 7);

    // Pipes along ceiling
    const pipeY = wallTop + 5;
    ctx.strokeStyle = COLORS.pipe;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, pipeY);
    ctx.lineTo(CANVAS_WIDTH, pipeY);
    ctx.stroke();

    // Pipe brackets
    for (let px = 50 + (offsetX % 200); px < CANVAS_WIDTH; px += 200) {
      ctx.fillStyle = COLORS.metalDark;
      ctx.fillRect(px - 3, pipeY - 2, 6, 8);
    }

    // Cables
    ctx.strokeStyle = COLORS.cable;
    ctx.lineWidth = 1;
    const cableY = wallTop + 12;
    ctx.beginPath();
    ctx.moveTo(0, cableY);
    for (let cx = 0; cx < CANVAS_WIDTH; cx += 4) {
      ctx.lineTo(cx, cableY + Math.sin((cx + offsetX) * 0.02) * 2);
    }
    ctx.stroke();

    // Exposed brick patches
    for (let i = 0; i < 4; i++) {
      const brickX = detailSeed() * CANVAS_WIDTH;
      const brickY = wallTop + 20 + detailSeed() * (FLOOR_HEIGHT - 50);
      if (detailSeed() > 0.5) {
        this._drawBrickPatch(brickX, brickY, 25 + detailSeed() * 30, 15 + detailSeed() * 15);
      }
    }

    // Graffiti (occasional)
    if (detailSeed() > 0.6) {
      const gx = 100 + detailSeed() * (CANVAS_WIDTH - 200);
      const gy = wallTop + 40 + detailSeed() * 40;
      this._drawGraffiti(gx, gy, detailSeed);
    }

    // Light fixture
    for (let lx = 150 + (offsetX % 400); lx < CANVAS_WIDTH; lx += 400) {
      this._drawLightFixture(lx, wallTop);
    }
  }

  _drawBrickPatch(x, y, w, h) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const brickW = 12;
    const brickH = 6;
    for (let by = y; by < y + h; by += brickH + 1) {
      const rowOffset = (Math.floor((by - y) / (brickH + 1)) % 2) * brickW / 2;
      for (let bx = x - brickW + rowOffset; bx < x + w; bx += brickW + 1) {
        const shade = 0.85 + Math.random() * 0.15;
        ctx.fillStyle = `rgb(${Math.floor(139 * shade)}, ${Math.floor(111 * shade)}, ${Math.floor(94 * shade)})`;
        ctx.fillRect(bx, by, brickW, brickH);
      }
    }
    ctx.restore();
  }

  _drawGraffiti(x, y, seed) {
    const ctx = this.ctx;
    const colors = [COLORS.graffiti1, COLORS.graffiti2, COLORS.graffiti3];
    const color = colors[Math.floor(seed() * colors.length)];
    ctx.save();
    ctx.globalAlpha = 0.3 + seed() * 0.3;
    ctx.fillStyle = color;
    ctx.font = `bold ${14 + Math.floor(seed() * 10)}px Arial`;
    const texts = ['חופש', '☮', '♥', 'TLV', '🐱', '⚡'];
    ctx.fillText(texts[Math.floor(seed() * texts.length)], x, y);
    ctx.restore();
  }

  _drawLightFixture(x, y) {
    const ctx = this.ctx;
    // Fixture body
    ctx.fillStyle = COLORS.metalDark;
    ctx.fillRect(x - 4, y, 8, 10);

    // Bulb glow
    const glowGrad = ctx.createRadialGradient(x, y + 14, 2, x, y + 14, 40);
    glowGrad.addColorStop(0, 'rgba(255, 230, 180, 0.15)');
    glowGrad.addColorStop(1, 'rgba(255, 230, 180, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bulb
    ctx.fillStyle = 'rgba(255, 240, 200, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawDoors(offsetX, floor) {
    const ctx = this.ctx;
    const doorSpacing = 300;
    const startDoor = Math.floor(-offsetX / doorSpacing);

    for (let i = startDoor - 1; i < startDoor + CANVAS_WIDTH / doorSpacing + 2; i++) {
      const dx = i * doorSpacing + 100 + offsetX;
      if (dx < -80 || dx > CANVAS_WIDTH + 80) continue;

      const doorSeed = seededRandom(i * 71 + floor.index * 300);
      const dw = 38 + doorSeed() * 10;
      const dh = 65 + doorSeed() * 10;
      const dy = GROUND_Y - dh;

      // Door frame
      ctx.fillStyle = COLORS.doorFrame;
      ctx.fillRect(dx - 3, dy - 3, dw + 6, dh + 3);

      // Door body
      const doorShade = 0.8 + doorSeed() * 0.2;
      ctx.fillStyle = `rgb(${Math.floor(92 * doorShade)}, ${Math.floor(74 * doorShade)}, ${Math.floor(62 * doorShade)})`;
      ctx.fillRect(dx, dy, dw, dh);

      // Door panels
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(dx + 4, dy + 4, dw - 8, dh / 2 - 6);
      ctx.strokeRect(dx + 4, dy + dh / 2 + 2, dw - 8, dh / 2 - 6);

      // Doorknob
      ctx.fillStyle = COLORS.metal;
      ctx.beginPath();
      ctx.arc(dx + dw - 8, dy + dh / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Door number
      ctx.fillStyle = COLORS.textPrimary;
      ctx.font = '13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${floor.index + 1}${i + 1}`, dx + dw / 2, dy - 6);
      ctx.textAlign = 'left';
    }
  }

  // ============================================================
  // ATMOSPHERE
  // ============================================================

  drawDustParticles(dt) {
    const ctx = this.ctx;
    for (const p of this.particles) {
      p.x += p.drift * dt;
      p.y += p.speed * dt;
      if (p.y > CANVAS_HEIGHT) {
        p.y = -5;
        p.x = Math.random() * CANVAS_WIDTH;
      }
      if (p.x < 0) p.x = CANVAS_WIDTH;
      if (p.x > CANVAS_WIDTH) p.x = 0;

      ctx.fillStyle = `rgba(200, 190, 175, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawHaze() {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.haze;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawVignette() {
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.3,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // ============================================================
  // STAIRWELL
  // ============================================================

  drawStairwell(progress, event, charDef) {
    const ctx = this.ctx;

    // Dark concrete background
    ctx.fillStyle = '#2a2420';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Flickering light event
    const isFlicker = event && event.type === 'flicker';
    if (isFlicker && progress > 0.3 && progress < 0.6) {
      const flicker = Math.sin(progress * 40) > 0.3;
      if (!flicker) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = COLORS.textSecondary;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.textAlign = 'left';
        return;
      }
    }

    // Proper switchback staircase going DOWN
    const stairsPerFlight = 6;
    const stairHeight = 24;
    const stairWidth = 70;
    const flightWidth = stairsPerFlight * stairWidth;
    const wallLeft = CANVAS_WIDTH / 2 - flightWidth / 2 - 50;
    const wallRight = CANVAS_WIDTH / 2 + flightWidth / 2 + 50;
    const scrollY = progress * stairHeight * stairsPerFlight * 2;

    // Walls
    ctx.fillStyle = '#3a3430';
    ctx.fillRect(wallLeft - 25, 0, 25, CANVAS_HEIGHT);
    ctx.fillRect(wallRight, 0, 25, CANVAS_HEIGHT);

    // Wall texture — subtle vertical lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let wx = wallLeft - 20; wx < wallLeft; wx += 6) {
      ctx.beginPath();
      ctx.moveTo(wx, 0);
      ctx.lineTo(wx, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let wx = wallRight + 5; wx < wallRight + 25; wx += 6) {
      ctx.beginPath();
      ctx.moveTo(wx, 0);
      ctx.lineTo(wx, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Draw flights of stairs
    for (let f = -2; f < 5; f++) {
      const flightBaseY = f * stairsPerFlight * stairHeight - scrollY;
      const goingRight = (f % 2 === 0);

      for (let s = 0; s < stairsPerFlight; s++) {
        let sx;
        if (goingRight) {
          sx = wallLeft + 25 + s * stairWidth;
        } else {
          sx = wallRight - 25 - (s + 1) * stairWidth;
        }
        const sy = flightBaseY + s * stairHeight;

        if (sy < -stairHeight * 2 || sy > CANVAS_HEIGHT + stairHeight) continue;

        // Depth shading
        const depth = 1 - Math.max(0, Math.min(1, sy / CANVAS_HEIGHT)) * 0.25;

        // Tread (horizontal walking surface)
        ctx.fillStyle = `rgb(${Math.floor(155 * depth)}, ${Math.floor(145 * depth)}, ${Math.floor(135 * depth)})`;
        ctx.fillRect(sx, sy, stairWidth, stairHeight - 5);

        // Riser (vertical face, darker)
        ctx.fillStyle = `rgb(${Math.floor(95 * depth)}, ${Math.floor(90 * depth)}, ${Math.floor(82 * depth)})`;
        ctx.fillRect(sx, sy + stairHeight - 5, stairWidth, 5);

        // Shadow on tread front
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(sx, sy, stairWidth, 3);

        // Anti-slip nosing (light edge)
        ctx.fillStyle = `rgba(180,170,160,${0.3 * depth})`;
        ctx.fillRect(sx, sy + stairHeight - 6, stairWidth, 1);
      }

      // Landing between flights
      const landingY = flightBaseY + stairsPerFlight * stairHeight;
      if (landingY > -30 && landingY < CANVAS_HEIGHT + 30) {
        ctx.fillStyle = '#4a4440';
        ctx.fillRect(wallLeft + 25, landingY, wallRight - wallLeft - 50, stairHeight);
        // Wear marks
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(wallLeft + 45, landingY + 3, wallRight - wallLeft - 90, stairHeight - 6);
      }
    }

    // Center railing
    ctx.strokeStyle = COLORS.metal;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();

    // Railing posts
    ctx.fillStyle = COLORS.metalDark;
    const postOffset = scrollY % 50;
    for (let py = -postOffset; py < CANVAS_HEIGHT + 50; py += 50) {
      ctx.fillRect(CANVAS_WIDTH / 2 - 2, py, 4, 25);
    }

    // Player character running down stairs
    if (charDef) {
      const playerY = CANVAS_HEIGHT / 2 - 30 + Math.sin(progress * 12) * 5;
      const playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2 + Math.sin(progress * 8) * 15;
      CharacterRenderer.drawPlayer(ctx, playerX, playerY, charDef, 'running', progress * 6, 1);
    }

    // Stairwell events
    if (event && progress > 0.25 && progress < 0.85) {
      this._drawStairwellEvent(ctx, event, progress);
    }

    // Dim overlay
    ctx.fillStyle = 'rgba(20, 18, 15, 0.3)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Floor label with down arrow
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    const floorNum = 4 - Math.floor(progress * FLOOR_COUNT);
    ctx.fillText(`\u2193 Floor ${floorNum}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 65);
    ctx.textAlign = 'left';
  }

  _drawStairwellEvent(ctx, event, progress) {
    const eventProgress = (progress - 0.25) / 0.6; // 0-1 within event window

    switch (event.type) {
      case 'neighbor': {
        // NPC rushing upward past the player
        const npcX = CANVAS_WIDTH / 2 + 40;
        const npcY = CANVAS_HEIGHT * (1 - eventProgress) - 30;
        CharacterRenderer.drawBackgroundNPC(ctx, npcX, npcY + 52, Math.floor(eventProgress * 1000), true);
        if (eventProgress > 0.3 && eventProgress < 0.7) {
          ScreenShake.trigger(2, 0.1);
        }
        break;
      }

      case 'dog': {
        // Small dog running across
        const dogX = CANVAS_WIDTH * eventProgress;
        const dogY = CANVAS_HEIGHT / 2 + 40;
        ctx.fillStyle = '#8a6a4a';
        // Body
        ctx.beginPath();
        ctx.ellipse(dogX, dogY, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(dogX + 10, dogY - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        // Legs (animated)
        const legAnim = Math.sin(eventProgress * 30) * 4;
        ctx.fillRect(dogX - 6, dogY + 5, 3, 8 + legAnim);
        ctx.fillRect(dogX + 4, dogY + 5, 3, 8 - legAnim);
        // Tail
        ctx.strokeStyle = '#8a6a4a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dogX - 12, dogY - 2);
        ctx.lineTo(dogX - 18, dogY - 8 + Math.sin(eventProgress * 20) * 3);
        ctx.stroke();
        break;
      }

      case 'yell': {
        // Floating Hebrew text
        if (eventProgress > 0.2 && eventProgress < 0.8) {
          const alpha = eventProgress < 0.4 ? (eventProgress - 0.2) / 0.2 : (0.8 - eventProgress) / 0.4;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = COLORS.warning;
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.direction = 'rtl';
          ctx.fillText(event.message, CANVAS_WIDTH / 2, 100);
          ctx.direction = 'ltr';
          ctx.textAlign = 'left';
          ctx.restore();
        }
        break;
      }
      // 'flicker' handled above in main drawStairwell
    }
  }

  // ============================================================
  // OBSTACLES DRAWING
  // ============================================================

  drawObstacle(obstacle, cameraX) {
    const sx = obstacle.x - cameraX;
    if (sx < -100 || sx > CANVAS_WIDTH + 100) return;

    switch (obstacle.type) {
      case ObstacleType.STROLLER: this._drawStroller(sx, obstacle); break;
      case ObstacleType.WET_STAIRS: this._drawWetStairs(sx, obstacle); break;
      case ObstacleType.OLD_NEIGHBOR: this._drawOldNeighbor(sx, obstacle); break;
      case ObstacleType.HOMELESS: this._drawHomeless(sx, obstacle); break;
      case ObstacleType.UNWANTED_NEIGHBOR: this._drawUnwantedNeighbor(sx, obstacle); break;
    }
  }

  _drawStroller(sx, obs) {
    const ctx = this.ctx;
    const y = GROUND_Y - obs.height;

    // Frame
    ctx.fillStyle = COLORS.stroller;
    drawRoundedRect(ctx, sx, y, obs.width, obs.height - 8, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hood
    ctx.fillStyle = `rgb(140, 120, 100)`;
    ctx.beginPath();
    ctx.ellipse(sx + obs.width * 0.6, y + 5, obs.width * 0.35, 15, -0.2, Math.PI, 0);
    ctx.fill();

    // Wheels
    ctx.fillStyle = COLORS.strollerWheel;
    ctx.beginPath();
    ctx.arc(sx + 10, GROUND_Y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + obs.width - 10, GROUND_Y - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Handle
    ctx.strokeStyle = COLORS.metalDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + 5, y + 5);
    ctx.lineTo(sx - 5, y - 15);
    ctx.stroke();
  }

  _drawWetStairs(sx, obs) {
    const ctx = this.ctx;
    const y = GROUND_Y;

    // Puddle
    ctx.fillStyle = COLORS.wetFloor;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(sx + obs.width / 2, y - 2, obs.width / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Shine streaks
    ctx.fillStyle = COLORS.wetFloorShine;
    for (let i = 0; i < 3; i++) {
      const rx = sx + 10 + i * 20;
      ctx.beginPath();
      ctx.ellipse(rx, y - 2, 6, 2, 0.3 * i, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warning sign (small)
    if (!obs.resolved) {
      ctx.fillStyle = COLORS.warning;
      ctx.beginPath();
      ctx.moveTo(sx + obs.width / 2, y - 30);
      ctx.lineTo(sx + obs.width / 2 - 8, y - 16);
      ctx.lineTo(sx + obs.width / 2 + 8, y - 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = COLORS.textDark;
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('!', sx + obs.width / 2, y - 19);
      ctx.textAlign = 'left';
    }
  }

  _drawOldNeighbor(sx, obs) {
    const ctx = this.ctx;
    const y = GROUND_Y;

    // Body
    ctx.fillStyle = COLORS.neighbor;
    ctx.fillRect(sx + 8, y - 45, 22, 30);

    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.beginPath();
    ctx.arc(sx + 19, y - 52, 10, 0, Math.PI * 2);
    ctx.fill();

    // White hair
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(sx + 19, y - 56, 9, Math.PI, 0);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(sx + 10, y - 15, 7, 15);
    ctx.fillRect(sx + 21, y - 15, 7, 15);

    // Cane
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + 34, y - 35);
    ctx.lineTo(sx + 38, y);
    ctx.stroke();

    // Speech bubble if talking
    if (obs.talking) {
      this._drawSpeechBubble(sx + 10, y - 75, obs);
    }
  }

  _drawSpeechBubble(x, y, obs) {
    const ctx = this.ctx;
    const w = 100;
    const h = 34;

    ctx.fillStyle = COLORS.speechBubble;
    drawRoundedRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.speechBubbleBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tail
    ctx.fillStyle = COLORS.speechBubble;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + h);
    ctx.lineTo(x + 10, y + h + 10);
    ctx.lineTo(x + 25, y + h);
    ctx.fill();

    // Progress bar
    if (obs.requiredPresses > 0) {
      const progress = obs.skipPresses / obs.requiredPresses;
      ctx.fillStyle = '#eee';
      drawRoundedRect(ctx, x + 5, y + 6, w - 10, 8, 3);
      ctx.fill();
      ctx.fillStyle = COLORS.speedGreen;
      drawRoundedRect(ctx, x + 5, y + 6, (w - 10) * progress, 8, 3);
      ctx.fill();
    }

    // "SPACE" text
    ctx.fillStyle = COLORS.textDark;
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE to skip!', x + w / 2, y + 27);
    ctx.textAlign = 'left';
  }

  _drawHomeless(sx, obs) {
    const ctx = this.ctx;
    const y = GROUND_Y;

    // Blanket / sleeping bag
    ctx.fillStyle = COLORS.homeless;
    drawRoundedRect(ctx, sx, y - obs.height, obs.width, obs.height, 6);
    ctx.fill();

    // Body shape under blanket
    ctx.fillStyle = 'rgba(100, 85, 65, 0.8)';
    ctx.beginPath();
    ctx.ellipse(sx + obs.width * 0.4, y - obs.height / 2, obs.width * 0.35, obs.height * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head peeking out
    ctx.fillStyle = COLORS.skinShadow;
    ctx.beginPath();
    ctx.arc(sx + 12, y - obs.height + 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hat
    ctx.fillStyle = '#4a4a3a';
    ctx.beginPath();
    ctx.arc(sx + 12, y - obs.height - 2, 9, Math.PI, 0);
    ctx.fill();
  }

  _drawUnwantedNeighbor(sx, obs) {
    const ctx = this.ctx;
    const y = GROUND_Y;

    // Body (colorful tracksuit)
    ctx.fillStyle = '#8a5a7a';
    ctx.fillRect(sx + 6, y - 46, 24, 32);

    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.beginPath();
    ctx.arc(sx + 18, y - 53, 10, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#4a2a1a';
    ctx.beginPath();
    ctx.ellipse(sx + 18, y - 57, 10, 7, 0, Math.PI, 0);
    ctx.fill();

    // Phone in hand
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(sx + 30, y - 40, 6, 10);

    // Legs
    ctx.fillStyle = '#5a4a6a';
    ctx.fillRect(sx + 8, y - 14, 8, 14);
    ctx.fillRect(sx + 20, y - 14, 8, 14);

    // Detection range indicator (subtle)
    if (!obs.resolved && !obs.caught) {
      ctx.strokeStyle = 'rgba(200, 100, 100, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(sx + 18, y - 30, UNWANTED_NEIGHBOR_DETECT_RANGE, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Awkward chat bubble if caught
    if (obs.caught) {
      ctx.fillStyle = COLORS.speechBubble;
      drawRoundedRect(ctx, sx - 10, y - 90, 75, 28, 6);
      ctx.fill();
      ctx.fillStyle = COLORS.textDark;
      ctx.font = 'bold 13px Arial';
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
      ctx.fillText('...מה נשמע', sx + 58, y - 72);
      ctx.direction = 'ltr';
      ctx.textAlign = 'left';
    }
  }

  // ============================================================
  // SHELTERS
  // ============================================================

  drawShelter(shelter, cameraX) {
    const sx = shelter.x - cameraX;
    if (sx < -100 || sx > CANVAS_WIDTH + 100) return;
    const ctx = this.ctx;
    const y = GROUND_Y - shelter.height;

    switch (shelter.shelterType) {
      case ShelterType.REAL:
        this._drawRealShelter(ctx, sx, y, shelter);
        break;
      case ShelterType.HIDDEN:
        this._drawHiddenShelter(ctx, sx, y, shelter);
        break;
      case ShelterType.UNAUTHORIZED:
        this._drawUnauthorizedShelter(ctx, sx, y, shelter);
        break;
    }
  }

  _drawRealShelter(ctx, sx, y, shelter) {
    // Outer glow to distinguish from regular doors
    const glowPhase = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
    ctx.save();
    ctx.shadowColor = 'rgba(46, 204, 113, 0.5)';
    ctx.shadowBlur = 15 * glowPhase;

    // Door frame — thicker, green-tinted
    ctx.fillStyle = '#2a4a2a';
    ctx.fillRect(sx - 6, y - 6, shelter.width + 12, shelter.height + 6);
    ctx.restore();

    // Heavy metal door
    ctx.fillStyle = '#4a5e4a';
    ctx.fillRect(sx, y, shelter.width, shelter.height);

    // Door reinforcement lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    for (let ly = y + 15; ly < y + shelter.height - 5; ly += 20) {
      ctx.beginPath();
      ctx.moveTo(sx + 3, ly);
      ctx.lineTo(sx + shelter.width - 3, ly);
      ctx.stroke();
    }

    // Green border glow
    ctx.strokeStyle = `rgba(46, 204, 113, ${glowPhase * 0.6})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(sx - 2, y - 2, shelter.width + 4, shelter.height + 2);

    // Green light — bigger
    ctx.fillStyle = `rgba(46, 204, 113, ${glowPhase * 0.4})`;
    ctx.beginPath();
    ctx.arc(sx + shelter.width / 2, y - 14, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.shelterReal;
    ctx.beginPath();
    ctx.arc(sx + shelter.width / 2, y - 14, 6, 0, Math.PI * 2);
    ctx.fill();

    // Sign — bigger
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('מקלט', sx + shelter.width / 2, y + 28);
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';

    // Handle
    ctx.fillStyle = COLORS.metal;
    ctx.fillRect(sx + shelter.width - 12, y + shelter.height / 2 - 5, 5, 10);
  }

  _drawHiddenShelter(ctx, sx, y, shelter) {
    // Looks like a regular wall section with subtle clues
    const wallGrad = ctx.createLinearGradient(sx, y, sx, y + shelter.height);
    wallGrad.addColorStop(0, COLORS.wallMid);
    wallGrad.addColorStop(1, COLORS.wallLight);
    ctx.fillStyle = wallGrad;
    ctx.fillRect(sx, y, shelter.width, shelter.height);

    // Slightly more visible door outline
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx + 2, y + 2, shelter.width - 4, shelter.height - 2);

    // Faded sign (slightly more visible)
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('מקלט', sx + shelter.width / 2, y + 22);
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';

    // Scratch marks (clue)
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + shelter.width - 8 + i * 3, y + shelter.height - 15);
      ctx.lineTo(sx + shelter.width - 5 + i * 3, y + shelter.height - 5);
      ctx.stroke();
    }
  }

  _drawUnauthorizedShelter(ctx, sx, y, shelter) {
    // Door frame — red-tinted
    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.5;
    ctx.save();
    ctx.shadowColor = 'rgba(231, 76, 60, 0.3)';
    ctx.shadowBlur = 10 * pulse;
    ctx.fillStyle = '#4a2a2a';
    ctx.fillRect(sx - 5, y - 5, shelter.width + 10, shelter.height + 5);
    ctx.restore();

    // Rusty door
    ctx.fillStyle = '#7a5a4a';
    ctx.fillRect(sx, y, shelter.width, shelter.height);

    // Rust patches
    ctx.fillStyle = COLORS.rust;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(sx + 5, y + 20, 15, 10);
    ctx.fillRect(sx + 30, y + 50, 20, 8);
    ctx.globalAlpha = 1;

    // Red border
    ctx.strokeStyle = `rgba(231, 76, 60, ${pulse * 0.5})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 1, y - 1, shelter.width + 2, shelter.height + 1);

    // Warning tape X — thicker
    ctx.strokeStyle = COLORS.warningTape;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx + shelter.width, y + shelter.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx + shelter.width, y);
    ctx.lineTo(sx, y + shelter.height);
    ctx.stroke();

    // Red light — bigger
    ctx.fillStyle = `rgba(231, 76, 60, ${pulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(sx + shelter.width / 2, y - 14, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(231, 76, 60, ${pulse})`;
    ctx.beginPath();
    ctx.arc(sx + shelter.width / 2, y - 14, 5, 0, Math.PI * 2);
    ctx.fill();

    // Sign — bigger
    ctx.fillStyle = COLORS.danger;
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('!לא מורשה', sx + shelter.width / 2, y + 28);
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
  }

  // ============================================================
  // FLOATING TEXT
  // ============================================================

  drawFloatingTexts(texts, cameraX) {
    const ctx = this.ctx;
    for (const ft of texts) {
      const alpha = ft.getAlpha();
      if (alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 18px Arial';
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x - cameraX, ft.y);
      ctx.direction = 'ltr';
      ctx.textAlign = 'left';
      ctx.restore();
    }
  }

  // ============================================================
  // HELPER — Hebrew text
  // ============================================================

  drawHebrewText(text, x, y, font, color, align) {
    const ctx = this.ctx;
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = align || 'right';
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawText(text, x, y, font, color, align) {
    const ctx = this.ctx;
    ctx.save();
    ctx.direction = 'ltr';
    ctx.textAlign = align || 'left';
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ============================================================
  // SHELTER INDICATOR
  // ============================================================

  drawShelterIndicator(shelterScreenX) {
    const ctx = this.ctx;
    const cx = shelterScreenX + SHELTER_WIDTH / 2;
    const y = GROUND_Y - SHELTER_HEIGHT - 30;
    const pulse = Math.sin(Date.now() * 0.006) * 0.3 + 0.7;

    ctx.save();
    ctx.globalAlpha = pulse;

    // Glowing circle
    const glow = ctx.createRadialGradient(cx, y, 5, cx, y, 35);
    glow.addColorStop(0, 'rgba(46, 204, 113, 0.4)');
    glow.addColorStop(1, 'rgba(46, 204, 113, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, y, 35, 0, Math.PI * 2);
    ctx.fill();

    // Arrow pointing down
    ctx.fillStyle = COLORS.success;
    ctx.beginPath();
    ctx.moveTo(cx, y + 20);
    ctx.lineTo(cx - 10, y + 8);
    ctx.lineTo(cx + 10, y + 8);
    ctx.closePath();
    ctx.fill();

    // "↵" label
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('\u21b5', cx, y + 3);
    ctx.textAlign = 'left';

    ctx.restore();
  }
}

// ============================================================
// SkyEffects — Missiles, Interceptions & Explosions
// ============================================================

class SkyEffects {
  constructor() {
    this.missiles = [];
    this.interceptions = [];
    this.explosions = [];
    this._spawnTimer = 1;
    this._explosionSound = new ExplosionSound();
  }

  update(dt) {
    // Spawn missiles
    this._spawnTimer -= dt;
    if (this._spawnTimer <= 0 && this.missiles.length < MAX_ACTIVE_MISSILES) {
      this._spawnMissile();
      this._spawnTimer = randomFloat(MISSILE_SPAWN_INTERVAL_MIN, MISSILE_SPAWN_INTERVAL_MAX);
    }

    // Update missiles
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt;

      if (!m.intercepted && m.life < m.interceptTime) {
        m.intercepted = true;
        this._spawnInterception(m);
      }

      if (m.life <= 0 || m.x < -50 || m.x > CANVAS_WIDTH + 50) {
        this.missiles.splice(i, 1);
      }
    }

    // Update interceptions
    for (let i = this.interceptions.length - 1; i >= 0; i--) {
      const ic = this.interceptions[i];
      ic.x += ic.vx * dt;
      ic.y += ic.vy * dt;
      ic.life -= dt;

      const dist = Math.sqrt((ic.x - ic.tx) ** 2 + (ic.y - ic.ty) ** 2);
      if (dist < 20 || ic.life <= 0) {
        this._spawnExplosion(ic.x, ic.y);
        this._explosionSound.play();
        this.interceptions.splice(i, 1);
      }
    }

    // Update explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const ex = this.explosions[i];
      ex.life -= dt;
      ex.radius += 70 * dt;
      if (ex.life <= 0) {
        this.explosions.splice(i, 1);
      }
    }
  }

  _spawnMissile() {
    const fromLeft = Math.random() > 0.5;
    const x = fromLeft ? -20 : CANVAS_WIDTH + 20;
    const y = 10 + Math.random() * 100;
    const targetX = fromLeft ? CANVAS_WIDTH * (0.3 + Math.random() * 0.5) : CANVAS_WIDTH * (0.1 + Math.random() * 0.5);
    const targetY = 40 + Math.random() * 120;
    const angle = Math.atan2(targetY - y, targetX - x);
    const totalLife = 3 + Math.random() * 2;

    this.missiles.push({
      x, y,
      vx: Math.cos(angle) * MISSILE_SPEED,
      vy: Math.sin(angle) * MISSILE_SPEED * 0.3,
      life: totalLife,
      interceptTime: totalLife * (0.3 + Math.random() * 0.4),
      intercepted: false,
    });
  }

  _spawnInterception(missile) {
    const startX = CANVAS_WIDTH * (0.5 + Math.random() * 0.4);
    const startY = CANVAS_HEIGHT * 0.55;
    const targetX = missile.x + missile.vx * 0.5;
    const targetY = missile.y + missile.vy * 0.5;
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const speed = 220;

    this.interceptions.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      tx: targetX, ty: targetY,
      life: 2,
    });
  }

  _spawnExplosion(x, y) {
    this.explosions.push({
      x, y,
      radius: 5,
      life: EXPLOSION_DURATION,
      maxLife: EXPLOSION_DURATION,
    });
  }

  draw(ctx) {
    // Missile trails — BIGGER
    for (const m of this.missiles) {
      ctx.save();
      const trailLen = 45;
      const trailDir = m.vx > 0 ? trailLen : -trailLen;
      const grad = ctx.createLinearGradient(
        m.x - trailDir, m.y, m.x, m.y
      );
      grad.addColorStop(0, 'rgba(255, 150, 50, 0)');
      grad.addColorStop(1, 'rgba(255, 200, 80, 0.8)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(m.x - trailDir, m.y - m.vy / Math.abs(m.vx) * trailLen);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      // Glow
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Head — bigger
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Interception streaks — BIGGER
    for (const ic of this.interceptions) {
      ctx.save();
      const grad = ctx.createLinearGradient(
        ic.x - ic.vx * 0.15, ic.y - ic.vy * 0.15,
        ic.x, ic.y
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ic.x - ic.vx * 0.2, ic.y - ic.vy * 0.2);
      ctx.lineTo(ic.x, ic.y);
      ctx.stroke();

      // Smoke puffs along trail
      ctx.fillStyle = 'rgba(200, 200, 200, 0.15)';
      for (let p = 0; p < 3; p++) {
        const px = ic.x - ic.vx * 0.05 * (p + 1);
        const py = ic.y - ic.vy * 0.05 * (p + 1);
        ctx.beginPath();
        ctx.arc(px, py, 3 + p * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head
      ctx.fillStyle = 'rgba(255, 255, 220, 0.95)';
      ctx.beginPath();
      ctx.arc(ic.x, ic.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Explosions — BIGGER
    for (const ex of this.explosions) {
      ctx.save();
      const progress = 1 - (ex.life / ex.maxLife);

      // Bright flash
      if (progress < 0.15) {
        const flash = 1 - progress / 0.15;
        ctx.globalAlpha = flash * 0.8;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fire ball
      ctx.globalAlpha = (1 - progress) * 0.85;
      const fireGrad = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, ex.radius);
      fireGrad.addColorStop(0, `rgba(255, 240, 100, ${1 - progress})`);
      fireGrad.addColorStop(0.3, `rgba(255, 160, 40, ${(1 - progress) * 0.8})`);
      fireGrad.addColorStop(0.6, `rgba(200, 60, 20, ${(1 - progress) * 0.5})`);
      fireGrad.addColorStop(1, 'rgba(80, 20, 5, 0)');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
      ctx.fill();

      // Sparks
      if (progress < 0.5) {
        ctx.fillStyle = `rgba(255, 200, 50, ${(1 - progress * 2) * 0.6})`;
        for (let s = 0; s < 6; s++) {
          const angle = (s / 6) * Math.PI * 2 + progress * 3;
          const sparkDist = ex.radius * (0.8 + progress * 0.5);
          const sparkX = ex.x + Math.cos(angle) * sparkDist;
          const sparkY = ex.y + Math.sin(angle) * sparkDist;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }
}
