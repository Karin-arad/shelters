// ============================================================
// Game — State Machine & Game Loop
// ============================================================

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new InputManager();
    this.ui = new UI(this.renderer);
    this.siren = new SirenSound();
    this.skyEffects = new SkyEffects();
    this.footstepSound = new FootstepSound();
    this.stumbleSound = new StumbleSound();
    this.doorSound = new DoorSound();
    this.state = GameState.MENU;

    this.player = null;
    this.level = null;
    this.timer = null;
    this.selectedChar = null;
    this.failureMessage = '';
    this.stairwellProgress = 0;
    this.stairwellTimer = 0;
    this.stairwellEvent = null;

    this.lastTime = 0;

    // Touch controls (mobile)
    this.touchControls = new TouchControls(canvas, this.input);

    // Click handler
    canvas.addEventListener('click', (e) => this._handleClick(e));
    canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
  }

  // ============================================================
  // STATE TRANSITIONS
  // ============================================================

  _showInstructions() {
    this.state = GameState.INSTRUCTIONS;
  }

  _startCharacterSelect() {
    this.state = GameState.SELECT;
  }

  _startGame(charDef) {
    this.selectedChar = charDef;
    this.level = new Level();
    const floor = this.level.getCurrentFloor();
    const startX = floor.direction > 0 ? 80 : floor.hallwayLength - 80;
    this.player = new Player(startX, GROUND_Y - PLAYER_HEIGHT, charDef);
    this.player.direction = floor.direction;
    this.timer = new GameTimer(GAME_DURATION);
    this.timer.start();
    this.siren.start();
    this.footstepSound.reset();
    // Start with stairwell descent before first hallway
    this.isInitialStairwell = true;
    this._enterStairwell();
  }

  _enterStairwell() {
    this.state = GameState.STAIRWELL;
    this.stairwellProgress = 0;
    this.stairwellTimer = 1.2;
    // Pick a random stairwell event
    const events = ['neighbor', 'dog', 'flicker', 'yell'];
    this.stairwellEvent = {
      type: randomChoice(events),
      message: randomChoice(STRINGS.stairwellMessages),
      triggered: false,
    };
    // Clear flag for non-initial stairwells
    if (!this.isInitialStairwell) {
      this.isInitialStairwell = false;
    }
  }

  _triggerSuccess() {
    this.state = GameState.SUCCESS;
    this.timer.stop();
    this.siren.stop();
  }

  _triggerFailure(message) {
    this.failureMessage = message || randomChoice(STRINGS.failureMessages);
    this.state = GameState.FAILURE;
    this.timer.stop();
    this.siren.stop();
  }

  // ============================================================
  // UPDATE
  // ============================================================

  update(dt) {
    ScreenShake.update(dt);
    this.ui.updateMessages(dt);
    this.skyEffects.update(dt);

    switch (this.state) {
      case GameState.MENU:
        if (this.input.isJustPressed('Space') || this.input.isJustPressed('Enter')) {
          this._showInstructions();
        }
        break;

      case GameState.INSTRUCTIONS:
        if (this.input.isJustPressed('Space') || this.input.isJustPressed('Enter')) {
          this.state = GameState.INSTRUCTIONS2;
        }
        break;

      case GameState.INSTRUCTIONS2:
        if (this.input.isJustPressed('Space') || this.input.isJustPressed('Enter')) {
          this._startCharacterSelect();
        }
        break;

      case GameState.SELECT:
        // Keyboard shortcuts: 1 = male, 2 = female
        if (this.input.isJustPressed('Digit1') || this.input.isJustPressed('Numpad1')) {
          this._startGame(CHARACTERS.male);
        } else if (this.input.isJustPressed('Digit2') || this.input.isJustPressed('Numpad2')) {
          this._startGame(CHARACTERS.female);
        }
        break;

      case GameState.PLAYING:
        this._updatePlaying(dt);
        break;

      case GameState.STAIRWELL:
        this._updateStairwell(dt);
        break;

      case GameState.SUCCESS:
      case GameState.FAILURE:
        if (this.input.isJustPressed('Space') || this.input.isJustPressed('Enter')) {
          this.state = GameState.MENU;
        }
        break;
    }

    this.input.update();
  }

  _updatePlaying(dt) {
    // Timer
    this.timer.update(dt);
    if (this.timer.isExpired()) {
      this._triggerFailure();
      return;
    }

    // Player
    const tripped = this.player.update(this.input, dt);
    if (tripped) {
      const msg = randomChoice(STRINGS.tripMessages);
      this.level.addFloatingText(msg, this.player.getCenterX(), this.player.y - 10, COLORS.danger);
      this.timer.addPenalty(1.5);
      this.stumbleSound.play();
    }

    // Footstep sounds
    this.footstepSound.update(this.player.speed, this.player.isMoving, this.player.isGrounded, dt);

    // Level (camera, floor end check)
    const levelResult = this.level.update(this.player, dt);
    if (levelResult === 'end_of_hallway') {
      this._enterStairwell();
      return;
    }

    // Obstacles
    const floor = this.level.getCurrentFloor();
    for (const obs of floor.obstacles) {
      if (!obs.active || obs.resolved) continue;
      const result = obs.update(this.player, this.input, this.timer);
      if (result) {
        if (result.text) {
          this.ui.showMessage(result.text, 2);
          this.level.addFloatingText(result.text, this.player.getCenterX(), this.player.y - 20, COLORS.warning);
        }
      }
    }

    // Shelters
    let nearShelter = false;
    this._nearbyShelterX = null;
    for (const shelter of floor.shelters) {
      if (!shelter.active || shelter.entered) continue;

      // Magnetic slowdown near shelters
      const dist = Math.abs(this.player.getCenterX() - (shelter.x + shelter.width / 2));
      if (dist < SHELTER_SLOWDOWN_RANGE && this.player.state === 'running') {
        this.player.speed *= SHELTER_SLOWDOWN_FACTOR;
      }

      const result = shelter.checkEntry(this.player, this.input);
      if (result === 'success') {
        this.doorSound.play();
        this._triggerSuccess();
        return;
      } else if (result === 'unauthorized') {
        this.doorSound.play();
        this.timer.addPenalty(UNAUTHORIZED_PENALTY);
        this.ui.showMessage(STRINGS.shelterWrong, 2);
        this.level.addFloatingText(STRINGS.shelterWrong, shelter.x + 35, shelter.y - 20, COLORS.danger);
        ScreenShake.trigger(5, 0.3);
        this.player.x -= this.player.direction * 60;
        this.player.speed = 0;
        shelter.active = false;
      } else if (result === 'nearby') {
        nearShelter = true;
        this._nearbyShelterX = shelter.x - this.level.cameraX;
      }
    }
    this.ui.setShelterNearby(nearShelter);

    // Speed damage — hitting background NPCs
    if (this.player.speed > NPC_HIT_SPEED_THRESHOLD && this.player.state === 'running' && this.player.stumbleImmunity <= 0) {
      for (const npc of this.level.backgroundNPCs) {
        if (npc.floorIndex !== this.level.currentFloor) continue;
        const npcDist = Math.abs(this.player.getCenterX() - npc.x);
        if (npcDist < 25) {
          this.player.triggerStumble(1.0);
          this.timer.addPenalty(NPC_HIT_TIME_PENALTY);
          this.stumbleSound.play();
          const msg = randomChoice(STRINGS.hitNpcMessages);
          this.level.addFloatingText(msg, this.player.getCenterX(), this.player.y - 20, COLORS.danger);
          this.ui.showMessage(msg, 2);
          // Move the NPC out of the way
          npc.x += npc.direction * 100;
          break;
        }
      }
    }
  }

  _updateStairwell(dt) {
    this.timer.update(dt);
    if (this.timer.isExpired()) {
      this._triggerFailure();
      return;
    }

    this.stairwellTimer -= dt;
    this.stairwellProgress = 1 - (this.stairwellTimer / 1.2);

    if (this.stairwellTimer <= 0) {
      if (this.isInitialStairwell) {
        // Initial stairwell: player is already on floor 0, just start playing
        this.isInitialStairwell = false;
        this.state = GameState.PLAYING;
      } else {
        const hasMore = this.level.advanceFloor(this.player);
        if (!hasMore) {
          this._triggerFailure();
        } else {
          this.state = GameState.PLAYING;
        }
      }
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  render() {
    const ctx = this.renderer.ctx;

    // Apply screen shake
    const shake = ScreenShake.getOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    this.renderer.clear();

    switch (this.state) {
      case GameState.MENU:
        this.ui.drawMenu(this.skyEffects);
        break;

      case GameState.INSTRUCTIONS:
        this.ui.drawInstructions(this.skyEffects);
        break;

      case GameState.INSTRUCTIONS2:
        this.ui.drawInstructions2(this.skyEffects);
        break;

      case GameState.SELECT:
        this.ui.drawCharacterSelect();
        break;

      case GameState.PLAYING:
        this._renderPlaying();
        break;

      case GameState.STAIRWELL:
        this.renderer.drawStairwell(this.stairwellProgress, this.stairwellEvent, this.selectedChar);
        this.ui.drawHUD(this.timer, this.level.currentFloor, this.player);
        break;

      case GameState.SUCCESS:
        this.ui.drawSuccess(this.timer, this.selectedChar);
        break;

      case GameState.FAILURE:
        this.ui.drawFailure(this.failureMessage, this.selectedChar);
        break;
    }

    ctx.restore();
  }

  _renderPlaying() {
    const cameraX = this.level.cameraX;
    const floor = this.level.getCurrentFloor();

    // Background layers
    this.renderer.drawSky();
    this.skyEffects.draw(this.renderer.ctx);
    this.renderer.drawDistantBuildings(cameraX);
    this.renderer.drawMidgroundBuildings(cameraX);

    // Main building
    this.renderer.drawMainBuilding(floor, cameraX);

    // Background NPCs
    for (const npc of this.level.backgroundNPCs) {
      if (npc.floorIndex !== this.level.currentFloor) continue;
      const sx = npc.x - cameraX;
      if (sx > -60 && sx < CANVAS_WIDTH + 60) {
        CharacterRenderer.drawBackgroundNPC(this.renderer.ctx, sx, GROUND_Y, npc.seed, npc.running);
      }
    }

    // Shelters
    for (const shelter of floor.shelters) {
      this.renderer.drawShelter(shelter, cameraX);
    }

    // Obstacles
    for (const obs of floor.obstacles) {
      this.renderer.drawObstacle(obs, cameraX);
    }

    // Player
    const playerSX = this.player.x - cameraX;
    CharacterRenderer.drawPlayer(
      this.renderer.ctx,
      playerSX, this.player.y,
      this.player.charDef,
      this.player.state,
      this.player.animFrame,
      this.player.direction
    );

    // Floating texts
    this.renderer.drawFloatingTexts(this.level.floatingTexts, cameraX);

    // Atmosphere
    this.renderer.drawDustParticles(1 / 60);
    this.renderer.drawHaze();

    // Shelter proximity indicator
    if (this._nearbyShelterX != null) {
      this.renderer.drawShelterIndicator(this._nearbyShelterX);
    }

    // Shelter choice prompt on last floor
    if (this.level.isLastFloor()) {
      this.ui.drawShelterChoice(floor.shelters, cameraX, this.timer);
    }

    // HUD (on top)
    this.ui.drawHUD(this.timer, this.level.currentFloor, this.player);

    this.renderer.drawVignette();

    // Touch controls (drawn last, on top of everything)
    this.touchControls.draw(this.renderer.ctx);
  }

  // ============================================================
  // GAME LOOP
  // ============================================================

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 1 / 30);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  start() {
    requestAnimationFrame((t) => {
      this.lastTime = t;
      this.loop(t);
    });
  }

  // ============================================================
  // INPUT HANDLERS
  // ============================================================

  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  _handleClick(e) {
    const pos = this._getMousePos(e);

    switch (this.state) {
      case GameState.MENU: {
        this._showInstructions();
        break;
      }

      case GameState.INSTRUCTIONS: {
        this.state = GameState.INSTRUCTIONS2;
        break;
      }

      case GameState.INSTRUCTIONS2: {
        this._startCharacterSelect();
        break;
      }

      case GameState.PLAYING: {
        // Tap on shelter door — directly check all shelters (avoids async race condition)
        const floor = this.level.getCurrentFloor();
        for (const shelter of floor.shelters) {
          if (!shelter.active || shelter.entered) continue;
          const dist = Math.abs(this.player.getCenterX() - (shelter.x + shelter.width / 2));
          if (dist > SHELTER_INTERACT_RANGE) continue;
          const sx = shelter.x - this.level.cameraX;
          const doorBounds = {
            x: sx - 20, y: GROUND_Y - SHELTER_HEIGHT - 20,
            width: SHELTER_WIDTH + 40, height: SHELTER_HEIGHT + 40,
          };
          if (this._isInBounds(pos, doorBounds)) {
            this.input.simulateDown('Enter');
            setTimeout(() => this.input.simulateUp('Enter'), 100);
            break;
          }
        }
        break;
      }

      case GameState.SELECT: {
        const male = this.ui.getMaleCardBounds();
        const female = this.ui.getFemaleCardBounds();
        if (this._isInBounds(pos, male)) {
          this._startGame(CHARACTERS.male);
        } else if (this._isInBounds(pos, female)) {
          this._startGame(CHARACTERS.female);
        }
        break;
      }

      case GameState.SUCCESS:
      case GameState.FAILURE: {
        const retry = this.ui.getRetryBounds();
        if (this._isInBounds(pos, retry)) {
          this.state = GameState.MENU;
        }
        break;
      }
    }
  }

  _handleMouseMove(e) {
    if (this.state !== GameState.SELECT) return;
    const pos = this._getMousePos(e);
    const male = this.ui.getMaleCardBounds();
    const female = this.ui.getFemaleCardBounds();

    if (this._isInBounds(pos, male)) {
      this.ui.menuHoverChar = 'male';
    } else if (this._isInBounds(pos, female)) {
      this.ui.menuHoverChar = 'female';
    } else {
      this.ui.menuHoverChar = null;
    }
  }

  _isInBounds(pos, bounds) {
    return pos.x >= bounds.x && pos.x <= bounds.x + bounds.width &&
           pos.y >= bounds.y && pos.y <= bounds.y + bounds.height;
  }
}
