import { fetchMalls } from "@/lib/fetchMalls";
import EateriesFilter from "@/components/EateriesFilter";
import Link from "next/link";

export default async function MallPage({ params }: { params: { mallId: string } }) {
  const malls = await fetchMalls();
  const mall = malls.find((m) => m.id === params.mallId);

  if (!mall) {
    return (
      <div className="p-4 text-red-500">
        Mall not found.{" "}
        <Link href="/" className="text-blue-400 underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <Link href="/" className="text-blue-400 underline mb-4 inline-block">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-1">{mall.name}</h1>
      <p className="text-gray-300">{mall.location}</p>
      <p className="text-yellow-400">
        ⭐ {mall.stars} ({mall.total_reviews} reviews)
      </p>

      {mall.google_maps_url && (
        <p className="mt-1">
          <a
            href={mall.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:underline"
          >
            📍 View on Google Maps
          </a>
        </p>
      )}

      <EateriesFilter mall={mall} />
    </div>
  );
}
