---
title: "Cursor + Vibe Coding：AI 輔助開發新範式"
description: "如何運用 Cursor 編輯器與 Vibe Coding 流程，實現高效的 AI 協作開發"
published: "2024-12-18"
tags: ["AI", "Cursor", "開發工具", "Vibe Coding"]
category: "ai"
author: "蘇勃任"
---

## Vibe Coding 是什麼？

Vibe Coding 是一種新興的開發模式，開發者透過自然語言描述需求，讓 AI 生成程式碼，再進行審核與調整。這種方式大幅降低了程式開發的門檻。

## Cursor 編輯器

Cursor 是基於 VS Code 的 AI 優先編輯器，內建強大的 AI 功能：

### 核心功能

1. **Composer** - 多檔案編輯
   - 跨檔案程式碼生成
   - 專案級別重構
   - 智慧相依性處理

2. **Chat** - 程式碼對話
   - 即時問答
   - 程式碼解釋
   - Debug 輔助

3. **Tab** - 自動補全
   - 智慧程式碼建議
   - 上下文感知
   - 多行補全

## Vibe Coding 工作流程

```
1. 描述需求
   "我需要一個 Odoo 模組來管理客戶預約"
   
2. AI 生成初版
   → 模型定義
   → 視圖設計
   → 權限設定
   
3. 審核調整
   → 檢查邏輯
   → 修正細節
   → 測試驗證
   
4. 迭代優化
   → 追加功能
   → 效能調整
   → 程式碼重構
```

## 實際案例：Odoo 模組開發

使用 Cursor + Claude 開發一個完整的 Odoo 預約模組：

```python
# Prompt: 建立預約類型模型

class ReservationType(models.Model):
    _name = 'reservation.type'
    _description = '預約類型'
    
    name = fields.Char('名稱', required=True)
    duration = fields.Float('時長（小時）')
    available_days = fields.Char('可預約日')
```

## 效率提升

| 任務 | 傳統方式 | Vibe Coding |
|------|---------|-------------|
| 新模組開發 | 2-3 天 | 2-4 小時 |
| 功能修改 | 數小時 | 數分鐘 |
| Debug | 反覆嘗試 | AI 分析定位 |

## 注意事項

- AI 生成的程式碼需要人工審核
- 複雜業務邏輯仍需專業判斷
- 安全性檢查不可忽略
