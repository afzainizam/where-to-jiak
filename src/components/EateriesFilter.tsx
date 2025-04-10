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
    //    url.includes("favicon") ||
    url.includes("restaurant-71") ||
    url.includes("localhost") ||
    //    url.endsWith(".ico") ||
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

    if (!mall) return <div>Loading...</div>;

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
        
        {/* Mall Info Section */}
        <div className="bg-gray-900 p-4 rounded-lg shadow mb-6">
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
      <div className="grid md:grid-cols-3 gap-4">
        {filteredEateries.map((eatery: Eatery) => {
          const bgIndex = bgImageMap[eatery.id] || 1;
          return (
            <div
              key={eatery.id}
              className="rounded-xl overflow-hidden border border-gray-700 shadow-lg bg-black"
            >
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
                  <h2 className="text-base font-bold text-white">
                    {eatery.name}
                  </h2>
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${eatery.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:underline inline-block cursor-pointer"
                  >
                    ⭐ {eatery.rating} |{" "}
                    <span className="text-xs bg-gray-700 text-white rounded px-2 py-0.5">
                      {eatery.total_reviews} reviews
                    </span>
                    {eatery.rating >= 4.5 && eatery.total_reviews > 500 && (
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
                  {eatery.summary?.most_mentioned && (
                    <div className="flex flex-wrap gap-1 mt-1 text-xs text-yellow-100">
                      {eatery.summary.most_mentioned
                        .split(",")
                        .slice(0, 2)
                        .map((dish, index) => (
                          <span
                            key={index}
                            className="bg-yellow-700 rounded-full px-2 py-0.5"
                          >
                            👍{dish.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Bookmark Button */}
                <button
                  className="absolute top-2 left-2 text-white text-xl z-30"
                  onClick={() => toggleBookmark(eatery.id)}
                >
                  {bookmarked.includes(eatery.id) ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              </div>

              {/* Summary and More Info */}
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
                      <strong>Common Themes:</strong>{" "}
                      {eatery.summary.common_themes}
                    </p>
                    <p>
                      <strong>Most Mentioned:</strong>{" "}
                      {eatery.summary.most_mentioned}
                    </p>
                    <p>
                      <strong>Biggest Complaint:</strong>{" "}
                      {eatery.summary.biggest_complaint}
                    </p>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EateriesFilter;
