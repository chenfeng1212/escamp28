// =========================================================
// 共用頁首 / 頁尾：每一頁的 <header id="site-header"> 與
// <footer id="site-footer"> 都由這支程式自動填入。
// 要改導覽列項目請改 config.js 的 nav，不用改這裡。
// =========================================================
(function () {
  const cfg = window.CAMP_CONFIG;
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  const LOGO = "./assets/img/logo-512.webp";

  // 目前頁面檔名（網址結尾是 / 時視為 index.html）
  const current = location.pathname.split("/").pop() || "index.html";

  const navLinks = cfg.nav.map(item => {
    const file = item.href.split("/").pop();
    const here = file === current ? ' aria-current="page"' : "";
    return `<li><a href="${item.href}"${here}>${item.text}</a></li>`;
  }).join("");

  if (header) {
    header.outerHTML = `
      <a class="skip-link" href="#main">跳到主要內容</a>
      <header class="site-header">
        <div class="container bar">
          <a class="brand" href="./index.html" aria-label="${cfg.title} 首頁">
            <img src="${LOGO}" alt="" width="52" height="52">
            <span>
              <span class="t1">${cfg.title}</span>
              <span class="t2">NCKU Engineering Science Camp</span>
            </span>
          </a>
        </div>
        <div class="container"><div class="rule-double"></div></div>
      </header>
      <nav class="site-nav" aria-label="主選單">
        <div class="container"><ul>${navLinks}</ul></div>
      </nav>`;
  }

  // 手機版導覽列可以左右滑：自動捲到目前頁面，並在右邊還有項目時顯示漸層提示
  const navUl = document.querySelector(".site-nav ul");
  if (navUl) {
    const active = navUl.querySelector('[aria-current="page"]');
    if (active) navUl.scrollLeft = active.parentElement.offsetLeft - 16;
    const hint = () => navUl.classList.toggle(
      "more-right", navUl.scrollLeft + navUl.clientWidth < navUl.scrollWidth - 4);
    navUl.addEventListener("scroll", hint, { passive: true });
    window.addEventListener("resize", hint);
    hint();
  }

  if (footer) {
    const year = new Date(cfg.campStartISO).getFullYear();
    footer.outerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="rule-double"></div>
          <div class="inner">
            <div class="f-brand">
              <img src="${LOGO}" alt="" width="64" height="64" loading="lazy">
              <div>
                <p class="f-title">${cfg.title}</p>
                <p>電機 × 資訊 × 機械，五天四夜的跨域整合營隊。</p>
              </div>
            </div>
            <div>
              <h4>聯絡</h4>
              <ul>
                <li><a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a></li>
                <li><a href="${cfg.facebookURL}" target="_blank" rel="noopener">Facebook 粉絲專頁</a></li>
                <li>${cfg.locationText}</li>
              </ul>
            </div>
            <div>
              <h4>頁面</h4>
              <ul>${cfg.nav.map(i => `<li><a href="${i.href}">${i.text}</a></li>`).join("")}</ul>
            </div>
          </div>
          <div class="copy">© ${year} ${cfg.title}｜成大工程科學系</div>
        </div>
      </footer>`;
  }
})();
