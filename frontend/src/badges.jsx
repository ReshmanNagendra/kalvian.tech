import { useEffect,useState } from "react";


function Badge({ type }) {
  return (
    <span className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full ml-3 text-sm font-bold border border-yellow-300 shadow-lg">
      {type}
    </span>
  );
}

export default Badge;