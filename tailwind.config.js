/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'pixel': ['"DotGothic16"', 'sans-serif'],
            },
            colors: {
                'pixel-dark': '#0f0f1a',
                'pixel-card': '#1a1a2e',
                'pixel-green': '#4ade80',
                'pixel-pink': '#f472b6',
                'pixel-yellow': '#facc15',
                'neon-blue': '#00ffff',
                'neon-pink': '#ff00ff',
                'neon-green': '#00ff00',
                'neon-yellow': '#ffff00',
            }
        },
    },
    plugins: [],
}
