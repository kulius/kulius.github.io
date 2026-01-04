@echo off
REM 設定環境變數（請修改為你的 API 金鑰）
set GEMINI_API_KEY=your-gemini-api-key
set GITHUB_TOKEN=your-github-token

REM 執行腳本
python generate-article.py %*

pause
