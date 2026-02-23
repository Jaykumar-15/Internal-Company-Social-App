/**
 * /messages/[userId] - 1:1 chat thread page.
 * Shows chronological messages with a send box at the bottom.
 * Auto-refreshes every 5 seconds (polling-based; no WebSocket needed).
 * Messages are escaped in the UI to prevent XSS.
 */
"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/app-header";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday " + format(date, "h:mm a");
  return format(date, "MMM d, h:mm a");
}

export default function ThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, mutate } = useSWR(
    isAuthenticated ? `/api/messages/thread/${userId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/thread/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message.trim() }),
      });

      if (res.ok) {
        setMessage("");
        mutate(); // Refresh messages
      }
    } catch {
      // Silently fail - user can retry
    } finally {
      setSending(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const partner = data?.partner;
  const messages = data?.messages || [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      {/* Thread header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            href="/messages"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {partner && (
            <Link
              href={`/members/${partner.id}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              {partner.avatar_url ? (
                <img
                  src={partner.avatar_url}
                  alt={partner.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(partner.name)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {partner.name}
                </p>
                {partner.title && (
                  <p className="text-xs text-muted-foreground">
                    {partner.title}
                  </p>
                )}
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {"No messages yet. Say hello!"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map(
                (msg: {
                  id: number;
                  sender_id: number;
                  body: string;
                  created_at: string;
                }) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {/* Text content is rendered safely via React's built-in escaping */}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.body}
                        </p>
                        <p
                          className={`mt-1 text-[10px] ${
                            isMine
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message input */}
      <div className="border-t border-border bg-card">
        <form
          onSubmit={handleSend}
          className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={5000}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
