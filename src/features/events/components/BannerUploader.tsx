import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Image as ImageIcon, Loader2, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useFileUpload } from '../hooks/useFileUpload'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

function isValidImageUrl(url: string): boolean {
  if (url.startsWith('data:image/')) return true
  if (url.startsWith('blob:')) return true
  if (url.startsWith('http://') || url.startsWith('https://')) return true
  return false
}

interface BannerUploaderProps {
  open?: boolean
  eventId: string
  bannerImage?: string
  onClose?: () => void
}

export function BannerUploader({
  open,
  eventId,
  bannerImage,
  onClose,
}: BannerUploaderProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { handleUploadBanner, handleSetBannerUrl, isUploading } = useFileUpload(
    {
      onSuccess: () => {
        // The mutation already updated the database
      },
    },
  )

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!eventId || isUploading) return

      // Handle image files from clipboard
      const items = e.clipboardData?.items
      if (items) {
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            e.preventDefault()
            const file = item.getAsFile()
            if (file) {
              if (file.size > MAX_FILE_SIZE_BYTES) {
                toast.error(
                  `File size must be less than ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
                )
                return
              }
              try {
                await handleUploadBanner(eventId, file)
                toast.success('Banner uploaded successfully')
                handleOpenChange(false)
              } catch (error) {
                toast.error('Failed to upload image')
              }
              return
            }
          }
        }
      }

      // Handle text - check if it's an image URL
      const text = e.clipboardData?.getData('text')
      if (text && eventId) {
        const trimmed = text.trim()
        if (isValidImageUrl(trimmed)) {
          e.preventDefault()
          try {
            await handleSetBannerUrl(eventId, trimmed)
            toast.success('Banner URL set successfully')
            handleOpenChange(false)
          } catch (error) {
            toast.error('Failed to set banner URL')
          }
          return
        }
      }
    },
    [eventId, isUploading, handleUploadBanner, handleSetBannerUrl],
  )

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  useEffect(() => {
    if (isOpen) {
      setShowUrlInput(false)
      setUrlValue(bannerImage || '')
    }
  }, [isOpen, bannerImage])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('paste', handlePaste)
      return () => window.removeEventListener('paste', handlePaste)
    }
  }, [isOpen, handlePaste])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && eventId) {
      try {
        await handleUploadBanner(eventId, file)
        handleOpenChange(false)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
    e.target.value = ''
  }

  const handleUrlSubmit = async () => {
    if (urlValue.trim() && eventId) {
      try {
        await handleSetBannerUrl(eventId, urlValue.trim())
        handleOpenChange(false)
      } catch (error) {
        console.error('Failed to set URL:', error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Banner Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {bannerImage ? (
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border bg-muted">
              <img
                src={bannerImage}
                alt="Event banner"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div
              className="flex aspect-[21/9] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted"
              onClick={handleFileClick}
            >
              <ImageIcon className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                No banner uploaded
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFileClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Upload Image
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <Link2 className="mr-2 size-4" />
              Enter URL
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Press{' '}
            <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Ctrl</kbd> +{' '}
            <kbd className="px-1 py-0.5 rounded bg-muted text-xs">V</kbd> to
            paste an image or URL
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {showUrlInput && (
            <div className="space-y-2 rounded-lg border p-4">
              <Label htmlFor="bannerUrl">Banner Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="bannerUrl"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleUrlSubmit}
                  disabled={!urlValue.trim()}
                >
                  Set
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
