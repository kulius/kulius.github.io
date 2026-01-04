---
title: "Google Gemini API 整合實戰"
description: "運用 Google Gemini API 建構智慧應用，從文字生成到多模態處理"
published: 2024-12-25
tags: ["AI", "Gemini", "Google", "API"]
category: "ai"
author: "蘇勃任"
---

## Gemini 模型介紹

Google Gemini 是 Google 推出的新一代多模態 AI 模型，具備強大的文字、圖片、音訊與影片處理能力。

## 模型版本

| 版本 | 特點 | 適用場景 |
|------|------|----------|
| Gemini Pro | 平衡效能與成本 | 一般對話與文字生成 |
| Gemini Flash | 快速回應 | 即時應用 |
| Gemini Ultra | 最強能力 | 複雜推理任務 |

## API 整合

### 基本設定

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function generateContent(prompt) {
    const result = await model.generateContent(prompt);
    return result.response.text();
}
```

### 多輪對話

```javascript
const chat = model.startChat({
    history: [
        { role: 'user', parts: [{ text: '你好，我想了解 Odoo' }] },
        { role: 'model', parts: [{ text: 'Odoo 是開源 ERP 系統...' }] },
    ],
});

const result = await chat.sendMessage('如何開始學習？');
```

### 圖片分析

```javascript
const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

async function analyzeImage(imageBase64, prompt) {
    const result = await visionModel.generateContent([
        prompt,
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
    ]);
    return result.response.text();
}
```

## 實際應用場景

### 1. 自動化內容生成

```javascript
// n8n 工作流程中的 Gemini 節點
const prompt = `
根據以下資訊生成一篇技術文章：
標題：${title}
關鍵字：${keywords.join(', ')}
字數：約 500 字
風格：專業但易懂
`;

const article = await generateContent(prompt);
```

### 2. 客戶訊息分析

```javascript
// 分析客戶來信意圖
const analysis = await generateContent(`
分析以下客戶訊息的意圖和情緒：
${customerMessage}

回傳 JSON 格式：
{ "intent": "...", "sentiment": "...", "priority": "..." }
`);
```

### 3. 文件摘要

```javascript
// 長文件自動摘要
const summary = await generateContent(`
請為以下技術文件生成摘要，包含：
1. 主要功能
2. 技術特點
3. 適用場景

文件內容：
${documentContent}
`);
```

## 與 Odoo 整合

```python
# Odoo 中使用 Gemini API
import google.generativeai as genai

class ProductDescriptionWizard(models.TransientModel):
    _name = 'product.description.wizard'

    def generate_description(self):
        genai.configure(api_key=self.env['ir.config_parameter'].get_param('gemini_api_key'))
        model = genai.GenerativeModel('gemini-pro')

        prompt = f"為以下產品生成銷售描述：{self.product_id.name}"
        response = model.generate_content(prompt)

        self.product_id.description_sale = response.text
```

## 最佳實踐

1. **Prompt 工程** - 清晰描述需求與格式
2. **錯誤處理** - 實作重試機制
3. **成本控制** - 監控 API 使用量
4. **快取策略** - 避免重複請求

## 相關資源

- [Gemini API 文件](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
