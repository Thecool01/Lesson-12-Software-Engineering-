import { rooms } from '@/data/rooms';
import { checkAvailability, SIMULATED_NOW_MINUTES } from '@/lib/availability';
import { getExplanationReasonCode, type ExplanationReasonCode } from '@/lib/availabilityExplanation';
import { parseBookingInput } from '@/lib/bookingInput';

// Reuse the fixture, including the original booking array and booking objects.
export const COMMON_ROOM = rooms.find((room) => room.id === 'room-a101')!;

export interface CommonAvailabilityInput {
  startTime: string;
  duration: string;
  blocked: boolean;
}

export interface CommonAvailabilityResult {
  available: boolean;
  reasonCode: ExplanationReasonCode;
  message: string;
}

export function checkCommonAvailability(input: CommonAvailabilityInput): CommonAvailabilityResult {
  const parsed = parseBookingInput(input.startTime, input.duration);
  if (!parsed.valid) {
    return { available: false, reasonCode: 'INVALID_TIME', message: parsed.message };
  }

  const temporaryRoom = { ...COMMON_ROOM, blocked: input.blocked };
  const result = checkAvailability(temporaryRoom, parsed.start, parsed.end, SIMULATED_NOW_MINUTES);
  return {
    available: result.available,
    reasonCode: getExplanationReasonCode(result),
    message: result.reason,
  };
}
