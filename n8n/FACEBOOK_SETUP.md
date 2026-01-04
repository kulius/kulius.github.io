# Facebook 粉專整合設定指南

## 前置需求

1. Facebook 開發者帳號
2. 已建立的 Facebook 粉絲專頁
3. 粉專的管理員權限

## 步驟一：建立 Facebook 開發者應用程式

1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 點擊「我的應用程式」→「建立應用程式」
3. 選擇「商業」類型
4. 填寫應用程式名稱（例如：Kulius Blog Automation）
5. 完成建立

## 步驟二：新增 Facebook Login 產品

1. 在應用程式儀表板，點擊「新增產品」
2. 選擇「Facebook 登入」→「設定」
3. 選擇「網站」平台
4. 填入網站 URL：`https://kulius.github.io`

## 步驟三：設定權限

在「應用程式審查」→「權限與功能」中申請：

### 必要權限
- `pages_manage_posts` - 發布貼文到粉專
- `pages_read_engagement` - 讀取貼文互動數據
- `pages_show_list` - 列出管理的粉專

### 申請步驟
1. 點擊各權限旁的「申請」
2. 填寫使用說明（說明用途為自動發布部落格文章）
3. 提供螢幕截圖展示功能
4. 提交審查

## 步驟四：取得 Page Access Token

### 方法 A：使用 Graph API Explorer（推薦測試用）

1. 前往 [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. 選擇你的應用程式
3. 點擊「產生存取權杖」
4. 勾選所需權限：
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
5. 點擊「取得存取權杖」
6. 授權後，執行以下查詢取得粉專 Token：

```
GET /me/accounts
```

回應會包含你管理的所有粉專及其 `access_token`

### 方法 B：使用 Access Token Debugger

1. 前往 [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
2. 貼上取得的 Token
3. 點擊「擴展存取權杖」取得長期 Token

## 步驟五：取得 Page ID

1. 在 Graph API Explorer 執行：
```
GET /me/accounts
```

2. 找到你的粉專，記下 `id` 欄位

或者：
1. 前往你的 Facebook 粉專
2. 點擊「關於」
3. 捲動到最下方找到「粉絲專頁編號」

## 步驟六：設定 n8n

將以下資訊加入 `n8n/.env`：

```env
FB_PAGE_ACCESS_TOKEN=你的粉專存取權杖
FB_PAGE_ID=你的粉專ID
```

## 發文格式

n8n 工作流程會自動產生以下格式的貼文：

```
🆕 新文章發布！

[文章標題]

閱讀全文: https://kulius.github.io/blog/[slug]
```

貼文會自動附帶：
- 文章連結預覽（使用 OG Image）
- 文章描述

## 圖文並茂功能

由於你選擇了「圖文並茂」發布方式，系統會：

1. **使用 OG Image**：每篇文章都有動態生成的封面圖
2. **自動抓取預覽**：Facebook 會自動抓取 OG 標籤生成預覽

### OG 標籤結構
```html
<meta property="og:title" content="文章標題" />
<meta property="og:description" content="文章描述" />
<meta property="og:image" content="https://kulius.github.io/og/[slug].png" />
<meta property="og:url" content="https://kulius.github.io/blog/[slug]" />
```

## 手動發布到 Facebook

如果需要手動測試，可以使用 curl：

```bash
curl -X POST "https://graph.facebook.com/v18.0/{PAGE_ID}/feed" \
  -d "message=測試貼文" \
  -d "link=https://kulius.github.io" \
  -d "access_token={PAGE_ACCESS_TOKEN}"
```

## 故障排除

### Token 過期
- 短期 Token 約 1 小時過期
- 長期 Token 約 60 天過期
- 建議使用長期 Token 並設定提醒更新

### 權限不足
錯誤訊息：`(#200) Requires either publish_to_groups permission...`
- 確認已申請並核准 `pages_manage_posts` 權限

### 找不到粉專
錯誤訊息：`(#10) This post cannot be shared...`
- 確認 Page ID 正確
- 確認 Token 是 Page Token 而非 User Token

### 偵錯工具
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Sharing Debugger](https://developers.facebook.com/tools/debug/) - 檢查 OG 標籤
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

## Token 自動更新（進階）

為避免 Token 過期，可以建立另一個 n8n 工作流程定期更新 Token：

1. 使用長期 User Token
2. 定期（每 50 天）呼叫 API 更新 Page Token
3. 儲存新 Token 到環境變數

```javascript
// n8n Code Node
const response = await this.helpers.request({
  method: 'GET',
  url: `https://graph.facebook.com/v18.0/oauth/access_token`,
  qs: {
    grant_type: 'fb_exchange_token',
    client_id: '{APP_ID}',
    client_secret: '{APP_SECRET}',
    fb_exchange_token: '{SHORT_LIVED_TOKEN}'
  }
});
```
