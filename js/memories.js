// 回憶牆：燈箱 + 音樂播放
(function(){
  // 燈箱
  const grid = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lightImg = document.getElementById("lightboxImg");

  grid.querySelectorAll("img").forEach(img=>{
    img.addEventListener("click", ()=>{
      lightImg.src = img.src;
      lightbox.classList.add("show");
    });
  });
  lightbox.addEventListener("click", ()=> lightbox.classList.remove("show"));

  // 音樂
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");
  let playing = false;
  btn.addEventListener("click", async ()=>{
    try{
      if(!playing){ await bgm.play(); btn.textContent="⏸ 暫停音樂"; }
      else { bgm.pause(); btn.textContent="🎵 播放音樂"; }
      playing = !playing;
    }catch(e){
      alert("瀏覽器阻擋自動播放，請再按一次或檢查檔案路徑。");
    }
  });
})();
