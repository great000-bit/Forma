import type { Metadata } from "next";
import { Builder } from "@/components/builder/builder";

export const metadata: Metadata = {
  title: "Build your portfolio",
  robots: { index: false, follow: false },
};

export default function BuilderPage() {
  return <Builder />;
}
