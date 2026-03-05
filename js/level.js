// ============================================================
// Level — Floor Layout, Obstacles, Shelters, NPCs
// ============================================================

class Level {
  constructor() {
    this.floors = [];
    this.currentFloor = 0;
    this.cameraX = 0;
    this.cameraTargetX = 0;
    this.backgroundNPCs = [];
    this.floatingTexts = [];
    this.nearbyShelter = null;

    this._generateFloors();
    this._generateBackgroundNPCs();
  }

  _generateFloors() {
    for (let i = 0; i < FLOOR_COUNT; i++) {
      const direction = (i % 2 === 0) ? 1 : -1;
      const floor = {
        index: i,
        direction: direction,
        hallwayLength: HALLWAY_LENGTH,
        obstacles: [],
        shelters: [],
      };

      this._placeObstacles(floor);
      this._placeShelters(floor, i);
      this.floors.push(floor);
    }

    // Last floor always has end-choice shelters
    this._placeEndShelters(this.floors[FLOOR_COUNT - 1]);
  }

  _placeObstacles(floor) {
    const count = 3 + randomInt(0, 2); // 3-5 obstacles per floor
    const minSpacing = 350;
    const margin = 300;
    const available = floor.hallwayLength - margin * 2;

    const positions = [];
    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let pos;
      do {
        pos = margin + Math.random() * available;
        attempts++;
      } while (attempts < 50 && positions.some(p => Math.abs(p - pos) < minSpacing));

      if (attempts < 50) {
        positions.push(pos);
      }
    }

    positions.sort((a, b) => a - b);

    const types = [
      ObstacleType.STROLLER,
      ObstacleType.WET_STAIRS,
      ObstacleType.OLD_NEIGHBOR,
      ObstacleType.HOMELESS,
      ObstacleType.UNWANTED_NEIGHBOR,
    ];

    for (const pos of positions) {
      const type = randomChoice(types);
      let obstacle;
      switch (type) {
        case ObstacleType.STROLLER:
          obstacle = new BabyStroller(pos);
          break;
        case ObstacleType.WET_STAIRS:
          obstacle = new WetStairs(pos);
          break;
        case ObstacleType.OLD_NEIGHBOR:
          obstacle = new OldNeighbor(pos);
          break;
        case ObstacleType.HOMELESS:
          obstacle = new HomelessPerson(pos);
          break;
        case ObstacleType.UNWANTED_NEIGHBOR:
          obstacle = new UnwantedNeighbor(pos);
          break;
      }
      if (obstacle) floor.obstacles.push(obstacle);
    }
  }

  _placeShelters(floor, floorIndex) {
    // Always place 1-2 shelters mid-floor (not on last floor which has end shelters)
    if (floorIndex >= FLOOR_COUNT - 1) return;

    // Guarantee at least 1 shelter, 50% chance of a second
    const count = Math.random() < 0.5 ? 2 : 1;
    const positions = [];

    for (let i = 0; i < count; i++) {
      let pos;
      let attempts = 0;
      do {
        pos = 600 + Math.random() * (floor.hallwayLength - 1200);
        attempts++;
      } while (attempts < 30 && positions.some(p => Math.abs(p - pos) < 400));
      if (attempts < 30) positions.push(pos);
    }

    const types = [ShelterType.REAL, ShelterType.UNAUTHORIZED, ShelterType.HIDDEN];
    for (const pos of positions) {
      const type = randomChoice(types);
      floor.shelters.push(new Shelter(pos, type));
    }
  }

  _placeEndShelters(floor) {
    const baseX = floor.hallwayLength - 400;
    const spacing = 120;

    // Always one real, one unauthorized, one hidden — shuffled
    const types = [ShelterType.REAL, ShelterType.UNAUTHORIZED, ShelterType.HIDDEN];
    // Shuffle
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }

    for (let i = 0; i < END_SHELTER_COUNT; i++) {
      floor.shelters.push(new Shelter(baseX + i * spacing, types[i]));
    }
  }

  _generateBackgroundNPCs() {
    // Scattered background NPCs for atmosphere
    for (let fi = 0; fi < FLOOR_COUNT; fi++) {
      const count = randomInt(3, 6);
      for (let i = 0; i < count; i++) {
        this.backgroundNPCs.push({
          floorIndex: fi,
          x: 200 + Math.random() * (HALLWAY_LENGTH - 400),
          speed: randomFloat(1.5, 4),
          seed: randomInt(0, 99999),
          running: Math.random() > 0.3,
          direction: Math.random() > 0.5 ? 1 : -1,
        });
      }
    }
  }

  getCurrentFloor() {
    return this.floors[this.currentFloor];
  }

  update(player, dt) {
    // Camera follow
    this.cameraTargetX = player.x - CANVAS_WIDTH * 0.3;
    this.cameraTargetX = Math.max(0, this.cameraTargetX);
    this.cameraX = lerp(this.cameraX, this.cameraTargetX, 0.1);

    // Update floating texts
    this.floatingTexts = this.floatingTexts.filter(ft => {
      ft.update(dt);
      return ft.isAlive();
    });

    // Update background NPCs on current floor
    for (const npc of this.backgroundNPCs) {
      if (npc.floorIndex !== this.currentFloor) continue;
      if (npc.running) {
        npc.x += npc.speed * npc.direction;
        if (npc.x < -50 || npc.x > HALLWAY_LENGTH + 50) {
          npc.direction *= -1;
        }
      }
    }

    // Check hallway boundaries (bidirectional)
    const floor = this.getCurrentFloor();
    const isLast = this.isLastFloor();

    if (floor.direction > 0) {
      // Even floor: wall at left, exit at right
      if (player.x < HALLWAY_START_WALL) {
        player.x = HALLWAY_START_WALL;
        player.speed = 0;
      }
      if (player.x > floor.hallwayLength - 50) {
        if (isLast) {
          // Last floor: clamp, don't exit — player must find shelter
          player.x = floor.hallwayLength - 50;
          player.speed = 0;
        } else {
          return 'end_of_hallway';
        }
      }
    } else {
      // Odd floor: wall at right, exit at left
      if (player.x > floor.hallwayLength - HALLWAY_START_WALL) {
        player.x = floor.hallwayLength - HALLWAY_START_WALL;
        player.speed = 0;
      }
      if (player.x < 50) {
        if (isLast) {
          player.x = 50;
          player.speed = 0;
        } else {
          return 'end_of_hallway';
        }
      }
    }

    return null;
  }

  advanceFloor(player) {
    this.currentFloor++;
    if (this.currentFloor >= FLOOR_COUNT) {
      return false; // no more floors
    }

    const floor = this.getCurrentFloor();
    // Set initial facing direction (player can turn freely)
    player.direction = floor.direction;
    if (floor.direction > 0) {
      player.x = 80;
    } else {
      player.x = floor.hallwayLength - 80;
    }
    player.y = GROUND_Y - player.height;
    player.speed = 0;
    player.isMoving = false;
    player.state = 'idle';
    this.cameraX = player.x - CANVAS_WIDTH * 0.3;
    if (this.cameraX < 0) this.cameraX = 0;

    return true;
  }

  addFloatingText(text, x, y, color) {
    this.floatingTexts.push(new FloatingText(text, x, y, color));
  }

  isLastFloor() {
    return this.currentFloor >= FLOOR_COUNT - 1;
  }
}
