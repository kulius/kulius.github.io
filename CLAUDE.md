# CLAUDE.md - 專案開發記錄

## 專案概述

這是 **蘇勃任** 的個人技術部落格，使用 Astro 框架搭配 Twilight 主題，部署於 GitHub Pages。

- **網站網址**: https://www.euptop.com/
- **GitHub Repo**: https://github.com/kulius/kulius.github.io
- **主題**: [Twilight](https://github.com/Spr-Aachen/Twilight)
- **框架**: Astro 5.x + Svelte 5 + Tailwind CSS

---

## 目錄結構

```
kulius.github.io/
├── src/
│   ├── content/
│   │   └── posts/           # 文章 Markdown 檔案
│   ├── components/          # Astro/Svelte 元件
│   ├── layouts/             # 頁面佈局
│   ├── pages/               # 路由頁面
│   ├── styles/              # CSS 樣式
│   ├── i18n/                # 多語系設定
│   ├── utils/               # 工具函式
│   └── config.ts            # 網站設定檔
├── public/
│   └── CNAME                # 自訂網域設定
├── n8n/
│   ├── docker-compose.yml   # n8n Docker 設定
│   └── workflows/           # n8n 工作流程 JSON
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions 部署
├── astro.config.mjs         # Astro 設定
├── tsconfig.json            # TypeScript 設定
├── package.json             # npm 依賴
└── pnpm-lock.yaml           # pnpm lockfile
```

---

## 文章內容

共 **20 篇技術文章**，分為四大類別：

### Odoo 客製化開發 (5 篇)
| 檔案 | 標題 |
|------|------|
| `odoo-furniture-erp.md` | Odoo 家具業 ERP 客製化開發實戰 |
| `odoo-hr-attendance.md` | Odoo 人資出勤模組深度客製化 |
| `odoo-invoice-tw.md` | Odoo 台灣發票模組開發指南 |
| `odoo-quality-control.md` | Odoo 品質管理模組客製化開發 |
| `odoo-carbon-management.md` | Odoo 碳盤查管理模組開發實戰 |

### AI 智慧應用 (5 篇)
| 檔案 | 標題 |
|------|------|
| `ai-claude-code-intro.md` | Claude Code 實戰入門 |
| `ai-mcp-integration.md` | MCP 整合 Claude 打造企業 AI 助手 |
| `ai-cursor-vibe-coding.md` | Cursor + Vibe Coding 開發新體驗 |
| `ai-agent-automation.md` | AI Agent 自動化：從概念到實踐 |
| `ai-gemini-integration.md` | Gemini API 整合開發實戰 |

### 企業數位轉型 (5 篇)
| 檔案 | 標題 |
|------|------|
| `dt-manufacturing-erp.md` | 製造業 ERP 數位轉型策略 |
| `dt-retail-omnichannel.md` | 零售業全通路數位轉型實戰 |
| `dt-trading-automation.md` | 貿易業進銷存自動化轉型 |
| `dt-service-digitalization.md` | 服務業數位化轉型指南 |
| `dt-esg-carbon-management.md` | ESG 碳管理數位化解決方案 |

### 其他開發 (5 篇)
| 檔案 | 標題 |
|------|------|
| `dev-line-bot-odoo.md` | LINE Bot 串接 Odoo 開發實戰 |
| `dev-line-liff-attendance.md` | LINE LIFF 打卡系統開發 |
| `dev-line-reservation-system.md` | LINE 預約系統全端開發 |
| `dev-odoo-rest-api.md` | Odoo REST API 開發與整合 |
| `dev-svelte5-vite-project.md` | Svelte 5 + Vite 專案實戰 |

---

## 文章格式規範

```yaml
---
title: "文章標題"
description: "文章描述"
published: 2024-12-25          # 注意：不要加引號！
tags: ["標籤1", "標籤2"]
category: "分類名稱"            # odoo/ai/dt/dev
author: "蘇勃任"
---
```

**重要**：`published` 日期欄位不可加引號，否則會導致 Astro Content Collections schema 驗證失敗。

---

## 文章自動生成腳本

使用 Python 腳本 + Gemini API 自動生成文章。

### 安裝
```bash
cd scripts
pip install -r requirements.txt
```

### 設定環境變數
```bash
# Windows (PowerShell)
$env:GEMINI_API_KEY="your-gemini-api-key"
$env:GITHUB_TOKEN="your-github-token"

# Windows (CMD)
set GEMINI_API_KEY=your-gemini-api-key
set GITHUB_TOKEN=your-github-token

# Linux/Mac
export GEMINI_API_KEY="your-gemini-api-key"
export GITHUB_TOKEN="your-github-token"
```

### 使用方式
```bash
# 自動選擇類別（依日期輪替）
python generate-article.py

# 指定類別
python generate-article.py --category odoo
python generate-article.py --category ai
python generate-article.py --category dt
python generate-article.py --category dev

# 測試模式（生成但不上傳）
python generate-article.py --dry-run

# 只儲存本地（之後手動 git push）
python generate-article.py --local-only
```

### 四大類別
| 類別 ID | 名稱 | 標籤 |
|---------|------|------|
| odoo | Odoo 客製化開發 | Odoo, ERP, 客製化 |
| ai | AI 智慧應用 | AI, Claude, LLM |
| dt | 企業數位轉型 | 數位轉型, ERP, 企業管理 |
| dev | 其他開發 | LINE, Svelte, Web開發 |

### 取得 API 金鑰

**Gemini API**：
1. 前往 https://aistudio.google.com/app/apikey
2. 建立 API 金鑰

**GitHub Token**：
1. 前往 GitHub Settings > Developer settings > Personal access tokens
2. 建立 Fine-grained token
3. 權限：Contents (Read and write)

---

## GitHub Actions 部署

檔案位置：`.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

**注意**：使用 `npm` 而非 `pnpm`，因為 pnpm 在 CI 環境有路徑解析問題。

---

## 重要設定檔

### src/config.ts
```typescript
const SITE_LANG = "zh";

export const siteConfig = {
  siteURL: "https://www.euptop.com/",
  title: "蘇勃任 | Odoo 技術筆記",
  // ...
};

export const profileConfig = {
  name: "蘇勃任",
  bio: "Odoo 技術顧問 | AI 整合專家",
  // ...
};
```

### astro.config.mjs
```javascript
// Vite 路徑別名設定（重要！修正 Linux CI 問題）
vite: {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      // ... 其他別名
    },
  },
},
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
      // ...
    }
  }
}
```

---

## 已解決的問題

### 1. 日期格式錯誤
- **問題**：`published: "2024-12-25"` 導致 schema 驗證失敗
- **解法**：移除引號 → `published: 2024-12-25`

### 2. 檔案名稱大小寫
- **問題**：`Footer.astro` 在 Windows 可運作，但 Linux CI 找不到 `footer.astro`
- **解法**：`git mv Footer.astro footer.astro`

### 3. Vite 路徑別名
- **問題**：`@components/xxx` 在 CI 環境無法解析
- **解法**：在 `astro.config.mjs` 明確設定 Vite alias

### 4. Optional Chaining 錯誤
- **問題**：`umamiConfig.scripts.match()` 當 scripts 為 undefined 時報錯
- **解法**：改為 `umamiConfig.scripts?.match()`

### 5. Git Push 被阻擋
- **問題**：GitHub Push Protection 阻擋含有 secrets 的 `.env` 檔案
- **解法**：將 `.env`、`n8n/.env`、`.claude/` 加入 `.gitignore`

---

## 開發指令

```bash
# 安裝依賴
npm install

# 本地開發
npm run dev

# 建置
npm run build

# 預覽建置結果
npm run preview
```

---

## 備份位置

原始文章備份：`D:\odoo\kulius.github.io-backup\`

---

## 聯絡資訊

- **作者**：蘇勃任
- **網站**：https://www.euptop.com/
- **專長**：Odoo ERP 客製化、AI 整合應用、企業數位轉型

---

*最後更新：2026-01-04*
