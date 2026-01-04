---
title: "Odoo 碳盤查與 ESG 永續管理模組"
description: "協助企業建立碳排放追蹤、永續報告與 ESG 合規管理系統"
pubDate: "2024-12-05"
tags: ["Odoo", "ESG", "碳盤查", "永續發展"]
category: "odoo"
author: "蘇勃任"
---

## 專案背景

隨著全球淨零排放目標的推進，企業面臨越來越嚴格的 ESG 揭露要求。本專案開發完整的碳盤查與永續管理模組，協助企業符合法規要求並展現社會責任。

## 功能模組

### 1. 碳排放追蹤 (carbon_management)
- 範疇一、二、三排放計算
- 自動化碳足跡數據收集
- 排放係數資料庫

### 2. 員工通勤碳排 (sustainability_employee_commuting)
- 通勤方式與距離統計
- 碳排放量自動計算
- 綠色通勤獎勵機制

### 3. 採購永續評估 (sustainability_purchase)
- 供應商 ESG 評分
- 綠色採購追蹤
- 產品碳足跡標籤

### 4. 報表與揭露
- 符合 GRI 標準的報表
- 視覺化儀表板
- 自動化年度報告產出

## 技術實作

整合 Odoo 的 MIS Builder 模組，建立彈性的永續指標報表：

```python
class SustainabilityReport(models.Model):
    _name = 'sustainability.report'
    
    scope1_emission = fields.Float('範疇一排放')
    scope2_emission = fields.Float('範疇二排放')
    scope3_emission = fields.Float('範疇三排放')
```

## 效益

- 碳盤查作業時間縮短 50%
- 符合金管會永續報告要求
- 提升企業 ESG 評等
