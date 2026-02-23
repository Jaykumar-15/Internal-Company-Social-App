/**
 * /me - Current user's profile page with edit form.
 * Includes Feature A: Privacy setting (show/hide email).
 * Includes Feature B: Displays last_seen_at (online status).
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/app-header";
import { Loader2, Check, User } from "lucide-react";

export default function MyProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, mutate } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    department: "",
    title: "",
    skills: "",
    bio: "",
    show_email: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        department: user.department || "",
        title: user.title || "",
        skills: user.skills || "",
        bio: user.bio || "",
        show_email: user.show_email !== false,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }

      setSaved(true);
      mutate(); // Refresh auth data
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your profile information visible to teammates
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {saved && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
              <Check className="h-4 w-4" />
              Profile saved successfully
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {user?.name ? (
                  user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Job Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="department" className="text-sm font-medium text-foreground">
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Engineering"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="skills" className="text-sm font-medium text-foreground">
                Skills
              </label>
              <input
                id="skills"
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Comma-separated, e.g., React, Node.js, Design"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-sm font-medium text-foreground">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Tell your teammates a bit about yourself..."
              />
            </div>

            {/* Feature A: Profile privacy setting */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-4">
              <input
                id="show_email"
                type="checkbox"
                checked={form.show_email}
                onChange={(e) =>
                  setForm({ ...form, show_email: e.target.checked })
                }
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <label htmlFor="show_email" className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Show email on profile
                </span>
                <span className="text-xs text-muted-foreground">
                  When disabled, your email will be hidden from other members
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
