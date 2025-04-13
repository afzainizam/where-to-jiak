// app/api/carparkAvailability/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_CARPARK_API_KEY || "";
  const url = "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        AccountKey: apiKey,
        Accept: "application/json",
      },
    });

    console.log("Datamall API status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Datamall API error text:", errorText);
      return NextResponse.json({ error: "Failed to fetch carpark availability" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Caught error in Datamall route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
