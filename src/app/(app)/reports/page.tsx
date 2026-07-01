import { cookies } from "next/headers";
import { ReportsPageClient } from "@/components/ReportsPageClient";

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";
  return <ReportsPageClient lang={lang} />;
}
