---
title: "Odoo 台灣電子發票整合開發"
description: "整合財政部電子發票 API，實現 B2B、B2C 發票自動開立與作廢"
published: 2024-11-20
tags: ["Odoo", "電子發票", "台灣", "API整合"]
category: "odoo"
author: "蘇勃任"
---

## 專案目標

協助企業符合台灣電子發票法規要求，開發與財政部電子發票平台及第三方加值中心（如綠界、藍新）的整合模組。

## 整合功能

### 1. 發票開立 (amego_invoice_tw)
- B2B 電子發票開立
- B2C 雲端發票
- 自動發票號碼管理

### 2. 銷售整合 (amego_invoice_tw_sale)
- 訂單確認自動開立發票
- 發票資訊自動帶入
- 多稅率支援

### 3. 綠界整合 (ecpay_invoice_tw)
- ECPay API 串接
- 發票查詢與作廢
- 中獎通知處理

### 4. 申報匯出 (tw_tax_media_export)
- 營業稅申報媒體檔
- 發票明細匯出
- 統一編號驗證

## API 整合架構

```
┌─────────────┐     ┌─────────────┐
│   Odoo      │────▶│  加值中心   │
│  銷售/會計  │◀────│ ECPay/藍新  │
└─────────────┘     └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │  財政部平台  │
                   └─────────────┘
```

## 技術細節

```python
class InvoiceAPI(models.Model):
    _name = 'invoice.api'
    
    def create_invoice(self, order):
        # 呼叫電子發票 API
        payload = self._prepare_invoice_data(order)
        response = requests.post(API_URL, json=payload)
        return response.json()
```

## 導入效益

- 發票作業時間減少 80%
- 零人工開立錯誤
- 自動化申報節省 2 人天/月
