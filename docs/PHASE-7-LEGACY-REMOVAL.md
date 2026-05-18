# Phase 7 — Legacy HTML 제거

GitHub Pages 시대의 정적 HTML 파일들을 안전하게 제거하는 절차.
SPEC-MIGRATE-NEXT-001 Phase 7.

## ⚠️ 사전 조건 (반드시 확인)

- [ ] Phase 6 Vercel 배포 성공 + 5 페이지 모두 production URL 에서 정상 작동
- [ ] `milkfolio.space` DNS 가 Vercel 을 가리킴 (24시간 이상 안정)
- [ ] `agent/data.html` 클릭 가능 (casting-agent 다음 cron 이후)
- [ ] GitHub Pages 비활성화됨 (Settings → Pages → Source: None)
- [ ] 최소 3~7일 모니터링 (다음 daily 리포트까지 + 한 주말 끼움)

위 조건 중 하나라도 미달이면 **실행 금지**. 한 번 제거하면 git revert 외 복구 어려움.

## 제거 대상

```
index.html                  # 3-panel 랜딩 → app/page.tsx 로 대체
404.html                    # → Next.js 자동 not-found
actor/index.html            # → app/actor/page.tsx
actor/style.css             # → app/actor/page.module.css
actor/assets/               # → public/actor/assets/ (이미 복사됨)
dev/index.html              # → app/dev/page.tsx
dev/style.css               # → app/dev/page.module.css
designer/index.html         # → app/designer/page.tsx + ProjectGallery.tsx
designer/style.css          # → app/designer/*.module.css
designer/images/            # → public/designer/images/ (이미 복사됨)
agent/index.html            # → app/agent/AgentClient.tsx
CNAME                       # Vercel 이 도메인 직접 관리
```

## 유지 대상 (절대 건드리지 말 것)

```
agent/data.html             # casting-agent 가 push, Next.js Server Action 읽음
app/                        # Next.js 라우트
components/                 # 공유 컴포넌트
lib/                        # parser, utils
public/                     # 이전된 정적 자산
```

## 실행 절차

### 1단계 — 백업 브랜치 생성 (안전망)

```bash
cd ~/milkfolio
git checkout -b legacy-archive-2026-05
git push origin legacy-archive-2026-05
git checkout main
```

이렇게 두면 legacy 시점 그대로의 코드가 영구 보존됨 (브랜치 삭제하지 않는 이상).

### 2단계 — 제거 + commit

```bash
cd ~/milkfolio
git rm -r \
  index.html \
  404.html \
  actor/index.html actor/style.css actor/assets \
  dev/index.html dev/style.css \
  designer/index.html designer/style.css designer/images \
  agent/index.html \
  CNAME

git commit -m "chore(legacy): remove GitHub-Pages HTML (SPEC-MIGRATE-NEXT-001 Phase 7)

Vercel deploy of the Next.js app has been stable since [DATE].
All five routes (/, /actor, /dev, /designer, /agent) are served by
app/ now. agent/data.html remains in place — it is still pushed by
hjee1/casting-agent and read by app/agent/actions.ts at runtime.

Legacy snapshot preserved at branch legacy-archive-2026-05 in case
rollback is ever needed."

git push origin main
```

### 3단계 — Vercel 재배포 자동 트리거

Vercel 은 main push 마다 자동 빌드. 빌드 통과 + 5 페이지 응답 정상 확인.

### 4단계 — e2e 회귀 검증

```bash
cd ~/milkfolio
pnpm e2e
# 20/20 통과해야 함
```

## agent/data.html 이전 (선택 사항, 미래 작업)

현재 root `agent/data.html` 위치는 GitHub Pages 시대의 흔적. 더 깔끔하게
정리하려면 `public/agent/data.html` 로 이동:

1. casting-agent (`hjee1/casting-agent`) 의 GH Actions push 스크립트 수정
   - target path 변경: `agent/data.html` → `public/agent/data.html`
2. milkfolio `app/agent/actions.ts` 수정
   - `path.join(process.cwd(), "agent", "data.html")`
   - → `path.join(process.cwd(), "public", "agent", "data.html")`
3. 두 변경을 같은 cron 사이클에 맞춰 push (시간 어긋나면 1 cron 동안 빈 dashboard)

별도 SPEC 으로 진행 권장 (예: SPEC-DATA-PATH-MIGRATE-001).

---

마지막 업데이트: 2026-05-18
SPEC: SPEC-MIGRATE-NEXT-001 Phase 7
