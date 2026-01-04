---
title: "Svelte 5 + Vite 快速開發指南"
description: "使用 Svelte 5 的 Runes 語法與 Vite 建構現代化前端應用"
published: "2024-12-12"
tags: ["Svelte", "Vite", "前端開發", "JavaScript"]
category: "other"
author: "蘇勃任"
---

## 為什麼選擇 Svelte 5？

Svelte 5 帶來革命性的 Runes 語法，讓響應式開發更加直覺：

- 編譯時期優化，執行效能極佳
- 無虛擬 DOM，更新效率高
- 語法簡潔，學習曲線平緩
- 套件體積小

## 專案初始化

```bash
# 建立 Svelte 5 + Vite 專案
npm create vite@latest my-app -- --template svelte

# 進入專案目錄
cd my-app

# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev
```

## Svelte 5 Runes 語法

### $state - 響應式狀態

```svelte
<script>
    // Svelte 5 使用 $state
    let count = $state(0);
    let user = $state({ name: '', email: '' });

    function increment() {
        count++;  // 直接修改即可
    }
</script>

<button onclick={increment}>
    點擊次數：{count}
</button>
```

### $derived - 衍生狀態

```svelte
<script>
    let price = $state(100);
    let quantity = $state(1);

    // 自動計算的衍生值
    let total = $derived(price * quantity);
    let discount = $derived(total > 500 ? total * 0.1 : 0);
    let finalPrice = $derived(total - discount);
</script>

<p>總價：{total}</p>
<p>折扣：{discount}</p>
<p>應付：{finalPrice}</p>
```

### $effect - 副作用處理

```svelte
<script>
    let searchTerm = $state('');
    let results = $state([]);

    // 監聽變化執行副作用
    $effect(() => {
        if (searchTerm.length > 2) {
            fetchResults(searchTerm).then(data => {
                results = data;
            });
        }
    });
</script>

<input bind:value={searchTerm} placeholder="搜尋..." />
```

## Vite 設定

### vite.config.js

```javascript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8069',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist',
        minify: 'esbuild'
    }
});
```

### 環境變數

```bash
# .env
VITE_API_URL=http://localhost:8069
VITE_LIFF_ID=1234567890-abcdefgh
```

```javascript
// 使用環境變數
const apiUrl = import.meta.env.VITE_API_URL;
```

## 整合 Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
export default {
    content: ['./src/**/*.{html,js,svelte}'],
    theme: {
        extend: {}
    },
    plugins: []
};
```

```svelte
<!-- 使用 Tailwind -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    按鈕
</button>
```

## 元件設計模式

### Props 與事件

```svelte
<!-- Button.svelte -->
<script>
    let { label, variant = 'primary', onclick } = $props();

    const variants = {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-200 text-gray-800',
        danger: 'bg-red-500 text-white'
    };
</script>

<button class={variants[variant]} {onclick}>
    {label}
</button>
```

### 使用元件

```svelte
<script>
    import Button from './Button.svelte';

    function handleClick() {
        console.log('clicked!');
    }
</script>

<Button label="送出" onclick={handleClick} />
<Button label="取消" variant="secondary" />
<Button label="刪除" variant="danger" />
```

## API 整合

```javascript
// lib/api.js
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchData(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error('API Error');
    return response.json();
}

export async function postData(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
}
```

## 專案結構

```
src/
├── lib/
│   ├── api.js          # API 封裝
│   └── utils.js        # 工具函數
├── components/
│   ├── Button.svelte
│   ├── Card.svelte
│   └── Modal.svelte
├── pages/
│   ├── Home.svelte
│   └── Detail.svelte
├── App.svelte
└── main.js
```

## 建構與部署

```bash
# 建構生產版本
npm run build

# 預覽建構結果
npm run preview
```

Svelte 5 + Vite 的組合提供了極佳的開發體驗與效能表現，非常適合建構現代化的 Web 應用。
