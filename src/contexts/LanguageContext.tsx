"use client";

import { ReactNode } from "react";
import { t } from "@/lib/i18n";

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useLanguage() {
  return { t };
}
