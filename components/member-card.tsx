/**
 * Member card component used in the directory grid.
 * Displays name, title, department, skills, and online status.
 */
"use client";

import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MemberCardProps {
  member: {
    id: number;
    name: string;
    title?: string;
    department?: string;
    skills?: string;
    email?: string | null;
    avatar_url?: string;
    last_seen_at?: string;
  };
}

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
  const diff = Date.now() - new Date(lastSeen).getTime();
  return diff < 5 * 60 * 1000; // 5 minutes
}

export function MemberCard({ member }: MemberCardProps) {
  const online = isRecentlyOnline(member.last_seen_at);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="relative">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={`${member.name}'s avatar`}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {getInitials(member.name)}
            </div>
          )}
          {online && (
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500"
              title="Online now"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/members/${member.id}`}
            className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
          >
            {member.name}
          </Link>
          {member.title && (
            <p className="text-xs text-muted-foreground">{member.title}</p>
          )}
          {member.department && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {member.department}
            </p>
          )}
        </div>
      </div>

      {member.skills && (
        <div className="mt-3 flex flex-wrap gap-1">
          {member.skills
            .split(",")
            .slice(0, 4)
            .map((skill) => (
              <span
                key={skill.trim()}
                className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {skill.trim()}
              </span>
            ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        {member.last_seen_at && !online ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(member.last_seen_at), {
              addSuffix: true,
            })}
          </span>
        ) : online ? (
          <span className="text-xs font-medium text-emerald-600">Online</span>
        ) : (
          <span />
        )}
        <Link
          href={`/messages/${member.id}`}
          className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <MessageSquare className="h-3 w-3" />
          Message
        </Link>
      </div>
    </div>
  );
}
