"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { css } from "styled-system/css"
import { MapPin, Search, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return

    setIsSearching(true)
    setError("")

    try {
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(address)}`
      )
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setIsSearching(false)
        return
      }

      // Store in sessionStorage for the new project page
      sessionStorage.setItem(
        "newProject",
        JSON.stringify({
          address: data.address,
          lat: data.lat,
          lng: data.lng,
        })
      )

      // Navigate to create new project (we'll need to handle this)
      router.push(`/projects/new?address=${encodeURIComponent(data.address)}&lat=${data.lat}&lng=${data.lng}`)
    } catch (err) {
      setError("Failed to search address")
      setIsSearching(false)
    }
  }

  return (
    <div
      className={css({
        minHeight: "100vh",
        bg: "gray.50",
        display: "flex",
        flexDirection: "column",
      })}
    >
      {/* Header */}
      <header
        className={css({
          bg: "white",
          borderBottom: "1px solid",
          borderColor: "gray.200",
          px: "4",
          py: "3",
        })}
      >
        <div
          className={css({
            maxWidth: "1200px",
            mx: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <h1
            className={css({
              fontSize: "xl",
              fontWeight: "bold",
              color: "blue.600",
            })}
          >
            Freedom Drains Pro
          </h1>
          <Link
            href="/projects"
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              px: "4",
              py: "2",
              color: "gray.600",
              fontSize: "sm",
              textDecoration: "none",
              borderRadius: "lg",
              _hover: { bg: "gray.100", color: "gray.900" },
            })}
          >
            My Projects
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main
        className={css({
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: "4",
          py: "16",
        })}
      >
        <div
          className={css({
            maxWidth: "600px",
            width: "100%",
            textAlign: "center",
          })}
        >
          <div
            className={css({
              width: "80px",
              height: "80px",
              bg: "blue.100",
              borderRadius: "2xl",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: "6",
            })}
          >
            <MapPin size={40} className={css({ color: "blue.600" })} />
          </div>

          <h2
            className={css({
              fontSize: "3xl",
              fontWeight: "bold",
              color: "gray.900",
              mb: "3",
              "@media (max-width: 767px)": {
                fontSize: "2xl",
              },
            })}
          >
            Design Drainage Solutions
          </h2>

          <p
            className={css({
              fontSize: "lg",
              color: "gray.600",
              mb: "8",
              "@media (max-width: 767px)": {
                fontSize: "base",
              },
            })}
          >
            Enter an address to start designing a HydroBlox drainage system with instant cost calculations.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch}>
            <div
              className={css({
                display: "flex",
                gap: "2",
                mb: "4",
                "@media (max-width: 767px)": {
                  flexDirection: "column",
                },
              })}
            >
              <div className={css({ flex: 1, position: "relative" })}>
                <MapPin
                  size={18}
                  className={css({
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "gray.400",
                  })}
                />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter property address..."
                  className={css({
                    width: "100%",
                    pl: "12",
                    pr: "4",
                    py: "4",
                    fontSize: "base",
                    border: "1px solid",
                    borderColor: error ? "red.300" : "gray.300",
                    borderRadius: "xl",
                    bg: "white",
                    outline: "none",
                    _focus: {
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    },
                    _placeholder: { color: "gray.400" },
                  })}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !address.trim()}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2",
                  px: "6",
                  py: "4",
                  bg: "blue.500",
                  color: "white",
                  borderRadius: "xl",
                  fontSize: "base",
                  fontWeight: "semibold",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  _hover: { bg: "blue.600" },
                  _disabled: { opacity: 0.5, cursor: "not-allowed" },
                  "@media (max-width: 767px)": {
                    width: "100%",
                  },
                })}
              >
                {isSearching ? (
                  <Loader2 size={20} className={css({ animation: "spin 1s linear infinite" })} />
                ) : (
                  <Search size={20} />
                )}
                {isSearching ? "Searching..." : "Start Design"}
              </button>
            </div>

            {error && (
              <p className={css({ color: "red.600", fontSize: "sm", textAlign: "left" })}>
                {error}
              </p>
            )}
          </form>

          {/* Quick links */}
          <div
            className={css({
              mt: "8",
              pt: "8",
              borderTop: "1px solid",
              borderColor: "gray.200",
            })}
          >
            <p className={css({ fontSize: "sm", color: "gray.500", mb: "3" })}>
              Or continue with an existing project
            </p>
            <Link
              href="/projects"
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "2",
                px: "4",
                py: "2",
                bg: "gray.100",
                color: "gray.700",
                borderRadius: "lg",
                fontSize: "sm",
                fontWeight: "medium",
                textDecoration: "none",
                _hover: { bg: "gray.200" },
              })}
            >
              View All Projects
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={css({
          py: "4",
          textAlign: "center",
          color: "gray.400",
          fontSize: "sm",
        })}
      >
        Freedom Drains Pro - Drainage Design Tool
      </footer>
    </div>
  )
}
