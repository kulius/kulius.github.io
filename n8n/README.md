# n8n 自動化工作流程設定指南

## 快速開始

### 1. 啟動 n8n

```bash
# 複製環境變數範本
cp .env.example .env

# 編輯 .env 填入你的 API 金鑰
# 然後啟動 n8n
docker-compose up -d
```

訪問 http://localhost:5678 登入 n8n（預設帳密：admin / changeme）

### 2. 設定 Credentials

在 n8n 中需要建立以下 Credentials：

#### GitHub Token
1. 前往 Settings → Credentials → Add Credential
2. 選擇 "Header Auth"
3. Name: `Authorization`
4. Value: `Bearer YOUR_GITHUB_TOKEN`

#### Google Gemini API
Gemini API 使用 URL 參數傳遞 API Key，已在工作流程中設定。
只需在 `.env` 中設定 `GEMINI_API_KEY` 即可。

## 工作流程說明

### Daily Odoo Content Generation 工作流程

```
Schedule Trigger (每日)
    │
    ├──► GitHub API: 取得最近 commits
    │
    ├──► Odoo Official Blog RSS
    │
    ├──► Cybrosys Odoo Blog RSS
    │
    └──► OpenHRMS Blog RSS
            │
            ▼
        Gemini API: 生成 Odoo 相關 Markdown 文章
            │
            ▼
        Code Node: 準備檔案資訊
            │
            ▼
        GitHub API: 建立檔案 (PUT)
            │
            ▼
        Facebook API: 發布貼文 (選用)
```

## Odoo 相關 RSS 來源

工作流程預設訂閱以下 Odoo 相關新聞：

| 來源 | RSS URL | 說明 |
|------|---------|------|
| Odoo Official | `https://www.odoo.com/blog/feed` | Odoo 官方部落格 |
| Cybrosys | `https://www.cybrosys.com/blog/feed` | Odoo 開發教學 |
| OpenHRMS | `https://www.openhrms.com/blog/feed` | HR 模組相關 |

### 其他推薦 RSS 來源

```
# Odoo 社群
https://odoo-community.org/blog/feed

# 技術部落格
https://www.odoomates.tech/feeds/posts/default

# YouTube RSS (Odoo 頻道)
https://www.youtube.com/feeds/videos.xml?channel_id=UCkQPikELWZFLgQNHd4ydMfQ
```

## 需要的 API 權限

### GitHub Personal Access Token
- 前往: https://github.com/settings/tokens
- 需要權限: `repo` (讀寫 repository)

### Google Gemini API Key
- 前往: https://aistudio.google.com/app/apikey
- 建立 API Key
- 免費方案每分鐘 15 次請求

### Facebook Page Access Token (選用)
- 前往: https://developers.facebook.com/
- 建立應用程式
- 需要權限:
  - `pages_manage_posts`
  - `pages_read_engagement`

## Gemini Prompt 設定

工作流程使用以下 prompt 生成 Odoo 相關文章：

```
Based on the following Odoo-related data, write a technical blog post in Markdown format.

Requirements:
1. Write in Traditional Chinese (繁體中文)
2. Focus on Odoo ERP development, customization, or best practices
3. Create an engaging title related to Odoo
4. Include relevant tags like: Odoo, ERP, Python, etc.
5. Format as Astro blog frontmatter
```

## 故障排除

### n8n 無法連接
```bash
docker-compose logs n8n
```

### GitHub API 錯誤
- 確認 Token 有效且有正確權限
- 檢查 rate limit: https://api.github.com/rate_limit

### Gemini API 錯誤
- 確認 API Key 有效
- 檢查配額: https://aistudio.google.com/app/apikey
