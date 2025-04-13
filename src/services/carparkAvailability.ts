// services/carparkAvailability.ts
export interface CarparkRecord {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: number;
  LotType: string;
  Agency: string;
}

const BATCH_SIZE = 500;

export async function fetchAllCarparksV2(): Promise<CarparkRecord[]> {
  let allRecords: CarparkRecord[] = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    // Call your local API route. Next.js will handle it on the server.
    const res = await fetch(`/api/carparkAvailabilityv2?$skip=${skip}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data at skip=${skip}`);
    }
    const data = await res.json();
    const currentBatch = data.value as CarparkRecord[];
    allRecords = allRecords.concat(currentBatch);
    if (currentBatch.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      skip += BATCH_SIZE;
    }
  }
  return allRecords;
}
