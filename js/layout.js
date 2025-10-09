// 動態注入共用導覽列/頁尾
(function () {
  const cfg = window.CAMP_CONFIG;
  const header = document.getElementById("site-header");
  const footer  = document.getElementById("site-footer");
  const path    = location.pathname.replace(/\/+$/, "") || "./index.html";

  const navLinks = cfg.nav.map(item => {
    const active = (item.href === path) ? 'class="active"' : '';
    return `<li><a ${active} href="${item.href}">${item.text}</a></li>`;
  }).join("");

  header.innerHTML = `
    <nav class="nav">
      <div class="container">
        <!-- 第一列：品牌（不可點） -->
        <div class="brand-row">
          <div class="brand" id="siteBrand" role="heading" aria-level="1">
            ${cfg.title}
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
