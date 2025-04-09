import Link from "next/link";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type MallType = {
  id: string;
  name: string;
};

interface MallSquaresRowProps {
  malls: MallType[];
}

export default function MallSquaresRow({ malls }: MallSquaresRowProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(malls.length / itemsPerPage);

  const currentMalls = malls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex items-center justify-between my-4">
      {/* Left Button */}
      <button
        onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 disabled:opacity-50"
      >
        <FaChevronLeft />
      </button>

      {/* Grid Container for the Mall Squares */}
      <div className="grid grid-cols-5 gap-2 w-full">
        {currentMalls.map((mall) => (
          <div
            key={mall.id}
            className="bg-gray-800 text-white flex flex-col items-center justify-center rounded shadow p-2 aspect-square"
          >
            <p className="text-center text-xs">{mall.name}</p>
            <Link href={`/mall/${mall.id}`}>
              <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded">
                View Jiak Spots
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Right Button */}
      <button
        onClick={() =>
          setCurrentPage((page) => Math.min(page + 1, totalPages))
        }
        disabled={currentPage === totalPages || totalPages === 0}
        className="p-2 disabled:opacity-50"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
