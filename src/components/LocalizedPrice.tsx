import React from 'react'
import { useCurrencyConverter } from '../hooks/useCurrencyConverter'
import type { LocalizedPriceProps } from '../types'

/**
 * A React component that automatically displays a price in the user's local currency.
 * 
 * This component wraps the useCurrencyConverter hook and provides a simple,
 * declarative API for displaying localized prices. It handles loading states,
 * error states, and automatic formatting using the Intl.NumberFormat API.
 * 
 * @param props Configuration props for the localized price display
 * @returns JSX element with the formatted price or appropriate loading/error state
 */
export const LocalizedPrice: React.FC<LocalizedPriceProps> = ({
  basePrice,
  baseCurrency,
  apiKey,
  manualCurrency,
  loadingComponent = <span>...</span>,
  errorComponent,
  formatPrice,
}) => {
  const { convertedPrice, localCurrency, isLoading, error } = useCurrencyConverter({
    basePrice,
    baseCurrency,
    apiKey,
    manualCurrency,
  })

  // Show loading state
  if (isLoading) {
    return <>{loadingComponent}</>
  }

  // Handle error states with graceful fallback
  if (error || (convertedPrice === null && !isLoading)) {
    // If no custom error component is provided, show the original price as fallback
    if (!errorComponent) {
      return (
        <span title={`Conversion failed, showing original price in ${baseCurrency}`}>
          {new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: baseCurrency,
          }).format(basePrice)}
        </span>
      )
    }
    // Otherwise, render the custom error component
    return <>{errorComponent(error || new Error('Conversion failed'))}</>
  }

  // Handle case where convertedPrice is still loading or null
  if (convertedPrice === null) {
    return <>{loadingComponent}</>
  }

  // Format the price using custom formatter or default Intl.NumberFormat
  const formattedPrice = formatPrice 
    ? formatPrice(convertedPrice, localCurrency || baseCurrency)
    : new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: localCurrency || baseCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedPrice)

  return <span title={`Converted from ${basePrice} ${baseCurrency}`}>{formattedPrice}</span>
}
