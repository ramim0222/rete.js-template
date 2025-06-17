/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
    "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
    "./vendor/laravel/jetstream/**/*.blade.php",
    "./storage/framework/views/*.php",
    "./resources/views/**/*.blade.php",
  ],
  theme: {
    extend: {
      colors: {
        'accent': 'var(--color-accent)',
        'accent-content': 'var(--color-accent-content)',
        'accent-foreground': 'var(--color-accent-foreground)',
        'zinc': {
          '50': 'var(--color-zinc-50)',
          '100': 'var(--color-zinc-100)',
          '200': 'var(--color-zinc-200)',
          '300': 'var(--color-zinc-300)',
          '400': 'var(--color-zinc-400)',
          '500': 'var(--color-zinc-500)',
          '600': 'var(--color-zinc-600)',
          '700': 'var(--color-zinc-700)',
          '800': 'var(--color-zinc-800)',
          '900': 'var(--color-zinc-900)',
          '950': 'var(--color-zinc-950)',
        }
      },
      spacing: {
        '2': '0.5rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
      },
      gap: {
        '2': '0.5rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
      },
      ringColor: {
        'accent': 'var(--color-accent)',
      },
      ringOffsetColor: {
        'accent-foreground': 'var(--color-accent-foreground)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 