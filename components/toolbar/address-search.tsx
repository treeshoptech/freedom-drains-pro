"use client"

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { css } from "styled-system/css"

interface GeocodingFeature {
  id: string
  place_name: string
  center: [number, number]
}

interface AddressSearchProps {
  onSelect: (result: { address: string; lat: number; lng: number }) => void
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GeocodingFeature[]>([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch(
        `/api/geocode?address=${encodeURIComponent(query)}`
      )
      const data = await res.json()
      setResults(data.features || [])
    } catch (error) {
      console.error("Geocoding error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (feature: GeocodingFeature) => {
    onSelect({
      address: feature.place_name,
      lng: feature.center[0],
      lat: feature.center[1],
    })
    setResults([])
    setQuery(feature.place_name)
  }

  return (
    <div className={css({ position: "relative", width: "100%" })}>
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "2",
          bg: "white",
          borderRadius: "md",
          border: "1px solid",
          borderColor: "gray.300",
          px: "3",
          py: "2",
        })}
      >
        <Search
          size={20}
          className={css({ color: "gray.500", flexShrink: 0 })}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Enter property address..."
          className={css({
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "sm",
            bg: "transparent",
            "&::placeholder": {
              color: "gray.400",
            },
          })}
        />
        <button
          onClick={search}
          disabled={loading}
          className={css({
            px: "3",
            py: "1",
            bg: "blue.500",
            color: "white",
            borderRadius: "md",
            fontSize: "sm",
            fontWeight: "medium",
            cursor: "pointer",
            _hover: { bg: "blue.600" },
            _disabled: { opacity: 0.5, cursor: "not-allowed" },
          })}
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <div
          className={css({
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            mt: "1",
            bg: "white",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "gray.200",
            boxShadow: "lg",
            zIndex: 50,
            maxHeight: "300px",
            overflowY: "auto",
          })}
        >
          {results.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleSelect(feature)}
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "2",
                width: "100%",
                px: "3",
                py: "2",
                textAlign: "left",
                fontSize: "sm",
                cursor: "pointer",
                _hover: { bg: "gray.50" },
                borderBottom: "1px solid",
                borderColor: "gray.100",
                _last: { borderBottom: "none" },
              })}
            >
              <MapPin size={16} className={css({ color: "gray.400", flexShrink: 0 })} />
              <span className={css({ color: "gray.700" })}>{feature.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
