/**
 * AI Resume & Portfolio Builder - 프론트엔드 제어 스크립트 (app.js)
 * 폼 제출, API 호출, 로딩 애니메이션, 결과 출력, 복사 및 다운로드 기능 구현
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. 필요한 HTML 요소들을 변수에 저장 (가져오기)
    const resumeForm = document.getElementById("resumeForm");
    const submitBtn = document.getElementById("submitBtn");
    const errorBox = document.getElementById("errorBox");
    const loadingBox = document.getElementById("loadingBox");
    const placeholderBox = document.getElementById("placeholderBox");
    const resultContentArea = document.getElementById("resultContentArea");
    const resultOutput = document.getElementById("resultOutput");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    // 사용자 이름 및 원본 마크다운 텍스트 보관 변수
    let currentCandidateName = "이력서";
    let rawMarkdownResult = "";

    // 2. 폼 제출(Submit) 이벤트 리스너 등록
    resumeForm.addEventListener("submit", async (e) => {
        // 브라우저의 기본 동작(페이지 새로고침)을 막습니다.
        e.preventDefault();

        // 에러 메시지 초기화
        hideError();

        // 입력값 가져오기 및 공백 제거
        const name = document.getElementById("name").value.trim();
        const role = document.getElementById("role").value.trim();
        const experience = document.getElementById("experience").value.trim();
        const projects = document.getElementById("projects").value.trim();
        const tone = document.getElementById("tone").value;
        const promptTypeRadio = document.querySelector('input[name="prompt_type"]:checked');
        const promptType = promptTypeRadio ? promptTypeRadio.value : "general";

        // [Frontend 검증] 필수 입력값 누락 여부 점검
        if (!name || !role || !experience || !projects) {
            showError("모든 필수 항목(이름, 지원 직무, 경력, 프로젝트)을 빠짐없이 입력해 주세요.");
            return;
        }

        currentCandidateName = name;

        // UI를 '로딩 중' 상태로 전환
        setLoadingState(true);

        try {
            // Flask 백엔드의 /generate 라우트로 POST 비동기 요청 전송
            const response = await fetch("/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    role: role,
                    experience: experience,
                    projects: projects,
                    tone: tone,
                    prompt_type: promptType
                })
            });

            const data = await response.json();

            // 백엔드 처리 결과 확인
            if (response.ok && data.success) {
                // 성공: AI가 생성한 마크다운을 예쁜 서식으로 렌더링
                showResult(data.result);
            } else {
                // 백엔드에서 에러를 반환한 경우 (API 키 누락 등)
                const errorMsg = data.error || "이력서 생성 중 오류가 발생했습니다.";
                showError(errorMsg);
            }
        } catch (err) {
            // 네트워크 오류나 서버 미실행 시
            console.error("API 요청 실패:", err);
            showError("서버와 통신할 수 없습니다. Flask 백엔드 서버(app.py)가 실행 중인지 확인해 주세요.");
        } finally {
            // 작업이 끝나면 로딩 상태 해제
            setLoadingState(false);
        }
    });

    // 3. [텍스트 복사] 버튼 클릭 이벤트 (원본 마크다운 복사)
    copyBtn.addEventListener("click", async () => {
        const textToCopy = rawMarkdownResult || resultOutput.innerText;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "✅ 복사 완료!";
            copyBtn.style.backgroundColor = "#c6f6d5";

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = "";
            }, 2000);
        } catch (err) {
            console.error("클립보드 복사 실패:", err);
            // 구형 브라우저 대체 복사 로직
            fallbackCopyText(textToCopy);
        }
    });

    // 4. [마크다운 다운로드] 버튼 클릭 이벤트 (원본 마크다운 파일 저장)
    downloadBtn.addEventListener("click", () => {
        const textToDownload = rawMarkdownResult || resultOutput.innerText;
        if (!textToDownload) return;

        // 마크다운(.md) 파일 Blob 객체 생성
        const blob = new Blob([textToDownload], { type: "text/markdown;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // 임시 <a> 태그를 만들어 다운로드 트리거
        const tempLink = document.createElement("a");
        tempLink.href = url;
        tempLink.download = `${currentCandidateName}_이력서_포트폴리오.md`;
        document.body.appendChild(tempLink);
        tempLink.click();

        // 메모리 해제 및 임시 요소 제거
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(url);
    });

    // --- UI 헬퍼 함수들 ---

    /** 로딩 상태에 따라 UI 요소들의 보임/숨김 제어 */
    function setLoadingState(isLoading) {
        if (isLoading) {
            loadingBox.style.display = "block";
            placeholderBox.style.display = "none";
            resultContentArea.style.display = "none";
            submitBtn.disabled = true;
            submitBtn.textContent = "⏳ AI가 이력서를 작성하고 있습니다...";
        } else {
            loadingBox.style.display = "none";
            submitBtn.disabled = false;
            submitBtn.textContent = "✨ AI 이력서 & 포트폴리오 생성하기";
        }
    }

    /** AI 생성 결과 마크다운 렌더링 및 출력 */
    function showResult(text) {
        // 원본 마크다운 텍스트 저장
        rawMarkdownResult = text;

        // marked 라이브러리를 통해 마크다운 문법(#, **, - 등)을 HTML 서식으로 변환
        if (typeof marked !== "undefined" && marked.parse) {
            resultOutput.innerHTML = marked.parse(text);
        } else {
            // marked가 없을 경우를 대비한 대체 텍스트 표시
            resultOutput.textContent = text;
        }

        placeholderBox.style.display = "none";
        resultContentArea.style.display = "block";

        // 모바일 사용자를 위해 결과창 쪽으로 부드럽게 스크롤 이동
        resultContentArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    /** 에러 메시지 상자 표시 */
    function showError(message) {
        errorBox.textContent = "⚠️ " + message;
        errorBox.style.display = "block";
        errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    /** 에러 메시지 상자 숨김 */
    function hideError() {
        errorBox.style.display = "none";
        errorBox.textContent = "";
    }

    /** 구형 환경을 위한 텍스트 복사 백업 함수 */
    function fallbackCopyText(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            alert("이력서 내용이 클립보드에 복사되었습니다!");
        } catch (err) {
            alert("복사에 실패했습니다. 마우스로 직접 드래그하여 복사해 주세요.");
        }
        document.body.removeChild(textArea);
    }
});
