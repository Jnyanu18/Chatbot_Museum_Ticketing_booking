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
  Bell,
  BarChart3,
  PieChart,
  GitCommitHorizontal,
  ScanLine,
  Bot,
  Percent,
  PlusCircle,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

const commonLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: AreaChart },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: Ticket },
];

const adminLinks = [
  { href: '/dashboard/new-booking', label: 'New Booking', icon: PlusCircle },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
  { href: '/dashboard/museums', label: 'Museums', icon: Building2 },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/promotions', label: 'Promotions', icon: Percent },
  { href: '/dashboard/users', label: 'Users', icon: Users },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  
  // This is a placeholder for role management.
  // In a real app, this would come from custom claims or a database lookup.
  const isAdmin = true; 

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
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
            {commonLinks.map(link => (
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
        </SidebarMenu>

        {isAdmin && (
            <>
            <Separator className="my-4"/>
            <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarMenu>
                    {adminLinks.map(link => (
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
                </SidebarMenu>
            </SidebarGroup>
            </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/settings')} tooltip={{ children: 'Settings' }}>
                    <Link href="/dashboard/settings"><Settings /> <span>Settings</span></Link>
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
