import Link from 'next/link';
import { Building2, KeyRound, Mail, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Link href="/" className="absolute top-4 left-4 flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline text-lg">
              MuseumConnect
            </span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join us and start exploring</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input id="name" placeholder="John Doe" required className="pl-10" />
               </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="m@example.com" required className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input id="password" type="password" required className="pl-10" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
