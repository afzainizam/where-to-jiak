// EateryCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { GiKnifeFork } from "react-icons/gi";
import { FaGlobe } from "react-icons/fa";
import type { Eatery } from "@/types/mall";
import TruncatedName from "@/components/TruncatedName";

// Helper function to truncate a string if it exceeds maxLength.
const truncateString = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
};

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

interface EateryCardProps {
  eatery: Eatery;
  bgIndex?: number; // Optional: allows you to pick a background image index.
  headerTitle?: string; // Optional: Header text, if used on the landing page.
  onMore?: () => void;  // Optional: Callback for "More at the same mall" button.
}

const EateryCard: React.FC<EateryCardProps> = ({ eatery, bgIndex = 1, headerTitle, onMore }) => {
  // For summary fields that might be arrays or strings
  const formatArrayOrString = (field: any): string => {
    if (Array.isArray(field)) {
      return field.join(", ");
    } else if (typeof field === "string") {
      return field;
    }
    return "";
  };

  // For Best foods, try both keys: "Best foods" and "Best_foods"
  const bestFoodsData =
    eatery.summary && ((eatery.summary as any)["Best foods"] ?? (eatery.summary as any)["Best_foods"]) || null;

  // Process the best foods into an array of trimmed strings.
  const bestFoodsArray: string[] = bestFoodsData
    ? Array.isArray(bestFoodsData)
      ? bestFoodsData.map((food: string) => food.trim()).filter((food: string) => food.length > 0)
      : typeof bestFoodsData === "string"
      ? bestFoodsData.split(",").map((food: string) => food.trim()).filter((food: string) => food.length > 0)
      : []
    : [];

  // New: Using state to set the maps URL depending on device width.
  const [mapsUrl, setMapsUrl] = useState<string>("");
  useEffect(() => {
    // Check window width—if less than 768px, assume mobile, otherwise desktop.
    const mobile = window.innerWidth < 768;
    if (mobile) {
      setMapsUrl(`https://www.google.com/maps/search/?api=1&query_place_id=${eatery.id}`);
    } else {
      setMapsUrl(`https://www.google.com/maps/place/?q=place_id:${eatery.id}`);
    }
  }, [eatery.id]);

  return (
    // Outer wrapper with padding applied to the whole card.
    <div className="p-4">
      {/* Add a maximum height and vertical auto overflow to allow scrolling */}
      <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg bg-black max-h-[600px] overflow-y-auto">
        {/* Header section: Render only if headerTitle and onMore are provided */}
        {headerTitle && onMore && (
          <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <div className="text-lg font-bold text-left">{headerTitle}</div>
            <button
              onClick={onMore}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              More at the same mall
            </button>
          </div>
        )}

        {/* Image and overlay section */}
        <div className="relative w-full h-52">
          <img
            src={`/eatery-bg/bg${bgIndex}.jpg`}
            alt="Background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.8)] z-10" />
          {/* Logo / Website Icon */}
          <div className="absolute top-2 right-2 z-30">
            <div className="bg-white p-2 rounded-xl shadow flex items-center justify-center">
              {eatery.website ? (
                isInvalidLogo(eatery.logo_url) ? (
                  <a
                    href={eatery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit website"
                  >
                    <FaGlobe className="text-gray-800 text-xl" />
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
                      width={40}
                      height={40}
                      className="object-contain rounded"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = "/placeholder.jpg";
                      }}
                    />
                  </a>
                )
              ) : isInvalidLogo(eatery.logo_url) ? (
                <FaGlobe className="text-gray-400 text-xl" />
              ) : (
                <img
                  src={eatery.logo_url}
                  alt={eatery.name}
                  width={40}
                  height={40}
                  className="object-contain rounded"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = "/placeholder.jpg";
                  }}
                />
              )}
            </div>
          </div>
          {/* Information Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 text-white text-sm gap-1">
            {/* Eatery Name displayed with TruncatedName component */}
            <h2 className="text-base font-bold text-white">
              <TruncatedName fullName={eatery.name} maxLength={25} />
            </h2>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:underline inline-block cursor-pointer"
            >
              ⭐ {eatery.rating} |{" "}
              <span className="text-xs bg-gray-700 text-white rounded px-2 py-0.5">
                {eatery.total_reviews} reviews
              </span>
              {(eatery.rating ?? 0) >= 4.5 &&
                (eatery.total_reviews ?? 0) > 500 && (
                  <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">
                    🌟 Crowd Favorite
                  </span>
                )}
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

            {/* Display Best foods if available, showing up to 3 items */}
            {eatery.summary && bestFoodsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {bestFoodsArray.slice(0, 2).map((food: string, index: number) => (
                  <span
                    key={index}
                    className="inline-block self-start w-auto bg-yellow-700 rounded-full px-2 py-0.5"
                  >
                    👍{food}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary and More Info section */}
        {eatery.hours && eatery.hours.length > 0 && (
          <div className="text-sm text-gray-300 mt-2 flex-col justify-end p-2">
            <p className="flex items-center gap-1">
              <span className="font-medium text-white">🕒 Today:</span>{" "}
              {getTodayOpeningHours(eatery.hours)}
            </p>
            <details className="mt-1 text-gray-400">
              <summary className="cursor-pointer hover:text-gray-200 text-xs">
                Show full week
              </summary>
              <ul className="text-xs mt-1 pl-2 list-disc">
                {eatery.hours.map((day: string, index: number) => (
                  <li key={index}>{day}</li>
                ))}
              </ul>
            </details>
          </div>
        )}

        {/* Additional Summary Content */}
        <div className="p-3">
          <p className="text-gray-400 mt-2 italic text-sm">
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
    </div>
  );
};

export default EateryCard;
