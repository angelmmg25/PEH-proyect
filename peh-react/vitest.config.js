import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config.js';

// Conserva el plugin de React y la configuración de Vite del proyecto.
export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'node',
    // Solo los casos Vitest: los scripts de verificación manual no se ejecutan aquí.
    include: ['tests/**/*.spec.js'],
    coverage: {
      provider: 'v8',
      // Mide todo el código JS/JSX de la aplicación, aunque no se importe en las pruebas.
      include: ['src/**/*.{js,jsx}'],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      clean: true,
      reportOnFailure: true,
    },
  },
}));
