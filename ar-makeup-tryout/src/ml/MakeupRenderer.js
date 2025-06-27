/**
 * MakeupRenderer: Draws virtual makeup overlays on a canvas using face landmarks.
 * Supports lipstick, eyeshadow, and blush with adjustable color and opacity.
 */
class MakeupRenderer {
  /**
   * Draw lipstick on the lips using landmark points.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array<{x: number, y: number}>} landmarks
   * @param {string} color - Hex color
   * @param {number} opacity - 0 to 1
   */
  drawLips(ctx, landmarks, color, opacity = 0.7) {
    // Outer lip: 48-59, Inner lip: 60-67
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    // Outer lip
    ctx.moveTo(landmarks[48].x, landmarks[48].y);
    for (let i = 49; i <= 59; i++) ctx.lineTo(landmarks[i].x, landmarks[i].y);
    ctx.closePath();
    // Inner lip (hole)
    ctx.moveTo(landmarks[60].x, landmarks[60].y);
    for (let i = 61; i <= 67; i++) ctx.lineTo(landmarks[i].x, landmarks[i].y);
    ctx.closePath();
    ctx.fill("evenodd");
    ctx.restore();
  }

  /**
   * Draw eyeshadow on the eyelids using landmark points.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array<{x: number, y: number}>} landmarks
   * @param {string} color - Hex color
   * @param {number} opacity - 0 to 1
   */
  drawEyeshadow(ctx, landmarks, color, opacity = 0.4) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    // Left eye: 36-41
    ctx.beginPath();
    ctx.moveTo(landmarks[36].x, landmarks[36].y);
    for (let i = 37; i <= 41; i++) ctx.lineTo(landmarks[i].x, landmarks[i].y);
    ctx.closePath();
    ctx.fill();
    // Right eye: 42-47
    ctx.beginPath();
    ctx.moveTo(landmarks[42].x, landmarks[42].y);
    for (let i = 43; i <= 47; i++) ctx.lineTo(landmarks[i].x, landmarks[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw blush on the cheeks using face contour and cheek points.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array<{x: number, y: number}>} landmarks
   * @param {string} color - Hex color
   * @param {number} opacity - 0 to 1
   */
  drawBlush(ctx, landmarks, color, opacity = 0.3) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    // Left cheek: center between points 2 and 31
    const left = this._midpoint(landmarks[2], landmarks[31]);
    // Right cheek: center between points 14 and 35
    const right = this._midpoint(landmarks[14], landmarks[35]);
    // Draw circles for blush
    ctx.beginPath();
    ctx.arc(left.x, left.y, 22, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(right.x, right.y, 22, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  // Helper: midpoint between two points
  _midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
}

export default MakeupRenderer;
