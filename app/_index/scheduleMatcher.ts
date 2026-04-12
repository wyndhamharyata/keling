type SqlBindParams = (string | number)[];

/** Returns the unix timestamp (seconds) for the start of the given date in local timezone. */
export function toStartOfDayTimestamp(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

interface ScheduleQueryOpts {
  where?: string;
  whereParams?: SqlBindParams;
  orderBy?: string;
}

interface ScheduleQuery {
  sql: string;
  params: SqlBindParams;
}

// Generate all non-comma-list cron field strings that match a value.
function cronFieldPermutations(value: number, min: number, max: number, offset: number): string[] {
  const perms: string[] = ['*', String(value)];

  for (let n = 1; n <= max; n++) {
    if ((value - offset) % n === 0) perms.push(`*/${n}`);
  }

  for (let start = min; start <= value; start++) {
    for (let end = value; end <= max; end++) {
      perms.push(`${start}-${end}`);
    }
  }

  return perms;
}

const CRON_CTE = `WITH _s1 AS (
  SELECT *, INSTR(schedule, ' ') AS p1 FROM events
), _s2 AS (
  SELECT *, p1 + INSTR(SUBSTR(schedule, p1 + 1), ' ') AS p2 FROM _s1
), _s3 AS (
  SELECT *, p2 + INSTR(SUBSTR(schedule, p2 + 1), ' ') AS p3 FROM _s2
), _s4 AS (
  SELECT *, p3 + INSTR(SUBSTR(schedule, p3 + 1), ' ') AS p4 FROM _s3
), cron AS (
  SELECT id, title, description, priority, labels, schedule, status, subtasks,
    SUBSTR(schedule, p2 + 1, p3 - p2 - 1) AS cron_dom,
    SUBSTR(schedule, p3 + 1, p4 - p3 - 1) AS cron_month,
    SUBSTR(schedule, p4 + 1) AS cron_dow
  FROM _s4
)`;

// Build an IN clause with ? placeholders and collect params.
function inClause(field: string, values: string[], params: SqlBindParams): string {
  params.push(...values);
  return `${field} IN (${values.map(() => '?').join(',')})`;
}

// Build a field match condition: IN (...perms) OR comma-list LIKE.
function fieldMatchSql(
  field: string,
  value: number,
  min: number,
  max: number,
  offset: number,
  params: SqlBindParams,
): string {
  const perms = cronFieldPermutations(value, min, max, offset);
  const inSql = inClause(field, perms, params);
  params.push(`%,${value},%`);
  return `(${inSql} OR (',' || ${field} || ',' LIKE ?))`;
}

// Build a WHERE condition for a single date.
function dateConditionSql(date: Date, params: SqlBindParams): string {
  const dom = date.getDate();
  const month = date.getMonth() + 1;
  const dow = date.getDay();

  const monthSql = fieldMatchSql('cron_month', month, 1, 12, 1, params);
  const domSql = fieldMatchSql('cron_dom', dom, 1, 31, 1, params);
  const dowSql = fieldMatchSql('cron_dow', dow, 0, 6, 0, params);

  // dom/dow repeated for case 4 (both specified → OR)
  const domSql2 = fieldMatchSql('cron_dom', dom, 1, 31, 1, params);
  const dowSql2 = fieldMatchSql('cron_dow', dow, 0, 6, 0, params);

  return `(${monthSql} AND (
    (cron_dom = '*' AND cron_dow = '*')
    OR (cron_dom != '*' AND cron_dow = '*' AND ${domSql})
    OR (cron_dom = '*' AND cron_dow != '*' AND ${dowSql})
    OR (cron_dom != '*' AND cron_dow != '*' AND (${domSql2} OR ${dowSql2}))
  ))`;
}

/** Return a parameterized SQL query for events matching the given date. */
export function scheduleForDate(date: Date, opts?: ScheduleQueryOpts): ScheduleQuery {
  const dateTs = toStartOfDayTimestamp(date);
  const params: SqlBindParams = [dateTs];
  const condition = dateConditionSql(date, params);

  let sql = `${CRON_CTE} SELECT cron.id, cron.title, cron.description, cron.priority, cron.labels, cron.schedule, COALESCE(a.status, cron.status) AS status, CASE WHEN a.id IS NOT NULL AND a.subtasks IS NOT NULL AND a.subtasks != '[]' THEN a.subtasks ELSE cron.subtasks END AS subtasks FROM cron LEFT JOIN actions a ON a.event_id = cron.id AND a.date = ? WHERE ${condition}`;
  if (opts?.where) {
    sql += ` AND (${opts.where})`;
    if (opts.whereParams) params.push(...opts.whereParams);
  }
  if (opts?.orderBy) sql += ` ORDER BY ${opts.orderBy}`;

  return { sql, params };
}

/** Return a parameterized SQL query for events matching ANY date in [start, end] inclusive. */
export function scheduleForDateRange(
  start: Date,
  end: Date,
  opts?: ScheduleQueryOpts,
): ScheduleQuery {
  const params: SqlBindParams = [];
  const conditions: string[] = [];

  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endNorm = new Date(end);
  endNorm.setHours(0, 0, 0, 0);

  while (current <= endNorm) {
    conditions.push(dateConditionSql(current, params));
    current.setDate(current.getDate() + 1);
  }

  let sql = `${CRON_CTE} SELECT DISTINCT id, title, description, priority, labels, schedule, status FROM cron WHERE (${conditions.join(' OR ')})`;
  if (opts?.where) {
    sql += ` AND (${opts.where})`;
    if (opts.whereParams) params.push(...opts.whereParams);
  }
  if (opts?.orderBy) sql += ` ORDER BY ${opts.orderBy}`;

  return { sql, params };
}
