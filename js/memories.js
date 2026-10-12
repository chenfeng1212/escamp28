// =========================================================
// 回憶牆：照片輪播 + 縮圖列 + 燈箱 + 營歌同步 + 副歌粒子特效
// =========================================================
(function () {
  const SETTINGS = {
    songLength: 245, // 歌曲長度（秒）

    // 每張照片在歌曲中出現的秒數。照片比節點少時會從頭循環。
    photoTimes: [
      0, 7.26, 14.52, 21.78, 29.04, 36.3, 43.56, 50.82, 58.08, 64.48, 70.88,
      77.28, 83.68, 90.08, 96.58, 103.08, 109.58, 116.08, 122.58, 129.08,
      135.58, 142.28, 148.48, 154.88, 161.28, 167.68, 174.08, 178.08, 182.08,
      186.08, 190.08, 194.08, 198.08, 202.08, 206.08, 212.48, 218.88,
      225.28, 231.68, 238.08
    ],

    // 副歌區段（秒）：這段時間粒子會變多、變亮
    chorus: [
      { start: 58.5,  duration: 32 },
      { start: 142.5, duration: 32 },
      { start: 206.5, duration: 32 }
    ]
  };

  document.addEventListener("DOMContentLoaded", () => {
    const stage   = document.getElementById("slideshow");
    if (!stage) return;
    const slides  = [...stage.querySelectorAll("img")];
    const thumbs  = [...document.querySelectorAll(".filmstrip .thumb")];
    const $no     = document.getElementById("slideNo");
    const $total  = document.getElementById("slideTotal");
    const pad2 = n => String(n).padStart(2, "0");
    let index = 0;

    $total.textContent = pad2(slides.length);

    /* ---------- 輪播 ---------- */
    function show(i) {
      const next = (i + slides.length) % slides.length;
      if (next === index) return;
      slides[index].classList.remove("active");
      thumbs[index]?.classList.remove("active");
      thumbs[index]?.removeAttribute("aria-current");

      index = next;
      const img = slides[index];
      img.loading = "eager";               // 確保要顯示的那張立即載入
      img.classList.add("active");
      thumbs[index]?.classList.add("active");
      thumbs[index]?.setAttribute("aria-current", "true");
      $no.textContent = pad2(index + 1);

      // 讓縮圖列捲到目前這張
      const t = thumbs[index];
      if (t) {
        const strip = t.closest(".filmstrip");
        strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
      }
      // 預先載入下一張
      const after = slides[(index + 1) % slides.length];
      if (after) after.loading = "eager";
    }

    stage.querySelector(".prev").addEventListener("click", () => show(index - 1));
    stage.querySelector(".next").addEventListener("click", () => show(index + 1));
    thumbs.forEach(t => t.addEventListener("click", () => show(+t.dataset.index)));

    document.addEventListener("keydown", e => {
      if (lightbox.open || e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "ArrowLeft")  show(index - 1);
    });

    // 手機左右滑動
    let touchX = null;
    stage.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });

    /* ---------- 燈箱 ---------- */
    const lightbox = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg");
    slides.forEach(img => img.addEventListener("click", () => {
      if (!lightbox.showModal) return;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lightbox.showModal();
    }));
    document.getElementById("lightboxClose").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", e => { if (e.target === lightbox) lightbox.close(); });

    /* ---------- 音樂 ---------- */
    const bgm = document.getElementById("bgm");
    const btn = document.getElementById("musicBtn");
    const label = btn.querySelector(".music-label");
    const msg = document.getElementById("musicMsg");
    let syncTimer = null;

    bgm.loop = true;
    bgm.volume = 0.85;

    function setPlaying(on) {
      btn.setAttribute("aria-pressed", on);
      btn.classList.toggle("is-playing", on);
      label.textContent = on ? "暫停音樂" : "播放音樂";
    }

    btn.addEventListener("click", async () => {
      msg.textContent = "";
      if (bgm.paused) {
        try {
          btn.disabled = true;
          await bgm.play();
        } catch (err) {
          msg.textContent = "音樂播放失敗，請確認瀏覽器允許這個網站播放聲音。";
        } finally {
          btn.disabled = false;
        }
      } else {
        bgm.pause();
      }
    });

    bgm.addEventListener("play",  () => { setPlaying(true);  startSync(); startViz(); });
    bgm.addEventListener("pause", () => { setPlaying(false); stopSync();  stopViz(); });

    // 依歌曲時間切換照片
    function startSync() {
      stopSync();
      syncTimer = setInterval(() => {
        const t = bgm.currentTime % (bgm.duration || SETTINGS.songLength);
        const times = SETTINGS.photoTimes;
        for (let i = times.length - 1; i >= 0; i--) {
          if (t >= times[i]) { show(i % slides.length); break; }
        }
      }, 200);
    }
    function stopSync() { clearInterval(syncTimer); syncTimer = null; }

    /* ---------- 粒子特效（品牌黃） ---------- */
    const canvas = document.getElementById("musicCanvas");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas && canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    if (ctx) { resize(); window.addEventListener("resize", resize); }

    let audioCtx, analyser, data, rafId = null, mode = "calm";
    const parts = [];
    const rand = (a, b) => a + Math.random() * (b - a);
    function build(count, chorus) {
      parts.length = 0;
      for (let i = 0; i < count; i++) {
        parts.push({
          x: rand(0, W), y: rand(0, H),
          vx: rand(-.25, .25), vy: rand(-.25, .25),
          r: rand(6, 16),
          hue: chorus ? rand(38, 50) : rand(42, 48),   // 黃 ~ 琥珀
          light: chorus ? rand(55, 65) : rand(60, 72)
        });
      }
    }
    build(50, false);

    function level() {
      if (!analyser) return 0;
      analyser.getByteFrequencyData(data);
      let s = 0; for (const v of data) s += v;
      return s / data.length / 255;
    }

    function draw() {
      ctx.fillStyle = "rgba(255, 249, 220, 0.22)";   // 紙底色，留下淡淡拖尾
      ctx.fillRect(0, 0, W, H);
      const lv = level();
      const chorus = mode === "chorus";
      const boost = (chorus ? .9 : .6) + lv * (chorus ? 2.2 : 1.6);
      const alpha = (chorus ? .45 : .28) + lv * .5;
      const speed = chorus ? 1.5 : 1;
      for (const p of parts) {
        p.x += p.vx * speed; p.y += p.vy * speed;
        if (p.x < -60) p.x = W + 60; if (p.x > W + 60) p.x = -60;
        if (p.y < -60) p.y = H + 60; if (p.y > H + 60) p.y = -60;
        const r = p.r * boost;
        ctx.fillStyle = `hsla(${p.hue}, 92%, ${p.light}%, ${Math.min(.9, alpha)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    }

    function startViz() {
      if (!ctx || reduceMotion) return;
      if (!audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          data = new Uint8Array(analyser.frequencyBinCount);
          const src = audioCtx.createMediaElementSource(bgm);
          src.connect(analyser);
          analyser.connect(audioCtx.destination);
        } catch (e) { console.warn("AudioContext 建立失敗：", e); }
      } else if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      canvas.classList.add("on");
      if (!rafId) rafId = requestAnimationFrame(draw);
    }
    function stopViz() {
      if (!ctx) return;
      cancelAnimationFrame(rafId); rafId = null;
      canvas.classList.remove("on");
      mode = "calm"; build(50, false);
    }

    bgm.addEventListener("timeupdate", () => {
      const t = bgm.currentTime;
      const next = SETTINGS.chorus.some(s => t >= s.start && t <= s.start + s.duration) ? "chorus" : "calm";
      if (next !== mode) { mode = next; build(next === "chorus" ? 110 : 50, next === "chorus"); }
    });
  });
})();
