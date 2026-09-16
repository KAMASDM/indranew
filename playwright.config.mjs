import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:3138', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3138',
    url: 'http://127.0.0.1:3138',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      INDRA_TEST: '1',
      NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'true',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'demo-api-key',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-indra',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo-indra.appspot.com',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'demo-app-id',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo-indra.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: '',
    },
  },
});
