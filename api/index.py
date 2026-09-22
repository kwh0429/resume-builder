import sys
import os

# 현재 루트 디렉토리를 파이썬 모듈 검색 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel Serverless Function entrypoint
# Vercel Python 런타임이 WSGI 애플리케이션으로 인식하도록 app 인스턴스 노출
