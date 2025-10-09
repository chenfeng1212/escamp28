// 回憶牆：手動播放音樂 + 智能輪播(淡入淡出) + 手動控制副歌特效
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

      btn.addEventListener("click", async () => {
        try {
          if (!playing) {
            await bgm.play();
            playing = true;
            syncBtn();
            startViz();
            startTimelineSync();
          } else {
            bgm.pause();
            playing = false;
            syncBtn();
            stopViz();
            stopTimelineSync();
          }
        } catch (e) {
          alert("音樂播放失敗，請確認瀏覽器允許音訊。");
        }
      });
    }

    /* ---------------- 照片輪播（智能時間分配） ---------------- */
    const slides = document.querySelectorAll("#slideshow img");
    const prevBtn = document.querySelector(".slideshow .prev");
    const nextBtn = document.querySelector(".slideshow .next");
    let index = 0;
    let syncTimer = null;

    // 🎯 參數設定
    const songLength = 245; // 音樂長度（秒）👉 可改成實際值
    const photoCount = slides.length;
    const approxPerPhoto = 5.5; // 平均每張停留秒數（可調 5~6）
    const firstRoundTimes = [0, 7.26, 14.52, 21.78, 29.04, 36.30, 43.56, 50.82, 58.08, 64.48, 70.88, 77.28, 83.68, 90.08, 96.58, 103.08, 109.58, 116.08, 122.58, 129.08, 135.58, 142.28, 148.48, 154.88, 161.28, 167.68, 174.08, 178.08, 182.08, 186.08, 190.08, 194.08, 198.08, 202.08, 206.08, 212.48, 218.88, 225.28, 231.68, 238.08]; // 自行指定首輪的部分照片時間（可留空）

    // 🧠 自動補齊後面時間
    const PHOTO_TIMES = (() => {
      const times = [...firstRoundTimes];
      const firstEnd = times.length ? times[times.length - 1] : 0;
      const remainTime = songLength - firstEnd;
      const remainCount = Math.max(photoCount - times.length, 0);
      const avgInterval = remainTime / remainCount;
      for (let i = 1; i <= remainCount; i++) {
        times.push(firstEnd + avgInterval * i);
      }
      return times;
    })();

    // ✅ 多輪播放模式
    const LOOP_PHOTOS = true;

    slides.forEach((img, i) => img.classList.toggle("active", i === 0));

    function show(newIndex) {
      if (!slides.length) return;
      const nextIdx = (newIndex + slides.length) % slides.length;
      if (nextIdx === index) return;
      slides[index].classList.remove("active");
      slides[nextIdx].classList.add("active");
      index = nextIdx;
    }

    function next() { show(index + 1); }
    function prev() { show(index - 1); }

    prevBtn?.addEventListener("click", () => { prev(); });
    nextBtn?.addEventListener("click", () => { next(); });

    // 同步時間軸
    function startTimelineSync() {
      stopTimelineSync();
      syncTimer = setInterval(() => {
        const t = bgm.currentTime;
        const duration = bgm.duration || songLength;

        let timeInSong = t % duration;
        if (!LOOP_PHOTOS && t > duration) { stopTimelineSync(); return; }

        for (let i = PHOTO_TIMES.length - 1; i >= 0; i--) {
          if (timeInSong >= PHOTO_TIMES[i]) { show(i); break; }
        }
      }, 200);
    }

    function stopTimelineSync() {
      clearInterval(syncTimer);
      syncTimer = null;
    }

    /* ---------------- 可視化（粒子副歌特效） ---------------- */
    const canvas = document.getElementById("musicCanvas");
    if (!canvas || !bgm) return;
    const ctx = canvas.getContext("2d");

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

    let audioCtx, analyser, dataArray, sourceNode, rafId = null;

    const BASE_COUNT = 60;
    const CHORUS_COUNT = 120;
    const parts = [];
    const rand = (a, b) => a + Math.random() * (b - a);

    function makeParticle(isChorus = false) {
      const hueBase = isChorus ? rand(20, 60) : rand(200, 320);
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

    let mode = "calm";
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

    function avgVolume() {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      return sum / dataArray.length / 255;
    }

    function draw() {
      ctx.fillStyle = mode === "chorus"
        ? "rgba(255,245,235,0.16)"
        : "rgba(248,251,255,0.2)";
      ctx.fillRect(0, 0, W, H);

      const level = analyser ? avgVolume() : 0;
      const boost = (mode === "chorus" ? 0.9 : 0.6)
                  + level * (mode === "chorus" ? 2.2 : 1.6);
      const glow  = (mode === "chorus" ? 0.35 : 0.2)
                  + level * (mode === "chorus" ? 0.8 : 0.5);
      const speed = (mode === "chorus" ? 1.5 : 1.0);

      for (const p of parts) {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        if (p.x < -60) p.x = W + 60;
        if (p.x > W + 60) p.x = -60;
        if (p.y < -60) p.y = H + 60;
        if (p.y > H + 60) p.y = -60;

        const r = p.r * boost;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.4);
        grad.addColorStop(0, `hsla(${p.hue},100%,70%,${glow})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.4, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `hsla(${p.hue},100%,85%,${Math.min(
          0.95,
          p.a + level * (mode === "chorus" ? 0.8 : 0.6)
        )})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    function startViz() {
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

    /* ---------------- 手動副歌控制 ---------------- */
    const CHORUS_SEGMENTS = [
      { start: 58.5, duration: 32 },
      { start: 142.5, duration: 32 },
      { start: 206.5, duration: 32 },
    ];

    bgm.addEventListener("timeupdate", () => {
      const t = bgm.currentTime;
      const inChorus = CHORUS_SEGMENTS.some(
        seg => t >= seg.start && t <= seg.start + seg.duration
      );
      setMode(inChorus ? "chorus" : "calm");
    });

    bgm.addEventListener("pause", () => { stopViz(); stopTimelineSync(); });
    bgm.addEventListener("ended", () => { stopViz(); stopTimelineSync(); });
  });
})();
