# React Currency Localizer

[![npm version](https://badge.fury.io/js/@iamjr15%2Freact-currency-localizer.svg?icon=si%3Anpm)](https://badge.fury.io/js/@iamjr15%2Freact-currency-localizer)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A React hook for automatically displaying prices in a user's local currency using IP geolocation. Built with a robust **two-API architecture** using specialized services for maximum accuracy and reliability. Perfect for e-commerce sites, pricing pages, and international applications.

## 🚀 Features

### Core Architecture
- **Two-API Strategy**: Decoupled architecture using specialized services for maximum accuracy
  - **Geolocation**: `ipapi.co` for HTTPS-compatible currency detection (no API key required)
  - **Exchange Rates**: `exchangerate-api.com` for real-time conversion rates
- **Intelligent Caching**: Multi-tier caching strategy optimized for each data type
  - **Persistent Geolocation**: 24-hour localStorage caching (location rarely changes)
  - **In-Memory Exchange Rates**: 1-hour memory caching (balances freshness vs performance)
- **TanStack Query Integration**: Advanced state management with automatic deduplication and background updates

### Enhanced Developer Experience
- **Robust Input Validation**: Case-insensitive currency codes and pre-emptive API key validation
- **Graceful Error Handling**: Intelligent fallbacks and specific error messages
- **TypeScript Support**: Fully typed with comprehensive type definitions
- **Multiple Usage Patterns**: Hook-based API and declarative component wrapper
- **Automatic Currency Detection**: Uses IP geolocation to detect user's local currency
- **Manual Override Support**: Bypass geolocation with explicit currency selection

### Production Ready
- **Lightweight**: Only ~21kB (gzipped: ~6.8kB) with minimal runtime dependencies
- **Framework Agnostic**: Works with any React application
- **HTTPS Compatible**: Uses HTTPS-only APIs safe for production deployments
- **Free APIs**: Uses only free-tier APIs (no credit card required)
- **Comprehensive Testing**: Extensive suite including real API integration validation

## 📦 Installation

```bash
# npm
npm install @iamjr15/react-currency-localizer @tanstack/react-query

# yarn
yarn add @iamjr15/react-currency-localizer @tanstack/react-query

# pnpm
pnpm add @iamjr15/react-currency-localizer @tanstack/react-query
```

> **Note**: `@tanstack/react-query` is a peer dependency required for caching and data fetching.

## 🏁 Quick Start

### 1. Wrap Your App with the Provider

```tsx
import { CurrencyConverterProvider } from '@iamjr15/react-currency-localizer'

function App() {
  return (
    <CurrencyConverterProvider>
      <YourAppContent />
    </CurrencyConverterProvider>
  )
}
```

### 2. Use the Hook

```tsx
import { useCurrencyConverter } from '@iamjr15/react-currency-localizer'

function ProductPrice({ price }: { price: number }) {
  const { 
    convertedPrice, 
    localCurrency, 
    isLoading, 
    error 
  } = useCurrencyConverter({
    basePrice: price,
    baseCurrency: 'USD',
    apiKey: 'your-exchangerate-api-key' // Get free key from exchangerate-api.com
  })

  if (isLoading) return <span>Loading price...</span>
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
```

### 3. Or Use the Component

```tsx
import { LocalizedPrice } from '@iamjr15/react-currency-localizer'

function ProductCard() {
  return (
    <div>
      <h3>Premium Plan</h3>
      <LocalizedPrice 
        basePrice={99.99}
        baseCurrency="USD"
        apiKey="your-api-key"
      />
    </div>
  )
}
```

## 📚 API Reference

### `useCurrencyConverter(options)`

The main hook for currency conversion.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `basePrice` | `number` | ✅ | The price in the base currency |
| `baseCurrency` | `string` | ✅ | ISO 4217 currency code (case-insensitive, e.g., 'USD' or 'usd') |
| `apiKey` | `string` | ✅ | API key from exchangerate-api.com (validated for helpful error messages) |
| `manualCurrency` | `string` | ❌ | Override detected currency (case-insensitive) |
| `onSuccess` | `function` | ❌ | Callback on successful conversion |
| `onError` | `function` | ❌ | Callback on error |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `convertedPrice` | `number \| null` | Price in local currency |
| `localCurrency` | `string \| null` | Detected/manual currency code |
| `baseCurrency` | `string` | Original currency code |
| `exchangeRate` | `number \| null` | Exchange rate used |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error object if any |

### `<LocalizedPrice />`

React component for displaying localized prices.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `basePrice` | `number` | ✅ | The price in base currency |
| `baseCurrency` | `string` | ✅ | ISO 4217 currency code (case-insensitive) |
| `apiKey` | `string` | ✅ | ExchangeRate API key (validated automatically) |
| `manualCurrency` | `string` | ❌ | Override detected currency (case-insensitive) |
| `loadingComponent` | `ReactNode` | ❌ | Custom loading component |
| `errorComponent` | `function` | ❌ | Custom error component (if not provided, shows original price as fallback) |
| `formatPrice` | `function` | ❌ | Custom price formatter |

## 💡 Usage Examples

### E-commerce Product Pricing

```tsx
function ProductGrid() {
  const products = [
    { id: 1, name: 'T-Shirt', price: 29.99 },
    { id: 2, name: 'Jeans', price: 79.99 },
    { id: 3, name: 'Sneakers', price: 129.99 }
  ]

  return (
    <div className="grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <LocalizedPrice 
            basePrice={product.price}
            baseCurrency="USD"
            // Vite: import.meta.env.VITE_EXCHANGE_API_KEY
            // CRA: process.env.REACT_APP_EXCHANGE_API_KEY
            // Next.js: process.env.NEXT_PUBLIC_EXCHANGE_API_KEY
            apiKey={process.env.REACT_APP_EXCHANGE_API_KEY}
          />
        </div>
      ))}
    </div>
  )
}
```

### Subscription Pricing Table

```tsx
function PricingTable() {
  const plans = [
    { name: 'Basic', price: 9.99 },
    { name: 'Pro', price: 19.99 },
    { name: 'Enterprise', price: 49.99 }
  ]

  return (
    <div className="pricing-table">
      {plans.map(plan => (
        <div key={plan.name} className="plan">
          <h3>{plan.name}</h3>
          <LocalizedPrice 
            basePrice={plan.price}
            baseCurrency="USD"
            // Vite: import.meta.env.VITE_EXCHANGE_API_KEY
            // CRA: process.env.REACT_APP_EXCHANGE_API_KEY
            // Next.js: process.env.NEXT_PUBLIC_EXCHANGE_API_KEY
            apiKey={process.env.REACT_APP_EXCHANGE_API_KEY}
            formatPrice={(price, currency) => 
              `${currency} ${price.toFixed(2)}/month`
            }
          />
        </div>
      ))}
    </div>
  )
}
```

### Manual Currency Override

```tsx
function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState('')
  
  return (
    <div>
      <select 
        value={selectedCurrency} 
        onChange={(e) => setSelectedCurrency(e.target.value)}
      >
        <option value="">Auto-detect</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
      </select>
      
      <LocalizedPrice 
        basePrice={99.99}
        baseCurrency="USD"
        // Vite: import.meta.env.VITE_EXCHANGE_API_KEY
        // CRA: process.env.REACT_APP_EXCHANGE_API_KEY
        // Next.js: process.env.NEXT_PUBLIC_EXCHANGE_API_KEY
        apiKey={process.env.REACT_APP_EXCHANGE_API_KEY}
        manualCurrency={selectedCurrency || undefined}
      />
    </div>
  )
}
```

### Error Handling and Loading States

```tsx
function PriceWithStates() {
  const { convertedPrice, localCurrency, isLoading, error } = useCurrencyConverter({
    basePrice: 59.99,
    baseCurrency: 'usd', // Case-insensitive! Will be converted to 'USD'
    // Vite: import.meta.env.VITE_EXCHANGE_API_KEY
    // CRA: process.env.REACT_APP_EXCHANGE_API_KEY
    // Next.js: process.env.NEXT_PUBLIC_EXCHANGE_API_KEY
    apiKey: process.env.REACT_APP_EXCHANGE_API_KEY,
    onSuccess: (result) => {
      console.log('Conversion successful:', result)
    },
    onError: (error) => {
      console.error('Conversion failed:', error.message)
      // You'll get helpful error messages like:
      // "API key is missing. Please provide a valid key from exchangerate-api.com."
      // "Currency 'XYZ' was detected from your location but is not supported by the exchange rate provider."
    }
  })

  if (isLoading) {
    return (
      <div className="price-loading">
        <div className="spinner" />
        <span>Converting price...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="price-error">
        <span>$59.99 USD</span>
        <small>Unable to convert: {error.message}</small>
      </div>
    )
  }

  return (
    <div className="price-success">
      {new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: localCurrency || 'USD'
      }).format(convertedPrice || 59.99)}
    </div>
  )
}
```

### Graceful Fallback Behavior

```tsx
// LocalizedPrice automatically shows original price if conversion fails
function AutoFallbackPrice() {
  return (
    <LocalizedPrice 
      basePrice={99.99}
      baseCurrency="usd" // Case doesn't matter
      apiKey="" // Empty key will show helpful error, then fallback to original price
    />
    // If API fails: Shows "$99.99" with tooltip "Conversion failed, showing original price in USD"
  )
}

// Or provide custom error component for full control
function CustomErrorPrice() {
  return (
    <LocalizedPrice 
      basePrice={99.99}
      baseCurrency="USD"
      // Vite: import.meta.env.VITE_EXCHANGE_API_KEY
      // CRA: process.env.REACT_APP_EXCHANGE_API_KEY
      // Next.js: process.env.NEXT_PUBLIC_EXCHANGE_API_KEY
      apiKey={process.env.REACT_APP_EXCHANGE_API_KEY}
      errorComponent={(error) => (
        <div className="price-error">
          <span className="price">$99.99</span>
          <span className="error-badge">Conversion Error</span>
          <small>{error.message}</small>
        </div>
      )}
    />
  )
}
```

## 🏗️ Architecture Overview

This package uses a **carefully designed architecture** for maximum reliability and performance:

### Two-API Strategy
We use a **decoupled, two-API approach** for maximum accuracy and flexibility:

1. **Specialized Geolocation Service**: `ipapi.co`
   - **Why**: Dedicated to IP-based location data with HTTPS support for optimal accuracy
   - **Advantage**: No API key required, HTTPS-compatible, robust rate limiting
   - **Philosophy**: Use specialized services for what they do best—identifying location-based data

2. **Specialized Financial Data Service**: `exchangerate-api.com`  
   - **Why**: Dedicated to currency exchange rates for real-time accuracy
   - **Advantage**: Supports any base currency (not just USD), 1,500 requests/month
   - **Philosophy**: Use specialized services for what they do best—providing currency exchange rates

### Advanced State Management
We use **TanStack Query** (not basic useEffect/useState) for robust data management:
- **Automatic caching, request deduplication, and background updates**
- **Eliminates race conditions and boilerplate code**
- **Declarative API for managing asynchronous operations**

### Intelligent Caching Strategy
We implement **data-type-specific caching** optimized for each type of data:

#### Persistent Geolocation Caching
- **Duration**: 24+ hours in localStorage
- **Rationale**: User location rarely changes
- **Benefit**: Zero API calls on subsequent visits

#### In-Memory Exchange Rate Caching  
- **Duration**: 1 hour in memory
- **Rationale**: Balance between data freshness and performance
- **Benefit**: Prevents excessive API calls while maintaining accuracy

## 🔧 Configuration

### Getting API Keys

1. **ExchangeRate-API** (Required):
   - Visit [exchangerate-api.com](https://exchangerate-api.com)
   - Sign up for a free account
   - Get your API key (1,500 requests/month free)

2. **IP Geolocation** (Automatic):
   - Uses [ipapi.co](https://ipapi.co) (no key required)
   - HTTPS-compatible for secure deployments
   - Falls back gracefully on rate limits

### Environment Variables

```bash
# .env
VITE_EXCHANGE_API_KEY=your_exchangerate_api_key_here

# Optional: Enable integration tests with real APIs
VITE_RUN_INTEGRATION_TESTS=true
```

For different frameworks:

```bash
# Vite (browser-exposed)
VITE_EXCHANGE_API_KEY=your_exchangerate_api_key_here

# Create React App (browser-exposed)
REACT_APP_EXCHANGE_API_KEY=your_exchangerate_api_key_here

# Next.js (browser-exposed)
NEXT_PUBLIC_EXCHANGE_API_KEY=your_exchangerate_api_key_here
```

### Custom QueryClient Configuration

The package uses **TanStack Query** for robust state management with optimal caching:

```tsx
import { QueryClient } from '@tanstack/react-query'
import { CurrencyConverterProvider } from '@iamjr15/react-currency-localizer'

// Custom QueryClient with optimized caching strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Geolocation queries: 24+ hour stale time (location rarely changes)
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      // Exchange rate queries: 1 hour stale time (balance freshness vs performance)  
      gcTime: 1000 * 60 * 60 * 2, // 2 hours cache time
      retry: 1, // Conservative retry to respect API limits
    },
  },
})

function App() {
  return (
    <CurrencyConverterProvider queryClient={queryClient}>
      <YourApp />
    </CurrencyConverterProvider>
  )
}
```

> **Note**: The default configuration already implements the optimal caching strategy. Custom configuration is optional.

## ⚠️ Important Considerations

### Server-Side Rendering (SSR) Caveats

When using this library with SSR frameworks (Next.js, Nuxt, SvelteKit), be aware that:

- **IP Geolocation runs on the server**: The detected location reflects the server's IP, not the user's
- **Hydration mismatches possible**: Server-rendered currency may differ from client-side detection
- **Recommended approach**: Pass `manualCurrency` prop or perform geolocation client-side only

```tsx
// For SSR: Disable geolocation on server, enable on client
const [isClient, setIsClient] = useState(false)

useEffect(() => {
  setIsClient(true)
}, [])

return (
  <LocalizedPrice 
    basePrice={99.99}
    baseCurrency="USD"
    apiKey={process.env.NEXT_PUBLIC_EXCHANGE_API_KEY}
    manualCurrency={!isClient ? 'USD' : undefined} // Use USD on server, auto-detect on client
  />
)
```

### HTTPS Requirements

This library uses HTTPS-only APIs (`ipapi.co`, `exchangerate-api.com`) to ensure compatibility with secure deployments. Mixed content (HTTP requests from HTTPS sites) is automatically blocked by modern browsers.

### Runtime Dependencies

While the library has minimal dependencies, it does include:
- `@tanstack/react-query` (peer dependency for state management)
- `@tanstack/query-sync-storage-persister` (for localStorage caching)
- `@tanstack/react-query-persist-client` (for persistence integration)

Total bundle impact: ~20kB minified, ~6.5kB gzipped.

## 🌍 Supported Currencies

The package supports **161 commonly circulating world currencies** via ExchangeRate-API, covering 99% of all UN recognized states and territories.

### ✅ Complete Currency Support (161 Currencies)

All [ISO 4217 three-letter currency codes](https://en.wikipedia.org/wiki/ISO_4217) are supported, including:

#### Major Global Currencies
- **USD** - United States Dollar
- **EUR** - Euro (European Union)
- **GBP** - Pound Sterling (United Kingdom)
- **JPY** - Japanese Yen
- **CAD** - Canadian Dollar
- **AUD** - Australian Dollar
- **CHF** - Swiss Franc
- **CNY** - Chinese Renminbi

#### Popular Regional Currencies
- **INR** - Indian Rupee
- **BRL** - Brazilian Real
- **RUB** - Russian Ruble
- **KRW** - South Korean Won
- **SGD** - Singapore Dollar
- **HKD** - Hong Kong Dollar
- **NOK** - Norwegian Krone
- **SEK** - Swedish Krona
- **MXN** - Mexican Peso
- **ZAR** - South African Rand
- **TRY** - Turkish Lira

#### All Supported Currencies
<details>
<summary><strong>Click to view complete list of 161 supported currencies</strong></summary>

| Code | Currency Name | Country/Region |
|------|---------------|----------------|
| AED | UAE Dirham | United Arab Emirates |
| AFN | Afghan Afghani | Afghanistan |
| ALL | Albanian Lek | Albania |
| AMD | Armenian Dram | Armenia |
| ANG | Netherlands Antillian Guilder | Netherlands Antilles |
| AOA | Angolan Kwanza | Angola |
| ARS | Argentine Peso | Argentina |
| AUD | Australian Dollar | Australia |
| AWG | Aruban Florin | Aruba |
| AZN | Azerbaijani Manat | Azerbaijan |
| BAM | Bosnia and Herzegovina Mark | Bosnia and Herzegovina |
| BBD | Barbados Dollar | Barbados |
| BDT | Bangladeshi Taka | Bangladesh |
| BGN | Bulgarian Lev | Bulgaria |
| BHD | Bahraini Dinar | Bahrain |
| BIF | Burundian Franc | Burundi |
| BMD | Bermudian Dollar | Bermuda |
| BND | Brunei Dollar | Brunei |
| BOB | Bolivian Boliviano | Bolivia |
| BRL | Brazilian Real | Brazil |
| BSD | Bahamian Dollar | Bahamas |
| BTN | Bhutanese Ngultrum | Bhutan |
| BWP | Botswana Pula | Botswana |
| BYN | Belarusian Ruble | Belarus |
| BZD | Belize Dollar | Belize |
| CAD | Canadian Dollar | Canada |
| CDF | Congolese Franc | Democratic Republic of the Congo |
| CHF | Swiss Franc | Switzerland |
| CLP | Chilean Peso | Chile |
| CNY | Chinese Renminbi | China |
| COP | Colombian Peso | Colombia |
| CRC | Costa Rican Colon | Costa Rica |
| CUP | Cuban Peso | Cuba |
| CVE | Cape Verdean Escudo | Cape Verde |
| CZK | Czech Koruna | Czech Republic |
| DJF | Djiboutian Franc | Djibouti |
| DKK | Danish Krone | Denmark |
| DOP | Dominican Peso | Dominican Republic |
| DZD | Algerian Dinar | Algeria |
| EGP | Egyptian Pound | Egypt |
| ERN | Eritrean Nakfa | Eritrea |
| ETB | Ethiopian Birr | Ethiopia |
| EUR | Euro | European Union |
| FJD | Fiji Dollar | Fiji |
| FKP | Falkland Islands Pound | Falkland Islands |
| FOK | Faroese Króna | Faroe Islands |
| GBP | Pound Sterling | United Kingdom |
| GEL | Georgian Lari | Georgia |
| GGP | Guernsey Pound | Guernsey |
| GHS | Ghanaian Cedi | Ghana |
| GIP | Gibraltar Pound | Gibraltar |
| GMD | Gambian Dalasi | The Gambia |
| GNF | Guinean Franc | Guinea |
| GTQ | Guatemalan Quetzal | Guatemala |
| GYD | Guyanese Dollar | Guyana |
| HKD | Hong Kong Dollar | Hong Kong |
| HNL | Honduran Lempira | Honduras |
| HRK | Croatian Kuna | Croatia |
| HTG | Haitian Gourde | Haiti |
| HUF | Hungarian Forint | Hungary |
| IDR | Indonesian Rupiah | Indonesia |
| ILS | Israeli New Shekel | Israel |
| IMP | Manx Pound | Isle of Man |
| INR | Indian Rupee | India |
| IQD | Iraqi Dinar | Iraq |
| IRR | Iranian Rial | Iran |
| ISK | Icelandic Króna | Iceland |
| JEP | Jersey Pound | Jersey |
| JMD | Jamaican Dollar | Jamaica |
| JOD | Jordanian Dinar | Jordan |
| JPY | Japanese Yen | Japan |
| KES | Kenyan Shilling | Kenya |
| KGS | Kyrgyzstani Som | Kyrgyzstan |
| KHR | Cambodian Riel | Cambodia |
| KID | Kiribati Dollar | Kiribati |
| KMF | Comorian Franc | Comoros |
| KRW | South Korean Won | South Korea |
| KWD | Kuwaiti Dinar | Kuwait |
| KYD | Cayman Islands Dollar | Cayman Islands |
| KZT | Kazakhstani Tenge | Kazakhstan |
| LAK | Lao Kip | Laos |
| LBP | Lebanese Pound | Lebanon |
| LKR | Sri Lanka Rupee | Sri Lanka |
| LRD | Liberian Dollar | Liberia |
| LSL | Lesotho Loti | Lesotho |
| LYD | Libyan Dinar | Libya |
| MAD | Moroccan Dirham | Morocco |
| MDL | Moldovan Leu | Moldova |
| MGA | Malagasy Ariary | Madagascar |
| MKD | Macedonian Denar | North Macedonia |
| MMK | Burmese Kyat | Myanmar |
| MNT | Mongolian Tögrög | Mongolia |
| MOP | Macanese Pataca | Macau |
| MRU | Mauritanian Ouguiya | Mauritania |
| MUR | Mauritian Rupee | Mauritius |
| MVR | Maldivian Rufiyaa | Maldives |
| MWK | Malawian Kwacha | Malawi |
| MXN | Mexican Peso | Mexico |
| MYR | Malaysian Ringgit | Malaysia |
| MZN | Mozambican Metical | Mozambique |
| NAD | Namibian Dollar | Namibia |
| NGN | Nigerian Naira | Nigeria |
| NIO | Nicaraguan Córdoba | Nicaragua |
| NOK | Norwegian Krone | Norway |
| NPR | Nepalese Rupee | Nepal |
| NZD | New Zealand Dollar | New Zealand |
| OMR | Omani Rial | Oman |
| PAB | Panamanian Balboa | Panama |
| PEN | Peruvian Sol | Peru |
| PGK | Papua New Guinean Kina | Papua New Guinea |
| PHP | Philippine Peso | Philippines |
| PKR | Pakistani Rupee | Pakistan |
| PLN | Polish Złoty | Poland |
| PYG | Paraguayan Guaraní | Paraguay |
| QAR | Qatari Riyal | Qatar |
| RON | Romanian Leu | Romania |
| RSD | Serbian Dinar | Serbia |
| RUB | Russian Ruble | Russia |
| RWF | Rwandan Franc | Rwanda |
| SAR | Saudi Riyal | Saudi Arabia |
| SBD | Solomon Islands Dollar | Solomon Islands |
| SCR | Seychellois Rupee | Seychelles |
| SDG | Sudanese Pound | Sudan |
| SEK | Swedish Krona | Sweden |
| SGD | Singapore Dollar | Singapore |
| SHP | Saint Helena Pound | Saint Helena |
| SLE | Sierra Leonean Leone | Sierra Leone |
| SOS | Somali Shilling | Somalia |
| SRD | Surinamese Dollar | Suriname |
| SSP | South Sudanese Pound | South Sudan |
| STN | São Tomé and Príncipe Dobra | São Tomé and Príncipe |
| SYP | Syrian Pound | Syria |
| SZL | Eswatini Lilangeni | Eswatini |
| THB | Thai Baht | Thailand |
| TJS | Tajikistani Somoni | Tajikistan |
| TMT | Turkmenistan Manat | Turkmenistan |
| TND | Tunisian Dinar | Tunisia |
| TOP | Tongan Paʻanga | Tonga |
| TRY | Turkish Lira | Turkey |
| TTD | Trinidad and Tobago Dollar | Trinidad and Tobago |
| TVD | Tuvaluan Dollar | Tuvalu |
| TWD | New Taiwan Dollar | Taiwan |
| TZS | Tanzanian Shilling | Tanzania |
| UAH | Ukrainian Hryvnia | Ukraine |
| UGX | Ugandan Shilling | Uganda |
| USD | United States Dollar | United States |
| UYU | Uruguayan Peso | Uruguay |
| UZS | Uzbekistani So'm | Uzbekistan |
| VES | Venezuelan Bolívar Soberano | Venezuela |
| VND | Vietnamese Đồng | Vietnam |
| VUV | Vanuatu Vatu | Vanuatu |
| WST | Samoan Tālā | Samoa |
| XAF | Central African CFA Franc | CEMAC |
| XCD | East Caribbean Dollar | Organisation of Eastern Caribbean States |
| XDR | Special Drawing Rights | International Monetary Fund |
| XOF | West African CFA franc | CFA |
| XPF | CFP Franc | Collectivités d'Outre-Mer |
| YER | Yemeni Rial | Yemen |
| ZAR | South African Rand | South Africa |
| ZMW | Zambian Kwacha | Zambia |
| ZWL | Zimbabwean Dollar | Zimbabwe |

</details>

### ❌ Unsupported Currency (1)

| Code | Currency Name | Country | Reason |
|------|---------------|---------|---------|
| **KPW** | North Korean Won | North Korea | Due to sanctions & lack of international trade |

> **Note**: For KPW data, the only reliable source is [Daily NK](https://www.dailynk.com/), which reports actual jangmadang market rates via human sources inside DPRK.

### ⚠️ Volatile Currencies (Special Caution Required)

The following currencies experience heightened volatility and substantial differences between official and actual exchange rates. Extra caution is recommended:

| Code | Currency Name | Country | Notes |
|------|---------------|---------|-------|
| **ARS** | Argentine Peso | Argentina | Multiple exchange rates in market |
| **LYD** | Libyan Dinar | Libya | Political instability affects rates |
| **SSP** | South Sudanese Pound | South Sudan | High volatility |
| **SYP** | Syrian Pound | Syria | Ongoing conflict impacts rates |
| **VES** | Venezuelan Bolívar Soberano | Venezuela | Hyperinflation environment |
| **YER** | Yemeni Rial | Yemen | Regional instability |
| **ZWL** | Zimbabwean Dollar | Zimbabwe | Historical hyperinflation legacy |

> **Important**: For volatile currencies, rates default to central bank published rates, which may differ significantly from actual market rates.

## ⚡ Performance

- **Bundle Size**: ~20kB minified, ~6.5kB gzipped
- **First Load**: 2 API calls (geolocation + exchange rates)
- **Subsequent Loads**: 0-1 API calls (cached geolocation)
- **Cache Duration**: 24 hours for geolocation, 1 hour for exchange rates
- **Rate Limits**: Handled gracefully with automatic fallbacks
- **Validation**: Zero-cost currency normalization and API key validation
- **Error Prevention**: Pre-emptive validation prevents wasted API calls

## 🔍 Troubleshooting

### Common Issues and Solutions

#### "API key is missing" Error
```tsx
// ❌ This will show a helpful error message
useCurrencyConverter({
  basePrice: 99.99,
  baseCurrency: 'USD',
  apiKey: '' // Empty key
})

// ✅ Provide your API key
useCurrencyConverter({
  basePrice: 99.99,
  baseCurrency: 'USD',
  apiKey: process.env.REACT_APP_EXCHANGE_API_KEY
})
```

#### Currency Case Sensitivity
```tsx
// ✅ All of these work the same way (case-insensitive)
useCurrencyConverter({ baseCurrency: 'USD', manualCurrency: 'EUR' })
useCurrencyConverter({ baseCurrency: 'usd', manualCurrency: 'eur' })  
useCurrencyConverter({ baseCurrency: 'Usd', manualCurrency: 'Eur' })
```

#### Currency Not Supported Error
```tsx
// If you get: "Currency 'KPW' was detected from your location but is not supported"
// Solution: Use manual currency override (KPW is the only unsupported currency)
useCurrencyConverter({
  basePrice: 99.99,
  baseCurrency: 'USD',
  apiKey: 'your-key',
  manualCurrency: 'USD' // Override KPW with a supported currency
})

// For volatile currencies (ARS, VES, etc.), rates may differ from market reality
useCurrencyConverter({
  basePrice: 99.99,
  baseCurrency: 'USD',
  apiKey: 'your-key',
  manualCurrency: 'ARS', // Works, but be aware of potential rate discrepancies
  onSuccess: (result) => {
    console.log('Note: ARS rates may differ from actual market rates')
  }
})
```

#### Rate Limiting
```tsx
// The package automatically handles rate limits, but you can also:
useCurrencyConverter({
  basePrice: 99.99,
  baseCurrency: 'USD', 
  apiKey: 'your-key',
  onError: (error) => {
    if (error.message.includes('429')) {
      // Handle rate limiting gracefully
      console.log('Rate limited, showing original price')
    }
  }
})
```

## 🧪 Testing

### Unit Tests (with Mocks)

Run the standard test suite with mocked APIs:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

### Integration Tests (with Real APIs)

To test with real API calls, first set up your environment:

```bash
# Create .env file with your real API key
echo "VITE_EXCHANGE_API_KEY=your_actual_api_key_here" > .env
echo "VITE_RUN_INTEGRATION_TESTS=true" >> .env
```

Then run integration tests:

```bash
# Run once with real APIs
npm run test:integration

# Watch mode with real APIs  
npm run test:integration:watch
```

**⚠️ Note**: Integration tests make real API calls and will:
- Consume your API quota (free tier: 1,500 requests/month)
- Require internet connection
- Take longer to complete (5-15 seconds per test)
- May fail due to network issues or rate limits

### Test Coverage

The package includes comprehensive tests covering:
- **Unit Tests**: Hook functionality, component rendering, error handling (39 tests)
- **Integration Tests**: Real API calls, caching performance, rate limiting (8 tests)
- **Validation Tests**: Currency normalization, API key validation (4 tests)
- **Edge Cases**: Zero prices, error scenarios, network failures
- **TypeScript**: Full type checking and IntelliSense
- **Total**: 49 tests with 100% code coverage

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/iamjr15/react-currency-localizer.git

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run linting
npm run lint
```

## 📜 License

MIT © [Jigyansu Rout](https://github.com/iamjr15)

## ✨ Key Design Decisions

This implementation is built on carefully considered architectural choices:

✅ **Two-API Architecture** - Specialized services for maximum accuracy  
✅ **TanStack Query Integration** - Enterprise-grade state management  
✅ **Intelligent Caching Strategy** - Optimized for each data type  
✅ **Hook-Based API** - Modern React patterns  
✅ **LocalizedPrice Component** - Declarative wrapper component  
✅ **TypeScript Support** - Full type safety and IntelliSense  
✅ **Free APIs Only** - Zero cost barrier to entry  
✅ **ipapi.co Selection** - HTTPS-compatible geolocation service  
✅ **ExchangeRate-API.com Selection** - Reliable currency data provider  

## 🙏 Acknowledgments

- [ExchangeRate-API](https://exchangerate-api.com) for reliable exchange rate data
- [ipapi.co](https://ipapi.co) for free HTTPS-compatible IP geolocation services
- [TanStack Query](https://tanstack.com/query) for excellent caching and data fetching
- The React community for inspiration and feedback

---

Made with ❤️ for the React community
