export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 50)
}

export function generateUniqueSlug(base: string): string {
  const slug = generateSlug(base)
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${slug}-${randomSuffix}`
}
