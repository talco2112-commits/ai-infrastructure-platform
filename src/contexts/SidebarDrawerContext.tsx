"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

interface Ctx {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarDrawerContext = createContext<Ctx | null>(null);

export function SidebarDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(v => !v), []);
  const close  = useCallback(() => setOpen(false), []);
  const value  = useMemo(() => ({ open, toggle, close }), [open, toggle, close]);

  return (
    <SidebarDrawerContext.Provider value={value}>
      {children}
    </SidebarDrawerContext.Provider>
  );
}

export function useSidebarDrawer() {
  const ctx = useContext(SidebarDrawerContext);
  if (!ctx) throw new Error("useSidebarDrawer must be inside SidebarDrawerProvider");
  return ctx;
}
