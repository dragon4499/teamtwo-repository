# Deployment Architecture - Unit 4: Customer Frontend

---

## 1. 로컬 개발 아키텍처

```
Text Alternative:

로컬 개발 환경 구성:

  [브라우저 (태블릿/데스크톱)]
       |
       | http://localhost:3000
       |
  [Vite Dev Server (포트 3000)]
       |
       |-- 정적 파일 서빙 (src/ → HMR)
       |-- /api/* 프록시 →  [FastAPI Backend (포트 8000)]
       |
  [파일 시스템]
       |-- customer-frontend/src/    (소스 코드)
       |-- customer-frontend/dist/   (빌드 결과물)
       |-- backend/data/             (JSON 데이터 파일)
```

---

## 2. 서비스 간 통신

### 2.1 개발 환경 통신 흐름

```
1. 브라우저 → Vite Dev Server (localhost:3000)
   - 정적 파일 (HTML, JS, CSS) 서빙
   - HMR WebSocket 연결

2. Vite Dev Server → FastAPI Backend (localhost:8000)
   - /api/* 경로 프록시
   - 예: GET /api/stores/store1/menus
         → proxy → http://localhost:8000/api/stores/store1/menus

3. FastAPI Backend → 파일 시스템
   - JSON 파일 읽기/쓰기
   - data/{store_id}/*.json
```

### 2.2 프로덕션 빌드 통신 흐름

```
1. npm run build → dist/ 디렉토리 생성
   - index.html
   - assets/*.js (코드 스플리팅된 청크)
   - assets/*.css

2. dist/ 정적 파일을 별도 서버 또는 FastAPI에서 서빙
   - 옵션 A: FastAPI StaticFiles 마운트
   - 옵션 B: nginx 등 별도 정적 파일 서버

3. API 호출: VITE_API_BASE_URL 환경 변수로 Backend 주소 설정
```

---

## 3. 디렉토리 구조 (최종)

```
customer-frontend/
+-- public/
|   +-- favicon.ico
+-- src/
|   +-- App.jsx
|   +-- main.jsx
|   +-- i18n.js
|   +-- pages/
|   |   +-- TableSetupPage.jsx
|   |   +-- TableSetupPage.module.css
|   |   +-- MenuPage.jsx
|   |   +-- MenuPage.module.css
|   |   +-- CartPage.jsx
|   |   +-- CartPage.module.css
|   |   +-- OrderConfirmPage.jsx
|   |   +-- OrderConfirmPage.module.css
|   |   +-- OrderSuccessPage.jsx
|   |   +-- OrderSuccessPage.module.css
|   |   +-- OrderHistoryPage.jsx
|   |   +-- OrderHistoryPage.module.css
|   +-- components/
|   |   +-- AppLayout.jsx
|   |   +-- AppLayout.module.css
|   |   +-- ProtectedRoute.jsx
|   |   +-- ErrorBoundary.jsx
|   |   +-- LoadingSpinner.jsx
|   |   +-- LoadingSpinner.module.css
|   |   +-- MenuCard.jsx
|   |   +-- MenuCard.module.css
|   |   +-- CategoryNav.jsx
|   |   +-- CategoryNav.module.css
|   |   +-- CartBadge.jsx
|   |   +-- CartBadge.module.css
|   |   +-- CartItem.jsx
|   |   +-- CartItem.module.css
|   |   +-- Modal.jsx
|   |   +-- Modal.module.css
|   |   +-- Toast.jsx
|   |   +-- Toast.module.css
|   +-- contexts/
|   |   +-- AuthContext.jsx
|   |   +-- CartContext.jsx
|   |   +-- MenuContext.jsx
|   +-- services/
|   |   +-- api.js
|   +-- utils/
|   |   +-- storage.js
|   |   +-- format.js
|   |   +-- validation.js
|   +-- locales/
|   |   +-- ko.json
|   +-- styles/
|       +-- global.css
|       +-- variables.css
+-- tests/
|   +-- setup.js
|   +-- contexts/
|   |   +-- AuthContext.test.jsx
|   |   +-- CartContext.test.jsx
|   |   +-- MenuContext.test.jsx
|   +-- components/
|   |   +-- MenuCard.test.jsx
|   |   +-- CartItem.test.jsx
|   |   +-- CategoryNav.test.jsx
|   |   +-- Modal.test.jsx
|   |   +-- Toast.test.jsx
|   +-- pages/
|   |   +-- MenuPage.test.jsx
|   |   +-- CartPage.test.jsx
|   |   +-- OrderConfirmPage.test.jsx
|   +-- services/
|   |   +-- api.test.js
|   +-- utils/
|       +-- format.test.js
|       +-- storage.test.js
|       +-- validation.test.js
+-- index.html
+-- package.json
+-- vite.config.js
+-- vitest.config.js
+-- eslint.config.js
+-- .prettierrc
+-- .env.development
+-- .env.production
+-- .gitignore
```

---

## 4. 개발 워크플로우

### 4.1 일상 개발 사이클

```
1. Backend 시작: cd backend && uvicorn main:app --reload --port 8000
2. Frontend 시작: cd customer-frontend && npm run dev
3. 브라우저 접속: http://localhost:3000
4. 코드 수정 → Vite HMR 자동 반영
5. 테스트 실행: npm run test (단일 실행) 또는 npm run test:watch (감시 모드)
6. 린트 확인: npm run lint
```

### 4.2 빌드 및 검증

```
1. 빌드: npm run build
2. 빌드 결과 확인: npm run preview (localhost:4173)
3. 번들 크기 확인: dist/assets/ 디렉토리 파일 크기 검토
4. 테스트 커버리지: npm run test:coverage
```

---

## 5. .gitignore 설정

```
node_modules/
dist/
*.local
.env.local
.env.*.local
coverage/
```

