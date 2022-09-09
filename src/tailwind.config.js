/*
 * This config partially overwrites and extends the default Tailwind config:
 * https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./lib/**/*.{ts,tsx,js}'],
  // Disable unneeded components to reduce performance impact
  corePlugins: {
    float: false,
    clear: false,
    skew: false,
    caretColor: false,
    sepia: false,
  },
  // Enable dark mode if body has "dark" class names
  darkMode: 'class',
  theme: {
    // Make default border radius more rounded
    borderRadius: {
      none: '0px',
      xs: '0.125rem',
      sm: '0.25rem',
      DEFAULT: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
    extend: {
      colors: {
        // Specify brand colors
        brand: {
          100: 'var(--accent-color-100)',
          200: 'var(--accent-color-200)',
          300: 'var(--accent-color-300)',
          400: 'var(--accent-color-400)',
          500: 'var(--accent-color-500)',
        },
        // Some in-between shades:
        gray: {
          350: 'hsl(218deg 12% 79%)',
        },
        yellow: {
          250: 'hsl(53deg 98% 72%)',
        },
        indigo: {
          350: 'hsl(232deg 92% 79%)',
        },
        neutral: {
          350: 'hsl(0deg 0% 73%)',
        },
      },
      spacing: {
        'table-icon': '1.25rem',
      },
      brightness: {
        70: '.7',
        80: '.8',
      },
      transitionDuration: {
        0: '0ms',
      },
      keyframes: {
        'hue-rotate': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
