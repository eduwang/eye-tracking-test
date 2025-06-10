// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'


export default defineConfig({
  build: {
    target: 'es2017',      // 대부분 브라우저 대응하면서도 최적화
    sourcemap: false,      // 배포시 디버깅 정보 제거
    minify: 'esbuild',     // 기본 minifier (빠르고 가벼움)
    outDir: 'dist',        // 출력 디렉토리
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})
