import { getData } from "@/lib/data";
import FactionIndex from "./_components/FactionIndex";

export default function Home() {
  const data = getData();
  return <FactionIndex factions={data} />;
}