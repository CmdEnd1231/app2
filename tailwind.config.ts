import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effcf9',
          100: '#d7f7ef',
          200: '#b3eddc',
          300: '#7edec4',
          400: '#43c3a3',
          500: '#21a587',
          600: '#16856e',
          700: '#14695a',
          800: '#145349',
          900: '#14453e'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(16, 24, 40, 0.08)',
      }
    },
  },
  plugins: [],
} satisfies Config
