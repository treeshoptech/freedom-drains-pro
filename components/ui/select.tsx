"use client"

import { Select as ArkSelect } from "@ark-ui/react/select"
import { Portal } from "@ark-ui/react/portal"
import { Check, ChevronDown } from "lucide-react"
import { forwardRef } from "react"
import { styled, type HTMLStyledProps } from "styled-system/jsx"
import { select } from "styled-system/recipes"

const styles = select()

export const Select = ArkSelect.Root
export const SelectValue = ArkSelect.ValueText
export const SelectItemGroup = ArkSelect.ItemGroup
export const SelectItemGroupLabel = ArkSelect.ItemGroupLabel

export const SelectTrigger = forwardRef<
  HTMLButtonElement,
  HTMLStyledProps<"button">
>((props, ref) => (
  <ArkSelect.Control>
    <ArkSelect.Trigger asChild>
      <styled.button ref={ref} className={styles.trigger} {...props}>
        <ArkSelect.ValueText />
        <ChevronDown />
      </styled.button>
    </ArkSelect.Trigger>
  </ArkSelect.Control>
))

SelectTrigger.displayName = "SelectTrigger"

export const SelectContent = forwardRef<
  HTMLDivElement,
  HTMLStyledProps<"div">
>((props, ref) => (
  <Portal>
    <ArkSelect.Positioner>
      <ArkSelect.Content asChild>
        <styled.div ref={ref} className={styles.content} {...props} />
      </ArkSelect.Content>
    </ArkSelect.Positioner>
  </Portal>
))

SelectContent.displayName = "SelectContent"

export const SelectItem = forwardRef<
  HTMLDivElement,
  HTMLStyledProps<"div"> & { value: string }
>((props, ref) => {
  const { children, value, ...rest } = props
  return (
    <ArkSelect.Item item={value} asChild>
      <styled.div ref={ref} className={styles.item} {...rest}>
        <ArkSelect.ItemText>{children}</ArkSelect.ItemText>
        <ArkSelect.ItemIndicator>
          <Check />
        </ArkSelect.ItemIndicator>
      </styled.div>
    </ArkSelect.Item>
  )
})

SelectItem.displayName = "SelectItem"

export const SelectLabel = forwardRef<
  HTMLLabelElement,
  HTMLStyledProps<"label">
>((props, ref) => (
  <ArkSelect.Label asChild>
    <styled.label ref={ref} className={styles.label} {...props} />
  </ArkSelect.Label>
))

SelectLabel.displayName = "SelectLabel"
