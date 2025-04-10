import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Mall } from "@/types/mall";

export async function fetchMalls(): Promise<Mall[]> {
  const mallsRef = collection(db, "malls");
  const snapshot = await getDocs(mallsRef);
  const malls: Mall[] = snapshot.docs.map((doc) => {
    // Get the data from the document and remove the id (if it exists)
    const data = doc.data() as Mall;
    const { id: discard, ...rest } = data;
    const mallData: Mall = { id: doc.id, ...rest };

    // Check if coordinates are missing and set a fallback (if applicable)
    if (!mallData.coordinates && mallData.eateries && mallData.eateries.length > 0) {
      mallData.coordinates = mallData.eateries[0].location || null;
    }
    return mallData;
  });
  return malls;
}
