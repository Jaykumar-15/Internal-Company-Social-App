/**
 * /members/[id] - Individual member profile page.
 * Shows full profile info, skills, bio, and a message button.
 * Respects privacy settings (show_email).
 */
"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/app-header";
import {
  MessageSquare,
  Mail,
  Briefcase,
  Building,
  Clock,
  ArrowLeft,
  Loader2,
} from "lucide-react";
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

function isRecentlyOnline(lastSeen?: string) {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000;
}

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated, isLoading: authLoading, user: currentUser } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useSWR(
    isAuthenticated ? `/api/users/${id}` : null,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

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

  const member = data?.member;
  if (!member) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">Member not found</p>
          <Link
            href="/members"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  const online = isRecentlyOnline(member.last_seen_at);
  const isOwnProfile = currentUser?.id === member.id;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/members"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to directory
        </Link>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="relative">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={`${member.name}'s avatar`}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(member.name)}
                </div>
              )}
              {online && (
                <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">
                {member.name}
              </h1>
              {member.title && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  {member.title}
                </p>
              )}
              {member.department && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building className="h-3.5 w-3.5" />
                  {member.department}
                </p>
              )}
              {member.email && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {member.email}
                </p>
              )}
              <div className="mt-1 flex items-center gap-2">
                {online ? (
                  <span className="text-xs font-medium text-emerald-600">
                    Online now
                  </span>
                ) : member.last_seen_at ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last seen{" "}
                    {formatDistanceToNow(new Date(member.last_seen_at), {
                      addSuffix: true,
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {member.bio && (
            <div className="mt-5 border-t border-border pt-5">
              <h2 className="mb-2 text-sm font-medium text-foreground">
                About
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {member.bio}
              </p>
            </div>
          )}

          {member.skills && (
            <div className="mt-5 border-t border-border pt-5">
              <h2 className="mb-2 text-sm font-medium text-foreground">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {member.skills.split(",").map((skill: string) => (
                  <span
                    key={skill.trim()}
                    className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-3 border-t border-border pt-5">
            {isOwnProfile ? (
              <Link
                href="/me"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Edit Profile
              </Link>
            ) : (
              <Link
                href={`/messages/${member.id}`}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <MessageSquare className="h-4 w-4" />
                Send Message
              </Link>
            )}
          </div>
        </div>

        {member.created_at && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {"Joined "}
            {formatDistanceToNow(new Date(member.created_at), {
              addSuffix: true,
            })}
          </p>
        )}
      </main>
    </div>
  );
}
