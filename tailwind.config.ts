const colors = {
  border: "#e5e7eb",
  input: "#e5e7eb",
  ring: "#0a0a0a",
  background: "#f4f1f1",
  foreground: "#0a0a0a",
  primary: {
    DEFAULT: "#DC5648",
    foreground: "#fefefe",
  },
  secondary: {
    DEFAULT: "#bbacaa",
    foreground: "#0a0a0a",
  },
  destructive: {
    DEFAULT: "#bf4040",
    foreground: "#f9fafb",
  },
  muted: {
    DEFAULT: "#ddd5d9",
    foreground: "#3d434c",
  },
  subtle: {
    DEFAULT: "rgba(0, 0, 0, 0.2)",
  },
  accent: {
    DEFAULT: "#724CF9",
    foreground: "#fefefe",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  error: "#ed311d",
  warning: "#f49a34",
  alert: "#479edc",
  info: "#0a50ff",
  help: "#6a2cce",
} as const;

export type Colors = typeof colors;

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{ts,tsx,css}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: "0.69rem",
        sm: "0.83rem",
        base: "1rem",
        lg: "1.2rem",
        xl: "1.44rem",
        "2xl": "1.73rem",
        "3xl": "2.07rem",
        "4xl": "2.49rem",
        "5xl": "2.99rem",
        "6xl": "3.58rem",
        "7xl": "4.3rem",
      },
      container: {
        padding: "1.5rem",
      },
      colors,
      borderWidth: {
        1: "1px",
      },
    },
  },
};

export default config;
