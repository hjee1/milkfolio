import type { Metadata } from "next";

// /actor 메타데이터 — Phase 1 갱신.
// - title: "서해우 — Actor" (REQ-ACT-U-002 한국어 본문 원칙, "Actor"는 사용자
//   합의된 영문 라벨)
// - description: 캐스팅 inquiry 한 줄 (REQ-ACT-N-003 — 회원/구독/예약/뉴스레터
//   미요구 원칙과 일관)
// - OG image: 기존 hero.jpg 유지 (자산 교체는 Phase 7 rolling 단계)
//
// 페르소나 분리 (REQ-ACT-N-004): description에 IIT/Hanwha/developer/engineer
// 등 prohibited substring을 포함하지 않는다.
export const metadata: Metadata = {
  title: "서해우 — Actor",
  description: "배우 서해우 — 캐스팅 문의는 메인 페이지 하단으로",
  alternates: {
    canonical: "https://milkfolio.space/actor",
  },
  openGraph: {
    title: "서해우 — Actor",
    description: "배우 서해우 — 캐스팅 문의는 메인 페이지 하단으로",
    url: "https://milkfolio.space/actor/",
    type: "profile",
    images: [
      {
        url: "/actor/assets/hero.jpg",
        width: 1280,
        height: 720,
        alt: "배우 서해우",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "서해우 — Actor",
    description: "배우 서해우 — 캐스팅 문의",
    images: ["/actor/assets/hero.jpg"],
  },
};

// data-accent="actor" wrapper는 그대로 유지 (REQ-ACT-U-007).
// Pretendard 웹폰트는 클라이언트 측에서 <link> 태그로 직접 fetch한다
// (next/font/google이 Somansa 코퍼레이트 프록시에서 빌드 시 실패하기 때문 —
// app/layout.tsx의 NOTE 주석과 일관). Cormorant Garamond는 app/globals.css
// @import에서 이미 로드된다.
// --font-pretendard / --font-cormorant CSS 변수 fallback stack은
// app/actor/page.module.css `.body`에 정의한다.
export default function ActorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-accent="actor">
      {/* Pretendard webfont — Phase 1. 추후 self-host로 교체 시 link 제거. */}
      <link
        rel="preconnect"
        href="https://cdn.jsdelivr.net"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
      />
      {children}
    </div>
  );
}
