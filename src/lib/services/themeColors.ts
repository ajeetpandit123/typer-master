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
  {
    id: "nord",
    name: "Nord",
    bg: "#2e3440",
    surface: "#3b4252",
    surface2: "#434c5e",
    text: "#d8dee9",
    textMuted: "#4c566a",
    accent: "#88c0d0",
    error: "#bf616a",
    success: "#a3be8c",
    caret: "#88c0d0",
    border: "#4c566a",
    selection: "#434c5e",
  },
  {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    surface: "#343746",
    surface2: "#414558",
    text: "#f8f8f2",
    textMuted: "#6272a4",
    accent: "#ff79c6",
    error: "#ff5555",
    success: "#50fa7b",
    caret: "#ff79c6",
    border: "#44475a",
    selection: "#44475a",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    bg: "#1a1a24",
    surface: "#252535",
    surface2: "#2f2f45",
    text: "#e0e0e8",
    textMuted: "#555566",
    accent: "#fcee0a",
    error: "#ff0055",
    success: "#00ffaa",
    caret: "#fcee0a",
    border: "#3a3a4e",
    selection: "#3b3212",
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    bg: "#002b36",
    surface: "#073642",
    surface2: "#0b4e5f",
    text: "#93a1a1",
    textMuted: "#586e75",
    accent: "#b58900",
    error: "#dc322f",
    success: "#859900",
    caret: "#b58900",
    border: "#073642",
    selection: "#003847",
  },
  {
    id: "solarized-light",
    name: "Solarized Light",
    bg: "#fdf6e3",
    surface: "#eee8d5",
    surface2: "#e4dbbf",
    text: "#586e75",
    textMuted: "#93a1a1",
    accent: "#268bd2",
    error: "#dc322f",
    success: "#859900",
    caret: "#268bd2",
    border: "#d3c7a2",
    selection: "#e2efff",
  },
  {
    id: "gruvbox-dark",
    name: "Gruvbox Dark",
    bg: "#282828",
    surface: "#3c3836",
    surface2: "#504945",
    text: "#ebdbb2",
    textMuted: "#928374",
    accent: "#fe8019",
    error: "#fb4934",
    success: "#b8bb26",
    caret: "#fe8019",
    border: "#504945",
    selection: "#3c3836",
  },
  {
    id: "gruvbox-light",
    name: "Gruvbox Light",
    bg: "#fbf1c7",
    surface: "#ebdbb2",
    surface2: "#d5c4a1",
    text: "#282828",
    textMuted: "#928374",
    accent: "#af3a03",
    error: "#9d0006",
    success: "#79740e",
    caret: "#af3a03",
    border: "#d5c4a1",
    selection: "#ebdbb2",
  },
  {
    id: "sakura",
    name: "Sakura",
    bg: "#fef6f6",
    surface: "#fcdada",
    surface2: "#f8bebe",
    text: "#5d2e2e",
    textMuted: "#a67474",
    accent: "#e85a71",
    error: "#c0392b",
    success: "#27ae60",
    caret: "#e85a71",
    border: "#f3a5a5",
    selection: "#fcdada",
  },
  {
    id: "lavender",
    name: "Lavender",
    bg: "#f3f0fc",
    surface: "#e1dbf7",
    surface2: "#cfc5f0",
    text: "#3e3857",
    textMuted: "#897ea6",
    accent: "#7c5dfa",
    error: "#e74c3c",
    success: "#2ecc71",
    caret: "#7c5dfa",
    border: "#beb1eb",
    selection: "#e1dbf7",
  },
  {
    id: "carbon",
    name: "Carbon",
    bg: "#161616",
    surface: "#262626",
    surface2: "#393939",
    text: "#f4f4f4",
    textMuted: "#525252",
    accent: "#f1c21b",
    error: "#da1e28",
    success: "#24a148",
    caret: "#f1c21b",
    border: "#393939",
    selection: "#3b3212",
  },
  {
    id: "laserwave",
    name: "Laserwave",
    bg: "#181824",
    surface: "#202130",
    surface2: "#2d2f44",
    text: "#e0e0f5",
    textMuted: "#585a7a",
    accent: "#ffe64d",
    error: "#ff5e97",
    success: "#2cf7b1",
    caret: "#ffe64d",
    border: "#2d2f44",
    selection: "#202130",
  },
  {
    id: "retro",
    name: "Retro",
    bg: "#ece7d5",
    surface: "#dbd5c0",
    surface2: "#c9c2aa",
    text: "#333333",
    textMuted: "#7a7360",
    accent: "#d22630",
    error: "#b22222",
    success: "#2e8b57",
    caret: "#d22630",
    border: "#c0b9a3",
    selection: "#dbd5c0",
  },
  {
    id: "bento",
    name: "Bento",
    bg: "#2d3139",
    surface: "#373c47",
    surface2: "#434a57",
    text: "#f3e3cd",
    textMuted: "#6b7280",
    accent: "#ff5a5f",
    error: "#e12e36",
    success: "#2ea161",
    caret: "#ff5a5f",
    border: "#434a57",
    selection: "#373c47",
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "#030712",
    surface: "#0b1329",
    surface2: "#1e293b",
    text: "#f3f4f6",
    textMuted: "#6b7280",
    accent: "#38bdf8",
    error: "#ef4444",
    success: "#10b981",
    caret: "#38bdf8",
    border: "#1e293b",
    selection: "#0f172a",
  },
  {
    id: "copper",
    name: "Copper",
    bg: "#181210",
    surface: "#2c201b",
    surface2: "#3d2d27",
    text: "#e7d5cf",
    textMuted: "#73564c",
    accent: "#d27d2d",
    error: "#ff5f5f",
    success: "#67c587",
    caret: "#d27d2d",
    border: "#3d2d27",
    selection: "#2c201b",
  },
  {
    id: "matrix",
    name: "Matrix",
    bg: "#000000",
    surface: "#0d0d0d",
    surface2: "#1a1a1a",
    text: "#00ff00",
    textMuted: "#006600",
    accent: "#00ff00",
    error: "#ff3333",
    success: "#00ff00",
    caret: "#00ff00",
    border: "#1a1a1a",
    selection: "#002200",
  },
  {
    id: "rose-pine",
    name: "Rose Pine",
    bg: "#191724",
    surface: "#212030",
    surface2: "#26233a",
    text: "#e0def4",
    textMuted: "#908caa",
    accent: "#ebbcba",
    error: "#eb6f92",
    success: "#9ccfd8",
    caret: "#ebbcba",
    border: "#26233a",
    selection: "#212030",
  },
  {
    id: "honey",
    name: "Honey",
    bg: "#fffdf5",
    surface: "#fbf2d5",
    surface2: "#f5e3ad",
    text: "#4a3b1a",
    textMuted: "#a68d58",
    accent: "#d48c00",
    error: "#c0392b",
    success: "#27ae60",
    caret: "#d48c00",
    border: "#ebd79b",
    selection: "#fbf2d5",
  },
  {
    id: "mint-chocolate",
    name: "Mint Chocolate",
    bg: "#1c1514",
    surface: "#2d2220",
    surface2: "#3d2e2b",
    text: "#f3eceb",
    textMuted: "#7c605c",
    accent: "#a7f3d0",
    error: "#f87171",
    success: "#34d399",
    caret: "#a7f3d0",
    border: "#3d2e2b",
    selection: "#2d2220",
  },
  {
    id: "tangerine",
    name: "Tangerine",
    bg: "#1a1a1a",
    surface: "#242424",
    surface2: "#2e2e2e",
    text: "#f9fafb",
    textMuted: "#6b7280",
    accent: "#ff7a00",
    error: "#ef4444",
    success: "#10b981",
    caret: "#ff7a00",
    border: "#2e2e2e",
    selection: "#242424",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    bg: "#1c3b57",
    surface: "#244a6f",
    surface2: "#2d5a86",
    text: "#e2f1ff",
    textMuted: "#638bb0",
    accent: "#00ffcc",
    error: "#ff5e97",
    success: "#2cf7b1",
    caret: "#00ffcc",
    border: "#2d5a86",
    selection: "#244a6f",
  },
  {
    id: "ghost",
    name: "Ghost",
    bg: "#1e2022",
    surface: "#27292d",
    surface2: "#313439",
    text: "#f5f6f7",
    textMuted: "#5c6066",
    accent: "#a1a5ab",
    error: "#e74c3c",
    success: "#2ecc71",
    caret: "#a1a5ab",
    border: "#313439",
    selection: "#27292d",
  },
];
