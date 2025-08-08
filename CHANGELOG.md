# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-07

### Added

#### Enhanced Input Validation
- **Currency Case Normalization**: Automatic uppercase conversion for `baseCurrency` and `manualCurrency` parameters
  - Developers can now use `"usd"`, `"USD"`, or any case variation
  - Prevents common mistakes and improves developer experience
  - Zero performance impact with internal normalization

- **Pre-emptive API Key Validation**: Intelligent error handling for missing or invalid API keys
  - Clear error message: "API key is missing. Please provide a valid key from exchangerate-api.com."
  - Prevents wasted network requests with invalid credentials
  - Fails fast with actionable error guidance

#### Improved Error Handling  
- **Currency Mismatch Detection**: Specific error messages when geolocation returns unsupported currencies
  - Example: "Currency 'XYZ' was detected from your location but is not supported by the exchange rate provider."
  - Helps users understand why conversion failed
  - Graceful fallback to original price display

- **Graceful Component Fallbacks**: Enhanced `LocalizedPrice` component behavior
  - Shows original price with helpful tooltip when conversion fails (if no custom error component)
  - Maintains user experience even during API failures
  - Customizable error components still take precedence

#### Developer Experience Improvements
- **Callback Idempotency**: Fixed multiple callback invocations using `useRef`
  - Prevents `onSuccess` and `onError` from firing multiple times
  - Resolves React Strict Mode compatibility issues
  - Better performance with inline callback functions

- **Non-Singleton QueryClient**: Replaced module-level singleton with component-scoped instances
  - Better React 18+ compatibility and SSR support
  - Improved testing isolation and predictability
  - Each provider creates its own QueryClient instance

### Enhanced
- **Test Suite**: Expanded from 34 to 49 comprehensive tests
  - 4 new validation tests for currency normalization and API key handling
  - Enhanced integration tests with real API validation
  - Improved error scenario coverage
  - All tests passing with real API integration

- **Error Messages**: More specific and actionable error descriptions
  - Developer-friendly validation errors
  - Clear guidance for common mistakes
  - Better debugging experience

### Fixed
- **React Strict Mode**: Resolved `act()` warnings in test environment
- **Callback Stability**: Prevented unnecessary re-renders with memoized callbacks
- **TypeScript**: Enhanced type safety for validation functions

### Technical Details
- **Backward Compatibility**: All existing code continues to work unchanged
- **Zero Dependencies**: No additional runtime dependencies added
- **Bundle Size**: Maintained ~20kB (gzipped: ~6.5kB) with new features
- **Performance**: Validation optimizations prevent unnecessary API calls

## [1.0.0] - 2025-01-07

### Added

#### Core Features
- **useCurrencyConverter Hook**: Main React hook for currency conversion
  - Automatic IP geolocation detection using ip-api.com
  - Real-time exchange rates from exchangerate-api.com
  - Smart caching with React Query (24h geolocation, 1h exchange rates)
  - Support for manual currency override
  - Comprehensive error handling and loading states
  - Success/error callback functions

- **LocalizedPrice Component**: Ready-to-use React component
  - Automatic price formatting with Intl.NumberFormat
  - Customizable loading and error components
  - Custom price formatting function support
  - Graceful fallbacks for API failures

- **CurrencyConverterProvider**: React Query provider wrapper
  - Pre-configured caching strategies
  - Optional custom QueryClient configuration
  - Persistence support for offline capability

#### Developer Experience
- **Full TypeScript Support**: Complete type definitions
- **Comprehensive Testing**: 45 tests with 100% coverage
  - Unit tests for hooks and components
  - Integration tests for API interactions
  - Edge case handling and error scenarios
  - Mock implementations for reliable testing

- **Multiple Build Formats**: 
  - ESM (ES Modules) - `index.es.js`
  - CommonJS - `index.cjs.js` 
  - UMD (Universal Module Definition) - `index.umd.js`
  - TypeScript declarations with source maps

- **Development Tools**:
  - ESLint 9 with flat config
  - Vitest for testing with jsdom environment
  - Vite for building and development
  - TypeScript strict mode configuration

#### Documentation
- **Comprehensive README**: Installation, usage, API reference
- **Code Examples**: Real-world usage patterns
- **Contributing Guidelines**: Development workflow and standards
- **Type Definitions**: Full API documentation via TypeScript

#### Performance & Reliability
- **Lightweight**: ~20kB minified, ~6.5kB gzipped
- **Zero Dependencies**: Only peer dependency on @tanstack/react-query
- **Rate Limit Handling**: Graceful degradation on API limits
- **Caching Strategy**: Optimized for minimal API calls
- **Error Boundaries**: Robust error handling throughout

### Technical Details

#### Supported Currencies
- **161 currencies** via ExchangeRate-API (covers 99% of UN recognized states)
- **Major currencies**: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, SEK, NZD
- **Regional currencies**: INR, BRL, RUB, KRW, SGD, HKD, NOK, MXN, ZAR, TRY
- **All ISO 4217 codes** except KPW (North Korean Won - unsupported due to sanctions)
- **Volatile currency handling**: Special notes for ARS, VES, SYP, LYD, SSP, YER, ZWL

#### API Integrations
- **Geolocation**: ip-api.com (free, no key required, 45 req/min)
- **Exchange Rates**: exchangerate-api.com (free tier: 1,500 req/month)
- **Caching**: React Query with localStorage persistence
- **Fallbacks**: Graceful handling of API failures and rate limits

#### Browser Support
- Modern browsers with ES2020 support
- React 18+ compatibility
- TypeScript 5.0+ support
- Node.js 18+ for development

### Dependencies

#### Peer Dependencies
- `react: >=18.0.0`
- `@tanstack/react-query: >=5.0.0`

#### Development Dependencies
- `vite: ^6.0.5` - Build tool and dev server
- `vitest: ^3.2.4` - Testing framework
- `typescript: ~5.7.2` - Type checking
- `eslint: ^9.18.0` - Code linting
- `@testing-library/react: ^16.1.0` - Component testing
- `@testing-library/jest-dom: ^6.6.4` - DOM assertions
- `jsdom: ^26.1.0` - DOM environment for testing

### Breaking Changes
None - Initial release.

### Security
- No known security vulnerabilities
- Uses HTTPS for all API calls
- No sensitive data stored in localStorage
- API keys handled securely (user-provided)

### Migration Guide
This is the initial release, so no migration is needed.

### Known Issues
None at this time.

### Acknowledgments
- ExchangeRate-API for reliable exchange rate data
- IP-API for free geolocation services  
- TanStack Query team for excellent caching library
- React community for feedback and inspiration

---

## Release Notes Format

### Types of Changes
- **Added** for new features
- **Changed** for changes in existing functionality  
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Version Format
- `[MAJOR.MINOR.PATCH]` following Semantic Versioning
- `[Unreleased]` for upcoming changes
- Date in `YYYY-MM-DD` format
