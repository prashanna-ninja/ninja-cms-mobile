/** @type {import('tailwindcss').Config} */
module.exports = {
  // Files Tailwind scans for className usage. Everything lives under src/.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // Required for NativeWind (adds RN-specific Tailwind behaviour).
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Colours read from the HSL CSS variables in src/global.css (shadcn / React Native
      // Reusables convention, so RNR components drop in without extra config).
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Brand font (web uses Bricolage Grotesque everywhere). Family names MUST match
      // the keys in src/lib/fonts.ts.
      fontFamily: {
        sans: ["BricolageGrotesque_400Regular"],
        "sans-medium": ["BricolageGrotesque_500Medium"],
        "sans-semibold": ["BricolageGrotesque_600SemiBold"],
        display: ["BricolageGrotesque_700Bold"],
      },
    },
  },
  plugins: [],
};
