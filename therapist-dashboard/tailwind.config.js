/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F3EE',
        surface:    '#FFFFFF',
        'surface-2': '#EDE8E0',
        border:     '#E2DBD1',
        'border-strong': '#C9BDB1',

        brand: {
          DEFAULT: '#2E7D5A',
          light:   '#3D8C6E',
          dark:    '#1F6348',
          muted:   '#EBF5F0',
          faint:   '#F4FAF6',
        },

        text: {
          DEFAULT:   '#1C1917',
          secondary: '#57534E',
          muted:     '#A8A29E',
        },

        mood: {
          1: '#DC4444',
          2: '#E8721A',
          3: '#CA9B0E',
          4: '#2E9E56',
          5: '#1F7A40',
        },
      },

      fontFamily: {
        sans:    ['Space Grotesk', 'Arial', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },

      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.025em',
        tight:    '-0.015em',
        snug:     '-0.01em',
        wide:     '0.06em',
        widest:   '0.12em',
      },

      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },

      boxShadow: {
        'card':       '0 0 0 1px rgba(28,25,23,0.07), 0 1px 4px rgba(28,25,23,0.04)',
        'card-hover': '0 0 0 1px rgba(28,25,23,0.12), 0 4px 16px rgba(28,25,23,0.08)',
        'elevated':   '0 0 0 1px rgba(28,25,23,0.09), 0 16px 40px rgba(28,25,23,0.1)',
        'brand':      '0 0 20px rgba(46,125,90,0.2)',
        'brand-hover':'0 0 36px rgba(46,125,90,0.32)',
      },

      transitionTimingFunction: {
        'expo':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}
