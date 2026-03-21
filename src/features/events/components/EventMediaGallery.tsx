import { useState } from 'react'
import { Play, Expand } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Sheet, SheetContent } from '~/components/ui/sheet'
import type { Event } from '../types'

interface EventMediaGalleryProps {
  event: Event
}

export function EventMediaGallery({ event }: EventMediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<number>(0)

  const media = event.media || []
  const displayMedia = media.slice(0, 6)
  const hasMore = media.length > 6

  if (media.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setSelectedMedia(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Media Gallery ({media.length})
          </h2>
          {hasMore && (
            <Button variant="ghost" size="sm">
              <Expand className="mr-1 size-4" />
              Expand
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {displayMedia.map((item, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              <img
                src={item.url}
                alt={item.caption || `Media ${index + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="size-8 fill-white text-white" />
                </div>
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="truncate text-xs text-white">{item.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Sheet open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <SheetContent className="flex flex-col p-0 sm:max-w-2xl">
          <div className="relative flex h-full max-h-[70vh] items-center justify-center">
            <img
              src={media[selectedMedia]?.url}
              alt={
                media[selectedMedia]?.caption || `Media ${selectedMedia + 1}`
              }
              className="max-h-full max-w-full object-contain"
            />
          </div>
          {media[selectedMedia]?.caption && (
            <div className="border-t p-4">
              <p className="text-sm text-muted-foreground">
                {media[selectedMedia].caption}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
