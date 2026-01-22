import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "480px",
        md: "480px",
        lg: "480px",
        xl: "480px",
        "2xl": "480px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'sans-serif'],
        display: ['"Zen Maru Gothic"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        streak: "hsl(var(--streak))",
        xp: "hsl(var(--xp))",
        level: "hsl(var(--level))",
        // Sakura palette for direct usage
        sakura: {
          50: "hsl(var(--sakura-50))",
          100: "hsl(var(--sakura-100))",
          200: "hsl(var(--sakura-200))",
          300: "hsl(var(--sakura-300))",
          400: "hsl(var(--sakura-400))",
          500: "hsl(var(--sakura-500))",
          600: "hsl(var(--sakura-600))",
          700: "hsl(var(--sakura-700))",
          800: "hsl(var(--sakura-800))",
          900: "hsl(var(--sakura-900))",
        },
        matcha: {
          50: "hsl(var(--matcha-50))",
          100: "hsl(var(--matcha-100))",
          200: "hsl(var(--matcha-200))",
          300: "hsl(var(--matcha-300))",
          400: "hsl(var(--matcha-400))",
          500: "hsl(var(--matcha-500))",
          600: "hsl(var(--matcha-600))",
        },
        kiniro: {
          50: "hsl(var(--kiniro-50))",
          100: "hsl(var(--kiniro-100))",
          200: "hsl(var(--kiniro-200))",
          300: "hsl(var(--kiniro-300))",
          400: "hsl(var(--kiniro-400))",
          500: "hsl(var(--kiniro-500))",
        },
        sumi: {
          50: "hsl(var(--sumi-50))",
          100: "hsl(var(--sumi-100))",
          200: "hsl(var(--sumi-200))",
          300: "hsl(var(--sumi-300))",
          400: "hsl(var(--sumi-400))",
          500: "hsl(var(--sumi-500))",
          600: "hsl(var(--sumi-600))",
          700: "hsl(var(--sumi-700))",
          800: "hsl(var(--sumi-800))",
          900: "hsl(var(--sumi-900))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
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
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(5deg)" },
        },
        "pulse-sakura": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 107, 138, 0.4)" },
          "50%": { boxShadow: "0 0 0 15px rgba(255, 107, 138, 0)" },
        },
        bloom: {
          "0%": { transform: "scale(0) rotate(-45deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        fall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "90%": { opacity: "0.6" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-sakura": "pulse-sakura 2s ease-in-out infinite",
        bloom: "bloom 0.5s ease-out forwards",
        fall: "fall linear infinite",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
        button: "var(--shadow-button)",
        sakura: "var(--shadow-sakura)",
        matcha: "var(--shadow-matcha)",
        kiniro: "var(--shadow-kiniro)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
