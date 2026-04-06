import * as v from 'valibot';
import { isValidCron } from 'cron-validator';

export const EventStatusSchema = v.picklist(['todo', 'snoozed', 'done', 'skipped']);
export const EventPrioritySchema = v.picklist(['low', 'medium', 'high']);

export const EventSubtask = v.object({
  label: v.pipe(v.string(), v.minLength(1, 'Subtask label could not be empty')),
  isDone: v.boolean(),
});

export const EventSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty(), v.uuid()),
  title: v.pipe(
    v.string(),
    v.minLength(1, 'Title is required'),
    v.minLength(3, 'Title must be at least 3 characters long'),
    v.maxLength(100, 'Title must be less than 100 characters long'),
  ),
  description: v.optional(v.string(), ''),
  priority: v.optional(EventPrioritySchema, 'low'),
  labels: v.array(v.string()),
  schedule: v.pipe(
    v.string(),
    v.minLength(1, 'Schedule is required'),
    v.check((s) => isValidCron(s), 'Invalid cron schedule format'),
  ),
  status: v.optional(EventStatusSchema, 'todo'),
  subtasks: v.optional(v.array(EventSubtask)),
});

export type EventStatus = v.InferOutput<typeof EventStatusSchema>;
export type EventPriority = v.InferOutput<typeof EventPrioritySchema>;
export type EventItem = v.InferOutput<typeof EventSchema>;
export type EventFormInput = v.InferInput<typeof EventSchema>;

export const EMPTY_EVENT_ITEM: EventItem = {
  id: '',
  title: '',
  description: '',
  priority: 'low',
  labels: [],
  schedule: '30 9 * * *',
  status: 'todo',
  subtasks: [],
};
