# Code Summary - Unit 4: Customer Frontend

## 생성 파일 목록

### 설정 파일 (9개)
| 파일 | 설명 |
|------|------|
| `customer-frontend/package.json` | 프로젝트 의존성 및 스크립트 |
| `customer-frontend/index.html` | HTML 엔트리 포인트 |
| `customer-frontend/vite.config.js` | Vite 빌드/프록시 설정 |
| `customer-frontend/vitest.config.js` | Vitest 테스트 설정 |
| `customer-frontend/eslint.config.js` | ESLint 린트 규칙 |
| `customer-frontend/.prettierrc` | Prettier 포맷팅 규칙 |
| `customer-frontend/.env.development` | 개발 환경 변수 |
| `customer-frontend/.env.production` | 프로덕션 환경 변수 |
| `customer-frontend/.gitignore` | Git 무시 파일 |

### 스타일 (2개)
| 파일 | 설명 |
|------|------|
| `src/styles/variables.css` | CSS Custom Properties 디자인 토큰 |
| `src/styles/global.css` | CSS 리셋 및 글로벌 스타일 |

### 유틸리티/서비스 (4개)
| 파일 | 설명 |
|------|------|
| `src/utils/storage.js` | localStorage 안전 래퍼 (safeSetItem/safeGetItem/safeRemoveItem) |
| `src/utils/format.js` | 통화/날짜/카운트다운 포맷팅 |
| `src/utils/validation.js` | 입력 검증 함수 |
| `src/services/api.js` | Axios 인스턴스, 인터셉터, 5개 API 메서드 |

### 국제화 (2개)
| 파일 | 설명 |
|------|------|
| `src/locales/ko.json` | 한국어 번역 파일 (7개 네임스페이스) |
| `src/i18n.js` | i18next 초기화 |

### Context Providers (3개)
| 파일 | 설명 |
|------|------|
| `src/contexts/AuthContext.jsx` | 인증 상태, 자동 로그인, 세션 만료 감지 |
| `src/contexts/CartContext.jsx` | 장바구니 useReducer, localStorage 동기화 |
| `src/contexts/MenuContext.jsx` | 메뉴 데이터, 5분 캐싱, 카테고리 필터링 |

### 공통 컴포넌트 (5개 + CSS)
| 파일 | 설명 |
|------|------|
| `src/components/ErrorBoundary.jsx` | React Error Boundary |
| `src/components/LoadingSpinner.jsx` | 로딩 스피너 |
| `src/components/Modal.jsx` | 모달 다이얼로그 (배경 딤, 재시도 지원) |
| `src/components/Toast.jsx` | 토스트 알림 (자동 사라짐, 중복 방지) |
| `src/components/ProtectedRoute.jsx` | 인증 가드 라우트 |

### 비즈니스 컴포넌트 (4개 + CSS)
| 파일 | 설명 |
|------|------|
| `src/components/MenuCard.jsx` | 메뉴 카드 (+/- 수량 조절) |
| `src/components/CategoryNav.jsx` | 좌측 세로 카테고리 사이드바 |
| `src/components/CartBadge.jsx` | 하단 고정 장바구니 바 |
| `src/components/CartItem.jsx` | 장바구니 항목 (수량 조절/삭제) |

### App Shell (3개 + CSS)
| 파일 | 설명 |
|------|------|
| `src/components/AppLayout.jsx` | 공통 레이아웃 (Header 탭 + CartBar) |
| `src/App.jsx` | 라우팅, Provider 트리, Code Splitting |
| `src/main.jsx` | 엔트리 포인트 |

### 페이지 (6개 + CSS)
| 파일 | 설명 |
|------|------|
| `src/pages/TableSetupPage.jsx` | 테이블 초기 설정 (storeId, tableNumber, password) |
| `src/pages/MenuPage.jsx` | 메뉴 탐색 (카테고리 필터링, 수량 선택) |
| `src/pages/CartPage.jsx` | 장바구니 관리 (수량 조절, 삭제, 비우기) |
| `src/pages/OrderConfirmPage.jsx` | 주문 확인 (수정 가능, 주문 확정) |
| `src/pages/OrderSuccessPage.jsx` | 주문 성공 (5초 카운트다운 리다이렉트) |
| `src/pages/OrderHistoryPage.jsx` | 주문 내역 조회 (목록/상세) |

### 테스트 (15개)
| 파일 | 설명 |
|------|------|
| `tests/setup.js` | Vitest 글로벌 설정 |
| `tests/utils/format.test.js` | 포맷팅 유틸리티 테스트 |
| `tests/utils/storage.test.js` | localStorage 래퍼 테스트 |
| `tests/utils/validation.test.js` | 입력 검증 테스트 |
| `tests/contexts/AuthContext.test.jsx` | 인증 Context 테스트 |
| `tests/contexts/CartContext.test.jsx` | 장바구니 Context 테스트 |
| `tests/contexts/MenuContext.test.jsx` | 메뉴 Context 테스트 |
| `tests/components/MenuCard.test.jsx` | MenuCard 렌더링 테스트 |
| `tests/components/CartItem.test.jsx` | CartItem 렌더링 테스트 |
| `tests/components/CategoryNav.test.jsx` | CategoryNav 렌더링 테스트 |
| `tests/components/Modal.test.jsx` | Modal 렌더링 테스트 |
| `tests/components/Toast.test.jsx` | Toast 렌더링 테스트 |
| `tests/pages/MenuPage.test.jsx` | MenuPage 통합 테스트 |
| `tests/pages/CartPage.test.jsx` | CartPage 통합 테스트 |
| `tests/pages/OrderConfirmPage.test.jsx` | OrderConfirmPage 통합 테스트 |
| `tests/services/api.test.js` | API 서비스 테스트 |

## 주요 설계 패턴 적용
- Page-Level Code Splitting (React.lazy + Suspense)
- Transparent Token Refresh (Axios 인터셉터)
- CSS Design Token System (CSS Custom Properties)
- Tiered Error Display (모달/토스트 구분)
- Graceful localStorage Degradation
- React.memo + useMemo + useCallback 메모이제이션
- i18n Integration (react-i18next)
- Tablet-Optimized Layout (좌측 사이드바 + 그리드)
