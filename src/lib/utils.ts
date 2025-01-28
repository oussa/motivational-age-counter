import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert HSL to RGB
export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Generate a random color in HSL then convert to hex
export const getRandomColor = (isBackground: boolean) => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30) + 70; // 70-100% saturation for vibrant colors
  // Different lightness ranges for background and text to ensure contrast
  const l = isBackground 
    ? Math.floor(Math.random() * 30) + 15  // 15-45% lightness for darker backgrounds
    : Math.floor(Math.random() * 20) + 80; // 80-100% lightness for lighter text
  return hslToHex(h, s, l);
};

export const getRandomTheme = () => {
  const bg = getRandomColor(true);   // Generate dark background
  const main = getRandomColor(false); // Generate light text color
  return { bg, main };
};
