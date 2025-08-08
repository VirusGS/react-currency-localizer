/**
 * Basic Usage Example
 * 
 * This example demonstrates the most basic usage of the React Currency Localizer
 * with automatic currency detection and conversion.
 */

import React from 'react'
import { CurrencyConverterProvider, useCurrencyConverter } from '@iamjr15/react-currency-localizer'

// Simple price display component
function ProductPrice({ price }: { price: number }) {
  const { 
    convertedPrice, 
    localCurrency, 
    isLoading, 
    error 
  } = useCurrencyConverter({
    basePrice: price,
    baseCurrency: 'usd', // Case-insensitive! Will be converted to 'USD'
    apiKey: 'your-exchangerate-api-key' // Get from exchangerate-api.com
  })

  if (isLoading) return <span>Loading...</span>
  if (error) return <span>${price}</span> // Fallback to original price

  return (
    <span>
      {new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: localCurrency || 'USD'
      }).format(convertedPrice || price)}
    </span>
  )
}

// Product card component
function ProductCard() {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '16px', 
      margin: '8px',
      maxWidth: '300px'
    }}>
      <h3>Premium Subscription</h3>
      <p>Access to all premium features</p>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
        <ProductPrice price={29.99} />
        <span style={{ fontSize: '14px', color: '#666' }}>/month</span>
      </div>
      <button style={{
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '12px'
      }}>
        Subscribe Now
      </button>
    </div>
  )
}

// Main app component
export default function BasicUsageExample() {
  return (
    <CurrencyConverterProvider>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Basic Currency Conversion Example</h1>
        <p>
          This example automatically detects your location and converts the price 
          to your local currency.
        </p>
        <ProductCard />
      </div>
    </CurrencyConverterProvider>
  )
}
