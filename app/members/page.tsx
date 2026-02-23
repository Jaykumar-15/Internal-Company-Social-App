/**
 * /members - Member directory page with search.
 * Uses SWR for data fetching and caching.
 * Search queries filter by name, department, or skills.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/app-header";
import { MemberCard } from "@/components/member-card";
import { Search, Loader2, Users } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MembersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useSWR(
    isAuthenticated
      ? `/api/users${debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : ""}`
      : null,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground text-balance">
            Team Directory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {"Browse and connect with your colleagues"}
          </p>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, department, or skills..."
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data?.members?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No members found
            </p>
            {debouncedSearch && (
              <p className="mt-1 text-xs text-muted-foreground">
                {"Try a different search term"}
              </p>
            )}
          </div>
        ) : (
          <>
            {data?.total !== undefined && (
              <p className="mb-4 text-xs text-muted-foreground">
                {data.total} {data.total === 1 ? "member" : "members"}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.members?.map(
                (member: {
                  id: number;
                  name: string;
                  title?: string;
                  department?: string;
                  skills?: string;
                  email?: string | null;
                  avatar_url?: string;
                  last_seen_at?: string;
                }) => (
                  <MemberCard key={member.id} member={member} />
                )
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
