import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { PageEditorForm } from "@/components/admin/PageEditorForm";

export default async function NewPagePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageEditorForm isEdit={false} />
    </div>
  );
}
