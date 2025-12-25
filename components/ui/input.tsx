"use client"

import { forwardRef } from "react"
import { styled, type HTMLStyledProps } from "styled-system/jsx"
import { input } from "styled-system/recipes"

export interface InputProps extends HTMLStyledProps<"input"> {}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <styled.input ref={ref} className={input()} {...props} />
})

Input.displayName = "Input"
