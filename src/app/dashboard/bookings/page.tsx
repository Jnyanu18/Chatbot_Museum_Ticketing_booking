
'use client';

import { useMemo } from 'react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, QrCode, Receipt, Ticket, Loader2, Building, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const statusStyles: { [key: string]: string } = {
  paid: 'bg-blue-100 text-blue-800 border-blue-300',
  checkedIn: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore, user?.uid]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">My Bookings</CardTitle>
        <CardDescription>
          View your past and upcoming museum visits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Loading your bookings...</p>
          </div>
        ) : bookings && bookings.length > 0 ? (
          <>
          {/* Mobile View */}
          <div className="space-y-4 md:hidden">
            {bookings.map((booking) => (
              <Card key={booking.id} className="w-full">
                <CardHeader>
                  <CardTitle className="text-base">{booking.eventTitle}</CardTitle>
                   <div className="flex items-center text-sm text-muted-foreground pt-1">
                      <Building className="h-4 w-4 mr-1.5"/>
                      <span>{booking.museumName}</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Date:</span>
                     <span>{booking.eventDate}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Tickets:</span>
                     <span>{booking.numTickets}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-muted-foreground">Status:</span>
                     <Badge variant="outline" className={cn('capitalize', statusStyles[booking.status])}>{booking.status}</Badge>
                   </div>
                   <div className="flex justify-between font-medium">
                     <span>Total:</span>
                     <span>${booking.pricePaid.toFixed(2)}</span>
                   </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                        <QrCode className="mr-2 h-4 w-4" />
                        Ticket
                    </Button>
                     <Button variant="outline" size="sm">
                        <Receipt className="mr-2 h-4 w-4" />
                        Receipt
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Museum</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.eventTitle}
                    </TableCell>
                    <TableCell>{booking.museumName}</TableCell>
                    <TableCell>
                      {booking.eventDate}
                    </TableCell>
                    <TableCell>{booking.numTickets}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize',
                          statusStyles[booking.status]
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${booking.pricePaid.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <QrCode className="mr-2 h-4 w-4" />
                            View Ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Receipt className="mr-2 h-4 w-4" />
                            View Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center space-y-4 text-center">
            <Ticket className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Bookings Found</h3>
            <p className="text-muted-foreground">
              You haven't booked any tickets yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/new-booking">Create a Booking</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
