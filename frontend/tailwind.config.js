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
          light: '#3B82F6', // Modern Blue
          DEFAULT: '#2563EB',
          dark: '#60A5FA',
        },
        accent: {
          light: '#F59E0B',
          dark: '#FBBF24',
        },
        surface: {
          light: '#F8FAFC',
          cardLight: '#FFFFFF',
          borderLight: '#F1F5F9',
          dark: '#0F172A',
          cardDark: '#1E293B',
          borderDark: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        '3xl': '24px',
        '2xl': '20px',
        'xl': '16px',
        'lg': '12px',
        card: '24px'
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
        'active': '0 10px 30px -5px rgba(59, 130, 246, 0.2)',
      }
    },
  },
  plugins: [],
}
