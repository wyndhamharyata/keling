import * as v from 'valibot';
import { EventStatusSchema, EventSubtask } from './event';

export const ActionSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty(), v.uuid()),
  event_id: v.pipe(v.string(), v.nonEmpty(), v.uuid()),
  date: v.pipe(v.number()), // Unix timestamp
  subtasks: v.optional(v.array(EventSubtask)),
  status: v.optional(EventStatusSchema),
});

export type Action = v.InferOutput<typeof ActionSchema>;
export type ActionFormInput = v.InferInput<typeof ActionSchema>;
