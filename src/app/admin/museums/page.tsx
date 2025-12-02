'use client';

import { useState } from 'react';
import type { Museum } from '@/lib/types';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MUSEUMS } from '@/lib/data';

function MuseumForm({
  museum,
  onSave,
  onClose,
}: {
  museum?: Museum | null;
  onSave: (museumData: Partial<Museum>) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: museum?.name || '',
    description: museum?.description || '',
    'location.address': museum?.location.address || '',
    'location.city': museum?.location.city || '',
    'location.country': museum?.location.country || '',
    imageUrl: museum?.imageUrl?.startsWith('https://picsum.photos') ? '' : museum?.imageUrl || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const museumData: Partial<Museum> = {
      name: formData.name,
      description: formData.description,
      location: {
        address: formData['location.address'],
        city: formData['location.city'],
        country: formData['location.country'],
      },
      openHours: museum?.openHours || [{ day: 'Mon-Sun', open: '10:00', close: '17:00' }],
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '-')}/600/400`,
      imageHint: museum?.imageHint || 'museum exterior',
    };

    try {
      await onSave(museumData);
      toast({ title: museum ? 'Museum Updated' : 'Museum Created', description: 'The museum has been saved successfully.' });
      onClose();
    } catch (error) {
      console.error('Failed to save museum:', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the museum. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Museum Name</Label>
        <Input id="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={handleChange} />
      </div>
      <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.png" />
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border p-4">
            <Input id="location.address" placeholder="Address" value={formData['location.address']} onChange={handleChange} required />
            <Input id="location.city" placeholder="City" value={formData['location.city']} onChange={handleChange} required />
            <Input id="location.country" placeholder="Country" className="sm:col-span-2" value={formData['location.country']} onChange={handleChange} required />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Museum'}
        </Button>
      </DialogFooter>
    </form>
  );
}


export default function MuseumsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);
  const { toast } = useToast();

  const [museums, setMuseums] = useState<Museum[]>(MUSEUMS);
  const isLoading = false;

  const handleSaveMuseum = async (museumData: Partial<Museum>) => {
    if(selectedMuseum) {
        setMuseums(museums.map(m => m.id === selectedMuseum.id ? { ...m, ...museumData, id: m.id } as Museum : m));
    } else {
        const newMuseum = {
            ...museumData,
            id: `museum-${Date.now()}`,
            createdAt: new Date(),
        } as Museum;
        setMuseums([newMuseum, ...museums]);
    }
  }

  const handleDeleteMuseum = async (museumId: string) => {
    if (window.confirm("Are you sure you want to delete this museum? This action cannot be undone.")) {
        try {
            setMuseums(museums.filter(m => m.id !== museumId));
            toast({ title: "Museum Deleted", description: "The museum has been successfully deleted." });
        } catch (error) {
            console.error("Error deleting museum: ", error);
            toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the museum. It may have associated events or bookings."});
        }
    }
  }

  const openEditDialog = (museum: Museum) => {
    setSelectedMuseum(museum);
    setIsDialogOpen(true);
  }

  const openNewDialog = () => {
    setSelectedMuseum(null);
    setIsDialogOpen(true);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Museums</CardTitle>
            <CardDescription>
              Manage your museums and their details.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Museum
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2">Loading museums...</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="space-y-4 md:hidden">
                {museums?.map((museum) => (
                  <Card key={museum.id} className="w-full">
                    <CardHeader>
                      <CardTitle className="text-base">{museum.name}</CardTitle>
                      <CardDescription>
                        {museum.location.city}, {museum.location.country}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(museum)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                       <Button variant="destructive" size="sm" onClick={() => handleDeleteMuseum(museum.id)}>
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
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {museums?.map((museum) => (
                      <TableRow key={museum.id}>
                        <TableCell className="font-medium">{museum.name}</TableCell>
                        <TableCell>{museum.location.city}</TableCell>
                        <TableCell>{museum.location.country}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(museum)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteMuseum(museum.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
      </Card>

       <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{selectedMuseum ? 'Edit Museum' : 'Add New Museum'}</DialogTitle>
            </DialogHeader>
            <MuseumForm 
                museum={selectedMuseum} 
                onSave={handleSaveMuseum} 
                onClose={() => setIsDialogOpen(false)}
            />
       </DialogContent>
    </Dialog>
  );
}
