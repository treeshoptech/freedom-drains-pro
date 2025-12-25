"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { css } from "styled-system/css"
import { MapPin, X } from "lucide-react"

interface AddressSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (result: { address: string; lat: number; lng: number }) => void
  placeholder?: string
  autoFocus?: boolean
}

interface Suggestion {
  id: string
  name: string
  place_formatted: string
  full_address: string
  coordinates: { longitude: number; latitude: number }
}

export function AddressSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Enter address...",
  autoFocus = false,
}: AddressSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const sessionToken = useRef(crypto.randomUUID())

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?` +
        `q=${encodeURIComponent(query)}` +
        `&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}` +
        `&session_token=${sessionToken.current}` +
        `&country=US` +
        `&types=address,place` +
        `&limit=5`
      )
      const data = await response.json()

      if (data.suggestions) {
        setSuggestions(data.suggestions)
        setIsOpen(true)
      }
    } catch (error) {
      console.error("Address search error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const retrieveAddress = useCallback(async (suggestion: Suggestion) => {
    const addressText = suggestion.full_address || `${suggestion.name}, ${suggestion.place_formatted}`

    try {
      // Try the Mapbox retrieve API first
      const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.id}?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}` +
        `&session_token=${sessionToken.current}`

      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        if (data.features && data.features[0]) {
          const feature = data.features[0]
          const [lng, lat] = feature.geometry.coordinates
          const address = feature.properties.full_address || addressText

          onChange(address)
          onSelect({ address, lat, lng })
          setIsOpen(false)
          setSuggestions([])
          sessionToken.current = crypto.randomUUID()
          return
        }
      }

      // Fallback to geocode API if retrieve fails
      console.log("Retrieve failed, trying geocode API fallback")
      const geocodeRes = await fetch(`/api/geocode?address=${encodeURIComponent(addressText)}`)
      const geocodeData = await geocodeRes.json()

      if (geocodeData.features && geocodeData.features[0]) {
        const feature = geocodeData.features[0]
        const [lng, lat] = feature.center
        const address = feature.place_name || addressText

        onChange(address)
        onSelect({ address, lat, lng })
        setIsOpen(false)
        setSuggestions([])
        sessionToken.current = crypto.randomUUID()
      } else {
        console.error("Both retrieve and geocode APIs failed")
        onChange(addressText)
        setIsOpen(false)
        setSuggestions([])
      }
    } catch (error) {
      console.error("Address retrieve error:", error)
      onChange(addressText)
      setIsOpen(false)
      setSuggestions([])
    }
  }, [onChange, onSelect])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          retrieveAddress(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  const handleClear = () => {
    onChange("")
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    console.log("Suggestion clicked:", suggestion)
    retrieveAddress(suggestion)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={css({ position: "relative", width: "100%" })}>
      <div className={css({ position: "relative" })}>
        <MapPin
          size={18}
          className={css({
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b7280",
            pointerEvents: "none",
          })}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={css({
            width: "100%",
            pl: "11",
            pr: value ? "10" : "4",
            py: "3",
            fontSize: "base",
            border: "1px solid",
            borderColor: "#374151",
            borderRadius: "lg",
            bg: "#1f2937",
            color: "white",
            outline: "none",
            _focus: {
              borderColor: "#0087FF",
              boxShadow: "0 0 0 3px rgba(0, 135, 255, 0.15)",
            },
            _placeholder: { color: "#6b7280" },
          })}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={css({
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              p: "1",
              color: "#6b7280",
              borderRadius: "full",
              cursor: "pointer",
              _hover: { color: "#d1d5db", bg: "#374151" },
            })}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className={css({
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            mt: "1",
            bg: "#1f2937",
            border: "1px solid",
            borderColor: "#374151",
            borderRadius: "lg",
            shadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            zIndex: 50,
            maxHeight: "300px",
            overflowY: "auto",
          })}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSuggestionClick(suggestion)
              }}
              className={css({
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: "3",
                px: "4",
                py: "3",
                textAlign: "left",
                cursor: "pointer",
                bg: index === selectedIndex ? "rgba(0, 135, 255, 0.15)" : "transparent",
                _hover: { bg: "#374151" },
                borderBottom: index < suggestions.length - 1 ? "1px solid" : "none",
                borderColor: "#374151",
              })}
            >
              <MapPin size={16} className={css({ color: "#6b7280", mt: "1", flexShrink: 0 })} />
              <div className={css({ minWidth: 0 })}>
                <div className={css({ fontSize: "sm", fontWeight: "medium", color: "white" })}>
                  {suggestion.name}
                </div>
                {suggestion.place_formatted && (
                  <div className={css({ fontSize: "xs", color: "#9ca3af", mt: "0.5" })}>
                    {suggestion.place_formatted}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div
          className={css({
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            mt: "1",
            py: "3",
            textAlign: "center",
            fontSize: "sm",
            color: "#9ca3af",
            bg: "#1f2937",
            border: "1px solid",
            borderColor: "#374151",
            borderRadius: "lg",
            shadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          })}
        >
          Searching...
        </div>
      )}
    </div>
  )
}
