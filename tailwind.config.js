module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Nunito"', 'sans-serif'],
        heading: ['"Nunito"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        /* === RETRO ORANGE + DARK NAVY THEME === */
        background: 'hsl(220, 28%, 10%)',
        foreground: 'hsl(38, 80%, 92%)',
        border: 'hsl(220, 22%, 20%)',
        input: 'hsl(220, 22%, 18%)',
        ring: 'hsl(28, 100%, 55%)',
        primary: {
          DEFAULT: 'hsl(28, 100%, 55%)',
          foreground: 'hsl(220, 40%, 8%)',
          hover: 'hsl(28, 100%, 48%)',
          active: 'hsl(28, 100%, 40%)',
        },
        secondary: {
          DEFAULT: 'hsl(220, 60%, 30%)',
          foreground: 'hsl(38, 80%, 92%)',
          hover: 'hsl(220, 60%, 36%)',
          active: 'hsl(220, 60%, 42%)',
        },
        tertiary: {
          DEFAULT: 'hsl(220, 30%, 16%)',
          foreground: 'hsl(38, 80%, 92%)',
        },
        accent: {
          DEFAULT: 'hsl(38, 90%, 62%)',
          foreground: 'hsl(220, 40%, 8%)',
        },
        muted: {
          DEFAULT: 'hsl(220, 25%, 15%)',
          foreground: 'hsl(220, 15%, 58%)',
        },
        card: {
          DEFAULT: 'hsl(220, 30%, 13%)',
          foreground: 'hsl(38, 80%, 92%)',
        },
        popover: {
          DEFAULT: 'hsl(220, 30%, 13%)',
          foreground: 'hsl(38, 80%, 92%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 78%, 54%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        success: {
          DEFAULT: 'hsl(150, 55%, 40%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 55%)',
          foreground: 'hsl(220, 40%, 8%)',
        },
        error: {
          DEFAULT: 'hsl(0, 78%, 54%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        info: {
          DEFAULT: 'hsl(200, 88%, 52%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        sidebar: {
          DEFAULT: 'hsl(220, 35%, 8%)',
          hover: 'hsl(220, 32%, 14%)',
          active: 'hsl(28, 100%, 55%)',
          foreground: 'hsl(38, 80%, 92%)',
          muted: 'hsl(220, 18%, 48%)',
          border: 'hsl(220, 28%, 16%)',
        },
        neutral: {
          50: 'hsl(220, 28%, 96%)',
          100: 'hsl(220, 25%, 88%)',
          200: 'hsl(220, 22%, 74%)',
          300: 'hsl(220, 18%, 58%)',
          400: 'hsl(220, 16%, 44%)',
          500: 'hsl(220, 15%, 34%)',
          600: 'hsl(220, 18%, 26%)',
          700: 'hsl(220, 22%, 20%)',
          800: 'hsl(220, 28%, 14%)',
          900: 'hsl(220, 35%, 9%)',
        },
        'status-truoc-han': 'hsl(28, 100%, 55%)',
        'status-can-han': 'hsl(38, 92%, 55%)',
        'status-dung-han': 'hsl(199, 88%, 55%)',
        'status-tre-han': 'hsl(0, 86%, 53%)',
        'status-qua-han': 'hsl(0, 80%, 38%)',
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '5px',
        md: '5px',
        lg: '7px',
        xl: '9px',
        '2xl': '12px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px hsl(220, 60%, 4%, 0.30)',
        md: '0 2px 8px hsl(220, 60%, 4%, 0.40), 0 1px 2px hsl(220, 60%, 4%, 0.20)',
        lg: '0 4px 16px hsl(220, 60%, 4%, 0.50), 0 2px 4px hsl(220, 60%, 4%, 0.25)',
        xl: '0 8px 24px hsl(220, 60%, 4%, 0.60), 0 4px 8px hsl(220, 60%, 4%, 0.30)',
        sidebar: '4px 0 24px hsl(220, 60%, 4%, 0.50)',
      },
      fontSize: {
        'h1': ['30px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.03em' }],
        'h2': ['22px', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.025em' }],
        'h3': ['18px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h4': ['16px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'body-lg': ['17px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      maxWidth: {
        'app': '1440px',
      },
      animation: {
        'count-up': 'countUp 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 200ms ease-out',
        'toast-in': 'toastIn 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
