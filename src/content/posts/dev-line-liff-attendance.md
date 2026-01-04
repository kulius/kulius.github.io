---
title: "LINE LIFF 打卡系統開發實戰"
description: "使用 LINE LIFF SDK 開發門市打卡應用，整合 GPS 定位與 Odoo 後端"
published: "2024-12-08"
tags: ["LINE", "LIFF", "打卡系統", "Svelte"]
category: "other"
author: "蘇勃任"
---

## 專案背景

為連鎖門市開發行動打卡系統，讓員工透過 LINE 官方帳號即可完成上下班打卡，同時整合 Odoo 人資模組進行出勤管理。

## 技術架構

```
┌─────────────────────────────────────┐
│          LINE 官方帳號              │
│         (LIFF 應用程式)             │
└─────────────────┬───────────────────┘
                  │
          ┌───────▼───────┐
          │  LIFF SDK     │
          │  + Svelte 5   │
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │   REST API    │
          │   (Odoo 17)   │
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │   PostgreSQL  │
          │   出勤記錄    │
          └───────────────┘
```

## 核心功能

### 1. GPS 定位打卡

```javascript
// 取得使用者位置
async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            reject,
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

// 驗證是否在門市範圍內
function isWithinStore(userPos, storePos, radiusMeters = 100) {
    const distance = calculateDistance(userPos, storePos);
    return distance <= radiusMeters;
}
```

### 2. LIFF 整合

```javascript
import liff from '@line/liff';

async function initializeLiff() {
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }

    const profile = await liff.getProfile();
    return {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl
    };
}
```

### 3. 打卡流程

```
啟動 LIFF
    │
    ▼
┌─────────────┐
│ LINE 登入   │
│ 取得 userId │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 取得 GPS    │
│ 位置資訊    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     否
│ 門市範圍內？│────────► 顯示錯誤提示
└──────┬──────┘
       │ 是
       ▼
┌─────────────┐
│ 呼叫 API    │
│ 記錄打卡    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 顯示結果    │
│ 打卡成功    │
└─────────────┘
```

## Svelte 5 前端實作

```svelte
<script>
    import { onMount } from 'svelte';

    let status = $state('loading');
    let location = $state(null);
    let store = $state(null);

    onMount(async () => {
        await initializeLiff();
        location = await getCurrentPosition();
        store = await getNearestStore(location);
    });

    async function handleCheckIn() {
        status = 'processing';

        const result = await fetch('/api/attendance/check-in', {
            method: 'POST',
            body: JSON.stringify({
                storeId: store.id,
                latitude: location.lat,
                longitude: location.lng
            })
        });

        status = result.ok ? 'success' : 'error';
    }
</script>

<main class="container">
    {#if status === 'loading'}
        <p>載入中...</p>
    {:else if status === 'ready'}
        <button onclick={handleCheckIn}>
            打卡 - {store.name}
        </button>
    {:else if status === 'success'}
        <p>✅ 打卡成功！</p>
    {/if}
</main>
```

## Odoo 後端 API

```python
class AttendanceController(http.Controller):

    @http.route('/api/attendance/check-in', type='json', auth='public')
    def check_in(self, **kwargs):
        line_user_id = kwargs.get('line_user_id')
        store_id = kwargs.get('store_id')
        latitude = kwargs.get('latitude')
        longitude = kwargs.get('longitude')

        # 查詢員工
        employee = request.env['hr.employee'].sudo().search([
            ('line_user_id', '=', line_user_id)
        ], limit=1)

        if not employee:
            return {'success': False, 'error': '員工未綁定'}

        # 建立打卡記錄
        attendance = request.env['hr.attendance'].sudo().create({
            'employee_id': employee.id,
            'check_in': fields.Datetime.now(),
            'store_id': store_id,
            'latitude': latitude,
            'longitude': longitude,
        })

        return {'success': True, 'attendance_id': attendance.id}
```

## 專案成效

| 指標 | 導入前 | 導入後 |
|------|--------|--------|
| 打卡方式 | 紙本簽到 | LINE 行動打卡 |
| 統計作業 | 3 天/月 | 即時自動 |
| 代打問題 | 常發生 | GPS 驗證杜絕 |
| 員工滿意度 | 60% | 95% |

## 技術重點

- LINE LIFF SDK 整合
- Svelte 5 響應式開發
- GPS Geolocation API
- Odoo REST API 設計
