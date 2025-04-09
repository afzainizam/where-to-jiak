import { fetchMalls } from "@/lib/fetchMalls";
import EateriesFilter from "@/components/EateriesFilter";

export default async function MallPage({ params }: any) {
  const mallId = params.mallId;

  const malls = await fetchMalls();
  const mall = malls.find((m) => m.id === mallId);

  if (!mall) {
    return <div className="p-4 text-red-500">Mall not found.</div>;
  }

  return (
    <div className="p-4">
          <EateriesFilter />
    </div>
  );
}
