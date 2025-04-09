import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Mall } from "@/types/mall";


export async function fetchMalls(): Promise<Mall[]> {
  const res = await fetch("https://where-to-jiak.vercel.app/malls.json");

  if (!res.ok) {
    throw new Error("Failed to fetch malls data");
  }

  const data = await res.json();
  return data.malls as Mall[];
}

