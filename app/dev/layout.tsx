import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hyunwoo Jee — Data Engineer",
  description:
    "Data Engineer at Hanwha System. Airflow, Databricks, Snowflake, Cognite.",
  openGraph: {
    title: "Hyunwoo Jee — Data Engineer",
    description:
      "Data Engineer at Hanwha System. Airflow, Databricks, Snowflake, Cognite.",
    url: "https://milkfolio.space/dev/",
    type: "profile",
  },
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  // data-accent="dev" switches --color-accent to the cyan brand color
  // for any token-aware descendant (utility classes, page CSS modules).
  return <div data-accent="dev">{children}</div>;
}
