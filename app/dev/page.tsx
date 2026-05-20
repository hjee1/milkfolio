import { DevNav } from "./_components/DevNav";
import { Hero } from "./_components/Hero";
import { WhatIDo } from "./_components/WhatIDo";
import { Experience } from "./_components/Experience";
import { Footer } from "./_components/Footer";

// /dev — Hyunwoo Jee · AI Engineer.
//
// Four sections:
//   01 Hero       — identity + dynamic R3F backdrop + live system board
//   02 WhatIDo    — current work + live agent transcript + small interactive demos
//   03 Experience — career timeline showing the data → AI transition
//   04 Footer     — compact contact + inline live telemetry
//
// Each section is a self-contained component with its own stylesheet. Hero,
// WhatIDo (ticker + minis), and Footer (telemetry) have client subtrees;
// Experience is fully static.

export default function DevPage() {
  return (
    <>
      <DevNav />
      <Hero />
      <WhatIDo />
      <Experience />
      <Footer />
    </>
  );
}
