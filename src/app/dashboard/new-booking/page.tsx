'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MUSEUMS, EVENTS } from '@/lib/data';
import { Ticket } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function NewBookingPage() {
  const { toast } = useToast();
  const [selectedMuseum, setSelectedMuseum] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [numTickets, setNumTickets] = useState(1);
  const [userId, setUserId] = useState('');
  const firestore = useFirestore();

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMuseum || !selectedEvent || !userId || numTickets <= 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields to create a booking.',
      });
      return;
    }
    
    const event = EVENTS.find(e => e.id === selectedEvent);
    if (!event || !firestore) return;

    const bookingData = {
      userId: userId,
      eventId: selectedEvent,
      museumId: selectedMuseum,
      numTickets: numTickets,
      pricePaid: event.basePrice * numTickets,
      currency: 'USD',
      status: 'paid',
      createdAt: new Date(),
      eventTitle: event.title,
      museumName: MUSEUMS.find(m => m.id === selectedMuseum)?.name,
      eventDate: event.date,
      slot: `${event.startTime}-${event.endTime}`, // Added slot
      paymentId: `manual-${Date.now()}`, // Placeholder
      qrId: `qr-${Date.now()}`, // Placeholder
    };
    
    const bookingsCol = collection(firestore, 'users', userId, 'bookings');
    addDocumentNonBlocking(bookingsCol, bookingData);
    
    toast({
      title: 'Booking Created!',
      description: `Successfully created booking for user ${userId}.`,
    });

    // Reset form
    setSelectedMuseum('');
    setSelectedEvent('');
    setNumTickets(1);
    setUserId('');
  };

  const filteredEvents = selectedMuseum ? EVENTS.filter(event => event.museumId === selectedMuseum) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">New Manual Booking</h1>
        <p className="text-muted-foreground">Create a new ticket booking for a user.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
          <CardDescription>Fill in the form to create a new booking.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBooking} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="museum">Museum</Label>
                <Select value={selectedMuseum} onValueChange={setSelectedMuseum}>
                  <SelectTrigger id="museum">
                    <SelectValue placeholder="Select a museum" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSEUMS.map(museum => (
                      <SelectItem key={museum.id} value={museum.id}>
                        {museum.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent} disabled={!selectedMuseum}>
                  <SelectTrigger id="event">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEvents.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                    {selectedMuseum && filteredEvents.length === 0 && (
                      <div className="p-4 text-sm text-center text-muted-foreground">No events for this museum.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g., user-123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numTickets">Number of Tickets</Label>
                <Input
                  id="numTickets"
                  type="number"
                  min="1"
                  value={numTickets}
                  onChange={(e) => setNumTickets(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Ticket className="mr-2 h-4 w-4" />
                Create Booking
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
