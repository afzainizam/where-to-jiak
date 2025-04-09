"use client";

import { useState, useEffect, useMemo } from "react";
import MallCard from "@/components/MallCard";
import SearchBar from "@/components/SearchBar";
import MallSquaresRow from "@/components/MallSquaresRow";
import type { Mall, Eatery } from "@/types/mall";


interface Props {
  malls: Mall[];
}

const ClientMallsPage = ({ malls }: Props) => {
  const [region, setRegion] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMalls, setFilteredMalls] = useState<Mall[]>([]);
  const [randomTagline, setRandomTagline] = useState("");
  const [selectedEatery, setSelectedEatery] = useState<{
    mallId: string;
    eateryId: string;
  } | null>(null);

  const regions = ["Nearby", "North", "North-East", "East", "West", "Central"];

  const taglines = [
    "Feeling hungry? So is your stomach.",
    "Discover hidden gems near you!",
    "One mall to jiak them all.",
    "Your next meal is a click away.",
    "Warning: browsing may cause cravings.",
    "Hawker, hotpot, or halal? We got you.",
    "Hungry but indecisive? Scroll on.",
    "Jiak where? Jiak here lah!",
  ];

  useEffect(() => {
    const index = Math.floor(Math.random() * taglines.length);
    setRandomTagline(taglines[index]);
  }, []);

    useEffect(() => {
      let updated = [...malls];

      // First, filter by search term if provided.
      if (searchTerm.trim() !== "") {
        const lowerSearch = searchTerm.toLowerCase();
        updated = updated.filter(
          (mall) =>
            mall.name.toLowerCase().includes(lowerSearch) ||
            mall.eateries.some((e) => e.name.toLowerCase().includes(lowerSearch))
        );
      }

        if (region === "Nearby") {
          // Use geolocation to get the user's current position.
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;

                // Filter only malls with valid coordinates.
                const mallsWithDistance = updated
                  .filter(
                    (mall) =>
                      mall.coordinates &&
                      typeof mall.coordinates.lat === "number" &&
                      typeof mall.coordinates.lng === "number"
                  )
                  .map((mall) => {
                    const dist = getDistance(
                      latitude,
                      longitude,
                      mall.coordinates.lat,
                      mall.coordinates.lng
                    );
                    return { ...mall, distance: dist };
                  });

                // Sort malls by distance and update filteredMalls with the nearest one.
                mallsWithDistance.sort((a, b) => a.distance - b.distance);
                setFilteredMalls(mallsWithDistance.slice(0, 1));
              },
              (error) => {
                console.error("Geolocation error:", error);
                // Fallback: just use the updated list without nearby filtering.
                setFilteredMalls([]);
              }
            );
          } else {
            console.warn("Geolocation is not supported by this browser.");
            setFilteredMalls([]);
          }
        } else {
          // If region is not 'Nearby' and not 'All', filter by region.
          if (region !== "All") {
            updated = updated.filter((mall) => mall.region === region);
          }

          // Randomize and take one (or adjust as desired).
          setFilteredMalls(updated.sort(() => 0.5 - Math.random()).slice(0, 1));
        }

    }, [region, searchTerm, malls]);


  const regionFilteredMalls = useMemo(() => {
    let results = [...malls];
    if (region !== "All") {
      results = results.filter((mall) => mall.region === region);
    }
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      results = results.filter(
        (mall) =>
          mall.name.toLowerCase().includes(lowerSearch) ||
          mall.eateries.some((e) => e.name.toLowerCase().includes(lowerSearch))
      );
    }
    return results;
  }, [malls, region, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSelectedEatery(null); // Clear any selected eatery on new search
  };

  const handleRegionClick = (r: string) => {
    setRegion(r);
    setSelectedEatery(null); // Clear selected eatery when changing region
  };

  const handleSelectSuggestion = (item: Mall | Eatery) => {
    if ("eateries" in item) {
      setSearchTerm(item.name);
      setSelectedEatery(null);
    } else {
      setSearchTerm(item.name);
      setSelectedEatery({ mallId: item.mallId, eateryId: item.id });
    }
  };

  return (
    <div>
      {/* Hero with search */}
      <header className="hero bg-[url('/images/landing-bg.jpg')] bg-cover bg-center h-[50vh] flex flex-col items-center justify-center text-white px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Where to Jiak?</h1>
        <p className="mb-4 text-lg max-w-xl">
          Discover top eateries in malls across Singapore!
        </p>
        <div className="max-w-md w-full">
          <SearchBar
            malls={malls}
            onSearch={handleSearch}
            onSelect={handleSelectSuggestion}
          />
        </div>
      </header>

      {/* Tagline */}
      <div className="text-center text-lg italic text-white my-4 px-4">
        {randomTagline}
      </div>

      {/* Region Filters */}
      <div className="flex flex-wrap justify-center gap-2 my-4">
        {regions.map((r) => (
          <button
            key={r}
            className={`px-4 py-1 rounded-full border transition ${
              region === r
                ? "bg-white text-black font-semibold"
                : "text-white border-white"
            }`}
            onClick={() => handleRegionClick(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Paginated Mall Squares Row (for region selections) */}
      {region !== "All" && regionFilteredMalls.length > 0 && (
        <MallSquaresRow malls={regionFilteredMalls} />
      )}

      {/* Mall Cards */}
      <div
        className={`grid ${
          filteredMalls.length === 1 ? "md:grid-cols-1" : "md:grid-cols-2"
        } gap-6 px-4 justify-items-center`}
      >
        {filteredMalls.length > 0 ? (
          filteredMalls.map((mall) => (
            <MallCard
              key={mall.id}
              mall={mall}
              highlightEatery={
                selectedEatery?.mallId === mall.id ? selectedEatery.eateryId : null
              }
            />
          ))
        ) : (
          <p className="text-white text-center col-span-full">
            No results found for "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export default ClientMallsPage;
