import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Returns the current user id, or redirects to /login if there is no session.
 * Use this at the top of any protected page or server action to both guard
 * the route and get the id you scope every query by.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}
