
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Poppins', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'spin-slow': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'rotate-zoom': {
          '0%': { transform: 'scale(0.2) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(0.5) rotate(360deg)', opacity: '0' },
        },
        'splash-fade-out': {
            '0%, 50%': { opacity: '0' },
            '60%': { opacity: '1' },
            '100%': { opacity: '0' },
        },
        'splash-facebook': {
          '0%, 50%': { transform: 'translate(-50%, -50%) scale(0)' },
          '80%': { transform: 'translate(-200%, -200%) scale(1.5)', opacity: '1' },
          '100%': { transform: 'translate(-250%, -250%) scale(1.5)', opacity: '0' },
        },
        'splash-twitter': {
          '0%, 50%': { transform: 'translate(-50%, -50%) scale(0)' },
          '80%': { transform: 'translate(100%, -200%) scale(1.5)', opacity: '1' },
          '100%': { transform: 'translate(150%, -250%) scale(1.5)', opacity: '0' },
        },
        'splash-youtube': {
          '0%, 50%': { transform: 'translate(-50%, -50%) scale(0)' },
          '80%': { transform: 'translate(-200%, 100%) scale(1.5)', opacity: '1' },
          '100%': { transform: 'translate(-250%, 150%) scale(1.5)', opacity: '0' },
        },
        'splash-blogger': {
          '0%, 50%': { transform: 'translate(-50%, -50%) scale(0)' },
          '80%': { transform: 'translate(100%, 100%) scale(1.5)', opacity: '1' },
          '100%': { transform: 'translate(150%, 150%) scale(1.5)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-slow': 'spin-slow 5s linear infinite',
        'rotate-zoom': 'rotate-zoom 2.5s ease-in-out infinite',
        'splash-fade-out': 'splash-fade-out 2.5s ease-in-out infinite',
        'splash-facebook': 'splash-facebook 2.5s ease-in-out infinite',
        'splash-twitter': 'splash-twitter 2.5s ease-in-out infinite',
        'splash-youtube': 'splash-youtube 2.5s ease-in-out infinite',
        'splash-blogger': 'splash-blogger 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
