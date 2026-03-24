module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'],
        heading: ['"Poppins"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: 'hsl(40, 30%, 96%)',
        foreground: 'hsl(30, 25%, 15%)',
        border: 'hsl(35, 20%, 88%)',
        input: 'hsl(35, 20%, 88%)',
        ring: 'hsl(28, 95%, 58%)',
        primary: {
          DEFAULT: 'hsl(28, 95%, 58%)',
          foreground: 'hsl(0, 0%, 100%)',
          hover: 'hsl(28, 95%, 50%)',
          active: 'hsl(28, 95%, 44%)',
        },
        secondary: {
          DEFAULT: 'hsl(355, 78%, 62%)',
          foreground: 'hsl(0, 0%, 100%)',
          hover: 'hsl(355, 78%, 54%)',
          active: 'hsl(355, 78%, 48%)',
        },
        tertiary: {
          DEFAULT: 'hsl(40, 40%, 94%)',
          foreground: 'hsl(30, 25%, 15%)',
        },
        accent: {
          DEFAULT: 'hsl(150, 55%, 46%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        muted: {
          DEFAULT: 'hsl(40, 20%, 93%)',
          foreground: 'hsl(35, 12%, 52%)',
        },
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(30, 25%, 15%)',
        },
        popover: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(30, 25%, 15%)',
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
          DEFAULT: 'hsl(38, 92%, 50%)',
          foreground: 'hsl(0, 0%, 100%)',
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
          DEFAULT: 'hsl(30, 20%, 18%)',
          hover: 'hsl(30, 18%, 24%)',
          active: 'hsl(28, 80%, 55%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(35, 15%, 62%)',
          border: 'hsl(30, 15%, 24%)',
        },
        neutral: {
          50: 'hsl(40, 30%, 98%)',
          100: 'hsl(40, 25%, 94%)',
          200: 'hsl(38, 20%, 88%)',
          300: 'hsl(36, 15%, 78%)',
          400: 'hsl(34, 10%, 64%)',
          500: 'hsl(32, 8%, 52%)',
          600: 'hsl(30, 8%, 42%)',
          700: 'hsl(30, 10%, 32%)',
          800: 'hsl(30, 14%, 22%)',
          900: 'hsl(30, 20%, 14%)',
        },
        'status-truoc-han': 'hsl(222, 40%, 12%)',
        'status-can-han': 'hsl(38, 92%, 50%)',
        'status-dung-han': 'hsl(213, 94%, 55%)',
        'status-tre-han': 'hsl(0, 86%, 53%)',
        'status-qua-han': 'hsl(0, 80%, 35%)',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px hsl(222, 45%, 12%, 0.06)',
        md: '0 2px 8px hsl(222, 45%, 12%, 0.08), 0 1px 2px hsl(222, 45%, 12%, 0.04)',
        lg: '0 4px 16px hsl(222, 45%, 12%, 0.10), 0 2px 4px hsl(222, 45%, 12%, 0.06)',
        xl: '0 8px 24px hsl(222, 45%, 12%, 0.14), 0 4px 8px hsl(222, 45%, 12%, 0.08)',
        sidebar: '4px 0 24px hsl(222, 45%, 12%, 0.15)',
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
