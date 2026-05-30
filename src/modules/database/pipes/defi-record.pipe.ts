import { createInsertSchema } from 'drizzle-orm/zod';
import * as z from 'zod';

import { defiRecord } from '../schema/defi-record.schema';

export const InsertDefiRecordInput = createInsertSchema(defiRecord).omit({
  id: true,
  recordKey: true,
});

export type InsertDefiRecordInput = z.infer<typeof InsertDefiRecordInput>;

export const InsertRecordsParams = z.array(InsertDefiRecordInput).max(100);

export type InsertRecordsParams = z.infer<typeof InsertRecordsParams>;
