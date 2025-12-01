'use client';
import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import type { Event, Museum } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

function EventForm({
  event,
  museums,
  onSave,
  onClose,
}: {
  event?: Event | null;
  museums: Museum[];
  onSave: (eventData: Partial<Event>) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    museumId: event?.museumId || '',
    description: event?.description || '',
    date: event?.date || '',
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    basePrice: event?.basePrice || 0,
    capacity: event?.capacity || 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({...prev, museumId: value}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Add image placeholders and ensure numeric types
    const eventData = {
      ...formData,
      basePrice: Number(formData.basePrice),
      capacity: Number(formData.capacity),
      imageUrl: event?.imageUrl || `https://picsum.photos/seed/${formData.title.replace(/\s+/g, '-')}/400/200`,
      imageHint: event?.imageHint || 'event photo',
    };

    try {
      await onSave(eventData);
      toast({ title: event ? 'Event Updated' : 'Event Created', description: 'The event has been saved successfully.' });
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the event. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="museumId">Museum</Label>
            <Select onValueChange={handleSelectChange} value={formData.museumId} required>
                <SelectTrigger id="museumId">
                    <SelectValue placeholder="Select a museum" />
                </SelectTrigger>
                <SelectContent>
                    {museums.map(museum => (
                        <SelectItem key={museum.id} value={museum.id}>{museum.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($)</Label>
                <Input id="basePrice" type="number" value={formData.basePrice} onChange={handleChange} required min="0" step="0.01"/>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" value={formData.endTime} onChange={handleChange} required />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input id="capacity" type="number" value={formData.capacity} onChange={handleChange} required min="0" />
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Event'}
            </Button>
        </DialogFooter>
    </form>
  );
}

export default function EventsPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  const eventsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'), orderBy('date', 'desc'));
  }, [firestore]);

  const museumsQuery = useMemo(() => {
    if(!firestore) return null;
    return collection(firestore, 'museums');
  }, [firestore]);

  const { data: events, isLoading: areEventsLoading } = useCollection<Event>(eventsQuery);
  const { data: museums, isLoading: areMuseumsLoading } = useCollection<Museum>(museumsQuery);

  const getMuseumName = (museumId: string) => {
    return museums?.find((m) => m.id === museumId)?.name || 'Unknown';
  };

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    if (!firestore) throw new Error('Firestore not initialized');
    
    if (selectedEvent) { // Editing existing event
      const eventRef = doc(firestore, 'events', selectedEvent.id);
      await updateDoc(eventRef, eventData);
    } else { // Creating new event
      const newEventData = {
        ...eventData,
        bookedCount: 0,
        createdAt: serverTimestamp()
      }
      await addDoc(collection(firestore, 'events'), newEventData);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!firestore) throw new Error('Firestore not initialized');
    if(window.confirm('Are you sure you want to delete this event?')) {
        try {
            const eventRef = doc(firestore, 'events', eventId);
            await deleteDoc(eventRef);
             toast({ title: 'Event Deleted', description: 'The event has been successfully deleted.' });
        } catch(error) {
            console.error("Error deleting event:", error);
            toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the event.' });
        }
    }
  };
  
  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }

  const openNewDialog = () => {
    setSelectedEvent(null);
    setIsDialogOpen(true);
  }
  
  const isLoading = areEventsLoading || areMuseumsLoading;

  return (
     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Events</CardTitle>
            <CardDescription>
              Manage all events across your museums.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2">Loading events...</p>
             </div>
          ) : (
            <>
            {/* Mobile View */}
            <div className="space-y-4 md:hidden">
            {events?.map((event) => (
                <Card key={event.id} className="w-full">
                <CardHeader>
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <CardDescription>
                    <Badge variant="outline">{getMuseumName(event.museumId)}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${event.basePrice.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                    <TableHead>Price</TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {events?.map((event) => (
                    <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{getMuseumName(event.museumId)}</Badge>
                    </TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>${event.basePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DialogTrigger asChild>
                                <DropdownMenuItem onClick={() => openEditDialog(event)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
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
          )}
        </CardContent>

         <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                <DialogDescription>
                    {selectedEvent ? 'Make changes to an existing event.' : 'Fill out the form below to create a new event.'}
                </DialogDescription>
            </DialogHeader>
            { (areMuseumsLoading) ? <p>Loading museum data...</p> : 
                <EventForm 
                    event={selectedEvent} 
                    museums={museums || []} 
                    onSave={handleSaveEvent}
                    onClose={() => setIsDialogOpen(false)}
                 />
            }
        </DialogContent>
      </Card>
    </Dialog>
  );
}
