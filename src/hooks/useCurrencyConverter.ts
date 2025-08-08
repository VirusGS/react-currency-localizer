import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useMemo, useRef } from 'react'
import type {
  UseCurrencyConverterOptions,
  CurrencyResult,
  GeolocationResponse,
  ExchangeRateResponse,
} from '../types'

/**
 * Custom React hook for converting prices to user's local currency
 * 
 * Features:
 * - Automatic IP-based geolocation detection
 * - Manual currency override option
 * - Intelligent caching (24h for geolocation, 1h for exchange rates)
 * - Loading and error state management
 * - Success/error callbacks
 * 
 * @param options Configuration options for the currency converter
 * @returns Object containing conversion results and state
 */
export const useCurrencyConverter = ({
  basePrice,
  baseCurrency,
  apiKey,
  manualCurrency,
  onSuccess,
  onError,
}: UseCurrencyConverterOptions): CurrencyResult => {
  // Normalize currency codes to uppercase to prevent case-sensitivity issues
  const upperBaseCurrency = baseCurrency.toUpperCase()
  const upperManualCurrency = manualCurrency?.toUpperCase()

  // Local state to track the determined currency
  const [localCurrency, setLocalCurrency] = useState<string | null>(
    upperManualCurrency || null
  )

  // Pre-emptive API key validation to provide helpful error messages
  const apiKeyError = useMemo(() => {
    if (!apiKey || apiKey.trim() === '') {
      return new Error('API key is missing. Please provide a valid key from exchangerate-api.com.')
    }
    return null
  }, [apiKey])

  // Create refs to hold the latest callbacks to prevent unnecessary re-renders
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  // Update the refs on every render to always have the latest callbacks
  useEffect(() => {
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  })

  // 1. Geolocation Query - Persistent cache for 24 hours
  const {
    data: geoData,
    error: geoError,
    isLoading: isGeoLoading,
  } = useQuery<GeolocationResponse, Error>({
    queryKey: ['geolocation'],
    queryFn: async (): Promise<GeolocationResponse> => {
      const response = await fetch(
        'http://ip-api.com/json/?fields=status,currency,countryCode,message'
      )
      
      if (!response.ok) {
        throw new Error(`Geolocation API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'fail') {
        throw new Error(data.message || 'Geolocation detection failed')
      }
      
      return data
    },
    // Only run this query if manual currency is NOT provided AND API key is valid
    enabled: !upperManualCurrency && !apiKeyError,
    // Data is considered fresh for 24 hours (geolocation doesn't change frequently)
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    // Keep data in cache indefinitely (will be cleared by browser storage limits)
    gcTime: Infinity,
    // Don't retry on failure to avoid spamming the API
    retry: false,
    // Don't refetch on mount if data exists
    refetchOnMount: false,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
  })

  // 2. Exchange Rate Query - Dependent on localCurrency being available
  const {
    data: exchangeData,
    error: exchangeError,
    isLoading: isExchangeLoading,
  } = useQuery<ExchangeRateResponse, Error>({
    queryKey: ['exchange-rates', upperBaseCurrency, localCurrency],
    queryFn: async (): Promise<ExchangeRateResponse> => {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${upperBaseCurrency}`
      )
      
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.result === 'error') {
        throw new Error(
          data['error-message'] || `Exchange rate fetch failed: ${data.error_type}`
        )
      }
      
      return data
    },
    // This query will only run if localCurrency is determined and API key is valid
    enabled: !!localCurrency && !apiKeyError,
    // Exchange rates are considered fresh for 1 hour
    staleTime: 1000 * 60 * 60, // 1 hour
    // Cache for 2 hours
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    // Retry once on failure
    retry: 1,
    // Don't refetch on window focus to preserve API quota
    refetchOnWindowFocus: false,
  })

  // Effect to update localCurrency once geolocation data arrives
  useEffect(() => {
    if (upperManualCurrency) {
      setLocalCurrency(upperManualCurrency)
    } else if (geoData?.currency) {
      setLocalCurrency(geoData.currency)
    }
  }, [upperManualCurrency, geoData?.currency])

  // Calculate the final values
  const exchangeRate = localCurrency && exchangeData?.conversion_rates
    ? exchangeData.conversion_rates[localCurrency]
    : null

  // Check for currency mismatch - when geolocation returns a currency not supported by exchange API
  const currencyMismatchError = useMemo(() => {
    if (localCurrency && exchangeData && exchangeData.conversion_rates && !(localCurrency in exchangeData.conversion_rates)) {
      return new Error(`Currency '${localCurrency}' was detected from your location but is not supported by the exchange rate provider.`)
    }
    return null
  }, [localCurrency, exchangeData])

  // Consolidate loading and error states
  const isLoading = isGeoLoading || (isExchangeLoading && !!localCurrency)
  const error = geoError || exchangeError || currencyMismatchError || apiKeyError

  const convertedPrice = (typeof basePrice === 'number') && exchangeRate !== null && !currencyMismatchError
    ? parseFloat((basePrice * exchangeRate).toFixed(2))
    : null

  // Prepare the return object - memoized to prevent unnecessary re-renders
  const result: CurrencyResult = useMemo(() => ({
    convertedPrice,
    localCurrency,
    baseCurrency: upperBaseCurrency,
    exchangeRate: exchangeRate || null,
    isLoading,
    error: error || null,
  }), [convertedPrice, localCurrency, upperBaseCurrency, exchangeRate, isLoading, error])

  // Handle success and error callbacks using refs to prevent multiple invocations
  useEffect(() => {
    if (!isLoading && !error && convertedPrice !== null && onSuccessRef.current) {
      onSuccessRef.current(result)
    }
  }, [isLoading, error, convertedPrice, result])

  useEffect(() => {
    if (!isLoading && error && onErrorRef.current) {
      onErrorRef.current(error)
    }
  }, [isLoading, error])

  return result
}
