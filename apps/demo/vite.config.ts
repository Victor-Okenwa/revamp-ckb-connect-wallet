import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const demoDir = path.dirname(fileURLToPath(import.meta.url))
const kitEntry = path.resolve(demoDir, '../../packages/ckb-connect-wallet-kit/src/index.ts')

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
        tsconfigPaths: true,
        alias: {
            'ckb-connect-wallet-kit': kitEntry,
        },
    },
    server: {
        fs: {
            allow: [path.resolve(demoDir, '../..')],
        },
    },
})