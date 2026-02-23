/**
 * Shared navigation header component.
 * Shows app branding, navigation links, and user menu with logout.
 */
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Building2, Users, MessageSquare, User, LogOut } from "lucide-react";

export function AppHeader() {
  const { user, isAuthenticated, isLoading, mutate } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    mutate(null, false);
    router.push("/login");
  }

  if (!isAuthenticated || isLoading) return null;

  const navLinks = [
    { href: "/members", label: "Directory", icon: Users },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/me", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/members" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground">TeamHub</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
