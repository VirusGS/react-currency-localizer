import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Check if integration tests should run with real APIs
const RUN_INTEGRATION_TESTS = process.env.VITE_RUN_INTEGRATION_TESTS === 'true'

// Mock window.localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Set up fetch - use real fetch for integration tests, mock for unit tests
if (RUN_INTEGRATION_TESTS) {
  // For integration tests, we need real fetch - load synchronously to avoid race conditions
  try {
    // Try to load node-fetch synchronously using require
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeFetch = require('node-fetch')
    global.fetch = nodeFetch.default || nodeFetch
    // Real fetch loaded for integration tests
  } catch {
    // Fallback to mock if node-fetch is not available
    global.fetch = vi.fn()
  }
} else {
  // Use mock fetch for unit tests
  global.fetch = vi.fn()
}

// Clean up after each test
afterEach(() => {
  if (!RUN_INTEGRATION_TESTS) {
    vi.clearAllMocks()
  }
  localStorageMock.clear()
})
