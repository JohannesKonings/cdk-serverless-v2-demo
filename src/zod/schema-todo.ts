import * as z from 'zod';

export const schemaTodoApi = z.object({
  id: z.string().uuid(),
  state: z.enum(['OPEN', 'IN PROGRESS', 'DONE']).default('OPEN'),
  title: z.string(),
  finishedInDays: z.number().int().positive(),
  notificationsEmail: z.string().email(),
  description: z.string().optional(),
  lastUpdate: z.string().datetime(),
});

export const schemaAddTodoApi = schemaTodoApi.omit({
  id: true,
  state: true,
  lastUpdate: true,
});

export const schemaTodoDdb = schemaTodoApi.extend({
  lastUpdated: z.string().datetime(),
}).omit({ lastUpdate: true });

