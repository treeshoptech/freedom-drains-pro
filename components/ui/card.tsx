"use client"

import { ark } from "@ark-ui/react/factory"
import { styled, type HTMLStyledProps } from "styled-system/jsx"
import { card } from "styled-system/recipes"

const StyledCard = styled(ark.div, card)

export interface CardProps extends HTMLStyledProps<"div"> {}

export const Card = (props: CardProps) => {
  return <StyledCard {...props} />
}

export const CardHeader = styled(ark.div, {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1",
    p: "6",
  },
})

export const CardTitle = styled(ark.h3, {
  base: {
    textStyle: "lg",
    fontWeight: "semibold",
  },
})

export const CardDescription = styled(ark.p, {
  base: {
    textStyle: "sm",
    color: "fg.muted",
  },
})

export const CardContent = styled(ark.div, {
  base: {
    p: "6",
    pt: "0",
  },
})

export const CardFooter = styled(ark.div, {
  base: {
    display: "flex",
    alignItems: "center",
    p: "6",
    pt: "0",
  },
})
