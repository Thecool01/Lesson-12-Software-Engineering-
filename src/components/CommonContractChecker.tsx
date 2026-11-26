import { useState } from 'react';
import RoomBookingsCard from '@/components/RoomBookingsCard';
import { MAX_BOOKING_MINUTES, SIMULATED_NOW_MINUTES } from '@/lib/availability';
import { parseBookingInput } from '@/lib/bookingInput';
import { checkCommonAvailability, COMMON_ROOM } from '@/lib/commonAvailability';
import { fmt, MINUTES_PER_DAY } from '@/lib/time';

export default function CommonContractChecker() {
  const [startTime, setStartTime] = useState('15:00');
  const [duration, setDuration] = useState('60');
  const [blocked, setBlocked] = useState(false);
  const parsed = parseBookingInput(startTime, duration);
  const result = checkCommonAvailability({ startTime, duration, blocked });
  const validationError = !result.available && result.reasonCode !== 'ROOM_BLOCKED' && result.reasonCode !== 'OVERLAP';
  const decision = result.available ? 'Available' : validationError ? 'Validation Error' : 'Unavailable';
  const endTime = !parsed.valid ? '--:--'
    : parsed.end < 0 || parsed.end > MINUTES_PER_DAY ? 'Outside same day' : fmt(parsed.end);
  const inputClass = 'w-full min-w-0 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <section aria-labelledby="common-heading" className="min-w-0 lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 id="common-heading" className="text-base font-semibold text-slate-900">Common Contract Checker</h2>
        <p className="text-sm text-slate-600 mt-2">
          Room {COMMON_ROOM.name} · {COMMON_ROOM.building} · Capacity {COMMON_ROOM.capacity}
        </p>
        <p className="text-xs text-slate-500 mt-1">Equipment: {COMMON_ROOM.equipment.join(', ')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="min-w-0">
            <label htmlFor="common-start" className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
            <input id="common-start" type="text" placeholder="HH:MM" value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              aria-invalid={!parsed.valid && parsed.field === 'startTime'}
              aria-describedby="common-start-help common-message" className={inputClass} />
            <p id="common-start-help" className="text-xs text-slate-500 mt-2">Use HH:MM, for example 15:00.</p>
          </div>
          <div className="min-w-0">
            <label htmlFor="common-duration" className="block text-sm font-medium text-slate-700 mb-2">Duration in minutes</label>
            <input id="common-duration" type="text" inputMode="numeric" value={duration}
              onChange={(event) => setDuration(event.target.value)}
              aria-invalid={!parsed.valid && parsed.field === 'duration'}
              aria-describedby="common-duration-help common-message" className={inputClass} />
            <p id="common-duration-help" className="text-xs text-slate-500 mt-2">Whole minutes, 1–{MAX_BOOKING_MINUTES}.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-5">Calculated End Time: <output aria-label="Calculated End Time" className="font-semibold">{endTime}</output></p>
        <label className="flex items-center gap-2 text-sm text-slate-700 mt-5">
          <input type="checkbox" checked={blocked} onChange={(event) => setBlocked(event.target.checked)} className="w-4 h-4 accent-blue-600" />
          Simulate blocked room
        </label>
        <p className="text-sm text-slate-600 border-t border-slate-100 pt-4 mt-5">Simulated current time: <strong>{fmt(SIMULATED_NOW_MINUTES)}</strong></p>
      </section>
      <section aria-label="Common contract results" className="min-w-0 lg:col-span-2 flex flex-col gap-6">
        <div role="status" aria-label="Availability decision" aria-live="polite" aria-atomic="true" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Availability Result</h2>
          <p className={`text-xl font-bold mt-4 ${result.available ? 'text-emerald-700' : 'text-red-700'}`}>{decision}</p>
          <p id="common-message" className="text-sm text-slate-600 mt-2">{result.message}</p>
          <dl className="text-sm mt-4 space-y-3">
            <div><dt className="text-slate-500">Availability Boolean</dt><dd className="font-mono">{String(result.available)}</dd></div>
            <div><dt className="text-slate-500">Structured Reason Code</dt><dd className="font-mono break-all">{result.reasonCode}</dd></div>
          </dl>
          <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">This is a prototype — no booking is saved or confirmed.</p>
        </div>
        <RoomBookingsCard room={COMMON_ROOM} />
      </section>
    </div>
  );
}
