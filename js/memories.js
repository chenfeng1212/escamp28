// 回憶牆：音樂 + 單張輪播(淡入淡出) + 可視化（副歌特效）
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    /* ---------------- 音樂控制 ---------------- */
    const bgm = document.getElementById("bgm");
    const btn = document.getElementById("musicBtn");
    let playing = false;

    if (bgm && btn) {
      bgm.loop = true;
      bgm.volume = 0.85;

      const syncBtn = () => (btn.textContent = playing ? "⏸ 暫停音樂" : "🎵 播放音樂");

      // 嘗試自動播放；失敗就等第一次點擊
      const tryAutoPlay = () => {
        bgm.play().then(() => {
          playing = true; syncBtn(); startViz(); // ✅ 成功時同時啟動可視化
        }).catch(() => {
          const resume = () => {
            bgm.play().then(() => { playing = true; syncBtn(); startViz(); });
            document.removeEventListener("click", resume);
          };
          document.addEventListener("click", resume, { once: true });
        });
      };
      tryAutoPlay();

      btn.addEventListener("click", async () => {
        if (!playing) { await bgm.play(); playing = true; startViz(); }
        else { bgm.pause(); playing = false; stopViz(); }
        syncBtn();
      });
    }

    /* ---------------- 單張輪播（淡入淡出） ---------------- */
    const slides = document.querySelectorAll("#slideshow img");
    const prevBtn = document.querySelector(".slideshow .prev");
    const nextBtn = document.querySelector(".slideshow .next");
    let index = 0, timer;

    if (slides.length) {
      // 初始化：只有第一張啟用
      slides.forEach((img, i) => img.classList.toggle("active", i === 0));

      const show = (newIndex) => {
        const nextIdx = (newIndex + slides.length) % slides.length;
        if (nextIdx === index) return;
        slides[index].classList.remove("active"); // 透過 CSS 做淡出
        slides[nextIdx].classList.add("active");  // 透過 CSS 做淡入
        index = nextIdx;
      };
      const next = () => show(index + 1);
      const prev = () => show(index - 1);

      // 手動控制
      nextBtn?.addEventListener("click", () => { next(); restartTimer(); });
      prevBtn?.addEventListener("click", () => { prev(); restartTimer(); });

      // 自動播放間隔：7.26 秒
      const INTERVAL = 7260;
      const restartTimer = () => { clearInterval(timer); timer = setInterval(next, INTERVAL); };
      restartTimer();
    }

    /* ---------------- 可視化（等級2）＋ 副歌特效 ---------------- */
    const canvas = document.getElementById("musicCanvas");
    if (!canvas || !bgm) return;
    const ctx = canvas.getContext("2d");

    // === 1) 版面設定 ===
    let W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      W = canvas.clientWidth = window.innerWidth;
      H = canvas.clientHeight = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // === 2) Web Audio ===
    let audioCtx, analyser, dataArray, sourceNode, rafId = null;

    // === 3) 粒子系統（一般 & 副歌模式） ===
    const BASE_COUNT = 60;
    const CHORUS_COUNT = 120;     // 副歌時粒子數
    const parts = [];
    const rand = (a, b) => a + Math.random() * (b - a);

    function makeParticle(isChorus = false) {
      const hueBase = isChorus ? rand(20, 60) : rand(200, 320); // 副歌轉金橘；平常藍紫
      return {
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
        r: rand(8, 20), hue: hueBase, a: isChorus ? 0.35 : 0.25
      };
    }
    function rebuildParticles(targetCount, isChorus) {
      parts.length = 0;
      for (let i = 0; i < targetCount; i++) parts.push(makeParticle(isChorus));
    }
    rebuildParticles(BASE_COUNT, false);

    // === 4) 模式切換 ===
    let mode = "calm"; // calm | chorus
    let chorusUntil = 0;  // 保持副歌狀態的時間戳（ms）
    const CHORUS_HOLD_MS = 10000; // 副歌保持 10 秒（自動偵測用）

    function setMode(next) {
      if (mode === next) return;
      mode = next;
      if (mode === "chorus") {
        rebuildParticles(CHORUS_COUNT, true);
        canvas.style.opacity = "1";
      } else {
        rebuildParticles(BASE_COUNT, false);
        canvas.style.opacity = "0.85";
      }
    }

    // === 5) 劇烈度（音量）計算 ===
    function avgVolume() {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      return sum / dataArray.length / 255; // 0..1
    }

    // === 6) 繪圖 ===
    function draw() {
      // 拖尾底色
      ctx.fillStyle = mode === "chorus" ? "rgba(255,245,235,0.16)" : "rgba(248,251,255,0.2)";
      ctx.fillRect(0, 0, W, H);

      const level = analyser ? avgVolume() : 0;
      const boost = (mode === "chorus" ? 0.9 : 0.6) + level * (mode === "chorus" ? 2.2 : 1.6);
      const glow  = (mode === "chorus" ? 0.35 : 0.2) + level * (mode === "chorus" ? 0.8 : 0.5);
      const speed = (mode === "chorus" ? 1.5 : 1.0);

      for (const p of parts) {
        // 漂浮＋副歌加速
        p.x += p.vx * speed; p.y += p.vy * speed;
        if (p.x < -60) p.x = W + 60;
        if (p.x > W + 60) p.x = -60;
        if (p.y < -60) p.y = H + 60;
        if (p.y > H + 60) p.y = -60;

        const r = p.r * boost;

        // 外圈光暈
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.4);
        grad.addColorStop(0, `hsla(${p.hue},100%,70%,${glow})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.4, 0, Math.PI * 2); ctx.fill();

        // 核心
        ctx.fillStyle = `hsla(${p.hue},100%,85%,${Math.min(0.95, (p.a + level * (mode === "chorus" ? 0.8 : 0.6)))})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }

      // 自動偵測：在高能量時進入副歌、能量掉下來一段時間後回到 calm
      if (!CHORUS_MARKS.length) {
        const now = performance.now();
        const threshold = 0.48; // 能量門檻，可依歌曲調
        if (level > threshold) chorusUntil = now + CHORUS_HOLD_MS;
        setMode(now < chorusUntil ? "chorus" : "calm");
      }

      rafId = requestAnimationFrame(draw);
    }

    // === 7) 啟動/停止 ===
    function startViz() {
      // 初始化 Web Audio
      if (!audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          sourceNode = audioCtx.createMediaElementSource(bgm);
          sourceNode.connect(analyser);
          analyser.connect(audioCtx.destination);
        } catch (e) { console.warn("AudioContext 建立失敗：", e); }
      } else if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      if (!rafId) rafId = requestAnimationFrame(draw);
      canvas.style.opacity = "0.85";
    }
    function stopViz() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      canvas.style.opacity = "0";
      setMode("calm");
    }

    // === 8) 副歌時間點（手動標記：秒數陣列；空陣列=自動偵測）===
    // 例：副歌在 43s、103s、163s 開始 → [43,103,163]
    const CHORUS_MARKS = [58.5, 142.5, 206.5]; // ← 想要精準切換就填秒數；留空則用自動偵測

    // 若有手動標記：用 timeupdate 監看並觸發模式切換
    if (CHORUS_MARKS.length) {
      const WINDOW = 0.35;       // 誤差容忍（秒）
      const HOLD   = 32 * 1000;  // 副歌持續 32 秒（可調）
      bgm.addEventListener("timeupdate", () => {
        const t = bgm.currentTime;
        const hit = CHORUS_MARKS.some(sec => Math.abs(t - sec) < WINDOW);
        if (hit) chorusUntil = performance.now() + HOLD;
        setMode(performance.now() < chorusUntil ? "chorus" : "calm");
      });
    }

    // 同步播放狀態
    bgm.addEventListener("play", startViz);
    bgm.addEventListener("pause", stopViz);
    bgm.addEventListener("ended", stopViz);
  });
})();
