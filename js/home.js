// =========================================================
// 首頁：狀態格會依 config.js 的時間自動切換
//   報名截止前 → 「報名中」＋ 截止倒數
//   截止後、開營前 → 「倒數開營」
//   營期中 → 「營隊進行中」
//   結束後 → 「圓滿落幕」
// =========================================================
(function () {
  const cfg = window.CAMP_CONFIG;
  const $state = document.getElementById("campState");
  if (!$state) return;

  const reg   = new Date(cfg.regDeadlineISO);
  const start = new Date(cfg.campStartISO);
  const end   = new Date(cfg.campEndISO);
  const pad = n => String(n).padStart(2, "0");

  function countdown(target) {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600);  s -= h * 3600;
    const m = Math.floor(s / 60);    s -= m * 60;
    return `${d}<small>天 ${pad(h)}:${pad(m)}:${pad(s)}</small>`;
  }

  let timer = null;
  function render() {
    const now = Date.now();
    let html;
    if (now < reg)        html = `報名中<small>截止倒數 ${countdown(reg).replace(/<\/?small>/g, " ")}</small>`;
    else if (now < start) html = `${countdown(start)}<small>距離開營</small>`;
    else if (now < end)   html = `營隊進行中<small>大家加油！</small>`;
    else { html = `圓滿落幕<small>謝謝每一位參與的你</small>`; clearInterval(timer); }
    $state.innerHTML = html;
  }
  render();
  if (Date.now() < end) timer = setInterval(render, 1000);

  // ---- 下一屆倒數（本屆結束後才顯示） ----
  const next = cfg.nextCamp;
  const $box = document.getElementById("nextCamp");
  if (next && next.startISO && $box && Date.now() >= end) {
    const nextStart = new Date(next.startISO);
    const d = nextStart;
    document.getElementById("nextName").textContent = next.name;
    document.getElementById("nextDate").textContent =
      `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
    const $count = document.getElementById("nextCount");
    const tickNext = () => {
      if (Date.now() >= nextStart) { $count.textContent = "營隊開始囉！"; return; }
      $count.innerHTML = countdown(nextStart).replace("<small>天 ", "<small>天</small> ").replace(/<\/small>$/, "") ;
    };
    tickNext();
    setInterval(tickNext, 1000);
    $box.hidden = false;
  }
})();
