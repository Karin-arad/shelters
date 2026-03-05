// ============================================================
// Obstacles — 5 Types
// ============================================================

class Obstacle {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.active = true;
    this.resolved = false;
  }

  update(player, input, timer) { }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

// --- 1. Baby Stroller ---
class BabyStroller extends Obstacle {
  constructor(x) {
    super(x, GROUND_Y - STROLLER_HEIGHT, STROLLER_WIDTH, STROLLER_HEIGHT, ObstacleType.STROLLER);
  }

  update(player, input, timer) {
    if (this.resolved) return null;
    if (!rectCollision(player.getBounds(), this.getBounds())) return null;

    if (!player.isGrounded) {
      // Jumping over — success
      this.resolved = true;
      return null;
    }

    // Block the player
    if (player.direction > 0) {
      player.x = this.x - player.width - 1;
    } else {
      player.x = this.x + this.width + 1;
    }
    player.speed = 0;
    return null;
  }
}

// --- 2. Wet Stairs ---
class WetStairs extends Obstacle {
  constructor(x) {
    super(x, GROUND_Y - 6, 80, 6, ObstacleType.WET_STAIRS);
  }

  update(player, input, timer) {
    if (this.resolved) return null;
    if (!rectCollision(player.getBounds(), this.getBounds())) return null;

    this.resolved = true;
    if (player.speed > WET_STAIRS_SLIP_SPEED) {
      player.slip(1.2);
      timer.addPenalty(WET_STAIRS_TIME_PENALTY);
      ScreenShake.trigger(4, 0.3);
      return { type: 'slip', text: STRINGS.obstacleWet };
    }
    return null;
  }
}

// --- 3. Old Neighbor ---
class OldNeighbor extends Obstacle {
  constructor(x) {
    super(x, GROUND_Y - 55, 38, 55, ObstacleType.OLD_NEIGHBOR);
    this.talking = false;
    this.skipPresses = 0;
    this.requiredPresses = NEIGHBOR_SKIP_PRESSES;
  }

  update(player, input, timer) {
    if (this.resolved) return null;

    if (!this.talking && rectCollision(player.getBounds(), this.getBounds())) {
      this.talking = true;
      player.trap();
      return { type: 'trap', text: STRINGS.obstacleNeighbor };
    }

    if (this.talking) {
      if (input.isJustPressed('Space')) {
        this.skipPresses++;
        if (this.skipPresses >= this.requiredPresses) {
          player.release();
          this.resolved = true;
          this.talking = false;
          return { type: 'escaped' };
        }
      }
    }
    return null;
  }
}

// --- 4. Homeless Person ---
class HomelessPerson extends Obstacle {
  constructor(x) {
    super(x, GROUND_Y - HOMELESS_HEIGHT, HOMELESS_WIDTH, HOMELESS_HEIGHT, ObstacleType.HOMELESS);
  }

  update(player, input, timer) {
    if (this.resolved) return null;
    if (!rectCollision(player.getBounds(), this.getBounds())) return null;

    if (!player.isGrounded) {
      // Jumping over — success
      this.resolved = true;
      return null;
    }

    // Block + slight push back
    if (player.direction > 0) {
      player.x = this.x - player.width - 1;
    } else {
      player.x = this.x + this.width + 1;
    }
    player.speed = Math.max(player.speed - 1, 0);
    return null;
  }
}

// --- 5. Unwanted Neighbor ---
class UnwantedNeighbor extends Obstacle {
  constructor(x) {
    super(x, GROUND_Y - 55, 36, 55, ObstacleType.UNWANTED_NEIGHBOR);
    this.caught = false;
    this.catchTimer = 0;
    this.penaltyApplied = false;
  }

  update(player, input, timer) {
    if (this.resolved) return null;

    const playerCX = player.getCenterX();
    const npcCX = this.x + this.width / 2;
    const distance = Math.abs(playerCX - npcCX);

    // Player got too close
    if (!this.caught && distance < UNWANTED_NEIGHBOR_DETECT_RANGE && player.state === 'running') {
      // Can avoid if running fast enough (speed > 4.5)
      if (player.speed < 4) {
        this.caught = true;
        this.catchTimer = UNWANTED_NEIGHBOR_TIME_PENALTY;
        player.trap();
        return { type: 'caught', text: STRINGS.obstacleUnwanted };
      }
    }

    if (this.caught) {
      this.catchTimer -= 1 / 60; // approximate dt
      if (this.catchTimer <= 0) {
        player.release();
        this.resolved = true;
        this.caught = false;
        if (!this.penaltyApplied) {
          timer.addPenalty(UNWANTED_NEIGHBOR_TIME_PENALTY);
          this.penaltyApplied = true;
        }
        return { type: 'escaped' };
      }
    }
    return null;
  }
}

// --- Shelter ---
class Shelter {
  constructor(x, shelterType) {
    this.x = x;
    this.y = GROUND_Y - SHELTER_HEIGHT;
    this.width = SHELTER_WIDTH;
    this.height = SHELTER_HEIGHT;
    this.shelterType = shelterType;
    this.entered = false;
    this.active = true;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  checkEntry(player, input) {
    if (this.entered || !this.active) return null;

    // Proximity check (much wider than old hitbox)
    const playerCX = player.getCenterX();
    const shelterCX = this.x + this.width / 2;
    const distance = Math.abs(playerCX - shelterCX);

    if (distance > SHELTER_INTERACT_RANGE) return null;

    if (input.isJustPressed('Enter')) {
      this.entered = true;
      switch (this.shelterType) {
        case ShelterType.REAL:
          return 'success';
        case ShelterType.HIDDEN:
          return 'success';
        case ShelterType.UNAUTHORIZED:
          return 'unauthorized';
      }
    }

    return 'nearby';
  }
}
