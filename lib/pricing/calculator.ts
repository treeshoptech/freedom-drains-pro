import type { DesignFeature } from "@/stores/design-store"

// Pricing rates
export const RATES = {
  hydroblox: 45, // per linear foot
  parallel: 35, // per linear foot
  transitionBox: 400, // per unit
  stormwaterBox: 750, // per unit
}

// Q1 2026 promo pricing
export const PROMO_RATES = {
  hydroblox: 40,
  parallel: 30,
  transitionBox: 350,
  stormwaterBox: 650,
}

// Check if promo is active (Q1 2026)
export function isPromoActive(): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 0-indexed

  // Q1 2026: January - March 2026
  return year === 2026 && month >= 1 && month <= 3
}

export interface PricingResult {
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
  savings: number

  // Rates used
  rates: typeof RATES
}

export function calculateTotal(features: DesignFeature[]): PricingResult {
  const isPromo = isPromoActive()
  const rates = isPromo ? PROMO_RATES : RATES

  // Calculate linear feet
  const hydrobloxLF = features
    .filter((f) => f.properties.elementType === "hydroblox-run")
    .reduce((sum, f) => sum + (f.properties.lengthFt || 0), 0)

  const parallelLF = features
    .filter((f) => f.properties.elementType === "parallel-row")
    .reduce((sum, f) => sum + (f.properties.lengthFt || 0), 0)

  // Count units
  const transitionCount = features.filter(
    (f) => f.properties.elementType === "transition-box"
  ).length

  const stormwaterCount = features.filter(
    (f) => f.properties.elementType === "stormwater-box"
  ).length

  // Calculate costs
  const hydrobloxCost = hydrobloxLF * rates.hydroblox
  const parallelCost = parallelLF * rates.parallel
  const transitionCost = transitionCount * rates.transitionBox
  const stormwaterCost = stormwaterCount * rates.stormwaterBox

  const total = hydrobloxCost + parallelCost + transitionCost + stormwaterCost

  // Calculate savings if promo
  let savings = 0
  if (isPromo) {
    const regularTotal =
      hydrobloxLF * RATES.hydroblox +
      parallelLF * RATES.parallel +
      transitionCount * RATES.transitionBox +
      stormwaterCount * RATES.stormwaterBox
    savings = regularTotal - total
  }

  return {
    hydrobloxLF,
    parallelLF,
    transitionCount,
    stormwaterCount,
    hydrobloxCost,
    parallelCost,
    transitionCost,
    stormwaterCost,
    subtotal: total,
    total,
    isPromo,
    savings,
    rates,
  }
}
