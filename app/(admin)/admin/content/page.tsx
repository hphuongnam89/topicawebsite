import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ContentWorkbench } from "@/components/admin/ContentWorkbench";
export default async function ContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return <ContentWorkbench isAdmin={user.role === "admin"} />;
}
