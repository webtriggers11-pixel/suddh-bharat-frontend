import type { Metadata } from "next";
import { SearchScreen } from "../components/search/SearchScreen";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: false },
};

export default function SearchPage() {
  return <SearchScreen />;
}
