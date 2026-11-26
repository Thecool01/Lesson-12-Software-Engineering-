import { describe, expect, it } from 'vitest';
import { parseBookingInput } from '@/lib/bookingInput';

describe('Booking input parsing and end calculation', () => {
  it('calculates the end in minutes', () => {
    expect(parseBookingInput('15:00', '60')).toEqual({ valid: true, start: 900, end: 960 });
  });

  it('leaves invalid intervals for the authoritative rule engine without clamping', () => {
    expect(parseBookingInput('15:00', '-1')).toEqual({ valid: true, start: 900, end: 899 });
    expect(parseBookingInput('23:30', '60')).toEqual({ valid: true, start: 1410, end: 1470 });
    expect(parseBookingInput('15:00', '0')).toEqual({ valid: true, start: 900, end: 900 });
  });

  it('identifies the invalid field with start syntax taking priority', () => {
    expect(parseBookingInput('', '')).toMatchObject({ valid: false, field: 'startTime' });
    expect(parseBookingInput('15:00', '')).toMatchObject({ valid: false, field: 'duration' });
  });
});
