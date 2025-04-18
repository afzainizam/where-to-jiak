// src/components/MallSquaresRow.tsx
import Link from "next/link";
import type { Mall } from "@/types/mall";
import { FaStar, FaGem, FaMapMarkerAlt } from "react-icons/fa";

interface MallSquaresRowProps {
  malls: Mall[];
}

export default function MallSquaresRow({ malls }: MallSquaresRowProps) {
  return (
    <div
      className="
        flex overflow-x-auto space-x-3
        py-4 px-2
        scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800
      "
    >
      {malls.map((mall) => {
        // Compute avg rating
        const ratings = mall.eateries.map((e) => e.rating ?? 0);
        const avgRating =
          ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
            : "N/A";

        // Count hidden gems
        const hiddenGemCount = mall.eateries.filter((e) => e.hidden_gem).length;

        // Distance (in km) only if mall.distance was set upstream
        const distanceKm =
          typeof (mall as any).distance === "number"
            ? `${(((mall as any).distance as number) / 1000).toFixed(1)} km`
            : null;

        return (
          <div
            key={mall.id}
            className="
              flex-shrink-0 bg-gray-800 text-white
              rounded shadow p-2
              w-32 h-32 aspect-square
              flex flex-col
            "
          >
            {/* Mall name with a bit of bottom margin */}
            <p className="text-center text-xs md:text-sm font-semibold truncate mb-2">
              {mall.name}
            </p>

            {/* Stats */}
            <div className="flex-grow flex flex-col justify-center space-y-1 text-xs">
              <div className="flex items-center justify-center gap-1">
                <FaStar className="w-3 h-3 text-yellow-400" />
                {avgRating} Avg 🍜
              </div>
              <div className="flex items-center justify-center gap-1">
                <FaGem className="w-3 h-3 text-purple-400" />
                {hiddenGemCount}
              </div>
              {distanceKm && (
                <div className="flex items-center justify-center gap-1">
                  <FaMapMarkerAlt className="w-3 h-3 text-red-500" />
                  {distanceKm}
                </div>
              )}
            </div>

            {/* View button pinned at bottom */}
            <Link href={`/mall/${mall.id}`}>
              <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded">
                View Jiak Spots
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
