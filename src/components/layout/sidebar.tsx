
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AreaChart,
  BarChart,
  Building2,
  Calendar,
  Settings,
  Ticket,
  Users,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

const commonLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: AreaChart },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: Ticket },
];

const adminLinks = [
  { href: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
  { href: '/admin/museums', label: 'Museums', icon: Building2 },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  
  // This is a placeholder for role management.
  // In a real app, this would come from custom claims or a database lookup.
  const isAdmin = true; 
  const isViewingAdmin = pathname.startsWith('/admin');

  const isActive = (href: string) => {
    // Exact match for dashboard/admin root, prefix match for sub-pages.
    if (href === '/dashboard' || href === '/admin') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const linksToShow = isViewingAdmin && isAdmin ? adminLinks : commonLinks;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
            <Building2 className="size-6 text-sidebar-primary" />
            <span className="text-xl font-headline font-semibold">MuseumConnect</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
          <SidebarMenu>
            {linksToShow.map(link => (
                <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive(link.href)}
                        tooltip={{ children: link.label }}
                    >
                        <Link href={link.href}>
                            <link.icon />
                            <span>{link.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
             {isAdmin && !isViewingAdmin && (
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin')}
                        tooltip={{ children: "Admin Dashboard" }}
                    >
                        <Link href="/admin">
                            <ShieldCheck />
                            <span>Admin</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             )}
             {isAdmin && isViewingAdmin && (
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard')}
                        tooltip={{ children: "User Dashboard" }}
                    >
                        <Link href="/dashboard">
                            <AreaChart />
                            <span>User Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             )}
        </SidebarMenu>
        
      </SidebarContent>
      <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(isViewingAdmin && isAdmin ? '/admin/settings' : '/dashboard/settings')} tooltip={{ children: 'Settings' }}>
                    <Link href={isViewingAdmin && isAdmin ? '/admin/settings' : '/dashboard/settings'}><Settings /> <span>Settings</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Logout' }} className="text-red-400 hover:bg-red-500/10 hover:text-red-400">
                    <LogOut /> <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        <Separator className="my-2" />
        { isUserLoading ? (
            <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1 w-full">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                </div>
            </div>
        ) : user ? (
            <div className="flex items-center gap-3 p-2">
                <Avatar>
                    <AvatarImage src={user.photoURL ?? `https://i.pravatar.cc/150?u=${user.uid}`} />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">{user.displayName}</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate">{user.email}</span>
                </div>
            </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
