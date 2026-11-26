import { describe, expect, it } from 'vitest';
import { rooms } from '@/data/rooms';
import { checkCommonAvailability } from '@/lib/commonAvailability';

const scenarios = [
  { id: 'T1', startTime: '15:00', duration: '60', blocked: false, available: true, reasonCode: 'AVAILABLE' },
  { id: 'T2', startTime: '13:30', duration: '60', blocked: false, available: false, reasonCode: 'OVERLAP' },
  { id: 'T3', startTime: '15:00', duration: '60', blocked: true, available: false, reasonCode: 'ROOM_BLOCKED' },
  { id: 'T4', startTime: '15:00', duration: '0', blocked: false, available: false, reasonCode: 'INVALID_INTERVAL' },
  { id: 'T5', startTime: '14:30', duration: '121', blocked: false, available: false, reasonCode: 'DURATION_LIMIT' },
  { id: 'T6', startTime: '11:00', duration: '30', blocked: false, available: false, reasonCode: 'PAST_START' },
  { id: 'T7', startTime: '14:00', duration: '60', blocked: false, available: true, reasonCode: 'AVAILABLE' },
];

describe('Mandatory common comparison scenarios T1–T8', () => {
  it.each(scenarios)('$id: $reasonCode', ({ available, reasonCode, ...input }) => {
    expect(checkCommonAvailability(input)).toEqual({
      available, reasonCode, message: expect.any(String),
    });
  });

  it('T8: repeating T1–T7 leaves complete room and booking data unchanged', () => {
    const before = structuredClone(rooms);
    const bookingArrays = rooms.map((room) => room.bookings);
    const bookingObjects = rooms.flatMap((room) => room.bookings);
    for (let repeat = 0; repeat < 2; repeat += 1) {
      scenarios.forEach((input) => checkCommonAvailability(input));
    }
    expect(rooms).toEqual(before);
    rooms.forEach((room, index) => expect(room.bookings).toBe(bookingArrays[index]));
    rooms.flatMap((room) => room.bookings).forEach((booking, index) => expect(booking).toBe(bookingObjects[index]));
  });
});
