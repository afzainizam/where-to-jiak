import { fetchMalls } from "@/lib/fetchMalls";
import EateriesFilter from "@/components/EateriesFilter";
import { PageProps } from "next";

export default async function MallPage({ params }: PageProps) {
  const { mallId } = params;

  const malls = await fetchMalls();
  const mall = malls.find((m) => m.id === mallId);

  if (!mall) {
    return <div className="p-4 text-red-500">Mall not found.</div>;
  }

  return (
    <div className="p-4">
      <EateriesFilter mall={mall} />
    </div>
  );
}
