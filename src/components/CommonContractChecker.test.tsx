// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '@/App';
import { rooms } from '@/data/rooms';

function openCommon() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Common Contract Checker' }));
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function expectResult(decision: string, available: boolean, code: string, message: string | RegExp) {
  const result = within(screen.getByRole('status', { name: 'Availability decision' }));
  expect(result.getByText(decision)).toBeTruthy();
  expect(result.getByText(String(available))).toBeTruthy();
  expect(result.getByText(code)).toBeTruthy();
  expect(result.getByText(message)).toBeTruthy();
}

describe('Common Contract Checker UI', () => {
  it('defaults to Campus Checker and retains its selection, filters, times, and mock explanation', async () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Campus Checker' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByLabelText('Duration in minutes')).toBeNull();
    change('Number of attendees', '20');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Projector' }));
    fireEvent.click(screen.getByRole('button', { name: /B220/ }));
    change('Start Time', '15:00');
    change('End Time', '16:00');
    fireEvent.click(screen.getByRole('button', { name: 'Common Contract Checker' }));
    fireEvent.click(screen.getByRole('button', { name: 'Campus Checker' }));
    expect((screen.getByLabelText('Number of attendees') as HTMLInputElement).value).toBe('20');
    expect((screen.getByRole('checkbox', { name: 'Projector' }) as HTMLInputElement).checked).toBe(true);
    expect(screen.queryByRole('button', { name: /A101/ })).toBeNull();
    expect(screen.getByRole('button', { name: /B220/ }).getAttribute('aria-pressed')).toBe('true');
    expect((screen.getByLabelText('Start Time') as HTMLInputElement).value).toBe('15:00');
    expect((screen.getByLabelText('End Time') as HTMLInputElement).value).toBe('16:00');
    fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText(/Room B220 is unavailable because the requested interval overlaps/)).toBeTruthy();
  });

  it('updates end time, decision, Boolean, code, and message as inputs change', () => {
    openCommon();
    expect(screen.getByLabelText('Calculated End Time').textContent).toBe('16:00');
    expectResult('Available', true, 'AVAILABLE', 'Room is available for the selected interval.');
    change('Start Time', '13:30');
    expect(screen.getByLabelText('Calculated End Time').textContent).toBe('14:30');
    expectResult('Unavailable', false, 'OVERLAP', /Overlaps existing booking: 13:00–14:00/);
    change('Start Time', '15:00');
    change('Duration in minutes', '121');
    expectResult('Validation Error', false, 'DURATION_LIMIT', 'Booking cannot be longer than 120 minutes.');
    change('Duration in minutes', '0');
    expectResult('Validation Error', false, 'INVALID_INTERVAL', /End time must be later/);
    change('Duration in minutes', '60');
    expectResult('Available', true, 'AVAILABLE', 'Room is available for the selected interval.');
  });

  it('simulates blocking while always displaying all original bookings and preserving fixtures', () => {
    const before = structuredClone(rooms);
    openCommon();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Simulate blocked room' }));
    expectResult('Unavailable', false, 'ROOM_BLOCKED', 'Room is blocked.');
    for (const booking of rooms[0].bookings) expect(screen.getByText(booking.purpose)).toBeTruthy();
    expect(rooms).toEqual(before);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Simulate blocked room' }));
    expectResult('Available', true, 'AVAILABLE', 'Room is available for the selected interval.');
  });

  it.each([
    ['Start Time', '', /Enter a start time in HH:MM/],
    ['Start Time', 'bad', /Enter a start time in HH:MM/],
    ['Duration in minutes', '', /Enter duration as a whole number/],
    ['Duration in minutes', 'abc', /Enter duration as a whole number/],
    ['Duration in minutes', '1.5', /Enter duration as a whole number/],
  ] as const)('shows accessible validation for %s = %j', (label, value, message) => {
    openCommon();
    change(label, value);
    expectResult('Validation Error', false, 'INVALID_TIME', message);
    expect(screen.getByLabelText(label).getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Calculated End Time').textContent).toBe('--:--');
    expect(document.body.textContent).not.toContain('NaN');
  });

  it('shows an understandable same-day failure without wrapping the calculated end', () => {
    openCommon();
    change('Start Time', '23:30');
    expect(screen.getByLabelText('Calculated End Time').textContent).toBe('Outside same day');
    expectResult('Validation Error', false, 'INVALID_INTERVAL', /within the same day/);
  });
});
