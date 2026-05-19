import { Hero } from "./_components/Hero";
import { Manifesto } from "./_components/Manifesto";
import { Lab } from "./_components/Lab";
import { Stack } from "./_components/Stack";
import { Craft } from "./_components/Craft";
import { Contact } from "./_components/Contact";
import { DevNav } from "./_components/DevNav";

// /dev — Hyunwoo Jee (AI Technical Engineer) portfolio.
//
// Composition only. Each section is a self-contained component with its own
// stylesheet under app/dev/_components/. Order matches SPEC-DEV-REDESIGN-001
// REQ-DEV-U-001: Hero → Manifesto → Lab → Stack → Craft → Contact.
//
// Server Component by default; Hero/Lab/Craft contain client subtrees for
// interactive bits. No legacy "Data Engineer" markup remains.

export default function DevPage() {
  return (
    <>
      <DevNav />
      <Hero />
      <Manifesto />
      <Lab />
      <Stack />
      <Craft />
      <Contact />
    </>
  );
}
