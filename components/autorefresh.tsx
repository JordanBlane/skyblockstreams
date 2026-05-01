'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const POLL_INTERVAL = 30 * 1000;

export default function AutoRefresh() {
  const router = useRouter();
  const lastHash = useRef<string | null>(null);
  const routerRef = useRef(router);
  const inFlightRef = useRef(false);

  // Keep routerRef current without re-triggering the effect
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const poll = async () => {
      // Skip if a request is already in flight
      if (inFlightRef.current) return;
      // Skip polling when tab is hidden
      if (document.visibilityState === 'hidden') return;

      inFlightRef.current = true;
      try {
        const res = await fetch('/api/streams/hash');
        if (!res.ok) return;
        const { hash } = await res.json();
        if (lastHash.current !== null && lastHash.current !== hash) {
          routerRef.current.refresh();
        }
        lastHash.current = hash;
      } catch {
        // silently ignore network errors
      } finally {
        inFlightRef.current = false;
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);

    // Also re-poll immediately when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // stable — uses refs only

  return null;
}