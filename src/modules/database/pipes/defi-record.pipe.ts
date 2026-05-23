import { createInsertSchema } from 'drizzle-orm/zod';
import * as z from 'zod';

import { defiRecord } from '../schema/defi-record.schema';

export const InsertRecordsParams = z.array(createInsertSchema(defiRecord)).max(100);

export type InsertRecordsParams = z.infer<typeof InsertRecordsParams>;
