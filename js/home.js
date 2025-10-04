// 首頁：雙倒數 + FAQ 展開 + 表單/FB/聯絡資訊注入
(function(){
  const cfg = window.CAMP_CONFIG;

  // 基本資訊
  document.getElementById("siteTitle").textContent = cfg.title;
  document.getElementById("fbLink").href = cfg.facebookURL;
  document.getElementById("applyForm").src = cfg.applyFormEmbedURL;
  document.getElementById("contactInfo").textContent =
    `Email：${cfg.contactEmail}｜地點：${cfg.locationText}`;

  // 倒數
  const $camp = document.getElementById("countCamp");
  const $dl   = document.getElementById("countDeadline");
  const campStart = new Date(cfg.campStartISO);
  const deadline  = new Date(cfg.applyDeadlineISO);
  const pad = n => String(n).padStart(2,"0");
  function fmt(target){
    const now = new Date();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff/86400000); diff -= d*86400000;
    const h = Math.floor(diff/3600000);  diff -= h*3600000;
    const m = Math.floor(diff/60000);    diff -= m*60000;
    const s = Math.floor(diff/1000);
    return `${d}天 ${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  function tick(){ $camp.textContent = fmt(campStart); $dl.textContent = fmt(deadline); }
  tick(); setInterval(tick, 1000);

  // FAQ 展開（針對首頁上你手動寫的 .faq-item）
  document.querySelectorAll("#faqList .faq-item").forEach(div=>{
    const q = div.querySelector(".faq-q");
    const a = div.querySelector(".faq-a");
    const icon = q.querySelector("span");
    q.addEventListener("click", ()=>{
      const open = a.style.display === "block";
      a.style.display = open ? "none" : "block";
      icon.textContent = open ? "＋" : "－";
    });
  });
})();
