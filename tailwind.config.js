/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'primary-color': 'var(--primary-color)',
        'primary-color-dark': 'var(--primary-color-dark)',
        'secondary-color': 'var(--secondary-color)',
        'accent-color': 'var(--accent-color)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.7s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.7s ease-out forwards',
        'slide-in-right': 'slideInRight 0.7s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translate3d(0, 30px, 0)' },
          'to': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        fadeInDown: {
          'from': { opacity: '0', transform: 'translate3d(0, -30px, 0)' },
          'to': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        slideInLeft: {
          'from': { opacity: '0', transform: 'translate3d(-30px, 0, 0)' },
          'to': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translate3d(30px, 0, 0)' },
          'to': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
