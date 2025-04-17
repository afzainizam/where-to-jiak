// components/VideoOverlay.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface VideoOverlayProps {
  urls: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

export default function VideoOverlay({
  urls,
  index,
  onClose,
  onIndexChange,
}: VideoOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // State for dynamic aspect ratio
  const [aspectRatio, setAspectRatio] = useState("16/9");
  // State to track loading
  const [loadingRatio, setLoadingRatio] = useState(true);

  // Whenever the URL changes, fetch its oEmbed metadata
  useEffect(() => {
    let cancelled = false;
    setLoadingRatio(true);
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      urls[index]
    )}&format=json`;
    fetch(oembedUrl)
      .then((res) => res.json())
      .then((json: { width: number; height: number }) => {
        if (cancelled) return;
        const { width, height } = json;
        // Compute gcd to simplify ratio
        const gcd = (a: number, b: number): number =>
          b === 0 ? a : gcd(b, a % b);
        const d = gcd(width, height);
        setAspectRatio(`${width / d}/${height / d}`);
      })
      .catch(() => {
        // On error, just leave it at 16/9
        if (!cancelled) setAspectRatio("16/9");
      })
      .finally(() => {
        if (!cancelled) setLoadingRatio(false);
      });
    return () => {
      cancelled = true;
    };
  }, [urls, index]);

  // Touch‐swipe handling (unchanged)…
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX: number | null = null;
    const onTouchStart = (e: TouchEvent) => (startX = e.touches[0].clientX);
    const onTouchEnd = (e: TouchEvent) => {
      if (startX === null) return;
      const delta = e.changedTouches[0].clientX - startX;
      if (delta > 50 && index > 0) onIndexChange(index - 1);
      if (delta < -50 && index < urls.length - 1) onIndexChange(index + 1);
      startX = null;
    };
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [index, urls.length, onIndexChange]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="
              absolute top-2 right-2 z-20
              bg-white rounded-full p-2
              shadow-md
              text-gray-600 hover:text-gray-900
            "
        >
          <FaTimes size={20} />
        </button>

        {/* Video container with dynamic aspect-ratio */}
        <div
          className="w-full rounded-t-lg bg-black flex items-center justify-center"
          style={{
            // While loading, show a 16/9 placeholder
            aspectRatio: loadingRatio ? "16/9" : aspectRatio,
          }}
        >
          {loadingRatio ? (
            <div className="text-white animate-pulse">Loading video…</div>
          ) : (
            <iframe
               className={`h-full ${aspectRatio === "9/16" ? "w-auto mx-auto" : "w-full"}`}
              src={urls[index].replace("watch?v=", "embed/")}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center items-center gap-2 mt-2">
          {urls.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all ${
                i === index ? "w-4 h-4 bg-blue-600" : "w-2 h-2 bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Clickable chevrons */}
        {urls.length > 1 && (
          <>
            {index > 0 && (
              <button
                onClick={() => onIndexChange(index - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-2xl opacity-75 hover:opacity-100 cursor-pointer z-10"
                title="Previous video"
              >
                <FaChevronLeft />
              </button>
            )}
            {index < urls.length - 1 && (
              <button
                onClick={() => onIndexChange(index + 1)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-2xl opacity-75 hover:opacity-100 cursor-pointer z-10"
                title="Next video"
              >
                <FaChevronRight />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
