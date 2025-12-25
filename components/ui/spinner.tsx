"use client"

import { styled } from "styled-system/jsx"
import { spinner } from "styled-system/recipes"

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
}

export const Spinner = (props: SpinnerProps) => {
  const { size = "md" } = props
  return (
    <styled.div className={spinner({ size })}>
      <styled.div />
      <styled.div />
      <styled.div />
    </styled.div>
  )
}
