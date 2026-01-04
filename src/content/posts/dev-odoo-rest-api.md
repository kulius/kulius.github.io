---
title: "Odoo REST API 開發與整合"
description: "設計與實作 Odoo REST API，提供外部系統整合與行動應用存取"
published: "2024-12-18"
tags: ["Odoo", "REST API", "整合開發", "JSON"]
category: "other"
author: "蘇勃任"
---

## API 設計目標

為 Odoo 系統建立 RESTful API，支援：
- 行動 App 資料存取
- 第三方系統整合
- 前後端分離架構

## API 架構設計

```
┌─────────────────────────────────────────────┐
│              外部應用                        │
│   Mobile App / Web App / Third Party        │
└─────────────────────┬───────────────────────┘
                      │ HTTPS
              ┌───────▼───────┐
              │   API Gateway │
              │   (nginx)     │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │   Odoo REST   │
              │   Controller  │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │   Odoo ORM    │
              │   Business    │
              └───────────────┘
```

## Controller 實作

### 基礎 API Controller

```python
from odoo import http
from odoo.http import request
import json

class APIController(http.Controller):

    def _json_response(self, data, status=200):
        """統一 JSON 回應格式"""
        return request.make_response(
            json.dumps({
                'success': status == 200,
                'data': data,
                'timestamp': fields.Datetime.now().isoformat()
            }),
            headers=[('Content-Type', 'application/json')],
            status=status
        )

    def _authenticate(self):
        """API 認證"""
        token = request.httprequest.headers.get('Authorization')
        if not token:
            return None

        api_key = request.env['api.key'].sudo().search([
            ('token', '=', token.replace('Bearer ', '')),
            ('active', '=', True)
        ], limit=1)

        return api_key.user_id if api_key else None
```

### 產品 API

```python
class ProductAPI(APIController):

    @http.route('/api/v1/products', type='http', auth='public',
                methods=['GET'], csrf=False)
    def get_products(self, **kwargs):
        """取得產品列表"""
        user = self._authenticate()
        if not user:
            return self._json_response({'error': 'Unauthorized'}, 401)

        # 查詢參數
        limit = int(kwargs.get('limit', 20))
        offset = int(kwargs.get('offset', 0))
        category = kwargs.get('category')

        domain = [('sale_ok', '=', True)]
        if category:
            domain.append(('categ_id.name', 'ilike', category))

        products = request.env['product.product'].sudo().search(
            domain, limit=limit, offset=offset
        )

        data = [{
            'id': p.id,
            'name': p.name,
            'sku': p.default_code,
            'price': p.list_price,
            'qty_available': p.qty_available,
            'category': p.categ_id.name,
            'image_url': f'/web/image/product.product/{p.id}/image_128'
        } for p in products]

        return self._json_response({
            'items': data,
            'total': request.env['product.product'].sudo().search_count(domain),
            'limit': limit,
            'offset': offset
        })

    @http.route('/api/v1/products/<int:product_id>', type='http',
                auth='public', methods=['GET'], csrf=False)
    def get_product(self, product_id, **kwargs):
        """取得單一產品詳情"""
        user = self._authenticate()
        if not user:
            return self._json_response({'error': 'Unauthorized'}, 401)

        product = request.env['product.product'].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({'error': 'Product not found'}, 404)

        data = {
            'id': product.id,
            'name': product.name,
            'sku': product.default_code,
            'description': product.description_sale,
            'price': product.list_price,
            'qty_available': product.qty_available,
            'category': {
                'id': product.categ_id.id,
                'name': product.categ_id.name
            },
            'attributes': [{
                'name': attr.attribute_id.name,
                'value': attr.name
            } for attr in product.product_template_attribute_value_ids]
        }

        return self._json_response(data)
```

### 訂單 API

```python
class OrderAPI(APIController):

    @http.route('/api/v1/orders', type='json', auth='public',
                methods=['POST'], csrf=False)
    def create_order(self, **kwargs):
        """建立訂單"""
        user = self._authenticate()
        if not user:
            return {'success': False, 'error': 'Unauthorized'}

        data = request.jsonrequest

        # 驗證必填欄位
        required = ['partner_id', 'lines']
        for field in required:
            if field not in data:
                return {'success': False, 'error': f'Missing {field}'}

        # 建立訂單
        order_lines = []
        for line in data['lines']:
            order_lines.append((0, 0, {
                'product_id': line['product_id'],
                'product_uom_qty': line['quantity'],
                'price_unit': line.get('price_unit', 0)
            }))

        order = request.env['sale.order'].sudo().create({
            'partner_id': data['partner_id'],
            'order_line': order_lines,
            'note': data.get('note', '')
        })

        return {
            'success': True,
            'order_id': order.id,
            'order_name': order.name
        }

    @http.route('/api/v1/orders/<string:order_name>', type='http',
                auth='public', methods=['GET'], csrf=False)
    def get_order(self, order_name, **kwargs):
        """查詢訂單"""
        user = self._authenticate()
        if not user:
            return self._json_response({'error': 'Unauthorized'}, 401)

        order = request.env['sale.order'].sudo().search([
            ('name', '=', order_name)
        ], limit=1)

        if not order:
            return self._json_response({'error': 'Order not found'}, 404)

        data = {
            'name': order.name,
            'date': order.date_order.isoformat(),
            'state': order.state,
            'total': order.amount_total,
            'partner': {
                'id': order.partner_id.id,
                'name': order.partner_id.name
            },
            'lines': [{
                'product': line.product_id.name,
                'quantity': line.product_uom_qty,
                'price': line.price_unit,
                'subtotal': line.price_subtotal
            } for line in order.order_line]
        }

        return self._json_response(data)
```

## API 認證機制

```python
class APIKey(models.Model):
    _name = 'api.key'
    _description = 'API 金鑰'

    name = fields.Char('名稱', required=True)
    token = fields.Char('Token', readonly=True)
    user_id = fields.Many2one('res.users', '對應使用者')
    active = fields.Boolean('啟用', default=True)
    expires_at = fields.Datetime('到期時間')

    @api.model
    def create(self, vals):
        vals['token'] = self._generate_token()
        return super().create(vals)

    def _generate_token(self):
        import secrets
        return secrets.token_urlsafe(32)
```

## API 文件

```yaml
openapi: 3.0.0
info:
  title: Odoo REST API
  version: 1.0.0

paths:
  /api/v1/products:
    get:
      summary: 取得產品列表
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                  total:
                    type: integer
```

## 效益

| 項目 | 說明 |
|------|------|
| 系統整合 | 統一 API 介面 |
| 開發效率 | 前後端分離 |
| 擴展性 | 支援多種客戶端 |
| 維護性 | 版本控管、文件化 |
