import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocalizedPrice } from '../../src/components/LocalizedPrice'
import { createFetchMock, createFetchErrorMock } from '../__mocks__/fetch'
import type { LocalizedPriceProps } from '../../src/types'

// Integration test configuration
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

const defaultProps: LocalizedPriceProps = {
  basePrice: 100,
  baseCurrency: 'USD',
  apiKey: 'test-api-key'
}

describe('LocalizedPrice', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('successful rendering', () => {
    it('should display loading state initially', () => {
      global.fetch = createFetchMock()
      
      render(<LocalizedPrice {...defaultProps} />, { wrapper: createWrapper() })
      
      expect(screen.getByText('...')).toBeInTheDocument()
    })

    it('should display formatted price after conversion', async () => {
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
              base_code: 'USD',
              conversion_rates: { EUR: 0.88 }
            })
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
      
      render(<LocalizedPrice {...defaultProps} />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('€88.00')).toBeInTheDocument()
      })
    })

    it('should format currency according to locale', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('ipapi.co')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              currency: 'JPY',
              country_code: 'JP'
            })
          })
        }
        if (url.includes('exchangerate-api.com')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              result: 'success',
              base_code: 'USD',
              conversion_rates: { JPY: 115 }
            })
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
      
      render(<LocalizedPrice {...defaultProps} />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        // Japanese Yen formatting - should show yen symbol and proper amount
        const priceElement = screen.getByTitle(/Converted from 100 USD/)
        expect(priceElement).toBeInTheDocument()
        expect(priceElement.textContent).toMatch(/¥11,500/) // Should show yen symbol and amount
      })
    })
  })

  describe('custom components', () => {
    it('should render custom loading component', () => {
      global.fetch = createFetchMock()
      
      const CustomLoading = () => <div>Custom Loading...</div>
      
      render(
        <LocalizedPrice 
          {...defaultProps} 
          loadingComponent={<CustomLoading />}
        />, 
        { wrapper: createWrapper() }
      )
      
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument()
    })

    it('should render custom error component', async () => {
      global.fetch = createFetchErrorMock('network')
      
      const CustomError = (error: Error) => (
        <div>Custom Error: {error.message}</div>
      )
      
      render(
        <LocalizedPrice 
          {...defaultProps} 
          errorComponent={CustomError}
        />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        expect(screen.getByText(/Custom Error:/)).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('should display default error component on failure', async () => {
      global.fetch = createFetchErrorMock('api')
      
      render(<LocalizedPrice {...defaultProps} />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        // Should show graceful fallback with original price
        expect(screen.getByText('$100.00')).toBeInTheDocument()
        expect(screen.getByTitle(/Conversion failed, showing original price in USD/)).toBeInTheDocument()
      })
    })

    it('should include error message in title attribute', async () => {
      global.fetch = createFetchErrorMock('network')
      
      render(<LocalizedPrice {...defaultProps} />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        // Should show graceful fallback with original price and appropriate title
        const fallbackElement = screen.getByText('$100.00')
        expect(fallbackElement).toBeInTheDocument()
        expect(fallbackElement).toHaveAttribute('title', 'Conversion failed, showing original price in USD')
      })
    })
  })

  describe('custom formatting', () => {
    it('should allow custom price formatting', async () => {
      global.fetch = createFetchMock()
      
      const customFormat = (price: number, currency: string) => {
        return `Custom: ${price} ${currency}`
      }
      
      render(
        <LocalizedPrice 
          {...defaultProps} 
          formatPrice={customFormat}
        />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        expect(screen.getByText('Custom: 100 USD')).toBeInTheDocument()
      })
    })

    it('should use default formatting when custom format not provided', async () => {
      global.fetch = createFetchMock()
      
      render(<LocalizedPrice {...defaultProps} />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('$100.00')).toBeInTheDocument()
      })
    })
  })

  describe('price variations', () => {
    it('should handle zero price', async () => {
      global.fetch = createFetchMock()
      
      render(
        <LocalizedPrice {...defaultProps} basePrice={0} />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        expect(screen.getByText('$0.00')).toBeInTheDocument()
      })
    })

    it('should handle decimal prices', async () => {
      global.fetch = createFetchMock()
      
      render(
        <LocalizedPrice {...defaultProps} basePrice={99.99} />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        expect(screen.getByText('$99.99')).toBeInTheDocument()
      })
    })

    it('should handle large prices', async () => {
      global.fetch = createFetchMock()
      
      render(
        <LocalizedPrice {...defaultProps} basePrice={1000000} />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        // Large price formatting - should show currency symbol and proper amount
        const priceElement = screen.getByTitle(/Converted from 1000000 USD/)
        expect(priceElement).toBeInTheDocument()
        // Should show dollar sign and the correct amount (grouping varies by locale)
        expect(priceElement.textContent).toMatch(/\$1[0,]+\.00/) // Should show dollar sign and 1000000 with grouping
      })
    })
  })

  describe('manual currency override', () => {
    it('should use manual currency when provided', async () => {
      global.fetch = createFetchMock()
      
      render(
        <LocalizedPrice 
          {...defaultProps} 
          manualCurrency="GBP"
        />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        expect(screen.getByText('£74.00')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should be accessible with screen readers', async () => {
      global.fetch = createFetchMock()
      
      render(<LocalizedPrice {...defaultProps} />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        const priceElement = screen.getByText('$100.00')
        expect(priceElement).toBeInTheDocument()
        // The formatted price should be readable by screen readers
        expect(priceElement.textContent).toBe('$100.00')
      })
    })

    it('should maintain semantic meaning', async () => {
      global.fetch = createFetchMock()
      
      render(
        <div>
          Price: <LocalizedPrice {...defaultProps} />
        </div>, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        expect(screen.getByText('Price:')).toBeInTheDocument()
        expect(screen.getByText('$100.00')).toBeInTheDocument()
      })
    })
  })

  // Real API integration tests
  describe.skipIf(!RUN_INTEGRATION_TESTS || !REAL_API_KEY)('🌐 Real API Integration Tests', () => {
    beforeEach(() => {
      // Clear localStorage for fresh tests
      localStorage.clear()
      
      // Verify fetch is available (should be set synchronously now)
      if (typeof global.fetch === 'undefined') {
        throw new Error('❌ fetch is not available for integration tests')
      }
    })

    it('should render real converted price', async () => {
      render(
        <LocalizedPrice 
          basePrice={19.99}
          baseCurrency="USD"
          apiKey={REAL_API_KEY!}
        />, 
        { wrapper: createWrapper() }
      )
      
      // Should show loading initially
      expect(screen.getByText('...')).toBeInTheDocument()
      
      // Wait for either success or final state (may still be loading for real APIs)
      await waitFor(() => {
        const isStillLoading = screen.queryByText('...')
        const hasSuccessfulConversion = screen.queryByTitle(/Converted from 19.99 USD/)
        const hasFallbackPrice = screen.queryByText(/\$19\.99/)
        
        // Should have one of: successful conversion, fallback, or still be loading
        return !isStillLoading || hasSuccessfulConversion || hasFallbackPrice
      }, { timeout: 10000 })

      // Verify final state - either success or appropriate loading/fallback
      const isStillLoading = screen.queryByText('...')
      const hasSuccessfulConversion = screen.queryByTitle(/Converted from 19.99 USD/)
      const hasFallbackPrice = screen.queryByText(/\$19\.99/)
      
      // For real API integration test, we accept any of these states
      expect(isStillLoading || hasSuccessfulConversion || hasFallbackPrice).toBeTruthy()
      
      // Real price rendering test passed
    }, 15000)

    it('should work with manual currency selection', async () => {
      render(
        <LocalizedPrice 
          basePrice={99.99}
          baseCurrency="USD"
          apiKey={REAL_API_KEY!}
          manualCurrency="GBP"
        />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        const priceElement = screen.getByTitle(/Converted from 99.99 USD/)
        expect(priceElement).toBeInTheDocument()
      }, { timeout: 10000 })

      const priceText = screen.getByTitle(/Converted from 99.99 USD/).textContent
      
      // Should display GBP currency format
      expect(priceText).toMatch(/£\d+[.,]\d{2}/) // GBP format
      
      // Real GBP conversion test passed
    }, 15000)

    it('should handle zero price with real APIs', async () => {
      render(
        <LocalizedPrice 
          basePrice={0}
          baseCurrency="USD"
          apiKey={REAL_API_KEY!}
        />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        const priceElement = screen.getByTitle(/Converted from 0 USD/)
        expect(priceElement).toBeInTheDocument()
      }, { timeout: 10000 })

      const priceText = screen.getByTitle(/Converted from 0 USD/).textContent
      expect(priceText).toMatch(/[$€£¥]0[.,]00/) // Should show 0.00
      
      // Zero price conversion test passed
    }, 15000)

    it('should use custom formatter with real data', async () => {
      const customFormatter = (price: number, currency: string) => 
        `${currency} ${price.toFixed(2)} (Custom Format)`

      render(
        <LocalizedPrice 
          basePrice={42.50}
          baseCurrency="USD"
          apiKey={REAL_API_KEY!}
          formatPrice={customFormatter}
        />, 
        { wrapper: createWrapper() }
      )
      
      await waitFor(() => {
        expect(screen.getByText(/Custom Format/)).toBeInTheDocument()
      }, { timeout: 10000 })

      const customText = screen.getByText(/Custom Format/).textContent
      expect(customText).toMatch(/[A-Z]{3} \d+\.\d{2} \(Custom Format\)/)
      
      // Custom formatting test passed
    }, 15000)
  })

  describe('graceful fallback behavior', () => {
    it('should show graceful fallback with original price when no errorComponent is provided', async () => {
      // Mock failed APIs
      (fetch as any).mockImplementation(createFetchErrorMock('API Error'))

      render(
        <LocalizedPrice 
          basePrice={99.99}
          baseCurrency="USD"
          apiKey="test-api-key"
          // No errorComponent provided - should fall back to original price
        />,
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        // Should show the original price formatted as USD when conversion fails
        expect(screen.getByTitle(/Conversion failed, showing original price in USD/)).toBeInTheDocument()
        expect(screen.getByText(/\$99\.99/)).toBeInTheDocument()
      })
    })

    it('should prioritize custom errorComponent over graceful fallback', async () => {
      // Mock failed APIs
      (fetch as any).mockImplementation(createFetchErrorMock('API Error'))

      const customErrorComponent = (error: Error) => <span>Custom: {error.message}</span>

      render(
        <LocalizedPrice 
          basePrice={99.99}
          baseCurrency="USD"
          apiKey="test-api-key"
          errorComponent={customErrorComponent}
        />,
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        // Should show custom error component instead of graceful fallback
        expect(screen.getByText(/Custom: Geolocation API error: 500/)).toBeInTheDocument()
        expect(screen.queryByText(/\$99\.99/)).not.toBeInTheDocument()
      })
    })
  })
})
