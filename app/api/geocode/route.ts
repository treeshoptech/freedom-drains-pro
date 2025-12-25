import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 })
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${token}&country=US&types=address`

  const res = await fetch(url)
  const data = await res.json()

  return NextResponse.json(data)
}
