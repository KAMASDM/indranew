v// Updated tailwind.config.js with beautiful teal colors
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Custom teal variations for better design
        'soft-teal': {
          50: '#f0fffe',
          100: '#d1fafe',
          200: '#a3f3fd',
          300: '#67e8fb',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        'teal': '0 4px 14px 0 rgba(20, 184, 166, 0.39)',
        'soft-teal': '0 4px 20px 0 rgba(34, 211, 238, 0.35)',
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(135deg, #14b8a6, #2dd4bf)',
        'gradient-soft-teal': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
        'gradient-teal-blue': 'linear-gradient(135deg, #0891b2, #0ea5e9)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}