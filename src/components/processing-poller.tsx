"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 3000;

/**
 * Refreshes the current route while any document is still PROCESSING, so the
 * status pill flips to READY on its own once the background job finishes.
 *
 * Polling rather than SSE or websockets: the wait is short and the state space
 * is tiny, so holding a serverless function open per viewer would cost a live
 * connection to save a handful of cheap requests. The interval stops as soon as
 * nothing is pending, so an idle dashboard makes no requests at all.
 */
export function ProcessingPoller({ pending }: { pending: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!pending) return;

    const id = setInterval(() => {
      // Refetches the server component tree in place. Client state and scroll
      // position survive, unlike a full location.reload().
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [pending, router]);

  return null;
}
