
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, Loader2, Calendar, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const statusStyles: { [key: string]: string } = {
  paid: 'bg-blue-100 text-blue-800 border-blue-300',
  checkedIn: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const recentBookingsQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'bookings'), orderBy('createdAt', 'desc'), limit(3));
  }, [firestore, user?.uid]);

  const { data: recentBookings, isLoading: areBookingsLoading } = useCollection<Booking>(recentBookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.displayName || 'User'}!</h1>
            <p className="text-muted-foreground">Here's a quick look at your recent activity.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your three most recent museum bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="ml-2">Loading your bookings...</p>
                    </div>
                 ) : recentBookings && recentBookings.length > 0 ? (
                    <div className="space-y-4">
                        {recentBookings.map(booking => (
                            <Card key={booking.id} className="flex flex-col sm:flex-row">
                                <div className="flex flex-1 flex-col p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{booking.eventTitle}</h3>
                                        <Badge variant="outline" className={cn('capitalize', statusStyles[booking.status])}>{booking.status}</Badge>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground pt-1">
                                        <Building className="h-4 w-4 mr-1.5"/>
                                        <span>{booking.museumName}</span>
                                    </div>
                                    <Separator className="my-3"/>
                                     <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4"/>
                                            <span>{booking.eventDate}</span>
                                        </div>
                                        <span className="font-bold text-lg">${booking.pricePaid.toFixed(2)}</span>
                                     </div>
                                </div>
                            </Card>
                        ))}

                        <div className="text-center pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/bookings">View All My Bookings</Link>
                            </Button>
                        </div>
                    </div>
                 ) : (
                    <div className="flex h-64 flex-col items-center justify-center space-y-4 text-center">
                        <Ticket className="h-16 w-16 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">Ready for an adventure?</h3>
                        <p className="text-muted-foreground">
                        You haven't booked any tickets yet. Let's find something amazing.
                        </p>
                        <Button asChild>
                        <Link href="/museums">Explore Museums</Link>
                        </Button>
                    </div>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
