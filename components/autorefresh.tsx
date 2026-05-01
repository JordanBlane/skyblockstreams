'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const POLL_INTERVAL = 30 * 1000;

export default function AutoRefresh() {
  const router = useRouter();
  const lastHash = useRef<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/streams/hash');
        const { hash } = await res.json();

        if (lastHash.current && lastHash.current !== hash) {
          router.refresh();
        }

        lastHash.current = hash;
      } catch {
        // silently ignore network errors
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}