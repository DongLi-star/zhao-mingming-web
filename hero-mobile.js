/* Scroll-driven pose interpolation. Both endpoints contain the complete head and eyes. */
(() => {
  'use strict';
  const hero = document.getElementById('home');
  const poster = document.getElementById('hero-poster');
  const stage = document.querySelector('.felt-video-stage');
  if (!hero || !poster || !stage) return;
  const mobile = matchMedia('(max-width: 760px)');
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-mobile-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;
  const mesh = {"vertices":[0.0,0.0,0.0,0.0,0.3333333,0.0,0.3333333,0.0,0.6666667,0.0,0.6666667,0.0,1.0,0.0,1.0,0.0,1.0,0.3328729,1.0,0.3328729,1.0,0.6657459,1.0,0.6657459,1.0,1.0,1.0,1.0,0.6666667,1.0,0.6666667,1.0,0.3333333,1.0,0.3333333,1.0,0.0,1.0,0.0,1.0,0.0,0.6657459,0.0,0.6657459,0.0,0.3328729,0.0,0.3328729,0.3738318,1.0,0.3738318,1.0,0.4595016,0.9116022,0.4595016,0.9116022,0.5646417,0.8853591,0.5646417,0.8853591,0.6503115,0.961326,0.6503115,0.961326,0.7601246,0.9116022,0.7601246,0.9116022,0.8683801,1.0,0.8683801,1.0,0.3699377,0.6906077,0.3699377,0.6906077,0.3154206,0.4005525,0.3154206,0.4005525,0.4984424,0.1104972,0.5070093,0.179558,0.6931464,0.0248619,0.6931464,0.0483425,0.8489097,0.0759669,0.817757,0.1657459,0.9641745,0.3245856,0.9665109,0.4558011,0.9034268,0.6353591,0.8707165,0.6049724,0.5373832,0.2734807,0.529595,0.3245856,0.6596573,0.1767956,0.6580997,0.288674,0.788162,0.3232044,0.8255452,0.441989,0.5568536,0.3066298,0.5560748,0.4309392,0.661215,0.2486188,0.661215,0.4240331,0.7593458,0.3370166,0.7788162,0.5041436,0.5443925,0.5801105,0.5482866,0.6160221,0.5778816,0.6754144,0.5825545,0.7334254,0.6222741,0.7610497,0.6199377,0.7790055,0.6619938,0.7928177,0.6573209,0.8038674,0.7468847,0.6464088,0.7538941,0.7085635,0.7741433,0.5372928,0.7842679,0.6201657,0.7780374,0.4461326,0.7858255,0.5676796,0.5132399,0.5966851,0.5116822,0.6063536,0.8076324,0.5055249,0.8200935,0.5483425,0.8520249,0.570442,0.8551402,0.6132597,0.8216511,0.6436464,0.8208723,0.691989,0.8146417,0.5732044,0.8161994,0.6256906,0.5794393,0.3218232,0.5786604,0.4723757,0.6105919,0.301105,0.6113707,0.4709945,0.6386293,0.320442,0.652648,0.5055249,0.6721184,0.3287293,0.6970405,0.5041436,0.6993769,0.3425414,0.7242991,0.5165746,0.7235202,0.3687845,0.7609034,0.5441989,0.5506231,0.359116,0.546729,0.5179558,0.5950156,0.3383978,0.5957944,0.5151934,0.6425234,0.371547,0.6471963,0.5483425,0.5981308,0.4585635,0.5989097,0.6325967,0.6495327,0.371547,0.661215,0.5607735,0.661215,0.3825967,0.673676,0.5676796,0.7024922,0.371547,0.7172897,0.5593923,0.7640187,0.410221,0.7764798,0.5980663,0.7095016,0.4917127,0.7188474,0.6712707,0.6183801,0.3798343,0.6176012,0.5856354,0.6035826,0.3798343,0.605919,0.5856354,0.6323988,0.3798343,0.6292835,0.5856354,0.6183801,0.3577348,0.6176012,0.5745856,0.6183801,0.4033149,0.6176012,0.5994475,0.7087227,0.4060773,0.7048287,0.6187845,0.6954829,0.4060773,0.6939252,0.6187845,0.7219626,0.4060773,0.7157321,0.6187845,0.7087227,0.3839779,0.7048287,0.6077348,0.7087227,0.4281768,0.7048287,0.6325967,0.6549844,0.4350829,0.6565421,0.6118785,0.6199377,0.4709945,0.6199377,0.6588398,0.6518692,0.480663,0.6534268,0.6698895,0.6775701,0.4889503,0.6791277,0.6740331,0.6105919,0.5248619,0.6074766,0.6961326,0.6503115,0.5524862,0.6503115,0.7292818,0.6931464,0.5359116,0.6954829,0.7099448,0.652648,0.5801105,0.6518692,0.7458564,0.6495327,0.8149171,0.6495327,0.8370166,0.6160436,0.8356354,0.6160436,0.8425414,0.7017134,0.8425414,0.7017134,0.8453039],"indices":[8,9,10,0,1,11,7,12,13,7,13,14,7,14,15,5,6,17,7,16,17,8,10,18,8,12,18,12,13,18,10,11,19,10,18,19,1,11,19,1,2,20,1,19,20,2,3,21,3,4,22,3,21,22,4,5,23,4,22,23,5,17,24,5,23,24,19,20,25,2,20,26,20,25,26,2,21,26,21,22,26,22,23,27,22,26,27,26,27,30,26,29,30,13,14,32,27,30,37,13,18,38,18,19,38,31,32,38,13,32,38,23,27,39,27,37,39,36,37,39,23,24,40,23,39,40,16,17,41,17,24,41,16,35,41,24,40,41,35,36,41,36,39,42,39,40,42,40,41,42,36,41,42,25,26,44,25,28,44,26,29,44,28,43,44,29,44,45,29,45,46,29,30,47,29,46,47,30,47,48,19,25,49,19,38,49,25,28,49,31,38,49,28,43,49,43,44,50,43,49,50,31,49,52,45,46,53,45,51,53,46,53,54,46,47,55,46,54,55,47,48,55,30,37,56,30,48,56,36,37,56,35,36,57,49,50,59,49,52,59,51,53,60,44,45,61,44,50,61,45,51,61,58,59,61,50,59,61,58,60,61,51,60,61,58,59,62,52,59,62,58,60,62,36,56,65,36,57,65,48,55,65,48,56,65,54,55,66,54,64,66,63,64,66,63,65,66,55,65,66,63,64,67,63,65,67,57,65,67,53,54,68,53,60,68,54,64,68,60,62,68,52,62,69,62,68,69,68,69,70,64,67,71,64,68,71,68,70,71,57,67,71,31,32,72,31,52,72,52,69,72,69,70,72,70,71,73,70,72,73,34,35,74,35,57,74,57,71,74,71,73,74,33,34,75,32,33,75,32,72,75,72,73,75,73,74,75,34,74,75,33,34,76,14,32,77,32,33,77,14,15,77,15,76,77,33,76,77,7,15,78,7,16,78,34,35,78,16,35,78,15,76,78,34,76,78]};
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw Error('pose shader');
    return result;
  }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, `attribute vec2 up;attribute vec2 down;uniform float progress;varying vec2 uvUp;varying vec2 uvDown;void main(){vec2 position=mix(up,down,progress);gl_Position=vec4(position.x*2.0-1.0,1.0-position.y*2.0,0.0,1.0);uvUp=vec2(up.x,1.0-up.y);uvDown=vec2(down.x,1.0-down.y);}`));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `precision highp float;uniform sampler2D imageUp;uniform sampler2D imageDown;uniform float progress;varying vec2 uvUp;varying vec2 uvDown;void main(){vec4 first=texture2D(imageUp,uvUp);vec4 second=texture2D(imageDown,uvDown);float edge=smoothstep(.12,.30,length(first.rgb-second.rgb));float weight=mix(progress,step(.5,progress),edge);gl_FragColor=mix(first,second,weight);}`));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  } catch { return; }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
  ['up', 'down'].forEach((name, index) => {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 16, index * 8);
  });
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
  const textures = [0, 1].map(unit => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
  });
  gl.uniform1i(gl.getUniformLocation(program, 'imageUp'), 0);
  gl.uniform1i(gl.getUniformLocation(program, 'imageDown'), 1);
  const progressUniform = gl.getUniformLocation(program, 'progress');
  const down = new Image(); down.decoding = 'async';
  let enabled = document.body.classList.contains('is-motion-active');
  let visible = true, lost = false, dirty = true, frame = 0;
  let target = Math.max(0, Math.min(1, (Number(hero.dataset.mobilePitch ?? -1) + 1) / 2));
  let progress = target;
  stage.append(canvas);
  function queue() {
    if (!frame && enabled && mobile.matches && visible && !lost) frame = requestAnimationFrame(paint);
  }
  function load() {
    if (enabled && mobile.matches && !down.getAttribute('src')) down.src = 'assets/hero/director-look-down.svg';
  }
  function hide() {
    cancelAnimationFrame(frame); frame = 0; canvas.classList.remove('is-ready');
  }
  function paint() {
    frame = 0;
    if (!enabled || !mobile.matches || !visible || lost || !poster.complete || !poster.naturalWidth || !down.complete || !down.naturalWidth) return;
    if (dirty) {
      canvas.width = 1284; canvas.height = 724; gl.viewport(0, 0, 1284, 724);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      try {
        [poster, down].forEach((image, unit) => {
          gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, textures[unit]);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        });
      } catch { hide(); return; }
      dirty = false;
    }
    progress = Math.abs(target - progress) < .001 ? target : progress + (target - progress) * .24;
    gl.uniform1f(progressUniform, progress);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    canvas.classList.add('is-ready');
    canvas.dataset.poseProgress = progress.toFixed(3);
    canvas.dataset.pose = progress < .05 ? 'up' : progress > .95 ? 'down' : 'transition';
    if (progress !== target) queue();
  }
  function refresh() { dirty = true; load(); queue(); }
  poster.addEventListener('load', refresh); down.addEventListener('load', refresh);
  down.addEventListener('error', hide);
  document.addEventListener('portfolio-hero-look', event => {
    target = Math.max(0, Math.min(1, (Number(event.detail?.pitch) + 1) / 2)); queue();
  });
  document.addEventListener('portfolio-motion-state', event => {
    enabled = Boolean(event.detail?.enabled);
    if (enabled) refresh(); else hide();
  });
  mobile.addEventListener('change', () => { if (mobile.matches) refresh(); else hide(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) queue(); else { cancelAnimationFrame(frame); frame = 0; }
  }, { threshold: 0 }).observe(hero);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; hide(); });
  addEventListener('pagehide', hide);
  addEventListener('pageshow', event => { if (event.persisted) refresh(); });
  refresh();
})();
