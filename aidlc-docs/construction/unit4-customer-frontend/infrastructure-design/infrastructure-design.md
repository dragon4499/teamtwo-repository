# Infrastructure Design - Unit 4: Customer Frontend

---

## 1. 개발 환경 구성

### 1.1 런타임 환경

| 항목 | 설정 | 설명 |
|------|------|------|
| Node.js | 22 LTS | 최신 LTS 버전, ES2024 지원 |
| 패키지 매니저 | npm | Node.js 기본 내장, 추가 설치 불필요 |
| 빌드 도구 | Vite 5.x | ES 모듈 기반 개발 서버, HMR |

### 1.2 개발 서버 설정

| 항목 | 설정 | 설명 |
|------|------|------|
| 포트 | 3000 | React 기본 포트 |
| 호스트 | localhost | 로컬 개발 전용 |
| HMR | 활성화 (Vite 기본) | 코드 변경 시 즉시 반영 |
| HTTPS | 비활성화 | 로컬 개발 환경 |

### 1.3 API 프록시 설정

Vite 개발 서버에서 Backend API로 프록시를 설정하여 CORS 이슈를 해결합니다.

```
vite.config.js proxy 설정:
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }

효과:
  - 프론트엔드: fetch('/api/stores/...') → localhost:3000/api/...
  - Vite 프록시: localhost:3000/api/... → localhost:8000/api/...
  - CORS 헤더 불필요 (동일 오리진으로 인식)
  - api.js의 BASE_URL = '' (상대 경로 사용)
```

---

## 2. 포트 할당 매트릭스

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Backend (FastAPI) | 8000 | Python uvicorn 서버 |
| Customer Frontend (Vite) | 3000 | React 개발 서버 |
| Admin Frontend (Vite) | 3001 | React 개발 서버 (예정) |

---

## 3. 빌드 설정

### 3.1 Vite 빌드 설정

```
vite.config.js:
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined  // Vite 기본 코드 스플리팅 사용
      }
    }
  }

빌드 명령어:
  npm run build → dist/ 디렉토리에 정적 파일 생성
  npm run preview → 빌드 결과물 로컬 프리뷰
```

### 3.2 환경 변수

```
.env.development:
  VITE_API_BASE_URL=          # 개발 환경: 프록시 사용으로 빈 값
  VITE_APP_TITLE=테이블오더

.env.production:
  VITE_API_BASE_URL=http://localhost:8000  # 프로덕션 빌드 시 직접 호출
  VITE_APP_TITLE=테이블오더

사용:
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
```

---

## 4. package.json 스크립트

```json
{
  "scripts": {
    "dev": "vite --port 3000",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

---

## 5. 프로젝트 초기화 절차

```
1. 프로젝트 생성:
   npm create vite@latest customer-frontend -- --template react

2. 디렉토리 이동:
   cd customer-frontend

3. 의존성 설치:
   npm install react-router-dom axios i18next react-i18next i18next-browser-languagedetector

4. 개발 의존성 설치:
   npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom eslint-plugin-react eslint-plugin-react-hooks prettier

5. 설정 파일 생성:
   - vite.config.js (프록시, 빌드 설정)
   - vitest.config.js (테스트 설정)
   - eslint.config.js (린트 규칙)
   - .prettierrc (포맷팅 규칙)
   - .env.development, .env.production

6. 디렉토리 구조 생성:
   src/pages/, src/components/, src/contexts/
   src/services/, src/utils/, src/locales/, src/styles/
   tests/contexts/, tests/components/, tests/pages/
   tests/services/, tests/utils/

7. 개발 서버 시작:
   npm run dev
```

---

## 6. Vitest 설정

```
vitest.config.js:
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
      include: ['tests/**/*.test.{js,jsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/main.jsx', 'src/i18n.js']
      }
    }
  })

tests/setup.js:
  import '@testing-library/jest-dom'
```

---

## 7. ESLint 설정

```
eslint.config.js:
  import js from '@eslint/js'
  import globals from 'globals'
  import reactHooks from 'eslint-plugin-react-hooks'
  import reactRefresh from 'eslint-plugin-react-refresh'

  export default [
    js.configs.recommended,
    {
      files: ['**/*.{js,jsx}'],
      languageOptions: {
        globals: { ...globals.browser }
      },
      plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': 'warn',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': ['warn', { allow: ['warn', 'error'] }]
      }
    }
  ]
```

---

## 8. Prettier 설정

```json
.prettierrc:
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "jsxSingleQuote": false
}
```

