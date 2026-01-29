
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/profile/', // Set this to your repository name
  build: {
    rollupOptions: {
      external: ['react-markdown', 'remark-gfm'],
      output: {
        globals: {
          'react-markdown': 'ReactMarkdown',
          'remark-gfm': 'remarkGfm'
        }
      }
    }
  }
});
