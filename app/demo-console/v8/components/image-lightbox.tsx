"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type GalleryItem = { src: string; alt: string }

type OpenState =
  | { kind: "single"; src: string; alt: string }
  | { kind: "gallery"; items: GalleryItem[]; index: number; title: string }

type ImageLightboxContextValue = {
  openImage: (src: string, alt?: string) => void
  openGallery: (items: GalleryItem[], startIndex?: number, title?: string) => void
}

const ImageLightboxContext = createContext<ImageLightboxContextValue | null>(null)

export function useImageLightbox(): ImageLightboxContextValue {
  const ctx = useContext(ImageLightboxContext)
  if (!ctx) {
    throw new Error("useImageLightbox must be used within ImageLightboxProvider")
  }
  return ctx
}

export function ImageLightboxProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenState | null>(null)

  const close = useCallback(() => setOpen(null), [])

  const openImage = useCallback((src: string, alt = "Image preview") => {
    setOpen({ kind: "single", src, alt })
  }, [])

  const openGallery = useCallback(
    (items: GalleryItem[], startIndex = 0, title = "Gallery") => {
      if (!items.length) return
      const index = Math.min(Math.max(0, startIndex), items.length - 1)
      setOpen({ kind: "gallery", items, index, title })
    },
    []
  )

  const goPrev = useCallback(() => {
    setOpen((prev) => {
      if (!prev || prev.kind !== "gallery" || prev.items.length <= 1) return prev
      const next =
        (prev.index - 1 + prev.items.length) % prev.items.length
      return { ...prev, index: next }
    })
  }, [])

  const goNext = useCallback(() => {
    setOpen((prev) => {
      if (!prev || prev.kind !== "gallery" || prev.items.length <= 1) return prev
      const next = (prev.index + 1) % prev.items.length
      return { ...prev, index: next }
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
        return
      }
      if (open.kind !== "gallery" || open.items.length <= 1) return
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goPrev()
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close, goPrev, goNext])

  const activeSrc = open?.kind === "single" ? open.src : open?.items[open.index]?.src
  const activeAlt =
    open?.kind === "single"
      ? open.alt
      : open?.items[open.index]?.alt ?? "Image"

  const headerLabel =
    open?.kind === "single"
      ? open.alt
      : open
        ? `${open.title} · ${open.index + 1} / ${open.items.length}`
        : ""

  return (
    <ImageLightboxContext.Provider value={{ openImage, openGallery }}>
      {children}
      <AnimatePresence>
        {open && activeSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            style={{ background: "rgba(10, 9, 20, 0.78)", backdropFilter: "blur(6px)" }}
            onClick={close}
            role="presentation"
          >
            <motion.div
              key={open.kind === "gallery" ? `${activeSrc}-${open.index}` : activeSrc}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[min(92vh,900px)] w-[min(1120px,96vw)] flex-col overflow-hidden rounded-[22px] border border-[#2A2640] bg-[#0F1326] shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#23213A] px-5 py-3">
                <p className="truncate pr-4 text-xs font-medium uppercase tracking-[0.08em] text-[#9B97B5]">
                  {headerLabel}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#374151] bg-[#111827] text-xl leading-none text-white hover:bg-[#1f2937]"
                  aria-label="Close preview"
                >
                  ×
                </button>
              </div>
              <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#090D1A] p-4 sm:p-6">
                <Image
                  src={activeSrc}
                  alt={activeAlt}
                  width={1920}
                  height={1080}
                  className="h-auto max-h-[min(75vh,720px)] w-auto max-w-full object-contain"
                />
                {open.kind === "gallery" && open.items.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        goPrev()
                      }}
                      className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#374151] bg-[#111827]/90 text-white hover:bg-[#1f2937] sm:left-4"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        goNext()
                      }}
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#374151] bg-[#111827]/90 text-white hover:bg-[#1f2937] sm:right-4"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              {open.kind === "gallery" && open.items.length > 1 && (
                <div className="shrink-0 border-t border-[#23213A] px-5 py-2.5 text-center text-[11px] text-[#6D6A84]">
                  Use arrow keys or buttons to browse · {open.index + 1} of{" "}
                  {open.items.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ImageLightboxContext.Provider>
  )
}
