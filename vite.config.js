import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                welcome: resolve(__dirname, 'src/index.welcome.html')
            }
        }
    },
    plugins: [
        tailwindcss(),
    ],
});