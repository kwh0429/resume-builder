# 🌈 AI Resume & Portfolio Builder

> **Google Gemini AI와 Flask를 활용한 맞춤형 이력서 & 포트폴리오 원클릭 제작 웹 애플리케이션**

간단한 기본 정보(이름, 지원 직무, 경력, 프로젝트, 희망 톤)를 입력하면, Google의 최신 생성형 AI 모델이 완성도 높은 **이력서(Resume)**와 **프로젝트 포트폴리오(Portfolio)** 초안을 수초 만에 작성해 드립니다.

---

## ✨ 주요 기능

- **✍️ 스마트 입력 폼**: 이름, 직무, 경력, 프로젝트 경험 및 4가지 문체(Tone앤매너) 선택 지원
- **🎯 2가지 맞춤형 작성 모드**:
  - **🌱 일반 모드 (Prompt A)**: 신입 및 초보자를 위한 정갈하고 깔끔한 표준 양식
  - **🚀 전문가 모드 (Prompt B)**: STAR 기법 기반, 구체적인 수치와 비즈니스 임팩트를 극대화한 시니어 양식
- **⚡ 실시간 마크다운 렌더링**: `marked.js`를 통해 AI 생성 마크다운 문서를 깔끔하고 가독성 높은 실제 서식으로 시각화
- **📋 원클릭 복사 & 💾 .md 다운로드**: 생성된 문서를 클립보드에 바로 복사하거나, `[이름]_이력서_포트폴리오.md` 파일로 즉시 다운로드
- **🌈 화사한 무지개빛 글래스모피즘 UI**: 부드럽게 흐르는 파스텔 무지개 배경과 세련된 반투명 카드 디자인
- **🛡️ 튼튼한 이중 검증 & 에러 핸들링**: 프론트엔드와 백엔드 양방향 입력값 검증 및 친절한 한글 오류 안내
- **🔒 철저한 API 보안**: `.gitignore`와 `.env`를 통한 Gemini API Key 유출 원천 차단

---

## 🛠️ 기술 스택

| 구분 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Backend** | Python 3.9+, Flask | 가볍고 빠른 경량 웹 프레임워크 및 REST API 서버 |
| **AI Model** | Google Gemini (`gemini-3.5-flash-lite`) | Google AI Studio의 초고속·고품질 생성형 AI 모델 |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | 순수 웹 표준 기술을 활용한 반응형 2단 레이아웃 |
| **Markdown** | marked.js (CDN) | 브라우저 실시간 마크다운 HTML 파싱 |
| **Secrets** | python-dotenv | 환경변수를 통한 안전한 API 키 관리 |
| **Version Control** | Git | 변경 이력 관리 및 저장 |

---

## 📁 프로젝트 구조

```text
resume-builder/
├── app.py                 # Flask 백엔드 서버 & Gemini API 통신 로직
├── requirements.txt       # 필수 파이썬 라이브러리 목록
├── .env                   # 실제 Gemini API Key 보관 (Git 제외)
├── .env.example           # 환경변수 템플릿 파일
├── .gitignore             # Git 추적 제외 목록 (.env, venv 등)
├── README.md              # 프로젝트 안내 문서
├── templates/
│   └── index.html         # 웹페이지 구조 및 화면 뼈대
└── static/
    ├── css/
    │   └── style.css      # 무지개빛 테마 & 반응형 스타일시트
    └── js/
        └── app.js         # 비동기 통신, 마크다운 렌더링, 복사/다운로드 제어
```

---

## 🚀 시작하기 (설치 및 실행 가이드)

Windows PowerShell 기준으로 다음 단계를 순서대로 진행합니다.

### 1. 프로젝트 위치로 이동
```powershell
cd C:\AI-study\resume-builder
```

### 2. 가상환경 생성 및 활성화
```powershell
# 가상환경 생성
py -m venv venv

# 가상환경 활성화 (PowerShell)
.\venv\Scripts\Activate.ps1
```
> 프롬프트 맨 앞에 `(venv)` 표시가 나타나는지 확인합니다.

### 3. 필수 패키지 설치
```powershell
py -m pip install -r requirements.txt
```

### 4. Gemini API Key 설정
1. [Google AI Studio](https://aistudio.google.com/)에서 무료 API 키를 발급받습니다.
2. `.env.example` 파일을 복사하여 `.env` 파일을 만듭니다.
   ```powershell
   Copy-Item .env.example .env
   ```
3. `.env` 파일을 열고 발급받은 실제 API 키를 입력합니다.
   ```text
   GEMINI_API_KEY=AIzaSy...실제_API_키_입력
   ```

### 5. 서버 실행
```powershell
py app.py
```

### 6. 브라우저 접속
웹 브라우저(Chrome, Edge 등)를 열고 아래 주소로 접속합니다.
```
http://127.0.0.1:5000
```

---

## 💡 사용 팁

1. **복사 기능**: [📋 텍스트 복사] 버튼을 누르면 서식 정보가 유지된 마크다운 원본이 복사되어 Notion, Velog, GitHub 등에 바로 붙여넣을 수 있습니다.
2. **다운로드 기능**: [💾 마크다운(.md) 다운로드] 버튼을 누르면 입력한 이름으로 파일명이 자동 지정되어 PC의 '다운로드' 폴더에 저장됩니다.
3. **서버 종료**: 터미널 창에서 `Ctrl + C`를 누르면 Flask 서버가 안전하게 종료됩니다.

---

## 📄 라이선스

본 프로젝트는 자유롭게 학습 및 포트폴리오 용도로 사용 및 수정하실 수 있습니다.
