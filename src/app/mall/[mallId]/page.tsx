import { FaMapMarkerAlt } from "react-icons/fa";
import { fetchMalls } from "@/lib/fetchMalls";
import EateriesFilter from "@/components/EateriesFilter";
import Link from "next/link";

interface MallPageProps {
  params: Promise<{
    mallId: string;
  }>;
}

interface Mall {
  id: string;
  name: string;
  location: string;
  stars: number;
  total_reviews: number;
  google_maps_url?: string; // optional if not always provided
}


export default async function MallPage({ params }: MallPageProps) {
  const { mallId } = await params;
  // Ensure you type the returned malls. This might also be done in fetchMalls.
  const malls = await fetchMalls();
  const mall = malls.find((m) => m.id === mallId);

  if (!mall) {
    return <div className="p-4 text-red-500">Mall not found</div>;
  }

  return (
    <div className="px-6 py-4">
      <Link href="/">
        <button className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
          ← Back
        </button>
      </Link>

      <h1 className="text-3xl font-bold text-white mb-1">{mall.name}</h1>
      <p className="text-gray-300">{mall.location}</p>
      <p className="text-yellow-400">
        ⭐ {mall.stars} ({mall.total_reviews} reviews)
      </p>
      {mall.google_maps_url && (
        <p className="text-blue-300 mt-1 flex items-center gap-1">
          <FaMapMarkerAlt />
          <a
            href={mall.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-200"
          >
            View on Google Maps
          </a>
        </p>
      )}

      <EateriesFilter mall={mall} />
    </div>
  );
}
