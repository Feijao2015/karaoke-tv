/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '4xl': '2.5rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
        '8xl': '6rem',
      },
      spacing: {
        '128': '32rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
  // Optimize for production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    options: {
      safelist: [
        // Add any classes that are dynamically created
        /^bg-/,
        /^text-/,
        'opacity-0',
        'opacity-100',
      ],
    },
  },
  // Disable features not needed for Tizen
  corePlugins: {
    container: false,
    float: false,
    objectFit: false,
    objectPosition: false,
    overscrollBehavior: false,
    placeholderColor: false,
    placeholderOpacity: false,
    ringColor: false,
    ringOffsetColor: false,
    ringOffsetWidth: false,
    ringOpacity: false,
    ringWidth: false,
  }
}; 