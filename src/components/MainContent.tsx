"use client";

interface Props {
  children: React.ReactNode;
}

export function MainContent({ children }: Props) {
  // Every module (including Schedule) renders its own normal template for every
  // project — non-demo projects just start from empty seed data (see each page's
  // isDemo gate), and the demo project seeds its own bundled sample data.
  return <main className="flex-1 overflow-y-auto">{children}</main>;
}
