export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function formatSchedule(cron: string): string {
  const [minute, hour, dom, month, dow] = cron.split(' ');
  const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

  // Specific days of week
  if (dow !== '*') {
    if (dow.includes('-')) {
      const [start, end] = dow.split('-').map(Number);
      const count = end - start + 1;
      if (count === 5 && start === 1 && end === 5) return `${time}, Weekdays`;
      return `${time}, ${DAY_NAMES[start]}-${DAY_NAMES[end]}`;
    }
    if (dow.includes(',')) {
      const days = dow.split(',').map(Number);
      if (days.length === 2 && days.includes(0) && days.includes(6)) return `${time}, Weekends`;
      if (days.length <= 2) return `${time}, ${days.map((d) => DAY_NAMES[d]).join(' & ')}`;
      return `${time}, ${days.length} days/week`;
    }
    return `${time}, ${DAY_NAMES[Number(dow)]}`;
  }

  // Specific day of month / month interval
  if (dom !== '*' || month !== '*') {
    const parts = [time];
    if (dom === '1') parts.push('First day');
    else if (dom !== '*') parts.push(`Day ${dom}`);
    if (month.startsWith('*/')) parts.push(`Every ${month.slice(2)} months`);
    return parts.join(', ');
  }

  return `${time}, Daily`;
}
