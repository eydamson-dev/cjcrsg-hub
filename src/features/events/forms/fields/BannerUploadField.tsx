import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { Upload, Image as ImageIcon, Loader2, Link2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useFormContext } from 'react-hook-form'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useFileUpload } from '../../hooks/useFileUpload'
import { isValidImageUrl } from '../schemas/eventSchemas'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

interface BannerUploadFieldProps {
  name?: string
  label?: string
  eventId?: string
  mode?: 'create' | 'edit'
}

export interface BannerUploadFieldRef {
  uploadPendingFile: () => Promise<string | undefined>
  clearPendingFile: () => void
  getPendingFile: () => File | null
}

export const BannerUploadField = forwardRef<
  BannerUploadFieldRef,
  BannerUploadFieldProps
>(function BannerUploadField(
  { name = 'bannerImage', label = 'Banner Image', eventId, mode = 'edit' },
  ref,
) {
  const { setValue, watch } = useFormContext()
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentValue = watch(name)
  const { handleUploadBanner, handleSetBannerUrl, isUploading } = useFileUpload(
    {
      onSuccess: () => {},
    },
  )

  useImperativeHandle(ref, () => ({
    uploadPendingFile: async () => {
      if (pendingFile && eventId) {
        try {
          const url = await handleUploadBanner(eventId, pendingFile)
          setValue(name, url)
          setPendingFile(null)
          if (pendingPreviewUrl) {
            URL.revokeObjectURL(pendingPreviewUrl)
            setPendingPreviewUrl(null)
          }
          return url
        } catch (error) {
          console.error('Upload failed:', error)
          toast.error('Failed to upload banner')
          return undefined
        }
      }
      return undefined
    },
    clearPendingFile: () => {
      setPendingFile(null)
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl)
        setPendingPreviewUrl(null)
      }
    },
    getPendingFile: () => pendingFile,
  }))

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (mode === 'create') return

      if (!eventId || isUploading) return

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
              } catch (error) {
                toast.error('Failed to upload image')
              }
              return
            }
          }
        }
      }

      const text = e.clipboardData?.getData('text')
      if (text && eventId) {
        const trimmed = text.trim()
        if (isValidImageUrl(trimmed)) {
          e.preventDefault()
          try {
            await handleSetBannerUrl(eventId, trimmed)
            toast.success('Banner URL set successfully')
          } catch (error) {
            toast.error('Failed to set banner URL')
          }
        }
      }
    },
    [eventId, isUploading, handleUploadBanner, handleSetBannerUrl, mode],
  )

  useEffect(() => {
    if (mode === 'edit') {
      window.addEventListener('paste', handlePaste)
      return () => window.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste, mode])

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(
        `File size must be less than ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
      )
      e.target.value = ''
      return
    }

    if (mode === 'create') {
      const objectUrl = URL.createObjectURL(file)
      setPendingFile(file)
      setPendingPreviewUrl(objectUrl)
      setValue(name, objectUrl)
    } else if (eventId) {
      handleUploadBanner(eventId, file)
    }
    e.target.value = ''
  }

  const handleUrlSubmit = async () => {
    if (!urlValue.trim()) return

    if (mode === 'create') {
      setValue(name, urlValue.trim())
      setShowUrlInput(false)
      setUrlValue('')
    } else if (eventId) {
      try {
        await handleSetBannerUrl(eventId, urlValue.trim())
        setShowUrlInput(false)
        setUrlValue('')
      } catch (error) {
        console.error('Failed to set URL:', error)
      }
    }
  }

  const handleRemove = () => {
    setValue(name, undefined)
    if (pendingFile && pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl)
      setPendingFile(null)
      setPendingPreviewUrl(null)
    }
  }

  const displayUrl = pendingPreviewUrl || currentValue

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {displayUrl ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border bg-muted">
          <img
            src={displayUrl}
            alt="Event banner"
            className="size-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          className="flex aspect-[21/9] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted cursor-pointer"
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

      {mode === 'create' && (
        <p className="text-xs text-muted-foreground">
          Banner will be uploaded when you save the event
        </p>
      )}
      {mode === 'edit' && (
        <p className="text-xs text-muted-foreground">
          Tip: Press{' '}
          <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Ctrl</kbd> +{' '}
          <kbd className="px-1 py-0.5 rounded bg-muted text-xs">V</kbd> to paste
          an image or URL
        </p>
      )}

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
  )
})
