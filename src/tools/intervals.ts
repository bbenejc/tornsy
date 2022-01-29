import { INTERVAL_NAMES } from 'config';

const SECONDS: { [key: string]: number } = {
  m: 60,
  h: 3600,
  d: 86400,
};

export function calculateInterval(time: number, interval: TInterval, offset = 0): number {
  const type = interval[0];

  // only for seconds, minutes, hours and days
  if (type in SECONDS) {
    const num = parseInt(interval.slice(1));
    const seconds = SECONDS[type] * num;
    return time - (time % seconds) + offset * seconds;
  } else if (type === 'w') {
    const d = new Date(time * 1000);
    const dayNum = d.getUTCDay();
    if (dayNum !== 1) d.setUTCDate(d.getUTCDate() - (dayNum > 1 ? dayNum - 1 : 6));
    d.setUTCHours(0, 0, 0, 0);
    if (offset !== 0) d.setUTCDate(d.getUTCDate() + 7 * offset);

    return Math.floor(d.getTime() / 1000);
  } else if (type === 'n') {
    const d = new Date(time * 1000);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    if (offset !== 0) d.setUTCMonth(d.getUTCMonth() + offset);

    return Math.floor(d.getTime() / 1000);
  } else if (type === 'y') {
    const d = new Date(time * 1000);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCFullYear(d.getUTCFullYear() + offset, 0, 1);

    return Math.floor(d.getTime() / 1000);
  }

  return time + offset;
}

export function getIntervalName(interval: string): string {
  const type = interval[0] as keyof typeof INTERVAL_NAMES;
  const length = interval.substr(1);

  return length + (INTERVAL_NAMES[type] ? INTERVAL_NAMES[type] : type);
}
