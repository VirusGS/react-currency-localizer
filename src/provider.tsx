import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import type { CurrencyConverterProviderProps } from './types'

// Create a default QueryClient instance with optimized settings
const createDefaultQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default cache time - geolocation queries will override this
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        // Default stale time - exchange rate queries will have shorter
        staleTime: 1000 * 60 * 60, // 1 hour
        // Disable retries by default to respect API rate limits
        retry: false,
        // Don't refetch on window focus by default for better UX
        refetchOnWindowFocus: false,
      },
    },
  })
}

// Create persister for localStorage (only if available)
const createPersister = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: 'react-currency-localizer-cache',
    })
  }
  return null
}

// Removed singleton pattern - each provider instance creates its own client

/**
 * Provider component that sets up TanStack Query with persistent caching
 * for the currency conversion functionality.
 */
export const CurrencyConverterProvider: React.FC<CurrencyConverterProviderProps> = ({
  children,
  queryClient,
}) => {
  // Create QueryClient instance per provider to avoid singleton issues
  // This is better for React Strict Mode, testing, and SSR
  const [client] = useState(() => {
    // If a client is provided, use it
    if (queryClient) return queryClient

    // Otherwise, create a new one ONCE per component instance
    const newClient = createDefaultQueryClient()
    
    // Set up persistence if possible
    const persister = createPersister()
    if (persister) {
      persistQueryClient({
        queryClient: newClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buster: 'v1', // Change this to invalidate old cache
      })
    }
    
    return newClient
  })

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}
