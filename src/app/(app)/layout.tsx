import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";
import { AiPrompter } from "@/components/AiPrompter";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: "#EDE8E1" }}
      dir={lang === "he" ? "rtl" : "ltr"}
    >
      <Sidebar lang={lang} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <AiPrompter lang={lang} />
    </div>
  );
}
