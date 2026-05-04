import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border) / 0.10)",
        "border-strong": "hsl(var(--border-strong) / 0.18)",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
          glass: "hsl(var(--surface-glass))",
        },
        neon: {
          DEFAULT: "hsl(var(--neon))",
          glow: "hsl(var(--neon-glow))",
        },
        metal: {
          light: "hsl(var(--metal-light))",
          mid: "hsl(var(--metal-mid))",
          dark: "hsl(var(--metal-dark))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fragment Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-metal": "var(--gradient-metal)",
        "gradient-obsidian": "var(--gradient-obsidian)",
        "gradient-glass": "var(--gradient-glass)",
        "gradient-neon": "var(--gradient-neon)",
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        dial: "var(--shadow-dial)",
        neon: "var(--shadow-neon)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-neon": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        "breathe": {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
        "state-breathe": {
          "0%, 100%": { opacity: "0.28", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.015)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.12" },
          "50%": { opacity: "0.22" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-neon": "pulse-neon 3.2s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "state-breathe": "state-breathe 6.5s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
