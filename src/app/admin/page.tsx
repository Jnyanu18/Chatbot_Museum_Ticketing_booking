
import { AreaChart, BarChart, Building2, Ticket, Users } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingsOverTimeChart from '@/components/charts/bookings-over-time-chart';
import RevenueByMuseumChart from '@/components/charts/revenue-by-museum-chart';
import { bookingsOverTimeData, revenueByMuseumData } from '@/lib/data';

const quickStats = [
    { title: "Today's Revenue", value: "$1,250", change: "+15%", icon: AreaChart },
    { title: "Today's Bookings", value: "85", change: "+20%", icon: Ticket },
    { title: "New Users", value: "32", change: "+5%", icon: Users },
    { title: "Active Museums", value: "5", change: "", icon: Building2 },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">An overview of your museum operations.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickStats.map(stat => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        {stat.change && <p className="text-xs text-muted-foreground">{stat.change} from yesterday</p>}
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Bookings Over Time</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <BookingsOverTimeChart data={bookingsOverTimeData}/>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Museum</CardTitle>
                     <CardDescription>All time revenue distribution</CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueByMuseumChart data={revenueByMuseumData}/>
                </CardContent>
            </Card>
        </div>
        
        <div className="text-center">
            <Button asChild>
                <Link href="/admin/analytics">View Full Analytics</Link>
            </Button>
        </div>
    </div>
  );
}
