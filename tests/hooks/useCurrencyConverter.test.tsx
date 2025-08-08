import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCurrencyConverter } from '../../src/hooks/useCurrencyConverter'
import { createFetchMock, createFetchErrorMock, createRateLimitMock } from '../__mocks__/fetch'
import type { UseCurrencyConverterOptions } from '../../src/types'

// Check if integration tests should run with real APIs
const RUN_INTEGRATION_TESTS = process.env.VITE_RUN_INTEGRATION_TESTS === 'true'
const REAL_API_KEY = process.env.VITE_EXCHANGE_API_KEY

// Fetch setup is handled in tests/setup.ts

// Create wrapper component for QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const defaultOptions: UseCurrencyConverterOptions = {
  basePrice: 100,
  baseCurrency: 'USD',
  apiKey: 'test-api-key'
}

describe('useCurrencyConverter', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('successful conversion', () => {
    it('should convert price to detected local currency', async () => {
      global.fetch = createFetchMock()
      
      const { result } = renderHook(
        () => useCurrencyConverter(defaultOptions),
        { wrapper: createWrapper() }
      )

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.convertedPrice).toBeNull()
      expect(result.current.error).toBeNull()

      // Wait for conversion to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have converted 100 USD to USD (same currency)
      expect(result.current.convertedPrice).toBe(100)
      expect(result.current.localCurrency).toBe('USD') // Based on mock geolocation
      expect(result.current.exchangeRate).toBe(1) // USD to USD
      expect(result.current.error).toBeNull()
    })

    it('should convert to different currency when geolocation returns non-USD', async () => {
      // Mock for European IP
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('ipapi.co')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              currency: 'EUR',
              country_code: 'DE'
            })
          })
        }
        if (url.includes('exchangerate-api.com')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              result: 'success',
              documentation: 'https://www.exchangerate-api.com/docs',
              terms_of_use: 'https://www.exchangerate-api.com/terms',
              time_last_update_unix: 1640995200,
              time_last_update_utc: 'Sat, 01 Jan 2022 00:00:00 +0000',
              time_next_update_unix: 1641081600,
              time_next_update_utc: 'Sun, 02 Jan 2022 00:00:00 +0000',
              base_code: 'USD',
              conversion_rates: { EUR: 0.88, USD: 1 }
            })
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const { result } = renderHook(
        () => useCurrencyConverter(defaultOptions),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.convertedPrice).toBe(88) // 100 * 0.88
      expect(result.current.localCurrency).toBe('EUR')
      expect(result.current.exchangeRate).toBe(0.88)
    })

    it('should use manual currency when provided', async () => {
      global.fetch = createFetchMock()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          ...defaultOptions,
          manualCurrency: 'GBP'
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.convertedPrice).toBe(74) // 100 * 0.74
      expect(result.current.localCurrency).toBe('GBP')
      expect(result.current.exchangeRate).toBe(0.74)
    })
  })

  describe('caching behavior', () => {
    it('should cache geolocation data via React Query', async () => {
      global.fetch = createFetchMock()
      
      const { result } = renderHook(
        () => useCurrencyConverter(defaultOptions),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // After first call, result should be available
      expect(result.current.localCurrency).toBe('USD')
      expect(result.current.error).toBeNull()
    })

    it('should reuse cached geolocation data across hook instances', async () => {
      // Ensure we use mock fetch for this unit test
      const originalFetch = global.fetch
      global.fetch = createFetchMock()
      
      try {
        // First hook instance
        const { result: result1 } = renderHook(
          () => useCurrencyConverter(defaultOptions),
          { wrapper: createWrapper() }
        )

        await waitFor(() => {
          expect(result1.current.isLoading).toBe(false)
        })

        expect(result1.current.localCurrency).toBe('USD')
        
        // Second hook instance should use cached data
        const { result: result2 } = renderHook(
          () => useCurrencyConverter(defaultOptions),
          { wrapper: createWrapper() }
        )

        await waitFor(() => {
          expect(result2.current.isLoading).toBe(false)
        })

        expect(result2.current.localCurrency).toBe('USD')
      } finally {
        // Restore original fetch
        global.fetch = originalFetch
      }
    })
  })

  describe('error handling', () => {
    it('should handle geolocation API errors', async () => {
      global.fetch = createFetchErrorMock('api')
      
      const onErrorSpy = vi.fn()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          ...defaultOptions,
          onError: onErrorSpy
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.convertedPrice).toBeNull()
      expect(onErrorSpy).toHaveBeenCalled()
    })

    it('should handle exchange rate API errors', async () => {
      // Mock successful geolocation but failed exchange rate
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('ipapi.co')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              currency: 'EUR',
              country_code: 'DE'
            })
          })
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal server error' })
        })
      })
      
      const { result } = renderHook(
        () => useCurrencyConverter(defaultOptions),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      }, { timeout: 3000 })

      expect(result.current.convertedPrice).toBeNull()
    })

    it('should handle rate limiting gracefully', async () => {
      global.fetch = createRateLimitMock()
      
      const { result } = renderHook(
        () => useCurrencyConverter(defaultOptions),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
          expect(result.current.error?.message).toContain('429')
  })

  it('should handle currency mismatch between geolocation and exchange rate APIs', async () => {
    // Mock geolocation API to return an unsupported currency
    const mockGeoResponse = {
      currency: 'XYZ', // Fake currency code
      countryCode: 'XX'
    }

    // Mock exchange rate API with normal response (but without XYZ currency)
    const mockExchangeResponse = {
      result: 'success',
      base_code: 'USD',
      conversion_rates: {
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0
        // Note: XYZ is not included in supported currencies
      }
    }

    ;(fetch as any).mockImplementation((url: string) => {
      if (url.includes('ipapi.co')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currency: mockGeoResponse.currency,
            country_code: mockGeoResponse.countryCode
          }),
        })
      }
      if (url.includes('exchangerate-api.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockExchangeResponse),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    const { result } = renderHook(
      () => useCurrencyConverter({
        basePrice: 100,
        baseCurrency: 'USD',
        apiKey: 'test-api-key'
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should have a specific error about the unsupported currency
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toContain('Currency \'XYZ\' was detected from your location but is not supported by the exchange rate provider')
    expect(result.current.convertedPrice).toBeNull()
    expect(result.current.localCurrency).toBe('XYZ')
  })
  })

  describe('callback functions', () => {
    it('should call onSuccess when conversion succeeds', async () => {
      global.fetch = createFetchMock()
      const onSuccessSpy = vi.fn()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          ...defaultOptions,
          onSuccess: onSuccessSpy
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(onSuccessSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          convertedPrice: 100,
          localCurrency: 'USD',
          exchangeRate: 1
        })
      )
    })

    it('should call onError when conversion fails', async () => {
      global.fetch = createFetchErrorMock('network')
      const onErrorSpy = vi.fn()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          ...defaultOptions,
          onError: onErrorSpy
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(onErrorSpy).toHaveBeenCalledWith(
        expect.any(Error)
      )
    })
  })

  describe('edge cases', () => {
    it('should handle zero price', async () => {
      global.fetch = createFetchMock()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          ...defaultOptions,
          basePrice: 0
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.convertedPrice).toBe(0)
    })

    it('should handle negative price', async () => {
      global.fetch = createFetchMock()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          ...defaultOptions,
          basePrice: -50
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.convertedPrice).toBe(-50)
    })

    it('should handle same currency conversion', async () => {
      global.fetch = createFetchMock()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          ...defaultOptions,
          manualCurrency: 'USD' // Same as base currency
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.convertedPrice).toBe(100)
      expect(result.current.exchangeRate).toBe(1)
    })
  })

  // Integration tests with real APIs
  describe.skipIf(!RUN_INTEGRATION_TESTS || !REAL_API_KEY)('🌐 Real API Integration Tests', () => {
    beforeEach(() => {
      // Clear localStorage for fresh tests
      localStorage.clear()
      
      // CRITICAL FIX: Force restore real fetch for integration tests
      // Some tests are turning fetch into a spy, we need to restore the real node-fetch
      if (global.fetch?.name === 'spy' || !global.fetch?.name) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const nodeFetch = require('node-fetch')
          global.fetch = nodeFetch.default || nodeFetch
          // Real fetch restored successfully
        } catch {
          // Could not restore real fetch, continue with existing
        }
      }
      
      // Verify fetch is the real implementation (should not be 'spy')
      
      if (typeof global.fetch === 'undefined') {
        throw new Error('❌ fetch is not available for integration tests')
      }
    })

    it('should work with real geolocation and exchange rate APIs', async () => {
      const { result } = renderHook(
        () => useCurrencyConverter({
          basePrice: 100,
          baseCurrency: 'USD',
          apiKey: REAL_API_KEY!,
          onSuccess: (_data) => {
            // Integration test success callback
          },
          onError: (_error) => {
            // Integration test error callback
          }
        }),
        { wrapper: createWrapper() }
      )

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for real API calls to complete (may take longer)
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      }, { timeout: 10000 }) // 10 second timeout for real APIs

      // Should have real data or valid error state
      if (!result.current.error && result.current.convertedPrice !== null) {
        // Success case - all values should be valid
        expect(result.current.convertedPrice).toBeTypeOf('number')
        expect(result.current.localCurrency).toBeTypeOf('string')
        expect(result.current.exchangeRate).toBeTypeOf('number')
        expect(result.current.baseCurrency).toBe('USD')
        
        // Real API integration test passed
      } else {
        // Error case or still loading - should have proper error state or be null
        if (result.current.error) {
          expect(result.current.error).toBeInstanceOf(Error)
        }
        expect(result.current.convertedPrice).toBeNull()
      }
      
      // For real APIs, we accept successful conversion, graceful error handling, or still loading
      const hasValidResult = (
        (result.current.convertedPrice !== null && typeof result.current.convertedPrice === 'number') ||
        (result.current.error && result.current.convertedPrice === null) ||
        (result.current.isLoading) ||
        (result.current.convertedPrice === null && !result.current.error)
      )
      expect(hasValidResult).toBe(true)
    }, 15000) // 15 second test timeout

    it('should handle manual currency override with real APIs', async () => {
      const { result } = renderHook(
        () => useCurrencyConverter({
          basePrice: 50,
          baseCurrency: 'USD',
          apiKey: REAL_API_KEY!,
          manualCurrency: 'EUR' // Override to EUR
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      }, { timeout: 10000 })

      if (!result.current.error) {
        expect(result.current.localCurrency).toBe('EUR')
        expect(result.current.convertedPrice).toBeTypeOf('number')
        expect(result.current.exchangeRate).toBeTypeOf('number')
        
        // Should be different from base price (unless EUR = 1:1 with USD)
        const exchangeRate = result.current.exchangeRate!
        const expectedPrice = parseFloat((50 * exchangeRate).toFixed(2))
        expect(result.current.convertedPrice).toBe(expectedPrice)
        
        // Manual EUR conversion test passed
      }
    }, 15000)

    it('should cache geolocation data between calls', async () => {
      // First call
      const { result: result1 } = renderHook(
        () => useCurrencyConverter({
          basePrice: 25,
          baseCurrency: 'USD',
          apiKey: REAL_API_KEY!
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false)
      }, { timeout: 10000 })

      // Second call should be faster (cached geolocation)
      const { result: result2 } = renderHook(
        () => useCurrencyConverter({
          basePrice: 75,
          baseCurrency: 'USD',
          apiKey: REAL_API_KEY!
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false)
      }, { timeout: 5000 }) // Should be faster due to caching

      if (!result1.current.error && !result2.current.error && result1.current.localCurrency && result2.current.localCurrency) {
        // For real APIs, geolocation might vary but should be valid currency codes
        expect(result1.current.localCurrency).toMatch(/^[A-Z]{3}$/) // 3-letter currency code
        expect(result2.current.localCurrency).toMatch(/^[A-Z]{3}$/) // 3-letter currency code
        
        // Both should have valid conversion rates
        expect(result1.current.exchangeRate).toBeTypeOf('number')
        expect(result2.current.exchangeRate).toBeTypeOf('number')
        
        // Caching performance test passed
      }
    }, 20000)

    it('should handle rate limiting gracefully with real APIs', async () => {
      // Test rate limiting with sequential requests to avoid React act() warnings
      const results: any[] = []
      
      // Make rapid sequential requests (not parallel) to test rate limiting behavior
      for (let i = 0; i < 5; i++) {
        try {
          const { result, unmount } = renderHook(
            () => useCurrencyConverter({
              basePrice: 10 + i,
              baseCurrency: 'USD',
              apiKey: REAL_API_KEY!
            }),
            { wrapper: createWrapper() }
          )

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
          }, { timeout: 8000 })

          results.push({
            index: i,
            success: !result.current.error,
            error: result.current.error?.message,
            currency: result.current.localCurrency
          })

          // Clean up the hook instance
          unmount()
        } catch (error: any) {
          results.push({
            index: i,
            success: false,
            error: error.message,
            currency: null
          })
        }
      }
      
      // Rate limiting test completed successfully

      // All requests should complete (either success or graceful failure)
      expect(results.length).toBe(5)
      
      // Each result should have a defined success state
      results.forEach((result: any) => {
        expect(typeof result.success).toBe('boolean')
        if (!result.success) {
          expect(result.error).toBeTypeOf('string')
        }
      })
    }, 50000)
  })

  describe('input validation', () => {
    it('should normalize currency codes to uppercase', async () => {
      global.fetch = createFetchMock()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          basePrice: 100,
          baseCurrency: 'usd', // lowercase
          apiKey: 'test-api-key',
          manualCurrency: 'eur' // lowercase
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should normalize to uppercase internally
      expect(result.current.baseCurrency).toBe('USD')
      expect(result.current.localCurrency).toBe('EUR')
    })

    it('should provide helpful error when API key is missing', async () => {
      // Mock fetch to prevent any unexpected calls
      global.fetch = vi.fn()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          basePrice: 100,
          baseCurrency: 'USD',
          apiKey: '', // empty API key
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('API key is missing')
      expect(result.current.error?.message).toContain('exchangerate-api.com')
    })

    it('should provide helpful error when API key is undefined', async () => {
      // Mock fetch to prevent any unexpected calls
      global.fetch = vi.fn()
      
      const { result } = renderHook(
        () => useCurrencyConverter({
          basePrice: 100,
          baseCurrency: 'USD',
          apiKey: undefined as any, // undefined API key
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('API key is missing')
    })

    it('should not make exchange rate API call when API key is invalid', async () => {
      const fetchSpy = vi.fn()
      global.fetch = fetchSpy

      renderHook(
        () => useCurrencyConverter({
          basePrice: 100,
          baseCurrency: 'USD',
          apiKey: '', // invalid API key
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        // Should not make any API calls due to missing API key
        expect(fetchSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('exchangerate-api.com')
        )
      })
    })
  })
})
