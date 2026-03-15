/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#0F6E56',
          dark: '#4ECFA8',
        },
        accent: {
          light: '#D97706',
          dark: '#FCD34D',
        },
        surface: {
          light: '#F8FAFC',
          cardLight: '#FFFFFF',
          borderLight: '#E2E8F0',
          dark: '#0F172A',
          cardDark: '#1E293B',
          borderDark: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      fontSize: {
        body: '14px',
        label: '12px',
        heading: ['18px', '24px']
      },
      borderRadius: {
        card: '12px'
      }
    },
  },
  plugins: [],
}
