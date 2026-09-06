import { Homepage } from "@/components/sections/Homepage";

// Keep the homepage fast after the first render while preserving on-demand
// refreshes from the admin settings endpoint via revalidatePath("/").
export const revalidate = 300;

export default function Home() {
  return <Homepage />;
}
