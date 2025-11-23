'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MUSEUMS, EVENTS } from '@/lib/data';
import { Download, Ticket, X, Loader2, CreditCard } from 'lucide-react';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TicketPDF from '@/components/TicketPDF';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


export default function NewBookingPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [selectedMuseum, setSelectedMuseum] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [numTickets, setNumTickets] = useState(1);
  const [userId, setUserId] = useState('');
  
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If auth is still loading, do nothing.
    if (isUserLoading) return;
    // If the user is not logged in, redirect to the login page.
    if (!user) {
      router.push('/login');
      return;
    }
    // Set the user ID once the user is loaded.
    setUserId(user.uid);
  }, [user, isUserLoading, router]);


  useEffect(() => {
    const museumId = searchParams.get('museumId');
    const eventId = searchParams.get('eventId');
    if (museumId) {
      setSelectedMuseum(museumId);
    }
    if (eventId) {
      setSelectedEvent(eventId);
    }
  }, [searchParams]);

  const handleCreateBooking = async (e: React.FormEvent) => {
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

    const newBookingId = `booking-${Date.now()}`;
    const bookingData: Booking = {
      id: newBookingId,
      userId: userId,
      eventId: selectedEvent,
      museumId: selectedMuseum,
      numTickets: numTickets,
      pricePaid: event.basePrice * numTickets,
      currency: 'USD',
      status: 'pending', // Start as pending
      createdAt: new Date(),
      eventTitle: event.title,
      museumName: MUSEUMS.find(m => m.id === selectedMuseum)?.name || 'N/A',
      eventDate: event.date,
      slot: `${event.startTime}-${event.endTime}`, 
      paymentId: `payment-${Date.now()}`,
      qrId: `qr-${Date.now()}`,
    };
    
    const bookingDocRef = doc(firestore, 'users', userId, 'bookings', newBookingId);
    
    try {
        setDocumentNonBlocking(bookingDocRef, bookingData, { merge: false });
        setPendingBooking(bookingData);
        toast({
          title: 'Booking Pending',
          description: `Your booking is ready for payment.`,
        });
    } catch(error) {
         toast({
            variant: 'destructive',
            title: 'Booking Failed',
            description: 'Could not create booking. Please try again.',
        });
    }
  };

  const handleSimulatePayment = async () => {
    if (!pendingBooking || !firestore || !user) return;
    
    setIsProcessingPayment(true);
    
    // Simulate a delay for payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedBookingData: Booking = { ...pendingBooking, status: 'paid' };
    const bookingDocRef = doc(firestore, 'users', user.uid, 'bookings', pendingBooking.id);

    const paymentData = {
        id: pendingBooking.paymentId,
        bookingId: pendingBooking.id,
        userId: pendingBooking.userId,
        amount: pendingBooking.pricePaid,
        currency: pendingBooking.currency,
        provider: 'stripe', // Simulated provider
        status: 'succeeded',
        createdAt: new Date().toISOString(),
    };
    const paymentDocRef = doc(firestore, 'payments', pendingBooking.paymentId!);

    try {
        // Update booking to 'paid'
        setDocumentNonBlocking(bookingDocRef, updatedBookingData, { merge: true });

        // Create payment document
        setDocumentNonBlocking(paymentDocRef, paymentData, { merge: false });

        toast({
            title: 'Payment Successful!',
            description: 'Your booking is confirmed.',
        });
        
        setConfirmedBooking(updatedBookingData);
        setPendingBooking(null); // Clear pending booking
        setIsConfirmationOpen(true); // Show ticket confirmation

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: 'Could not process payment. Please try again.',
        });
    } finally {
        setIsProcessingPayment(false);
    }
};


  const handleDownloadPdf = async () => {
    if (!ticketRef.current || !confirmedBooking) return;

    const canvas = await html2canvas(ticketRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`ticket-${confirmedBooking.id}.pdf`);
  };
  
  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    // Do not clear the confirmed booking here, so it's available for re-download if needed,
    // but you might want to reset the entire form state. For now, we just close the dialog.
    // setConfirmedBooking(null); 
  }

  const filteredEvents = selectedMuseum ? EVENTS.filter(event => event.museumId === selectedMuseum) : [];

  const isButtonDisabled = isUserLoading || !userId || !selectedMuseum || !selectedEvent || numTickets <= 0;
  
  const eventDetails = EVENTS.find(e => e.id === selectedEvent);
  const totalPrice = eventDetails ? (eventDetails.basePrice * numTickets).toFixed(2) : '0.00';


  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">New Manual Booking</h1>
          <p className="text-muted-foreground">Create a new ticket booking for a user.</p>
        </div>
        
        {pendingBooking ? (
            <Card>
                <CardHeader>
                    <CardTitle>Complete Your Booking</CardTitle>
                    <CardDescription>Finalize payment for your tickets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-card-foreground/5 p-4 text-sm">
                        <div className="flex justify-between"><span>Event:</span> <span className="font-medium">{pendingBooking.eventTitle}</span></div>
                        <div className="flex justify-between"><span>Museum:</span> <span className="font-medium">{pendingBooking.museumName}</span></div>
                        <div className="flex justify-between"><span>Tickets:</span> <span className="font-medium">{pendingBooking.numTickets}</span></div>
                        <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t"><span>Total:</span> <span>${pendingBooking.pricePaid.toFixed(2)}</span></div>
                    </div>
                     <Button onClick={handleSimulatePayment} className="w-full" disabled={isProcessingPayment}>
                        {isProcessingPayment ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        {isProcessingPayment ? 'Processing...' : `Simulate Payment of $${totalPrice}`}
                    </Button>
                     <Button variant="outline" className="w-full" onClick={() => setPendingBooking(null)}>Cancel</Button>
                </CardContent>
            </Card>
        ) : (
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
                        placeholder={isUserLoading ? "Loading user..." : "e.g., user-123"}
                        disabled
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
                   {eventDetails && (
                        <div className="text-right font-bold text-lg">
                            Total: ${totalPrice}
                        </div>
                    )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isButtonDisabled}>
                      <Ticket className="mr-2 h-4 w-4" />
                      Create Booking
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
        )}
      </div>

      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Successful!</AlertDialogTitle>
            <AlertDialogDescription>Your ticket has been created.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 flex justify-center">
            {confirmedBooking && (
              <div className="w-[350px] scale-75 transform origin-top">
                <div ref={ticketRef}>
                  <TicketPDF booking={confirmedBooking} />
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter className="sm:justify-between">
             <Button variant="outline" onClick={handleCloseConfirmation}>
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
            <Button onClick={handleDownloadPdf}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
