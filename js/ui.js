// ============================================================
// UI — Screens & HUD
// ============================================================

class UI {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
    this.menuHoverChar = null;
    this.messageTimer = 0;
    this.currentMessage = '';
  }

  // ============================================================
  // MENU SCREEN
  // ============================================================

  drawMenu(skyEffects) {
    const ctx = this.ctx;

    // Dark atmospheric background
    this.renderer.drawSky();
    if (skyEffects) skyEffects.draw(ctx);
    this.renderer.drawDistantBuildings(0);
    this.renderer.drawMidgroundBuildings(0);

    // Dark overlay
    ctx.fillStyle = 'rgba(15, 12, 10, 0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 84px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(STRINGS.gameTitle, CANVAS_WIDTH / 2, 180);

    // Subtitle
    ctx.font = '30px Arial';
    ctx.fillStyle = COLORS.textSecondary;
    ctx.direction = 'ltr';
    ctx.fillText(STRINGS.gameSubtitle, CANVAS_WIDTH / 2, 220);

    // Pulsing start button
    const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 0.9;
    const btnW = 240;
    const btnH = 56;
    const btnX = CANVAS_WIDTH / 2 - btnW / 2;
    const btnY = 300;

    ctx.fillStyle = `rgba(46, 204, 113, ${pulse * 0.8})`;
    drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 10);
    ctx.fill();
    ctx.strokeStyle = COLORS.success;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(STRINGS.startButton, CANVAS_WIDTH / 2, btnY + 38);

    // Controls hint
    ctx.font = '18px Arial';
    ctx.fillStyle = COLORS.textSecondary;
    ctx.fillText(STRINGS.controls, CANVAS_WIDTH / 2, 430);

    ctx.textAlign = 'left';
    ctx.direction = 'ltr';

    this.renderer.drawVignette();
  }

  getMenuStartBounds() {
    return { x: CANVAS_WIDTH / 2 - 100, y: 300, width: 200, height: 50 };
  }

  // ============================================================
  // INSTRUCTIONS SCREEN
  // ============================================================

  // --- Instructions Page 1: Controls & Goal ---
  drawInstructions(skyEffects) {
    const ctx = this.ctx;
    this._drawInstructionsBg(ctx, skyEffects);

    // Title
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('?איך משחקים', CANVAS_WIDTH / 2, 60);
    ctx.direction = 'ltr';

    // Controls — centered, big and clear
    const cx = CANVAS_WIDTH / 2;
    let y = 120;

    ctx.fillStyle = COLORS.success;
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('שליטה', cx, y);
    ctx.direction = 'ltr';
    y += 50;

    // Arrow keys
    this._drawKeyIcon(ctx, cx - 55, y - 18, 60, 34, '← →');
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = '22px Arial';
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    ctx.fillText('חיצים: תנועה', cx + 160, y + 2);
    ctx.direction = 'ltr';
    y += 55;

    // Space
    this._drawKeyIcon(ctx, cx - 55, y - 18, 90, 34, 'SPACE');
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = '22px Arial';
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    ctx.fillText('רווח: קפיצה', cx + 160, y + 2);
    ctx.direction = 'ltr';
    y += 55;

    // Enter
    this._drawKeyIcon(ctx, cx - 55, y - 18, 80, 34, 'ENTER');
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = '22px Arial';
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    ctx.fillText('אנטר: כניסה למקלט', cx + 160, y + 2);
    ctx.direction = 'ltr';
    y += 60;

    // Speed warning
    ctx.fillStyle = COLORS.warning;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('!זהירות: ריצה מהירה מדי גורמת למעידות', cx, y);
    ctx.direction = 'ltr';
    y += 50;

    // Goal
    ctx.fillStyle = COLORS.warning;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('!המטרה: להגיע למקלט לפני שהזמן נגמר', cx, y);
    ctx.direction = 'ltr';

    // Continue
    this._drawContinuePrompt(ctx, '(1/2) לחצו להמשיך');
    ctx.textAlign = 'left';
    this.renderer.drawVignette();
  }

  // --- Instructions Page 2: Obstacles & Shelters ---
  drawInstructions2(skyEffects) {
    const ctx = this.ctx;
    this._drawInstructionsBg(ctx, skyEffects);

    // === Obstacles ===
    ctx.fillStyle = COLORS.danger;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('מכשולים', CANVAS_WIDTH / 2, 55);
    ctx.direction = 'ltr';

    const obstacles = [
      { icon: 'stroller', text: 'עגלת תינוק — קפוץ מעליה' },
      { icon: 'wet', text: '!רצפה רטובה — מחליקים' },
      { icon: 'old', text: 'שכן זקן — לחץ Space לברוח' },
      { icon: 'homeless', text: 'דייר ברחוב — חוסם מעבר' },
      { icon: 'unwanted', text: 'שכנה מציקה — מאטה אותך' },
    ];

    let oy = 90;
    for (const obs of obstacles) {
      this._drawObstacleIcon(ctx, CANVAS_WIDTH / 2 - 150, oy - 8, obs.icon);
      ctx.fillStyle = COLORS.textPrimary;
      ctx.font = '20px Arial';
      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.fillText(obs.text, CANVAS_WIDTH / 2 + 200, oy + 6);
      ctx.direction = 'ltr';
      oy += 38;
    }

    // === Shelters ===
    const shelterY = oy + 20;

    ctx.fillStyle = '#5dade2';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('מקלטים', CANVAS_WIDTH / 2, shelterY);
    ctx.direction = 'ltr';

    const shelterTypes = [
      { x: CANVAS_WIDTH / 2 - 280, color: COLORS.success, glow: 'rgba(46,204,113,0.3)', label: '!מקלט אמיתי — היכנס', sign: 'מקלט' },
      { x: CANVAS_WIDTH / 2 - 30, color: COLORS.danger, glow: 'rgba(231,76,60,0.3)', label: '!לא מורשה — קנס זמן', sign: '!לא מורשה' },
      { x: CANVAS_WIDTH / 2 + 220, color: COLORS.textSecondary, glow: 'rgba(200,200,200,0.1)', label: '!מוסתר — שימו לב', sign: '???' },
    ];

    for (const s of shelterTypes) {
      this._drawMiniShelterDoor(ctx, s.x, shelterY + 18, s.color, s.glow, s.sign);
      ctx.fillStyle = COLORS.textPrimary;
      ctx.font = '15px Arial';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(s.label, s.x + 25, shelterY + 100);
      ctx.direction = 'ltr';
    }

    // Continue
    this._drawContinuePrompt(ctx, '(2/2) לחצו להתחיל');
    ctx.textAlign = 'left';
    this.renderer.drawVignette();
  }

  _drawInstructionsBg(ctx, skyEffects) {
    this.renderer.drawSky();
    if (skyEffects) skyEffects.draw(ctx);
    this.renderer.drawDistantBuildings(0);
    this.renderer.drawMidgroundBuildings(0);
    ctx.fillStyle = 'rgba(15, 12, 10, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  _drawContinuePrompt(ctx, text) {
    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
    ctx.direction = 'ltr';
    ctx.globalAlpha = 1;
  }

  _drawKeyIcon(ctx, x, y, w, h, label) {
    ctx.save();
    // Key background
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    drawRoundedRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Key label
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 5);
    ctx.restore();
  }

  _drawObstacleIcon(ctx, x, y, type) {
    ctx.save();
    switch (type) {
      case 'stroller':
        // Mini stroller
        ctx.fillStyle = COLORS.stroller;
        ctx.fillRect(x, y, 18, 12);
        ctx.fillStyle = COLORS.strollerWheel;
        ctx.beginPath();
        ctx.arc(x + 4, y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 14, y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'wet':
        // Wavy water lines
        ctx.strokeStyle = COLORS.wetFloor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 5);
        ctx.quadraticCurveTo(x + 5, y, x + 10, y + 5);
        ctx.quadraticCurveTo(x + 15, y + 10, x + 20, y + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 12);
        ctx.quadraticCurveTo(x + 7, y + 7, x + 12, y + 12);
        ctx.quadraticCurveTo(x + 17, y + 17, x + 22, y + 12);
        ctx.stroke();
        break;
      case 'old':
        // Small person with cane
        ctx.fillStyle = COLORS.neighbor;
        ctx.beginPath();
        ctx.arc(x + 8, y + 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + 5, y + 7, 6, 12);
        ctx.strokeStyle = '#8a7a6a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 5);
        ctx.lineTo(x + 16, y + 20);
        ctx.stroke();
        break;
      case 'homeless':
        // Cardboard box
        ctx.fillStyle = '#8a7a5a';
        ctx.fillRect(x, y + 2, 22, 16);
        ctx.strokeStyle = '#6a5a4a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y + 2, 22, 16);
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + 22, y + 10);
        ctx.stroke();
        break;
      case 'unwanted':
        // Chat bubble person
        ctx.fillStyle = COLORS.neighbor;
        ctx.beginPath();
        ctx.arc(x + 8, y + 3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + 5, y + 8, 6, 10);
        // Speech bubble
        ctx.fillStyle = COLORS.speechBubble;
        ctx.beginPath();
        ctx.arc(x + 20, y + 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#666';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('...', x + 20, y + 5);
        break;
    }
    ctx.restore();
  }

  _drawMiniShelterDoor(ctx, x, y, color, glow, sign) {
    ctx.save();
    const w = 50;
    const h = 65;

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Door frame
    ctx.fillStyle = COLORS.doorFrame;
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);

    ctx.shadowBlur = 0;

    // Door
    ctx.fillStyle = COLORS.door;
    ctx.fillRect(x, y, w, h);

    // Color border
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Light indicator
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + w / 2, y - 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Sign
    ctx.fillStyle = color;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(sign, x + w / 2, y + h + 15);
    ctx.direction = 'ltr';

    ctx.restore();
  }

  // ============================================================
  // CHARACTER SELECT
  // ============================================================

  drawCharacterSelect() {
    const ctx = this.ctx;

    // Background
    this.renderer.drawSky();
    this.renderer.drawDistantBuildings(0);
    ctx.fillStyle = 'rgba(15, 12, 10, 0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(STRINGS.selectCharacter, CANVAS_WIDTH / 2, 80);

    // Male character
    const maleX = CANVAS_WIDTH / 2 - 160;
    const charY = 160;
    this._drawCharacterCard(maleX, charY, CHARACTERS.male, this.menuHoverChar === 'male');

    // Female character
    const femaleX = CANVAS_WIDTH / 2 + 40;
    this._drawCharacterCard(femaleX, charY, CHARACTERS.female, this.menuHoverChar === 'female');

    // Keyboard hints
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click a character or press 1 / 2', CANVAS_WIDTH / 2, 420);

    ctx.textAlign = 'left';
    this.renderer.drawVignette();
  }

  _drawCharacterCard(x, y, charDef, hover) {
    const ctx = this.ctx;
    const w = 120;
    const h = 200;

    // Card background
    ctx.fillStyle = hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)';
    drawRoundedRect(ctx, x, y, w, h, 10);
    ctx.fill();
    if (hover) {
      ctx.strokeStyle = COLORS.success;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw character preview
    CharacterRenderer.drawPlayer(ctx, x + w / 2 - PLAYER_WIDTH / 2, y + 30, charDef, 'running', Date.now() * 0.001, 1);

    // Name
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(charDef.name, x + w / 2, y + h - 28);
    ctx.direction = 'ltr';

    ctx.textAlign = 'left';
  }

  getMaleCardBounds() {
    return { x: CANVAS_WIDTH / 2 - 160, y: 160, width: 120, height: 200 };
  }

  getFemaleCardBounds() {
    return { x: CANVAS_WIDTH / 2 + 40, y: 160, width: 120, height: 200 };
  }

  // ============================================================
  // HUD
  // ============================================================

  drawHUD(timer, currentFloor, player) {
    const ctx = this.ctx;

    // Top bar background
    ctx.fillStyle = COLORS.hudBg;
    drawRoundedRect(ctx, 10, 6, CANVAS_WIDTH - 20, 48, 8);
    ctx.fill();

    // Timer
    const timerColor = timer.isCritical() ? COLORS.danger :
                       timer.isLow() ? COLORS.warning : COLORS.textPrimary;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = timerColor;

    // Pulse effect when critical
    if (timer.isCritical()) {
      const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
    }
    // Penalty flash
    if (timer.penaltyFlash > 0) {
      ctx.fillStyle = COLORS.danger;
    }
    ctx.fillText(`${STRINGS.timerLabel}  ${timer.getFormatted()}`, 25, 38);
    ctx.globalAlpha = 1;

    // Floor indicator
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = COLORS.textSecondary;
    ctx.textAlign = 'center';
    ctx.fillText(`${STRINGS.floorLabel} ${FLOOR_COUNT - currentFloor}`, CANVAS_WIDTH / 2, 38);

    // Speed bar
    const barX = CANVAS_WIDTH - 200;
    const barY = 20;
    const barW = 130;
    const barH = 12;
    const speedRatio = player.speed / PLAYER_MAX_SPEED;

    // Bar background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    drawRoundedRect(ctx, barX, barY, barW, barH, 4);
    ctx.fill();

    // Optimal zone indicator
    const optMinRatio = PLAYER_OPTIMAL_SPEED_MIN / PLAYER_MAX_SPEED;
    const optMaxRatio = PLAYER_OPTIMAL_SPEED_MAX / PLAYER_MAX_SPEED;
    ctx.fillStyle = 'rgba(106, 176, 76, 0.2)';
    ctx.fillRect(barX + barW * optMinRatio, barY, barW * (optMaxRatio - optMinRatio), barH);

    // Speed fill
    const zone = player.getSpeedZone();
    const fillColor = zone === 'optimal' ? COLORS.speedGreen :
                      zone === 'fast' ? COLORS.speedRed : COLORS.speedYellow;
    ctx.fillStyle = fillColor;
    if (speedRatio > 0.01) {
      drawRoundedRect(ctx, barX, barY, barW * speedRatio, barH, 4);
      ctx.fill();
    }

    // Label
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = COLORS.textSecondary;
    ctx.textAlign = 'right';
    ctx.fillText(STRINGS.speedLabel, barX - 5, barY + 11);

    ctx.textAlign = 'left';


    // Message display — large, at top below HUD bar
    if (this.messageTimer > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(this.messageTimer / 0.5, 0, 1);

      // Background strip for readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 250, 58, 500, 40, 8);
      ctx.fill();

      ctx.fillStyle = COLORS.warning;
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(this.currentMessage, CANVAS_WIDTH / 2, 86);
      ctx.direction = 'ltr';
      ctx.textAlign = 'left';
      ctx.restore();
    }
  }

  showMessage(text, duration) {
    this.currentMessage = text;
    this.messageTimer = duration || 2;
  }

  updateMessages(dt) {
    if (this.messageTimer > 0) this.messageTimer -= dt;
  }

  setShelterNearby(nearby) {
    this._shelterNearby = nearby;
  }

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  drawSuccess(timer, charDef, sheltersFound) {
    const ctx = this.ctx;

    // Green tinted overlay
    ctx.fillStyle = 'rgba(10, 30, 15, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Success glow
    const glowGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 20,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 300
    );
    glowGrad.addColorStop(0, 'rgba(46, 204, 113, 0.15)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = COLORS.success;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(STRINGS.successTitle, CANVAS_WIDTH / 2, 180);
    ctx.direction = 'ltr';

    // Subtitle
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '26px Arial';
    ctx.fillText(STRINGS.successSubtitle, CANVAS_WIDTH / 2, 225);

    // Score — shelters found
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 36px Arial';
    ctx.direction = 'rtl';
    ctx.fillText(`${sheltersFound || 0} :מקלטים`, CANVAS_WIDTH / 2, 270);
    ctx.direction = 'ltr';

    // Character celebration
    if (charDef) {
      CharacterRenderer.drawPlayer(ctx, CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, 290, charDef, 'running', Date.now() * 0.001, 1);
    }

    // Retry button
    this._drawRetryButton(380);

    ctx.textAlign = 'left';
    this.renderer.drawVignette();
  }

  // ============================================================
  // FAILURE SCREEN
  // ============================================================

  drawFailure(failureMessage, charDef) {
    const ctx = this.ctx;

    // Red tinted overlay
    ctx.fillStyle = 'rgba(30, 10, 10, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Red glow
    const glowGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 20,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 300
    );
    glowGrad.addColorStop(0, 'rgba(231, 76, 60, 0.12)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = COLORS.danger;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(STRINGS.failureTitle, CANVAS_WIDTH / 2, 170);
    ctx.direction = 'ltr';

    // Funny message
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '24px Arial';
    ctx.direction = 'rtl';
    ctx.fillText(failureMessage, CANVAS_WIDTH / 2, 230);
    ctx.direction = 'ltr';

    // Character collapse
    if (charDef) {
      CharacterRenderer.drawPlayer(ctx, CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, 270, charDef, 'slipping', 0, 1);
    }

    // Retry button
    this._drawRetryButton(380);

    ctx.textAlign = 'left';
    this.renderer.drawVignette();
  }

  _drawRetryButton(y) {
    const ctx = this.ctx;
    const btnW = 180;
    const btnH = 45;
    const btnX = CANVAS_WIDTH / 2 - btnW / 2;

    const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 0.9;
    ctx.fillStyle = `rgba(200, 200, 200, ${pulse * 0.15})`;
    drawRoundedRect(ctx, btnX, y, btnW, btnH, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.textSecondary;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(STRINGS.retryButton, CANVAS_WIDTH / 2, y + 30);
  }

  getRetryBounds() {
    return { x: CANVAS_WIDTH / 2 - 90, y: 380, width: 180, height: 45 };
  }

  // ============================================================
  // DIRECTION ARROW
  // ============================================================

  drawDirectionArrow(dir, timer) {
    const ctx = this.ctx;
    const alpha = Math.min(timer / 0.5, 1); // fade out in last 0.5s
    const bounce = Math.sin(Date.now() * 0.006) * 12;
    const cx = dir > 0 ? CANVAS_WIDTH - 80 + bounce : 80 - bounce;
    const cy = CANVAS_HEIGHT / 2;

    ctx.save();
    ctx.globalAlpha = alpha * 0.85;

    // Arrow background circle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();

    // Arrow
    ctx.fillStyle = COLORS.warning;
    ctx.beginPath();
    if (dir > 0) {
      // Right arrow →
      ctx.moveTo(cx + 20, cy);
      ctx.lineTo(cx - 8, cy - 18);
      ctx.lineTo(cx - 8, cy - 8);
      ctx.lineTo(cx - 20, cy - 8);
      ctx.lineTo(cx - 20, cy + 8);
      ctx.lineTo(cx - 8, cy + 8);
      ctx.lineTo(cx - 8, cy + 18);
    } else {
      // Left arrow ←
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx + 8, cy - 18);
      ctx.lineTo(cx + 8, cy - 8);
      ctx.lineTo(cx + 20, cy - 8);
      ctx.lineTo(cx + 20, cy + 8);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.lineTo(cx + 8, cy + 18);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ============================================================
  // QUIZ SCREEN
  // ============================================================

  drawQuiz(question, options, wrongTimer, timer) {
    const ctx = this.ctx;

    // Dark overlay
    ctx.fillStyle = 'rgba(10, 10, 20, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Red flash overlay on wrong answer
    if (wrongTimer > 0) {
      const flashAlpha = wrongTimer * 0.4;
      ctx.fillStyle = `rgba(231, 76, 60, ${flashAlpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Shake offset if wrong answer
    const shakeX = wrongTimer > 0 ? Math.sin(Date.now() * 0.05) * 8 : 0;
    const shakeY = wrongTimer > 0 ? Math.cos(Date.now() * 0.07) * 5 : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Timer in corner
    if (timer) {
      const timerColor = timer.isCritical() ? COLORS.danger :
                         timer.isLow() ? COLORS.warning : COLORS.textPrimary;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = timerColor;
      if (timer.isCritical()) {
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
      }
      ctx.fillText(`${STRINGS.timerLabel}  ${timer.getFormatted()}`, 25, 38);
      ctx.globalAlpha = 1;
    }

    // Title label
    ctx.fillStyle = COLORS.warning;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('!הוכח שאתה ישראלי', CANVAS_WIDTH / 2, 80);
    ctx.direction = 'ltr';

    // Question
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(question, CANVAS_WIDTH / 2, 140);
    ctx.direction = 'ltr';

    // Two option buttons
    const btnW = 400;
    const btnH = 70;
    const gap = 30;
    const startY = 200;

    for (let i = 0; i < 2; i++) {
      const bounds = this.getQuizOptionBounds(i);

      // Button background
      ctx.fillStyle = wrongTimer > 0 && !options[i].isCorrect
        ? 'rgba(231, 76, 60, 0.15)'
        : 'rgba(255, 255, 255, 0.08)';
      drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, 12);
      ctx.fill();

      // Border
      ctx.strokeStyle = wrongTimer > 0 && !options[i].isCorrect
        ? COLORS.danger
        : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Number badge
      ctx.fillStyle = COLORS.warning;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, bounds.x + 25, bounds.y + bounds.height / 2 + 7);

      // Option text
      ctx.fillStyle = COLORS.textPrimary;
      ctx.font = '22px Arial';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(options[i].text, bounds.x + bounds.width / 2 + 10, bounds.y + bounds.height / 2 + 8);
      ctx.direction = 'ltr';
    }

    // Wrong answer feedback
    if (wrongTimer > 0) {
      ctx.fillStyle = COLORS.danger;
      ctx.font = 'bold 26px Arial';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText('!לא ישראלי מספיק, נסה שוב', CANVAS_WIDTH / 2, startY + (btnH + gap) * 2 + 30);
      ctx.direction = 'ltr';
    }

    // Hint
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('לחצו על התשובה או הקישו 1 / 2', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);

    ctx.restore();

    this.renderer.drawVignette();
  }

  getQuizOptionBounds(index) {
    const btnW = 400;
    const btnH = 70;
    const gap = 30;
    const startY = 200;
    const x = CANVAS_WIDTH / 2 - btnW / 2;
    const y = startY + index * (btnH + gap);
    return { x, y, width: btnW, height: btnH };
  }

  // ============================================================
  // SHELTER CHOICE SCREEN (end of last floor)
  // ============================================================

  drawShelterChoice(shelters, cameraX, timer) {
    const ctx = this.ctx;

    // Urgent flashing overlay
    if (timer.isCritical()) {
      const flash = Math.sin(Date.now() * 0.008) * 0.08;
      ctx.fillStyle = `rgba(231, 76, 60, ${Math.abs(flash)})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // "Choose a shelter!" text — large and readable at top
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 200, 58, 400, 42, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.warning;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('!בחר מקלט', CANVAS_WIDTH / 2, 90);
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.restore();
  }
}
