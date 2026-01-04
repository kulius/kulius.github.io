---
title: "LINE 預約系統開發：從需求到上線"
description: "透過 LINE 官方帳號打造預約系統，讓顧客輕鬆完成服務預約"
published: "2024-12-10"
tags: ["LINE", "預約系統", "LIFF", "Odoo"]
category: "other"
author: "蘇勃任"
---

## 專案需求

服務業客戶需要一套整合 LINE 的預約系統：

- 顧客透過 LINE 預約服務
- 自動發送預約提醒
- 後台管理預約排程
- 與 Odoo 會員系統整合

## 系統架構

```
┌─────────────────────────────────────────────┐
│                LINE 平台                     │
├─────────────┬─────────────┬─────────────────┤
│   Rich Menu │   LIFF App  │   Messaging API │
│   快捷選單  │   預約介面  │   推播通知      │
└──────┬──────┴──────┬──────┴────────┬────────┘
       │             │               │
       └─────────────┼───────────────┘
                     │
             ┌───────▼───────┐
             │  Node.js API  │
             │  Webhook      │
             └───────┬───────┘
                     │
             ┌───────▼───────┐
             │   Odoo 17     │
             │  預約模組     │
             └───────────────┘
```

## 核心功能模組

### 1. 服務選擇

```svelte
<script>
    let services = $state([]);
    let selectedService = $state(null);

    onMount(async () => {
        services = await fetchServices();
    });
</script>

<div class="service-list">
    {#each services as service}
        <button
            class:selected={selectedService?.id === service.id}
            onclick={() => selectedService = service}
        >
            <h3>{service.name}</h3>
            <p>{service.duration} 分鐘 | NT$ {service.price}</p>
        </button>
    {/each}
</div>
```

### 2. 時段選擇

```javascript
// 取得可預約時段
async function getAvailableSlots(serviceId, date) {
    const response = await fetch(
        `/api/reservation/slots?service=${serviceId}&date=${date}`
    );
    return response.json();
}

// 時段顯示邏輯
function formatSlots(slots) {
    return slots.map(slot => ({
        time: slot.start_time,
        available: slot.remaining > 0,
        remaining: slot.remaining
    }));
}
```

### 3. 預約確認流程

```
選擇服務
    │
    ▼
選擇日期
    │
    ▼
選擇時段
    │
    ▼
┌─────────────┐
│ 填寫資料    │
│ 姓名/電話   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 確認預約    │
│ 顯示摘要    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 建立預約    │
│ 發送通知    │
└─────────────┘
```

## Odoo 預約模組

```python
class Reservation(models.Model):
    _name = 'reservation.booking'
    _description = '預約記錄'

    name = fields.Char('預約編號', readonly=True)
    customer_id = fields.Many2one('res.partner', '顧客')
    service_id = fields.Many2one('reservation.service', '服務項目')
    staff_id = fields.Many2one('hr.employee', '服務人員')
    date = fields.Date('預約日期')
    time_slot = fields.Selection([
        ('09:00', '09:00'), ('10:00', '10:00'),
        ('11:00', '11:00'), ('14:00', '14:00'),
        ('15:00', '15:00'), ('16:00', '16:00'),
    ], '預約時段')
    state = fields.Selection([
        ('draft', '待確認'),
        ('confirmed', '已確認'),
        ('done', '已完成'),
        ('cancel', '已取消'),
    ], default='draft')
    line_user_id = fields.Char('LINE User ID')

    @api.model
    def create(self, vals):
        vals['name'] = self.env['ir.sequence'].next_by_code('reservation.booking')
        record = super().create(vals)
        record._send_confirmation_message()
        return record

    def _send_confirmation_message(self):
        """發送 LINE 預約確認訊息"""
        message = f"""
        ✅ 預約成功！

        📋 預約編號：{self.name}
        📅 日期：{self.date}
        ⏰ 時間：{self.time_slot}
        💇 服務：{self.service_id.name}

        如需取消請提前 24 小時通知
        """
        self._send_line_message(self.line_user_id, message)
```

## LINE 訊息推播

```python
import requests

class LineMessaging:
    def __init__(self, channel_token):
        self.token = channel_token
        self.api_url = 'https://api.line.me/v2/bot/message/push'

    def send_message(self, user_id, message):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        payload = {
            'to': user_id,
            'messages': [{'type': 'text', 'text': message}]
        }
        return requests.post(self.api_url, headers=headers, json=payload)

    def send_reminder(self, booking):
        """預約前一天提醒"""
        message = f"""
        📢 預約提醒

        您明天有一筆預約：
        ⏰ {booking.time_slot}
        💇 {booking.service_id.name}

        期待您的光臨！
        """
        self.send_message(booking.line_user_id, message)
```

## 專案成效

| 指標 | 成效 |
|------|------|
| 電話預約減少 | 80% |
| 預約取消率 | 降低 40% |
| 顧客滿意度 | 提升 25% |
| 行政作業時間 | 減少 60% |

## 延伸功能

- 服務評價回饋
- 會員點數累積
- 優惠券發放
- 預約候補機制
