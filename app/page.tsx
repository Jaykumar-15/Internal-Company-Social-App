import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * Root page - redirects authenticated users to /members,
 * unauthenticated users to /login.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/members");
  } else {
    redirect("/login");
  }
}
