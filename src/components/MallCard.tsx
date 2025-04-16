// MallCard.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import EateryCard from "@/components/EateryCard";
import { fetchAllCarparksV2, CarparkRecord } from "@/services/carparkAvailability";

interface MallCardProps {
  mall: any; // Ideally, use your defined type for malls
  expandedEatery?: any;
  highlightEatery?: string | null;
  title?: string; // Optional title prop
}

// Utility function to create an embed URL from the mall’s Google Maps URL.
function getEmbedUrl(googleMapsUrl: string): string {
  const match = googleMapsUrl.match(/q=place_id:(.*)$/);
  if (match && match[1]) {
    const placeId = match[1];
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}`;
  }
  return "";
}

// Helper: detect if device is iOS
const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export default function MallCard({ mall, expandedEatery, highlightEatery, title }: MallCardProps) {
  const router = useRouter();
  // State for showing the "loading" cue when navigating to the mall detail page.
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Determine the featured eatery based on highest rating.
  const featuredEatery = mall.eateries?.reduce(
    (prev: any, curr: any) => (curr.rating > prev.rating ? curr : prev),
    mall.eateries[0]
  );

  // Compute today's opening hours for the featured eatery.
  let todayHours = "Hours not available";
  if (featuredEatery && featuredEatery.hours && featuredEatery.hours.length > 0) {
    const today = new Date().getDay();
    const index = today === 0 ? 6 : today - 1;
    todayHours = featuredEatery.hours[index] || "Hours not available";
  }

  // Generate the embed URL for the map iframe.
  const embedUrl = mall.google_maps_url
    ? getEmbedUrl(mall.google_maps_url)
    : (mall.eateries &&
        mall.eateries[0]?.location?.lat &&
        mall.eateries[0]?.location?.lng)
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&q=${mall.eateries[0].location.lat},${mall.eateries[0].location.lng}`
    : "";

  // --- Carpark Availability Integration ---
  // State for carpark records that match this mall.
  const [matchingCarparks, setMatchingCarparks] = useState<CarparkRecord[]>([]);
  useEffect(() => {
    async function getCarparkData() {
      try {
        const records = await fetchAllCarparksV2();
        console.log("New Carpark API response:", records);
        const matches = records.filter((record: CarparkRecord) =>
          record.Development.toLowerCase().includes(mall.name.toLowerCase())
        );
        setMatchingCarparks(matches);
      } catch (error) {
        console.error("Error fetching new carpark availability:", error);
      }
    }
    if (mall && mall.name) {
      getCarparkData();
    }
  }, [mall]);

  // State for the maps URL for "View on Google Maps" link.
  const [mapsUrl, setMapsUrl] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined" && mall.id) {
      const isMobile = window.innerWidth < 768;
      const { lat, lng } = mall.coordinates || {};
      if (isMobile && lat && lng) {
        if (isIOS()) {
          setMapsUrl(`comgooglemaps://?q=${encodeURIComponent(mall.name)}&center=${lat},${lng}`);
        } else {
          setMapsUrl(`geo:${lat},${lng}?q=${encodeURIComponent(mall.name)}`);
        }
      } else {
        setMapsUrl(`https://www.google.com/maps/place/?q=place_id:${mall.id}`);
      }
    }
  }, [mall]);

  return (
    <div className="mx-auto max-w-4xl p-4">
      {title && <h1 className="text-center text-3xl font-bold mb-4">{title}</h1>}
      <div className="w-full bg-gray-900 text-white rounded-xl shadow-lg mb-8 border border-gray-700">
        {/* Top Half: Google Map */}
        <div className="rounded-t-xl overflow-hidden w-full h-64 relative">
          {embedUrl ? (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={embedUrl}
              allowFullScreen
              loading="lazy"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p>No map available</p>
            </div>
          )}
        </div>

        {/* Bottom Half: Mall Details */}
        <div className="p-4">
          <div className="flex justify-between items-start flex-wrap">
            <div>
              <h2 className="text-2xl font-bold">{mall.name}</h2>
              <p className="text-gray-300 text-sm">{mall.location}</p>
              <p className="text-yellow-400 text-sm">
                ⭐ {mall.stars} ({mall.total_reviews} reviews)
              </p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 text-sm inline-flex items-center gap-1 mt-1 hover:underline"
                >
                  <FaMapMarkerAlt />
                  View on Google Maps
                </a>
              )}
            </div>
            <div>
              <button
                onClick={() => {
                  setIsLoadingMore(true);
                  router.push(`/mall/${mall.id}`);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    Loading...
                    <FaSpinner className="animate-spin" />
                  </>
                ) : (
                  "View More Eateries"
                )}
              </button>
            </div>
          </div>

          {/* Display Carpark Availability (if available) */}
          {matchingCarparks.length > 0 && (
            <div className="mt-2 text-sm text-gray-300">
              {matchingCarparks.map((cp, index) => (
                <div key={index}>
                  {cp.Development}: {cp.AvailableLots} lots available
                </div>
              ))}
            </div>
          )}

          {/* Featured Eatery Section */}
          {featuredEatery && (
            <>
              <div className="mt-4">
                <h3 className="text-lg font-bold">Featured Restaurant</h3>
              </div>
              <EateryCard
                eatery={featuredEatery}
                bgIndex={Math.floor(Math.random() * 10) + 1}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
