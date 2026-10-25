/* Desktop video gaze and a clearly upward-looking mobile portrait.
 * Mobile scroll adds a coherent head pitch and eye movement within the eye whites. */
(() => {
 'use strict';
 const video=document.getElementById('hero-video'),poster=document.getElementById('hero-poster'),stage=video?.parentElement,hero=document.getElementById('home');
 const mobile=matchMedia('(max-width: 760px)');
 if(!video||!stage||!hero)return;
 const canvas=document.createElement('canvas');canvas.className='hero-eye-canvas';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
 if(!gl)return;
 let track=null,visible=true,enabled=document.body.classList.contains('is-motion-active'),lost=false,dirtyTexture=true,frame=0,paintTime=0;
 let look=[0,mobile.matches?-1:0],target=look.slice();
 const clamp=(n,a=-1,b=1)=>Math.max(a,Math.min(b,n));
 const vertex='attribute vec2 a;varying vec2 uv;void main(){uv=(a+1.0)*0.5;gl_Position=vec4(a,0.0,1.0);}';
 const fragment=`precision highp float;
 varying vec2 uv;uniform sampler2D image;uniform vec2 size;uniform vec2 gaze;
 uniform vec4 leftEye;uniform vec4 rightEye;uniform vec2 confidence;uniform float mobileMode;uniform float headPitch;
 vec2 headWarp(vec2 p){
  if(mobileMode<0.5)return p;
  float assetScale=size.x/1284.0;
  vec2 center=vec2(856.0,360.0)*assetScale;
  vec2 q=(p-center)/(vec2(390.0,345.0)*assetScale);
  float volume=sqrt(max(0.0,1.0-dot(q,q)));
  float neck=1.0-smoothstep(550.0,645.0,p.y/assetScale);
  float angle=-headPitch*.34,depth=180.0*assetScale*volume;
  float pivot=620.0*assetScale,dy=p.y-pivot,focal=1450.0*assetScale;
  float perspective=(focal-depth)/(focal-dy*sin(angle)-depth*cos(angle));
  vec2 samplePoint=vec2(center.x+(p.x-center.x)/perspective,pivot+(dy/perspective+depth*sin(angle))/cos(angle));
  float influence=(1.0-smoothstep(.55,1.0,dot(q,q)))*neck;
  return mix(p,samplePoint,influence);
 }
 vec2 eyeWarp(vec2 p,vec4 eye,float certainty){
  float assetScale=size.x/1284.0;
  vec2 radius=mix(max(eye.zw*vec2(1.9,1.65),vec2(12.0,16.0)*assetScale),eye.zw,mobileMode);
  vec2 q=(p-eye.xy)/radius;
  float falloff=1.0-smoothstep(0.30,1.0,dot(q,q));
  vec2 travel=mix(min(vec2(7.0,5.0)*assetScale,eye.zw*vec2(.32,.24)),vec2(0.0,40.0)*assetScale,mobileMode);
  return p-gaze*travel*falloff*certainty;
 }
 vec3 imageColor(vec2 p){return texture2D(image,vec2(p.x/size.x,1.0-p.y/size.y)).rgb;}
 vec3 mobileEyeColor(vec2 p,vec4 eye,vec2 origin,vec3 color){
  float assetScale=size.x/1284.0;
  origin*=assetScale;
  float radius=22.5*assetScale;
  vec2 destination=origin+vec2(0.0,38.0*assetScale*gaze.y);
  float oldMask=1.0-smoothstep(24.0*assetScale,26.0*assetScale,length(p-origin));
  vec2 local=(p-eye.xy)/eye.zw;
  vec3 white=imageColor(eye.xy+vec2(-14.0,12.0)*assetScale);
  white*=1.025-.045*dot(local,local);
  color=mix(color,white,oldMask);
  float newMask=1.0-smoothstep(radius-.6*assetScale,radius+.6*assetScale,length(p-destination));
  float eyeMask=1.0-smoothstep(.82,1.0,dot(local,local));
  return mix(color,imageColor(origin+p-destination),newMask*eyeMask);
 }
 void main(){
  vec2 p=headWarp(vec2(uv.x,1.0-uv.y)*size);
  if(mobileMode>0.5){
   vec3 color=imageColor(p);
   if(gaze.y>.001){color=mobileEyeColor(p,leftEye,vec2(794.0,275.0),color);color=mobileEyeColor(p,rightEye,vec2(910.0,294.0),color);}
   gl_FragColor=vec4(color,1.0);return;
  }
  p+=eyeWarp(p,leftEye,confidence.x)-p;
  p+=eyeWarp(p,rightEye,confidence.y)-p;
  gl_FragColor=texture2D(image,vec2(p.x/size.x,1.0-p.y/size.y));
 }`;
 function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s}
 let program;
 try{
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
 }catch{return}
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const attr=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 const uniforms=Object.fromEntries(['size','gaze','leftEye','rightEye','confidence','mobileMode','headPitch'].map(name=>[name,gl.getUniformLocation(program,name)]));
 stage.append(canvas);
 function eyesAt(time){
  const f=clamp(time*track.fps,0,track.frames.length-1),i=Math.floor(f),next=track.frames[Math.min(i+1,track.frames.length-1)],mix=f-i;
  return track.frames[i].map((eye,e)=>eye.map((v,k)=>v+(next[e][k]-v)*mix));
 }
 function queue(){if(!frame&&visible&&enabled&&track&&!lost)frame=requestAnimationFrame(paint)}
 function hide(){canvas.classList.remove('is-ready');stage.classList.remove('has-eye-layer');canvas.dataset.eyeLayer='fallback';cancelAnimationFrame(frame);frame=0}
 function paint(){
  frame=0;if(!enabled||!visible||!track)return;
  const source=mobile.matches?poster:video;
  if(mobile.matches?(!poster.complete||!poster.naturalWidth):(video.readyState<2||!video.classList.contains('is-ready')))return;
  if(dirtyTexture){
   if(!mobile.matches&&video.seeking)return;
   const width=mobile.matches?poster.naturalWidth:video.videoWidth,height=mobile.matches?poster.naturalHeight:video.videoHeight;
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,canvas.width,canvas.height)}
   try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source)}catch{hide();return}
   paintTime=mobile.matches?2:video.currentTime;dirtyTexture=false;
  }
  look=look.map((v,i)=>Math.abs(target[i]-v)<.002?target[i]:v+(target[i]-v)*.30);
  // White-of-eye centers on the new upward portrait; desktop retains frame tracking.
  const eyes=mobile.matches?[[794,299,40,35,1],[912,317,39,36,1]]:eyesAt(paintTime),sx=canvas.width/track.width,sy=canvas.height/track.height;
  const progress=(look[1]+1)/2;
  gl.uniform2f(uniforms.size,canvas.width,canvas.height);gl.uniform2f(uniforms.gaze,look[0],mobile.matches?progress:look[1]);
  gl.uniform1f(uniforms.mobileMode,mobile.matches?1:0);gl.uniform1f(uniforms.headPitch,mobile.matches?progress:0);
  eyes.forEach((eye,i)=>gl.uniform4f(i?uniforms.rightEye:uniforms.leftEye,eye[0]*sx,eye[1]*sy,eye[2]*sx,eye[3]*sy));
  gl.uniform2f(uniforms.confidence,eyes[0][4],eyes[1][4]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  canvas.classList.add('is-ready');stage.classList.add('has-eye-layer');canvas.dataset.eyeLayer='ready';
  canvas.dataset.gazeX=look[0].toFixed(3);canvas.dataset.gazeY=look[1].toFixed(3);canvas.dataset.frameTime=paintTime.toFixed(3);canvas.dataset.source=mobile.matches?'portrait':'video';canvas.dataset.headPitch=(mobile.matches?look[1]:0).toFixed(3);
  if(look.some((v,i)=>v!==target[i]))queue();
 }
 function newFrame(){dirtyTexture=true;queue()}
 video.addEventListener('seeked',newFrame);video.addEventListener('loadeddata',newFrame);
 video.addEventListener('emptied',()=>{dirtyTexture=true;hide();if(mobile.matches)queue()});video.addEventListener('error',()=>{if(!mobile.matches)hide()});
 poster.addEventListener('load',newFrame);
 document.addEventListener('portfolio-hero-look',event=>{
  if(!mobile.matches)return;
  target=[0,clamp(Number(event.detail?.pitch)||0)];queue();
 });
 document.addEventListener('pointermove',event=>{
  if(mobile.matches||!enabled||!visible||!track||event.pointerType==='touch'||event.target.closest('#hero-direction'))return;
  const h=hero.getBoundingClientRect();if(event.clientY<h.top||event.clientY>h.bottom){target=[0,0];queue();return}
  const eyes=eyesAt(paintTime),r=canvas.getBoundingClientRect(),fit=Math.max(r.width/track.width,r.height/track.height);
  const position=parseFloat(getComputedStyle(canvas).objectPosition)/100;
  const x=(eyes[0][0]+eyes[1][0])/2,y=(eyes[0][1]+eyes[1][1])/2;
  const screenX=r.left+(r.width-track.width*fit)*(Number.isFinite(position)?position:.62)+x*fit;
  const screenY=r.top+(r.height-track.height*fit)*.5+y*fit;
  target=[clamp((event.clientX-screenX)/Math.max(180,h.width*.32)),clamp((event.clientY-screenY)/Math.max(140,h.height*.32))];queue();
 });
 document.getElementById('hero-direction').addEventListener('input',()=>{target=[0,0];queue()});
 document.addEventListener('portfolio-motion-state',event=>{enabled=Boolean(event.detail?.enabled);target=[0,mobile.matches?Number(hero.dataset.mobilePitch??-1):0];look=target.slice();if(!enabled)hide();else newFrame()});
 mobile.addEventListener('change',()=>{target=[0,mobile.matches?Number(hero.dataset.mobilePitch??-1):0];look=target.slice();newFrame()});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0}else queue()},{threshold:0}).observe(hero);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;hide()});
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);hide()});
 fetch('assets/hero/eye-track.json').then(r=>{if(!r.ok)throw Error('track');return r.json()}).then(data=>{track=data;newFrame()}).catch(hide);
})();
