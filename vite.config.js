import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    // 重要：部署到 GitHub Pages 時，如果你的網址是 https://username.github.io/repo-name/
    // 請將底下的 '/trade-command-center/' 改為 '/repo-name/'
    base: '/trade-command-center/',
})
