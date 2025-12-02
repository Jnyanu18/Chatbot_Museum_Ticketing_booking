'use client';

import { useState } from 'react';
import type { Promotion } from '@/lib/types';
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Tag } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PROMOTIONS } from '@/lib/data';

function PromotionForm({
  promotion,
  onSave,
  onClose,
}: {
  promotion?: Promotion | null;
  onSave: (promotionData: Partial<Promotion>) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    code: promotion?.code || '',
    discountPercent: promotion?.discountPercent || 0,
    active: promotion?.active ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    if (type === 'checkbox') {
        setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
        setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const promotionData: Partial<Promotion> = {
      ...formData,
      discountPercent: Number(formData.discountPercent),
    };

    try {
      await onSave(promotionData);
      toast({ title: promotion ? 'Promotion Updated' : 'Promotion Created', description: 'The promotion has been saved successfully.' });
      onClose();
    } catch (error) {
      console.error('Failed to save promotion:', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the promotion.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <Input id="code" value={formData.code} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount (%)</Label>
                <Input id="discountPercent" type="number" value={formData.discountPercent} onChange={handleChange} required min="0" max="100"/>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="active" checked={formData.active} onCheckedChange={(checked) => setFormData(p => ({...p, active: checked}))} />
            <Label htmlFor="active">Active</Label>
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Promotion'}
            </Button>
        </DialogFooter>
    </form>
  );
}


export default function PromotionsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const { toast } = useToast();
    
    const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS);
    const isLoading = false;

    const handleSavePromotion = async (promotionData: Partial<Promotion>) => {
        if (selectedPromotion) {
            setPromotions(promotions.map(p => p.id === selectedPromotion.id ? { ...p, ...promotionData, id: p.id } as Promotion : p));
        } else {
            const newPromotion = {
                ...promotionData,
                id: `promo-${Date.now()}`,
            } as Promotion;
            setPromotions([newPromotion, ...promotions]);
        }
    };

    const handleDeletePromotion = async (promoId: string) => {
        if(window.confirm('Are you sure you want to delete this promotion?')) {
            try {
                setPromotions(promotions.filter(p => p.id !== promoId));
                toast({ title: 'Promotion Deleted', description: 'The promotion has been successfully deleted.' });
            } catch(error) {
                console.error("Error deleting promotion:", error);
                toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the promotion.' });
            }
        }
    };
    
    const openEditDialog = (promo: Promotion) => {
        setSelectedPromotion(promo);
        setIsDialogOpen(true);
    }

    const openNewDialog = () => {
        setSelectedPromotion(null);
        setIsDialogOpen(true);
    }
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">Promotions</CardTitle>
                        <CardDescription>
                            Manage your promotional campaigns and discounts.
                        </CardDescription>
                    </div>
                    <DialogTrigger asChild>
                        <Button onClick={openNewDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Promotion
                        </Button>
                    </DialogTrigger>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="ml-2">Loading promotions...</p>
                        </div>
                    ) : promotions.length === 0 ? (
                         <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                            <div className="text-center">
                                <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No Promotions Found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first promotional campaign.</p>
                                <DialogTrigger asChild>
                                    <Button className="mt-4" onClick={openNewDialog}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Promotion
                                    </Button>
                                </DialogTrigger>
                            </div>
                        </div>
                    ) : (
                        <>
                        {/* Desktop View */}
                        <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {promotions.map((promo) => (
                                <TableRow key={promo.id}>
                                    <TableCell className="font-medium">{promo.title}</TableCell>
                                    <TableCell><Badge variant="secondary">{promo.code}</Badge></TableCell>
                                    <TableCell>{promo.discountPercent}%</TableCell>
                                    <TableCell>
                                        <Badge variant={promo.active ? 'default' : 'outline'}>
                                            {promo.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(promo)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeletePromotion(promo.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                        {/* Mobile View */}
                        <div className="space-y-4 md:hidden">
                            {promotions.map((promo) => (
                                <Card key={promo.id}>
                                    <CardHeader>
                                        <CardTitle className="text-base">{promo.title}</CardTitle>
                                        <CardDescription>{promo.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Code:</span>
                                            <Badge variant="secondary">{promo.code}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Discount:</span>
                                            <span className="font-bold">{promo.discountPercent}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant={promo.active ? 'default' : 'outline'}>{promo.active ? 'Active' : 'Inactive'}</Badge>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(promo)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeletePromotion(promo.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedPromotion ? 'Edit Promotion' : 'Add New Promotion'}</DialogTitle>
                    <DialogDescription>
                        {selectedPromotion ? 'Make changes to your promotion.' : 'Fill in the details to create a new campaign.'}
                    </DialogDescription>
                </DialogHeader>
                <PromotionForm 
                    promotion={selectedPromotion} 
                    onSave={handleSavePromotion} 
                    onClose={() => setIsDialogOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
