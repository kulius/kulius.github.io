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

#### Facebook Page Token
1. 前往 Settings → Credentials → Add Credential
2. 選擇 "OAuth2 API"
3. 設定 Facebook Graph API OAuth

## 工作流程說明

### Daily Content Generation 工作流程

```
Schedule Trigger (每日)
    │
    ├──► GitHub API: 取得最近 commits
    │
    ├──► Hacker News RSS
    │
    └──► Dev.to RSS
            │
            ▼
        Gemini API: 生成 Markdown 文章
            │
            ▼
        Code Node: 準備檔案資訊
            │
            ▼
        GitHub API: 建立檔案 (PUT)
            │
            ▼
        Wait Node: 等待 GitHub Actions 部署
            │
            ▼
        Facebook API: 發布貼文
```

### 手動建立工作流程步驟

#### 步驟 1: Schedule Trigger
- 類型: Schedule Trigger
- 設定: 每天執行一次

#### 步驟 2: 資料蒐集（平行）
同時發送三個請求：

**GitHub Events:**
```
URL: https://api.github.com/users/kulius/events
Method: GET
Headers: 
  - Accept: application/vnd.github.v3+json
  - Authorization: Bearer {GITHUB_TOKEN}
```

**Hacker News RSS:**
```
URL: https://hnrss.org/frontpage
```

**Dev.to RSS:**
```
URL: https://dev.to/feed
```

#### 步驟 3: Gemini API - 生成內容

使用 HTTP Request 節點呼叫 Gemini API：

```
Method: POST
URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={{ $env.GEMINI_API_KEY }}
Body (JSON):
{
  "contents": [{
    "parts": [{
      "text": "你的 prompt..."
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

#### 步驟 4: Code Node - 解析 Gemini 回應
```javascript
const response = $input.item.json;
const content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
const today = new Date();
const slug = `auto-${today.toISOString().split('T')[0]}`;

return {
  json: {
    slug,
    filename: `${slug}.md`,
    content,
    path: `src/content/blog/${slug}.md`
  }
};
```

#### 步驟 5: HTTP Request - 建立 GitHub 檔案
```
URL: https://api.github.com/repos/kulius/kulius.github.io/contents/{{ path }}
Method: PUT
Body (JSON):
{
  "message": "Auto-generated: {{ slug }}",
  "content": "{{ base64(content) }}",
  "branch": "main"
}
```

#### 步驟 6: Wait Node
等待 60 秒讓 GitHub Actions 完成部署

#### 步驟 7: Facebook Graph API
```
URL: https://graph.facebook.com/v18.0/{PAGE_ID}/feed
Method: POST
Body:
{
  "message": "新文章！\n\nhttps://kulius.github.io/blog/{{ slug }}",
  "link": "https://kulius.github.io/blog/{{ slug }}",
  "access_token": "{PAGE_ACCESS_TOKEN}"
}
```

## 需要的 API 權限

### GitHub Personal Access Token
- 前往: https://github.com/settings/tokens
- 需要權限: `repo` (讀寫 repository)

### Google Gemini API Key
- 前往: https://aistudio.google.com/app/apikey
- 建立 API Key
- 免費方案每分鐘 15 次請求

### Facebook Page Access Token
- 前往: https://developers.facebook.com/
- 建立應用程式
- 需要權限:
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `pages_show_list`

## 自訂 RSS 來源

編輯工作流程，新增更多 RSS 來源：

**技術部落格:**
- Hacker News: `https://hnrss.org/frontpage`
- Dev.to: `https://dev.to/feed`
- CSS Tricks: `https://css-tricks.com/feed/`
- Smashing Magazine: `https://www.smashingmagazine.com/feed/`

**產業新聞:**
- TechCrunch: `https://techcrunch.com/feed/`
- The Verge: `https://www.theverge.com/rss/index.xml`
- Wired: `https://www.wired.com/feed/rss`

## Gemini 模型選項

| 模型 | 說明 | 適用場景 |
|------|------|----------|
| gemini-2.0-flash | 最新快速模型 | 一般文章生成（推薦） |
| gemini-1.5-pro | 進階模型 | 複雜內容生成 |
| gemini-1.5-flash | 快速模型 | 簡短內容 |

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
- 常見錯誤：
  - `INVALID_API_KEY`: API Key 無效
  - `RESOURCE_EXHAUSTED`: 超過配額限制

### Facebook 發布失敗
- 確認 Page Access Token 未過期
- 確認應用程式有正確權限
