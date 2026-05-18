# Vercel 배포 가이드

milkfolio.space 도메인을 GitHub Pages → Vercel 로 전환하는 절차. SPEC-MIGRATE-NEXT-001 Phase 6.

## 사전 조건

- [x] Phase 1~5 완료 (Next.js 빌드, 5 페이지, e2e 통과)
- [x] `vercel.json` + `.vercelignore` 커밋됨
- [ ] Vercel 계정 (https://vercel.com — GitHub OAuth 가입 가능)
- [ ] Namecheap (또는 도메인 등록 업체) 로그인 정보

## 권장: GitHub 연동 방식 (CLI 보다 안전)

PR 마다 자동 preview, main push 자동 production deploy. CLI 설치도 불필요.

### 1단계 — Vercel 프로젝트 import

1. https://vercel.com/new 접속
2. **GitHub 계정 연결** (`hjee1`)
3. **`hjee1/milkfolio`** repo Import 선택
4. 옵션 확인:
   - Framework Preset: **Next.js** (자동 감지)
   - Root Directory: `./`
   - Build Command: `pnpm build` (vercel.json 에 명시)
   - Install Command: `pnpm install --frozen-lockfile` (vercel.json 에 명시)
   - Output Directory: `.next`
   - Node version: 22 (또는 가장 최신 LTS)
5. **Deploy** 클릭. 첫 빌드는 2~3 분.

### 2단계 — Preview URL 검증

빌드 성공 시 Vercel 이 자동 임시 URL 발급 (예: `milkfolio-abc123.vercel.app`).

확인 항목:
- [ ] `/` 3-panel 랜딩 표시
- [ ] `/actor` 한국어 serif 프로필 + 갤러리 이미지 로드
- [ ] `/dev` 영어 cyan 프로필 + stack cards
- [ ] `/designer` 9 프로젝트 + 모달 carousel 작동
- [ ] `/agent` 게이트 → 비밀번호 `1314` → 5섹션 대시보드 표시
- [ ] `/agent` 카드 클릭 → 원본 공고 새 탭 열림 (다음 casting-agent cron 후)
- [ ] 폰트 (Cormorant Garamond / Noto Serif KR / Space Grotesk) 정상 로드 — Vercel 빌드 환경은 Somansa 없으므로 next/font 도 다시 작동 가능 (선택 사항)

문제가 있으면 main 에 push 한 commit 을 보고 Vercel 빌드 로그 확인.

### 3단계 — 커스텀 도메인 연결

Vercel 대시보드 → 프로젝트 선택 → **Settings → Domains** → `milkfolio.space` 추가.

Vercel 이 두 가지 DNS 레코드 안내:

| 레코드 | 호스트 | 값 |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com.` |

(정확한 값은 Vercel 화면 기준 — 변동 가능)

### 4단계 — Namecheap 에서 DNS 변경

1. Namecheap 로그인 → Domain List → `milkfolio.space` → **Manage**
2. **Advanced DNS** 탭
3. 기존 A 레코드 (GitHub Pages IPs: `185.199.108.153`, `.109`, `.110`, `.111`) 4개 모두 **삭제**
4. CNAME `www → hjee1.github.io.` 도 **삭제**
5. 위 3단계의 새 A + CNAME 추가
6. TTL 은 Automatic 또는 5min 으로 짧게 설정 (전환 빠르게)

### 5단계 — DNS 전파 확인

```bash
dig milkfolio.space +short
# 기대값: 76.76.21.21

dig www.milkfolio.space +short
# 기대값: cname.vercel-dns.com. 다음 Vercel IPs
```

전파는 5분 ~ 1시간. `https://milkfolio.space` 직접 접속해 Vercel 응답 확인:

```bash
curl -sI https://milkfolio.space | grep -i "server\|x-vercel"
# server: Vercel
# x-vercel-id: ...
```

### 6단계 — GitHub Pages 비활성화

Vercel 검증 완료 후:

1. `hjee1/milkfolio` repo → **Settings → Pages**
2. **Source: None** 으로 변경 (또는 별도 `legacy` 브랜치로 격리)
3. CNAME 파일 (`milkfolio/CNAME`) 은 GitHub Pages 용이라 더 이상 필요 없음.
   Phase 7 에서 legacy HTML 제거 시 함께 삭제 가능. Vercel 은 자체 도메인 설정으로 인식하므로 root CNAME 파일 무관.

## casting-agent 호환성

`hjee1/casting-agent` 의 GH Actions 가 `agent/data.html` 을 `hjee1/milkfolio` repo 의 `/agent/data.html` 로 push 하는 흐름은 **변경 없음**.

- Push target: `hjee1/milkfolio` repo, `/agent/data.html` 경로 — 그대로
- Next.js Server Action (`app/agent/actions.ts`) 은 `process.cwd()/agent/data.html` 읽음 — 그대로
- Vercel 은 main push 마다 자동 재빌드 — data.html 변경도 새 deploy 트리거 (선택: ignored build step 으로 data.html 변경은 빌드 skip 가능, 운영 후 검토)

## 롤백 절차

문제 발생 시 즉시 GitHub Pages 로 복귀:

1. Namecheap DNS 에서 4단계의 A/CNAME 을 GitHub Pages 값으로 다시 변경
2. Vercel 프로젝트 일시 정지 (Settings → General → Pause)
3. GitHub Pages 재활성화 (Settings → Pages → Source: Deploy from a branch → main /)

전파 시간 5분 ~ 1시간.

## 환경 변수

현재 milkfolio 는 환경 변수 없음. 추후 (Clerk/Supabase 등 도입 시) Vercel 대시보드 → Settings → Environment Variables 에 추가.

---

마지막 업데이트: 2026-05-18
SPEC: SPEC-MIGRATE-NEXT-001 Phase 6
