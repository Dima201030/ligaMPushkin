const BASE = new Date();
BASE.setMilliseconds(0);

export const MOCK_NOW = BASE;

export function at(daysOffset: number, hour = 10, minute = 0) {
  const date = new Date(BASE);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function ago(days: number, hour = 10, minute = 0) {
  return at(-days, hour, minute);
}
