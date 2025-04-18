"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,                // ← import useRef
  MutableRefObject,
} from "react";
import { useRouter } from "next/navigation";
import MallCard from "@/components/MallCard";
import SearchBar from "@/components/SearchBar";
import MallSquaresRow from "@/components/MallSquaresRow";
import type { Mall, Eatery } from "@/types/mall";
import type { Suggestion } from "@/components/SearchBar";
import EateryCard from "@/components/EateryCard";

interface Props {
  malls: Mall[];
}

const ClientMallsPage = ({ malls }: Props) => {
  const router = useRouter();
  const [region, setRegion] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMalls, setFilteredMalls] = useState<Mall[]>([]);
  const [randomTagline, setRandomTagline] = useState("");
  const [selectedMall, setSelectedMall] = useState<Mall | null>(null);
  const [selectedEatery, setSelectedEatery] = useState<Eatery | null>(null);
    
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

  // 1) Gather all hidden‑gem eateries
  const hiddenGems = useMemo(
    () => malls.flatMap((m) => m.eateries.filter((e) => e.hidden_gem)),
    [malls]
  );

  // 2) Pick one at random on mount
  const [featuredGem, setFeaturedGem] = useState<Eatery | null>(null);
  useEffect(() => {
    if (hiddenGems.length > 0) {
      setFeaturedGem(hiddenGems[Math.floor(Math.random() * hiddenGems.length)]);
    }
  }, [hiddenGems]);

  // 3) Tab & panel state
  const [showGemPanel, setShowGemPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setShowGemPanel(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const index = Math.floor(Math.random() * taglines.length);
    setRandomTagline(taglines[index]);
  }, []);

  useEffect(() => {
    let updated = [...malls];
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      updated = updated.filter(
        (mall) =>
          mall.name.toLowerCase().includes(lowerSearch) ||
          mall.eateries.some((e) => e.name.toLowerCase().includes(lowerSearch))
      );
    }
    if (region === "Nearby") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
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
                  mall.coordinates!.lat,
                  mall.coordinates!.lng
                );
                return { ...mall, distance: dist };
              });
            mallsWithDistance.sort((a, b) => a.distance - b.distance);
            setFilteredMalls(mallsWithDistance.slice(0, 1));
          },
          (error) => {
            console.error("Geolocation error:", error);
            setFilteredMalls([]);
          }
        );
      } else {
        console.warn("Geolocation is not supported by this browser.");
        setFilteredMalls([]);
      }
    } else {
      if (region !== "All") {
        updated = updated.filter((mall) => mall.region === region);
      }
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
    setSelectedMall(null);
    setSelectedEatery(null);
  };

  const handleRegionClick = (r: string) => {
    setRegion(r);
    setSearchTerm(""); // Clear the search term here!
    setSelectedMall(null);
    setSelectedEatery(null);
  };

  const handleSelectSuggestion = (item: Suggestion) => {
    setSearchTerm(item.name);

    if (item.type === "mall") {
      const fullMall = malls.find((mall) => mall.id === item.id);
      setSelectedMall(fullMall || null);
      setSelectedEatery(null);
    } else {
      let foundEatery: Eatery | undefined;
      malls.forEach((mall) => {
        const e = mall.eateries.find((e) => e.id === item.id);
        if (e) foundEatery = e;
      });
      setSelectedEatery(foundEatery || null);
      setSelectedMall(null);
    }
  };

  // Compute the title for the MallCard based on state.
  const mallCardTitle: string =
    selectedMall || selectedEatery || searchTerm.trim() !== ""
      ? ""
      : region !== "All"
      ? `Recommended Jiak spot in the ${region}`
      : "Jiak Spot of the Day";

    return (
        <div>
          {/* ─── Hero ─────────────────────────────────────────────────────────── */}
          <header
            className="relative hero bg-[url('/images/landing-bg.jpg')] bg-cover bg-center h-[50vh] flex flex-col items-center justify-center text-white px-4 text-center"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <h1 className="text-4xl font-bold mb-2">Where to Jiak?</h1>
            <p className="mb-4 text-lg max-w-xl">
              Discover top eateries in MALLS across Singapore!
            </p>
            <div className="max-w-md w-full">
              <SearchBar
                malls={malls}
                onSearch={(term) => {
                  setSearchTerm(term);
                  setSelectedMall(null);
                  setSelectedEatery(null);
                }}
                onSelect={(item: Suggestion) => {
                  if (item.type === "mall") {
                    setSelectedMall(malls.find((m) => m.id === item.id) ?? null);
                    setSelectedEatery(null);
                  } else {
                    let found: Eatery | undefined;
                    malls.forEach((m) => {
                      const e = m.eateries.find((e) => e.id === item.id);
                      if (e) found = e;
                    });
                    setSelectedEatery(found ?? null);
                    setSelectedMall(null);
                  }
                }}
              />
            </div>

            {/* ─── Tab & Panel ────────────────────────────────────────────── */}
            {featuredGem && (
              <div
                ref={panelRef}
                className="absolute left-2 bottom-0 w-50">
                {/* —1— Tab, always visible and sits above the clip‑wrapper */}
                <button
                  onClick={() => setShowGemPanel(v => !v)}
                  className={`
                    z-20 relative
                    bg-purple-600 hover:bg-purple-700
                    text-white text-xs font-medium
                    px-4 py-1 rounded-t-lg shadow-lg
                    w-full
                    transition-transform duration-300
                    ${showGemPanel ? "-translate-y-0" : "translate-y-0"}
                  `}
                >
                  Hidden Gem of the Day
                </button>

                {/* —2— Clip‑wrapper: hides everything below the tab when closed */}
                <div
                  className={`
                    overflow-hidden
                    transition-[max-height] duration-300 ease-in-out
                    ${showGemPanel ? "max-h-[20rem]" : "max-h-0"}
                  `}
                  style={{  /* adjust max-h to the height you need */
                    transitionProperty: "max-height",
                  }}
                >
                  {/* —3— Panel body slides in under the tab */}
                  <div
                    className={`
                      bg-white text-gray-800 rounded-b-lg shadow-xl p-4
                      transform transition-transform duration-300
                      ${showGemPanel ? "translate-y-0" : "-translate-y-full"}
                    `}
                  >
                    <h3 className="text-sm font-semibold mb-1">
                      {featuredGem.name}
                    </h3>
                    <p className="text-left !text-xs leading-relaxed mb-3 max-h-36 overflow-y-auto">
                      {featuredGem.hidden_gem_blog}
                    </p>
                    <div className="text-right">
                      <button
                        onClick={() => {
                          setSelectedEatery(featuredGem);
                          setSelectedMall(null);
                          setShowGemPanel(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded"
                      >
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

      {/* Conditional Rendering */}
      {selectedMall ? (
        <MallCard mall={selectedMall} />
      ) : selectedEatery ? (
        <div>
          <EateryCard
            eatery={selectedEatery}
            bgIndex={Math.floor(Math.random() * 10) + 1}
            headerTitle={`This eatery is at ${
              malls.find((mall) => mall.id === selectedEatery.mall_id)?.name ||
              "the mall"
            }`}
            onMore={() => router.push(`/mall/${selectedEatery.mall_id}`)}
          />
        </div>
      ) : (
        <>
           {region !== "All" && regionFilteredMalls.length > 0 && (
             <MallSquaresRow key={region} malls={regionFilteredMalls} />
           )}
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
                    selectedEatery
                      ? (selectedEatery as { id: string }).id
                      : null
                  }
                  title={mallCardTitle}
                />
              ))
            ) : (
              <p className="text-white text-center col-span-full">
                No results found for "{searchTerm}"
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
