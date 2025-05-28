/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme'); // Import default theme

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // This line correctly sets 'Inter' as the primary font for 'font-sans'
        // and includes Tailwind's default sans-serif fallbacks for robustness.
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          50: '#e6edff',
          100: '#c0d1ff',
          200: '#99b4ff',
          300: '#7397ff',
          400: '#4c7aff',
          500: '#265df6',
          600: '#0F52BA', // Main primary
          700: '#0040ab',
          800: '#00308c',
          900: '#00206d',
        },
        secondary: {
          50: '#e6f7ff',
          100: '#b8e7ff',
          200: '#8ad8ff',
          300: '#5cc8ff',
          400: '#2eb8ff',
          500: '#00a8ff',
          600: '#0098e6',
          700: '#0078b3',
          800: '#005980',
          900: '#003a4d',
        },
        accent: {
          50: '#fff2e6',
          100: '#ffdcc0',
          200: '#ffc699',
          300: '#ffb073',
          400: '#ff9a4c',
          500: '#ff8426',
          600: '#e67522',
          700: '#b35a1a',
          800: '#804013',
          900: '#4d260b',
        },
        success: {
          50: '#e8f7ed',
          100: '#c5ebcd',
          200: '#9fdeae',
          300: '#79d28e',
          400: '#52c56e',
          500: '#2cb94f',
          600: '#27a747',
          700: '#1f8237',
          800: '#175d27',
          900: '#0f3917',
        },
        warning: {
          50: '#fff9e6',
          100: '#ffefbf',
          200: '#ffe599',
          300: '#ffdb73',
          400: '#ffd14d',
          500: '#ffc726',
          600: '#e6b322',
          700: '#b38c1a',
          800: '#806413',
          900: '#4d3c0b',
        },
        error: {
          50: '#fce8e8',
          100: '#f7c5c5',
          200: '#f19f9f',
          300: '#ec7979',
          400: '#e65252',
          500: '#e12c2c',
          600: '#cb2727',
          700: '#9e1f1f',
          800: '#711616',
          900: '#440d0d',
        },
        neutral: {
          50: '#f5f5f5',
          100: '#e6e6e6',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#1a1a1a',
        },
      },
      boxShadow: {
        card: '0 4px 8px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};