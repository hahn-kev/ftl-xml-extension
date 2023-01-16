import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {viteSingleFile} from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  root: './src/web-views',
  plugins: [
    svelte(),
    viteSingleFile({removeViteModuleLoader: true})
  ],
  build: {
    outDir: './html',
    minify: false
  }
});
