import { timeInputToMinutes } from '@/lib/time';

export type BookingInputResult =
  | { valid: true; start: number; end: number }
  | { valid: false; field: 'startTime' | 'duration'; message: string };

/** Parse syntax only; interval and availability rules belong to checkAvailability. */
export function parseBookingInput(startTime: string, duration: string): BookingInputResult {
  if (typeof startTime !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
    return { valid: false, field: 'startTime', message: 'Enter a start time in HH:MM format (00:00–23:59).' };
  }

  if (typeof duration !== 'string' || !/^-?\d+$/.test(duration) || !Number.isSafeInteger(Number(duration))) {
    return { valid: false, field: 'duration', message: 'Enter duration as a whole number of minutes.' };
  }

  const start = timeInputToMinutes(startTime);
  const end = start + Number(duration);
  if (!Number.isSafeInteger(end)) {
    return { valid: false, field: 'duration', message: 'Duration is too large to calculate an exact end time.' };
  }
  return { valid: true, start, end };
}
