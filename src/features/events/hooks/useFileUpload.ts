import { useCallback, useState } from 'react'
import { useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'
import { api } from '../../../../convex/_generated/api'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

interface UploadResult {
  storageId: string
}

interface UseFileUploadOptions {
  onSuccess?: (storageId: string) => void
  onError?: (error: Error) => void
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const [uploadProgress, setUploadProgress] = useState<
    'idle' | 'uploading' | 'processing' | 'success' | 'error'
  >('idle')

  const generateUploadUrl = useConvexMutation(
    api.events.files.generateUploadUrl,
  )
  const updateBanner = useConvexMutation(api.events.files.updateBanner)
  const addMediaItem = useConvexMutation(api.events.files.addMediaItem)
  const removeMediaItem = useConvexMutation(api.events.files.removeMediaItem)

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(
          `File size must be less than ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
        )
      }

      setUploadProgress('uploading')

      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl({ contentType: file.type })

      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`)
      }

      const { storageId } = (await result.json()) as UploadResult

      setUploadProgress('success')
      return storageId
    },
    [generateUploadUrl],
  )

  const handleUploadBanner = useCallback(
    async (eventId: string, file: File) => {
      try {
        const storageId = await uploadFile(file)

        // Step 3: Save the storage ID to the event
        await updateBanner({
          eventId: eventId as any,
          bannerImage: storageId,
        })

        options?.onSuccess?.(storageId)
        return storageId
      } catch (error) {
        setUploadProgress('error')
        const message = error instanceof Error ? error.message : 'Upload failed'
        toast.error(message)
        options?.onError?.(error as Error)
        throw error
      }
    },
    [uploadFile, updateBanner, options],
  )

  const handleUploadMedia = useCallback(
    async (eventId: string, file: File) => {
      try {
        const storageId = await uploadFile(file)

        const isVideo = file.type.startsWith('video/')

        // Step 3: Save the storage ID to the event's media
        await addMediaItem({
          eventId: eventId as any,
          url: storageId,
          type: isVideo ? 'video' : 'image',
        })

        options?.onSuccess?.(storageId)
        return storageId
      } catch (error) {
        setUploadProgress('error')
        const message = error instanceof Error ? error.message : 'Upload failed'
        toast.error(message)
        options?.onError?.(error as Error)
        throw error
      }
    },
    [uploadFile, addMediaItem, options],
  )

  const handleRemoveMedia = useCallback(
    async (eventId: string, index: number) => {
      try {
        await removeMediaItem({
          eventId: eventId as any,
          index,
        })
        toast.success('Media removed')
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to remove media'
        toast.error(message)
        options?.onError?.(error as Error)
        throw error
      }
    },
    [removeMediaItem, options],
  )

  const handleSetBannerUrl = useCallback(
    async (eventId: string, url: string) => {
      try {
        await updateBanner({
          eventId: eventId as any,
          bannerImage: url,
        })
        options?.onSuccess?.(url)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to set banner'
        toast.error(message)
        options?.onError?.(error as Error)
        throw error
      }
    },
    [updateBanner, options],
  )

  return {
    uploadFile,
    handleUploadBanner,
    handleUploadMedia,
    handleRemoveMedia,
    handleSetBannerUrl,
    uploadProgress,
    isUploading: uploadProgress === 'uploading',
  }
}
