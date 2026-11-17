import SelectionsExplorer from "./SelectionsExplorer";
import { getSelections } from "@/lib/store";

export const metadata = {
  title: "G's Selections · London this week",
  description: "G's weekly picks of London's creative scene, on a map.",
};

// Rendered on request so updates from /admin show up without a redeploy.
// lib/store.ts caches the data briefly, so this stays fast.
export const dynamic = "force-dynamic";

// The explorer lives in the layout so the map stays mounted while the URL
// changes between /selections and /selections/<event>.
export default async function SelectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getSelections();
  return (
    <>
      <SelectionsExplorer data={data} />
      {children}
    </>
  );
}
