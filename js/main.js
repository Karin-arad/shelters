// ============================================================
// Entry Point
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const game = new Game(canvas);
  game.start();
});
