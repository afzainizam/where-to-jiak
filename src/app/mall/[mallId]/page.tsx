import { fetchMalls } from "@/lib/fetchMalls";
import EateriesFilter from "@/components/EateriesFilter";
import Link from "next/link";

interface MallPageProps {
  params: {
    mallId: string;
  };
}

export default async function MallPage({ params }: MallPageProps) {
  const malls = await fetchMalls();
  const mall = malls.find((m) => m.id === params.mallId);

  if (!mall) {
    return <div className="text-red-500 p-4">Mall not found</div>;
  }

  return (
    <div className="p-4">
      <Link href="/" className="text-blue-400 underline mb-4 inline-block">
        ← Back to Search
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

      <EateriesFilter mall={mall} />
    </div>
  );
}
