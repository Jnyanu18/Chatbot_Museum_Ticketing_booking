'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { USER } from '@/lib/data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

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
  const isAdmin = USER.role === 'admin';

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
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
                    <Collapsible>
                        <SidebarMenuItem>
                             <CollapsibleTrigger asChild>
                                 <SidebarMenuButton
                                    isActive={pathname.startsWith('/dashboard/analytics')}
                                    tooltip={{ children: "Analytics" }}
                                    className="justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <BarChart />
                                        <span>Analytics</span>
                                    </div>
                                </SidebarMenuButton>
                             </CollapsibleTrigger>
                        </SidebarMenuItem>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/analytics'}>
                                        <Link href="/dashboard/analytics">Overview</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>

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
                <SidebarMenuButton asChild tooltip={{ children: 'Logout' }} className="text-red-400 hover:bg-red-500/10 hover:text-red-400">
                    <Link href="/login"><LogOut /> <span>Logout</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        <Separator className="my-2" />
        <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/150?u=${USER.id}`} />
                <AvatarFallback>{USER.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="font-medium truncate">{USER.displayName}</span>
                <span className="text-xs text-sidebar-foreground/70 truncate">{USER.email}</span>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
