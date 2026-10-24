/* Small, frame-tracked eye movement on the existing character video.
 * The optical warp stays inside the eye whites; glasses and face stay intact. */
(() => {
 'use strict';
 const video=document.getElementById('hero-video'),stage=video?.parentElement,hero=document.getElementById('home');
 if(!video||!stage||!hero)return;
 const canvas=document.createElement('canvas');canvas.className='hero-eye-canvas';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
 if(!gl)return;
 let track=null,visible=true,enabled=document.body.classList.contains('is-motion-active'),lost=false,dirtyTexture=true,frame=0,paintTime=0;
 let look=[0,0],target=[0,0];
 const clamp=(n,a=-1,b=1)=>Math.max(a,Math.min(b,n));
 const vertex='attribute vec2 a;varying vec2 uv;void main(){uv=(a+1.0)*0.5;gl_Position=vec4(a,0.0,1.0);}';
 const fragment=`precision highp float;
 varying vec2 uv;uniform sampler2D image;uniform vec2 size;uniform vec2 gaze;
 uniform vec4 leftEye;uniform vec4 rightEye;uniform vec2 confidence;
 vec2 eyeWarp(vec2 p,vec4 eye,float certainty){
  float assetScale=size.x/1284.0;
  vec2 radius=max(eye.zw*vec2(1.9,1.65),vec2(12.0,16.0)*assetScale);
  vec2 q=(p-eye.xy)/radius;
  float falloff=1.0-smoothstep(0.30,1.0,dot(q,q));
  vec2 travel=min(vec2(7.0,5.0)*assetScale,eye.zw*vec2(0.32,0.24));
  return p-gaze*travel*falloff*certainty;
 }
 void main(){
  vec2 p=vec2(uv.x,1.0-uv.y)*size;
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
 const uniforms=Object.fromEntries(['size','gaze','leftEye','rightEye','confidence'].map(name=>[name,gl.getUniformLocation(program,name)]));
 stage.append(canvas);
 function eyesAt(time){
  const f=clamp(time*track.fps,0,track.frames.length-1),i=Math.floor(f),next=track.frames[Math.min(i+1,track.frames.length-1)],mix=f-i;
  return track.frames[i].map((eye,e)=>eye.map((v,k)=>v+(next[e][k]-v)*mix));
 }
 function queue(){if(!frame&&visible&&enabled&&track&&!lost)frame=requestAnimationFrame(paint)}
 function hide(){canvas.classList.remove('is-ready');stage.classList.remove('has-eye-layer');canvas.dataset.eyeLayer='fallback';cancelAnimationFrame(frame);frame=0}
 function paint(){
  frame=0;if(!enabled||!visible||!track||video.readyState<2||!video.classList.contains('is-ready'))return;
  if(dirtyTexture){
   if(video.seeking)return;
   if(canvas.width!==video.videoWidth||canvas.height!==video.videoHeight){canvas.width=video.videoWidth;canvas.height=video.videoHeight;gl.viewport(0,0,canvas.width,canvas.height)}
   try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,video)}catch{hide();return}
   paintTime=video.currentTime;dirtyTexture=false;
  }
  look=look.map((v,i)=>Math.abs(target[i]-v)<.002?target[i]:v+(target[i]-v)*.30);
  const eyes=eyesAt(paintTime),sx=canvas.width/track.width,sy=canvas.height/track.height;
  gl.uniform2f(uniforms.size,canvas.width,canvas.height);gl.uniform2f(uniforms.gaze,...look);
  eyes.forEach((eye,i)=>gl.uniform4f(i?uniforms.rightEye:uniforms.leftEye,eye[0]*sx,eye[1]*sy,eye[2]*sx,eye[3]*sy));
  gl.uniform2f(uniforms.confidence,eyes[0][4],eyes[1][4]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  canvas.classList.add('is-ready');stage.classList.add('has-eye-layer');canvas.dataset.eyeLayer='ready';
  canvas.dataset.gazeX=look[0].toFixed(3);canvas.dataset.gazeY=look[1].toFixed(3);canvas.dataset.frameTime=paintTime.toFixed(3);
  if(look.some((v,i)=>v!==target[i]))queue();
 }
 function newFrame(){dirtyTexture=true;queue()}
 video.addEventListener('seeked',newFrame);video.addEventListener('loadeddata',newFrame);
 video.addEventListener('emptied',()=>{dirtyTexture=true;hide()});video.addEventListener('error',hide);
 document.addEventListener('pointermove',event=>{
  if(!enabled||!visible||!track||event.pointerType==='touch'||event.target.closest('#hero-direction'))return;
  const h=hero.getBoundingClientRect();if(event.clientY<h.top||event.clientY>h.bottom){target=[0,0];queue();return}
  const eyes=eyesAt(paintTime),r=canvas.getBoundingClientRect(),fit=Math.max(r.width/track.width,r.height/track.height);
  const position=parseFloat(getComputedStyle(canvas).objectPosition)/100;
  const x=(eyes[0][0]+eyes[1][0])/2,y=(eyes[0][1]+eyes[1][1])/2;
  const screenX=r.left+(r.width-track.width*fit)*(Number.isFinite(position)?position:.62)+x*fit;
  const screenY=r.top+(r.height-track.height*fit)*.5+y*fit;
  target=[clamp((event.clientX-screenX)/Math.max(180,h.width*.32)),clamp((event.clientY-screenY)/Math.max(140,h.height*.32))];queue();
 });
 document.getElementById('hero-direction').addEventListener('input',()=>{target=[0,0];queue()});
 document.addEventListener('portfolio-motion-state',event=>{enabled=Boolean(event.detail?.enabled);look=target=[0,0];if(!enabled)hide();else newFrame()});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0}else queue()},{threshold:0}).observe(hero);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;hide()});
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);hide()});
 fetch('assets/hero/eye-track.json').then(r=>{if(!r.ok)throw Error('track');return r.json()}).then(data=>{track=data;newFrame()}).catch(hide);
})();
