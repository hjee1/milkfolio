---
id: SPEC-AGENT-SEARCH-001
version: 0.1.0
status: Planned
created: 2026-05-17
updated: 2026-05-17
author: Hyunwoo Jee
priority: Medium
issue_number: null
---

## HISTORY

- 2026-05-17: 초안 작성. 캐스팅 에이전트 대시보드(`agent/index.html`)에 클라이언트 사이드 한국어 검색창 추가 PoC 사양 정의.

---

## Summary

캐스팅 에이전트 대시보드의 `지원 내역 (전체)` 표(`#tbl-apps`)를 실시간으로 필터링하는 검색 입력창을 `agent/index.html`에 추가한다. 운영자(actor 본인)가 한국어 키워드를 입력하면 제목·역할·수신 이메일 컬럼에서 부분 일치하는 행만 즉시 표시된다. 외부 의존성 없이 순수 HTML/CSS/JS 단일 파일 변경이며, 자동 생성되는 `data.html`은 수정하지 않는다.

---

## Goals / Non-Goals

### Goals

- 운영자가 키보드 입력만으로 표 행을 좁혀볼 수 있다 (43행 → 관심 행).
- 검색은 클라이언트 사이드에서 즉시 동작하며 네트워크 호출이 없다.
- `loadDashboard()`가 `data.html`을 재주입해도 검색창 자체는 유지된다.
- 모바일(아이폰 폭 375px) 환경에서도 탭 가능한 크기로 표시된다.

### Non-Goals

- 백엔드(`dashboard.py`) 수정.
- 검색 결과의 영구 저장(URL 쿼리, localStorage 등).
- 필터(상태/날짜) · 정렬 · 페이지네이션 통합.
- 키워드 하이라이트, 자동완성, 정규식 입력.

---

## EARS Requirements

- **REQ-AS-001 (Ubiquitous)**: The 대시보드 페이지 **shall** 인증 통과 후 `#dashboard-frame` 바로 위에 검색 입력창(`#search-box`)을 렌더링한다.
- **REQ-AS-002 (Event-Driven)**: **When** 사용자가 `#search-box`에 문자를 입력(`input` 이벤트)하면, the 검색 스크립트 **shall** `#tbl-apps tbody tr` 각 행의 표시 여부를 즉시 갱신한다.
- **REQ-AS-003 (State-Driven)**: **While** 입력값이 비어있지 않은 동안, the 검색 스크립트 **shall** 각 행에 대해 제목 셀의 `title` 속성(전체 텍스트), 역할 셀(컬럼 4), 수신 이메일 셀(컬럼 5) 세 곳을 소문자 변환 후 `includes()`로 부분 일치 검사하여 하나라도 일치하면 표시한다.
- **REQ-AS-004 (Event-Driven)**: **When** 입력값이 빈 문자열로 돌아오면, the 검색 스크립트 **shall** 모든 행의 `display` 스타일을 초기화하여 전체 43행을 다시 표시한다.
- **REQ-AS-005 (State-Driven)**: **While** 검색어가 입력된 상태인 동안, the 검색 스크립트 **shall** 기존 페이지네이션(`pagerStep`)을 무시하고 일치하는 모든 행을 한 번에 표시한다. (PoC 단순화: 필터 + 페이저 동시 동작 미지원)
- **REQ-AS-006 (Ubiquitous)**: The 검색 입력창 **shall** `#dashboard-frame` 외부에 위치하여 `loadDashboard()`의 `innerHTML` 재주입 시 사라지지 않는다.
- **REQ-AS-007 (Ubiquitous)**: The 검색 입력창 **shall** 최소 44px 높이의 터치 타깃을 가지며, 뷰포트 폭 ≤600px에서 가로 스크롤을 유발하지 않는다.
- **REQ-AS-008 (Unwanted Behavior)**: **If** 신규 스크립트가 함수 선언을 `function name() {}` 형태로만 노출하면, **then** the 구현 **shall** 거부된다. 모든 신규 함수는 `window.fnName = function(...)` 패턴으로 전역에 바인딩해야 한다. (사유: `loadDashboard()`가 `data.html` 스크립트를 `<head>`에 재첨부할 때 인라인 `onclick` 핸들러가 `window.*`를 참조함)
- **REQ-AS-009 (Event-Driven)**: **When** 입력값에 일치하는 행이 0건이면, the 검색 스크립트 **shall** `#search-empty` 안내 메시지(`검색 결과 없음`)를 표시하고, 입력값이 비거나 다시 일치가 발생하면 메시지를 숨긴다.

---

## Acceptance Criteria

작성 형식: Gherkin Given/When/Then. 모든 시나리오는 브라우저에서 비개발자가 수동으로 검증 가능해야 한다.

### AC-1: 작품 제목 키워드 필터링

```
Given 운영자가 milkfolio.space/agent/ 에 로그인하여 대시보드를 보고 있다
When 검색창에 "단국대학교" 를 입력한다
Then 표에는 제목 title 속성에 "단국대학교"가 포함된 행만 보인다 (예: 데이터 기준 1행)
And 다른 모든 행은 숨겨진다
```

### AC-2: 역할 키워드 필터링

```
Given 대시보드가 로드된 상태이다
When 검색창에 "남" 을 입력한다
Then 역할 컬럼에 "남"이 포함된 행 (예: "언희 (29세, 남)")이 보인다
```

### AC-3: 수신 이메일 부분 일치

```
Given 대시보드가 로드된 상태이다
When 검색창에 "gmail" 을 입력한다
Then 수신 컬럼이 "@gmail.com"으로 끝나는 모든 행이 보인다
```

### AC-4: 빈 입력 복원

```
Given 검색창에 키워드를 입력하여 일부 행만 보이는 상태이다
When 검색창의 텍스트를 전부 지운다
Then 전체 43개 행이 모두 다시 보인다
And "검색 결과 없음" 안내는 사라진다
```

### AC-5: 무일치 안내

```
Given 대시보드가 로드된 상태이다
When 검색창에 "xyznotfound한글" 처럼 어떤 행과도 일치하지 않는 문자열을 입력한다
Then 모든 행이 숨겨지고 "검색 결과 없음" 텍스트가 표시된다
```

### AC-6: 모바일 가시성

```
Given 아이폰 사파리(또는 크롬 개발자도구 iPhone 375px 프리셋)로 페이지를 본다
When 인증 후 대시보드를 본다
Then 검색창이 화면 안에 들어오고, 가로 스크롤이 생기지 않는다
And 검색창을 탭하면 키보드가 정상적으로 올라온다 (높이 ≥44px)
```

---

## Out of Scope

- 감독명·소속 검색 — `dashboard.py`가 해당 데이터를 노출하지 않음. 별도 SPEC에서 백엔드 변경과 함께 다룬다.
- 상태(sent/draft) · 날짜 범위 · 분류 필터 — future SPEC.
- 날짜/제목/감독 정렬 — future SPEC.
- filmmakers.co.kr 원본 링크 — `dashboard.py`가 url 필드를 노출해야 가능. future SPEC.
- 페이저(`pagerStep`)와 검색의 동시 동작 — 검색 활성 시 페이저를 무시하도록만 처리(REQ-AS-005). 통합은 future SPEC.
- 검색 키워드 하이라이트, 자동완성, 정규식, fuzzy match.
- 검색 상태의 URL 동기화/세션 저장.

---

## Constraints (HARD Rules)

- [HARD] `agent/data.html`을 수정하지 않는다. 해당 파일은 `hjee1/casting-agent` GitHub Actions가 매 실행마다 덮어쓴다.
- [HARD] 모든 신규 함수는 `window.fnName = function(...)` 패턴으로 정의한다. 일반 `function fnName()` 선언은 `innerHTML` 재주입 컨텍스트에서 `window.*` 바인딩 보장이 없으므로 금지.
- [HARD] 인라인 `onclick` 핸들러를 추가하는 경우 `event`를 명시적으로 전달한다 (예: `onclick="window.fnName(event)"`).
- [HARD] 검색 입력창(`#search-box`)은 `#dashboard-frame` 외부에 배치한다. 내부에 두면 `loadDashboard()`의 `frame.innerHTML = html` 라인에서 사라진다.
- [HARD] 배포된 `https://milkfolio.space/agent/` 환경에서 검증한다. `file://` 로컬 열기는 `fetch()` + `sessionStorage` 플로우가 정상 동작하지 않으므로 검증 불가.
- [HARD] 변경 대상 파일은 `agent/index.html` 한 개로 제한한다.

---

## File Impact

대상 파일: `agent/index.html` (단일 파일, 현재 143줄)

예상 변경 영역:

1. **CSS (Line 8~63 내부 `<style>` 블록)**
   - `#search-box` 컨테이너 스타일 추가 (max-width, padding, 모바일 반응형).
   - `#search-box input` 입력 필드 스타일 (height ≥44px, border, accent focus 색상 `--accent`).
   - `#search-empty` 안내 텍스트 스타일 (숨김 기본, `.show` 클래스로 표시).

2. **Markup (Line 73 `<div id="dashboard">` 와 Line 74 `<div id="dashboard-frame">` 사이)**
   - `<div id="search-box">` 컨테이너 + `<input id="search-input">` + `<div id="search-empty">` 삽입.
   - `#dashboard-frame` 외부, `#dashboard` 내부에 위치 — 인증 후에만 보이고 재주입에 영향받지 않는 구조.

3. **Script (Line 79~139 `<script>` 블록 끝, `loadDashboard()` 정의 이후)**
   - `window.applySearch = function() { ... }` 정의: `#tbl-apps tbody tr` 순회, 세 셀에서 lowercase `includes()` 매칭.
   - `document.getElementById('search-input').addEventListener('input', window.applySearch)` 바인딩.
   - `loadDashboard()` 완료 후(또는 `.then()` 체인 끝)에 `window.applySearch()`를 1회 호출하여 재주입 후에도 기존 입력값에 맞춰 필터 상태 복원.

코드 추가 분량: 약 40~60 LOC (CSS ~20 / markup ~5 / JS ~20).

---

## Verification Steps

비개발자도 브라우저에서 직접 확인할 수 있도록 단계별 절차를 명시한다.

1. **배포 확인**: 변경 사항을 `main`에 push하고 GitHub Pages 빌드가 끝날 때까지 대기 (보통 30~60초).
2. **로그인**: `https://milkfolio.space/agent/` 접속 → 비밀번호 입력 → 대시보드 진입.
3. **AC-1 검증**: 검색창에 `단국대학교` 입력 → 해당 키워드 포함 행만 보이는지 확인.
4. **AC-2 검증**: 검색창을 비우고 `남` 입력 → 역할에 "남"이 포함된 행이 보이는지 확인.
5. **AC-3 검증**: `gmail` 입력 → 수신 이메일이 gmail인 행만 보이는지 확인.
6. **AC-4 검증**: 입력창 전부 지우기 → 표 하단에 표시된 `총 43건` 등 안내와 함께 모든 행이 복원되는지 확인.
7. **AC-5 검증**: `zzzz없는단어` 입력 → 모든 행이 숨고 `검색 결과 없음` 메시지 표시 확인.
8. **AC-6 (모바일)**: 크롬 DevTools → Toggle device toolbar → iPhone SE (375×667) 선택 → 검색창이 화면 너비에 맞고 가로 스크롤이 없으며, 탭 시 키보드 영역과 겹치지 않고 입력 가능함을 확인.
9. **재주입 회귀 검증**: 페이지를 그대로 두고 다음 `casting-agent` pipeline 실행을 기다리거나(또는 강제로 `loadDashboard()`를 콘솔에서 재호출) → 검색창이 사라지지 않고, 입력값이 남아있다면 새 데이터에도 동일 필터가 적용되는지 확인.

---

## Exclusions (What NOT to Build)

- 키워드 하이라이트(`<mark>` 래핑) — PoC 범위 밖.
- 검색 디바운스(debounce) — 43행 규모에서 불필요.
- 페이지네이션과의 통합 동작 — REQ-AS-005에서 명시적으로 페이저 무시로 단순화.
- 백엔드(`dashboard.py`) 변경 — 별도 리포지토리(`hjee1/casting-agent`)의 워크플로 변경 필요. 별도 SPEC.
- 다국어 입력(영문/한자 혼합) 정규화 — 한국어 substring `.includes()`로 충분.
- 검색 이력/즐겨찾기 — 비범위.
