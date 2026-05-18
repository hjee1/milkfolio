// All 9 designer projects. Pure data — imported by both the page (Server
// Component for the grid) and the modal (Client Component for navigation).
// Identical content to the legacy designer/index.html embedded JS array.

export type ProjectMeta = { label: string; value: string };
export type ProjectDescSection = { title: string; text: string };
export type ProjectLink = { label: string; url: string };

export type Project = {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  meta: ProjectMeta[];
  thumbnail: string;
  images: string[];
  desc: ProjectDescSection[];
  tags: string[];
  links: ProjectLink[];
};

const IMG_BASE = "/designer/images";

export const PROJECTS: Project[] = [
  {
    id: "prism",
    num: "01",
    title: "PRISM",
    subtitle: "Precision Robot for Interactive Super Microsurgery",
    meta: [
      { label: "Role", value: "Industrial Design Intern" },
      { label: "Organization", value: "KIST Robogram Lab" },
      { label: "Scope", value: "Exterior Mockup, Branding, Video" },
    ],
    thumbnail: `${IMG_BASE}/Prism_Thumbnail.jpg`,
    images: Array.from({ length: 8 }, (_, i) => `${IMG_BASE}/Prism_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Problem & Process",
        text: "Post-surgery challenges for cancer, diabetes, and accident patients demand precision beyond human capability. The PRISM robot, with 4 independently moving arms, needed an exterior that communicated medical trust and cutting-edge technology. As an intern at KIST, I led the exterior mockup through multiple iterations — from 3D modeling in Rhino to pre-production prototypes.",
      },
      {
        title: "Outcome",
        text: "The completed prototype was exhibited at RoboWorld 2023 (KINTEX), demonstrating live surgical precision. The branding system — logo, video, and exhibition materials — established PRISM's visual identity for the national research project.",
      },
    ],
    tags: ["3D Modeling", "Rhino", "Branding", "Prototyping", "Exhibition"],
    links: [
      { label: "Lab Exhibition", url: "https://robogram-lab.com/%EC%A0%80%EC%9E%A5%EC%86%8C/1496" },
      { label: "Project Video", url: "https://www.youtube.com/watch?v=GS72B9QmkK8" },
    ],
  },
  {
    id: "unmute",
    num: "02",
    title: "Unmute",
    subtitle: "Prosumer Sound Culture Platform",
    meta: [
      { label: "Type", value: "Service & Product Design" },
      { label: "Focus", value: "AI + Sound + Consumer Experience" },
    ],
    thumbnail: `${IMG_BASE}/Unmute_Thumbnail.jpg`,
    images: Array.from({ length: 8 }, (_, i) => `${IMG_BASE}/Unmute_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Concept",
        text: "Unmute proposes a Prosumer Culture where consumers become creators. A portable device records ambient sounds, transforms them into beats with shake gestures, and an AI engine composes personalized tracks based on mood, context, and taste.",
      },
      {
        title: "System",
        text: "The ecosystem spans three touchpoints: a pocket-sized recording device, a Sound Library app, and Sound Snap — a social feature for sharing daily sound-based short-form content. Product prototypes created using generative AI, alongside exhibition materials.",
      },
    ],
    tags: ["Product Design", "Service Design", "Generative AI", "UX/UI", "Branding"],
    links: [
      { label: "Online Exhibition", url: "http://kiid.korea.ac.kr/2025/works/product-development/UNMUTE/" },
      { label: "Project Video", url: "https://www.instagram.com/reel/DREq1m5AVnb/?igsh=dXNmZWIzMWR3Y3pp" },
    ],
  },
  {
    id: "xpense",
    num: "03",
    title: "XPense",
    subtitle: "Game Spending Management Solution",
    meta: [
      { label: "Type", value: "App + Web + Device" },
      { label: "Focus", value: "Behavioral Design for Responsible Gaming" },
    ],
    thumbnail: `${IMG_BASE}/XPense_Thumbnail.jpg`,
    images: Array.from({ length: 6 }, (_, i) => `${IMG_BASE}/XPense_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Problem",
        text: "In-game microtransaction systems encourage spending, but eliminating them isn't realistic. Gamers need tools to manage — not restrict — their habits.",
      },
      {
        title: "Solution",
        text: "XPense is a three-part ecosystem: a mobile app for spending tracking, a dual-screen desktop device for real-time control during gameplay, and a web dashboard for analysis. Features include actual vs. stated probability comparison, AI-powered recommendations, and haptic feedback.",
      },
    ],
    tags: ["UX/UI", "Product Design", "Data Visualization", "Behavioral Design"],
    links: [
      { label: "Online Exhibition", url: "http://kiid.korea.ac.kr/2025/works/product-system-design/XPense/" },
      { label: "Project Video", url: "https://www.instagram.com/reel/DREZNP2gVvB/" },
    ],
  },
  {
    id: "pathguard",
    num: "04",
    title: "PathGuard",
    subtitle: "Smart Floor Emergency Evacuation Guide",
    meta: [
      { label: "Award", value: "Easy Lab Makerthon Excellence Award" },
      { label: "Focus", value: "Public Safety & IoT" },
    ],
    thumbnail: `${IMG_BASE}/Pathguard_Thumbnail.jpg`,
    images: Array.from({ length: 4 }, (_, i) => `${IMG_BASE}/Pathguard_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Problem",
        text: "Building fires occur persistently. Current exit signs suffer from low visibility in smoke, and occupants often don't know evacuation routes. Ground-level visual guidance is more effective than overhead signage.",
      },
      {
        title: "Solution",
        text: "PathGuard is a smart floor-embedded LED guide system with temperature sensors. During normal operation, it provides wayfinding. When fire is detected, it dynamically routes occupants away from danger. Prototyped using Hyundai Department Store floor plans.",
      },
    ],
    tags: ["IoT", "Arduino", "3D Modeling", "Social Design"],
    links: [],
  },
  {
    id: "instip",
    num: "05",
    title: "INSTIP",
    subtitle: "Universal Wearable for Deaf Taxi Drivers",
    meta: [
      { label: "Award", value: "Daejeon Design Award" },
      { label: "Focus", value: "Inclusive Design & NUI" },
    ],
    thumbnail: `${IMG_BASE}/Instip_Thumbnail.jpg`,
    images: Array.from({ length: 6 }, (_, i) => `${IMG_BASE}/Instip_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Problem",
        text: 'Despite no legal barriers, deaf taxi drivers face communication difficulties. "Silent Taxi" services use tablets, but passengers report frustration with ambiguous text and slow delivery.',
      },
      {
        title: "Solution",
        text: "INSTIP is a finger-worn wearable using Natural User Interface (NUI) principles. It detects motion to convert handwriting to text in real-time, with multi-feedback (LED, vibration). Features magnetic 360° angle control and handwriting recognition on any surface.",
      },
    ],
    tags: ["Universal Design", "Wearable", "NUI", "Product Design"],
    links: [],
  },
  {
    id: "eng",
    num: "06",
    title: "-ENG",
    subtitle: "English Pronunciation Rhythm Acquisition Device",
    meta: [
      { label: "Type", value: "Product + Service Design" },
      { label: "Focus", value: "EdTech & Multi-Sensory Learning" },
    ],
    thumbnail: `${IMG_BASE}/-ENG_Thumbnail.jpg`,
    images: Array.from({ length: 4 }, (_, i) => `${IMG_BASE}/-ENG_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Problem",
        text: 'Current pronunciation services fix "results" but miss the "cause." Learners struggle with stress, pitch, and intonation — the patterns that make someone sound native.',
      },
      {
        title: "Approach",
        text: "-ENG uses three-stage multi-sensory learning: (1) Auditory — a 40mm device captures ambient sounds as rhythm patterns; (2) Tactile — vibration patterns mapped to English syllable stress; (3) Visual — scan mode reactivates words through vibration and pronunciation simultaneously.",
      },
    ],
    tags: ["Product Design", "Service Design", "EdTech", "UX/UI"],
    links: [
      { label: "Project Video", url: "https://drive.google.com/file/d/1bdewGTOSICY4_DEtH2Fc3rnAkAhybd99/view" },
    ],
  },
  {
    id: "kupid",
    num: "07",
    title: "KUPID",
    subtitle: "Korea University Portal Redesign & App",
    meta: [
      { label: "Type", value: "UX/UI Redesign" },
      { label: "Platform", value: "Web + Mobile App" },
    ],
    thumbnail: `${IMG_BASE}/KUPID_Thumbnail.jpg`,
    images: Array.from({ length: 4 }, (_, i) => `${IMG_BASE}/KUPID_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Problem",
        text: "The university portal is essential for student life yet students found it unusable. Excessive information, inconsistent navigation, and no mobile experience.",
      },
      {
        title: "Solution",
        text: "The redesign centered on icon shortcuts, enhanced search, custom menus for personalization, and a native mobile app. New features include pre-login notice previews, visual grade tracking, and streamlined scholarship applications.",
      },
    ],
    tags: ["UX Research", "UI Design", "Persona", "Mobile App", "Figma"],
    links: [],
  },
  {
    id: "memmo",
    num: "08",
    title: "mêm mo",
    subtitle: "Community Screening Crowdfunding Platform",
    meta: [
      { label: "Type", value: "Service Design & UX/UI" },
      { label: "Focus", value: "Cultural Platform & Crowdfunding" },
    ],
    thumbnail: `${IMG_BASE}/memmo_Thumbnail.jpg`,
    images: Array.from({ length: 5 }, (_, i) => `${IMG_BASE}/memmo_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Problem",
        text: "Post-pandemic audiences crave diverse film experiences. Community screenings remain inaccessible — hard to find, difficult to organize, financially risky.",
      },
      {
        title: "Concept",
        text: '"mêm mo" (French "même moment") is a crowdfunding-based community screening platform. Five tabs serve distinct journeys: Home, Explore, Community, Host, and My — lowering barriers for both participation and hosting.',
      },
    ],
    tags: ["Service Design", "UX/UI", "Branding", "Cultural Design"],
    links: [],
  },
  {
    id: "linkids",
    num: "09",
    title: "Linkids",
    subtitle: "Experience-Based Children's Education Brand",
    meta: [
      { label: "Type", value: "Brand & Service Design" },
      { label: "Scope", value: "App, Branding, Print Collateral" },
    ],
    thumbnail: `${IMG_BASE}/Linkids_Thumbnail.jpg`,
    images: Array.from({ length: 6 }, (_, i) => `${IMG_BASE}/Linkids_Detail ${i + 1}.jpg`),
    desc: [
      {
        title: "Concept",
        text: "Linkids is a children's education brand built around learning through experience and self-expression. The dual-mode app lets parents see an emotion-based dashboard while children interact through seeing, feeling, and expressing.",
      },
      {
        title: "Brand System",
        text: 'Kids\' business cards for imaginary careers, on-site ID cards for workshop belonging, branded notebooks for "memory, imagination, and expression," and posters combining the signature ring motif with playful icons.',
      },
    ],
    tags: ["Brand Design", "UX/UI", "Print Design", "Children's Design"],
    links: [{ label: "Online Exhibition", url: "https://designbranding.co.kr/1667432fe37337" }],
  },
];
