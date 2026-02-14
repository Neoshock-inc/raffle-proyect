import { COUNTRY_CONFIGS, DEFAULT_COUNTRY } from '@/constants/countries'
import type { CountryCode } from '@/constants/countries'

export function formatTenantCurrency(amount: number, countryCode: CountryCode = DEFAULT_COUNTRY): string {
  const { currency } = COUNTRY_CONFIGS[countryCode]
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
  }).format(amount)
}
