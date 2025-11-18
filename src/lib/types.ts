export type User = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  role: 'visitor' | 'staff' | 'admin';
  language?: string;
  createdAt: Date;
  lastSeen: Date;
};

export type Museum = {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  openHours: { day: string; open: string; close: string }[];
  imageUrl: string;
  imageHint: string;
};

export type Event = {
  id: string;
  museumId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  basePrice: number;
  imageUrl: string;
  imageHint: string;
};

export type Booking = {
  id: string;
  userId: string;
  eventId: string;
  museumId: string;
  numTickets: number;
  pricePaid: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  createdAt: Date;
  eventTitle: string;
  museumName: string;
  eventDate: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  code: string;
  active: boolean;
};
