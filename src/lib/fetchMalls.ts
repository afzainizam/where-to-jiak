import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Mall } from "@/types/mall";


export async function fetchMalls() {
  const mallsRef = collection(db, "malls");
  const snapshot = await getDocs(mallsRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
