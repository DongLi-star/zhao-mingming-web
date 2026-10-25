/* Native pointer-scrub hero + gentle document parallax. No scroll interception. */
(() => {
 'use strict';
 const hero=document.querySelector('.felt-home'), video=document.getElementById('hero-video'),poster=document.getElementById('hero-poster'),slider=document.getElementById('hero-direction'),hint=document.getElementById('hero-hint');
 const pref=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)'),mobile=matchMedia('(max-width: 760px)');
 const toggle=document.querySelector('[data-motion-toggle]'),header=document.querySelector('.site-header'),art=document.querySelector('.about-portrait');
 const meter=document.createElement('div');meter.className='felt-scroll-progress';document.body.append(meter);
 let manual=null,enabled=false,target=.5,seekFrame=0,scrollFrame=0,objectURL=null,controller=null,generation=0,heroVisible=true;
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 function seek(){
  seekFrame=0;if(!enabled||!heroVisible||video.readyState<2||video.seeking||!Number.isFinite(video.duration))return;
  // The provided 24fps clip faces front at 2s, before its time midpoint.
  const end=Math.max(0,video.duration-1/24),neutral=Math.min(2,end);
  const mapped=target<=.5?neutral*target*2:neutral+(end-neutral)*(target-.5)*2;
  const goal=Math.min(end,Math.round(mapped*24)/24),delta=goal-video.currentTime;
  if(Math.abs(delta)<1/48)return;
  video.currentTime=Math.abs(delta)<1/12?goal:video.currentTime+delta*.68;
 }
 function queueSeek(){if(!seekFrame)seekFrame=requestAnimationFrame(seek)}
 function direction(p){target=clamp(p);slider.value=String(Math.round(target*100));queueSeek()}
 video.addEventListener('seeked',()=>{if(enabled){video.classList.add('is-ready');queueSeek()}});
 video.addEventListener('loadeddata',()=>{video.pause();queueSeek()});
 video.addEventListener('error',()=>{video.classList.remove('is-ready');hint.textContent='角色静态预览';slider.disabled=true});
 async function loadVideo(){
  const id=++generation;controller?.abort();controller=new AbortController();
  try{
   const path=innerWidth<=760?'assets/hero/director-scrub-small.mp4':'assets/hero/director-scrub.mp4';
   const response=await fetch(path,{signal:controller.signal});if(!response.ok)throw new Error('media unavailable');
   const blob=await response.blob();if(!enabled||id!==generation)return;
   if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(blob);
   video.src=objectURL;video.load();slider.disabled=false;
  }catch(error){if(error.name!=='AbortError'){hint.textContent='角色静态预览';slider.disabled=true}}
 }
 document.addEventListener('pointermove',event=>{
  if(mobile.matches||!enabled||!heroVisible||event.pointerType==='touch'||event.target.closest('#hero-direction'))return;
  const h=hero.getBoundingClientRect();if(event.clientY<h.top||event.clientY>h.bottom)return;
  const r=video.getBoundingClientRect(),vw=video.videoWidth||1284,vh=video.videoHeight||724;
  const fit=Math.max(r.width/vw,r.height/vh),position=parseFloat(getComputedStyle(video).objectPosition)/100;
  // Reference the actual face in the cover-fitted video, not the page midpoint.
  const faceX=clamp(r.left+(r.width-vw*fit)*(Number.isFinite(position)?position:.62)+vw*.677*fit,h.left+1,h.right-1);
  const side=(event.clientX-faceX)/Math.max(1,event.clientX<faceX?faceX-h.left:h.right-faceX);
  direction(.5+clamp(side,-1,1)*.5);
 });
 slider.addEventListener('input',()=>{if(enabled)direction(Number(slider.value)/100)});
 slider.addEventListener('pointerdown',()=>{if(enabled&&coarse.matches&&video.readyState>=2){const p=video.play();p?.then(()=>{video.pause();queueSeek()}).catch(()=>{})}});
 const reveal=[...document.querySelectorAll('.intro>div,.pw-work-heading,.pw-chapter-heading,.pw-project-summary,.pw-workflow-heading,.pw-portrait-heading,.pw-skate-heading,.pw-live-talk-copy,.pw-subchapter-heading,.legacy-heading,.legacy-expertise-grid article,.about-copy,.legacy-career,.legacy-stack,.legacy-awards')];
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.dataset.visible='true';observer.unobserve(e.target)}}),{threshold:.08});
 reveal.forEach(el=>{el.classList.add('felt-reveal');el.dataset.visible=el.getBoundingClientRect().top<innerHeight?'true':'false';observer.observe(el)});
 // Move existing titles and whole gallery cards. Captions stay attached to
 // their works; image scale and source composition remain unchanged.
 const parallax=[...document.querySelectorAll('.intro>div>p,.pw-work-heading h2,.pw-chapter-heading h3,.pw-project-copy h3,.pw-workflow-heading h3,.pw-portrait-heading h4,.pw-skate-heading h4,.pw-live-talk-copy h4,.pw-subchapter-heading h4,.pw-video-series-heading h4,.about-copy h2,.legacy-expertise h2,.contact-heading h2,.pw-track>[data-gallery-item]')].map(el=>{
  el.classList.add('felt-parallax');return{el,card:el.hasAttribute('data-gallery-item'),center:0,height:0,offset:0};
 });
 let measureNeeded=true;
 function measureParallax(){
  const active=document.body.classList.contains('motion-enabled');
  parallax.forEach(item=>{const r=item.el.getBoundingClientRect();item.center=r.top+scrollY+r.height/2-(active?item.offset:0);item.height=r.height});measureNeeded=false;
 }
 function updateParallax(y,h){
  const narrow=innerWidth<=760;
  parallax.forEach(item=>{
   const visible=Math.abs(item.center-y-h/2)<h/2+item.height/2+100;
   item.el.classList.toggle('is-parallax-visible',enabled&&visible);
   if(!enabled){item.offset=0;item.el.style.removeProperty('--content-drift');return}
   if(!visible)return;
   const phase=clamp((y+h/2-item.center)/(h/2+item.height/2),-1,1);
   item.offset=phase*(item.card?10:-8)*(narrow?.5:1);
   item.el.style.setProperty('--content-drift',item.offset.toFixed(2)+'px');
  });
 }
 const navLinks=[...document.querySelectorAll('.desktop-nav a')];
 const navSections=[...document.querySelectorAll('main [id]')].filter(s=>navLinks.some(a=>a.hash==='#'+s.id));
 function updateScroll(){
  scrollFrame=0;if(measureNeeded)measureParallax();const y=scrollY,h=innerHeight;header.dataset.scrolled=String(y>60);
  meter.style.width=100*clamp(y/Math.max(1,document.documentElement.scrollHeight-h))+'%';
  if(mobile.matches){
   const progress=clamp((y-hero.offsetTop)/Math.max(220,Math.min(hero.offsetHeight*.42,h*.52)));
   const pitch=-1+2*progress*progress*(3-2*progress);
   hero.dataset.mobilePitch=pitch.toFixed(3);
   if(enabled&&heroVisible)document.dispatchEvent(new CustomEvent('portfolio-hero-look',{detail:{pitch}}));
  }else delete hero.dataset.mobilePitch;
  if(enabled){const p=clamp(y/hero.offsetHeight);hero.style.setProperty('--hero-drift',p*85+'px');hero.style.setProperty('--hero-zoom',1+p*.06);hero.style.setProperty('--copy-drift',-p*85+'px');
   if(art){const r=document.querySelector('.about').getBoundingClientRect();art.style.setProperty('--photo-drift',clamp((h*.5-r.top)/h,-1,1)*28+'px')}
  }else{hero.style.removeProperty('--hero-drift');hero.style.removeProperty('--hero-zoom');hero.style.removeProperty('--copy-drift');art?.style.removeProperty('--photo-drift')}
  updateParallax(y,h);
  let active='';navSections.forEach(s=>{if(s.getBoundingClientRect().top<h*.4)active=s.id});navLinks.forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 }
 function queueScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll)}
 function applyMotion(){
  enabled=!pref.matches&&(manual??true);document.body.classList.toggle('is-motion-active',enabled);document.body.classList.toggle('motion-enabled',enabled);
  toggle.setAttribute('aria-pressed',String(!enabled));toggle.querySelector('[data-motion-label]').textContent=enabled?'暂停动效':'开启动效';
  toggle.disabled=pref.matches;if(pref.matches)toggle.querySelector('[data-motion-label]').textContent='已减少动态效果';
  hint.textContent=enabled?(mobile.matches?'向下滑动，和我一起看看':coarse.matches?'拖动滑杆，改变角色朝向':'移动鼠标，和我打个招呼'):'角色静态预览';slider.disabled=!enabled||mobile.matches;
  if(enabled)hint.insertAdjacentHTML('afterbegin',uiIconMarkup(mobile.matches?'down':'horizontal')+' ');
  if(enabled&&!mobile.matches)loadVideo();else{generation++;controller?.abort();video.pause();video.classList.remove('is-ready');video.removeAttribute('src');video.load();if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null}}
  measureNeeded=true;document.dispatchEvent(new CustomEvent('portfolio-motion-state',{detail:{enabled}}));queueScroll();
 }
 toggle.addEventListener('click',()=>{manual=!enabled;applyMotion()});pref.addEventListener('change',applyMotion);mobile.addEventListener('change',applyMotion);
 new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(heroVisible)queueSeek()},{threshold:0}).observe(hero);
 function refreshParallax(){measureNeeded=true;queueScroll()}
 const layoutObserver=new ResizeObserver(refreshParallax);layoutObserver.observe(document.querySelector('main'));
 document.querySelector('main').addEventListener('load',refreshParallax,true);
 document.addEventListener('transitionend',event=>{if(event.propertyName==='transform'&&event.target.classList.contains('felt-reveal'))refreshParallax()});
 document.fonts?.ready.then(refreshParallax);
 addEventListener('scroll',queueScroll,{passive:true});addEventListener('resize',refreshParallax);
 addEventListener('pagehide',()=>{controller?.abort();if(objectURL)URL.revokeObjectURL(objectURL);cancelAnimationFrame(seekFrame);cancelAnimationFrame(scrollFrame)});
 applyMotion();updateScroll();
})();
