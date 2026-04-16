import React, { useEffect, useState, useCallback } from 'react';
import { TimeSlot } from '../lib/types';
import { getAvailability } from '../lib/api';

interface Props {
  resourceId: string;
  onSlotSelect: (start: string, end: string) => void;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Calendar({ resourceId, onSlotSelect }: Props) {
  const [date, setDate] = useState(toDateString(new Date()));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startIdx, setStartIdx] = useState<number | null>(null);
  const [endIdx, setEndIdx] = useState<number | null>(null);

  const loadSlots = useCallback(() => {
    setLoading(true);
    setError('');
    setStartIdx(null);
    setEndIdx(null);
    getAvailability(resourceId, date)
      .then(setSlots)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [resourceId, date]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const isPast = (iso: string) => new Date(iso) < new Date();

  const handleSlotClick = (idx: number) => {
    const slot = slots[idx];
    if (!slot.available || isPast(slot.start)) return;

    if (startIdx === null || endIdx !== null) {
      setStartIdx(idx);
      setEndIdx(null);
    } else {
      if (idx <= startIdx) {
        setStartIdx(idx);
        setEndIdx(null);
        return;
      }
      // check all slots in range are available
      for (let i = startIdx; i <= idx; i++) {
        if (!slots[i].available || isPast(slots[i].start)) {
          setStartIdx(idx);
          setEndIdx(null);
          return;
        }
      }
      setEndIdx(idx);
      onSlotSelect(slots[startIdx].start, slots[idx].end);
    }
  };

  const getSlotClass = (slot: TimeSlot, idx: number) => {
    const classes = ['slot'];
    if (!slot.available) classes.push('booked');
    else if (isPast(slot.start)) classes.push('past');
    else classes.push('available');

    if (startIdx !== null && endIdx !== null && idx >= startIdx && idx <= endIdx) {
      classes.push('selected');
    } else if (startIdx !== null && endIdx === null && idx === startIdx) {
      classes.push('selected');
    }
    return classes.join(' ');
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2>Availability</h2>
        <input
          type="date"
          value={date}
          min={toDateString(new Date())}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading ? (
        <div className="calendar-loading">Loading slots…</div>
      ) : slots.length === 0 ? (
        <p className="no-slots">No time slots available for this date.</p>
      ) : (
        <>
          <p className="slot-hint">
            {startIdx === null
              ? 'Click a slot to set start time'
              : endIdx === null
              ? 'Click another slot to set end time'
              : 'Selection complete'}
          </p>
          <div className="slot-grid">
            {slots.map((slot, idx) => (
              <button
                key={slot.start}
                className={getSlotClass(slot, idx)}
                onClick={() => handleSlotClick(idx)}
                disabled={!slot.available || isPast(slot.start)}
              >
                {formatHour(slot.start)}
              </button>
            ))}
          </div>
          <div className="slot-legend">
            <span><span className="legend-box available" /> Available</span>
            <span><span className="legend-box booked" /> Booked</span>
            <span><span className="legend-box past" /> Past</span>
            <span><span className="legend-box selected" /> Selected</span>
          </div>
        </>
      )}
    </div>
  );
}
