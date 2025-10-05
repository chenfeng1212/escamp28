// 回憶牆：音樂 + 照片輪播（自動＋手動切換＋淡入淡出）
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // === 音樂 ===
    const bgm = document.getElementById("bgm");
    const btn = document.getElementById("musicBtn");
    if (bgm) {
      bgm.loop = true;
      bgm.volume = 0.8;
      let playing = false;

      const syncBtn = () => btn.textContent = playing ? "⏸ 暫停音樂" : "🎵 播放音樂";

      const tryAutoPlay = () => {
        bgm.play().then(() => {
          playing = true;
          syncBtn();
        }).catch(() => {
          const resume = () => {
            bgm.play();
            playing = true;
            syncBtn();
            document.removeEventListener("click", resume);
          };
          document.addEventListener("click", resume, { once: true });
        });
      };
      tryAutoPlay();

      btn.addEventListener("click", async () => {
        if (!playing) {
          await bgm.play();
          playing = true;
        } else {
          bgm.pause();
          playing = false;
        }
        syncBtn();
      });
    }

    // === 照片輪播 ===
    const slides = document.querySelectorAll("#slideshow img");
    const prevBtn = document.querySelector(".slideshow .prev");
    const nextBtn = document.querySelector(".slideshow .next");
    let index = 0;
    let timer;

    const showSlide = (newIndex) => {
      slides[index].classList.remove("active");
      index = (newIndex + slides.length) % slides.length;
      slides[index].classList.add("active");
    };

    const nextSlide = () => showSlide(index + 1);
    const prevSlide = () => showSlide(index - 1);

    nextBtn.addEventListener("click", () => {
      nextSlide();
      restartTimer();
    });
    prevBtn.addEventListener("click", () => {
      prevSlide();
      restartTimer();
    });

    const restartTimer = () => {
      clearInterval(timer);
      timer = setInterval(nextSlide, 7260); // 每 7.26 秒換一張
    };

    // 初始化
    slides.forEach((img, i) => (img.classList.toggle("active", i === 0)));
    restartTimer();

  });
})();

// === 音樂可視化（等級2：音量反應光點） ===
    (function () {
      // 這段可以放在你的 DOMContentLoaded 裡（bgm/btn 建好之後）
      document.addEventListener("DOMContentLoaded", () => {
        const canvas = document.getElementById("musicCanvas");
        const ctx = canvas.getContext("2d");
        const bgm = document.getElementById("bgm");
        if (!canvas || !bgm) return;

        let W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);
        const resize = () => {
          W = canvas.clientWidth = window.innerWidth;
          H = canvas.clientHeight = window.innerHeight;
          canvas.width = Math.floor(W * DPR);
          canvas.height = Math.floor(H * DPR);
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        // Web Audio
        let audioCtx, analyser, dataArray, sourceNode;
        let rafId = null;

        // 簡單粒子系統
        const N = 60; // 粒子數
        const parts = [];
        function rand(a, b) { return a + Math.random() * (b - a); }
        function makeParticle() {
          return {
            x: rand(0, W), y: rand(0, H),
            vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2),
            r: rand(8, 20), hue: rand(200, 320), a: 0.25
          };
        }
        for (let i = 0; i < N; i++) parts.push(makeParticle());

        function avgVolume() {
          // 取頻譜平均（0-255）
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          return sum / dataArray.length / 255; // 0..1
        }

        function draw() {
          // 淡淡拖尾
          ctx.fillStyle = "rgba(248,251,255,0.2)";
          ctx.fillRect(0, 0, W, H);

          const level = analyser ? avgVolume() : 0;     // 音量等級
          const boost = 0.6 + level * 1.6;              // 半徑放大倍數
          const glow = 0.2 + level * 0.5;               // 外光暈強度

          for (const p of parts) {
            // 漂浮
            p.x += p.vx; p.y += p.vy;
            if (p.x < -50) p.x = W + 50;
            if (p.x > W + 50) p.x = -50;
            if (p.y < -50) p.y = H + 50;
            if (p.y > H + 50) p.y = -50;

            const r = p.r * boost;

            // 外圈光暈
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.2);
            grad.addColorStop(0, `hsla(${p.hue},100%,70%,${glow * 0.8})`);
            grad.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
            ctx.fill();

            // 核心
            ctx.fillStyle = `hsla(${p.hue},100%,85%,${Math.min(0.9, p.a + level * 0.6)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();
          }

          rafId = requestAnimationFrame(draw);
        }

        // 啟動可視化（在音樂真正可播放時呼叫）
        function startViz() {
          if (audioCtx) { // 已建立就只開動畫
            if (!rafId) rafId = requestAnimationFrame(draw);
            canvas.style.opacity = "1";
            return;
          }
          try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);

            sourceNode = audioCtx.createMediaElementSource(bgm);
            sourceNode.connect(analyser);
            analyser.connect(audioCtx.destination);

            rafId = requestAnimationFrame(draw);
            canvas.style.opacity = "1";
          } catch (e) {
            console.warn("AudioContext 建立失敗：", e);
          }
        }

        function stopViz() {
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          canvas.style.opacity = "0";
        }

        // 跟音樂同步顯示／隱藏
        bgm.addEventListener("play", () => {
          // iOS 需要在互動之後 resume
          if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
          startViz();
        });
        bgm.addEventListener("pause", stopViz);
        bgm.addEventListener("ended", stopViz);

        // 若你有「自動播放成功」的邏輯，請在成功後呼叫 startViz()
        // 例如：你的 tryAutoPlay().then(...) 內加 startViz();
      });
    })();
