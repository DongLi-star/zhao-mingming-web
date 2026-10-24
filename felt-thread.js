/* Native scroll only. Cached document-space curves; content masks put the
 * decoration behind text, works and controls. No idle animation loop. */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const AVOID='[data-thread-avoid],h1,h2,h3,h4,h5,p,figure,figcaption,li,a,button,input,label,address,.mono,.eyebrow,.intro-detail,.pw-section-label,.pw-eyebrow,.legacy-kicker,.pp-stage-label,.pp-generation-steps>div,.pw-gallery-controls,.pw-project-metrics,.legacy-index,.about-tags,.about-portrait,.sw-pin,img,video';
  const COMPOSITE='[data-gallery-track],.pw-portrait-case,.pw-skate-workflow,.pw-workflow-board,.pw-live-talk';
  const TEXT='h1,h2,h3,h4,h5,p,figcaption,li,.mono,.eyebrow,.intro-detail,.pw-section-label,.pw-eyebrow,.legacy-kicker,.legacy-index';
  const SCENES='#ai-images,#live-project,#video-workflow,#motion,#ai-product-videos,#ai-scene-videos,#film-archive,#expertise,#about,#experience,.legacy-credentials';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const create=(tag,attrs={})=>{const node=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));return node};
  const cubic=(s,t)=>{const u=1-t;return{x:u*u*u*s.a.x+3*u*u*t*s.c1.x+3*u*t*t*s.c2.x+t*t*t*s.b.x,y:u*u*u*s.a.y+3*u*u*t*s.c1.y+3*u*t*t*s.c2.y+t*t*t*s.b.y}};
  let controller=null;

  function init(){
    if(controller)return;
    const root=document.querySelector('[data-felt-thread]'),page=document.querySelector('main');
    if(!root||!page)return;
    const svg=root.querySelector('svg'),world=root.querySelector('[data-thread-world]'),ink=root.querySelector('[data-thread-ink]');
    const mask=root.querySelector('mask'),base=root.querySelector('[data-thread-mask-base]'),obstacles=root.querySelector('[data-thread-obstacles]'),defs=svg.querySelector('defs');
    const route=root.querySelector('[data-thread-route]'),yarn=root.querySelector('[data-thread-yarn]'),star=root.querySelector('[data-thread-star]');
    const reduce=matchMedia('(prefers-reduced-motion: reduce)'),cleanups=[];
    let enabled=document.body.classList.contains('is-motion-active')&&!reduce.matches;
    let frame=0,dirty=true,dead=false,width=1,height=1,scrollMax=1,startScroll=0,firstY=0,lastY=1,length=1,small=false;
    let segments=[],pins=[],moving=[],galleries=[],galleryClips=[],yarnParts=[],darkRange=[Infinity,Infinity];
    const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);cleanups.push(()=>target.removeEventListener(type,fn,options))};
    function schedule(measure=false){if(dead)return;if(measure)dirty=true;if(!frame)frame=requestAnimationFrame(render)}
    const pinOffset=(pin,y)=>clamp(y-pin.top,0,pin.distance);
    function findPin(node){
      const el=node.closest('.sw-pin');
      if(!el||getComputedStyle(el).position!=='sticky')return null;
      let pin=pins.find(p=>p.el===el);if(pin)return pin;
      const parent=el.parentElement,box=parent.getBoundingClientRect();
      pin={el,top:box.top+scrollY,distance:Math.max(0,parent.offsetHeight-el.offsetHeight),group:create('g')};
      pins.push(pin);obstacles.append(pin.group);return pin;
    }
    function paddedRect(b,padX,padY=padX){return{x:b.left-padX,y:b.top+scrollY-padY,width:b.width+padX*2,height:b.height+padY*2}}
    function rectFor(node,pad){return paddedRect(node.getBoundingClientRect(),pad)}
    function setRect(rect,box){Object.entries(box).forEach(([k,v])=>rect.setAttribute(k,v.toFixed(2)))}
    function atDistance(distance){
      const s=segments.find(part=>distance<=part.start+part.length)||segments.at(-1),local=clamp(distance-s.start,0,s.length);
      let index=0;while(index<23&&s.samples[index+1]<local)index++;
      const t=(index+(local-s.samples[index])/Math.max(.001,s.samples[index+1]-s.samples[index]))/24,u=1-t,p=cubic(s,t);
      const dx=3*u*u*(s.c1.x-s.a.x)+6*u*t*(s.c2.x-s.c1.x)+3*t*t*(s.b.x-s.c2.x),dy=3*u*u*(s.c1.y-s.a.y)+6*u*t*(s.c2.y-s.c1.y)+3*t*t*(s.b.y-s.c2.y),m=Math.hypot(dx,dy)||1;
      return{...p,nx:-dy/m,ny:dx/m,distance};
    }
    function strand(points,phase=0,amount=0){return points.map((p,i)=>{const offset=Math.sin(p.distance*Math.PI*2/9+phase)*amount;return`${i?'L':'M'} ${(p.x+p.nx*offset).toFixed(2)} ${(p.y+p.ny*offset).toFixed(2)}`}).join(' ')}
    function paintYarn(travelled){
      const trail=Math.min(travelled,small?92:192),count=yarnParts.length;yarn.style.visibility=trail<1?'hidden':'visible';
      if(trail<1)return;
      yarnParts.forEach((part,i)=>{
        const start=travelled-trail+trail*i/count,end=travelled-trail+trail*(i+1)/count,points=[atDistance(start),atDistance((start+end)/2),atDistance(end)];
        const fade=(i+.5)/count,alpha=fade*fade*(3-2*fade),d=strand(points);
        part.group.setAttribute('opacity',alpha.toFixed(4));
        part.core.setAttribute('d',d);part.soft.setAttribute('d',d);
        part.core.setAttribute('stroke-width',((small?1.9:2.7)*(.25+.75*fade)).toFixed(2));
        part.light.setAttribute('d',strand(points,0,small?.32:.55));part.dark.setAttribute('d',strand(points,Math.PI,small?.32:.55));
        const p=points[1],side=i%2?1:-1,reach=(small?1.3:2.1)*side;
        part.fuzz.setAttribute('d',`M ${(p.x+p.nx*side*.6).toFixed(2)} ${(p.y+p.ny*side*.6).toFixed(2)} q ${(p.nx*reach+p.ny*.6).toFixed(2)} ${(p.ny*reach-p.nx*.6).toFixed(2)} ${(p.nx*reach*.8).toFixed(2)} ${(p.ny*reach*.8).toFixed(2)}`);
      });
    }
    function measure(){
      width=document.documentElement.clientWidth;height=innerHeight;small=width<=760;
      const docHeight=document.documentElement.scrollHeight,y=scrollY,gutter=small?16:28;
      scrollMax=Math.max(1,docHeight-height);svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      pins=[];moving=[];galleries=[];galleryClips.forEach(node=>node.remove());galleryClips=[];obstacles.replaceChildren();
      const box=selector=>{const node=page.querySelector(selector);if(!node?.getClientRects().length)return null;const b=node.getBoundingClientRect();return{left:b.left,right:b.right,top:b.top+y,bottom:b.bottom+y,width:b.width,height:b.height}};
      const intro=box('#intro'),heading=box('.pw-work-heading h2'),portrait=box('.pp-library-grid figure');
      const about=box('#about'),career=box('#experience'),careerHeading=box('#experience>.legacy-heading'),credentials=box('.legacy-credentials');
      const mail=box('.contact-detail>a[href^="mailto:"]');
      const right=width-gutter,left=clamp(heading.left+(small?14:40),gutter,right);
      const first={x:width*.86,y:intro.top+24};
      const leftTurn={x:left,y:heading.bottom+(small?32:50)};
      const rightExit={x:right,y:Math.max(leftTurn.y+100,portrait.bottom+(small?38:70))};
      const aboutEntry={x:right,y:about.top+24};
      const careerTurn={x:clamp(careerHeading.left+(small?14:40),gutter,right),y:career.top+(small?36:100)};
      const careerExit={x:width*(small?.82:.70),y:career.bottom-20};
      const contactEntry={x:right,y:credentials.bottom+20};
      const mailRight=mail.right+26;
      const end=small
        ?{x:clamp(mailRight,gutter,right),y:mailRight<right-12?mail.top+mail.height/2:mail.top-28}
        :{x:clamp(mail.left-40,gutter,right),y:mail.top+mail.height/2};
      // Follow the supplied drawings: two opening sweeps, a completely straight
      // right-hand lane through the works, then the about/career return to email.
      // Content masks below remain authoritative wherever a sweep passes behind it.
      segments=[];length=0;let d=`M ${first.x} ${first.y}`;
      function curve(a,b,c1,c2){
        if(b.y<=a.y)return;
        const s={a,b,c1,c2,start:length,samples:[0]};
        let previous=a,local=0;
        for(let j=1;j<=24;j++){const p=cubic(s,j/24);local+=Math.hypot(p.x-previous.x,p.y-previous.y);s.samples.push(local);previous=p}
        s.length=local;length+=local;segments.push(s);d+=` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
      }
      curve(first,leftTurn,{x:first.x,y:first.y+(leftTurn.y-first.y)*.52},{x:leftTurn.x,y:leftTurn.y-(leftTurn.y-first.y)*.28});
      curve(leftTurn,rightExit,{x:leftTurn.x,y:leftTurn.y+(rightExit.y-leftTurn.y)*.34},{x:rightExit.x,y:rightExit.y-(rightExit.y-leftTurn.y)*.20});
      const laneHeight=aboutEntry.y-rightExit.y;
      curve(rightExit,aboutEntry,{x:right,y:rightExit.y+laneHeight/3},{x:right,y:aboutEntry.y-laneHeight/3});
      curve(aboutEntry,careerTurn,{x:right,y:aboutEntry.y+(careerTurn.y-aboutEntry.y)*.36},{x:careerTurn.x,y:careerTurn.y-(careerTurn.y-aboutEntry.y)*.30});
      curve(careerTurn,careerExit,{x:careerTurn.x,y:careerTurn.y+(careerExit.y-careerTurn.y)*.34},{x:careerExit.x-(careerExit.x-careerTurn.x)*.28,y:careerExit.y-(careerExit.y-careerTurn.y)*.20});
      curve(careerExit,contactEntry,{x:careerExit.x+(right-careerExit.x)*.65,y:careerExit.y+(contactEntry.y-careerExit.y)*.30},{x:right,y:contactEntry.y-(contactEntry.y-careerExit.y)*.30});
      curve(contactEntry,end,{x:right,y:contactEntry.y+(end.y-contactEntry.y)*.45},{x:end.x,y:end.y-(end.y-contactEntry.y)*.25});
      const reel=box('#motion');darkRange=reel?[reel.top,reel.bottom]:[Infinity,Infinity];
      route.setAttribute('d',d);
      yarn.replaceChildren();yarnParts=[];
      for(let i=0;i<(small?24:36);i++){
        const group=create('g'),soft=create('path',{class:'felt-yarn-soft'}),core=create('path',{class:'felt-thread-tail','data-thread-tail':''}),light=create('path',{class:'felt-yarn-light'}),dark=create('path',{class:'felt-yarn-dark'}),fuzz=create('path',{class:'felt-yarn-fuzz'});
        group.append(soft,core,dark,light,fuzz);yarn.append(group);yarnParts.push({group,soft,core,light,dark,fuzz});
      }
      firstY=first.y;lastY=end.y;startScroll=Math.max(0,firstY-height*.44);
      [mask,base].forEach(node=>{node.setAttribute('x','-100');node.setAttribute('y','-100');node.setAttribute('width',width+200);node.setAttribute('height',docHeight+200)});
      const fixed=create('g');obstacles.append(fixed);
      page.querySelectorAll('[data-gallery-track]').forEach((track,index)=>{
        const clip=create('clipPath',{id:`felt-gallery-clip-${index}`,clipPathUnits:'userSpaceOnUse'}),b=track.getBoundingClientRect();
        clip.append(create('rect',{x:b.left,y:b.top+y,width:b.width,height:b.height}));defs.append(clip);galleryClips.push(clip);
        const group=create('g',{'clip-path':`url(#${clip.id})`}),content=create('g');group.append(content);fixed.append(group);
        track.querySelectorAll('[data-gallery-item]').forEach(card=>{const rect=create('rect',{fill:'black',rx:3}),r=rectFor(card,3);r.x+=track.scrollLeft;setRect(rect,r);content.append(rect)});
        galleries.push({node:track,group:content});
      });
      const avoided=[...page.querySelectorAll(AVOID)].filter(node=>!node.matches(COMPOSITE)&&!node.closest('[hidden],dialog,[data-gallery-track]')&&node.getClientRects().length);
      const selected=new Set(avoided);
      avoided.forEach(node=>{
        for(let p=node.parentElement;p&&p!==page;p=p.parentElement)if(selected.has(p))return;
        const b=node.getBoundingClientRect();if(!b.width||!b.height)return;
        const pin=findPin(node),dynamic=!pin&&node.closest('.about-portrait,.legacy-heading');
        // The existing reveal can move 28px. Reserve its full sweep in the mask.
        const pad=node.closest('.felt-reveal')?32:node.matches('img,video,[data-thread-avoid]')?3:6;
        const runs=[];
        if(node.matches(TEXT)){
          // Protect the actual text lines, leaving their unused block width
          // available to the star. Text still covers the full reveal sweep.
          const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
          while(walker.nextNode()){
            if(!walker.currentNode.textContent.trim())continue;
            const range=document.createRange();range.selectNodeContents(walker.currentNode);
            [...range.getClientRects()].forEach((b,index)=>{if(b.width&&b.height)runs.push({box:paddedRect(b,6,pad),range,index})});
          }
        }else runs.push({box:rectFor(node,pad)});
        runs.forEach(run=>{
          const rect=create('rect',{fill:'black',rx:3});if(pin)run.box.y-=pinOffset(pin,y);
          setRect(rect,run.box);(pin?pin.group:fixed).append(rect);
          if(dynamic)moving.push({node,rect,pad,range:run.range,index:run.index});
        });
      });
      dirty=false;
    }
    function render(){
      frame=0;if(dead)return;if(dirty)measure();if(!enabled||reduce.matches||!segments.length)return;
      const y=scrollY,p=clamp((y-startScroll)/Math.max(1,scrollMax-startScroll),0,1),target=firstY+(lastY-firstY)*p;
      const s=segments.find(part=>target<=part.b.y)||segments.at(-1);
      let low=0,high=1;
      for(let i=0;i<14;i++){const t=(low+high)/2;if(cubic(s,t).y<target)low=t;else high=t}
      const t=(low+high)/2,point=cubic(s,t),sample=t*24,index=Math.min(23,Math.floor(sample));
      const travelled=s.start+s.samples[index]+(s.samples[index+1]-s.samples[index])*(sample-index);
      world.setAttribute('transform',`translate(0 ${-y})`);
      pins.forEach(pin=>pin.group.setAttribute('transform',`translate(0 ${pinOffset(pin,y)})`));
      moving.forEach(item=>{const line=item.range?.getClientRects()[item.index];setRect(item.rect,line?paddedRect(line,6,item.pad):rectFor(item.node,item.pad))});
      galleries.forEach(item=>item.group.setAttribute('transform',`translate(${-item.node.scrollLeft} 0)`));
      star.setAttribute('transform',`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) scale(${small?.82:1.38}) rotate(${(p*330-15).toFixed(2)})`);
      paintYarn(travelled);
      ink.style.opacity=String(clamp((y-startScroll+80)/80,0,1));
      root.classList.toggle('is-dark',point.y>=darkRange[0]&&point.y<=darkRange[1]);
    }
    function sync(){root.classList.toggle('is-disabled',!enabled||reduce.matches);schedule(true)}
    listen(document,'portfolio-motion-state',event=>{enabled=Boolean(event.detail?.enabled)&&!reduce.matches;sync()});
    listen(reduce,'change',()=>{enabled=document.body.classList.contains('is-motion-active')&&!reduce.matches;sync()});
    listen(window,'scroll',()=>{if(enabled)schedule()},{passive:true});
    listen(page,'scroll',event=>{if(enabled&&event.target.matches?.('[data-gallery-track]'))schedule()},true);
    listen(window,'resize',()=>schedule(true),{passive:true});
    listen(window,'orientationchange',()=>schedule(true),{passive:true});
    listen(page,'load',()=>schedule(true),true);
    listen(page,'transitionend',event=>{if(event.propertyName==='transform'&&event.target.matches('.felt-reveal'))schedule(true)});
    const resize=new ResizeObserver(()=>schedule(true));resize.observe(page);
    page.querySelectorAll(`${SCENES},#motion-world,#intro,#contact`).forEach(node=>resize.observe(node));
    const mutations=new MutationObserver(changes=>{if(changes.some(change=>!change.target.closest?.('[data-gallery-range],[data-gallery-dots],.reel-counter')))schedule(true)});
    mutations.observe(page,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','open']});
    document.fonts?.ready.then(()=>schedule(true));
    root.classList.add('is-ready');document.body.classList.add('has-felt-thread');sync();
    controller={destroy(){dead=true;cancelAnimationFrame(frame);cleanups.forEach(fn=>fn());resize.disconnect();mutations.disconnect();galleryClips.forEach(node=>node.remove());root.classList.remove('is-ready');document.body.classList.remove('has-felt-thread');controller=null}};
  }
  addEventListener('pagehide',()=>controller?.destroy());addEventListener('pageshow',init);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
