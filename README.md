# Kulius Blog - 自動化技術部落格

使用 Astro 建構的技術部落格，搭配 n8n 自動化工作流程，自動蒐集 GitHub 活動和 RSS 新聞，透過 Google Gemini AI 生成文章並發布到 GitHub Pages 和 Facebook 粉專。

## 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                    n8n (Docker 本地)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐                │
│  │ 觸發器: Cron (每日) / GitHub Webhook    │                │
│  └─────────────────────────────────────────┘                │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────┐                │
│  │ 資料蒐集                                │                │
│  │ • GitHub API → 最新 commits             │                │
│  │ • RSS Feed → 技術新聞/產業資訊          │                │
│  └─────────────────────────────────────────┘                │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────┐                │
│  │ Gemini API → 生成 Markdown 文章         │                │
│  └─────────────────────────────────────────┘                │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────┐                │
│  │ GitHub API → 建立/更新文章檔案          │                │
│  └─────────────────────────────────────────┘                │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────┐                │
│  │ Facebook Graph API → 發布圖文貼文       │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions                                             │
│  偵測 push → astro build → 部署 GitHub Pages                │
└─────────────────────────────────────────────────────────────┘
```

## 功能特色

- **Astro 5** - 現代化靜態網站生成器
- **Tailwind CSS** - 實用優先的 CSS 框架
- **動態 OG Image** - 自動為每篇文章生成社群分享圖片
- **n8n 自動化** - 完整的內容生成工作流程
- **Google Gemini AI** - 智慧文章生成
- **GitHub Actions** - 自動部署到 GitHub Pages
- **Facebook 整合** - 自動發布到粉絲專頁

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 本地開發

```bash
npm run dev
```

訪問 http://localhost:4321

### 3. 建置網站

```bash
npm run build
```

### 4. 設定 n8n

```bash
cd n8n
cp .env.example .env
# 編輯 .env 填入 API 金鑰
docker-compose up -d
```

訪問 http://localhost:5678 設定工作流程

## 目錄結構

```
kulius.github.io/
├── src/
│   ├── content/
│   │   └── blog/           # 文章 Markdown
│   ├── pages/
│   │   ├── blog/           # 部落格頁面
│   │   └── og/             # OG Image 生成
│   ├── layouts/
│   ├── components/
│   └── styles/
├── public/
│   └── fonts/
├── n8n/
│   ├── docker-compose.yml  # n8n Docker 設定
│   ├── workflows/          # n8n 工作流程 JSON
│   ├── README.md           # n8n 設定指南
│   └── FACEBOOK_SETUP.md   # Facebook 整合指南
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions
├── astro.config.mjs
└── package.json
```

## 文章格式

```markdown
---
title: "文章標題"
description: "文章描述"
pubDate: "2024-01-01"
tags: ["技術", "開發"]
source: "rss"           # 來源：github, rss, manual
sourceUrl: "https://..."  # 原始來源 URL
author: "Kulius"
heroImage: "./image.jpg"  # 選填：封面圖片
---

文章內容...
```

## 需要的 API 金鑰

| 服務 | 用途 | 取得方式 |
|------|------|----------|
| GitHub Token | 讀寫 Repository | [GitHub Settings](https://github.com/settings/tokens) |
| Google Gemini API | Google Gemini AI 生成 | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| Facebook Token | 粉專發布 | [Facebook Developers](https://developers.facebook.com/) |

## 部署

### GitHub Pages

1. 將程式碼推送到 GitHub
2. 前往 Repository Settings → Pages
3. Source 選擇 "GitHub Actions"
4. 推送到 main 分支即自動部署

### 網址

- 網站：https://kulius.github.io
- OG Image：https://kulius.github.io/og/{slug}.png

## 相關文件

- [n8n 設定指南](./n8n/README.md)
- [Facebook 整合設定](./n8n/FACEBOOK_SETUP.md)
- [Astro 官方文件](https://docs.astro.build/)

## 授權

MIT License
