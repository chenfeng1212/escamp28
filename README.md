# 第28屆 成大工程科學營（ESC28）官網

這是第 28 屆工科營的網站。
網站只用 HTML、CSS、JavaScript 寫成，**不需要安裝任何東西**，用瀏覽器打開 `index.html` 就能看。

---

## 檔案結構

```
escamp28/
├── index.html          首頁（主視覺、狀態格、招生資訊、Q&A）
├── about.html          關於我們（工科系介紹、工科松、教授課）
├── staff.html          幹部介紹（9 個章節，每章一段故事＋照片）
├── admissions.html     錄取名單（分頁＋搜尋）與行前通知
├── memories.html       回憶牆（照片輪播＋營歌同步）
│
├── css/
│   └── common.css      全站唯一的樣式檔，最上面是顏色、字體等設計變數
│
├── js/
│   ├── config.js       ★ 全站設定：營隊名稱、日期、連結、導覽列
│   ├── layout.js       自動產生每一頁的頁首（logo＋導覽列）和頁尾
│   ├── home.js         首頁狀態格（報名中／倒數／進行中／圓滿落幕／下一屆倒數）
│   ├── admissions.js   名單頁的分頁切換和搜尋
│   └── memories.js     回憶牆的輪播、縮圖、放大、音樂同步、粒子特效
│
└── assets/
    ├── img/            所有圖片（見下方「圖片命名」）
    └── audio/          營歌
```

---

## 換屆時要改的地方（照順序）

### 1. `js/config.js`：最先改這裡

```js
title: "第28屆工程科學營",                    // 頁首、頁尾都會用到
regDeadlineISO: "2025-12-14T23:59:59+08:00",  // 報名截止
campStartISO:   "2026-02-09T13:00:00+08:00",  // 開營
campEndISO:     "2026-02-13T17:00:00+08:00",  // 離營
nextCamp: { name: "第29屆", startISO: "2027-01-29T13:00:00+08:00" },
```

- 日期格式是 `年-月-日T時:分:秒+08:00`，**`+08:00` 一定要留著**（台灣時區）。
- 首頁的狀態格會**依照現在時間自動切換**，不用再手動改 HTML：
  - 報名截止前 → 「報名中」＋截止倒數
  - 截止後、開營前 → 倒數開營
  - 營期中 → 「營隊進行中」
  - 結束後 → 「圓滿落幕」，並顯示 `nextCamp` 的倒數（不想顯示就把 `nextCamp` 設成 `null`）
- `nav` 是導覽列。新增一個頁面時，在這裡加一行 `{ href: "./新頁面.html", text: "名稱" }`，所有頁面的選單都會一起更新。

### 2. Logo 與主視覺

把新的 logo 和海報存成下列檔名，蓋掉舊的就好：

| 檔案 | 用途 | 建議尺寸 |
|---|---|---|
| `assets/img/logo-512.webp` | 頁首、頁尾的 logo | 512×512 |
| `assets/img/favicon-64.png` | 瀏覽器分頁的小圖示 | 64×64 |
| `assets/img/apple-touch-icon.png` | 手機加到主畫面的圖示 | 180×180 |
| `assets/img/poster-1000.webp` | 首頁左邊的海報 | 寬約 1000px，直式 |

### 3. 顏色

打開 `css/common.css`，最上面的「1. 設計變數」：

```css
--paper:  #FFF9DC;  /* 紙底 */
--ink:    #49310B;  /* 主色：文字、框線、深色字條 */
--yellow: #F7D047;  /* 品牌色：按鈕、強調 */
```

只要改這幾個色碼，全站都會跟著換。建議直接從新一屆的 logo 取色。

### 4. 錄取名單（`admissions.html`）

名字寫成一行一個 `<li>`：

```html
<ul class="name-list">
  <li>王小明</li>
  <li>陳小華</li>
</ul>
```

- **人數會自動計算**，新增或刪除名字都不用改任何數字。
- 搜尋功能自動支援所有名單。
- 如果只有一份名單，把其他的 `<div class="names-panel">` 和對應的 `<button class="tab">` 一起刪掉即可。

### 5. 幹部介紹（`staff.html`）

每位幹部是一個 `<article class="comic chapter">`，裡面有標題、照片、故事段落。
新增幹部時要改兩個地方：

1. 上方目錄 `<nav class="chapter-index">` 加一個 `<li>`
2. 下方複製一整個 `<article>`，把 `id="ch10"`、`CH.10`、照片、文字換掉

**目錄的 `href="#ch10"` 要和文章的 `id="ch10"` 一樣**，點了才會跳過去。

### 6. 回憶牆（`memories.html` + `js/memories.js`）

每張照片要準備兩個檔案：

| 檔案 | 用途 | 建議尺寸 |
|---|---|---|
| `photo-p14.webp` | 大圖 | 長邊 1800px |
| `thumb-p14.webp` | 下方縮圖 | 長邊 320px |

然後在 `memories.html` 的 `#slideshow` 和 `.filmstrip` 各加一行（照著現有的格式複製即可），
`data-index` 從 0 開始算。

營歌和照片切換的時間點在 `js/memories.js` 最上面的 `SETTINGS`：

- `songLength`：歌曲長度（秒）
- `photoTimes`：每張照片出現的秒數
- `chorus`：副歌區段，這段時間背景粒子會變多

---

## 圖片命名與大小

網頁實際使用的圖片都是壓縮過的 `.webp`，載入比原始照片快很多：

| 前綴 | 用在 |
|---|---|
| `logo-*` / `favicon-*` / `apple-touch-icon` | logo 與圖示 |
| `poster-*` | 首頁海報 |
| `about-*` | 關於我們的活動照 |
| `staff-1` ～ `staff-9` | 幹部照片（數字對應章節） |
| `photo-p*` / `thumb-p*` | 回憶牆大圖 / 縮圖 |

`escamp28_*` 開頭的檔案和 `hero_banner.PNG`、`icon.PNG` 是**原始檔**，網頁已經不直接使用，留著當備份。
如果要縮小 repo 的大小，可以把它們移到別的地方保存。

### 怎麼把照片轉成 webp

最簡單：用 [Squoosh](https://squoosh.app/)（免安裝，網頁版），選 WebP、品質 80、長邊縮到 1800px。

---

## 字體

字體從 Google Fonts 載入，寫在每一頁 `<head>` 裡：

- **Noto Serif TC**：標題（呼應海報上的襯線字）
- **Noto Sans TC**：內文
- **霞鶩文楷 TC（LXGW WenKai TC）**：故事、對白、Q&A 答案

> 霞鶩文楷採用傳統字形，像「為」會顯示成「爲」，這是字型設計，不是錯字。

---

## 小提醒

- 每一頁都要有 `<header id="site-header"></header>` 和 `<footer id="site-footer"></footer>`，
  並在最下面載入 `config.js` 和 `layout.js`，頁首頁尾才會出現。
- 新增頁面時，可以直接複製 `about.html` 改內容，樣式會自動套用。
- 改完記得用**手機尺寸**看一次（瀏覽器按 F12 → 切換裝置工具列）。
