// 首頁：雙倒數 + FAQ 展開 + 表單/FB/聯絡資訊注入
(function () {
  const cfg = window.CAMP_CONFIG;

  // --- 基本資訊 ---
  const siteTitle = document.getElementById("siteTitle");
  const fbLink = document.getElementById("fbLink");
  const applyForm = document.getElementById("applyForm");
  const contactInfo = document.getElementById("contactInfo");

  if (siteTitle) siteTitle.textContent = cfg.title;
  if (fbLink) fbLink.href = cfg.facebookURL;
  if (applyForm) applyForm.src = cfg.applyFormEmbedURL;
  if (contactInfo)
    contactInfo.textContent = `Email：${cfg.contactEmail}｜地點：${cfg.locationText}`;

  // --- 雙倒數 ---
  const $camp = document.getElementById("countCamp");
  const $dl = document.getElementById("countDeadline");
  if ($camp && $dl) {
    const campStart = new Date(cfg.campStartISO);
    const deadline = new Date(cfg.applyDeadlineISO);
    const pad = (n) => String(n).padStart(2, "0");
    function fmt(target) {
      const now = new Date();
      let diff = Math.max(0, target - now);
      const d = Math.floor(diff / 86400000);
      diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);
      diff -= h * 3600000;
      const m = Math.floor(diff / 60000);
      diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      return `${d}天 ${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    function tick() {
      $camp.textContent = fmt(campStart);
      $dl.textContent = fmt(deadline);
    }
    tick();
    setInterval(tick, 1000);
  }

  // --- FAQ 展開 ---
  function initFAQ() {
    const faqRoot = document.getElementById("faqList");
    if (!faqRoot) return; // 其他頁面沒有 FAQ 就直接略過

    faqRoot.querySelectorAll(".faq-item").forEach((div) => {
      const q = div.querySelector(".faq-q");
      const a = div.querySelector(".faq-a");
      const icon = q?.querySelector(".icon, span");
      if (!q || !a) return;
      a.style.display = "none";

      q.addEventListener("click", () => {
        const open = a.style.display === "block";
        a.style.display = open ? "none" : "block";
        if (icon) icon.textContent = open ? "＋" : "－";
      });
    });

    console.log("FAQ 展開初始化完成");
  }

  // 若 DOM 已載入就直接執行，否則等待
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFAQ);
  } else {
    initFAQ();
  }
})();
