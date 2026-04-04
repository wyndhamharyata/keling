import * as v from 'valibot';

export const EventStatusSchema = v.picklist(['todo', 'snoozed', 'done', 'skipped']);
export const EventPrioritySchema = v.picklist(['low', 'medium', 'high']);
export const EventSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty(), v.uuid()),
  title: v.pipe(
    v.string(),
    v.minLength(1, 'Title is required'),
    v.minLength(3, 'Title must be at least 3 characters long'),
    v.maxLength(100, 'Title must be less than 100 characters long'),
  ),
  description: v.optional(v.string(), ''),
  priority: EventPrioritySchema,
  labels: v.array(v.string()),
  schedule: v.pipe(v.string(), v.minLength(1, 'Schedule is required')),
  status: EventStatusSchema,
});

export type EventStatus = v.InferOutput<typeof EventStatusSchema>;
export type EventPriority = v.InferOutput<typeof EventPrioritySchema>;
export type EventItem = v.InferOutput<typeof EventSchema>;
export type EventFormInput = v.InferInput<typeof EventSchema>;

export const EMPTY_EVENT_ITEM: EventItem = {
  id: '',
  title: '',
  description: '',
  priority: 'medium',
  labels: [],
  schedule: '',
  status: 'todo',
};
