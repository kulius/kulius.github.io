import type {
    SiteConfig,
    NavBarConfig,
    SidebarLayoutConfig,
    ProfileConfig,
    AnnouncementConfig,
    PostConfig,
    FooterConfig,
    ParticleConfig,
    MusicPlayerConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

/**
 *
 */

// 設定瀏覽器語言 ('zh', 'en', ...)
const SITE_LANG = "zh";

// 設定網站時區 (from -12 to 12)
const SITE_TIMEZONE = 8; // UTC+8


// 網站配置
export const siteConfig: SiteConfig = {
    // 網站 URL（以斜線結尾）
    siteURL: "https://www.euptop.com/", // 請替換為你的網站 URL 並以斜線結尾
    // 網站標題
    title: "蘇勃任 | Odoo 技術筆記",
    // 網站副標題
    subtitle: "Odoo ERP 客製化開發、AI 整合應用、企業數位轉型",
    // 語言配置
    lang: SITE_LANG, // 自動檢測的瀏覽器語言
    // 翻譯配置
    translate: {
        // 啟用翻譯功能
        enable: false,
        // 翻譯服務
        service: "client.edge", // 使用 Edge 瀏覽器
        // 顯示語言選擇下拉框
        showSelectTag: false, // 使用自訂按鈕
        // 自動檢測使用者語言
        autoDiscriminate: true,
        // 翻譯時忽略的 CSS 類名
        ignoreClasses: ["ignore", "banner-title", "banner-subtitle"],
        // 翻譯時忽略的 HTML 標籤
        ignoreTags: ["script", "style", "code", "pre"],
    },
    // 時區配置
    timeZone: SITE_TIMEZONE,
    // 字型配置
    font: {
        // zenMaruGothic 字型 (適合日語和英語，對中文適配一般)
        zenMaruGothic: {
            // 作為全域字型
            enable: false,
        },
        // Hanalei 字型 (適合中文)
        hanalei: {
            // 作為全域字型
            enable: false,
        },
    },
    // 主題色配置
    themeColor: {
        // 主題色的預設色相 (範圍從 0 到 360。例如：紅色：0，青色：200，藍綠色：250，粉色：345)
        hue: 255,
        // 對訪問者隱藏主題色選擇器
        fixed: false,
    },
    // 預設主題 ("system" 跟隨系統 | "light" 淺色 | "dark" 深色)
    defaultTheme: "dark",
    // 桌布配置
    wallpaper: {
        // 模式 ("banner" 橫幅 | "fullscreen" 全螢幕 | "none" 純色)
        mode: "banner",
        // 圖片來源配置 (fullscreen 和 banner 模式共用)
        src: {
            // 桌面桌布圖片 (支援單張圖片或圖片陣列，當陣列長度 > 1 時自動啟用輪播)
            desktop: [
                "/assets/desktop-banner/desktopBanner_1.webp",
                "/assets/desktop-banner/desktopBanner_2.webp",
                "/assets/desktop-banner/desktopBanner_3.webp",
            ],
            // 行動裝置桌布圖片 (支援單張圖片或圖片陣列，當陣列長度 > 1 時自動啟用輪播)
            mobile: [
                "/assets/mobile-banner/mobileBanner_1.webp",
                "/assets/mobile-banner/mobileBanner_2.webp",
            ],
        },
        // 桌布位置 ('top' | 'center' | 'bottom')
        position: "center",
        // 輪播配置 (fullscreen 和 banner 模式共用)
        carousel: {
            // 為多張圖片啟用輪播，否則隨機顯示一張圖片
            enable: false,
            // 輪播間隔時間 (秒)
            interval: 3.6,
            // 啟用 Ken Burns 效果
            kenBurns: true,
        },
        // Banner 模式專屬配置
        banner: {
            // 橫幅文字配置
            homeText: {
                // 在首頁顯示文字
                enable: false,
                // 主標題
                title: "蘇勃任 | Odoo 技術筆記",
                // 副標題，支援單個字串或字串陣列
                subtitle: [
                    "Odoo 技術筆記", "AI 整合應用", "企業數位轉型",
                ],
                // 副標題打字機效果
                typewriter: {
                    // 啟用副標題打字機效果
                    enable: false,
                    // 打字速度 (毫秒)
                    speed: 111,
                    // 刪除速度 (毫秒)
                    deleteSpeed: 51,
                    // 完全顯示後的暫停時間 (毫秒)
                    pauseTime: 3000,
                },
            },
            // 橫幅圖片來源文字
            credit: {
                // 顯示橫幅圖片來源文字
                enable: false,
                // 要顯示的來源文字
                text: "Describe",
                // (可選) 原始藝術作品或藝術家頁面的 URL 連結
                url: "",
            },
            // 導覽列配置
            navbar: {
                // 導覽列透明模式 ("semi" 半透明加圓角 | "full" 完全透明 | "semifull" 動態透明)
                transparentMode: "semifull",
            },
            // 水波紋效果配置
            waves: {
                // 啟用水波紋效果
                enable: false,
                // 啟用效能模式 (簡化波浪效果以提升效能)
                performanceMode: false,
            },
        },
        // Fullscreen 模式專屬配置
        fullscreen: {
            // 層級
            zIndex: -1, // 確保桌布在背景層
            // 桌布透明度，0-1之間
            opacity: 0.9,
            // 背景模糊程度 (像素值)
            blur: 1,
            // 導覽列透明模式
            navbar: {
                transparentMode: "semi", // 使用半透明模式而不是完全透明
            },
        },
    },
    // OpenGraph 配置
    generateOgImages: false, // 注意開啟圖片生成後要渲染很長時間，不建議本地除錯的時候開啟
    // favicon 配置
    favicon: [
    ],
    // bangumi 配置
    bangumi: {
        // 使用者 ID
        userId: "your-bangumi-id", // 可以設定為 "sai" 測試
    },
};

/**
 *
 */

// 導覽列配置
export const navBarConfig: NavBarConfig = {
    // 連結配置 (支援多級選單)
    links: [
        LinkPreset.Home,
        LinkPreset.Archive,
        {
            name: "連結",
            url: "/links/",
            icon: "material-symbols:link",
            children: [
                {
                    name: "GitHub",
                    url: "https://github.com/kulius",
                    external: true,
                    icon: "fa6-brands:github",
                },
                {
                    name: "Bilibili",
                    url: "https://space.bilibili.com/Example",
                    external: true,
                    icon: "fa6-brands:bilibili",
                },
            ],
        },
        {
            name: "個人",
            url: "/content/",
            icon: "material-symbols:person",
            children: [
                LinkPreset.Projects,
                LinkPreset.Skills,
                LinkPreset.Timeline,
                LinkPreset.Diary,
                LinkPreset.Albums,
                LinkPreset.Anime,
            ],
        },
        {
            name: "關於",
            url: "/content/",
            icon: "material-symbols:info",
            children: [
                LinkPreset.About,
                LinkPreset.Friends,
            ],
        },
    ],
};

/**
 *
 */

// 側邊欄佈局配置
export const sidebarLayoutConfig: SidebarLayoutConfig = {
    // 側邊欄元件配置列表
    components: [
        {
            // 元件類型
            type: "profile", // 使用者資料元件
            // 是否啟用該元件
            enable: false,
            // 元件所屬側邊欄
            side: "left",
            // 元件顯示順序 (數字越小越靠前)
            order: 1,
            // 元件位置
            position: "top", // 固定在頂部
        },
        {
            // 元件類型
            type: "announcement", // 公告元件
            // 是否啟用該元件
            enable: false,
            // 元件所屬側邊欄
            side: "left",
            // 元件顯示順序 (數字越小越靠前)
            order: 2,
            // 元件位置
            position: "top", // 固定在頂部
        },
        {
            // 元件類型
            type: "categories", // 分類元件
            // 是否啟用該元件
            enable: false,
            // 元件所屬側邊欄
            side: "left",
            // 元件顯示順序 (數字越小越靠前)
            order: 3,
            // 元件位置
            position: "sticky", // 黏性定位，可捲動
            // 響應式配置
            responsive: {
                // 摺疊閾值
                collapseThreshold: 5, // 當分類數量超過5個時自動摺疊
            },
        },
        {
            // 元件類型
            type: "tags", // 標籤元件
            // 是否啟用該元件
            enable: false,
            // 元件所屬側邊欄
            side: "left",
            // 元件顯示順序 (數字越小越靠前)
            order: 4,
            // 元件位置
            position: "sticky", // 黏性定位，可捲動
            // 響應式配置
            responsive: {
                // 摺疊閾值
                collapseThreshold: 20, // 當標籤數量超過20個時自動摺疊
            },
        },
        {
            // 元件類型
            type: "toc", // 目錄元件
            // 是否啟用該元件
            enable: false,
            // 元件所屬側邊欄
            side: "right",
            // 元件顯示順序 (數字越小越靠前)
            order: 1,
            // 元件位置
            position: "sticky", // 黏性定位，可捲動
            // 自訂屬性
            customProps: {
                // 目錄深度 (1-6，1 表示只顯示 h1 標題，2 表示顯示 h1 和 h2 標題，依此類推)
                depth: 3,
            },
        },
    ],
    // 響應式佈局配置
    responsive: {
        // 不同裝置的佈局模式 ("hidden" 不顯示側邊欄 | "drawer" 抽屜模式 | "sidebar" 顯示側邊欄)
        layout: {
            // 行動端
            mobile: "sidebar",
            // 平板端
            tablet: "sidebar",
            // 桌面端
            desktop: "sidebar",
        },
    },
};


// Umami 統計配置
export const umamiConfig = {
    // 是否顯示 Umami 統計
    enabled: false,
    // API 金鑰
    apiKey: import.meta.env.UMAMI_API_KEY,
    // Umami Cloud API 地址
    baseUrl: "https://api.umami.is",
    // 要插入的 Script
    scripts: import.meta.env.UMAMI_TRACKING_CODE,
} as const;


// 個人資料配置
export const profileConfig: ProfileConfig = {
    // 頭像配置 (相對於 /src 目錄。如果以 '/' 開頭，則相對於 /public 目錄)
    avatar: "assets/images/avatar.png",
    // 資訊配置
    name: "蘇勃任",
    // 簡介配置
    bio: "Odoo 技術顧問 | AI 整合專家",
    // 連結配置
    links: [
        {
            name: "GitHub",
            icon: "fa6-brands:github",
            url: "https://github.com/kulius",
        },
    ],
};


// 公告配置
export const announcementConfig: AnnouncementConfig = {
    // 公告標題
    title: "公告",
    // 公告內容
    content: "歡迎來到我的技術部落格！分享 Odoo 開發與 AI 整合實戰經驗",
    // 允許使用者關閉公告
    closable: true,
    // 連結配置
    link: {
        // 啟用連結
        enable: false,
        // 連結文字
        text: "了解更多",
        // 連結 URL
        url: "/about/",
        // 是否外部連結
        external: false, // 內部連結
    },
};

/**
 *
 */

// 文章配置
export const postConfig: PostConfig = {
    // 顯示「上次編輯」卡片
    showLastModified: true,
    // 在文章內容中顯示封面
    showCoverInContent: false,
    // 程式碼高亮配置
    expressiveCode: {
        // 主題
        theme: "github-dark", // 深色背景
    },
    // 授權配置
    license: {
        // 啟用授權
        enable: false,
        // 授權名稱
        name: "CC BY-NC-SA 4.0",
        // 授權連結
        url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    },
    // 評論配置
    comment: {
        // 啟用評論功能
        enable: false,
        // Twikoo 評論系統配置
        twikoo: {
            // 環境 ID
            envId: "https://twikoo.vercel.app",
            // 語言
            lang: SITE_LANG, // 預設使用網站語言
        },
    },
};

/**
 *
 */

// 頁尾配置
export const footerConfig: FooterConfig = {
    // 啟用 Footer HTML 注入功能
    enable: false,
    // 自訂 HTML 內容，用於添加備案號等資訊
    customHtml: "",
};

/**
 *
 */

// 粒子特效配置
export const particleConfig: ParticleConfig = {
    // 啟用粒子特效
    enable: false,
    // 粒子數量
    particleNum: 12,
    // 粒子越界限制次數，-1為無限迴圈
    limitTimes: -1,
    // 粒子尺寸配置
    size: {
        // 粒子最小尺寸倍數
        min: 0.3,
        // 粒子最大尺寸倍數
        max: 0.9,
    },
    // 粒子透明度配置
    opacity: {
        // 粒子最小不透明度
        min: 0.3,
        // 粒子最大不透明度
        max: 0.9,
    },
    // 粒子移動速度配置
    speed: {
        // 水平移動速度
        horizontal: {
            // 最小值
            min: -0.9,
            // 最大值
            max: 0.9,
        },
        // 垂直移動速度
        vertical: {
            // 最小值
            min: 0.15,
            // 最大值
            max: 0.3,
        },
        // 旋轉速度
        rotation: 0.12,
        // 消失速度
        fadeSpeed: 0.12, // 不應大於最小不透明度
    },
    // 粒子層級
    zIndex: 100, // 確保粒子在合適的層級顯示
};


// 音樂播放器配置
export const musicPlayerConfig: MusicPlayerConfig = {
    // 啟用音樂播放器功能
    enable: false,
    // 預設模式 ("meting" API | "local" 本地)
    mode: "meting",
    // meting 模式專屬配置
    meting: {
        // Meting API 地址
        meting_api: "https://api.i-meto.com/meting/api",
        // 音樂平台
        server: "netease",
        // 類型 ("playlist" 歌單 | "song" 單曲)
        type: "playlist",
        // 資源 ID
        id: "2161912966",
    },
    // local 模式專屬配置
    local: {
        // 播放列表
        playlist: [
            {
                // 序號
                id: 1,
                // 標題
                title: "深海之息",
                // 作者
                artist: "Youzee Music",
                // 封面
                cover: "https://p1.music.126.net/PhKOqFtljgHDDpKYM2ADUA==/109951169858309716.jpg",
                // 路徑
                url: "assets/music/url/深海之息.m4a",
                // 時長
                duration: 146,
            },
        ],
    },
};


// 看板娘配置
export const pioConfig: import("./types/config").PioConfig = {
    // 啟用看板娘
    enable: false,
    // 模型檔案路徑
    models: ["/pio/models/pio/model.json"],
    // 看板娘位置
    position: "left",
    // 看板娘寬度
    width: 280,
    // 看板娘高度
    height: 250,
    // 展現模式
    mode: "draggable",
    // 是否在行動裝置上隱藏
    hiddenOnMobile: true,
    // 對話框配置
    dialog: {
        // 歡迎詞
        welcome: "Welcome!",
        // 觸摸提示
        touch: [
            "What are you doing?",
            "Stop touching me!",
            "Don't bully me like that!",
            "(｡í _ ì｡)",
        ],
        // 首頁提示
        home: "Click here to go back to homepage!",
        // 換裝提示
        skin: ["Want to see my new outfit?", "The new outfit looks great~"],
        // 關閉提示
        close: "See you next time~",
        // 關於連結
        link: "https://nav.kungal.org",
    },
};
