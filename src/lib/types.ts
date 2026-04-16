export interface Resource {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price_per_hour: number;
}

export interface TimeSlot {
  start: string; // ISO string
  end: string;   // ISO string
  available: boolean;
}

export interface Booking {
  id: string;
  resource_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}
