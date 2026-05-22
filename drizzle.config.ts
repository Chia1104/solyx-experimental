import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/database/schema/defi-record.schema.ts',
  out: './.drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
