/**
 * E-commerce Store Example
 * 
 * This example demonstrates how to use React Currency Localizer in a realistic
 * e-commerce scenario with multiple products, error handling, and loading states.
 */

import React, { useState } from 'react'
import { 
  CurrencyConverterProvider, 
  LocalizedPrice, 
  useCurrencyConverter 
} from '@iamjr15/react-currency-localizer'

// Product interface
interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
}

// Sample products
const products: Product[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    image: '🎧',
    description: 'High-quality wireless headphones with noise cancellation'
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 249.99,
    image: '⌚',
    description: 'Feature-rich smartwatch with health monitoring'
  },
  {
    id: 3,
    name: 'Laptop Stand',
    price: 39.99,
    image: '💻',
    description: 'Ergonomic adjustable laptop stand for better posture'
  },
  {
    id: 4,
    name: 'Coffee Mug',
    price: 14.99,
    image: '☕',
    description: 'Insulated stainless steel coffee mug'
  }
]

// Currency selector component
function CurrencySelector() {
  const [manualCurrency, setManualCurrency] = useState<string>('')

  const currencies = [
    { code: '', name: 'Auto-detect' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' }
  ]

  return (
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor="currency-select" style={{ marginRight: '10px' }}>
        Display Currency:
      </label>
      <select 
        id="currency-select"
        value={manualCurrency} 
        onChange={(e) => setManualCurrency(e.target.value)}
        style={{
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}
      >
        {currencies.map(currency => (
          <option key={currency.code} value={currency.code}>
            {currency.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// Enhanced product card with custom loading and error states
function ProductCard({ product }: { product: Product }) {
  const customLoadingComponent = (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      color: '#666' 
    }}>
      <div style={{
        width: '16px',
        height: '16px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '8px'
      }} />
      Converting...
    </div>
  )

  const customErrorComponent = (_error: Error) => (
    <div style={{ color: '#dc3545' }}>
      <span>${product.price}</span>
      <div style={{ fontSize: '12px', marginTop: '4px' }}>
        Unable to convert currency
      </div>
    </div>
  )

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '20px',
      margin: '16px',
      maxWidth: '280px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    >
      <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>
        {product.image}
      </div>
      
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
        {product.name}
      </h3>
      
      <p style={{ 
        color: '#666', 
        fontSize: '14px', 
        margin: '0 0 16px 0',
        lineHeight: '1.4'
      }}>
        {product.description}
      </p>
      
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#007bff',
        marginBottom: '16px'
      }}>
        <LocalizedPrice
          basePrice={product.price}
          baseCurrency="usd" // Case-insensitive currency codes
          apiKey={process.env.REACT_APP_EXCHANGE_API_KEY || 'demo-key'}
          loadingComponent={customLoadingComponent}
          errorComponent={customErrorComponent}
        />
      </div>
      
      <button style={{
        width: '100%',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#0056b3'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#007bff'
      }}
      >
        Add to Cart
      </button>
    </div>
  )
}

// Shopping cart summary
function CartSummary() {
  const subtotal = 404.96 // Sum of all product prices
  
  const { convertedPrice, localCurrency, isLoading } = useCurrencyConverter({
    basePrice: subtotal,
    baseCurrency: 'USD',
    apiKey: process.env.REACT_APP_EXCHANGE_API_KEY || 'demo-key'
  })

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      minWidth: '200px'
    }}>
      <h4 style={{ margin: '0 0 12px 0' }}>Cart Summary</h4>
      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Items (4):</span>
          <span>
            {isLoading ? 'Loading...' : (
              new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: localCurrency || 'USD'
              }).format(convertedPrice || subtotal)
            )}
          </span>
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontWeight: 'bold',
        marginTop: '8px'
      }}>
        <span>Total:</span>
        <span>
          {isLoading ? 'Loading...' : (
            new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: localCurrency || 'USD'
            }).format(convertedPrice || subtotal)
          )}
        </span>
      </div>
    </div>
  )
}

// Main e-commerce app
export default function EcommerceStoreExample() {
  return (
    <CurrencyConverterProvider>
      <div style={{ 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>
            Global Electronics Store
          </h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Prices automatically converted to your local currency
          </p>
          <CurrencySelector />
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <CartSummary />
      </div>
    </CurrencyConverterProvider>
  )
}
