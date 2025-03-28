/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F8F9FB",
        secondary: "#452372",
        secondaryLight: "#6B4C9A",
        accent: "#E6A65D",
        background: "#F8F9FB",
        textPrimary: "#1A1F36",
        textSecondary: "#6B7280",
        success: "#34D399",
        warning: "#FBBF24",
        error: "#EF4444",
        info: "#60A5FA",
        tertiary: "#272626",
        gray: {
          10: "#EEEEEE",
          20: "#A2A2A2",
          30: "#7B7B7B",
          50: "#585858",
          90: "#141414",
        },
      },
      fontSize: {
        'h1': '24px',
        'h2': '20px',
        'h3': '16px',
        'body': '14px',
        'small': '12px',
      },
      fontWeight: {
        heading: '600',
        normal: '400',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'card': '8px',
        'button': '6px',
      },
      screens: {
        xs: "400px",
        "3xl": "1680px",
        "4xl": "2200px",
      },
    },
  },
  plugins: [],
}

