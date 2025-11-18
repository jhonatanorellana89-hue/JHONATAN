/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0A0C10',
        'panel': '#11151C',
        'card': 'rgba(17, 21, 28, 0.6)',
        'muted': '#7D8590',
        'accent': '#388BFD', // A slightly less saturated blue
        'accent-2': '#1F6FEB',
        'accent-teal': '#26A69A', // Dark teal for accents
        'growth': '#2DA44E',
        'danger': '#E5534B',
        'info': '#A371F7',
        'warning': '#D29922',
        'achievement': '#D2A8FF',
        'primary': '#E6EDF3',
        'subtle': 'rgba(230, 237, 243, 0.1)',
        'border': 'rgba(230, 237, 243, 0.1)',
        'border-subtle': 'rgba(230, 237, 243, 0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'glow-accent': '0 0 15px 0 rgba(56, 139, 253, 0.2)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      }
    }
  },
  plugins: [],
}
