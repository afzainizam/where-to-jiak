import { fetchMalls } from "@/lib/fetchMalls";
import ClientMallsPage from "@/components/ClientMallsPage";

export default async function Home() {
  const malls = await fetchMalls();
  return <ClientMallsPage malls={malls} />;
}




