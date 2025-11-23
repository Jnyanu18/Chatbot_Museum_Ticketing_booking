'use client';

import { useMemo } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
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
import { MoreHorizontal, QrCode, Receipt, Ticket, Loader2 } from 'lucide-react';
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

  const bookingsQuery = useMemoFirebase(() => {
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
                    {new Date(booking.eventDate).toLocaleDateString()}
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
        ) : (
          <div className="flex h-64 flex-col items-center justify-center space-y-4 text-center">
            <Ticket className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Bookings Found</h3>
            <p className="text-muted-foreground">
              You haven&apos;t booked any tickets yet.
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
