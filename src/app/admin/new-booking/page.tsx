'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Ticket,
  X,
  Loader2,
  CreditCard,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { doc, setDoc, addDoc, collection, query, serverTimestamp } from 'firebase/firestore';
import type { Booking, Museum, Event } from '@/lib/types';
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


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
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const ticketRef = useRef<HTMLDivElement>(null);

  const museumsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'museums'));
  }, [firestore]);

  const eventsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'));
  }, [firestore]);

  const { data: museums, isLoading: areMuseumsLoading } = useCollection<Museum>(museumsQuery);
  const { data: events, isLoading: areEventsLoading } = useCollection<Event>(eventsQuery);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to create a booking.',
        duration: 5000,
      });
      router.push('/login');
      return;
    }
    setUserId(user.uid);
  }, [user, isUserLoading, router, toast]);

  useEffect(() => {
    const museumId = searchParams.get('museumId');
    const eventId = searchParams.get('eventId');
    if (museumId && museums?.some(m => m.id === museumId)) {
      setSelectedMuseum(museumId);
    }
    if (eventId && events?.some(e => e.id === eventId)) {
      setSelectedEvent(eventId);
    }
  }, [searchParams, museums, events]);

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

    setIsProcessingBooking(true);
    const event = events?.find((e) => e.id === selectedEvent);
    if (!event || !firestore) {
      setIsProcessingBooking(false);
      return;
    }

    const newBookingId = doc(collection(firestore, 'id_generator')).id;
    const bookingData: Omit<Booking, 'id'> = {
      userId: userId,
      eventId: selectedEvent,
      museumId: selectedMuseum,
      numTickets: numTickets,
      pricePaid: event.basePrice * numTickets,
      currency: 'USD',
      status: 'pending',
      createdAt: new Date(),
      eventTitle: event.title,
      museumName: museums?.find((m) => m.id === selectedMuseum)?.name || 'N/A',
      eventDate: event.date,
      slot: `${event.startTime}-${event.endTime}`,
      paymentId: `manual-${newBookingId}`,
      qrId: `qr-${newBookingId}`,
    };

    try {
      // We are creating a pending booking, so we can show a confirmation screen before payment
      setPendingBooking({ ...bookingData, id: newBookingId });
      toast({
        title: 'Booking Pending',
        description: `Your booking is ready for payment.`,
      });
    } catch (error) {
      console.error("Booking creation error: ", error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Could not create booking. Please try again.',
      });
    } finally {
      setIsProcessingBooking(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!pendingBooking || !firestore || !user) return;
    setIsProcessingPayment(true);
    
    const updatedBookingData: Booking = { ...pendingBooking, status: 'paid', createdAt: serverTimestamp() as any };
    const bookingDocRef = doc(firestore, 'users', user.uid, 'bookings', pendingBooking.id);
    
    const paymentData = {
      id: pendingBooking.paymentId,
      bookingId: pendingBooking.id,
      userId: pendingBooking.userId,
      amount: pendingBooking.pricePaid,
      currency: pendingBooking.currency,
      provider: 'simulated',
      status: 'succeeded',
      createdAt: serverTimestamp(),
    };
    const paymentDocRef = doc(firestore, 'payments', pendingBooking.paymentId!);

    try {
      await setDoc(bookingDocRef, updatedBookingData);
      await setDoc(paymentDocRef, paymentData);
      
      toast({
        title: 'Payment Successful!',
        description: 'Your booking is confirmed.',
      });
      setConfirmedBooking(updatedBookingData);
      setPendingBooking(null);
      setIsConfirmationOpen(true);
    } catch (error) {
       console.error("Payment processing error: ", error);
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
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`ticket-${confirmedBooking.id}.pdf`);
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    setConfirmedBooking(null);
    setSelectedMuseum('');
    setSelectedEvent('');
    setNumTickets(1);
    router.push('/admin/new-booking');
  };
  
  const handleCancelPayment = () => {
    setPendingBooking(null);
    toast({
        title: 'Booking Cancelled',
        description: 'Your pending booking has been cancelled.',
    });
  }

  const filteredEvents = useMemo(() => {
    return selectedMuseum && events ? events.filter((event) => event.museumId === selectedMuseum) : [];
  }, [selectedMuseum, events]);
  
  const selectedEventDetails = useMemo(() => {
     return events?.find((e) => e.id === selectedEvent);
  }, [selectedEvent, events]);

  const totalPrice = selectedEventDetails ? (selectedEventDetails.basePrice * numTickets) : 0;
  
  const isFormSubmittable = !isUserLoading && userId && selectedMuseum && selectedEvent && numTickets > 0 && !areMuseumsLoading && !areEventsLoading;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">New Manual Booking</h1>
          <p className="text-muted-foreground">
            Create a new ticket booking for a user.
          </p>
        </div>

        {pendingBooking ? (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Complete Your Booking</CardTitle>
                    <CardDescription>Review and finalize payment for your tickets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-card-foreground/5 p-4 text-sm space-y-2">
                        <div className="flex justify-between"><span>Event:</span> <span className="font-medium text-right">{pendingBooking.eventTitle}</span></div>
                        <div className="flex justify-between"><span>Museum:</span> <span className="font-medium text-right">{pendingBooking.museumName}</span></div>
                        <div className="flex justify-between"><span>Tickets:</span> <span className="font-medium">{pendingBooking.numTickets}</span></div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base"><span>Total Price:</span> <span>${pendingBooking.pricePaid.toFixed(2)}</span></div>
                    </div>
                </CardContent>
                 <CardFooter className="flex flex-col gap-2">
                    <Button onClick={handleSimulatePayment} className="w-full" disabled={isProcessingPayment}>
                        {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                        {isProcessingPayment ? 'Processing Payment...' : `Confirm & Pay $${pendingBooking.pricePaid.toFixed(2)}`}
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleCancelPayment} disabled={isProcessingPayment}>Cancel</Button>
                 </CardFooter>
            </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  Fill in the form to create a new booking reservation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBooking} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="museum">Museum</Label>
                      <Select value={selectedMuseum} onValueChange={setSelectedMuseum} disabled={areMuseumsLoading}>
                        <SelectTrigger id="museum" className="w-full">
                          <SelectValue placeholder={areMuseumsLoading ? "Loading museums..." : "Select a museum"} />
                        </SelectTrigger>
                        <SelectContent>
                          {museums?.map((museum) => (
                            <SelectItem key={museum.id} value={museum.id}>
                              {museum.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event">Event</Label>
                      <Select
                        value={selectedEvent}
                        onValueChange={setSelectedEvent}
                        disabled={!selectedMuseum || areEventsLoading}
                      >
                        <SelectTrigger id="event" className="w-full">
                          <SelectValue placeholder={areEventsLoading ? "Loading events..." : "Select an event"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredEvents.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                          {selectedMuseum && filteredEvents.length === 0 && !areEventsLoading && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No events for this museum.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     <div className="space-y-2">
                      <Label htmlFor="numTickets">Number of Tickets</Label>
                      <Input
                        id="numTickets"
                        type="number"
                        min="1"
                        value={numTickets}
                        onChange={(e) => setNumTickets(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userId">User ID</Label>
                      <Input
                        id="userId"
                        value={userId}
                        placeholder={isUserLoading ? 'Loading user...' : 'User ID'}
                        disabled
                        readOnly
                      />
                       <p className="text-xs text-muted-foreground">This is the ID of the logged-in user.</p>
                    </div>
                  </div>
                   <CardFooter className="px-0 pt-6">
                    <Button type="submit" disabled={!isFormSubmittable || isProcessingBooking}>
                       {isProcessingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />}
                       {isProcessingBooking ? "Creating..." : "Proceed to Payment"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Museum</span>
                            <span className="font-medium text-right">{museums?.find(m => m.id === selectedMuseum)?.name || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Event</span>
                            <span className="font-medium text-right">{selectedEventDetails?.title || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tickets</span>
                            <span className="font-medium">{numTickets > 0 ? numTickets : '-'}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total Price</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
                
                 {!isFormSubmittable && (
                     <Alert>
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Incomplete Form</AlertTitle>
                        <AlertDescription>Please select a museum, event, and number of tickets to proceed.</AlertDescription>
                    </Alert>
                )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Your ticket has been generated. You can download it now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 flex justify-center">
            {confirmedBooking && (
              <div className="w-[350px] origin-top scale-75 transform">
                 <div ref={ticketRef}>
                   <TicketPDF booking={confirmedBooking} />
                 </div>
              </div>
            )}
          </div>
          <AlertDialogFooter className="sm:justify-between flex flex-row-reverse sm:flex-row">
            <Button onClick={handleDownloadPdf}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button variant="outline" onClick={handleCloseConfirmation}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
