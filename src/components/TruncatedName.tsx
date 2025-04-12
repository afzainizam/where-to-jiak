// TruncatedName.tsx
"use client";

import { useState, useRef, useEffect } from "react";

interface TruncatedNameProps {
  fullName: string;
  maxLength: number;
}

const TruncatedName: React.FC<TruncatedNameProps> = ({ fullName, maxLength }) => {
  const [showBubble, setShowBubble] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Compute the truncated version of the name.
  const truncated =
    fullName.length > maxLength ? fullName.slice(0, maxLength) + "..." : fullName;

  // This event handler checks if a click is outside the component.
  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setShowBubble(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <span
        onClick={() => setShowBubble((prev) => !prev)}
        className="cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
      >
        {truncated}
      </span>
      {showBubble && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-gray-800 text-white rounded shadow-lg z-10">
          {fullName}
        </div>
      )}
    </div>
  );
};

export default TruncatedName;
