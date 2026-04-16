import React, { useState } from 'react';
import { Resource, Booking } from '../lib/types';
import { createBooking, payBooking } from '../lib/api';

interface Props {
  resource: Resource;
  startTime: string | null;
  endTime: string | null;
  onReset: () => void;
}

function hoursBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function BookingPanel({ resource, startTime, endTime, onReset }: Props) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!startTime || !endTime) {
    return (
      <div className="booking-panel empty">
        <h2>Booking</h2>
        <p>Select a time range on the calendar to create a booking.</p>
      </div>
    );
  }

  const hours = hoursBetween(startTime, endTime);
  const price = hours * resource.price_per_hour;

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      const b = await createBooking(resource.id, startTime, endTime);
      setBooking(b);
    } catch (e: any) {
      if (e.status === 409) {
        setError('Time slot conflict — someone booked this slot. Please choose another.');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!booking) return;
    setLoading(true);
    setError('');
    try {
      const updated = await payBooking(booking.id);
      setBooking(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewBooking = () => {
    setBooking(null);
    setError('');
    onReset();
  };

  // Confirmed state
  if (booking?.status === 'confirmed') {
    return (
      <div className="booking-panel confirmed">
        <h2>✅ Booking Confirmed</h2>
        <div className="summary">
          <div><strong>Resource:</strong> {resource.name}</div>
          <div><strong>From:</strong> {formatDateTime(booking.start_time)}</div>
          <div><strong>To:</strong> {formatDateTime(booking.end_time)}</div>
          <div><strong>Total:</strong> ${booking.total_price.toFixed(2)}</div>
          <div><strong>Status:</strong> {booking.status}</div>
          <div><strong>Booking ID:</strong> {booking.id}</div>
        </div>
        <button className="btn-secondary" onClick={handleNewBooking}>
          New Booking
        </button>
      </div>
    );
  }

  // Pending payment state
  if (booking) {
    return (
      <div className="booking-panel pending">
        <h2>Booking Created</h2>
        <div className="summary">
          <div><strong>Resource:</strong> {resource.name}</div>
          <div><strong>From:</strong> {formatDateTime(booking.start_time)}</div>
          <div><strong>To:</strong> {formatDateTime(booking.end_time)}</div>
          <div><strong>Total:</strong> ${booking.total_price.toFixed(2)}</div>
          <div><strong>Status:</strong> {booking.status}</div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-pay" onClick={handlePay} disabled={loading}>
          {loading ? 'Processing…' : `Pay $${booking.total_price.toFixed(2)}`}
        </button>
      </div>
    );
  }

  // Pre-booking summary
  return (
    <div className="booking-panel">
      <h2>Booking Summary</h2>
      <div className="summary">
        <div><strong>Resource:</strong> {resource.name}</div>
        <div><strong>From:</strong> {formatDateTime(startTime)}</div>
        <div><strong>To:</strong> {formatDateTime(endTime)}</div>
        <div><strong>Duration:</strong> {hours} hour{hours !== 1 ? 's' : ''}</div>
        <div><strong>Price:</strong> ${price.toFixed(2)}</div>
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-book" onClick={handleBook} disabled={loading}>
        {loading ? 'Creating…' : 'Book Now'}
      </button>
    </div>
  );
}
