"use client"

import { ExternalLink } from "lucide-react"
import { css } from "styled-system/css"
import { useDesignStore } from "@/stores/design-store"
import { calculateTotal } from "@/lib/pricing/calculator"

export function CostPanel() {
  const features = useDesignStore((state) => state.features)
  const pricing = calculateTotal(features)

  const hasItems =
    pricing.hydrobloxLF > 0 ||
    pricing.parallelLF > 0 ||
    pricing.transitionCount > 0 ||
    pricing.stormwaterCount > 0

  return (
    <div
      className={css({
        width: "300px",
        height: "100%",
        bg: "white",
        borderLeft: "1px solid",
        borderColor: "gray.200",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      })}
    >
      {/* Header */}
      <div
        className={css({
          px: "4",
          py: "3",
          borderBottom: "1px solid",
          borderColor: "gray.200",
        })}
      >
        <h2
          className={css({
            fontSize: "xs",
            fontWeight: "semibold",
            color: "gray.500",
            textTransform: "uppercase",
            letterSpacing: "wide",
          })}
        >
          Project Totals
        </h2>
      </div>

      {/* Line Items */}
      <div className={css({ flex: 1, px: "4", py: "3" })}>
        {!hasItems ? (
          <p
            className={css({
              fontSize: "sm",
              color: "gray.400",
              textAlign: "center",
              py: "8",
            })}
          >
            Start drawing to see costs
          </p>
        ) : (
          <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
            {/* HydroBlox Run */}
            {pricing.hydrobloxLF > 0 && (
              <LineItem
                label="HydroBlox Run"
                detail={`${pricing.hydrobloxLF} LF × $${pricing.rates.hydroblox}`}
                value={pricing.hydrobloxCost}
              />
            )}

            {/* Parallel Row */}
            {pricing.parallelLF > 0 && (
              <LineItem
                label="Parallel Row"
                detail={`${pricing.parallelLF} LF × $${pricing.rates.parallel}`}
                value={pricing.parallelCost}
              />
            )}

            {/* Transition Box */}
            {pricing.transitionCount > 0 && (
              <LineItem
                label="Transition Box"
                detail={`${pricing.transitionCount} × $${pricing.rates.transitionBox}`}
                value={pricing.transitionCost}
              />
            )}

            {/* Stormwater Box */}
            {pricing.stormwaterCount > 0 && (
              <LineItem
                label="Stormwater Box"
                detail={`${pricing.stormwaterCount} × $${pricing.rates.stormwaterBox}`}
                value={pricing.stormwaterCost}
              />
            )}
          </div>
        )}
      </div>

      {/* Total Section */}
      {hasItems && (
        <>
          <div
            className={css({
              mx: "4",
              height: "1px",
              bg: "gray.200",
            })}
          />

          <div className={css({ px: "4", py: "4" })}>
            {/* Promo Badge */}
            {pricing.isPromo && pricing.savings > 0 && (
              <div
                className={css({
                  bg: "green.50",
                  color: "green.700",
                  px: "3",
                  py: "2",
                  borderRadius: "md",
                  fontSize: "sm",
                  fontWeight: "medium",
                  mb: "3",
                })}
              >
                <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
                  <span>⚡</span>
                  <span>Promo Pricing - Save ${pricing.savings.toLocaleString()}!</span>
                </div>
                <div
                  className={css({
                    fontSize: "xs",
                    color: "green.600",
                    mt: "1",
                  })}
                >
                  Ends March 31, 2026
                </div>
              </div>
            )}

            {/* Total */}
            <div
              className={css({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              })}
            >
              <span
                className={css({
                  fontSize: "lg",
                  fontWeight: "bold",
                  color: "gray.900",
                })}
              >
                TOTAL
              </span>
              <span
                className={css({
                  fontSize: "2xl",
                  fontWeight: "bold",
                  color: "blue.600",
                })}
              >
                ${pricing.total.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Buy Materials Button */}
      {hasItems && (
        <div className={css({ px: "4", pb: "4" })}>
          <a
            href="https://treeshop.app/store/services/drainage"
            target="_blank"
            rel="noopener noreferrer"
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2",
              width: "100%",
              py: "3",
              bg: "blue.500",
              color: "white",
              borderRadius: "lg",
              fontSize: "sm",
              fontWeight: "semibold",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              _hover: {
                bg: "blue.600",
              },
            })}
          >
            Buy Materials
            <ExternalLink size={16} />
          </a>
        </div>
      )}

      {/* Resource Links */}
      <div
        className={css({
          px: "4",
          py: "3",
          borderTop: "1px solid",
          borderColor: "gray.100",
          bg: "gray.50",
        })}
      >
        <div
          className={css({
            fontSize: "xs",
            fontWeight: "medium",
            color: "gray.500",
            mb: "2",
          })}
        >
          Resources
        </div>
        <div className={css({ display: "flex", flexDirection: "column", gap: "1" })}>
          <ResourceLink
            href="https://www.homedepot.com/b/Outdoors-Garden-Center-Landscaping-Drainage/HydroBlox/N-5yc1vZbx5yZ5ca"
            label="Home Depot: HydroBlox"
          />
          <ResourceLink
            href="https://www.homedepot.com/p/rental/Ditch-Witch-Walk-Behind-Trencher-C16X/316099131"
            label="Home Depot: Trencher Rental"
          />
        </div>
      </div>
    </div>
  )
}

interface LineItemProps {
  label: string
  detail: string
  value: number
}

function LineItem({ label, detail, value }: LineItemProps) {
  return (
    <div>
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        })}
      >
        <span
          className={css({
            fontSize: "sm",
            fontWeight: "medium",
            color: "gray.700",
          })}
        >
          {label}
        </span>
        <span
          className={css({
            fontSize: "sm",
            fontWeight: "semibold",
            color: "gray.900",
          })}
        >
          ${value.toLocaleString()}
        </span>
      </div>
      <div
        className={css({
          fontSize: "xs",
          color: "gray.400",
          mt: "0.5",
        })}
      >
        {detail}
      </div>
    </div>
  )
}

interface ResourceLinkProps {
  href: string
  label: string
}

function ResourceLink({ href, label }: ResourceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "1",
        fontSize: "xs",
        color: "blue.600",
        textDecoration: "none",
        _hover: {
          textDecoration: "underline",
        },
      })}
    >
      <ExternalLink size={12} />
      {label}
    </a>
  )
}
