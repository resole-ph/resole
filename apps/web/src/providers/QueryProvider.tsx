'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Client-side data cache for the web app.
 *
 * Every screen here is a client component that fetches from our own route
 * handlers on mount, so none of Next's server-side caching applies. Without a
 * cache in front of that, page state lives in `useState` and dies with the
 * component — so every navigation refetched from scratch and showed a spinner.
 *
 * The client is created inside `useState` rather than at module scope on
 * purpose: a module-level client is shared across requests on the server, which
 * would leak one user's cached profile into another's render.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Matches apps/mobile so the two platforms age data the same way.
            // Within a minute of a fetch, a remount serves cache with no
            // request at all — this is what makes back-navigation instant.
            staleTime: 1000 * 60,
            // Data stays resident for 5 minutes after the last component
            // using it unmounts, so tabbing away and back is a cache hit.
            gcTime: 1000 * 60 * 5,
            retry: 2,
            // These default to true and cause a visible refetch every time
            // the user alt-tabs back to the browser. The data here (listings,
            // profile stats) does not change often enough to justify it.
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
