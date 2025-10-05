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
