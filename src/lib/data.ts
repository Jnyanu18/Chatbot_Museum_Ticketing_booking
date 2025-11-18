import type { Museum, Event, Booking, User, Promotion } from './types';

export const USER: User = {
    id: 'user-123',
    displayName: 'Alex Doe',
    email: 'alex.doe@example.com',
    role: 'admin',
    language: 'en',
    createdAt: new Date(),
    lastSeen: new Date(),
};

export const MUSEUMS: Museum[] = [
  {
    id: 'museum-1',
    name: 'The Metropolitan Museum of Art',
    description: 'The Metropolitan Museum of Art of New York City, colloquially "the Met", is the largest art museum in the Americas.',
    location: { address: '1000 5th Ave', city: 'New York', country: 'USA' },
    openHours: [{ day: 'Mon-Sun', open: '10:00', close: '17:00' }],
    imageUrl: 'https://picsum.photos/seed/museum-1/600/400',
    imageHint: 'art museum',
  },
  {
    id: 'museum-2',
    name: 'Louvre Museum',
    description: 'The Louvre, or the Louvre Museum, is a national art museum in Paris, France. It is located on the Right Bank of the Seine in the city\'s 1st arrondissement.',
    location: { address: 'Rue de Rivoli', city: 'Paris', country: 'France' },
    openHours: [{ day: 'Wed-Mon', open: '09:00', close: '18:00' }],
    imageUrl: 'https://picsum.photos/seed/museum-2/600/400',
    imageHint: 'modern architecture',
  },
  {
    id: 'museum-3',
    name: 'British Museum',
    description: 'The British Museum is a public museum dedicated to human history, art and culture located in the Bloomsbury area of London.',
    location: { address: 'Great Russell St', city: 'London', country: 'UK' },
    openHours: [{ day: 'Mon-Sun', open: '10:00', close: '17:30' }],
    imageUrl: 'https://picsum.photos/seed/museum-3/600/400',
    imageHint: 'historic building',
  },
  {
    id: 'museum-4',
    name: 'Prado Museum',
    description: 'The Prado Museum, officially known as Museo Nacional del Prado, is the main Spanish national art museum, located in central Madrid.',
    location: { address: 'P.º del Prado', city: 'Madrid', country: 'Spain' },
    openHours: [{ day: 'Mon-Sat', open: '10:00', close: '20:00' }],
    imageUrl: 'https://picsum.photos/seed/museum-4/600/400',
    imageHint: 'classical architecture',
  },
  {
    id: 'museum-5',
    name: 'Rijksmuseum',
    description: 'The Rijksmuseum is the national museum of the Netherlands dedicated to Dutch arts and history and is located in Amsterdam.',
    location: { address: 'Museumstraat 1', city: 'Amsterdam', country: 'Netherlands' },
    openHours: [{ day: 'Mon-Sun', open: '09:00', close: '17:00' }],
    imageUrl: 'https://picsum.photos/seed/museum-5/600/400',
    imageHint: 'dutch museum',
  },
];

export const EVENTS: Event[] = [
  {
    id: 'event-1',
    museumId: 'museum-1',
    title: 'Ancient Egypt: Art and Magic',
    description: 'Explore the mystical world of ancient Egyptian artifacts and their connection to magic.',
    date: '2024-08-15',
    startTime: '10:00',
    endTime: '17:00',
    capacity: 200,
    bookedCount: 150,
    basePrice: 25,
    imageUrl: 'https://picsum.photos/seed/event-1/400/200',
    imageHint: 'egyptian art',
  },
  {
    id: 'event-2',
    museumId: 'museum-1',
    title: 'The Renaissance Masters',
    description: 'A deep dive into the works of Leonardo, Michelangelo, and Raphael.',
    date: '2024-09-01',
    startTime: '10:00',
    endTime: '17:00',
    capacity: 150,
    bookedCount: 90,
    basePrice: 30,
    imageUrl: 'https://picsum.photos/seed/event-2/400/200',
    imageHint: 'renaissance painting',
  },
  {
    id: 'event-3',
    museumId: 'museum-2',
    title: 'Modern Art Revolution',
    description: 'From Impressionism to Cubism, witness the revolution of modern art.',
    date: '2024-08-20',
    startTime: '09:00',
    endTime: '18:00',
    capacity: 300,
    bookedCount: 250,
    basePrice: 22,
    imageUrl: 'https://picsum.photos/seed/event-3/400/200',
    imageHint: 'modern art',
  },
];

export const BOOKINGS: Booking[] = [
    {
        id: 'booking-1',
        userId: 'user-123',
        eventId: 'event-1',
        museumId: 'museum-1',
        numTickets: 2,
        pricePaid: 50,
        currency: 'USD',
        status: 'paid',
        createdAt: new Date('2024-07-20T10:30:00Z'),
        eventTitle: 'Ancient Egypt: Art and Magic',
        museumName: 'The Metropolitan Museum of Art',
        eventDate: '2024-08-15'
    },
    {
        id: 'booking-2',
        userId: 'user-123',
        eventId: 'event-3',
        museumId: 'museum-2',
        numTickets: 1,
        pricePaid: 22,
        currency: 'EUR',
        status: 'checkedIn',
        createdAt: new Date('2024-07-18T14:00:00Z'),
        eventTitle: 'Modern Art Revolution',
        museumName: 'Louvre Museum',
        eventDate: '2024-08-20'
    },
     {
        id: 'booking-3',
        userId: 'user-123',
        eventId: 'event-2',
        museumId: 'museum-1',
        numTickets: 4,
        pricePaid: 120,
        currency: 'USD',
        status: 'paid',
        createdAt: new Date('2024-07-21T09:00:00Z'),
        eventTitle: 'The Renaissance Masters',
        museumName: 'The Metropolitan Museum of Art',
        eventDate: '2024-09-01'
    },
];


// MOCK DATA FOR CHARTS

export const bookingsOverTimeData = [
  { date: "2024-07-01", Bookings: 240, },
  { date: "2024-07-02", Bookings: 190, },
  { date: "2024-07-03", Bookings: 320, },
  { date: "2024-07-04", Bookings: 210, },
  { date: "2024-07-05", Bookings: 450, },
  { date: "2024-07-06", Bookings: 300, },
  { date: "2024-07-07", Bookings: 280, },
  { date: "2024-07-08", Bookings: 350, },
];

export const revenueByMuseumData = [
    { name: "The Met", revenue: 45000 },
    { name: "Louvre", revenue: 38000 },
    { name: "British Museum", revenue: 29000 },
    { name: "Prado", revenue: 22000 },
    { name: "Rijksmuseum", revenue: 18000 },
];

export const peakHoursData = [
  { hour: "09", visitors: 120 }, { hour: "10", visitors: 200 },
  { hour: "11", visitors: 350 }, { hour: "12", visitors: 410 },
  { hour: "13", visitors: 380 }, { hour: "14", visitors: 450 },
  { hour: "15", visitors: 320 }, { hour: "16", visitors: 280 },
  { hour: "17", visitors: 150 },
];

export const languageDistributionData = [
  { name: "English", value: 75, fill: "var(--color-chart-1)" },
  { name: "Spanish", value: 15, fill: "var(--color-chart-2)" },
  { name: "Hindi", value: 5, fill: "var(--color-chart-3)" },
  { name: "Other", value: 5, fill: "var(--color-chart-4)" },
];

export const conversionFunnelData = [
  { step: 'Chat started', count: 1000 },
  { step: 'Intent recognized', count: 750 },
  { step: 'Booking started', count: 500 },
  { step: 'Payment initiated', count: 400 },
  { step: 'Payment completed', count: 320 },
];

export const qrVerificationData = [
  { date: "2024-07-01", expected: 240, scanned: 220 },
  { date: "2024-07-02", expected: 190, scanned: 180 },
  { date: "2024-07-03", expected: 320, scanned: 305 },
  { date: "2024-07-04", expected: 210, scanned: 200 },
  { date: "2024-07-05", expected: 450, scanned: 430 },
  { date: "2024-07-06", expected: 300, scanned: 290 },
];

export const chatbotPerformanceData = [
    { intent: 'book_ticket', success: 85, failed: 15 },
    { intent: 'faq_hours', success: 98, failed: 2 },
    { intent: 'faq_location', success: 95, failed: 5 },
    { intent: 'faq_events', success: 92, failed: 8 },
];

export const abandonedBookingsData = [
    { museum: 'The Met', count: 25 },
    { museum: 'Louvre', count: 18 },
    { museum: 'British Museum', count: 12 },
];

export const PROMOTIONS: Promotion[] = [
    { id: 'promo-1', title: 'Summer Special', description: '15% off on all tickets', discountPercent: 15, code: 'SUMMER15', active: true },
    { id: 'promo-2', title: 'Family Pack', description: '20% off for family bookings', discountPercent: 20, code: 'FAMILY20', active: true },
];

export const promotionEffectivenessData = [
    { name: 'Without Promo', bookings: 1200 },
    { name: 'With Promo', bookings: 1500 },
];
