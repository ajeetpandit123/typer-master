export type Theme = {
  id: string;
  name: string;
  isCustom?: boolean;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  accent: string;
  error: string;
  success: string;
  caret: string;
  border: string;
  selection: string;
};

// --- COLOR CONVERSION UTILITIES ---

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export const hexToRgb = (hex: string): RGB => {
  const sanitized = hex.trim().replace(/^#/, "");
  let r = 0, g = 0, b = 0;

  if (sanitized.length === 3) {
    r = parseInt(sanitized[0] + sanitized[0], 16);
    g = parseInt(sanitized[1] + sanitized[1], 16);
    b = parseInt(sanitized[2] + sanitized[2], 16);
  } else if (sanitized.length === 6) {
    r = parseInt(sanitized.substring(0, 2), 16);
    g = parseInt(sanitized.substring(2, 4), 16);
    b = parseInt(sanitized.substring(4, 6), 16);
  }
  return { r, g, b };
};

export const rgbToHex = ({ r, g, b }: RGB): string => {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const rgbToHsl = ({ r, g, b }: RGB): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const hslToRgb = ({ h, s, l }: HSL): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r = l, g = l, b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const hexToHsl = (hex: string): HSL => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: HSL): string => rgbToHex(hslToRgb(hsl));

// Blend two colors by percentage (0 to 1)
export const blendHex = (colorA: string, colorB: string, weight: number): string => {
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);

  return rgbToHex({
    r: rgbA.r * (1 - weight) + rgbB.r * weight,
    g: rgbA.g * (1 - weight) + rgbB.g * weight,
    b: rgbA.b * (1 - weight) + rgbB.b * weight,
  });
};

// --- WCAG CONTRAST RATION CALCULATIONS ---

// Get relative luminance of a color
export const getRelativeLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  const transformChannel = (val: number): number => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const r = transformChannel(rgb.r);
  const g = transformChannel(rgb.g);
  const b = transformChannel(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Calculate contrast ratio between two hex colors
export const getContrastRatio = (colorA: string, colorB: string): number => {
  const l1 = getRelativeLuminance(colorA);
  const l2 = getRelativeLuminance(colorB);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
};

// --- SEMANTIC TOKEN GENERATOR ---

export const deriveTokens = (bg: string, text: string, accent: string): Omit<Theme, "id" | "name" | "isCustom"> => {
  const bgHsl = hexToHsl(bg);
  const textHsl = hexToHsl(text);
  const accentHsl = hexToHsl(accent);

  const isDarkBg = bgHsl.l < 50;

  // 1. Surface and Surface-2
  // For dark background, surfaces are lighter. For light background, they are darker.
  const surfaceLightnessShift = isDarkBg ? 6 : -6;
  const surface = hslToHex({
    h: bgHsl.h,
    s: Math.max(0, bgHsl.s - 2),
    l: Math.max(5, Math.min(95, bgHsl.l + surfaceLightnessShift)),
  });

  const surface2LightnessShift = isDarkBg ? 12 : -12;
  const surface2 = hslToHex({
    h: bgHsl.h,
    s: Math.max(0, bgHsl.s - 4),
    l: Math.max(5, Math.min(95, bgHsl.l + surface2LightnessShift)),
  });

  // 2. Muted Text
  // Blend text with background (60% background, 40% text)
  const textMuted = blendHex(text, bg, 0.55);

  // 3. Border
  // Blend text with background (80% background, 20% text)
  const border = blendHex(text, bg, 0.82);

  // 4. Caret
  // Caret is accent
  const caret = accent;

  // 5. Selection
  // Accent with high transparency on background
  const selection = blendHex(accent, bg, 0.85);

  // 6. Error Red (high contrast red family)
  // Derive based on background lightness
  const error = hslToHex({
    h: 355,
    s: 85,
    l: isDarkBg ? 65 : 45,
  });

  // 7. Success Green (subtle readable green family)
  const success = hslToHex({
    h: 142,
    s: 70,
    l: isDarkBg ? 60 : 40,
  });

  return {
    bg,
    surface,
    surface2,
    text,
    textMuted,
    accent,
    error,
    success,
    caret,
    border,
    selection,
  };
};

// --- PRESET THEMES ---

export const PRESET_THEMES: Theme[] = [
  {
    id: "classic-dark",
    name: "Classic Dark",
    bg: "#111111",
    surface: "#1a1a1a",
    surface2: "#222222",
    text: "#f5f5f5",
    textMuted: "#666666",
    accent: "#e2b714",
    error: "#ff5f5f",
    success: "#67c587",
    caret: "#e2b714",
    border: "#262626",
    selection: "#3b3212",
  },
  {
    id: "classic-light",
    name: "Classic Light",
    bg: "#f5f5f5",
    surface: "#e8e8e8",
    surface2: "#dddddd",
    text: "#111111",
    textMuted: "#888888",
    accent: "#0066cc",
    error: "#cc0000",
    success: "#008800",
    caret: "#0066cc",
    border: "#cccccc",
    selection: "#e2efff",
  },
  {
    id: "sepia",
    name: "Sepia",
    bg: "#f4ecd8",
    surface: "#e5dac2",
    surface2: "#d9ccb0",
    text: "#5c4033",
    textMuted: "#8f705f",
    accent: "#a0522d",
    error: "#b22222",
    success: "#2e8b57",
    caret: "#a0522d",
    border: "#cbbda4",
    selection: "#ebdcb9",
  },
  {
    id: "forest",
    name: "Forest",
    bg: "#1b2a22",
    surface: "#24372e",
    surface2: "#2c453a",
    text: "#e8f0ec",
    textMuted: "#729283",
    accent: "#4caf50",
    error: "#f44336",
    success: "#8bc34a",
    caret: "#4caf50",
    border: "#334c3f",
    selection: "#243d30",
  },
  {
    id: "ocean",
    name: "Ocean",
    bg: "#0c1b23",
    surface: "#142c38",
    surface2: "#1c3d4e",
    text: "#e0f2fe",
    textMuted: "#658fa6",
    accent: "#0284c7",
    error: "#ef4444",
    success: "#10b981",
    caret: "#0284c7",
    border: "#20465a",
    selection: "#122a38",
  },
  {
    id: "graphite",
    name: "Graphite",
    bg: "#242526",
    surface: "#2e3032",
    surface2: "#383a3d",
    text: "#e3e3e3",
    textMuted: "#7e8287",
    accent: "#9ca3af",
    error: "#f87171",
    success: "#34d399",
    caret: "#9ca3af",
    border: "#414448",
    selection: "#3a3c3f",
  },
  {
    id: "ivory",
    name: "Ivory",
    bg: "#fefefa",
    surface: "#f4f4ec",
    surface2: "#eaeae0",
    text: "#2c3539",
    textMuted: "#7a8285",
    accent: "#808000",
    error: "#cd5c5c",
    success: "#556b2f",
    caret: "#808000",
    border: "#dfdfd0",
    selection: "#f5f5dc",
  },
  {
    id: "terminal",
    name: "Terminal",
    bg: "#050505",
    surface: "#101010",
    surface2: "#1a1a1a",
    text: "#33ff33",
    textMuted: "#119911",
    accent: "#33ff33",
    error: "#ff3333",
    success: "#33ff33",
    caret: "#33ff33",
    border: "#222222",
    selection: "#004400",
  },
];
