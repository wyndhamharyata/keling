export type EventPriority = 'low' | 'medium' | 'high';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  priority: EventPriority;
  labels: string[];
  schedule: string; // Cron style schedule string format
}
