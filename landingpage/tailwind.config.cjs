/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'Inter', 'system-ui', 'sans-serif'],
        thai: ['Prompt', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d8f1ff',
          200: '#b9e7ff',
          300: '#89d9ff',
          400: '#52c3ff',
          500: '#22a4ff',
          600: '#0a83e5',
          700: '#0468b8',
          800: '#075791',
          900: '#0c496e'
        }
      }
    }
  },
  plugins: []
};
