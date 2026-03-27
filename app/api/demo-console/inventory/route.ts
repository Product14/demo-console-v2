import { NextResponse } from "next/server"

const SEARCH_URL = "https://api.spyne.ai/inventory/internal/v3/conversational/search-v2"

const SEARCH_PAYLOAD = {
  enterpriseId: "21de286e9",
  teamId: "5895de05b",
  make: ["BMW"],
  year: [2022, 2022],
  carType: ["SUV"],
  priceRange: [16830, 20570],
}

const FALLBACK_BEARER_TOKEN =
  "eyJhdXRoS2V5IjoiZmNhMTRlMDctYTUyMC00Mjc3LTlhMTUtYTVkNmVjMTg5NTNmIiwiZGV2aWNlSWQiOiJkZTRlNDg4M2E1ZTA4NWJjMjkyYmY4ODY0MzQ2NmNjNSIsImVudGVycHJpc2VfaWQiOiIyMzRhMjA5MzQiLCJ0ZWFtX2lkIjoiNTk1ZWQ1Njk5MyJ9"

interface NormalizedVehicle {
  id: string
  title: string
  vin: string
  year: number | null
  make: string
  model: string
  inputImage: string
  outputImage: string
}

function pickFirstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

function normalizeVehicle(item: unknown): NormalizedVehicle | null {
  if (!item || typeof item !== "object") return null
  const record = item as Record<string, unknown>

  const make = pickFirstString(record, ["make"])
  const model = pickFirstString(record, ["model"])
  const trim = pickFirstString(record, ["trim"])
  const vin = pickFirstString(record, ["vin"])
  const inputImage = pickFirstString(record, ["thumbnail_input_url"])
  const outputImage = pickFirstString(record, ["thumbnail_output_url"])

  const yearValue = record.year
  const year = typeof yearValue === "number" ? yearValue : Number(yearValue ?? 0)

  const titleParts = [Number.isFinite(year) && year > 0 ? String(year) : "", make, model, trim !== "-" ? trim : ""].filter(Boolean)
  const title = titleParts.join(" ") || "Inventory Vehicle"

  return {
    id: pickFirstString(record, ["id", "dealerVinId", "vin"]) || `vehicle-${Math.random().toString(16).slice(2)}`,
    title,
    vin,
    year: Number.isFinite(year) ? year : null,
    make,
    model,
    inputImage,
    outputImage,
  }
}

export async function GET() {
  try {
    const bearerToken = process.env.SPYNE_CONVERSATIONAL_SEARCH_TOKEN ?? FALLBACK_BEARER_TOKEN

    const response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(SEARCH_PAYLOAD),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Inventory API request failed", status: response.status },
        { status: response.status }
      )
    }

    const data = (await response.json()) as {
      vehicles?: unknown
      suggestions?: unknown
    }

    const vehicles = Array.isArray(data.vehicles) ? data.vehicles : []
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : []
    const merged = [...vehicles, ...suggestions]
    const normalized = merged
      .map(normalizeVehicle)
      .filter((item): item is NormalizedVehicle => item !== null)

    const primary = normalized[0] ?? null
    const gallery = normalized
      .flatMap((item) => [item.inputImage, item.outputImage])
      .filter((url): url is string => Boolean(url))
      .slice(0, 10)

    return NextResponse.json({ vehicle: primary, gallery })
  } catch {
    return NextResponse.json({ error: "Unable to load inventory" }, { status: 500 })
  }
}
