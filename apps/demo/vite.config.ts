import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const demoDir = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [react(), tailwindcss()],
    server: {
        fs: {
            allow: [path.resolve(demoDir, '../..')],
        },
    },
})