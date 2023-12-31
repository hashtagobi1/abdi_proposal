/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'Oi': ['Bodoni Moda', 'serif'],
        'LU_Bold': ['London-Bold', 'sans-serif'],
        'LU_Heavy': ['London-Heavy', 'sans-serif'],
        'LU_Regular': ['London-Regular', 'sans-serif'],
        'LU_Medium': ['London-Medium', 'sans-serif'],
      },
      colors: {
        'mainYellow': '#FEC514',
        'DT_Orange': "#D8592C",
        'DT_Yellow': "#EEE97E",
      },
      animation: {
        marquee: 'marquee 12s linear infinite',
        marquee2: 'marquee2 12s linear infinite',

      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      }
    },
  },
  plugins: [],
}
