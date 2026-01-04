---
title: "LINE Bot 與 Odoo 整合開發"
description: "建構 LINE Bot 串接 Odoo ERP，實現訂單查詢、庫存通知等自動化功能"
pubDate: "2024-12-15"
tags: ["LINE Bot", "Odoo", "API", "Webhook"]
category: "other"
author: "蘇勃任"
---

## 整合目標

透過 LINE Bot 讓使用者直接在 LINE 中：
- 查詢訂單狀態
- 接收出貨通知
- 查詢產品庫存
- 線上客服對話

## 系統架構

```
┌─────────────────────────────────────┐
│          LINE Platform              │
│    Messaging API / Webhook          │
└─────────────────┬───────────────────┘
                  │
          ┌───────▼───────┐
          │   Node.js     │
          │   Bot Server  │
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │  Odoo XML-RPC │
          │     API       │
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │   Odoo 17     │
          │  ERP System   │
          └───────────────┘
```

## LINE Bot 設定

### Webhook 設定

```javascript
// Express.js Webhook 處理
const express = require('express');
const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

app.post('/webhook', line.middleware(config), async (req, res) => {
    const events = req.body.events;

    await Promise.all(events.map(handleEvent));
    res.status(200).end();
});

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return null;
    }

    const userMessage = event.message.text;
    const replyToken = event.replyToken;

    // 訊息路由
    if (userMessage.startsWith('訂單')) {
        return handleOrderQuery(replyToken, userMessage);
    } else if (userMessage.startsWith('庫存')) {
        return handleStockQuery(replyToken, userMessage);
    } else {
        return handleDefault(replyToken);
    }
}
```

### 訂單查詢功能

```javascript
const OdooAPI = require('./odoo-api');

async function handleOrderQuery(replyToken, message) {
    // 解析訂單編號
    const orderNo = message.replace('訂單', '').trim();

    // 查詢 Odoo
    const order = await OdooAPI.searchOrder(orderNo);

    if (!order) {
        return client.replyMessage(replyToken, {
            type: 'text',
            text: '找不到此訂單，請確認訂單編號'
        });
    }

    // 建立訂單卡片
    const flexMessage = createOrderCard(order);
    return client.replyMessage(replyToken, flexMessage);
}

function createOrderCard(order) {
    return {
        type: 'flex',
        altText: `訂單 ${order.name}`,
        contents: {
            type: 'bubble',
            header: {
                type: 'box',
                layout: 'vertical',
                contents: [{
                    type: 'text',
                    text: order.name,
                    weight: 'bold',
                    size: 'xl'
                }]
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    { type: 'text', text: `狀態：${order.state}` },
                    { type: 'text', text: `金額：NT$ ${order.amount_total}` },
                    { type: 'text', text: `日期：${order.date_order}` }
                ]
            }
        }
    };
}
```

## Odoo API 封裝

```javascript
// odoo-api.js
const xmlrpc = require('xmlrpc');

class OdooAPI {
    constructor() {
        this.url = process.env.ODOO_URL;
        this.db = process.env.ODOO_DB;
        this.uid = null;
    }

    async authenticate() {
        const client = xmlrpc.createClient({
            url: `${this.url}/xmlrpc/2/common`
        });

        return new Promise((resolve, reject) => {
            client.methodCall('authenticate', [
                this.db,
                process.env.ODOO_USER,
                process.env.ODOO_PASSWORD,
                {}
            ], (err, uid) => {
                if (err) reject(err);
                this.uid = uid;
                resolve(uid);
            });
        });
    }

    async searchOrder(orderNo) {
        const client = xmlrpc.createClient({
            url: `${this.url}/xmlrpc/2/object`
        });

        return new Promise((resolve, reject) => {
            client.methodCall('execute_kw', [
                this.db, this.uid, process.env.ODOO_PASSWORD,
                'sale.order', 'search_read',
                [[['name', '=', orderNo]]],
                { fields: ['name', 'state', 'amount_total', 'date_order'] }
            ], (err, result) => {
                if (err) reject(err);
                resolve(result[0] || null);
            });
        });
    }

    async getStock(productName) {
        const client = xmlrpc.createClient({
            url: `${this.url}/xmlrpc/2/object`
        });

        return new Promise((resolve, reject) => {
            client.methodCall('execute_kw', [
                this.db, this.uid, process.env.ODOO_PASSWORD,
                'product.product', 'search_read',
                [[['name', 'ilike', productName]]],
                { fields: ['name', 'qty_available', 'virtual_available'] }
            ], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
}

module.exports = new OdooAPI();
```

## 主動推播通知

```python
# Odoo 中發送 LINE 通知
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def action_confirm(self):
        res = super().action_confirm()

        # 發送 LINE 通知
        if self.partner_id.line_user_id:
            self._send_line_notification()

        return res

    def _send_line_notification(self):
        message = f"""
        📦 訂單確認通知

        訂單編號：{self.name}
        金額：NT$ {self.amount_total:,.0f}

        感謝您的訂購！
        """

        self.env['line.messaging'].send_push_message(
            self.partner_id.line_user_id,
            message
        )
```

## Rich Menu 設計

```json
{
    "size": { "width": 2500, "height": 843 },
    "selected": true,
    "name": "主選單",
    "areas": [
        {
            "bounds": { "x": 0, "y": 0, "width": 833, "height": 843 },
            "action": { "type": "message", "text": "訂單查詢" }
        },
        {
            "bounds": { "x": 833, "y": 0, "width": 833, "height": 843 },
            "action": { "type": "message", "text": "庫存查詢" }
        },
        {
            "bounds": { "x": 1666, "y": 0, "width": 834, "height": 843 },
            "action": { "type": "uri", "uri": "https://liff.line.me/xxx" }
        }
    ]
}
```

## 部署架構

```
┌─────────────────────────────────────┐
│           Cloud Server              │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  │
│  │   nginx     │  │   PM2       │  │
│  │   reverse   │──│   Node.js   │  │
│  │   proxy     │  │   Bot       │  │
│  └─────────────┘  └─────────────┘  │
│                         │          │
│                   ┌─────▼─────┐    │
│                   │   Odoo    │    │
│                   │   Server  │    │
│                   └───────────┘    │
└─────────────────────────────────────┘
```

## 成效

| 功能 | 效益 |
|------|------|
| 訂單查詢 | 客服詢問減少 50% |
| 出貨通知 | 顧客滿意度提升 30% |
| 自動回覆 | 24/7 即時服務 |
