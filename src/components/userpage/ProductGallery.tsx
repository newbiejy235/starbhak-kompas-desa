"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
  VideoIcon,
} from "lucide-react";
import { formatImage } from "@/components/shared/States";

interface ProductGalleryProps {
  primaryImage?: string | null;
  images?: string[] | null;
  videoUrl?: string | null;
  productName?: string;
}

type MediaType = "image" | "video";

interface GalleryItem {
  type: MediaType;
  url: string;
}

export default function ProductGallery({
  primaryImage,
  images = [],
  videoUrl,
  productName = "Produk",
}: ProductGalleryProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const allItems: GalleryItem[] = useMemo(() => {
    const items: GalleryItem[] = [];

    if (images && images.length > 0) {
      images.forEach((url) => {
        if (url) items.push({ type: "image", url });
      });
    }

    if (primaryImage && !items.some((i) => i.url === primaryImage)) {
      items.unshift({ type: "image", url: primaryImage });
    }

    if (videoUrl) {
      items.push({ type: "video", url: videoUrl });
    }

    return items;
  }, [primaryImage, images, videoUrl]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const selectedItem = allItems[selectedIndex] ?? allItems[0];

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < allItems.length) {
        setSelectedIndex(index);
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    },
    [allItems.length],
  );

  const goPrev = useCallback(() => {
    goTo(selectedIndex - 1);
  }, [goTo, selectedIndex]);

  const goNext = useCallback(() => {
    goTo(selectedIndex + 1);
  }, [goTo, selectedIndex]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (Math.abs(diff) < minSwipeDistance) return;
    if (diff > 0) {
      goTo(selectedIndex + 1);
    } else {
      goTo(selectedIndex - 1);
    }
  }, [goTo, selectedIndex]);

  if (allItems.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center rounded-xl">
        <span className="text-8xl font-black text-white/90">
          {productName?.charAt(0)?.toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden group">
          {selectedItem?.type === "video" ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={selectedItem.url}
                className="w-full h-full object-cover"
                muted={isMuted}
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  {isPlaying ? (
                    <Pause size={28} className="text-primary" />
                  ) : (
                    <Play size={28} className="text-primary ml-1" fill="currentColor" />
                  )}
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <Maximize size={14} />
                </button>
              </div>

              <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
                <VideoIcon size={12} />
                Video
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
            >
              {formatImage(selectedItem?.url) ? (
                <Image
                  src={formatImage(selectedItem.url)!}
                  alt={productName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-smooth"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <span className="text-8xl font-black text-white/90">
                    {productName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {allItems.length > 1 && (
            <>
              <button
                onClick={goPrev}
                disabled={selectedIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-700 hover:bg-white transition-colors disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover:opacity-100 shadow-md"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNext}
                disabled={selectedIndex === allItems.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-700 hover:bg-white transition-colors disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover:opacity-100 shadow-md"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {allItems.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allItems.map((item, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`
                  relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 shrink-0
                  transition-all duration-200
                  ${
                    index === selectedIndex
                      ? "border-primary shadow-md scale-105"
                      : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                  }
                `}
              >
                {item.type === "video" ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play size={14} className="text-white" fill="currentColor" />
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt={`${productName} ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setShowLightbox(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X size={20} />
          </button>

          {allItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(selectedIndex > 0 ? selectedIndex - 1 : allItems.length - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(selectedIndex < allItems.length - 1 ? selectedIndex + 1 : 0);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-5xl max-h-[90vh] p-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem?.type === "video" ? (
              <video
                src={selectedItem.url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
              />
            ) : formatImage(selectedItem?.url) ? (
              <Image
                src={formatImage(selectedItem.url)!}
                alt={productName}
                fill
                sizes="100vw"
                className="object-contain"
              />
            ) : null}
          </div>

          {allItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-medium px-3 py-1.5 rounded-full">
              {selectedIndex + 1} / {allItems.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
