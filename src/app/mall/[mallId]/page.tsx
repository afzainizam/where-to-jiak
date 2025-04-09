// src/app/mall/[mallId]/page.tsx

import { fetchMalls } from "@/lib/fetchMalls";
import EateriesFilter from "@/components/EateriesFilter";

type MallPageProps = {
  params: {
    mallId: string;
  };
};

export default async function MallPage({ params }: MallPageProps) {
  const malls = await fetchMalls();
  const mall = malls.find((m) => m.id === params.mallId);

  if (!mall) {
    return (
      <div className="p-4 text-red-500">
        Mall not found. Please go back and try again.
      </div>
    );
  }

  return (
    <div className="p-4">
      <EateriesFilter mall={mall} />
    </div>
  );
}
