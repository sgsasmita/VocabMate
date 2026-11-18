/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF8F4',
        plum: {
          50: '#F6F2F8',
          100: '#EDE4F1',
          200: '#DBC8E3',
          300: '#C3A9D2',
          400: '#9C7AB4',
          500: '#7A5493',
          600: '#623F7A',
          700: '#49305D',
          800: '#3A2649',
          900: '#2C1D38',
        },
        lavender: {
          100: '#F1ECFA',
          200: '#E6DCF6',
          300: '#DCD1F0',
          400: '#C9B8E8',
        },
        butter: {
          100: '#FBF6DC',
          200: '#F9EFC4',
          300: '#F4E6A8',
          400: '#EFD87F',
        },
        peach: {
          100: '#FBEFE7',
          200: '#F7DDCD',
          300: '#F2C9B0',
          400: '#EBB08C',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(73, 48, 93, 0.08)',
        card: '0 8px 30px -8px rgba(73, 48, 93, 0.12)',
        lift: '0 20px 50px -12px rgba(73, 48, 93, 0.22)',
        orb: '0 0 60px -10px rgba(220, 209, 240, 0.6)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        orbPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        orbListen: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.18)', opacity: '1' },
        },
        orbThink: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        orbSpeak: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '25%': { transform: 'scale(1.12)', opacity: '1' },
          '50%': { transform: 'scale(0.95)', opacity: '0.85' },
          '75%': { transform: 'scale(1.15)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out both',
        fadeInScale: 'fadeInScale 0.4s ease-out both',
        orbPulse: 'orbPulse 3s ease-in-out infinite',
        orbListen: 'orbListen 1s ease-in-out infinite',
        orbThink: 'orbThink 1.8s linear infinite',
        orbSpeak: 'orbSpeak 0.8s ease-in-out infinite',
        ripple: 'ripple 2s ease-out infinite',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
