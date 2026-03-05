// ============================================================
// Player Entity
// ============================================================

class Player {
  constructor(x, y, characterDef) {
    this.x = x;
    this.y = y;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.charDef = characterDef;

    this.speed = 0;
    this.velocityY = 0;
    this.direction = 1; // 1 = right, -1 = left
    this.isGrounded = true;
    this.isMoving = false;

    // States
    this.state = 'idle'; // idle, running, jumping, slipping, trapped, stumble
    this.stateTimer = 0;
    this.animFrame = 0;

    // Speed damage
    this.stumbleImmunity = 0; // brief immunity after stumble
  }

  update(input, dt) {
    this.animFrame += dt;

    // Decrease immunity timer
    if (this.stumbleImmunity > 0) this.stumbleImmunity -= dt;

    // Handle state timers
    if (this.state === 'slipping' || this.state === 'stumble') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'idle';
        this.speed = 0;
        this.isMoving = false;
        this.stumbleImmunity = 1.0;
      }
      return; // can't control while slipping/stumbling
    }

    if (this.state === 'trapped') {
      return; // can't move while trapped
    }

    // Direction & speed control (platformer-style)
    const wantsRight = input.isDown('ArrowRight');
    const wantsLeft = input.isDown('ArrowLeft');

    if (wantsRight && !wantsLeft) {
      // Moving right
      if (this.direction === -1 && this.speed > 0) {
        // Turning around: apply speed penalty
        this.speed *= PLAYER_TURN_PENALTY;
      }
      this.direction = 1;
      this.isMoving = true;
      this.speed += PLAYER_ACCEL_RATE;
    } else if (wantsLeft && !wantsRight) {
      // Moving left
      if (this.direction === 1 && this.speed > 0) {
        // Turning around: apply speed penalty
        this.speed *= PLAYER_TURN_PENALTY;
      }
      this.direction = -1;
      this.isMoving = true;
      this.speed += PLAYER_ACCEL_RATE;
    } else {
      // No key held (or both): decelerate to stop
      this.isMoving = false;
      this.speed -= PLAYER_DECEL_RATE;
      if (this.speed < 0) this.speed = 0;
    }

    // Minimum moving speed
    if (this.isMoving && this.speed < PLAYER_INITIAL_SPEED) {
      this.speed = PLAYER_INITIAL_SPEED;
    }
    this.speed = Math.min(this.speed, PLAYER_MAX_SPEED);

    // Jump
    if (input.isJustPressed('Space') && this.isGrounded) {
      this.velocityY = JUMP_FORCE;
      this.isGrounded = false;
      this.state = 'jumping';
    }

    // Gravity
    if (!this.isGrounded) {
      this.velocityY += GRAVITY;
      this.y += this.velocityY;

      if (this.y >= GROUND_Y - this.height) {
        this.y = GROUND_Y - this.height;
        this.velocityY = 0;
        this.isGrounded = true;
        if (this.state === 'jumping') {
          this.state = this.isMoving ? 'running' : 'idle';
        }
      }
    }

    // Update state based on movement
    if (this.isGrounded && this.state !== 'slipping' && this.state !== 'stumble' && this.state !== 'trapped') {
      if (this.speed > 0.5) {
        this.state = 'running';
      } else if (this.state !== 'jumping') {
        this.state = 'idle';
      }
    }

    // Move
    this.x += this.speed * this.direction;

    // Random trip chance when going too fast
    if (this.speed > PLAYER_OPTIMAL_SPEED_MAX && this.isGrounded && this.stumbleImmunity <= 0) {
      const overSpeed = (this.speed - PLAYER_OPTIMAL_SPEED_MAX) / (PLAYER_MAX_SPEED - PLAYER_OPTIMAL_SPEED_MAX);
      if (Math.random() < TRIP_CHANCE_PER_FRAME * overSpeed * 3) {
        this.triggerStumble(TRIP_STUN_DURATION);
        return true; // signal: self-trip happened
      }
    }

    return false;
  }

  slip(duration) {
    this.state = 'slipping';
    this.stateTimer = duration;
    this.speed = 0;
    this.isMoving = false;
  }

  trap() {
    this.state = 'trapped';
    this.speed = 0;
    this.isMoving = false;
  }

  release() {
    this.state = 'idle';
    this.speed = 0;
    this.isMoving = false;
  }

  triggerStumble(duration) {
    this.state = 'stumble';
    this.stateTimer = duration;
    this.speed = 0;
    this.isMoving = false;
    ScreenShake.trigger(6, 0.3);
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  getSpeedZone() {
    if (this.speed <= PLAYER_OPTIMAL_SPEED_MIN) return 'slow';
    if (this.speed >= PLAYER_OPTIMAL_SPEED_MAX) return 'fast';
    return 'optimal';
  }

  getCenterX() {
    return this.x + this.width / 2;
  }

  getCenterY() {
    return this.y + this.height / 2;
  }
}
