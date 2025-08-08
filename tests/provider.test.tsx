import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { CurrencyConverterProvider } from '../src/provider'
import { useCurrencyConverter } from '../src/hooks/useCurrencyConverter'
import { createFetchMock } from './__mocks__/fetch'

// Test component that uses the hook
const TestComponent = () => {
  const result = useCurrencyConverter({
    basePrice: 100,
    baseCurrency: 'USD',
    apiKey: 'test-key'
  })

  return (
    <div>
      <div data-testid="loading">{result.isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="price">{result.convertedPrice || 'no-price'}</div>
      <div data-testid="currency">{result.localCurrency || 'no-currency'}</div>
    </div>
  )
}

describe('CurrencyConverterProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    global.fetch = createFetchMock()
  })

  it('should provide QueryClient context to children', () => {
    render(
      <CurrencyConverterProvider>
        <TestComponent />
      </CurrencyConverterProvider>
    )

    // Component should render without throwing QueryClient context errors
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByTestId('price')).toBeInTheDocument()
    expect(screen.getByTestId('currency')).toBeInTheDocument()
  })

  it('should allow custom QueryClient configuration', () => {
    const customQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 10000,
          gcTime: 20000
        }
      }
    })

    render(
      <CurrencyConverterProvider queryClient={customQueryClient}>
        <TestComponent />
      </CurrencyConverterProvider>
    )

    // Should render successfully with custom configuration
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should enable persistence by default', () => {
    // The provider should set up persistence automatically
    render(
      <CurrencyConverterProvider>
        <TestComponent />
      </CurrencyConverterProvider>
    )

    // Verify provider renders and doesn't throw persistence errors
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should handle multiple children components', () => {
    render(
      <CurrencyConverterProvider>
        <TestComponent />
        <div data-testid="sibling">Sibling Component</div>
      </CurrencyConverterProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByTestId('sibling')).toBeInTheDocument()
  })

  it('should require QueryClient context', () => {
    // This tests that the hook correctly requires a QueryClient context
    // The hook should throw when no QueryClient provider is available
    expect(() => {
      render(<TestComponent />)
    }).toThrow('No QueryClient set, use QueryClientProvider to set one')
  })
})
