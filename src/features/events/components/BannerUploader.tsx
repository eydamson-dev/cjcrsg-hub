import { useState, useRef, useEffect } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface BannerUploaderProps {
  open?: boolean
  bannerImage?: string
  onUpload: (url: string) => void
  onClose?: () => void
}

export function BannerUploader({
  open,
  bannerImage,
  onUpload,
  onClose,
}: BannerUploaderProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState(bannerImage || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setTimeout(() => {
        const mockUrl = URL.createObjectURL(file)
        onUpload(mockUrl)
        setIsUploading(false)
        handleOpenChange(false)
      }, 1000)
    }
    e.target.value = ''
  }

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onUpload(urlValue.trim())
      handleOpenChange(false)
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
              <Upload className="mr-2 size-4" />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              Enter URL
            </Button>
          </div>

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
                <Button size="sm" onClick={handleUrlSubmit}>
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
