/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF9F5',
        surface: '#FFFFFF',
        'surface-subtle': '#F5F4EE',
        brand: {
          50: '#EEF6FC',
          100: '#DCEBF8',
          200: '#C4DFF5',
          300: '#A9CFEE',
          400: '#7EB3E0',
          500: '#5B9FD6',
          600: '#4288C2',
          700: '#2F6EA3',
          800: '#23547D',
        },
        ink: {
          DEFAULT: '#1E3246',
          secondary: '#3D5369',
        },
        muted: '#6B7F92',
        border: {
          DEFAULT: '#E5EEF6',
          subtle: '#DCEBF8',
        },
        good: {
          DEFAULT: '#4EAB7E',
          bg: '#EDF7F2',
        },
        warn: {
          DEFAULT: '#E09B3D',
          bg: '#FDF6EC',
        },
        bad: {
          DEFAULT: '#E26D6D',
          bg: '#FDF1F1',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(30, 50, 70, 0.04)',
        card: '0 2px 12px rgba(30, 50, 70, 0.06)',
        hover: '0 8px 24px rgba(30, 50, 70, 0.09)',
        float: '0 16px 40px rgba(30, 50, 70, 0.12)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(1deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(8px) rotate(-1deg)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'float-reverse': 'float-reverse 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
