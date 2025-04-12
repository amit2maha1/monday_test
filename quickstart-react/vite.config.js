import { defineConfig,loadEnv } from 'vite';
import react from '@vitejs/plugin-react';



export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      outDir: 'build',
    },
    define: {
      'process.env.SOME_KEY': JSON.stringify(env.SOME_KEY)
    },
    plugins: [react()],
    server: {
      port: 8301,
    }
  };
});