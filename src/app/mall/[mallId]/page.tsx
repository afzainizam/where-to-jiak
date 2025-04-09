import { fetchMalls } from "@/lib/fetchMalls";
import Link from "next/link";

// Define the expected structure of `params`
export default async function MallPage({
  params,
}: {
  params: { mallId: string };
}) {
  const { mallId } = params;

  // Make sure your fetchMalls() returns full mall objects
  const malls = await fetchMalls();
  const mall = malls.find((m) => m.id === mallId);

  if (!mall) {
    return <div className="p-4 text-red-500">Mall not found</div>;
  }

  return (
    <div className="p-6">
      <Link href="/">
        <button className="mb-4 text-sm text-blue-400 underline hover:text-blue-200">
          ← Back to all malls
        </button>
      </Link>

      <h1 className="text-3xl font-bold text-white mb-1">{mall.name}</h1>
      <p className="text-gray-300">{mall.location}</p>
      <p className="text-yellow-400">
        ⭐ {mall.stars} ({mall.total_reviews} reviews)
      </p>
      {mall.google_maps_url && (
        <p className="text-blue-300 mt-1">
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

      {/* You can optionally add the EateriesFilter or similar component here */}
    </div>
  );
}
