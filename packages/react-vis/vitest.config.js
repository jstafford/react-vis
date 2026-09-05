import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createInstrumenter} from 'istanbul-lib-instrument';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(packageRoot, 'src');

export default defineConfig({
  plugins: [react({include: /src\/.*\.[jt]sx?$/})],
  resolve: {
    alias: [
      {find: /^utils\/(.*)$/, replacement: `${sourceRoot}/utils/$1`},
      {find: /^plot\/(.*)$/, replacement: `${sourceRoot}/plot/$1`},
      {find: /^legends\/(.*)$/, replacement: `${sourceRoot}/legends/$1`},
      {
        find: /^parallel-coordinates\/(.*)$/,
        replacement: `${sourceRoot}/parallel-coordinates/$1`
      },
      {find: /^radar-chart\/(.*)$/, replacement: `${sourceRoot}/radar-chart/$1`},
      {find: /^radial-chart\/(.*)$/, replacement: `${sourceRoot}/radial-chart/$1`},
      {find: /^sankey\/(.*)$/, replacement: `${sourceRoot}/sankey/$1`},
      {find: /^sunburst\/(.*)$/, replacement: `${sourceRoot}/sunburst/$1`},
      {find: /^treemap\/(.*)$/, replacement: `${sourceRoot}/treemap/$1`},
      {find: 'theme', replacement: `${sourceRoot}/theme.ts`},
      {find: 'animation', replacement: `${sourceRoot}/animation.tsx`},
      {
        find: 'make-vis-flexible',
        replacement: `${sourceRoot}/make-vis-flexible.tsx`
      }
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      instrumenter: options =>
        createInstrumenter({
          ...options,
          parserPlugins: [
            'jsx',
            'typescript',
            'classProperties',
            'optionalChaining',
            'nullishCoalescingOperator'
          ]
        }),
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/tests/**',
        'src/main.scss',
        'src/types/**',
        '**/*.d.ts'
      ]
    }
  }
});
