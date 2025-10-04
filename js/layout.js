// 動態注入共用導覽列/頁尾，避免每頁複製貼上
(function(){
  const cfg = window.CAMP_CONFIG;
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  const path   = location.pathname.replace(/\/+$/, "") || "/index.html";

  const navLinks = cfg.nav.map(item => {
    const active = (item.href === path) ? 'class="active"' : '';
    return `<li><a ${active} href="${item.href}">${item.text}</a></li>`;
  }).join("");

  header.innerHTML = `
    <nav class="nav">
      <div class="nav-inner container">
        <a class="brand" href="/index.html">${cfg.title}</a>
        <ul>${navLinks}</ul>
      </div>
    </nav>
  `;

  footer.innerHTML = `
    <div class="container foot">
      <div>© 2025 工科營｜地點：${cfg.locationText}｜聯絡：
        <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a></div>
      <div><a href="${cfg.facebookURL}" target="_blank" rel="noopener">Facebook</a></div>
    </div>
  `;
})();
