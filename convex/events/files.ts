import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { Id } from '../_generated/dataModel'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * Generate a short-lived upload URL for file storage.
 * The URL expires in 1 hour.
 * No authentication required (uses app-level auth).
 */
export const generateUploadUrl = mutation({
  args: {
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Add a media item to an event's media gallery.
 * Accepts either an external URL or a Convex storage ID.
 * - External URLs: validated to be http(s) URLs
 * - Storage IDs: validated as Convex storage IDs (v.id("_storage"))
 * Max file size: 10MB (enforced client-side before upload)
 */
export const addMediaItem = mutation({
  args: {
    eventId: v.id('events'),
    url: v.string(), // Either external URL or storage ID
    type: v.union(v.literal('image'), v.literal('video')),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Validate the URL - accept external URLs or Convex storage IDs
    const url = args.url.trim()
    if (!isValidMediaUrl(url)) {
      throw new Error(
        'Invalid media URL. Must be a valid image/video file URL, data URI, or storage ID.',
      )
    }

    const media = event.media || []
    media.push({
      url: args.url,
      type: args.type,
      caption: args.caption,
    })

    await ctx.db.patch(args.eventId, {
      media,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Remove a media item from an event's media gallery by index.
 */
export const removeMediaItem = mutation({
  args: {
    eventId: v.id('events'),
    index: v.number(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    const media = event.media || []
    if (args.index < 0 || args.index >= media.length) {
      throw new Error('Invalid media index')
    }

    media.splice(args.index, 1)

    await ctx.db.patch(args.eventId, {
      media,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Update banner image for an event.
 * Accepts either an external URL or a Convex storage ID.
 */
export const updateBanner = mutation({
  args: {
    eventId: v.id('events'),
    bannerImage: v.string(), // Either external URL or storage ID (can be empty to remove)
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Allow empty string to remove banner
    if (args.bannerImage !== '' && !isValidMediaUrl(args.bannerImage)) {
      throw new Error(
        'Invalid banner image URL. Must be a valid image file URL, data URI, or storage ID.',
      )
    }

    await ctx.db.patch(args.eventId, {
      bannerImage: args.bannerImage || undefined,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Get a file URL from a Convex storage ID.
 * Returns null if the storage ID is invalid or the file doesn't exist.
 */
export const getFileUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if it's a storage ID (Convex storage IDs start with specific patterns)
    if (isConvexStorageId(args.storageId)) {
      try {
        const url = await ctx.storage.getUrl(args.storageId as Id<'_storage'>)
        return url
      } catch {
        return null
      }
    }
    // If it's not a storage ID, return null (caller should use the URL as-is)
    return null
  },
})

/**
 * Helper to validate media URLs.
 * Accepts:
 * - External URLs (http://, https://)
 * - Data URIs (data:image/..., data:video/...)
 * - Blob URLs (blob:) - for temporary local uploads
 * - Convex storage IDs
 */
function isValidMediaUrl(url: string): boolean {
  if (url.startsWith('data:')) return true
  if (url.startsWith('blob:')) return true
  if (url.startsWith('http://') || url.startsWith('https://')) return true
  if (isConvexStorageId(url)) return true
  return false
}

/**
 * Check if a string looks like a Convex storage ID.
 * Convex storage IDs are typically 20+ character alphanumeric strings.
 */
function isConvexStorageId(id: string): boolean {
  // Convex storage IDs are typically 20+ chars, alphanumeric with some special chars
  // Common format: kg2e8j3n... or similar
  return /^[a-z0-9]{20,}$/i.test(id)
}
