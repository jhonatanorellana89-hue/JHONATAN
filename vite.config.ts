import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json';

// Extrae el nombre del repositorio de la URL de la página de inicio
const repoName = packageJson.homepage ? new URL(packageJson.homepage).pathname : '/';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: repoName,
})
