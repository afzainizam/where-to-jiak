// EateryCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { GiKnifeFork } from "react-icons/gi";
import { FaGlobe, FaYoutube } from "react-icons/fa";
import type { Eatery } from "@/types/mall";
import TruncatedName from "@/components/TruncatedName";
import VideoOverlay from "@/components/VideoOverlay";


// Helper function to check if a logo URL is valid
function isInvalidLogo(url: string | undefined): boolean {
  if (!url) return true;
  return (
    url.includes("restaurant-71") ||
    url.includes("localhost") ||
    url.includes("default") ||
    url.includes("placeholder")
  );
}

// Helper function to get today’s opening hours from an array of strings
function getTodayOpeningHours(hours: string[]): string {
  const today = new Date().getDay(); // Sunday = 0, Monday = 1, etc.
  const index = today === 0 ? 6 : today - 1;
  return hours[index] || "Hours not available";
}

// Helper: detect if device is iOS
const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

interface EateryCardProps {
  eatery: Eatery;
  bgIndex?: number;           // Optional background image index.
  headerTitle?: string;       // Optional header for landing page.
  onMore?: () => void;        // Optional "More" callback.
}

const EateryCard: React.FC<EateryCardProps> = ({
  eatery,
  bgIndex = 1,
  headerTitle,
  onMore,
}) => {
  // ─── Video Overlay State ─────────────────────────────────────────
  const [showVideo, setShowVideo] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);

  // ─── Process "Best foods" ────────────────────────────────────────
  const bestFoodsData =
    eatery.summary && (
      (eatery.summary as any)["Best foods"] ??
      (eatery.summary as any)["Best_foods"]
    ) || null;
  const bestFoodsArray: string[] = bestFoodsData
    ? Array.isArray(bestFoodsData)
      ? bestFoodsData.map((food: string) => food.trim()).filter((f) => f)
      : typeof bestFoodsData === "string"
      ? bestFoodsData
          .split(",")
          .map((food: string) => food.trim())
          .filter((f) => f)
      : []
    : [];

  // ─── Maps URL State ───────────────────────────────────────────────
  const [mapsUrl, setMapsUrl] = useState<string>("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lat = eatery.location?.lat;
    const lng = eatery.location?.lng;
    const isMobile = window.innerWidth < 768;
    if (isIOS() && lat && lng) {
      setMapsUrl(
        `comgooglemaps://?q=${encodeURIComponent(
          eatery.name
        )}&center=${lat},${lng}`
      );
    } else if (isMobile && lat && lng) {
      setMapsUrl(
        `geo:${lat},${lng}?q=${encodeURIComponent(eatery.name)}`
      );
    } else {
      setMapsUrl(
        `https://www.google.com/maps/place/?q=place_id:${eatery.id}`
      );
    }
  }, [eatery]);

  return (
    <div className="p-4">
      <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg bg-black max-h-[600px] overflow-y-auto">
        {/* Optional Header */}
        {headerTitle && onMore && (
          <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <div className="text-lg font-bold">{headerTitle}</div>
            <button
              onClick={onMore}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              More at the same mall
            </button>
          </div>
        )}

        {/* Image + Icons */}
        <div className="relative w-full h-52">
          <img
            src={`/eatery-bg/bg${bgIndex}.jpg`}
            alt="Background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.8)] z-10" />
          {/* Logo & YouTube buttons */}
          <div className="absolute top-2 right-2 z-30 flex flex-col gap-1">
            {/* Website / Logo */}
          <div className="bg-white w-8 h-8 p-1 rounded-xl shadow flex items-center justify-center overflow-hidden">
              {eatery.website ? (
                isInvalidLogo(eatery.logo_url) ? (
                  <a
                    href={eatery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit website"
                  >
                    <FaGlobe className="w-full h-full text-gray-800" />
                  </a>
                ) : (
                  <a
                    href={eatery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit website"
                  >
                    <img
                      src={eatery.logo_url}
                      alt={eatery.name}
                      className="max-w-full max-h-full object-contain rounded block"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />
                  </a>
                )
              ) : isInvalidLogo(eatery.logo_url) ? (
              <FaGlobe className="w-full h-full text-gray-400" />
              ) : (
                <img
                  src={eatery.logo_url}
                  alt={eatery.name}
                  className="max-w-full max-h-full object-contain rounded block"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                />
              )}
            </div>
            {/* YouTube button */}
            {(eatery["youtube url"]?.length ?? 0) > 0 && (
              <button
                onClick={() => setShowVideo(true)}
                title="Watch video review"
                className="w-8 h-8 p-1 rounded-xl shadow flex items-center justify-center overflow-hidden"
              >
                <FaYoutube className="w-full h-full text-red-600" />
              </button>
            )}
          </div>

          {/* Text Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 text-white text-sm gap-1">
            <h2 className="text-base font-bold">
              <TruncatedName fullName={eatery.name} maxLength={25} />
            </h2>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:underline inline-block"
            >
              ⭐ {eatery.rating}{" "}
              <span className="text-xs bg-gray-700 text-white rounded px-2 py-0.5">
                {eatery.total_reviews} reviews
              </span>
            </a>
            <p className="text-sm">
              📍 Level {eatery.floor}-#{eatery.unit}
            </p>
            <p className="flex items-center gap-1">
              <GiKnifeFork /> {eatery.cuisine_type}
              {eatery.halal && (
                <span className="bg-green-600 text-white text-xs px-2 rounded">
                  Halal
                </span>
              )}
            </p>
            {bestFoodsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {bestFoodsArray.slice(0, 2).map((food, i) => (
                  <span
                    key={i}
                    className="bg-yellow-700 rounded-full px-2 py-0.5 text-sm"
                  >
                    👍 {food}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hours */}
        {eatery.hours && eatery.hours.length > 0 && (
          <div className="text-sm text-gray-300 mt-2 p-2">
            <p className="flex items-center gap-1">
              <span className="font-medium text-white">🕒 Today:</span>{" "}
              {getTodayOpeningHours(eatery.hours)}
            </p>
            <details className="mt-1 text-gray-400">
              <summary className="cursor-pointer hover:text-gray-200 text-xs">
                Show full week
              </summary>
              <ul className="text-xs mt-1 pl-2 list-disc">
                {eatery.hours.map((day, idx) => (
                  <li key={idx}>{day}</li>
                ))}
              </ul>
            </details>
          </div>
        )}

        {/* Summary */}
        <div className="p-3">
          <p className="italic text-gray-400 text-sm">
            "{eatery.summary?.one_liner}"
          </p>
          {eatery.summary?.common_themes && (
            <details className="text-gray-400 mt-2 text-sm">
              <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                ➤ More...
              </summary>
              <p className="mt-1">
                <strong className="text-yellow-400">Common Themes:</strong>{" "}
                {Array.isArray(eatery.summary.common_themes)
                  ? eatery.summary.common_themes.join(", ")
                  : eatery.summary.common_themes}
              </p>
              <p>
                <strong className="text-yellow-400">Most Mentioned:</strong>{" "}
                {Array.isArray(eatery.summary.most_mentioned)
                  ? eatery.summary.most_mentioned.join(", ")
                  : eatery.summary.most_mentioned}
              </p>
              <p>
                <strong className="text-yellow-400">Biggest Complaint:</strong>{" "}
                {eatery.summary.biggest_complaint}
              </p>
            </details>
          )}
        </div>
      </div>

      {/* Video Overlay */}
      {showVideo && (
        <VideoOverlay
          urls={eatery["youtube url"] ?? []}
          index={videoIndex}
          onClose={() => setShowVideo(false)}
          onIndexChange={setVideoIndex}
        />
      )}
    </div>
  );
};

export default EateryCard;
