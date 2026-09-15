import os
import logging
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

# 1. 환경변수(.env) 로드
load_dotenv()

# 2. 로깅(Logging) 설정: 콘솔에 서버 동작 및 오류 기록
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s"
)
logger = logging.getLogger(__name__)

# 3. Flask 앱 생성
app = Flask(__name__)

# 4. Gemini API Key 설정
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)
    logger.info("Gemini API가 성공적으로 설정되었습니다.")
else:
    logger.warning("경고: .env 파일에 유효한 GEMINI_API_KEY가 등록되지 않았습니다.")


def build_prompt(prompt_type, name, role, experience, projects, tone):
    """
    사용자가 선택한 Prompt Type(A: 일반, B: 전문가)과 입력값에 맞춰
    Gemini에게 전송할 완성형 프롬프트를 조립하는 함수
    """
    tone_descriptions = {
        "professional": "격식 있고 전문적인 비즈니스 톤",
        "confident": "자신감 넘치고 주도적인 성과 중심 톤",
        "enthusiastic": "열정적이고 적극적인 성장 지향 톤",
        "concise": "군더더기 없이 핵심만 명확히 전달하는 간결한 톤"
    }
    tone_guide = tone_descriptions.get(tone, "격식 있고 신뢰감 주는 톤")

    if prompt_type == "expert":
        # Prompt B: 전문가 모드 (STAR 기법 및 정량적 비즈니스 임팩트 강조)
        system_instruction = f"""
당신은 최고 수준의 테크 리크루터이자 시니어 커리어 컨설턴트입니다.
지원자의 정보를 바탕으로 기업 채용 담당자와 기술 면접관을 사로잡을 수 있는
'전문가 수준의 완성형 이력서(Resume) 및 포트폴리오(Portfolio)'를 작성해 주세요.

[작성 가이드라인]
1. 톤앤매너: {tone_guide}
2. STAR 기법(Situation, Task, Action, Result)을 적용하여 각 프로젝트의 해결 과정과 기여도를 명확히 기술하세요.
3. 단순 업무 나열을 지양하고, 성능 개선 수치, 문제 해결 방식, 비즈니스 영향력(Impact)을 강조하세요.
4. 가독성을 위해 마크다운(Markdown) 포맷(헤딩, 불릿 포인트, 볼드체 등)을 적극 활용하세요.
5. 출력 결과는 '## 1. 이력서 (Resume)'와 '## 2. 프로젝트 포트폴리오 (Portfolio)'로 명확히 구분해 주세요.
"""
    else:
        # Prompt A: 일반 모드 (초보자/신입 친화적, 직관적이고 깔끔한 표준 형식)
        system_instruction = f"""
당신은 친절하고 꼼꼼한 커리어 코칭 전문가입니다.
지원자의 정보를 바탕으로 서류 전형에서 깔끔하고 가독성이 높은
'표준 이력서(Resume) 및 포트폴리오(Portfolio)' 초안을 작성해 주세요.

[작성 가이드라인]
1. 톤앤매너: {tone_guide}
2. 신입 또는 주니어 구직자에게 적합한 정갈하고 이해하기 쉬운 문장으로 작성하세요.
3. 지원자의 경험과 잠재력이 잘 드러나도록 핵심 역량을 보기 쉽게 정리하세요.
4. 마크다운(Markdown) 포맷을 사용하여 깔끔하게 정리해 주세요.
5. 출력 결과는 '## 1. 이력서 (Resume)'와 '## 2. 프로젝트 포트폴리오 (Portfolio)'로 명확히 구분해 주세요.
"""

    user_data = f"""
[지원자 기본 정보]
- 이름: {name}
- 지원 직무: {role}
- 경력 사항:
{experience}
- 프로젝트 경험:
{projects}
"""
    return system_instruction + "\n" + user_data


@app.route("/")
def index():
    """메인 페이지 화면 렌더링"""
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    """
    이력서 및 포트폴리오 생성 API 엔드포인트
    1. 프론트엔드로부터 JSON 데이터 수신
    2. 입력값 검증 (Validation)
    3. Gemini API 호출
    4. 결과를 JSON 형태로 응답
    """
    try:
        data = request.get_json()
        if not data:
            logger.warning("[요청 오류] 빈 요청 데이터가 수신되었습니다.")
            return jsonify({"success": False, "error": "요청 본문이 비어 있습니다."}), 400

        # 입력 필드 추출
        name = data.get("name", "").strip()
        role = data.get("role", "").strip()
        experience = data.get("experience", "").strip()
        projects = data.get("projects", "").strip()
        tone = data.get("tone", "professional").strip()
        prompt_type = data.get("prompt_type", "general").strip()

        logger.info(f"[생성 요청] 이름: {name}, 직무: {role}, 모드: {prompt_type}, Tone: {tone}")

        # 백엔드 필수 입력 검증 (Backend Validation)
        missing_fields = []
        if not name:
            missing_fields.append("이름")
        if not role:
            missing_fields.append("지원 직무")
        if not experience:
            missing_fields.append("경력 사항")
        if not projects:
            missing_fields.append("프로젝트 경험")

        if missing_fields:
            error_message = f"다음 필수 항목을 입력해 주세요: {', '.join(missing_fields)}"
            logger.warning(f"[검증 실패] {error_message}")
            return jsonify({"success": False, "error": error_message}), 400

        # Gemini API Key 등록 여부 검증
        current_api_key = os.getenv("GEMINI_API_KEY")
        if not current_api_key or current_api_key == "your_gemini_api_key_here":
            logger.error("[API Key 오류] .env 파일에 유효한 GEMINI_API_KEY가 없습니다.")
            return jsonify({
                "success": False,
                "error": ".env 파일에 유효한 Gemini API 키가 설정되지 않았습니다. Step 8을 완료했는지 확인해 주세요."
            }), 500

        # 프롬프트 조합
        full_prompt = build_prompt(prompt_type, name, role, experience, projects, tone)

        # Gemini AI 모델 호출 (최신 무료 지원 모델: gemini-3.5-flash-lite)
        model = genai.GenerativeModel("gemini-3.5-flash-lite")
        response = model.generate_content(full_prompt)

        if not response.text:
            logger.error("[응답 실패] Gemini로부터 빈 응답이 반환되었습니다.")
            return jsonify({"success": False, "error": "AI 응답 생성에 실패했습니다. 다시 시도해 주세요."}), 500

        logger.info(f"[생성 완료] {name}님의 이력서가 성공적으로 생성되었습니다. (글자 수: {len(response.text)})")

        return jsonify({
            "success": True,
            "result": response.text
        })

    except Exception as e:
        logger.error(f"[서버 오류 발생] {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": f"서버 내부 오류가 발생했습니다: {str(e)}"
        }), 500


if __name__ == "__main__":
    logger.info("Flask 개발 서버를 시작합니다. http://127.0.0.1:5000 에 접속하세요.")
    app.run(host="127.0.0.1", port=5000, debug=True)
