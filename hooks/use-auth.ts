"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Not authenticated");
    return r.json();
  });

/**
 * SWR-based hook for managing auth state across components.
 * Fetches /api/auth/me and caches the result.
 */
export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user && !error,
    mutate,
  };
}
