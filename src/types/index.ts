/**
 * Configuration options for the useCurrencyConverter hook
 */
export interface UseCurrencyConverterOptions {
  /** The numerical price in the base currency to be converted */
  basePrice: number
  /** The three-letter ISO 4217 code of the base price's currency (e.g., 'USD') */
  baseCurrency: string
  /** The API key obtained from exchangerate-api.com for fetching rates */
  apiKey: string
  /** A three-letter ISO 4217 code to manually specify the target currency, bypassing IP geolocation */
  manualCurrency?: string
  /** An optional callback function that fires upon a successful conversion */
  onSuccess?: (data: CurrencyResult) => void
  /** An optional callback function that fires upon failure */
  onError?: (error: Error) => void
}

/**
 * Result object returned by the useCurrencyConverter hook
 */
export interface CurrencyResult {
  /** The final calculated price in the local currency. null during loading or on error */
  convertedPrice: number | null
  /** The detected or manually set local currency code. null during loading or on error */
  localCurrency: string | null
  /** The base currency code that was provided as input */
  baseCurrency: string
  /** The fetched exchange rate between the base and local currencies. null during loading or on error */
  exchangeRate: number | null
  /** A boolean flag that is true while either the geolocation or exchange rate data is being fetched */
  isLoading: boolean
  /** An Error object containing details of the failure, if one occurred. null otherwise */
  error: Error | null
}

/**
 * Response structure from the ip-api.com geolocation service
 */
export interface GeolocationResponse {
  status: 'success' | 'fail'
  currency: string
  message?: string
  countryCode?: string
}

/**
 * Response structure from the exchangerate-api.com service
 */
export interface ExchangeRateResponse {
  result: 'success' | 'error'
  base_code: string
  conversion_rates: Record<string, number>
  error_type?: string
  'error-message'?: string
}

/**
 * Props for the LocalizedPrice component
 */
export interface LocalizedPriceProps {
  /** The numerical price in the base currency to be converted */
  basePrice: number
  /** The three-letter ISO 4217 code of the base price's currency */
  baseCurrency: string
  /** The API key for exchangerate-api.com */
  apiKey: string
  /** Optional override for the target currency */
  manualCurrency?: string
  /** Optional component to show while loading */
  loadingComponent?: React.ReactNode
  /** Optional component to show on error */
  errorComponent?: (error: Error) => React.ReactNode
  /** Optional custom formatter for the price */
  formatPrice?: (price: number, currency: string) => string
}

/**
 * Props for the CurrencyConverterProvider component
 */
export interface CurrencyConverterProviderProps {
  children: React.ReactNode
  /** Optional custom QueryClient instance */
  queryClient?: import('@tanstack/react-query').QueryClient
}
