"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { css } from "styled-system/css"
import { Loader2, Droplets } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div
      className={css({
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bg: "#000000",
        backgroundImage: "radial-gradient(ellipse at top, #111827 0%, #000000 50%)",
        p: "4",
      })}
    >
      <div
        className={css({
          w: "full",
          maxW: "400px",
          bg: "#111827",
          border: "1px solid",
          borderColor: "rgba(0, 135, 255, 0.2)",
          borderRadius: "xl",
          p: "8",
          boxShadow: "0 0 40px rgba(0, 135, 255, 0.1)",
        })}
      >
        {/* Logo */}
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: "8",
          })}
        >
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              w: "16",
              h: "16",
              bg: "linear-gradient(135deg, #0087FF 0%, #006ecc 100%)",
              borderRadius: "xl",
              mb: "4",
              boxShadow: "0 4px 20px rgba(0, 135, 255, 0.3)",
            })}
          >
            <Droplets size={32} color="white" />
          </div>
          <h1
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              color: "white",
              mb: "1",
            })}
          >
            Freedom Drains Pro
          </h1>
          <p
            className={css({
              fontSize: "sm",
              color: "#9ca3af",
            })}
          >
            Professional Drainage Design Tool
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {error && (
            <div
              className={css({
                mb: "4",
                p: "3",
                bg: "rgba(239, 68, 68, 0.1)",
                border: "1px solid",
                borderColor: "rgba(239, 68, 68, 0.3)",
                borderRadius: "lg",
                color: "#ef4444",
                fontSize: "sm",
              })}
            >
              {error}
            </div>
          )}

          <div className={css({ mb: "4" })}>
            <label
              htmlFor="email"
              className={css({
                display: "block",
                mb: "2",
                fontSize: "sm",
                fontWeight: "medium",
                color: "#d1d5db",
              })}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={css({
                w: "full",
                px: "4",
                py: "3",
                bg: "#1f2937",
                border: "1px solid",
                borderColor: "#374151",
                borderRadius: "lg",
                color: "white",
                fontSize: "sm",
                outline: "none",
                transition: "border-color 0.2s",
                _placeholder: { color: "#6b7280" },
                _focus: { borderColor: "#0087FF" },
              })}
              placeholder="you@example.com"
            />
          </div>

          <div className={css({ mb: "6" })}>
            <label
              htmlFor="password"
              className={css({
                display: "block",
                mb: "2",
                fontSize: "sm",
                fontWeight: "medium",
                color: "#d1d5db",
              })}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={css({
                w: "full",
                px: "4",
                py: "3",
                bg: "#1f2937",
                border: "1px solid",
                borderColor: "#374151",
                borderRadius: "lg",
                color: "white",
                fontSize: "sm",
                outline: "none",
                transition: "border-color 0.2s",
                _placeholder: { color: "#6b7280" },
                _focus: { borderColor: "#0087FF" },
              })}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={css({
              w: "full",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2",
              px: "4",
              py: "3",
              bg: "#0087FF",
              color: "white",
              fontWeight: "semibold",
              fontSize: "sm",
              borderRadius: "lg",
              cursor: "pointer",
              transition: "all 0.2s",
              _hover: { bg: "#006ecc" },
              _disabled: { opacity: 0.5, cursor: "not-allowed" },
            })}
          >
            {isLoading && (
              <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
            )}
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div
          className={css({
            mt: "8",
            pt: "6",
            borderTop: "1px solid",
            borderColor: "#374151",
            textAlign: "center",
          })}
        >
          <p className={css({ fontSize: "xs", color: "#6b7280" })}>
            Powered by{" "}
            <a
              href="https://treeshop.app"
              target="_blank"
              rel="noopener noreferrer"
              className={css({
                color: "#0087FF",
                textDecoration: "none",
                _hover: { textDecoration: "underline" },
              })}
            >
              TreeShop
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bg: "#000000",
          })}
        >
          <Loader2 size={32} className={css({ animation: "spin 1s linear infinite", color: "#0087FF" })} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
