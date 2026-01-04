---
title: "Model Context Protocol (MCP)：AI 工具整合新標準"
description: "了解 Anthropic 推出的 MCP 協定，如何讓 AI 模型連接各種外部工具與資料來源"
published: "2024-12-12"
tags: ["AI", "MCP", "Claude", "整合"]
category: "ai"
author: "蘇勃任"
---

## MCP 簡介

Model Context Protocol (MCP) 是 Anthropic 推出的開放協定，讓 AI 模型能夠安全地連接各種外部工具、資料庫和 API。

## 核心概念

### 1. 資源 (Resources)
- 檔案系統存取
- 資料庫查詢
- API 呼叫結果

### 2. 工具 (Tools)
- 執行特定操作
- 與外部系統互動
- 自動化任務

### 3. 提示範本 (Prompts)
- 預定義指令
- 工作流程模板
- 上下文注入

## 架構設計

```
┌─────────────┐     ┌─────────────┐
│  AI 模型    │◀───▶│  MCP Server │
│  (Claude)   │     └──────┬──────┘
└─────────────┘            │
                    ┌──────┴──────┐
              ┌─────┴─────┐ ┌─────┴─────┐
              │ 資料庫    │ │ 外部 API  │
              └───────────┘ └───────────┘
```

## 實際應用

### Odoo 整合範例

建立 MCP Server 讓 Claude 直接操作 Odoo：

```python
# MCP Server for Odoo
from mcp import Server

class OdooMCPServer(Server):
    def __init__(self, odoo_url, db, user, password):
        self.odoo = OdooAPI(odoo_url, db, user, password)
    
    async def list_resources(self):
        return [
            Resource("odoo://partners", "客戶清單"),
            Resource("odoo://orders", "訂單清單"),
        ]
    
    async def call_tool(self, name, args):
        if name == "create_order":
            return self.odoo.create_sale_order(args)
```

### 使用情境

1. **客服系統** - AI 自動查詢客戶資訊
2. **報表生成** - 自然語言生成報表
3. **系統監控** - AI 分析日誌異常

## 優勢

- 標準化的整合介面
- 安全的權限控制
- 易於擴展與維護

## 相關資源

- [MCP 官方文件](https://modelcontextprotocol.io/)
- [Claude MCP 整合指南](https://docs.anthropic.com/claude/docs/mcp)
