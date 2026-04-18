import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { scheduleForDate, scheduleForDateRange } from '@/app/_components/scheduleMatcher';

interface Row {
  id: string;
  title: string;
  schedule: string;
  status: string;
}

let db: InstanceType<typeof Database>;

function query(result: { sql: string; params: (string | number)[] }): Row[] {
  return db.prepare(result.sql).all(...result.params) as Row[];
}

function titles(rows: Row[]): string[] {
  return rows.map((r) => r.title).sort();
}

beforeAll(() => {
  db = new Database(':memory:');
  db.exec(`
    CREATE TABLE events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'medium',
      labels TEXT NOT NULL DEFAULT '',
      schedule TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo'
    )
  `);
});

beforeEach(() => {
  db.exec('DELETE FROM events');
});

function insert(id: string, title: string, schedule: string, status = 'todo') {
  db.prepare('INSERT INTO events (id, title, schedule, status) VALUES (?, ?, ?, ?)').run(
    id,
    title,
    schedule,
    status,
  );
}

describe('scheduleForDate', () => {
  describe('wildcard (*)', () => {
    it('matches daily schedule on any date', () => {
      insert('1', 'Daily task', '0 22 * * *');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 5))))).toEqual(['Daily task']);
    });
  });

  describe('exact day-of-week', () => {
    it('matches Friday schedule on a Friday', () => {
      insert('1', 'Friday task', '0 14 * * 5');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 10))))).toEqual(['Friday task']);
    });

    it('does not match Friday schedule on a Monday', () => {
      insert('1', 'Friday task', '0 14 * * 5');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 6))))).toEqual([]);
    });
  });

  describe('day-of-week range', () => {
    it('matches weekday range on Wednesday', () => {
      insert('1', 'Weekday task', '0 9 * * 1-5');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 1))))).toEqual(['Weekday task']);
    });

    it('does not match weekday range on Sunday', () => {
      insert('1', 'Weekday task', '0 9 * * 1-5');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 5))))).toEqual([]);
    });
  });

  describe('day-of-week comma list', () => {
    it('matches comma-separated days', () => {
      insert('1', 'Mon/Thu task', '0 8 * * 1,4');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 6))))).toEqual(['Mon/Thu task']);
      expect(titles(query(scheduleForDate(new Date(2026, 3, 9))))).toEqual(['Mon/Thu task']);
    });

    it('does not match on days outside the list', () => {
      insert('1', 'Mon/Thu task', '0 8 * * 1,4');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 7))))).toEqual([]);
    });

    it('matches weekend list (0,6)', () => {
      insert('1', 'Weekend task', '0 7 * * 0,6');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 5))))).toEqual(['Weekend task']);
      expect(titles(query(scheduleForDate(new Date(2026, 3, 11))))).toEqual(['Weekend task']);
    });
  });

  describe('day-of-month', () => {
    it('matches exact day of month', () => {
      insert('1', 'First of month', '0 10 1 * *');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 1))))).toEqual(['First of month']);
    });

    it('does not match wrong day of month', () => {
      insert('1', 'First of month', '0 10 1 * *');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 2))))).toEqual([]);
    });
  });

  describe('month step (*/N)', () => {
    it('matches month in step sequence', () => {
      insert('1', 'Quarterly', '0 10 1 */3 *');
      expect(titles(query(scheduleForDate(new Date(2026, 3, 1))))).toEqual(['Quarterly']);
    });

    it('does not match month outside step sequence', () => {
      insert('1', 'Quarterly', '0 10 1 */3 *');
      expect(titles(query(scheduleForDate(new Date(2026, 2, 1))))).toEqual([]);
    });
  });

  describe('combined filtering', () => {
    it('returns correct subset from mixed schedules', () => {
      insert('1', 'Team standup', '0 9 * * 1-5');
      insert('2', 'Deploy to prod', '0 14 * * 5');
      insert('3', 'Water plants', '0 8 * * 1,4');
      insert('4', 'Security audit', '0 10 1 */3 *');
      insert('5', 'Clean branches', '0 17 * * 5');
      insert('6', 'Journal entry', '0 22 * * *');
      insert('7', 'Morning run', '0 7 * * 0,6');

      expect(titles(query(scheduleForDate(new Date(2026, 3, 5))))).toEqual([
        'Journal entry',
        'Morning run',
      ]);

      expect(titles(query(scheduleForDate(new Date(2026, 3, 6))))).toEqual([
        'Journal entry',
        'Team standup',
        'Water plants',
      ]);

      expect(titles(query(scheduleForDate(new Date(2026, 3, 1))))).toEqual([
        'Journal entry',
        'Security audit',
        'Team standup',
      ]);

      expect(titles(query(scheduleForDate(new Date(2026, 3, 10))))).toEqual([
        'Clean branches',
        'Deploy to prod',
        'Journal entry',
        'Team standup',
      ]);
    });
  });

  describe('composability', () => {
    it('chains additional where clause', () => {
      insert('1', 'Daily todo', '0 22 * * *', 'todo');
      insert('2', 'Daily done', '0 10 * * *', 'done');
      const rows = query(
        scheduleForDate(new Date(2026, 3, 5), {
          where: 'status = ?',
          whereParams: ['todo'],
        }),
      );
      expect(titles(rows)).toEqual(['Daily todo']);
    });

    it('chains orderBy', () => {
      insert('1', 'BBB', '0 22 * * *');
      insert('2', 'AAA', '0 10 * * *');
      const rows = query(scheduleForDate(new Date(2026, 3, 5), { orderBy: 'title ASC' }));
      expect(rows.map((r) => r.title)).toEqual(['AAA', 'BBB']);
    });
  });
});

describe('scheduleForDateRange', () => {
  it('returns events matching any date in the range', () => {
    insert('1', 'Friday only', '0 14 * * 5');
    insert('2', 'Monday only', '0 9 * * 1');
    insert('3', 'Daily', '0 22 * * *');

    const rows = query(scheduleForDateRange(new Date(2026, 3, 6), new Date(2026, 3, 8)));
    expect(titles(rows)).toEqual(['Daily', 'Monday only']);
  });

  it('returns no duplicates for daily schedule across range', () => {
    insert('1', 'Daily', '0 22 * * *');
    const rows = query(scheduleForDateRange(new Date(2026, 3, 5), new Date(2026, 3, 11)));
    expect(titles(rows)).toEqual(['Daily']);
  });

  it('covers full week', () => {
    insert('1', 'Weekday', '0 9 * * 1-5');
    insert('2', 'Weekend', '0 7 * * 0,6');
    const rows = query(scheduleForDateRange(new Date(2026, 3, 5), new Date(2026, 3, 11)));
    expect(titles(rows)).toEqual(['Weekday', 'Weekend']);
  });
});
