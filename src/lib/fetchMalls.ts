import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Mall } from "@/types/mall";

export async function fetchMalls(): Promise<Mall[]> {
  const mallsRef = collection(db, "malls");
  const snapshot = await getDocs(mallsRef);

  const malls = snapshot.docs.map((doc) => {
    const data = doc.data();

    // Explicit shape to satisfy Mall type
    return {
      id: doc.id,
      name: data.name,
      location: data.location,
      eateries: data.eateries,
      coordinates: data.coordinates,
    } as Mall;
  });

  return malls;
}
