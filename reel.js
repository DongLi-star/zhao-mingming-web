(() => {
  const root = document.getElementById('motion-world');
  if (!root) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let manualReduced = null;
  let instance = null;
  let pageReduced = !document.body.classList.contains("is-motion-active");
  const reduce = () => pageReduced || (manualReduced ?? media.matches);
  function render() {
    instance?.destroy();
    const forcedReduced = pageReduced || media.matches;
    const toggleLabel = forcedReduced ? (media.matches ? '系统已减少动态效果' : '全站动效已暂停') : (reduce() ? '开启滚动影片' : '减少动态效果');
    const overlay = document.createElement('div');
    overlay.className = 'reel-overlay';
    overlay.innerHTML = `<div class="reel-top"><span class="eyebrow"><i class="dot"></i> 03 — AI VIDEO / 生成式影像</span><a href="#ai-video-series">浏览两类 AI 视频 ${uiIconMarkup("down")}</a></div><div class="reel-title"><span class="mono">AI PRODUCT FILM / 唇釉示例</span><h2 class="reel-ai-heading">AI<br><span>视频制作</span></h2><p>从视觉构思到动态影像，<br>用 AI 完成商品短片创作。</p></div><div class="reel-caption"><span class="mono">AI PRODUCT FILM / LIP COLOR</span><p>唇釉 · AI 生成商品短片</p><span class="reel-counter mono">00 / 10 SEC</span></div><div class="reel-footer"><button class="reel-motion-toggle" aria-pressed="${reduce()}" ${forcedReduced ? 'disabled' : ''}>${toggleLabel}</button><span class="reel-instruction mono">${reduce() ? 'STILL VIEW / 静态展映' : 'SCROLL TO SCRUB / 滚动控制影片进度'}</span><button class="reel-watch" type="button" data-project="productFilms" data-media-index="3">观看完整唇釉短片 ${uiIconMarkup("ne")}</button></div>`;
    const counter = overlay.querySelector('.reel-counter');
    instance = mountScrollWorld(root, {
      reduce: reduce(), nav: false, atmosphere: false, diveScroll: 1.4,
      sections: [{id:'lip-color',label:'AI 唇釉短片',still:'assets/scroll/product-scroll-first.jpg',stillMobile:'assets/scroll/product-scroll-mobile-first.jpg',clip:'assets/scroll/product-scroll.mp4',clipMobile:'assets/scroll/product-scroll-mobile.mp4',accent:'#e7ae63'}],
      connectors: [],
      onProgress(progress) { const label = `${String(Math.min(10,Math.floor(progress*10))).padStart(2,'0')} / 10 SEC`; if (counter.textContent !== label) counter.textContent = label; }
    });
    root.querySelector('.sw-pin').append(overlay);
    overlay.querySelector('.reel-motion-toggle').addEventListener('click',()=>{
      manualReduced = !reduce(); render(); root.querySelector('.reel-motion-toggle').focus({preventScroll:true});
    });
  }
  render();
  document.addEventListener("portfolio-motion-state", event => { pageReduced = !event.detail.enabled; render(); });
  media.addEventListener('change',()=>{manualReduced=null;render();});
  addEventListener('pagehide',()=>instance?.destroy());

})();
