// EateryDetail.tsx
"use client";
import { GiKnifeFork } from "react-icons/gi";
import { FaGlobe, FaMapMarkerAlt } from "react-icons/fa";
import type { Eatery } from "@/types/mall";

interface EateryDetailProps {
  eatery: Eatery;
}

export default function EateryDetail({ eatery }: EateryDetailProps) {
  return (
    <div className="p-4 bg-black rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold">{eatery.name}</h2>
      <p className="text-gray-300">
        {eatery.formatted_address}
      </p>
      <p className="flex items-center gap-1">
        <GiKnifeFork /> {eatery.cuisine_type} {eatery.halal && <span className="bg-green-600 text-white px-2 rounded text-xs">Halal</span>}
      </p>
      {/* Add more details as desired */}
    </div>
  );
}
