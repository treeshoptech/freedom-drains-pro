import type { DesignFeature } from "@/stores/design-store"

// Promo end date: March 31, 2026
const PROMO_END = new Date("2026-03-31T23:59:59")

export interface PricingRates {
  hydroblox: number
  parallel: number
  transitionBox: number
  stormwaterBox: number
}

// Regular pricing rates (from treeshop.app/store)
export const REGULAR_RATES: PricingRates = {
  hydroblox: 50, // per linear foot
  parallel: 25, // per linear foot
  transitionBox: 400, // per unit
  stormwaterBox: 750, // per unit
}

// Promo pricing (HydroBlox only)
export const PROMO_RATES: PricingRates = {
  hydroblox: 35, // $15 savings per LF
  parallel: 25, // no change
  transitionBox: 400, // no change
  stormwaterBox: 750, // no change
}

export interface PricingSummary {
  // Linear feet totals
  hydrobloxLF: number
  parallelLF: number

  // Unit counts
  transitionCount: number
  stormwaterCount: number

  // Individual costs
  hydrobloxCost: number
  parallelCost: number
  transitionCost: number
  stormwaterCost: number

  // Totals
  subtotal: number
  total: number

  // Promo info
  isPromo: boolean
  regularTotal: number
  savings: number

  // Rates used
  rates: PricingRates
}

export function calculateTotal(features: DesignFeature[]): PricingSummary {
  const now = new Date()
  const isPromo = now < PROMO_END

  const rates: PricingRates = isPromo ? PROMO_RATES : REGULAR_RATES

  // Sum up line lengths by type
  let hydrobloxLF = 0
  let parallelLF = 0
  let transitionCount = 0
  let stormwaterCount = 0

  for (const feature of features) {
    const type = feature.properties?.elementType

    if (type === "hydroblox-run") {
      hydrobloxLF += feature.properties?.lengthFt || 0
    }
    if (type === "parallel-row") {
      parallelLF += feature.properties?.lengthFt || 0
    }
    if (type === "transition-box") {
      transitionCount++
    }
    if (type === "stormwater-box") {
      stormwaterCount++
    }
  }

  // Calculate costs
  const hydrobloxCost = Math.round(hydrobloxLF * rates.hydroblox)
  const parallelCost = Math.round(parallelLF * rates.parallel)
  const transitionCost = transitionCount * rates.transitionBox
  const stormwaterCost = stormwaterCount * rates.stormwaterBox

  const total = hydrobloxCost + parallelCost + transitionCost + stormwaterCost

  // Calculate regular total (for savings display)
  const regularHydroblox = Math.round(hydrobloxLF * REGULAR_RATES.hydroblox)
  const regularTotal =
    regularHydroblox + parallelCost + transitionCost + stormwaterCost

  // Savings only applies during promo
  const savings = isPromo ? regularTotal - total : 0

  return {
    hydrobloxLF: Math.round(hydrobloxLF),
    parallelLF: Math.round(parallelLF),
    transitionCount,
    stormwaterCount,
    hydrobloxCost,
    parallelCost,
    transitionCost,
    stormwaterCost,
    subtotal: total,
    total,
    isPromo,
    regularTotal,
    savings,
    rates,
  }
}
