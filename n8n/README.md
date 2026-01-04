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

#### Anthropic API
1. 前往 Settings → Credentials → Add Credential
2. 選擇 "Anthropic"
3. 填入你的 API Key

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
        Code Node: 合併資料
            │
            ▼
        Claude API: 生成 Markdown 文章
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

#### 步驟 3: Code Node - 合併資料
```javascript
const githubEvents = $('Get GitHub Events').item.json;

// 提取最近 commits
const commits = Array.isArray(githubEvents) 
  ? githubEvents
      .filter(e => e.type === 'PushEvent')
      .slice(0, 5)
      .map(e => ({
        repo: e.repo.name,
        message: e.payload.commits?.[0]?.message,
        date: e.created_at
      }))
  : [];

return {
  json: {
    github: { commits },
    generatedAt: new Date().toISOString()
  }
};
```

#### 步驟 4: Anthropic Node - 生成內容
使用 Claude API 生成文章：

```
Model: claude-sonnet-4-20250514
Prompt: 根據以下資料撰寫技術部落格文章...
Max Tokens: 2048
```

#### 步驟 5: Code Node - 準備檔案
```javascript
const content = $input.item.json.content;
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

#### 步驟 6: HTTP Request - 建立 GitHub 檔案
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

#### 步驟 7: Wait Node
等待 60 秒讓 GitHub Actions 完成部署

#### 步驟 8: Facebook Graph API
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

### Anthropic API Key
- 前往: https://console.anthropic.com/
- 建立 API Key

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

## 故障排除

### n8n 無法連接
```bash
docker-compose logs n8n
```

### GitHub API 錯誤
- 確認 Token 有效且有正確權限
- 檢查 rate limit: https://api.github.com/rate_limit

### Claude API 錯誤
- 確認 API Key 有效
- 檢查額度是否足夠

### Facebook 發布失敗
- 確認 Page Access Token 未過期
- 確認應用程式有正確權限
