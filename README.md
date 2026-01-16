# 🏰 Strategy Command Center (股票策略指揮中心)

這是一個以復古 RPG 風格設計的「股票策略管理儀表板」，幫助你追蹤、擬定並管理你的投資策略。

## 🌟 功能特色
- **RPG 像素風格介面**：沈浸式的投資體驗。
- **策略擬定精靈**：透過對話式引導，設定停損、停利及風險屬性。
- **看板管理**：一目瞭然的持倉狀態、風險等級與操作建議。
- **Google Sheets 後端**：資料完全掌控在自己的 Google 試算表中，免費且隱私。

---

## 🛠️ 專案設置指南 (Setup Guide)

要讓此專案運作，你需要建立一個 Google Sheet 作為資料庫，並部署 Google Apps Script 作為 API。

### 步驟 1: 建立 Google Sheet 與 貼上程式碼

1. 前往 [Google Sheets](https://sheets.google.com) 並建立一個 **新的空白試算表**。(試算表標題可隨意，例如 `MyStockData`)
2. 點擊上方選單的 **擴充功能 (Extensions)** > **Apps Script**。
3. 這會開啟一個新的程式碼編輯器視窗。
4. 將原本的 `myFunction` 清空，並將本專案中 `google-apps-script/Code.gs` 的完整程式碼複製貼上。
5. 按下 **儲存 (磁碟片圖示)**，專案名稱可隨意取 (例如 `TradeAPI`)。

### 步驟 2: 初始化資料庫 (Initial Setup)

不需要手動建立欄位，讓程式碼幫你做！

1. 在 Apps Script 編輯器上方的下拉選單中 (原本顯示 `doGet`)，選擇 **`initialSetup`** 函式。
2. 點擊 **執行 (Run)**。
3. 第一次執行時，Google 會要求授權：
    - 點擊 **Review permissions (核對權限)**。
    - 選擇你的 Google 帳號。
    - 點擊左下角的 **Advanced (進階)** > **Go to ... (前往...) (unsafe)**。
    - 點擊 **Allow (允許)**。
4. 執行完畢後，回到你的 Google Sheet，你會發現下方多了一個名為 `2026` 的工作表，並且欄位標題都已經自動建立好了！

### 步驟 3: 部署為 Web App (API)

這是最關鍵的一步，讓前端可以存取你的試算表。

1. 在 Apps Script 編輯器右上角，點擊 **部署 (Deploy)** > **新增部署 (New deployment)**。
2. 點擊左側的 **齒輪圖示** > 選擇 **網頁應用程式 (Web app)**。
3. 設定如下：
    - **說明 (Description)**: (隨意，例如 v1)
    - **執行身份 (Execute as)**: **我 (Me)**  <-- 重要！
    - **誰可以存取 (Who has access)**: **任何人 (Anyone)** <-- 非常重要！這允許你的前端網頁存取資料，而不需要登入 Google。
4. 點擊 **部署 (Deploy)**。
5. 部署成功後，你會看到一個 **網頁應用程式網址 (Web App URL)** (以 `https://script.google.com/macros/s/.../exec` 開頭)。
6. **複製這個網址**。

### 步驟 4: 前端連線設定

1. 回到本專案的前端程式碼。
2. 開啟 `src/services/googleSheet.js`。
3. 找到 `const GOOGLE_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL';`。
4. 將 `'YOUR_DEPLOYED_WEB_APP_URL'` 替換為你剛剛複製的 Google Apps Script 網址。

```javascript
// 範例
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx...你的ID.../exec';
```

---

## 🚀 部署到 GitHub Pages

本專案已設定好 `gh-pages` 自動部署腳本。

### 1. 修改設定檔
打開 `vite.config.js`，找到 `base` 設定，確保它與你的儲存庫名稱一致：
```javascript
export default defineConfig({
    // ...
    // 例如你的 Repo 網址是 https://github.com/user/my-repo
    // 這裡就改成 '/my-repo/'
    base: '/trade-command-center/', 
})
```

### 2. 執行部署指令
在終端機執行以下指令，這將會自動打包並推送到 `gh-pages` 分支：

```bash
npm run deploy
```

### 3. 設定 GitHub Repository
1. 進入你的 GitHub Repo 頁面。
2. 點擊 **Settings** > **Pages**。
3. 在 **Build and deployment** > **Source** 選擇 **Deploy from a branch**。
4. 在 **Branch** 下拉選單選擇 **`gh-pages`**，資料夾選擇 **`/(root)`**。
5. 點擊 **Save**。
6. 幾分鐘後，重新整理頁面，你就會看到網址了！

---

## 🚀 啟動專案 (Development)

1. 安裝依賴：
   ```bash
   npm install
   ```

2. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

3. 開啟瀏覽器訪問顯示的 Local URL (通常是 `http://localhost:5173`)。

---

## ⚠️ 常見問題Troubleshooting

- **CORS 錯誤 / Network Error**：
    - 檢查 `googleSheet.js` 中的 URL 是否正確。
    - 確認 Apps Script 部署時，權限是否設為 **Anyone (任何人)**。
    - 如果修改了 `Code.gs`，記得要 **管理部署 (Manage deployments)** > **編輯 (Edit)** > **建立新版本 (New version)** > **部署**，才會更新生效。
- **資料沒更新**：
    - 這是因為 Apps Script 有快取或部署版本問題，確保每次修改後端程式碼都有重新發布新版本。
- **如何增加新欄位**：
    - 若要手動增加欄位，請在 Front-end 和 Back-end 都要對應修改。`initialSetup` 只會建立預設的欄位。

---

Happy Trading! 🏰
