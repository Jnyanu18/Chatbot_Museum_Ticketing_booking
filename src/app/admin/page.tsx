
'use client';
import { useMemo } from 'react';
import { BarChart, Building2, Calendar, Users, Lightbulb } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingsOverTimeChart from '@/components/charts/bookings-over-time-chart';
import RevenueByMuseumChart from '@/components/charts/revenue-by-museum-chart';
import { bookingsOverTimeData, revenueByMuseumData } from '@/lib/data';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { User, Museum, Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const managementSections = [
    {
        title: "Analytics",
        description: "View detailed insights and reports on your museum operations.",
        href: "/admin/analytics",
        icon: BarChart,
    },
    {
        title: "Manage Events",
        description: "Create, edit, and manage all events across your museums.",
        href: "/admin/events",
        icon: Calendar,
    },
    {
        title: "Manage Museums",
        description: "Add, update, and manage museum details and information.",
        href: "/admin/museums",
        icon: Building2,
    }
]

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const usersQuery = useMemo(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const museumsQuery = useMemo(() => firestore ? collection(firestore, 'museums') : null, [firestore]);
  const eventsQuery = useMemo(() => firestore ? collection(firestore, 'events') : null, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: museums, isLoading: museumsLoading } = useCollection<Museum>(museumsQuery);
  const { data: events, isLoading: eventsLoading } = useCollection<Event>(eventsQuery);

  const isLoading = usersLoading || museumsLoading || eventsLoading;

  const quickStats = [
    { title: "Total Users", value: users?.length ?? 0, icon: Users },
    { title: "Total Museums", value: museums?.length ?? 0, icon: Building2 },
    { title: "Total Events", value: events?.length ?? 0, icon: Calendar },
  ]


  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">An overview of your museum operations.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            {quickStats.map(stat => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">{stat.value}</div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Bookings Over Time</CardTitle>
                    <CardDescription>Recent booking trends.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BookingsOverTimeChart data={bookingsOverTimeData} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Revenue By Museum</CardTitle>
                     <CardDescription>Performance of each museum.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueByMuseumChart data={revenueByMuseumData} />
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
             {managementSections.map((section) => (
                <Card key={section.title} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <section.icon className="h-6 w-6 text-primary"/>
                            <span>{section.title}</span>
                        </CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                         <Button asChild className="w-full">
                            <Link href={section.href}>Go to {section.title}</Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
        
    </div>
  );
}
