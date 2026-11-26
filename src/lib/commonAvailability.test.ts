import { describe, expect, it } from 'vitest';
import { rooms } from '@/data/rooms';
import { checkCommonAvailability, COMMON_ROOM } from '@/lib/commonAvailability';

describe('Common contract additional regressions', () => {
  it.each(['', ' ', '9:00', '25:00', '24:00', '15:60', '15:00:00', 'abc'])('rejects invalid start %j', (startTime) => {
    expect(checkCommonAvailability({ startTime, duration: '60', blocked: true })).toEqual({
      available: false, reasonCode: 'INVALID_TIME',
      message: 'Enter a start time in HH:MM format (00:00–23:59).',
    });
  });

  it.each(['', ' ', 'abc', '1.5', '60.0', 'NaN', 'Infinity', '-Infinity', '1e2', '0x3c', '9'.repeat(400), '9007199254740991'])('rejects invalid duration %j', (duration) => {
    expect(checkCommonAvailability({ startTime: '15:00', duration, blocked: true })).toMatchObject({
      available: false, reasonCode: 'INVALID_TIME', message: expect.stringMatching(/duration/i),
    });
  });

  it.each([
    { startTime: '15:00', duration: '120', blocked: false, reasonCode: 'AVAILABLE' },
    { startTime: '12:00', duration: '30', blocked: false, reasonCode: 'PAST_START' },
    { startTime: '23:30', duration: '60', blocked: false, reasonCode: 'INVALID_INTERVAL' },
    { startTime: '23:00', duration: '60', blocked: false, reasonCode: 'AVAILABLE' },
    { startTime: '15:00', duration: '-1', blocked: false, reasonCode: 'INVALID_INTERVAL' },
    { startTime: '16:00', duration: '60', blocked: false, reasonCode: 'AVAILABLE' },
    { startTime: '11:00', duration: '0', blocked: true, reasonCode: 'INVALID_INTERVAL' },
    { startTime: '11:00', duration: '180', blocked: true, reasonCode: 'PAST_START' },
    { startTime: '13:00', duration: '180', blocked: true, reasonCode: 'DURATION_LIMIT' },
    { startTime: '13:30', duration: '60', blocked: true, reasonCode: 'ROOM_BLOCKED' },
  ])('preserves boundaries and primary priority: $startTime, $duration, $blocked → $reasonCode', ({ reasonCode, ...input }) => {
    expect(checkCommonAvailability(input)).toMatchObject({
      available: reasonCode === 'AVAILABLE', reasonCode,
    });
  });

  it('uses the original A101 fixture and does not mutate it when temporarily blocked', () => {
    const before = structuredClone(rooms);
    expect(COMMON_ROOM).toBe(rooms.find((room) => room.id === 'room-a101'));
    expect(checkCommonAvailability({ startTime: '15:00', duration: '60', blocked: true })).toEqual({
      available: false, reasonCode: 'ROOM_BLOCKED', message: 'Room is blocked.',
    });
    expect(rooms).toEqual(before);
    expect(COMMON_ROOM.blocked).toBe(false);
    expect(checkCommonAvailability({ startTime: '15:00', duration: '60', blocked: false }).available).toBe(true);
  });
});
