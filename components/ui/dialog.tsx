"use client"

import { Dialog as ArkDialog } from "@ark-ui/react/dialog"
import { Portal } from "@ark-ui/react/portal"
import { X } from "lucide-react"
import { forwardRef } from "react"
import { styled, type HTMLStyledProps } from "styled-system/jsx"
import { dialog } from "styled-system/recipes"

const styles = dialog()

export const Dialog = ArkDialog.Root
export const DialogTrigger = ArkDialog.Trigger

export const DialogBackdrop = forwardRef<
  HTMLDivElement,
  HTMLStyledProps<"div">
>((props, ref) => (
  <Portal>
    <styled.div ref={ref} className={styles.backdrop} {...props} />
  </Portal>
))

DialogBackdrop.displayName = "DialogBackdrop"

export const DialogPositioner = forwardRef<
  HTMLDivElement,
  HTMLStyledProps<"div">
>((props, ref) => (
  <Portal>
    <ArkDialog.Positioner>
      <styled.div ref={ref} className={styles.positioner} {...props} />
    </ArkDialog.Positioner>
  </Portal>
))

DialogPositioner.displayName = "DialogPositioner"

export const DialogContent = forwardRef<
  HTMLDivElement,
  HTMLStyledProps<"div">
>((props, ref) => (
  <ArkDialog.Content asChild>
    <styled.div ref={ref} className={styles.content} {...props} />
  </ArkDialog.Content>
))

DialogContent.displayName = "DialogContent"

export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  HTMLStyledProps<"h2">
>((props, ref) => (
  <ArkDialog.Title asChild>
    <styled.h2 ref={ref} className={styles.title} {...props} />
  </ArkDialog.Title>
))

DialogTitle.displayName = "DialogTitle"

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLStyledProps<"p">
>((props, ref) => (
  <ArkDialog.Description asChild>
    <styled.p ref={ref} className={styles.description} {...props} />
  </ArkDialog.Description>
))

DialogDescription.displayName = "DialogDescription"

export const DialogCloseTrigger = forwardRef<
  HTMLButtonElement,
  HTMLStyledProps<"button">
>((props, ref) => (
  <ArkDialog.CloseTrigger asChild>
    <styled.button ref={ref} className={styles.closeTrigger} {...props}>
      <X />
    </styled.button>
  </ArkDialog.CloseTrigger>
))

DialogCloseTrigger.displayName = "DialogCloseTrigger"
