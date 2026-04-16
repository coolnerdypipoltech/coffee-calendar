import { supabase } from './supabaseClient';
import { Resource, TimeSlot, Booking } from './types';

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

function edgeFunctionUrl(path: string): string {
  const base = process.env.REACT_APP_SUPABASE_URL || '';
  return `${base}${path}`;
}

export async function fetchResources(): Promise<Resource[]> {
  const { data, error } = await supabase.from('resources').select('*');
  if (error) throw error;
  return data as Resource[];
}

export async function getAvailability(
  resourceId: string,
  date: string
): Promise<TimeSlot[]> {
  const token = await getToken();
  const res = await fetch(edgeFunctionUrl('/functions/v1/get-availability'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resource_id: resourceId, date }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch availability');
  }
  return res.json();
}

export async function createBooking(
  resourceId: string,
  startTime: string,
  endTime: string
): Promise<Booking> {
  const token = await getToken();
  const res = await fetch(edgeFunctionUrl('/functions/v1/create-booking'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resource_id: resourceId,
      start_time: startTime,
      end_time: endTime,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error: any = new Error(err.message || 'Failed to create booking');
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function payBooking(bookingId: string): Promise<Booking> {
  const token = await getToken();
  const res = await fetch(edgeFunctionUrl('/functions/v1/pay-booking'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ booking_id: bookingId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Payment failed');
  }
  return res.json();
}