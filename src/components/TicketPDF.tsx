'use client';
import React, { forwardRef } from 'react';
import { Building2, Calendar, Clock, QrCode, Ticket, User } from 'lucide-react';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TicketPDFProps {
  booking: Booking;
}

const TicketPDF = forwardRef<HTMLDivElement, TicketPDFProps>(({ booking }, ref) => {
  return (
    <div ref={ref} className="p-4 bg-white text-black">
      <Card className="w-full max-w-sm border-2 border-dashed border-gray-400 rounded-lg shadow-lg">
        <CardHeader className="text-center bg-gray-100 p-4 rounded-t-lg">
          <div className="flex justify-center mb-2">
            <Ticket className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">{booking.eventTitle}</CardTitle>
          <CardDescription className="text-gray-600">{booking.museumName}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{new Date(booking.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{booking.slot}</span>
            </div>
             <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{booking.userId}</span>
            </div>
             <div className="flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{booking.numTickets} Ticket(s)</span>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col items-center justify-center space-y-4">
             <QrCode className="w-32 h-32" />
             <p className="text-xs text-gray-500 font-mono">{booking.qrId}</p>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-100 p-4 rounded-b-lg text-center">
            <p className="text-xs text-gray-500">
                Present this ticket at the entrance. Valid for one-time use.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
});

TicketPDF.displayName = 'TicketPDF';
export default TicketPDF;
