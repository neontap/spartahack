import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-gantari)", "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        'rating-green': 'hsl(var(--rating-green))',
        'rating-yellow': 'hsl(var(--rating-yellow))',
        'rating-red': 'hsl(var(--rating-red))',
        'rating-blue': 'hsl(var(--rating-blue))',
        'rating-red-faint': 'hsl(var(--rating-red-faint))',
        'rating-yellow-faint': 'hsl(var(--rating-yellow-faint))',
        'rating-green-faint': 'hsl(var(--rating-green-faint))',
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        'rbc-purple': {
          DEFAULT: '#4F3078',
          // light: '#6B4A94',    // Lighter shade
          // dark: '#3D2559',     // Darker shade
        },
        'drk-purple': {
          DEFAULT: '#5f477d'
        },
        'md-purple': {
          DEFAULT: '#B9A5E4'
        },
        'slight-purple': {
          DEFAULT: '#F9F6FF'
        },
        'glow-purple' : {
          DEFAULT: '#A084DC'
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
