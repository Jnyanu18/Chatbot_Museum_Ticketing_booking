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
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { MUSEUMS } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MuseumsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Museums</CardTitle>
          <CardDescription>
            Manage your museums and their details.
          </CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Museum
        </Button>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {MUSEUMS.map((museum) => (
            <Card key={museum.id} className="w-full">
              <CardHeader>
                <CardTitle className="text-base">{museum.name}</CardTitle>
                <CardDescription>
                  {museum.location.city}, {museum.location.country}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm">
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
              {MUSEUMS.map((museum) => (
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
