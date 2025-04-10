"use client";
import { useState, useEffect } from "react";
import type { Mall, Eatery } from "@/types/mall";


export interface Suggestion {
  type: "mall" | "eatery";
  name: string;
  id: string;
  mall?: string;
  mallId?: string;
}


interface SearchBarProps {
  malls: Mall[];
  onSearch: (term: string) => void;
  onSelect: (item: Suggestion) => void; // updated type here
}

export default function SearchBar({ malls, onSearch, onSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const matches: Suggestion[] = [];

    malls.forEach((mall) => {
      if (mall.name.toLowerCase().includes(lower)) {
        matches.push({ type: "mall", name: mall.name, id: mall.id });
      }
      mall.eateries.forEach((eatery) => {
        if (eatery.name.toLowerCase().includes(lower)) {
          matches.push({
            type: "eatery",
            name: eatery.name,
            id: eatery.id,
            mall: mall.name,
            mallId: mall.id,
          });
        }
      });
    });

    setSuggestions(matches);
  }, [searchTerm, malls]);

  const onSelectSuggestion = (suggestion: Suggestion) => {
    setSearchTerm("");
    setShowSuggestions(false);
    setSuggestions([]);
    onSelect(suggestion); // now passes a Suggestion object
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mb-6">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 rounded-lg text-black bg-white"
        placeholder="Search for a mall or eatery..."
      />

      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white w-full shadow rounded mt-1 text-black max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectSuggestion(s)}
            >
              {s.type === "mall" ? `🏬 ${s.name}` : `🍽️ ${s.name} @ ${s.mall}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
