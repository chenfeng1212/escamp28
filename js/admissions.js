// =========================================================
// 名單頁：分頁切換 + 搜尋
// 名單本身寫在 admissions.html 的 <li> 裡，人數由這裡自動計算，
// 新增 / 刪除名字時不用改任何數字。
// =========================================================
(function () {
  const tablist = document.querySelector(".tabs");
  const tabs = [...document.querySelectorAll(".tabs .tab")];
  const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
  const input = document.getElementById("nameSearch");
  const result = document.getElementById("searchResult");
  if (!tablist || !tabs.length) return;

  // 每個名單記住原始名字，搜尋時才能還原
  const lists = panels.map(p => [...p.querySelectorAll(".name-list li")].map(li => ({ li, name: li.textContent.trim() })));

  // 依實際 <li> 數更新人數
  panels.forEach((p, i) => {
    const n = lists[i].length;
    tabs[i].querySelector(".count").textContent = n;
    const small = p.querySelector(".names-title small");
    if (small) small.textContent = `${n} 人`;
  });

  // ---- 分頁 ----
  tablist.hidden = false;
  function select(i, focus) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", e => {
      const k = e.key;
      if (k !== "ArrowRight" && k !== "ArrowLeft") return;
      e.preventDefault();
      select((i + (k === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length, true);
    });
  });
  select(0);

  // ---- 搜尋 ----
  const escape = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function search() {
    const q = input.value.trim();
    const hits = lists.map(items => {
      let n = 0;
      items.forEach(({ li, name }) => {
        const match = !q || name.includes(q);
        li.hidden = !match;
        li.innerHTML = q && match ? escape(name).replace(escape(q), `<mark>${escape(q)}</mark>`) : escape(name);
        if (match) n++;
      });
      return n;
    });

    tabs.forEach((t, i) => {
      const c = t.querySelector(".count");
      c.textContent = q ? `${hits[i]}/${lists[i].length}` : lists[i].length;
      t.classList.toggle("is-empty", !!q && hits[i] === 0);
    });

    if (!q) { result.textContent = ""; return; }
    const found = tabs.map((t, i) => hits[i] ? `${t.dataset.label} ${hits[i]} 筆` : null).filter(Boolean);
    if (!found.length) {
      result.innerHTML = `找不到「${escape(q)}」，請確認字有沒有打錯。`;
      return;
    }
    result.innerHTML = `「${escape(q)}」出現在：${found.join("、")}`;
    const cur = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
    if (!hits[cur]) select(hits.findIndex(n => n > 0));
  }
  input.addEventListener("input", search);
})();
