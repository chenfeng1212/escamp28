// 動態注入共用導覽列/頁尾
(function () {
  const cfg    = window.CAMP_CONFIG;
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");

  // 取得目前頁面檔名（預設 index.html）
  const currentPath = (() => {
    const p = location.pathname.replace(/\/+$/, "");
    const last = p.split("/").pop();
    return last || "index.html";
  })();

  // 導覽連結
  const navLinks = cfg.nav.map(item => {
    const isActive = (item.href.endsWith(currentPath));
    const active   = isActive ? 'class="active"' : '';
    return `<li><a ${active} href="${item.href}"><span>${item.text}</span></a></li>`;
  }).join("");

  header.innerHTML = `
    <nav class="nav">
      <div class="container">
        <!-- 第一列：品牌（不可點） -->
        <div class="brand-row">
          <div class="brand" id="siteBrand" role="heading" aria-level="1">
            <img src="./assets/img/icon.PNG" alt="ESC28 Logo" />
            <span>${cfg.title}</span>
          </div>
        </div>
        <!-- 第二列：導覽 -->
        <div class="menu-row">
          <ul class="menu">
            ${navLinks}
          </ul>
        </div>
      </div>
    </nav>
  `;

  footer.innerHTML = `
    <div class="container foot">
      <div>© 工程科學營28th｜地點：${cfg.locationText}｜聯絡：
        <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a></div>
      <div><a href="${cfg.facebookURL}" target="_blank" rel="noopener">Facebook</a></div>
    </div>
  `;
})();
