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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Ticket } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const mockUsers = [
  { id: 'user-1', name: 'John Doe', email: 'john.doe@example.com', role: 'admin' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'staff' },
  { id: 'user-3', name: 'Peter Jones', email: 'peter.jones@example.com', role: 'visitor' },
  { id: 'user-4', name: 'Mary Johnson', email: 'mary.j@example.com', role: 'visitor' },
];

export default function UsersPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Users</CardTitle>
          <CardDescription>Manage your application users.</CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {mockUsers.map((user) => (
            <Card key={user.id} className="w-full">
              <CardHeader>
                <CardTitle className="text-base">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                  {user.role}
                </Badge>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" size="sm">
                  <Ticket className="mr-2 h-4 w-4" /> Bookings
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> Edit
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Bookings</DropdownMenuItem>
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
