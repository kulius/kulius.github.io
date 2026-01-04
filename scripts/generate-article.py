#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
每週文章自動生成腳本
使用 Gemini API 生成文章，並上傳至 GitHub

使用方式：
    python generate-article.py                    # 自動選擇類別
    python generate-article.py --category odoo    # 指定類別
    python generate-article.py --dry-run          # 測試模式（不上傳）

環境變數：
    GEMINI_API_KEY  - Gemini API 金鑰
    GITHUB_TOKEN    - GitHub Personal Access Token
"""

import os
import sys
import json
import base64
import argparse
import requests
from datetime import datetime
from pathlib import Path

# 修正 Windows 終端機編碼
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ============================================================
# 設定區
# ============================================================

GITHUB_REPO = "kulius/kulius.github.io"
GITHUB_BRANCH = "main"
CONTENT_PATH = "src/content/posts"
SITE_URL = "https://www.euptop.com"
AUTHOR = "蘇勃任"

# 四大類別定義
CATEGORIES = {
    "odoo": {
        "name": "Odoo 客製化開發",
        "tags": ["Odoo", "ERP", "客製化"],
        "prompt": """請撰寫一篇關於 Odoo ERP 客製化開發的技術文章。

可選主題（擇一或組合）：
- Odoo 模組開發架構與最佳實踐
- ORM 進階操作技巧
- 工作流程自動化設計
- 報表開發與 QWeb 模板
- API 整合與 XML-RPC/JSON-RPC
- 權限控制與安全性設計
- 效能優化技巧
- 多公司架構設計"""
    },
    "ai": {
        "name": "AI 智慧應用",
        "tags": ["AI", "Claude", "LLM"],
        "prompt": """請撰寫一篇關於 AI 應用的技術文章。

可選主題（擇一或組合）：
- Claude/ChatGPT/Gemini API 整合實戰
- AI Agent 與工具使用
- RAG (檢索增強生成) 架構設計
- Prompt Engineering 技巧
- AI 輔助程式開發 (Cursor/Copilot)
- 企業 AI 導入策略
- LLM 微調與部署
- 多模態 AI 應用"""
    },
    "dt": {
        "name": "企業數位轉型",
        "tags": ["數位轉型", "ERP", "企業管理"],
        "prompt": """請撰寫一篇關於企業數位轉型的策略文章。

可選主題（擇一或組合）：
- ERP 系統導入方法論
- 流程再造與自動化
- 數據驅動決策
- 組織變革管理
- 數位轉型 ROI 評估
- 產業別轉型案例（製造/零售/服務）
- 雲端遷移策略
- 資安與合規考量"""
    },
    "dev": {
        "name": "其他開發",
        "tags": ["LINE", "Svelte", "Web開發"],
        "prompt": """請撰寫一篇關於 Web 開發或 LINE 整合的技術文章。

可選主題（擇一或組合）：
- LINE Bot 開發與 Messaging API
- LINE LIFF 應用開發
- LINE Login 整合
- Svelte/SvelteKit 實戰
- 現代前端框架比較
- REST API 設計最佳實踐
- TypeScript 進階技巧
- 全端開發架構設計"""
    }
}

# ============================================================
# 工具函式
# ============================================================

def get_env_or_exit(key: str) -> str:
    """取得環境變數，若不存在則退出"""
    value = os.environ.get(key)
    if not value:
        print(f"❌ 錯誤：請設定環境變數 {key}")
        print(f"   export {key}=your-api-key")
        sys.exit(1)
    return value


def select_category(category_id: str = None) -> tuple[str, dict]:
    """選擇類別（指定或依日期輪替）"""
    if category_id:
        if category_id not in CATEGORIES:
            print(f"❌ 無效的類別：{category_id}")
            print(f"   可用類別：{', '.join(CATEGORIES.keys())}")
            sys.exit(1)
        return category_id, CATEGORIES[category_id]

    # 依日期輪替
    day_of_year = datetime.now().timetuple().tm_yday
    category_keys = list(CATEGORIES.keys())
    selected_key = category_keys[day_of_year % len(category_keys)]
    return selected_key, CATEGORIES[selected_key]


def generate_article(api_key: str, category_id: str, category: dict, max_retries: int = 3) -> str:
    """使用 Gemini API 生成文章"""
    import time

    today = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""你是一位資深的技術部落格作者「{AUTHOR}」，專精於 Odoo ERP 客製化與 AI 整合應用。

請撰寫一篇高品質的繁體中文技術文章。

## 文章類別
{category['name']}

## 主題方向
{category['prompt']}

## 寫作要求
1. 文章長度：800-1500 字
2. 寫作風格：專業但易懂，適合有基礎的技術人員閱讀
3. 必須包含：
   - 引人入勝的開頭（說明問題或需求）
   - 清晰的技術說明
   - 實際的程式碼範例（如適用）
   - 具體的應用場景
   - 總結與建議

## 輸出格式
請直接輸出 Markdown 格式，開頭必須是 frontmatter：

---
title: "文章標題"
description: "50-100字的文章摘要"
published: {today}
tags: {json.dumps(category['tags'], ensure_ascii=False)}
category: "{category_id}"
author: "{AUTHOR}"
---

（文章內容，使用 ## 作為主要標題）

## 注意事項
- 不要使用「本文」「本篇」等詞彙
- 不要在開頭重複標題
- 程式碼區塊請標註語言（如 ```python）
- 不要輸出任何額外的說明文字，直接輸出 Markdown"""

    # 可用模型: gemini-2.0-flash (推薦), gemini-2.5-flash, gemini-2.0-flash-exp
    model = "gemini-2.0-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 4096
        }
    }

    print("🤖 正在使用 Gemini 生成文章...")

    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, timeout=120)

            if response.status_code == 429:
                wait_time = 30 * (attempt + 1)
                print(f"⏳ API 限流，等待 {wait_time} 秒後重試...")
                time.sleep(wait_time)
                continue

            response.raise_for_status()
            break
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                print(f"⚠️ 請求失敗，重試中... ({attempt + 1}/{max_retries})")
                time.sleep(10)
            else:
                raise

    result = response.json()
    content = result["candidates"][0]["content"]["parts"][0]["text"]

    # 清理可能的 markdown 標記
    content = content.strip()
    if content.startswith("```markdown"):
        content = content[11:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]

    return content.strip()


def upload_to_github(token: str, filename: str, content: str, dry_run: bool = False) -> str:
    """上傳文章到 GitHub"""

    file_path = f"{CONTENT_PATH}/{filename}"
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{file_path}"

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    payload = {
        "message": f"Auto: 新增文章 {filename}",
        "content": base64.b64encode(content.encode()).decode(),
        "branch": GITHUB_BRANCH
    }

    if dry_run:
        print(f"🔍 [Dry Run] 將上傳至：{file_path}")
        return f"{SITE_URL}/posts/{filename.replace('.md', '')}/"

    print(f"📤 正在上傳至 GitHub：{file_path}")

    response = requests.put(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()

    return f"{SITE_URL}/posts/{filename.replace('.md', '')}/"


def save_local(filename: str, content: str) -> Path:
    """儲存文章到本地"""
    # 相對於腳本位置的路徑
    script_dir = Path(__file__).parent.parent
    file_path = script_dir / CONTENT_PATH / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content, encoding="utf-8")
    return file_path


# ============================================================
# 主程式
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="生成技術文章並上傳至 GitHub")
    parser.add_argument("--category", "-c", choices=CATEGORIES.keys(),
                        help="指定文章類別 (預設依日期輪替)")
    parser.add_argument("--dry-run", "-n", action="store_true",
                        help="測試模式：生成文章但不上傳")
    parser.add_argument("--local-only", "-l", action="store_true",
                        help="只儲存到本地，不上傳 GitHub")
    parser.add_argument("--output", "-o", type=str,
                        help="指定輸出檔名（不含路徑）")
    args = parser.parse_args()

    print("=" * 50)
    print("📝 技術文章自動生成工具")
    print("=" * 50)

    # 取得 API 金鑰
    gemini_key = get_env_or_exit("GEMINI_API_KEY")

    if not args.local_only and not args.dry_run:
        github_token = get_env_or_exit("GITHUB_TOKEN")
    else:
        github_token = None

    # 選擇類別
    category_id, category = select_category(args.category)
    print(f"📂 類別：{category['name']} ({category_id})")

    # 生成文章
    try:
        content = generate_article(gemini_key, category_id, category)
        print("✅ 文章生成完成")
    except Exception as e:
        print(f"❌ 生成失敗：{e}")
        sys.exit(1)

    # 生成檔名
    today = datetime.now().strftime("%Y%m%d")
    timestamp = hex(int(datetime.now().timestamp()))[2:]
    filename = args.output or f"{category_id}-{today}-{timestamp}.md"

    # 儲存本地
    local_path = save_local(filename, content)
    print(f"💾 已儲存至：{local_path}")

    # 上傳 GitHub
    if not args.local_only:
        try:
            article_url = upload_to_github(github_token, filename, content, args.dry_run)
            print(f"🌐 文章網址：{article_url}")
        except Exception as e:
            print(f"❌ 上傳失敗：{e}")
            print("   文章已儲存在本地，您可以手動 git push")
            sys.exit(1)

    print("=" * 50)
    print("🎉 完成！")

    # 顯示文章預覽
    print("\n📄 文章預覽（前 500 字）：")
    print("-" * 50)
    print(content[:500] + "..." if len(content) > 500 else content)


if __name__ == "__main__":
    main()
