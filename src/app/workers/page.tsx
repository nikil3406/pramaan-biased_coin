import { ModulePage } from "@/components/ModulePage";
export default async function Page({ searchParams }: { searchParams: Promise<{ trade?: string }> }) {
  const { trade = "" } = await searchParams;
  return <ModulePage module="workers" selectedTrade={trade}/>;
}
