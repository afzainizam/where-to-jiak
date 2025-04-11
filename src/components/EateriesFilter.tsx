"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { GiKnifeFork } from "react-icons/gi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaStar, FaMapMarkerAlt, FaGlobe } from "react-icons/fa"; // Make sure FaGlobe is imported
import type { Mall, Eatery } from "@/types/mall";
import { useRouter } from "next/navigation";
import EateryCard from "@/components/EateryCard";

function isOpenNow(openingHoursDetails: any): boolean {
  if (!openingHoursDetails || !openingHoursDetails.periods) return false;

  const now = new Date();
  const day = now.getDay(); // Sunday = 0
  const currentTime = parseInt(
    now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0")
  );

  const todayPeriods = openingHoursDetails.periods.filter(
    (p: any) => p.open.day === day
  );

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
  const today = new Date().getDay(); // Sunday = 0
  const index = today === 0 ? 6 : today - 1; // Make Monday = 0
  return weekdayText[index] || "Hours not available";
}

const EateriesFilter = () => {
  const { mallId } = useParams();
  const router = useRouter();
  const [mall, setMall] = useState<any>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [bgImageMap, setBgImageMap] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState({
    halalOnly: false,
    cuisine: "All",
    minRating: 0,
  });

  useEffect(() => {
    const fetchMall = async () => {
      const docRef = doc(collection(db, "malls"), mallId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const mallData = docSnap.data();
        setMall(mallData);

        const generatedMap: Record<string, number> = {};
        mallData.eateries.forEach((e: Eatery) => {
          generatedMap[e.id] = Math.floor(Math.random() * 10) + 1;
        });
        setBgImageMap(generatedMap);
      }
    };

    fetchMall();

    const stored = localStorage.getItem("bookmarkedEateries");
    if (stored) setBookmarked(JSON.parse(stored));
  }, [mallId]);

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
    const matchCuisine =
      filters.cuisine === "All" || e.cuisine_type === filters.cuisine;
    const matchRating = (e.rating ?? 0) >= filters.minRating;
    return matchHalal && matchCuisine && matchRating;
  });

  // Check if mall data has been loaded
  if (!mall) return <div>Loading...</div>;

  // Define the street view URL using mall coordinates
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
        {/* Overlay container to darken the background for readability */}
          <div
            className="p-3 rounded"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
          >
          <h1 className="text-3xl font-bold text-white">{mall.name}</h1>
          <p className="text-gray-300">{mall.location}</p>
          <p className="text-yellow-400">
            ⭐ {mall.stars} ({mall.total_reviews} reviews)
          </p>
          {mall.google_maps_url && (
            <a
              href={mall.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline inline-flex items-center gap-1 mt-2"
            >
              <FaMapMarkerAlt />
              View on Google Maps
            </a>
          )}
        </div>
      </div>
      
      {/* Filters Section */}
      {mall.eateries.length > 4 && (
        <div className="bg-gray-900 p-4 rounded-lg shadow mb-6 space-y-2">
          <h3 className="text-white text-lg font-bold mb-2">
            Filter eateries 🍽️
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white">
            <label>
              Cuisine:
              <select
                className="ml-2 bg-gray-800 text-white rounded px-2 py-1"
                value={filters.cuisine}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, cuisine: e.target.value }))
                }
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
                  setFilters((f) => ({
                    ...f,
                    minRating: parseFloat(e.target.value),
                  }))
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
                onChange={(e) =>
                  setFilters((f) => ({ ...f, halalOnly: e.target.checked }))
                }
              />
              Halal only
            </label>
          </div>
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
