# מקלטים — Shelters

A browser-based game about the uniquely Israeli experience of sprinting to a bomb shelter when the air raid siren goes off.

Navigate hallways, dodge neighbors, jump over strollers, and find a licensed shelter before time runs out — then prove you're Israeli enough to enter by answering a trivia question.

## Play

Open `index.html` in any modern browser. No build step, no dependencies — just pure HTML5 Canvas and vanilla JavaScript.

Works on desktop and mobile (touch controls included).

## How to Play

- **Arrow keys** — Move left/right
- **Space** — Jump over obstacles
- **Enter** — Enter a shelter door

On mobile, on-screen buttons replace keyboard controls. Tap shelter doors directly to enter.

### The Goal

You have **120 seconds**. Run through building hallways, floor by floor, looking for shelters. When you find one and knock on the door, you'll face an Israeli trivia question — answer correctly to get in and earn +15 bonus seconds. Answer wrong and you stay outside until you get it right (the timer keeps ticking).

Not all shelters are real. Some are unauthorized, some are hidden. Choose wisely.

### Obstacles

| Obstacle | What Happens |
|---|---|
| Baby stroller | Jump over it or lose time |
| Wet stairs | Slip and get stunned |
| Old neighbor | Mash Space to escape the conversation |
| Homeless person | Avoid or lose time |
| Unwanted neighbor | Get caught in a time-draining encounter |

Running too fast into NPCs costs you penalty seconds. Running too slow means you won't make it.

## Project Structure

```
shelters/
├── index.html          # Entry point
├── css/
│   └── style.css       # Responsive layout (desktop + mobile)
├── js/
│   ├── main.js         # Bootstrap & game loop
│   ├── game.js         # State machine (menu → play → quiz → stairwell → success/failure)
│   ├── constants.js    # All tuning values, colors, strings, quiz questions
│   ├── player.js       # Player physics, movement, stumbling
│   ├── level.js        # Floor generation, obstacles, shelter placement
│   ├── obstacles.js    # Obstacle types and behavior
│   ├── renderer.js     # Canvas rendering (buildings, hallways, sky, effects)
│   ├── ui.js           # HUD, menus, quiz screen, celebration overlay
│   ├── characters.js   # Character sprite drawing (Avi / Noa)
│   ├── input.js        # Keyboard input manager
│   ├── touch.js        # Mobile touch controls with Android fix
│   ├── timer.js        # Countdown timer with bonus support
│   ├── sound.js        # Procedural audio (siren, footsteps, doors)
│   └── utils.js        # Math helpers, random, lerp, screen shake
└── urban.png           # Background texture
```

## Game Flow

```
Menu → Instructions → Character Select → Playing ←→ Quiz → Stairwell → Playing...
                                            ↓                              ↓
                                         Failure                       Success
                                       (time ran out)             (endless loop)
```

The game runs in an endless loop — after clearing all 5 floors, new floors are generated. The challenge is surviving as long as possible.

## Technical Notes

- **Zero dependencies** — no frameworks, no bundler, no npm
- **Canvas-based** — all rendering is hand-drawn on a 960×540 canvas
- **Procedural audio** — siren, footsteps, and door sounds generated via Web Audio API
- **Mobile-ready** — responsive CSS, touch controls, haptic feedback on Android
- **RTL text** — Hebrew strings rendered correctly on canvas
- **Machinarium-inspired palette** — muted urban tones, concrete and rust

## License

This project is not currently licensed for redistribution.
