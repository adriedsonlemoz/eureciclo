/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        app: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      colors: {
        eco: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d',950:'#052e16' },
        surface: { DEFAULT:'#f5fef8', card:'#ffffff', elevated:'#f0fdf4' }
      },
      animation: {
        'fade-up':'fadeUp 0.4s ease-out forwards', 'scale-in':'scaleIn 0.3s ease-out forwards', 'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-left':'slideLeft 0.3s ease-out forwards', 'slide-right':'slideRight 0.3s ease-out forwards', 'bounce-in':'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
      },
      keyframes: {
        fadeUp:{'0%':{opacity:'0',transform:'translateY(16px)'},'100%':{opacity:'1',transform:'translateY(0)'}},
        scaleIn:{'0%':{opacity:'0',transform:'scale(0.95)'},'100%':{opacity:'1',transform:'scale(1)'}},
        slideLeft:{'0%':{opacity:'0',transform:'translateX(24px)'},'100%':{opacity:'1',transform:'translateX(0)'}},
        slideRight:{'0%':{opacity:'0',transform:'translateX(-24px)'},'100%':{opacity:'1',transform:'translateX(0)'}},
        bounceIn:{'0%':{opacity:'0',transform:'scale(0.3)'},'50%':{transform:'scale(1.05)'},'70%':{transform:'scale(0.9)'},'100%':{opacity:'1',transform:'scale(1)'}}
      }
    }
  },
  plugins: []
}
