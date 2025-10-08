import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
    ]
    const allowedDocTypes = ["application/pdf"]
    const allowedTypes = [...allowedImageTypes, ...allowedDocTypes]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: JPG, PNG, GIF, WebP, SVG, BMP, TIFF, PDF" },
        { status: 400 },
      )
    }

    console.log("[v0] Uploading file:", file.name, "Type:", file.type, "Size:", file.size)

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    console.log("[v0] Upload successful:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed. Please try again." },
      { status: 500 },
    )
  }
}
