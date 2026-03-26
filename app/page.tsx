import { getData } from "@/lib/data";
import FactionIndex from "./_components/FactionIndex";

export default function Home() {
  const data = getData().filter((f) => {
    const name = String(f.name || "").trim().toLowerCase();
    // Wahapedia export id for Adeptus Titanicus is `TL`.
    return f.id !== "TL" && name !== "adeptus titanicus";
  });
  return <FactionIndex factions={data} />;
}