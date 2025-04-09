import { fetchMalls } from "@/lib/fetchMalls";
import EateriesFilter from "@/components/EateriesFilter";

interface Props {
  params: {
    mallId: string;
  };
}

export default async function MallPage({ params }: Props) {
  const malls = await fetchMalls();
  const mall = malls.find((m) => m.id === params.mallId);

  if (!mall) {
    return <div className="p-4 text-red-500">Mall not found.</div>;
  }

  return (
    <div className="p-4">
      <EateriesFilter mall={mall} />
    </div>
  );
}
