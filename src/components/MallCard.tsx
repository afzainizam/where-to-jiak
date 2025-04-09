"use client";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";
import { GiKnifeFork } from "react-icons/gi";

// Utility function to create an embed URL from the standard Google Maps URL.
function getEmbedUrl(googleMapsUrl: string): string {
  const match = googleMapsUrl.match(/q=place_id:(.*)$/);
  if (match && match[1]) {
    const placeId = match[1];
    // Replace YOUR_API_KEY with your actual Maps Embed API key.
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}`;
  }
  return "";
}

export default function MallCard({ mall, expandedEatery }: { mall: any; expandedEatery?: any }) {
  // Calculate the featured eatery (the one with the highest rating)
  const featuredEatery = mall.eateries?.reduce(
    (prev: any, curr: any) => (curr.rating > prev.rating ? curr : prev),
    mall.eateries[0]
  );

  // Compute today's opening hours for the featured eatery.
  let todayHours = "Hours not available";
  if (featuredEatery && featuredEatery.hours && featuredEatery.hours.length > 0) {
    const today = new Date().getDay();
    // Convert JS day (Sunday=0) to array index (Monday=0, Sunday=6)
    const index = today === 0 ? 6 : today - 1;
    todayHours = featuredEatery.hours[index] || "Hours not available";
  }

  // Generate the embed URL from the mall's google_maps_url
  const embedUrl = mall.google_maps_url ? getEmbedUrl(mall.google_maps_url) : "";

  return (
    <div className="mx-auto max-w-4xl">
      {/* Title above the card */}
      <h1 className="text-center text-3xl font-bold mb-4">Jiak Spot of the Day</h1>
      <div className="w-full bg-gray-900 text-white rounded-xl shadow-lg mb-8 border border-gray-700">
        {/* Top Half: Google Map with rounded top corners */}
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
              {mall.google_maps_url && (
                <a
                  href={mall.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 text-sm inline-flex items-center gap-1 mt-1 hover:underline"
                >
                  <FaMapMarkerAlt />
                  View on Google Maps
                </a>
              )}
            </div>
            {/* Replace the logo with a button */}
            <div>
              <Link href={`/mall/${mall.id}`}>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                  View More Jiak Eateries
                </button>
              </Link>
            </div>
          </div>

          {featuredEatery && (
            <>
              <div className="mt-4">
                <h3 className="text-lg font-bold">Featured Restaurant</h3>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg bg-black">
                {/* Image Header */}
                <div className="relative w-full h-52">
                  <img
                    src={`/eatery-bg/bg${Math.floor(Math.random() * 10) + 1}.jpg`}
                    alt="Eatery Background"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-[rgba(0,0,0,0.8)] z-10" />
                  {/* Overlay with info */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 text-white text-sm gap-1">
                    <h2 className="text-base font-bold">{featuredEatery.name}</h2>
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${featuredEatery.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:underline inline-block cursor-pointer"
                    >
                      ⭐ {featuredEatery.rating}{" "}
                      <span className="text-xs bg-gray-700 text-white rounded px-2 py-0.5">
                        {featuredEatery.total_reviews} reviews
                      </span>
                      {featuredEatery.rating >= 4.5 &&
                        featuredEatery.total_reviews > 500 && (
                          <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                            🌟 Crowd Favorite
                          </span>
                        )}
                    </a>
                    <p className="text-sm">📍 Level {featuredEatery.floor}-#{featuredEatery.unit}</p>
                    <p className="flex items-center gap-1">
                      <GiKnifeFork /> {featuredEatery.cuisine_type}
                      {featuredEatery.halal && (
                        <span className="bg-green-600 text-white text-xs px-2 rounded">
                          Halal
                        </span>
                      )}
                    </p>
                    {featuredEatery.summary?.most_mentioned && (
                      <div className="flex flex-wrap gap-1 mt-1 text-xs text-yellow-100">
                        {featuredEatery.summary.most_mentioned
                          .split(",")
                          .slice(0, 2)
                          .map((dish, index) => (
                            <span
                              key={index}
                              className="bg-yellow-700 rounded-full px-2 py-0.5"
                            >
                              👍 {dish.trim()}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Summary Section */}
                <div className="p-3">
                  <p className="text-gray-400 mt-2 italic text-sm">
                    "{featuredEatery.summary?.one_liner}"
                  </p>
                  {featuredEatery.summary?.common_themes && (
                    <details className="text-gray-400 mt-2 text-sm">
                      <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                        ➤ More...
                      </summary>
                      <p className="mt-1">
                        <strong>Common Themes:</strong>{" "}
                        {featuredEatery.summary.common_themes}
                      </p>
                      <p>
                        <strong>Most Mentioned:</strong>{" "}
                        {featuredEatery.summary.most_mentioned}
                      </p>
                      <p>
                        <strong>Biggest Complaint:</strong>{" "}
                        {featuredEatery.summary.biggest_complaint}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
