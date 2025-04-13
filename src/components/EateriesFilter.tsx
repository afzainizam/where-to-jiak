// EateriesFilter.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { GiKnifeFork } from "react-icons/gi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaStar, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";
import type { Mall, Eatery } from "@/types/mall";
import { useRouter } from "next/navigation";
import EateryCard from "@/components/EateryCard";
import { fetchAllCarparksV2, CarparkRecord } from "@/services/carparkAvailability";

function isOpenNow(openingHoursDetails: any): boolean {
  if (!openingHoursDetails || !openingHoursDetails.periods) return false;
  const now = new Date();
  const day = now.getDay();
  const currentTime = parseInt(
    now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0")
  );
  const todayPeriods = openingHoursDetails.periods.filter((p: any) => p.open.day === day);
  for (const period of todayPeriods) {
    const openTime = parseInt(period.open.time);
    const closeTime = parseInt(period.close.time);
    if (currentTime >= openTime && currentTime <= closeTime) {
      return true;
    }
  }
  return false;
}

function isInvalidLogo(url: string | undefined): boolean {
  if (!url) return true;
  return (
    url.includes("restaurant-71") ||
    url.includes("localhost") ||
    url.includes("default") ||
    url.includes("placeholder")
  );
}

function getTodayOpeningHours(weekdayText: string[]): string {
  const today = new Date().getDay();
  const index = today === 0 ? 6 : today - 1;
  return weekdayText[index] || "Hours not available";
}

const EateriesFilter = () => {
  const { mallId } = useParams() as { mallId: string };
  const router = useRouter();
  const [mall, setMall] = useState<any>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [bgImageMap, setBgImageMap] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState({
    halalOnly: false,
    cuisine: "All",
    minRating: 0,
  });

    // In EateriesFilter.tsx, add a similar useEffect to compute mapsUrl for the mall:
    const [mapsUrl, setMapsUrl] = useState<string>("");
    useEffect(() => {
      if (typeof window !== "undefined" && mall && mall.id) {
        const isMobile = window.innerWidth < 768;
        const url = isMobile
          ? `https://www.google.com/maps/search/?api=1&query_place_id=${mall.id}`
          : `https://www.google.com/maps/place/?q=place_id:${mall.id}`;
        setMapsUrl(url);
      }
    }, [mall]);
    
  // New state for carpark records that match this mall.
  const [matchingCarparks, setMatchingCarparks] = useState<CarparkRecord[]>([]);

    useEffect(() => {
      async function fetchMall() {
        console.log("Fetching mall with id:", mallId);
        const docRef = doc(collection(db, "malls"), mallId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const mallData = docSnap.data();
          console.log("Found mall data:", mallData);
          setMall(mallData);
          const generatedMap: Record<string, number> = {};
          mallData.eateries.forEach((e: Eatery) => {
            generatedMap[e.id] = Math.floor(Math.random() * 10) + 1;
          });
          setBgImageMap(generatedMap);
        } else {
          console.error("Mall document not found for id:", mallId);
          setMall(null); // Or set an error state if preferred.
        }
      }
      fetchMall();

      const stored = localStorage.getItem("bookmarkedEateries");
      if (stored) setBookmarked(JSON.parse(stored));
    }, [mallId]);

        
    useEffect(() => {
      async function getCarparkData() {
        try {
          const records = await fetchAllCarparksV2();
          console.log("Fetched carpark records:", records);
          // Match records where the Development field (lowercased) contains the mall’s name (lowercased)
          const matches = records.filter((record: CarparkRecord) =>
            record.Development.toLowerCase().includes(mall.name.toLowerCase())
          );
          setMatchingCarparks(matches);
        } catch (error) {
          console.error("Error fetching carpark availability:", error);
        }
      }
      if (mall && mall.name) {
        getCarparkData();
      }
    }, [mall]);

  const toggleBookmark = (id: string) => {
    const updated = bookmarked.includes(id)
      ? bookmarked.filter((b) => b !== id)
      : [...bookmarked, id];
    setBookmarked(updated);
    localStorage.setItem("bookmarkedEateries", JSON.stringify(updated));
  };

  const cuisines: string[] =
    mall?.eateries?.map((e: Eatery) => e.cuisine_type).filter(Boolean) ?? [];
  const uniqueCuisines = Array.from(new Set(cuisines)) as string[];

  const filteredEateries = mall?.eateries.filter((e: Eatery) => {
    const matchHalal = !filters.halalOnly || e.halal;
    const matchCuisine = filters.cuisine === "All" || e.cuisine_type === filters.cuisine;
    const matchRating = (e.rating ?? 0) >= filters.minRating;
    return matchHalal && matchCuisine && matchRating;
  });

  if (!mall) return <div>Loading...</div>;

  const streetViewUrl = mall.coordinates
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${mall.coordinates.lat},${mall.coordinates.lng}&heading=235&pitch=10&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
    : "";

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          ← Back
        </button>
      </div>

      {/* Mall Info Section with Street View Background */}
      <div
        className="p-0 rounded-lg shadow mb-6"
        style={{
          backgroundImage: `url(${streetViewUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="p-3 rounded" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
          <h1 className="text-3xl font-bold text-white">{mall.name}</h1>
          <p className="text-gray-300">{mall.location}</p>
          <p className="text-yellow-400">
            ⭐ {mall.stars} ({mall.total_reviews} reviews)
          </p>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline inline-flex items-center gap-1 mt-2"
            >
              <FaMapMarkerAlt />
              View on Google Maps
            </a>
          )}
          {/* Display carpark availability information */}
          {matchingCarparks.length > 0 && (
            <div className="mt-2 text-sm text-gray-300">
              {matchingCarparks.map((cp, index) => (
                <div key={index}>
                  {cp.Development}: {cp.AvailableLots} lots available
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Filters Section */}
      {mall.eateries.length > 4 && (
        <div className="bg-gray-900 p-4 rounded-lg shadow mb-6 space-y-2">
          <h3 className="text-white text-lg font-bold mb-2">Filter eateries 🍽️</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white">
            <label>
              Cuisine:
              <select
                className="ml-2 bg-gray-800 text-white rounded px-2 py-1"
                value={filters.cuisine}
                onChange={(e) => setFilters((f) => ({ ...f, cuisine: e.target.value }))}
              >
                <option value="All">All</option>
                {uniqueCuisines.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Minimum ⭐ Rating:
              <select
                className="ml-2 bg-gray-800 text-white rounded px-2 py-1"
                value={filters.minRating}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minRating: parseFloat(e.target.value) }))
                }
              >
                <option value={0}>Any</option>
                <option value={3.5}>3.5+</option>
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                className="mr-2"
                checked={filters.halalOnly}
                onChange={(e) => setFilters((f) => ({ ...f, halalOnly: e.target.checked }))}
              />
              Halal only
            </label>
          </div>
        </div>
      )}

      {/* Display Carpark Availability (if there are multiple matches, list them) */}
      {matchingCarparks.length > 0 && (
        <div className="mt-2 text-sm text-gray-300">
          {matchingCarparks.map((cp, index) => (
            <div key={index}>
              {cp.Development}: {cp.AvailableLots} lots available
            </div>
          ))}
        </div>
      )}

      {/* Eateries Grid */}
      <div className="grid md:grid-cols-3 gap-0">
        {filteredEateries.map((eatery: Eatery) => {
          const bgIndex = bgImageMap[eatery.id] || 1;
          return (
            <EateryCard key={eatery.id} eatery={eatery} bgIndex={bgIndex} />
          );
        })}
      </div>
    </div>
  );
};

export default EateriesFilter;
