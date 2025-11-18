"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { USER } from "@/lib/data";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/museums", label: "Museums" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline text-lg">
              MuseumConnect
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline text-lg">
                MuseumConnect
                </span>
            </Link>
            <div className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                    "transition-colors hover:text-primary p-2 rounded-md",
                    pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                >
                    {link.label}
                </Link>
                ))}
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
            {USER ? (
                 <Button asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>
      </div>
    </header>
  );
}
