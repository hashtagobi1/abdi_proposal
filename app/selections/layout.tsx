import SelectionsExplorer from "./SelectionsExplorer";

export const metadata = {
  metadataBase: new URL("https://summerisours.vercel.app"),
  title: "G's Selections · London this week",
  description: "G's weekly picks of London's creative scene, on a map.",
};

// The explorer lives in the layout so the map stays mounted while the URL
// changes between /selections and /selections/<event>.
export default function SelectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SelectionsExplorer />
      {children}
    </>
  );
}
