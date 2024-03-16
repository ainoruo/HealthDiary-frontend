// vite.config.js
import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // List your html files here, e.g:
        main: resolve(__dirname, 'index.html'),
        diary: resolve(__dirname, 'diary.html'),
        diaries: resolve(__dirname, 'diaries.html'),
        exercise: resolve(__dirname, 'exercise.html'),
        nutrition: resolve(__dirname, 'nutrition.html'),
        hrv: resolve(__dirname, 'hrv.html'),
        medications: resolve(__dirname, 'medication.html'),
        settings: resolve(__dirname, 'settings.html'),
        info: resolve(__dirname, 'info.html'),

      },
    },
  },
  // Public base path could be set here too:
  // base: '/~username/my-app/',
});