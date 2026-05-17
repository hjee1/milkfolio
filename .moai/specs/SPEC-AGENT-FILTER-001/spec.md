---
id: SPEC-AGENT-FILTER-001
version: 0.1.0
status: draft
created: 2026-05-17
updated: 2026-05-17
author: Hyunwoo Jee
priority: Medium
issue_number: null
depends_on:
  - SPEC-AGENT-SEARCH-001
  - SPEC-EXTRACT-001
---

# SPEC-AGENT-FILTER-001: 캐스팅 대시보드 필터 및 정렬 컨트롤

## HISTORY

- 2026-05-17: 초안 작성. SPEC-AGENT-SEARCH-001 후속 PoC SPEC. 단일 파일(`agent/index.html`) 수정으로 기간/상태 필터와 정렬, 초기화 버튼을 추가.

---

## Background

`agent/index.html`은 비밀번호 게이트를 통과한 사용자에게 `agent/data.html`을 `innerHTML`로 주입하여 캐스팅 대시보드를 표시한다. SPEC-AGENT-SEARCH-001에서 `#tbl-apps` 테이블 대상의 클라이언트 사이드 검색을 도입했고, SPEC-EXTRACT-001에서 컬럼 구조가 6열/8열 두 형태로 분기되었다.

본 SPEC은 같은 `#tbl-apps`에 기간/상태 필터와 정렬, 초기화 버튼을 추가한다. 모든 동작은 클라이언트 사이드이며, `loadDashboard()`가 `data.html`을 재주입한 뒤에도 검색창과 함께 유지되도록 `#dashboard-frame` 외부에 위치한다.

## Goal

발송된 캐스팅 지원 내역(`#tbl-apps`)을 기간, 상태, 정렬 기준으로 좁혀 보고, 한 번의 클릭으로 모든 필터를 초기화한다.

## Scope

- 대상 테이블: `#tbl-apps` (발송 내역). 다른 테이블에는 영향 없음.
- 단일 파일 수정: `agent/index.html`만 변경. `data.html`은 그대로 사용.
- UI 위치: 검색창 하단, `#dashboard-frame` 외부.

## EARS Requirements

### REQ-FT-001 (Event-Driven)

**When** 사용자가 비밀번호 인증을 통과한 후 대시보드가 표시되면, the system **shall** 검색창(`#search-box`) 아래에 `#filter-bar`를 렌더링하며 그 안에 기간 select, 상태 select, 정렬 select, 초기화 버튼을 한 행에 배치한다.

### REQ-FT-002 (Event-Driven)

**When** 사용자가 검색 입력, 기간 select, 상태 select, 정렬 select 중 어느 하나라도 변경하면, the system **shall** `window.applyAllFilters()`를 호출하여 `#tbl-apps tbody tr` 전체를 단일 패스로 재평가한다.

### REQ-FT-003 (State-Driven)

**While** 기간 필터가 `오늘`/`이번 주`/`이번 달` 중 하나로 설정되어 있는 동안, the system **shall** 각 행의 첫 번째 셀(`tds[0].textContent`, YYYY-MM-DD)을 `Date.parse`로 파싱한 뒤 브라우저 로컬 날짜 기준으로 오늘(자정~자정), 이번 주(월요일~일요일), 이번 달(1일~말일) 범위에 속하는 행만 표시한다.

### REQ-FT-004 (State-Driven)

**While** 상태 필터가 `발송`/`실패`/`건너뜀` 중 하나로 설정되어 있는 동안, the system **shall** 각 행의 마지막 셀에 포함된 `span.badge`의 두 번째 className이 각각 `sent`, `failed`, `skipped`로 시작(`startsWith`)하는 행만 표시한다.

### REQ-FT-005 (Event-Driven)

**When** 정렬 select가 `오래된순` 또는 `제목 ABC`로 변경되면, the system **shall** 표시 중인 행들을 해당 기준(날짜 오름차순 또는 제목 셀의 `localeCompare`)으로 비교한 뒤 `tbody.appendChild(tr)`로 DOM 순서를 재배치한다. 기본값 `최신순`에서는 재정렬을 수행하지 않으며 `dashboard.py`가 emit한 내림차순 순서를 유지한다.

### REQ-FT-006 (Event-Driven)

**When** 사용자가 초기화 버튼(`#filter-reset`)을 클릭하면, the system **shall** `#search-input.value`를 빈 문자열로 설정하고 세 select를 각각 기본값(`전체`, `전체`, `최신순`)으로 되돌린 뒤 `applyAllFilters()`를 호출한다.

### REQ-FT-007 (Ubiquitous)

The system **shall** `applyAllFilters()` 안에서 SPEC-EXTRACT-001이 도입한 6열/8열 레이아웃 모두에서 안전하게 동작해야 하며, `__searchMatchRow`의 `isNew` 호환 처리를 그대로 유지한다.

### REQ-FT-008 (Ubiquitous)

The system **shall** 검색, 기간 필터, 상태 필터를 모두 AND 조건으로 결합하여 평가한 뒤 정렬을 마지막에 적용한다. 어떤 행이 표시되려면 세 조건을 모두 만족해야 한다.

### REQ-FT-009 (Unwanted Behavior)

**If** `loadDashboard()`가 `data.html`을 재주입하여 `#dashboard-frame` 내부 DOM이 교체되면, **then** the system **shall** `#filter-bar`와 `#search-box`를 재생성하지 않고 동일한 인스턴스를 유지하며, 재주입 후 `applySearch`(별칭으로 `applyAllFilters`) 호출이 새 행에 대해 정상 동작해야 한다.

## Exclusions (What NOT to Build)

- 출처 필터(`actorCasting` / `volunteerActor`) — 별도 SPEC에서 다룬다.
- 분류 필터(YES/NO/MAYBE) — `tbl-apps`는 발송 행만 표시하므로 의미가 없다.
- 감독/제작사 정렬 — SPEC-EXTRACT-001에서 컬럼은 추가됐지만 churn이 커서 본 SPEC에서는 보류.
- URL 쿼리 또는 localStorage를 통한 필터 상태 영속화.
- 한 필터 내 다중 선택(multi-select).
- 사용자 지정 날짜 범위 선택기(custom date range picker).
- 페이지네이션과의 통합 — 기존 SPEC-AGENT-SEARCH-001의 "필터 활성 시 페이저 비활성화" 동작을 그대로 유지한다.
- 새 파일 생성, 외부 의존성 추가, localStorage, URL 파라미터 사용.

## HARD Constraints

- 신규 함수는 전부 `window.fnName = function(...) { ... }` 패턴으로 선언한다. `innerHTML` 주입 스크립트 환경에서 inline `onclick`이 참조 가능해야 하기 때문이다(CLAUDE.md "Critical: script re-execution after innerHTML" 참조).
- `#filter-bar`는 `#dashboard-frame` 바깥, `#search-box`와 같은 컨테이너에 위치한다. 그래야 `data.html` 재주입에도 살아남는다.
- UI 레이블은 한국어, 코드 식별자는 영어.
- 빈 결과 상태("검색 결과 없음")는 필터 중 하나라도 활성이고 매칭 행 수가 0일 때만 표시한다(SPEC-AGENT-SEARCH-001 동작 보존).

## Open Questions

- (없음) 모든 결정은 본 SPEC의 "Locked Decisions"에서 확정됨.
