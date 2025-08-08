import { vi } from 'vitest'
import type { GeolocationResponse, ExchangeRateResponse } from '../../src/types'

// Mock fetch responses
export const mockGeolocationResponse: GeolocationResponse = {
  status: 'success',
  currency: 'USD',
  countryCode: 'US'
}

export const mockExchangeRateResponse: ExchangeRateResponse = {
  result: 'success',
  documentation: 'https://www.exchangerate-api.com/docs',
  terms_of_use: 'https://www.exchangerate-api.com/terms',
  time_last_update_unix: 1640995200,
  time_last_update_utc: 'Sat, 01 Jan 2022 00:00:00 +0000',
  time_next_update_unix: 1641081600,
  time_next_update_utc: 'Sun, 02 Jan 2022 00:00:00 +0000',
  base_code: 'USD',
  conversion_rates: {
    USD: 1,
    EUR: 0.88,
    GBP: 0.74,
    JPY: 115.0,
    CAD: 1.27,
    AUD: 1.38,
    CHF: 0.92,
    CNY: 6.36,
    SEK: 9.05,
    NZD: 1.48
  }
}

// Create fetch mock function
export const createFetchMock = () => {
  return vi.fn().mockImplementation((url: string) => {
    // Mock geolocation API
    if (url.includes('ipapi.co')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGeolocationResponse)
      })
    }
    
    // Mock exchange rate API
    if (url.includes('exchangerate-api.com')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockExchangeRateResponse)
      })
    }
    
    // Default failed response
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' })
    })
  })
}

// Helper to create error responses
export const createFetchErrorMock = (errorType: 'network' | 'api' | 'timeout') => {
  return vi.fn().mockImplementation((_url: string) => {
    if (errorType === 'network') {
      return Promise.reject(new Error('Network error'))
    }
    
    if (errorType === 'timeout') {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 100)
      })
    }
    
    // API error response
    return Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ 
        error: 'Internal server error',
        'error-type': 'quota-reached' 
      })
    })
  })
}

// Helper to create rate limit responses
export const createRateLimitMock = () => {
  return vi.fn().mockImplementation((_url: string) => {
    return Promise.resolve({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ 
        error: 'Rate limit exceeded',
        'error-type': 'quota-reached' 
      })
    })
  })
}
