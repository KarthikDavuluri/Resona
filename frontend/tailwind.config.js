/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#070809",
        sidebar: "#111314",
        surface: "#151718",
        "surface-card": "#1A1D1F",
        "surface-dark": "#0D0E0F",
        ink: "#F5F7F8",
        "ink-muted": "#9CA3A8",
        "ink-faint": "#697177",
        edge: "#2A2E31",
        "edge-strong": "#3A3F44",
        cyan: "#00CFFF",
        resona: {
          cyan: "#00CFFF",
          "cyan-bg": "rgba(0, 207, 255, 0.1)",
          success: "#10B981",
          "success-bg": "rgba(16, 185, 129, 0.1)",
          failure: "#EF4444",
          "failure-bg": "rgba(239, 68, 68, 0.1)",
          warning: "#F59E0B",
          "warning-bg": "rgba(245, 158, 11, 0.1)",
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
