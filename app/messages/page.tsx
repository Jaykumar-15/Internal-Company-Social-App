/**
 * /messages - Conversations list page.
 * Shows all conversation partners with last message snippet.
 * Uses SWR for data fetching.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/app-header";
import { MessageSquare, Loader2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function MessagesPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useSWR(
    isAuthenticated ? "/api/messages/conversations" : null,
    fetcher,
    { refreshInterval: 10000 }
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
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your conversations with teammates
            </p>
          </div>
          <Link
            href="/members"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Find People</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.conversations?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No conversations yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Find a teammate in the directory to start a conversation
            </p>
            <Link
              href="/members"
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse Directory
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {data.conversations.map(
              (conv: {
                partner_id: number;
                partner_name: string;
                partner_avatar?: string;
                partner_title?: string;
                partner_department?: string;
                last_message: string;
                last_message_at: string;
                last_message_sender_id: number;
              }) => (
                <Link
                  key={conv.partner_id}
                  href={`/messages/${conv.partner_id}`}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  {conv.partner_avatar ? (
                    <img
                      src={conv.partner_avatar}
                      alt={conv.partner_name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {getInitials(conv.partner_name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {conv.partner_name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.last_message_sender_id === user?.id ? "You: " : ""}
                      {conv.last_message}
                    </p>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
