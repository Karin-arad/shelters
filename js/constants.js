// ============================================================
// מקלטים (Shelters) — Game Constants & Configuration
// ============================================================

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

// --- Player ---
const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 52;
const PLAYER_BASE_SPEED = 2.0;       // recovery speed after stun
const PLAYER_MIN_SPEED = 0;          // can stand still
const PLAYER_MAX_SPEED = 7;
const PLAYER_OPTIMAL_SPEED_MIN = 3.0;
const PLAYER_OPTIMAL_SPEED_MAX = 4.5;
const PLAYER_INITIAL_SPEED = 1.5;    // instant speed on first key press
const PLAYER_ACCEL_RATE = 0.12;      // acceleration while holding direction
const PLAYER_DECEL_RATE = 0.25;      // deceleration when releasing keys
const PLAYER_TURN_PENALTY = 0.5;     // speed multiplier when reversing
const HALLWAY_START_WALL = 40;       // wall boundary at start of hallway
const JUMP_FORCE = -11;
const GRAVITY = 0.55;

// --- Level ---
const FLOOR_COUNT = 5;
const HALLWAY_LENGTH = 3200;
const FLOOR_HEIGHT = 120;
const GROUND_Y = CANVAS_HEIGHT - 90;
const STAIRWELL_WIDTH = 160;

// --- Timer ---
const GAME_DURATION = 120;

// --- Obstacles ---
const WET_STAIRS_SLIP_SPEED = 4.5;
const WET_STAIRS_TIME_PENALTY = 2.5;
const NEIGHBOR_SKIP_PRESSES = 7;
const STROLLER_WIDTH = 55;
const STROLLER_HEIGHT = 38;
const HOMELESS_WIDTH = 70;
const HOMELESS_HEIGHT = 25;
const UNWANTED_NEIGHBOR_DETECT_RANGE = 150;
const UNWANTED_NEIGHBOR_TIME_PENALTY = 3;
const NPC_HIT_TIME_PENALTY = 3;
const NPC_HIT_SPEED_THRESHOLD = 5.0;

// --- Shelters ---
const SHELTER_WIDTH = 70;
const SHELTER_HEIGHT = 80;
const UNAUTHORIZED_PENALTY = 5;
const SHELTERS_PER_FLOOR = 1; // 0-1 shelters scattered per floor
const END_SHELTER_COUNT = 4;
const SHELTER_INTERACT_RANGE = 120;
const SHELTER_SLOWDOWN_RANGE = 200;
const SHELTER_SLOWDOWN_FACTOR = 0.93;

// --- Missiles & Sky Effects ---
const MISSILE_SPAWN_INTERVAL_MIN = 1.0;
const MISSILE_SPAWN_INTERVAL_MAX = 3;
const MISSILE_SPEED = 110;
const MAX_ACTIVE_MISSILES = 6;
const EXPLOSION_DURATION = 2.0;

// --- Colors (Machinarium-inspired urban palette) ---
const COLORS = {
  // Sky & atmosphere
  skyTop: '#4a5568',
  skyBottom: '#718096',
  haze: 'rgba(160, 150, 140, 0.3)',

  // Buildings
  wallLight: '#b8a898',
  wallMid: '#9c8b7a',
  wallDark: '#7a6b5c',
  concrete: '#a0978e',
  concreteLight: '#c4bbb2',
  concreteDark: '#6b6259',
  brick: '#8b6f5e',
  brickDark: '#6e5548',
  rust: '#a0522d',
  rustLight: '#c47a4a',
  metal: '#8a9098',
  metalDark: '#5c636a',
  pipe: '#7a8288',
  door: '#5c4a3e',
  doorFrame: '#4a3a30',
  window: '#7eaac4',
  windowDark: '#4a7a9c',
  windowGlow: 'rgba(255, 220, 150, 0.3)',

  // Ground
  floor: '#8a7e72',
  floorTile: '#9e9284',
  stairLight: '#a89c8e',
  stairDark: '#7a6e62',

  // Accent / Detail
  graffiti1: '#c44a4a',
  graffiti2: '#4a8ac4',
  graffiti3: '#6ab04c',
  laundry1: '#e8d5c4',
  laundry2: '#c4d4e8',
  laundry3: '#e8c4c4',
  ac: '#d4d8dc',
  acDark: '#a0a8b0',
  antenna: '#5a5a5a',
  cable: '#3a3a3a',

  // Player
  tracksuitMale: '#4a7abf',
  tracksuitFemale: '#bf4a7a',
  skin: '#d4a878',
  skinShadow: '#b88a60',
  hair: '#3a2a1a',
  hairFemale: '#5a3a2a',
  shoes: '#4a4a4a',

  // UI
  danger: '#e74c3c',
  dangerGlow: 'rgba(231, 76, 60, 0.4)',
  success: '#2ecc71',
  successGlow: 'rgba(46, 204, 113, 0.3)',
  warning: '#f39c12',
  timerBg: 'rgba(0, 0, 0, 0.6)',
  hudBg: 'rgba(0, 0, 0, 0.45)',
  textPrimary: '#f5f0eb',
  textSecondary: '#c4bbb2',
  textDark: '#2c2420',
  speedGreen: '#6ab04c',
  speedYellow: '#f0c040',
  speedRed: '#e74c3c',

  // Shelter
  shelterReal: '#2ecc71',
  shelterRealGlow: 'rgba(46, 204, 113, 0.25)',
  shelterHidden: '#7a6b5c',
  shelterUnauthorized: '#e74c3c',
  warningTape: '#f1c40f',

  // NPCs
  npcPanic: '#d4a070',
  neighbor: '#c4a882',
  homeless: '#7a6850',

  // Obstacle specific
  wetFloor: '#4a90c4',
  wetFloorShine: 'rgba(120, 180, 230, 0.5)',
  stroller: '#a08870',
  strollerWheel: '#4a4a4a',
  speechBubble: '#f5f0eb',
  speechBubbleBorder: '#9c8b7a',
};

// --- Hebrew Strings ---
const STRINGS = {
  gameTitle: 'מקלטים',
  gameSubtitle: 'Shelters',
  startButton: 'START',
  selectCharacter: 'Choose your character',
  selectMale: 'אבי',
  selectFemale: 'נועה',
  timerLabel: 'TIME',
  floorLabel: 'FLOOR',
  speedLabel: 'SPEED',

  successTitle: '!הגעת למקלט',
  successSubtitle: 'You made it! ...this time.',
  retryButton: 'PLAY AGAIN',

  failureTitle: '...לא הספקת',
  failureMessages: [
    '.לא הגעת למקלט בזמן. אבל הבניין בסדר',
    '.פציעת ספורט. תזמון נורא',
    '.השכן שאל מה שלומך. עברו 40 שניות',
    '.החלקת על המדרגות. הנעליים האלה לא מתאימות למלחמה',
    '.עגלת התינוק ניצחה אותך. עגלת. תינוק',
    '.לפחות תמות עם הסיפור של השכן על הכלב שלו',
    '.לקחת מעלית באזעקה? באמת?',
    '?התקשרת לאמא שלך בזמן האזעקה? באמת',
    '.דרסת שלושה אנשים בדרך ובכל זאת לא הגעת',
    '.ההומלס ליד הכניסה הזהיר אותך, לא הקשבת',
  ],

  // Speed damage messages
  hitNpcMessages: [
    '!דרסת את השכנה מקומה 3',
    '!פגעת בילד עם קורקינט',
    '!דחפת זקן בדרך',
    '!רמסת חתול של השכנים',
    '!התנגשת בשכן שיצא מהמקלחת',
  ],

  // Obstacle warnings
  obstacleWet: '!זהירות רצפה רטובה',
  obstacleNeighbor: '!מהר! לחץ SPACE לברוח',
  obstacleStroller: '!קפוץ',
  obstacleHomeless: '!זהירות',
  obstacleUnwanted: '...אוי לא',

  // Shelter
  shelterReal: 'מקלט מורשה',
  shelterHidden: '???',
  shelterUnauthorized: '!לא מורשה',
  shelterEnter: 'Press Enter ↵',
  shelterWrong: '!מקלט לא מורשה! חזור',

  controls: 'Arrows: Move | Space: Jump | Enter: Shelter',

  // Stairwell
  stairwellMessages: [
    '!סגרו את הדלת',
    '!תזוזו',
    '!יאללה מהר',
    '!איפה המפתחות',
    '!אמאאאא',
    '!מי השאיר את האור דלוק',
    '!הכלב ברח',
  ],
};

// --- Character Definitions ---
const CHARACTERS = {
  male: {
    id: 'male',
    name: 'אבי',
    tracksuit: COLORS.tracksuitMale,
    skin: COLORS.skin,
    skinShadow: COLORS.skinShadow,
    hair: COLORS.hair,
    hairStyle: 'short_messy',
    shoes: COLORS.shoes,
  },
  female: {
    id: 'female',
    name: 'נועה',
    tracksuit: COLORS.tracksuitFemale,
    skin: COLORS.skin,
    skinShadow: COLORS.skinShadow,
    hair: COLORS.hairFemale,
    hairStyle: 'long_messy',
    shoes: COLORS.shoes,
  },
};

// --- Game States ---
const GameState = {
  MENU: 'menu',
  INSTRUCTIONS: 'instructions',
  INSTRUCTIONS2: 'instructions2',
  SELECT: 'select',
  PLAYING: 'playing',
  STAIRWELL: 'stairwell',
  SHELTER_CHOICE: 'shelter_choice',
  QUIZ: 'quiz',
  SUCCESS: 'success',
  FAILURE: 'failure',
};

// --- Obstacle Types ---
const ObstacleType = {
  STROLLER: 'stroller',
  WET_STAIRS: 'wet_stairs',
  OLD_NEIGHBOR: 'old_neighbor',
  HOMELESS: 'homeless',
  UNWANTED_NEIGHBOR: 'unwanted_neighbor',
};

// --- Shelter Types ---
const ShelterType = {
  REAL: 'real',
  HIDDEN: 'hidden',
  UNAUTHORIZED: 'unauthorized',
};

// --- Quiz Questions (Israeli trivia) ---
const QUIZ_QUESTIONS = [
  {
    question: '?כמה שניות יש לך לרוץ למקלט כשנשמעת אזעקה בתל אביב',
    correct: '90 שניות — בדיוק כמה שלוקח לך למצוא את הנעליים',
    wrong: '3 דקות — מספיק לסיים את הקפה',
  },
  {
    question: '?מה עושה הישראלי הממוצע ברגע שהאזעקה נשמעת בלילה',
    correct: 'יורד עם שמיכה, בלי משקפיים, מתנגש בקיר',
    wrong: 'קם בסדר, לובש נעליים ויוצא בשלווה',
  },
  {
    question: '?מה מכיל המקלט הסטנדרטי בישראל',
    correct: 'קופסאות אחסון, אופניים שבורים וצעצועים מ-2009',
    wrong: 'ציוד חירום, מים ואוכל לשלושה ימים',
  },
  {
    question: '?בפברואר 2026 ישראל וארה״ב יצאו למבצע נגד איראן. מה שמו',
    correct: 'מבצע שאגת הארי',
    wrong: 'מבצע חומוס בטהראן',
  },
  {
    question: '?(כמה חזיתות פעילות יש לישראל כרגע (2026',
    correct: 'חמש — עזה, לבנון, יהודה ושומרון, איראן ותימן',
    wrong: 'שתיים — עזה ולבנון, כי אחרים נרגעו',
  },
  {
    question: '?מה ישראלי עושה כשהוא שומע ״ירי לעבר רכב״ בחדשות',
    correct: 'כבר שלח 4 הודעות ווטסאפ ״הכל בסדר?״ לכל הקבוצות',
    wrong: 'ממתין לפרטים נוספים לפני שמגבש דעה',
  },
  {
    question: '?מה ההבדל בין חומוס ישראלי לחומוס ״של הדוד ג׳ורג׳״',
    correct: 'הדוד ג׳ורג׳ עושה אותו 47% יותר טוב וכולם יודעים את זה',
    wrong: 'אין הבדל, חומוס זה חומוס',
  },
  {
    question: '?מה הצעד הראשון שעושה ישראלי לפני שנוסע לחו״ל',
    correct: 'בודק איפה בית חב״ד הכי קרוב למלון',
    wrong: 'בודק ויזה ומזמין מלון',
  },
  {
    question: '?מה ישראלי שולף מהמקפיא בשעת חירום',
    correct: 'שקית פיתות קפואות מ-2022 ושאריות שקשוקה',
    wrong: 'קופסת עזרה ראשונה',
  },
  {
    question: '?מבצע ״עם כלביא״ ביוני 2025 היה מכוון נגד מה',
    correct: 'תוכנית הגרעין האיראנית — מדענים, מתקנים ובכירי ביטחון',
    wrong: 'תשתיות חיזבאללה בלבנון',
  },
  {
    question: '?מה עושה ישראלי כשמצלצל הטלפון בשעתיים בלילה',
    correct: 'בודק קודם אם זה ווטסאפ, פוש מפיקוד העורפי, או וואלה',
    wrong: 'עונה בדאגה',
  },
  {
    question: '?מה תגובת הישראלי הממוצע לשאלה ״מה שלומך?״',
    correct: '״שמעי, בסדר יחסית״ — ואז 12 דקות על המצב',
    wrong: '״טוב, תודה, ואתה?״',
  },
  {
    question: '?מה עושה ישראלי כשמסתיימת האזעקה',
    correct: 'יוצא, מסתכל בשמים, ומסביר לשכן ״זה היה יירוט״',
    wrong: 'חוזר בשקט למיטה',
  },
  {
    question: '?איך ישראלי עושה על האש',
    correct: 'שורף הכל לפחם, ואז מכריז ש״יצא מושלם״',
    wrong: 'מדליק אש, ממתין שתדעך, שם רשת',
  },
  {
    question: '?מה שוב לא נגמר בסופר לפני אזעקה',
    correct: 'לחם, מים וביצים — תוך 11 דקות מהכרזת כוננות',
    wrong: 'גנרטורים ורדיו סוללות',
  },
  {
    question: '?מה ישראלי עונה כשאתה שואל ״חם לך?״',
    correct: '!חם?! פחחח. מילא חם. לח',
    wrong: '״כן, קצת״',
  },
  {
    question: '?איפה הישראלי שומר את הדרכון',
    correct: 'במגירה שנייה מלמטה, מתחת למכתב ממס הכנסה מ-2019',
    wrong: 'בכיס נייד מסודר עם מסמכי חירום',
  },
  {
    question: '?מה עושה ישראלי ב״שקט״ בין שתי מלחמות',
    correct: 'צופה בחדשות כל 20 דקות ומחכה למשהו שיתפוצץ',
    wrong: 'נושם, מתאושש, עושה תוכניות',
  },
  {
    question: '?מה ישראלי אומר בסוף ארוחה מלאה לגמרי',
    correct: '״יאללה, רק עוד קצת פיתה לניקוי הצלחת״',
    wrong: '״תודה, אכלתי מספיק״',
  },
];
