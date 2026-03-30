import { useState, useRef } from 'react'
import { Upload, Trash2, Play, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { useFileUpload } from '../hooks/useFileUpload'

export interface MediaItem {
  url: string
  type: 'image' | 'video'
  caption?: string
}

interface MediaGalleryProps {
  open?: boolean
  eventId: string
  media: MediaItem[]
  editable?: boolean
  onClose?: () => void
}

export function MediaGallery({
  open,
  eventId,
  media,
  editable = true,
  onClose,
}: MediaGalleryProps) {
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { handleUploadMedia, handleRemoveMedia, isUploading } = useFileUpload({
    onSuccess: () => {
      // The mutation already added to database, so we just need to trigger a refresh
      // The parent will re-fetch the event and update the list
    },
  })

  const isOpen = open ?? false

  const handleOpenChange = (newOpen: boolean) => {
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
        await handleUploadMedia(eventId, file)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
    e.target.value = ''
  }

  const handleDelete = (index: number) => {
    setItemToDelete(index)
  }

  const confirmDelete = async () => {
    if (itemToDelete !== null && eventId) {
      try {
        await handleRemoveMedia(eventId, itemToDelete)
      } catch (error) {
        console.error('Delete failed:', error)
      }
      setItemToDelete(null)
    }
  }

  const cancelDelete = () => {
    setItemToDelete(null)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Media Gallery</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                {media.map((item, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.caption || `Image ${index + 1}`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-black">
                        <Play className="size-8 text-white" />
                      </div>
                    )}

                    {editable && (
                      <button
                        onClick={() => handleDelete(index)}
                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}

                    <div className="absolute left-2 top-2 rounded-full bg-black/50 p-1">
                      {item.type === 'image' ? (
                        <ImageIcon className="size-3 text-white" />
                      ) : (
                        <Play className="size-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editable && (
              <div className="flex gap-2">
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
                      Add Image / Video
                    </>
                  )}
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onClose?.()}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={itemToDelete !== null} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Media?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the media item from the gallery. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
