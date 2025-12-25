"use client"

import { forwardRef } from "react"
import { ark } from "@ark-ui/react/factory"
import { styled, type HTMLStyledProps } from "styled-system/jsx"
import { button } from "styled-system/recipes"
import { Spinner } from "./spinner"

export interface ButtonProps extends HTMLStyledProps<"button"> {
  loading?: boolean
  loadingText?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { loading, disabled, loadingText, children, ...rest } = props
    const trulyDisabled = loading || disabled

    return (
      <styled.button
        ref={ref}
        disabled={trulyDisabled}
        className={button()}
        {...rest}
      >
        {loading && !loadingText ? (
          <>
            <Spinner size="sm" />
            <styled.span opacity={0}>{children}</styled.span>
          </>
        ) : loadingText ? (
          loadingText
        ) : (
          children
        )}
      </styled.button>
    )
  }
)

Button.displayName = "Button"
