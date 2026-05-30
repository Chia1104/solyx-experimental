import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/database/schema',
  out: './.drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
