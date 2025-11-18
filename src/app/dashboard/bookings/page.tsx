import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BOOKINGS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, QrCode, Receipt } from "lucide-react";

const statusStyles = {
    paid: 'bg-blue-100 text-blue-800 border-blue-300',
    checkedIn: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
}

export default function MyBookingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">My Bookings</CardTitle>
                <CardDescription>View your past and upcoming museum visits.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Museum</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Tickets</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {BOOKINGS.map(booking => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.eventTitle}</TableCell>
                                <TableCell>{booking.museumName}</TableCell>
                                <TableCell>{new Date(booking.eventDate).toLocaleDateString()}</TableCell>
                                <TableCell>{booking.numTickets}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("capitalize", statusStyles[booking.status])}>
                                        {booking.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">${booking.pricePaid.toFixed(2)}</TableCell>
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
            </CardContent>
        </Card>
    );
}
