import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Mall } from "@/types/mall";

export async function fetchMalls(): Promise<Mall[]> {
  const mallsRef = collection(db, "malls");
  const snapshot = await getDocs(mallsRef);
  const malls: Mall[] = snapshot.docs.map((doc) => {
    const mallData = { id: doc.id, ...doc.data() };
    // Check if coordinates are missing and use the first eatery's coordinates as fallback
    if (!mallData.coordinates) {
      const firstEatery = mallData.eateries?.[0];  // Check if eateries are available
      if (firstEatery && firstEatery.location) {
        mallData.coordinates = firstEatery.location;  // Fallback to eatery coordinates
      }
    }
    return mallData;
  });
  return malls;
}
