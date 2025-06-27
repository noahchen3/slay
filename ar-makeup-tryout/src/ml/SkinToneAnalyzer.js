/**
 * SkinToneAnalyzer: Analyzes skin tone from video and face landmarks.
 *
 * Categories: Light/Cool, Light/Warm, Medium/Cool, Medium/Warm, Dark/Cool, Dark/Warm
 * Returns: { skinToneCategory, palettes: { lipstick: [], eyeshadow: [], blush: [] } }
 */
class SkinToneAnalyzer {
  constructor() {
    // Define color palettes for each skin tone category
    this.palettes = {
      "Light/Cool": {
        lipstick: ["#e57373", "#f06292", "#ba68c8", "#7986cb"],
        eyeshadow: ["#b3c6f7", "#e1bee7", "#c5cae9", "#b2dfdb"],
        blush: ["#f8bbd0", "#f48fb1", "#ce93d8"],
      },
      "Light/Warm": {
        lipstick: ["#ff8a65", "#ffd54f", "#ffb74d", "#d4e157"],
        eyeshadow: ["#ffe082", "#fff9c4", "#ffe0b2", "#fff59d"],
        blush: ["#ffe0b2", "#ffd180", "#ffccbc"],
      },
      "Medium/Cool": {
        lipstick: ["#ad1457", "#6a1b9a", "#283593", "#00838f"],
        eyeshadow: ["#b39ddb", "#90caf9", "#80cbc4", "#b0bec5"],
        blush: ["#f06292", "#ba68c8", "#b2ebf2"],
      },
      "Medium/Warm": {
        lipstick: ["#d84315", "#ffb300", "#fbc02d", "#afb42b"],
        eyeshadow: ["#ffe082", "#ffcc80", "#dcedc8", "#fff176"],
        blush: ["#ffab91", "#ffd54f", "#dce775"],
      },
      "Dark/Cool": {
        lipstick: ["#4a148c", "#1a237e", "#006064", "#263238"],
        eyeshadow: ["#9575cd", "#7986cb", "#4dd0e1", "#90a4ae"],
        blush: ["#ce93d8", "#80cbc4", "#b0bec5"],
      },
      "Dark/Warm": {
        lipstick: ["#bf360c", "#ff6f00", "#fbc02d", "#827717"],
        eyeshadow: ["#ffb300", "#ff8a65", "#d4e157", "#ffd54f"],
        blush: ["#ff8a65", "#ffd180", "#dce775"],
      },
    };
  }

  /**
   * Analyze skin tone from video and landmarks.
   * @param {HTMLVideoElement} video
   * @param {Array<{x: number, y: number}>} landmarks
   * @returns {{ skinToneCategory: string, palettes: object, avgRGB: object, avgHSV: object }}
   */
  analyze(video, landmarks) {
    if (!video || !landmarks || landmarks.length < 68) return null;
    // Get canvas to sample pixels
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // Sample points: forehead (between eyebrows), left cheek, right cheek
    const samplePoints = [
      // Forehead: midpoint between landmarks 19 and 24, a bit above
      this._interpolate(landmarks[19], landmarks[24], 0.5, -30),
      // Left cheek: below and out from landmark 36 (left eye outer corner)
      this._offset(landmarks[36], -20, 30),
      // Right cheek: below and out from landmark 45 (right eye outer corner)
      this._offset(landmarks[45], 20, 30),
    ];

    const rgbs = samplePoints.map((pt) => this._sampleRGB(ctx, pt));
    const avgRGB = this._averageRGB(rgbs);
    const avgHSV = this._rgbToHsv(avgRGB.r, avgRGB.g, avgRGB.b);

    // Classify
    const skinToneCategory = this._classify(avgHSV);
    return {
      skinToneCategory,
      palettes: this.palettes[skinToneCategory],
      avgRGB,
      avgHSV,
    };
  }

  // Helper: interpolate between two points, with optional y offset
  _interpolate(pt1, pt2, t, yOffset = 0) {
    return {
      x: pt1.x + (pt2.x - pt1.x) * t,
      y: pt1.y + (pt2.y - pt1.y) * t + yOffset,
    };
  }

  // Helper: offset a point by dx, dy
  _offset(pt, dx, dy) {
    return { x: pt.x + dx, y: pt.y + dy };
  }

  // Helper: sample RGB at a point
  _sampleRGB(ctx, pt) {
    const { x, y } = pt;
    const data = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  }

  // Helper: average RGB values
  _averageRGB(rgbs) {
    const n = rgbs.length;
    return {
      r: Math.round(rgbs.reduce((sum, c) => sum + c.r, 0) / n),
      g: Math.round(rgbs.reduce((sum, c) => sum + c.g, 0) / n),
      b: Math.round(rgbs.reduce((sum, c) => sum + c.b, 0) / n),
    };
  }

  // Helper: convert RGB to HSV
  _rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
  }

  // Helper: classify skin tone based on HSV
  _classify(hsv) {
    // Light/Medium/Dark by value (brightness)
    let tone;
    if (hsv.v > 75) tone = "Light";
    else if (hsv.v > 40) tone = "Medium";
    else tone = "Dark";
    // Warm/Cool by hue (red/yellow vs blue/pink)
    // Warm: hue 20-60 (yellow/orange), Cool: hue 200-300 (blue/purple), else neutral (pick closest)
    let undertone;
    if ((hsv.h >= 20 && hsv.h <= 60) || hsv.h >= 330 || hsv.h <= 20)
      undertone = "Warm";
    else undertone = "Cool";
    return `${tone}/${undertone}`;
  }
}

export default SkinToneAnalyzer;
