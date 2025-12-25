"use client"

import { Tabs as ArkTabs, type TabsRootProps } from "@ark-ui/react/tabs"
import { forwardRef } from "react"
import { css } from "styled-system/css"
import { tabs } from "styled-system/recipes"

const styles = tabs()

export const Tabs = forwardRef<HTMLDivElement, TabsRootProps>((props, ref) => (
  <ArkTabs.Root ref={ref} className={styles.root} {...props} />
))

Tabs.displayName = "Tabs"

export const TabsList = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ArkTabs.List>
>((props, ref) => (
  <ArkTabs.List ref={ref} className={styles.list} {...props} />
))

TabsList.displayName = "TabsList"

export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof ArkTabs.Trigger>
>((props, ref) => (
  <ArkTabs.Trigger ref={ref} className={styles.trigger} {...props} />
))

TabsTrigger.displayName = "TabsTrigger"

export const TabsContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ArkTabs.Content>
>((props, ref) => (
  <ArkTabs.Content ref={ref} className={styles.content} {...props} />
))

TabsContent.displayName = "TabsContent"

export const TabsIndicator = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ArkTabs.Indicator>
>((props, ref) => (
  <ArkTabs.Indicator ref={ref} className={styles.indicator} {...props} />
))

TabsIndicator.displayName = "TabsIndicator"
