// @ts-nocheck
/* eslint-disable */
/**
 * Ported from the supplied standalone HTML page (script type="module").
 * The original is imperative DOM/WebGL code; it is intentionally kept in that
 * shape inside a React effect, with explicit teardown for StrictMode and
 * client-side navigation. three is the repo's local npm dependency.
 */
export async function createHome3DEngine(host: HTMLElement): Promise<() => void> {
  const THREE = await import("three");
  const { RoomEnvironment } = await import(
    "three/addons/environments/RoomEnvironment.js"
  );
  const ac = new AbortController();
  const signal = ac.signal;
  let cancelled = false;
  let raf = 0;
  const timers = new Set();
  const later = (fn, ms) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (!cancelled) fn();
    }, ms);
    timers.add(id);
    return id;
  };
  const cancel = (id) => {
    if (id == null) return;
    window.clearTimeout(id);
    timers.delete(id);
  };
  const on = (target, type, fn, opts) =>
    target.addEventListener(type, fn, { ...(opts || {}), signal });

/* ---------------- helpers ---------------- */
const $=(s,r=host)=>r.querySelector(s), $$=(s,r=host)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, mod=(n,m)=>((n%m)+m)%m, DEG=Math.PI/180;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
const phone=()=>innerWidth<820;
const easeIO=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const sineIO=t=>-(Math.cos(Math.PI*t)-1)/2;
function bezier(x1,y1,x2,y2){
  const A=(a,b)=>1-3*b+3*a,B=(a,b)=>3*b-6*a,C=a=>3*a;
  const calc=(t,a,b)=>((A(a,b)*t+B(a,b))*t+C(a))*t, slope=(t,a,b)=>3*A(a,b)*t*t+2*B(a,b)*t+C(a);
  return x=>{ if(x<=0)return 0; if(x>=1)return 1; let t=x; for(let i=0;i<8;i++){ const s=slope(t,x1,x2); if(Math.abs(s)<1e-6)break; t-=(calc(t,x1,x2)-x)/s; t=clamp(t);} return calc(t,y1,y2); };
}
const glide=bezier(.25,.75,.2,1), entrance=bezier(.16,1,.3,1);
function rng(seed){ let a=seed*9301+49297; return ()=>{ a=(a*1664525+1013904223)%4294967296; return a/4294967296; }; }

/* ---------------- data ---------------- */
const MATS=[
  {name:'Rubber',color:'#111a2b',glow:'rgba(232,113,42,.55)',kind:'ring',tag:'Seals, gaskets, O-rings, cords, sheets & rubber-to-metal bonded components.',explore:'Explore rubber'},
  {name:'Steel',color:'#22364d',glow:'rgba(126,166,208,.55)',kind:'hex',tag:'Stainless & alloy valve bodies, blocks, flanges, bushings & fluid fittings.',explore:'Explore steel'},
  {name:'Aluminium',color:'#4b5968',glow:'rgba(205,214,224,.5)',kind:'chip',tag:'Grade 6061 die moulds, housings, plates & precision machined tooling.',explore:'Explore aluminium'}
];
const SHAPES={
  ring:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="33" fill="none" stroke="#3a3c44" stroke-width="22"/><circle cx="50" cy="50" r="33" fill="none" stroke="#9a9ea8" stroke-width="3" opacity=".55"/><circle cx="50" cy="50" r="44" fill="none" stroke="#d2d5db" stroke-width="2" opacity=".7"/></svg>',
  hex:'<svg viewBox="0 0 100 100"><path fill-rule="evenodd" fill="#cfd4db" d="M50 4L90 27V73L50 96L10 73V27Z M32 50a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z"/><path d="M50 4L90 27V73L50 96L10 73V27Z" fill="none" stroke="#8b929c" stroke-width="3"/><circle cx="50" cy="50" r="18" fill="none" stroke="#8b929c" stroke-width="2.5"/></svg>',
  chip:'<svg viewBox="0 0 100 100"><rect x="14" y="26" width="72" height="48" rx="8" fill="#c3c9d1" stroke="#8d949e" stroke-width="3"/><rect x="26" y="38" width="48" height="24" rx="4" fill="none" stroke="#9aa1aa" stroke-width="2"/><circle cx="21" cy="33" r="3" fill="#8d949e"/><circle cx="79" cy="33" r="3" fill="#8d949e"/><circle cx="21" cy="67" r="3" fill="#8d949e"/><circle cx="79" cy="67" r="3" fill="#8d949e"/></svg>'
};
const STEPS=[
  {eb:'01 / Material intelligence',h:['Less weight.','More possibility.'],c:['Rubber, steel or aluminium.','The right family for the job.']},
  {eb:'02 / Geometry & detail',h:['Every interface','has a purpose.'],c:['Profiles, bores, faces & cavities.','Drawing, sample or sketch.']},
  {eb:'03 / The complete picture',h:['Consider the part.','Define the fit.'],c:['Collar, profile, fastener.','One production part.']},
  {eb:'04 / From your drawing',h:null,c:['Your specification.','Our starting point.']}
];

/* ---------------- DOM ---------------- */
const body=document.body, docRoot=document.documentElement;
const hero=$('#home'), reveal=$('.reveal'), titleEl=$('#title'), countEl=$('#count'), tagEl=$('#tag'), exploreBtn=$('#explore'), arc=$('#arc'), playBtn=$('#play'), autoBtn=$('#auto'), nav=$('.nav')||{classList:{add(){},toggle(){}}}, bitsEl=$('#bits');
const sec2=$('#precision'), inBar=$('#inBar'), inFront=$('#inFront'), frontFrame=$('#frontFrame'), inNumw=$('#inNumw'), inNum=$('#inNum'), inHead=$('#inHead'), inCap=$('#inCap'), inEyebrow=$('#inEyebrow'), inDark=$('.in-dark'), icons=$$('#inIcons button'), stormEl=$('#storm');
const shop=$('#materials'), cardsEl=$('#cards'), cards=$$('.card'), pks=$$('.pk'), quoteSec=$('#quote'), basket=$('#basket'), badge=$('#badge'), chips=$('#chips');
const secC=$('#components'), spotFront=$('#spotFront'), spotStage=$('#spotStage'), spotCard=$('#spotCard');
const scTag=$('#scTag'), scTitle=$('#scTitle'), scCopy=$('#scCopy'), scSpec=$('#scSpec'), scRq=$('#scRq'), spotTicks=$$('#spotTicks button');
const gw=$('#gearsWorld'), g1=$('#gearsWorld .g1'), g2=$('#gearsWorld .g2'), gearVid=$('#gearVid');
const procSec=$('#process'), cmpSec=$('#compare'), procStage=$('#procStage'), cmpStage=$('#cmpStage'), railBtns=$$('#rail button'), railEl=$('#rail');
const procSteps=$$('.step'), catSec=$('#catalog'), catCards=$$('.cat-card');
const progress=$('#scrollProgress'), heroVid=$('#heroVid'), heroGhost=$('.hero-ghost');
{ const items=['Custom rubber','Steel fittings','Aluminium tooling','Pressed & machined in Coimbatore','Drawn to your spec','20+ years on the floor']; const line=items.map(t=>`<span>${t} <b>◦</b></span>`).join('<br>'); $('#mqTrack').innerHTML=line+line; }
if(FINE&&!RM){
  $$('.hcta .btn, #play, .cta').forEach(el=>{
    el.addEventListener('pointermove',e=>{ const r=el.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; el.style.transform=`translate(${x*8}px,${y*6-2}px)`; });
    el.addEventListener('pointerleave',()=>{ el.style.transform=''; });
  });
}
if(heroVid) heroVid.play().catch(()=>{});
const links=$$('#pill a'), hl=$('.hl'), navSecs=$$('section[data-nav]');

/* ---------------- state ---------------- */
let active=0, target=0, pos=-3, tween=null, now=performance.now(), entered=false, heroVis=1;
let vw=innerWidth, vh=innerHeight, u=1, spread=1, cx=0, cy=0, heroH=0;
let auto=!RM, lastInteract=performance.now();
let step=-1, flipFrom=0, flipTo=0, flipT0=0, flipDur=0, flipAngle=0, stepTimer=0, frontVis=false, lastFo='';
let SNAP=['','',''], poke=null, stripScrolled=false, travDamp=null;
function dampPose(a,b,k){ if(!a) return Object.assign({},b); const o={flav:b.flav,sx:b.sx??1,sy:b.sy??1}; for(const key of ['x','y','h','rz','ry','rx','z','op','shadow']) o[key]=lerp(a[key]??0,b[key]??0,k); return o; }
const tf=()=>mod(Math.round(target),3);
const interact=()=>{ lastInteract=performance.now(); };

/* ---------------- GL ---------------- */
const canvas=$('#gl');
let renderer;
try { renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true}); }
catch(err){ return staticFallback(host, on, () => [], ac); }
const detachImages = attachImageFallbacks(host);
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.NoToneMapping; renderer.setClearColor(0x000000,0);
const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
scene.add(new THREE.AmbientLight(0xffffff,.5));
const keyL=new THREE.DirectionalLight(0xffffff,1.15); keyL.position.set(-.6,.9,1.4); scene.add(keyL);
const rimL=new THREE.DirectionalLight(0x9eb6ff,.35); rimL.position.set(1.2,.2,-.8); scene.add(rimL);
const followL=new THREE.PointLight(0xffc38a,1.1,900,2); followL.position.set(0,80,180); scene.add(followL);
const camera=new THREE.PerspectiveCamera(30,1,10,10000);
function resizeGL(){
  vw=innerWidth; vh=innerHeight;
  const D=clamp(1500*Math.min(vw/1440,vh/900),1000,2200);
  camera.position.set(0,0,D); camera.fov=2*Math.atan((vh/2)/D)*180/Math.PI; camera.aspect=vw/vh; camera.near=10; camera.far=4*D; camera.updateProjectionMatrix();
  renderer.setPixelRatio(phone()?Math.min(devicePixelRatio,1.75):Math.min(devicePixelRatio,2));
  renderer.setSize(vw,vh,false); canvas.style.height=vh+'px';
  host.style.setProperty('--k', phone()?Math.min(vw/390,vh/780):Math.min(vw/1440,vh/900));
}
resizeGL(); heroUnit();

/* ---------------- geometry ---------------- */
const GEO={};
{
  GEO.torus=new THREE.TorusGeometry(.36,.125,40,96);
  const disc=new THREE.CylinderGeometry(.44,.44,.035,96); disc.rotateX(Math.PI/2); GEO.disc=disc;
  const ws=new THREE.Shape(); ws.absarc(0,0,.235,0,Math.PI*2,false); const wh=new THREE.Path(); wh.absarc(0,0,.12,0,Math.PI*2,true); ws.holes.push(wh);
  GEO.washer=new THREE.ExtrudeGeometry(ws,{depth:.06,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,curveSegments:64}); GEO.washer.center();
  const R=.46, hs=new THREE.Shape();
  for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3; const x=Math.cos(a)*R, y=Math.sin(a)*R; i?hs.lineTo(x,y):hs.moveTo(x,y); } hs.closePath();
  const hh=new THREE.Path(); hh.absarc(0,0,.19,0,Math.PI*2,true); hs.holes.push(hh);
  GEO.nut=new THREE.ExtrudeGeometry(hs,{depth:.34,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:4,curveSegments:48}); GEO.nut.center();
  const P=[[.18,-.5],[.45,-.5],[.45,-.4],[.32,-.4],[.32,-.12],[.285,-.1],[.285,-.02],[.32,0],[.32,.28],[.37,.3],[.37,.43],[.34,.47],[.18,.47],[.18,-.5]].map(p=>new THREE.Vector2(p[0],p[1]));
  GEO.housing=new THREE.LatheGeometry(P,96);
  GEO.shadow=new THREE.PlaneGeometry(1.25,1.04);
}
function gearGeo(teeth,r0,r1,hole,depth){
  const sh=new THREE.Shape();
  for(let i=0;i<teeth;i++){
    const t=i/teeth*Math.PI*2, dt=Math.PI*2/teeth;
    const p=(r,a)=>[Math.cos(a)*r,Math.sin(a)*r];
    const a=p(r0,t), b=p(r1,t+dt*.2), c=p(r1,t+dt*.42), d=p(r0,t+dt*.62);
    if(i) sh.lineTo(...a); else sh.moveTo(...a);
    sh.lineTo(...b); sh.lineTo(...c); sh.lineTo(...d);
  }
  sh.closePath();
  const h=new THREE.Path(); h.absarc(0,0,hole,0,Math.PI*2,true); sh.holes.push(h);
  const g=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:depth*.1,bevelSize:depth*.06,bevelSegments:1,curveSegments:2});
  g.center(); return g;
}
const shadowTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d'); const g=x.createRadialGradient(128,128,8,128,128,128); g.addColorStop(0,'rgba(0,0,0,.62)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,256,256); return new THREE.CanvasTexture(c); })();
const matRubber=()=>new THREE.MeshPhysicalMaterial({color:0x1e1f24,roughness:.7,metalness:0,clearcoat:.35,clearcoatRoughness:.45,envMapIntensity:.7});
const matSteel=()=>new THREE.MeshPhysicalMaterial({color:0xd9dde2,roughness:.26,metalness:1,envMapIntensity:1});
const matAlu=()=>new THREE.MeshPhysicalMaterial({color:0xc8cdd3,roughness:.4,metalness:.95,envMapIntensity:.9,side:THREE.DoubleSide});
function makeProduct(i){
  const g=new THREE.Group(), inner=new THREE.Group(); g.add(inner); const meshes=[];
  if(i===0){ const t=new THREE.Mesh(GEO.torus,matRubber()); const w=new THREE.Mesh(GEO.washer,matSteel()); const d=new THREE.Mesh(GEO.disc,matSteel()); d.position.z=-.15; inner.add(t,w,d); inner.rotation.set(-18*DEG,0,0); meshes.push(t,w,d); }
  else if(i===1){ const n=new THREE.Mesh(GEO.nut,matSteel()); inner.add(n); inner.rotation.set(-22*DEG,0,12*DEG); meshes.push(n); }
  else { const a=new THREE.Mesh(GEO.housing,matAlu()); inner.add(a); inner.scale.setScalar(.82); inner.rotation.set(-40*DEG,0,18*DEG); meshes.push(a); }
  g.userData.meshes=meshes; return g;
}
function makeSlot(){
  const g=new THREE.Group(); const vars=[0,1,2].map(i=>{ const p=makeProduct(i); p.visible=false; g.add(p); return p; });
  const sh=new THREE.Mesh(GEO.shadow,new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:.5})); sh.renderOrder=-1; sh.visible=false;
  g.visible=false; g.rotation.order='ZYX'; scene.add(g,sh);
  return {g,vars,sh,flav:-1,op:-1,hit:[],j:0};
}
function hideSlot(s){ s.g.visible=false; s.sh.visible=false; }
function placeSlot(s,st){
  const vis=st.op>.01; s.g.visible=vis; s.sh.visible=vis&&(st.shadow??1)>.01; if(!vis) return;
  if(s.flav!==st.flav){ s.vars.forEach((v,i)=>v.visible=i===st.flav); s.flav=st.flav; s.hit=s.vars[st.flav].userData.meshes; s.op=-1; }
  if(s.op!==st.op){ s.hit.forEach(m=>{ m.material.opacity=st.op; m.material.transparent=st.op<.999; }); s.op=st.op; }
  const h=st.h; s.g.position.set(st.x-vw/2,vh/2-st.y,st.z||0); s.g.scale.set(h*(st.sx||1),h*(st.sy||1),h);
  s.g.rotation.set((st.rx||0)*DEG,(st.ry||0)*DEG,-(st.rz||0)*DEG);
  const inner=s.vars[s.flav]; if(inner&&inner.children[0]) inner.children[0].rotation.y=now*0.00045;
  s.sh.position.set(s.g.position.x,s.g.position.y-.05*h,(st.z||0)-.32*h); s.sh.rotation.set(0,0,-(st.rz||0)*DEG);
  s.sh.scale.set(h*Math.max(.3,Math.abs(Math.cos((st.ry||0)*DEG))),h,1); s.sh.material.opacity=.5*st.op*(st.shadow??1);
}
const POOL=7, pool=[]; for(let i=0;i<POOL;i++) pool.push(makeSlot());
const trav=makeSlot(), cardBars=[makeSlot(),makeSlot(),makeSlot()];
const spotSlots=[makeSlot(),makeSlot(),makeSlot()];
const gearGroup=new THREE.Group(); gearGroup.visible=false; scene.add(gearGroup);
const GEARS=[
  {teeth:16,r0:.3,r1:.46,hole:.12,d:.07,col:0x9aa3ad,x:.10,y:.30,s:380,spin:1.15,rx:.55},
  {teeth:12,r0:.28,r1:.44,hole:.1,d:.09,col:0xb7bec6,x:.90,y:.24,s:300,spin:-1.35,rx:.4},
  {teeth:20,r0:.32,r1:.48,hole:.14,d:.055,col:0x7d868f,x:.86,y:.78,s:460,spin:.72,rx:.65},
  {teeth:10,r0:.26,r1:.4,hole:.1,d:.11,col:0xc5ccd3,x:.16,y:.82,s:240,spin:-1.7,rx:.35},
  {teeth:14,r0:.24,r1:.38,hole:.09,d:.05,col:0x8e969f,x:.5,y:.48,s:200,spin:-2.2,rx:.9},
  {teeth:9,r0:.22,r1:.34,hole:.08,d:.08,col:0xd0d5db,x:.72,y:.58,s:160,spin:1.8,rx:.25}
].map(d=>{
  const m=new THREE.Mesh(gearGeo(d.teeth,d.r0,d.r1,d.hole,d.d), new THREE.MeshPhysicalMaterial({color:d.col,roughness:.38,metalness:.95,envMapIntensity:.75,transparent:true,opacity:.55}));
  gearGroup.add(m); return {...d,m};
});

/* ---------------- snapshots (2D images of each part) ---------------- */
function snapshotAll(){
  const sc=new THREE.Scene(); sc.environment=scene.environment; sc.add(new THREE.AmbientLight(0xffffff,.55)); const l=new THREE.DirectionalLight(0xffffff,1.1); l.position.set(-.6,.9,1.4); sc.add(l);
  const size=Math.min(vw,vh)*.6, pr=renderer.getPixelRatio(), out=[];
  for(let i=0;i<3;i++){
    const p=makeProduct(i); p.scale.setScalar(size*.76); p.rotation.order='ZYX'; p.rotation.set(0,22*DEG,0); sc.add(p);
    renderer.render(sc,camera);
    const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
    try{ x.drawImage(renderer.domElement,(vw/2-size/2)*pr,(vh/2-size/2)*pr,size*pr,size*pr,0,0,512,512); out.push(c.toDataURL('image/png')); }catch(e){ out.push(''); }
    sc.remove(p);
  }
  renderer.clear(); return out;
}
SNAP=snapshotAll();
$$('.pimg').forEach(im=>{ im.src=SNAP[+im.dataset.p]; });

/* ---------------- arc ---------------- */
const SLOT=[[0,0,360,0,0],[330,22,262,4,16],[600,44,222,8,26],[840,80,192,12,34],[1060,118,170,15,40]];
function arcState(k){
  const a=Math.abs(k), s=k<0?-1:1, i=Math.min(3,Math.floor(a)), f=Math.min(a,4)-i, A=SLOT[i], B=SLOT[Math.min(4,i+1)];
  const L=p=>lerp(A[p],B[p],f);
  const op=a<=2.3?1:a>=2.9?0:1-(a-2.3)/.6;
  return {x:cx+s*L(0)*u*spread,y:cy+L(1)*u,h:L(2)*u,rz:s*L(3),ry:s*L(4),rx:0,z:-a*34*u,op,shadow:1,sx:1,sy:1};
}
function idle(st,j){ if(RM) return st; const b=Math.sin(now/4600*2*Math.PI+1.37*j); st.y-=(.5*b+.5)*9*u; st.rz+=.4*b; return st; }
function mix(a,b,t){ const o={}; for(const k of ['x','y','h','rz','ry','rx','z','op','shadow']) o[k]=lerp(a[k]??0,b[k]??0,t); o.sx=1; o.sy=1; return o; }
function heroUnit(){ heroH=hero.offsetHeight; if(phone()){ u=Math.min(vw/560,heroH/980); spread=1.02; } else { u=Math.min(vw/1440,vh/900); spread=1; } }

/* ---------------- hero text ---------------- */
const mctx=document.createElement('canvas').getContext('2d');
function fitTitle(){
  const name=MATS[active].name.toUpperCase(); mctx.font='700 100px "Barlow Condensed"';
  if(phone()){ const w=Math.max(1,...name.split(' ').map(x=>mctx.measureText(x).width)); const base=clamp(innerWidth*.125,40,64); titleEl.style.fontSize=Math.min(base,(innerWidth-36)*100/w)+'px'; }
  else { const w=Math.max(1,mctx.measureText(name).width); titleEl.style.fontSize=Math.min(88*u,760*u*100/w)+'px'; }
}
function letterHTML(name){ return name.split(' ').map(w=>`<span class="wd">${[...w].map(ch=>`<span class="ltr">${ch}</span>`).join('<br>')}</span>`).join('<br>'); }
function setTitle(name,dir=1,instant=false){
  const olds=$$('.tl',titleEl); const nl=document.createElement('span'); nl.className='tl'; nl.innerHTML=letterHTML(name); titleEl.appendChild(nl); fitTitle();
  if(instant||RM){ olds.forEach(o=>o.remove()); return; }
  olds.forEach(o=>{ o.classList.add('old'); $$('.ltr',o).forEach((s,i)=>{ s.style.transition=`transform .3s cubic-bezier(.45,0,.75,.3) ${i*11}ms, opacity .3s cubic-bezier(.45,0,.75,.3) ${i*11}ms`; s.style.transform=`translateY(${-110*dir}%)`; s.style.opacity='0'; }); later(()=>o.remove(),700); });
  const ls=$$('.ltr',nl); ls.forEach(s=>{ s.style.transform=`translateY(${110*dir}%)`; s.style.opacity='0'; }); void nl.offsetWidth;
  ls.forEach((s,i)=>{ s.style.transition=`transform .62s cubic-bezier(.22,1,.36,1) ${120+22*i}ms, opacity .62s cubic-bezier(.22,1,.36,1) ${120+22*i}ms`; s.style.transform='none'; s.style.opacity='1'; });
}
function softSwap(el,apply,out=220,hold=60,inn=380){
  if(RM){ apply(); return; } cancel(el._sw);
  const eo='cubic-bezier(.5,0,.75,0)', ei='cubic-bezier(.22,1,.36,1)';
  el.style.transition=`translate ${out}ms ${eo}, opacity ${out}ms ${eo}`; el.style.translate='0 -10px'; el.style.opacity='0';
  el._sw=later(()=>{ apply(); el.style.transition='none'; el.style.translate='0 14px'; void el.offsetWidth; el.style.transition=`translate ${inn}ms ${ei}, opacity ${inn}ms ${ei}`; el.style.translate='0 0'; el.style.opacity='1'; },out+hold);
}
/* colour reveal */
let revealAnim=null;
function startReveal(color){
  if(revealAnim) finishReveal();
  reveal.style.setProperty('--rv',color); reveal.style.clipPath='none';
  const hr=hero.getBoundingClientRect(); const ax=hr.width/2, ay=phone()?hr.height*.4:hr.height/2-78*u;
  const R=1.45*Math.hypot(Math.max(ax,hr.width-ax),Math.max(ay,hr.height-ay));
  revealAnim={t0:now,color,ax,ay,R};
}
function tickReveal(){
  if(!revealAnim) return; const t=clamp((now-revealAnim.t0)/420); const r=revealAnim.R*glide(t); const f=Math.max(60,.35*r);
  const m=`radial-gradient(circle at ${revealAnim.ax}px ${revealAnim.ay}px, #000 ${Math.max(0,r-f)}px, transparent ${r}px)`;
  reveal.style.webkitMaskImage=m; reveal.style.maskImage=m; if(t>=1) finishReveal();
}
function finishReveal(){ host.style.setProperty('--flav',revealAnim.color); reveal.style.setProperty('--rv','transparent'); reveal.style.webkitMaskImage=''; reveal.style.maskImage=''; reveal.style.clipPath=''; revealAnim=null; }

function changeFlavour(f,dir){
  if(f===active) return; const m=MATS[f]; active=f;
  if(RM) host.style.setProperty('--flav',m.color); else startReveal(m.color);
  setTitle(m.name.toUpperCase(),dir);
  softSwap(countEl,()=>countEl.textContent='0'+(f+1));
  softSwap(tagEl,()=>tagEl.textContent=m.tag);
  exploreBtn.querySelector('span').textContent=m.explore;
  cards.forEach((c,i)=>c.classList.toggle('live',i===f));
  if(step===3) softSwap(inHead,()=>applyHead(3),240,40,460);
}

/* ---------------- carousel ---------------- */
function goTo(j){
  const prev=target; target=j;
  if(RM){ pos=j; const f=mod(j,3); if(f!==active) changeFlavour(f,j>prev?1:-1); interact(); return; }
  const dist=Math.abs(j-pos);
  tween={from:pos,to:j,t0:now,dur:650+160*Math.max(0,dist-1),ease:glide,fired:false,phase:()=>{ const f=mod(j,3); if(f!==active) changeFlavour(f,j>prev?1:-1); }};
  interact();
}
function tickTween(){
  if(!tween) return; const t=clamp((now-tween.t0)/tween.dur); pos=lerp(tween.from,tween.to,tween.ease(t));
  if(!tween.fired&&t>=.12&&tween.phase){ tween.fired=true; tween.phase(); }
  if(t>=1){ pos=tween.to; const ph=!tween.fired&&tween.phase; tween=null; if(ph) ph(); }
}
/* raycast pick */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function pick(x,y){
  ndc.set(x/vw*2-1,-(y/vh)*2+1); ray.setFromCamera(ndc,camera); const list=[], map=new Map();
  for(const s of [...pool,trav]){ if(!s.g.visible) continue; for(const m of s.hit){ list.push(m); map.set(m,s); } }
  const hits=ray.intersectObjects(list,false); return hits.length?map.get(hits[0].object):null;
}
/* drag */
let drag=null;
arc.addEventListener('pointerdown',e=>{ if(e.button!==0) return; drag={x0:e.clientX,pos0:pos,active:false,lastX:e.clientX,lastT:e.timeStamp,v:0,id:e.pointerId}; });
arc.addEventListener('pointermove',e=>{
  if(drag){
    const dx=e.clientX-drag.x0;
    if(!drag.active){ if(Math.abs(dx)>6){ drag.active=true; tween=null; try{arc.setPointerCapture(drag.id);}catch(_){} body.classList.add('dragging'); } else return; }
    const slotPx=330*u*spread; pos=drag.pos0-dx/slotPx;
    const dt=Math.max(1,e.timeStamp-drag.lastT); const inst=-(e.clientX-drag.lastX)/slotPx/dt; drag.v=lerp(drag.v,inst,.4); drag.lastX=e.clientX; drag.lastT=e.timeStamp; interact();
  } else if(FINE&&e.pointerType==='mouse'){ arc.style.cursor=pick(e.clientX,e.clientY)?'pointer':'grab'; }
});
function release(e,cancel){
  if(!drag) return; const d=drag; drag=null; body.classList.remove('dragging');
  if(d.active){
    if(cancel&&Math.abs(pos-Math.round(pos))<.02){ const prev=target; target=Math.round(pos); pos=target; const f0=mod(target,3); if(f0!==active) changeFlavour(f0,target>prev?1:-1); return; }
    const to=Math.round(pos+clamp(d.v*220,-2,2)); const prev=target; target=to;
    const dur=Math.max(380,650*Math.min(1,Math.abs(to-pos)+.35));
    tween={from:pos,to,t0:now,dur,ease:glide,fired:true,phase:null};
    const f=mod(to,3); if(f!==active) changeFlavour(f,to>prev?1:-1); interact();
  } else if(!cancel){
    const s=pick(e.clientX,e.clientY); if(s){ if(s===trav) poke={t0:now,key:'trav'}; else goTo(s.j); }
  }
}
arc.addEventListener('pointerup',e=>release(e,false));
arc.addEventListener('pointercancel',e=>release(e,true));
arc.addEventListener('lostpointercapture',()=>{ if(drag&&drag.active) release(null,true); });
playBtn.addEventListener('click',()=>goTo(target+1));
on(window, 'keydown',e=>{ smooth.active=false; if(heroVis<.5||e.altKey||e.metaKey||e.ctrlKey) return; if(e.key==='ArrowRight') goTo(target+1); else if(e.key==='ArrowLeft') goTo(target-1); });
autoBtn.addEventListener('click',()=>{ auto=!auto; autoBtn.setAttribute('aria-pressed',String(auto)); interact(); });
on(document, 'visibilitychange', interact);

/* ---------------- floating bits ---------------- */
const BITS=[[.12,.20,120,-18,'ring'],[.86,.18,96,22,'hex'],[.07,.74,84,12,'chip'],[.655,.15,78,-10,'hex'],[.205,.885,70,30,'ring']];
const bitEls=BITS.map((b,i)=>{ const el=document.createElement('div'); el.className='bit'; el.innerHTML=SHAPES[b[4]]; el.style.left=b[0]*100+'%'; el.style.top=b[1]*100+'%'; el.style.transform=`translate(-50%,-50%) rotate(${b[3]}deg)`; bitsEl.appendChild(el); return el; });
function sizeBits(){ const ph=phone(); bitEls.forEach((el,i)=>{ const s=BITS[i][2]*u*(ph?1.3:1); el.style.width=el.style.height=s+'px'; el.style.display=(ph&&(i===1||i===3||i===4))?'none':'block'; }); }
sizeBits();
function startBits(){
  if(RM){ bitEls.forEach(el=>el.style.opacity='.55'); return; }
  bitEls.forEach((el,i)=>{
    el.animate([{opacity:0},{opacity:.6}],{duration:900,delay:300+90*i,fill:'forwards',easing:'ease-out'});
    const sgn=i%2?-1:1;
    el.animate([{transform:'translate(0,0) rotate(0deg)'},{transform:`translate(${sgn*(12+i%3)}px,${-(22+3*i)}px) rotate(${sgn*(10+i%3)}deg)`},{transform:'translate(0,0) rotate(0deg)'}],{duration:7000+900*i,iterations:Infinity,easing:'ease-in-out',composite:'add'});
  });
}

/* ---------------- section 2 ---------------- */
function applyHead(s){ if(s<3){ inHead.innerHTML=STEPS[s].h.map(l=>`<span>${l}</span>`).join('<br>'); inHead.classList.remove('sm'); } else { const n=MATS[active].name.toUpperCase(); inHead.innerHTML=`<span>${n}</span>`; inHead.classList.toggle('sm',n.length>9); } }
function applyStep(s){ inEyebrow.textContent=STEPS[s].eb; applyHead(s); inCap.innerHTML=STEPS[s].c.join('<br>'); inNum.textContent='0'+(s+1); icons.forEach((b,i)=>b.classList.toggle('on',i===s)); }
function setStep(s,init){
  step=s; const ang=s===3?720:s*180; flipFrom=flipAngle; flipTo=ang; const halves=clamp(Math.abs(ang-flipAngle)/180,.4,2); flipDur=(init||RM)?0:720*halves; flipT0=now;
  cancel(stepTimer);
  if(init||RM){ flipAngle=ang; applyStep(s); return; }
  stepTimer=later(()=>{ softSwap(inHead,()=>applyStep(s),240,40,460); softSwap(inNum,()=>{},240,40,460); softSwap(inCap,()=>{},240,40,460); softSwap(inEyebrow,()=>{},240,40,460); },.38*Math.min(flipDur,720));
}
icons.forEach((b,i)=>b.addEventListener('click',()=>{ smooth.active=false; const sr=sec2.getBoundingClientRect(); const y=scrollY+sr.top+(.19*i+.095)*(sr.height-vh); scrollTo({top:y,behavior:RM?'auto':'smooth'}); }));
/* storm */
const PCS=[]; { const r=rng(7); for(let i=0;i<20;i++){ const el=document.createElement('div'); el.className='pc'; stormEl.appendChild(el); PCS.push({el,a:r()*Math.PI*2,ph:i/20+r()*.03,spin:(r()<.5?-1:1)*360,size:.7+r()*.7,kind:null}); } }
let stormArmed=true, stormOn=false;
function sizeStorm(){ const s=.085*Math.min(vw,vh); PCS.forEach(p=>{ p.el.style.width=p.el.style.height=s+'px'; }); }
sizeStorm();
function armStorm(){ const r=rng(99); const kinds=['ring','hex','chip']; PCS.forEach(p=>{ const k=r()<.7?MATS[tf()].kind:kinds[Math.floor(r()*3)]; if(p.kind!==k){ p.kind=k; p.el.innerHTML=SHAPES[k]; } }); }
function tickStorm(q){
  if(q<=0||q>=1||RM){ if(stormOn){ PCS.forEach(p=>p.el.style.opacity='0'); stormOn=false; } if(q<=0) stormArmed=true; return; }
  if(stormArmed){ armStorm(); stormArmed=false; } stormOn=true;
  const R=.55*Math.hypot(vw,vh), g1=clamp(5*q)*clamp(6*(1-q));
  for(const p of PCS){
    const s=clamp((q-.45*p.ph)/.55); if(s<=0||s>=1){ p.el.style.opacity='0'; continue; }
    const rad=(.06+Math.pow(s,1.5)*.95)*R; const x=Math.cos(p.a)*rad, y=Math.sin(p.a)*rad*.8;
    p.el.style.transform=`translate(-50%,-50%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(p.spin*s).toFixed(1)}deg) scale(${((.2+1.7*s)*p.size).toFixed(3)})`;
    p.el.style.opacity=(Math.sin(Math.PI*s)*g1).toFixed(3);
  }
}

/* ---------------- cards ---------------- */
function pokeScale(key){
  if(!poke||poke.key!==key) return [1,1]; const t=(now-poke.t0)/500; if(t>=1){ poke=null; return [1,1]; }
  const K=[[0,1,1],[.3,1.06,.93],[.6,.97,1.04],[1,1,1]];
  for(let i=0;i<3;i++){ if(t<=K[i+1][0]){ const f=(t-K[i][0])/(K[i+1][0]-K[i][0]); return [lerp(K[i][1],K[i+1][1],f),lerp(K[i][2],K[i+1][2],f)]; } } return [1,1];
}
cards.forEach((c,i)=>{
  if(FINE){
    c.addEventListener('pointermove',e=>{ const r=c.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; c._tx=x; c._ty=y; if(!c.classList.contains('tilt')) c.classList.add('tilt'); c.style.transform=`translateY(-8px) rotateX(${(-y*12).toFixed(2)}deg) rotateY(${(x*12).toFixed(2)}deg)`; });
    c.addEventListener('pointerleave',()=>{ c._tx=0; c._ty=0; c.classList.remove('tilt'); c.style.transform=''; });
  }
  c.addEventListener('pointerdown',()=>c.classList.add('press'));
  on(window, 'pointerup',()=>c.classList.remove('press'));
  $('.pk',c).addEventListener('click',()=>{ poke={t0:now,key:i===tf()?'trav':'card'+i}; });
  $('.add',c).addEventListener('click',()=>{ const r=$('.pk',c).getBoundingClientRect(); flyOne(r,SNAP[i]).then(()=>land(MATS[i].name+' components')); });
});
function centerCard(i){ const c=cards[i]; cardsEl.scrollTo({left:c.offsetLeft-(cardsEl.clientWidth-c.offsetWidth)/2,behavior:'smooth'}); }

/* ---------------- enquiry / basket ---------------- */
const enquiry=[];
function renderEnq(){
  if(badge){ badge.textContent=enquiry.length; badge.classList.toggle('show',enquiry.length>0); }
  chips.innerHTML=enquiry.length?enquiry.map((l,i)=>`<span class="qc">${l}<button type="button" data-i="${i}" aria-label="Remove ${l}">×</button></span>`).join('<br>'):'<span class="qc empty">Nothing added yet — use the + buttons or the pack on the left.</span>';
}
chips.addEventListener('click',e=>{ const b=e.target.closest('button[data-i]'); if(!b) return; enquiry.splice(+b.dataset.i,1); renderEnq(); });
function bump(){ if(RM||!basket) return; basket.animate([{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:320,easing:'ease-out'}); }
function land(label){ enquiry.push(label); renderEnq(); if(!RM&&badge) badge.animate([{transform:'scale(1.5)'},{transform:'scale(1)'}],{duration:350,easing:'cubic-bezier(.34,1.56,.64,1)'}); }
function flyOne(rect,src,opts={}){
  return new Promise(res=>{
    if(RM||!basket||!rect||rect.width<2||!src){ bump(); res(); return; }
    const img=document.createElement('img'); img.src=src; img.className='flyer'+(opts.photo?' photo':''); Object.assign(img.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'}); host.appendChild(img);
    const b=basket.getBoundingClientRect(); const dx=(b.left+b.width/2)-(rect.left+rect.width/2), dy=(b.top+b.height/2)-(rect.top+rect.height/2);
    const k=Math.min(.2,30/rect.height), lift=Math.min(160,.35*Math.abs(dy)+60);
    const a=img.animate([
      {transform:'translate(0,0) scale(1) rotate(0deg)',opacity:1},
      {transform:`translate(${dx*.4}px,${dy*.4-lift}px) scale(${.45+k}) rotate(-10deg)`,opacity:1,offset:.45},
      {transform:`translate(${dx}px,${dy}px) scale(${k}) rotate(-18deg)`,opacity:.15}
    ],{duration:900,delay:opts.delay||0,easing:'cubic-bezier(.5,0,.2,1)',fill:'forwards'});
    a.onfinish=()=>{ img.remove(); bump(); res(); };
  });
}
if(basket) basket.addEventListener('click',()=>{ smooth.active=false; scrollTo({top:scrollY+quoteSec.getBoundingClientRect().top,behavior:RM?'auto':'smooth'}); });
const SPOT=[
  {flav:0,tag:'Rubber · Bonded seals',title:'Metal-to-Viton Bonded Seals',copy:'Metal retaining ring bonded to a Viton sealing lip for dependable high-pressure hydraulic, port and fastener sealing.',spec:'FKM · Stainless',add:'Metal-to-Viton bonded seals'},
  {flav:1,tag:'Steel · Flanges & fittings',title:'Stainless Valve Bodies, Blocks & Fluid Fittings',copy:'Machined fluid blocks, adapters, needle valves and fittings using stainless steel\'s chromium-oxide corrosion resistance.',spec:'SS304 · SS316',add:'Stainless valve bodies & fittings'},
  {flav:2,tag:'Aluminium · Die moulds & tooling',title:'Precision Aluminium Die Moulds',copy:'Custom-engineered aluminium die and production tooling machined accurately from customer CAD models or part samples.',spec:'6061 · Tooling plate',add:'Precision aluminium die moulds'}
];
let spotI=0, spotVis=false, mx=0, my=0, mxT=0, myT=0;
function fillSpot(i){
  const s=SPOT[i]; scTag.textContent=s.tag; scTitle.textContent=s.title; scCopy.textContent=s.copy; scSpec.textContent=s.spec;
  scRq.dataset.add=s.add; scRq.dataset.m=s.flav;
  spotTicks.forEach((b,k)=>b.classList.toggle('on',k===i));
}
function setSpot(i){
  if(i===spotI) return; const dir=i>spotI?1:-1; spotI=i;
  if(RM){ fillSpot(i); return; }
  spotCard.style.transform=`rotateY(${dir*28}deg) translateX(${dir*18}px)`; spotCard.style.opacity='.35';
  later(()=>{ fillSpot(i); spotCard.style.transform='none'; spotCard.style.opacity='1'; },220);
}
spotTicks.forEach(b=>b.addEventListener('click',()=>{ smooth.active=false; const i=+b.dataset.i; const r=secC.getBoundingClientRect(); const y=scrollY+r.top+(i/2)*(r.height-vh); scrollTo({top:y,behavior:RM?'auto':'smooth'}); }));
scRq.addEventListener('click',()=>{ const flav=+scRq.dataset.m; const r=spotCard.getBoundingClientRect(); flyOne({left:r.left+r.width*.3,top:r.top+40,width:120,height:120},SNAP[flav]).then(()=>land(scRq.dataset.add)); });
catCards.forEach(c=>{
  if(FINE){
    c.addEventListener('pointermove',e=>{ const r=c.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; c._tx=x; c._ty=y; if(!c.classList.contains('tilt')) c.classList.add('tilt'); c.style.transform=`translateY(-10px) rotateX(${(-y*10).toFixed(2)}deg) rotateY(${(x*12).toFixed(2)}deg)`; });
    c.addEventListener('pointerleave',()=>{ c._tx=0; c._ty=0; c.classList.remove('tilt'); c.style.transform=''; });
  }
});
$$('.cat-plus, .cat .rq').forEach(b=>b.addEventListener('click',()=>{ const card=b.closest('.cat-card'); const im=$('img',card); flyOne(im.getBoundingClientRect(),im.currentSrc||im.src,{photo:true}).then(()=>land(b.dataset.add)); }));
on(window, 'pointermove',e=>{ mxT=e.clientX/vw-.5; myT=e.clientY/vh-.5; },{passive:true});
$$('.tadd').forEach(b=>b.addEventListener('click',()=>{ bump(); land(b.dataset.add); b.animate([{transform:'scale(1)'},{transform:'scale(1.3)'},{transform:'scale(1)'}],{duration:300}); }));

/* ---------------- builder (enquiry pack) ---------------- */
const slots=$$('.slot'), thumbs=$$('.thumb'), sendBtn=$('#send'), glow=$('#glow');
let pack=[null,null,null], touched=false, sending=false;
function renderPack(){
  slots.forEach((s,i)=>{ const v=pack[i]; s.classList.toggle('full',v!==null); if(v!==null){ $('.sbar',s).src=SNAP[v]; $('.sname',s).textContent=MATS[v].name; } });
  thumbs.forEach((t,i)=>{ const n=pack.filter(x=>x===i).length; t.classList.toggle('in',n>0); $('.tk',t).textContent=n>1?n:'✓'; });
  const n=pack.filter(x=>x!==null).length;
  if(!sending){ sendBtn.disabled=n===0; $('.sl',sendBtn).textContent=n===0?'Pick a material':`Add to enquiry · ${n} material${n>1?'s':''}`; }
}
function glowTo(i){ glow.style.setProperty('--g',MATS[i].glow); if(!RM) glow.animate([{opacity:.55},{opacity:1}],{duration:600,easing:'ease-out'}); }
function addPack(i,silent){
  if(!silent) touched=true;
  if(pack.includes(i)){ pack[pack.indexOf(i)]=null; }
  else { const idx=pack.indexOf(null); if(idx<0) return; pack[idx]=i; glowTo(i); }
  renderPack();
}
thumbs.forEach(t=>t.addEventListener('click',()=>addPack(+t.dataset.p)));
slots.forEach((s,i)=>$('.sx',s).addEventListener('click',()=>{ touched=true; pack[i]=null; renderPack(); }));
sendBtn.addEventListener('click',()=>{
  if(sendBtn.disabled||sending) return; sending=true; touched=true;
  const items=[]; slots.forEach((s,i)=>{ if(pack[i]!==null) items.push({rect:$('.sbar',s).getBoundingClientRect(),src:SNAP[pack[i]],m:pack[i]}); });
  items.forEach((it,i)=>flyOne(it.rect,it.src,{delay:120*i}).then(()=>land(MATS[it.m].name+' components')));
  later(()=>{ pack=[null,null,null]; sendBtn.classList.add('ok'); sendBtn.disabled=true; $('.sl',sendBtn).textContent='Added to enquiry'; renderPack(); later(()=>{ sendBtn.classList.remove('ok'); sending=false; renderPack(); },1600); },60);
});
renderPack(); renderEnq();

/* ---------------- compare filter + form ---------------- */
$('#filters').addEventListener('click',e=>{ const b=e.target.closest('.fchip'); if(!b) return; $$('.fchip').forEach(x=>x.classList.toggle('on',x===b)); const f=b.dataset.f; $$('#tbl tbody tr').forEach(tr=>tr.classList.toggle('hide',f!=='all'&&tr.dataset.m!==f)); });
const detachForm = attachRealQuoteForm(host, () => enquiry.slice());
/* ---------------- reveals ---------------- */
const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.intersectionRatio>=.18||(en.isIntersecting&&en.boundingClientRect.height>innerHeight*.8)){ en.target.classList.add('on'); io.unobserve(en.target); } }),{threshold:[0,.18,.4]});
$$('.rvw').forEach(el=>io.observe(el));
const io2=new IntersectionObserver(es=>es.forEach(en=>{ if(en.intersectionRatio>=.3||(en.isIntersecting&&en.boundingClientRect.height>innerHeight)){ io2.disconnect(); if(!touched){ [0,1,2].forEach((o,i)=>later(()=>{ if(touched) return; const m=mod(tf()+o,3); pack[i]=m; glowTo(m); renderPack(); },[250,410,570][i])); } } }),{threshold:[0,.3]});
io2.observe(quoteSec);

/* ---------------- nav ---------------- */
let curSec=null;
function placeHL(){ const a=links.find(x=>x.classList.contains('on')); if(!a) return; hl.style.left=a.offsetLeft+'px'; hl.style.width=a.offsetWidth+'px'; }
function tickNav(){ let act=null; for(const s of navSecs){ if(s.getBoundingClientRect().top<=vh*.35) act=s; } if(act&&act!==curSec){ curSec=act; const id='#'+act.id; links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')===id)); nav.classList.toggle('light',act.dataset.nav==='light'); railEl?.classList.toggle('ink',act.dataset.nav==='light'); railBtns.forEach(b=>b.classList.toggle('on',b.dataset.h===id)); placeHL(); } }
railBtns.forEach(b=>b.addEventListener('click',()=>{ const el=$(b.dataset.h); if(!el) return; smooth.active=false; scrollTo({top:scrollY+el.getBoundingClientRect().top,behavior:RM?'auto':'smooth'}); }));
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{ const id=a.getAttribute('href'); if(id.length<2) return; const el=$(id); if(!el) return; e.preventDefault(); smooth.active=false; scrollTo({top:scrollY+el.getBoundingClientRect().top,behavior:RM?'auto':'smooth'}); }));

/* ---------------- smooth wheel scrolling ---------------- */
const smooth={active:false,cur:0,target:0};
if(FINE&&!RM){
  on(window, 'wheel',e=>{
    if(e.ctrlKey||body.classList.contains('locked')||Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
    e.preventDefault(); let d=e.deltaY; if(e.deltaMode===1) d*=16; else if(e.deltaMode===2) d*=vh;
    if(!smooth.active){ smooth.active=true; smooth.cur=smooth.target=scrollY; }
    smooth.target=clamp(smooth.target+d,0,docRoot.scrollHeight-vh);
  },{passive:false});
  on(window, 'pointerdown',()=>{ smooth.active=false; },{capture:true});
}
function tickSmooth(dt){ if(!smooth.active) return; smooth.cur+=(smooth.target-smooth.cur)*(1-Math.exp(-dt/120)); if(Math.abs(smooth.target-smooth.cur)<.5){ smooth.cur=smooth.target; } scrollTo(0,smooth.cur); if(smooth.cur===smooth.target) smooth.active=false; }

/* ---------------- intro ---------------- */
const intro=$('#intro'), vid=$('#ivid');
function enterHero(){
  if(entered) return; entered=true; intro.classList.add('out'); later(()=>intro.remove(),600); body.classList.remove('locked'); nav.classList.add('in'); hero.classList.add('in');
  if(RM) pos=0; else tween={from:-3,to:0,t0:performance.now(),dur:1700,ease:entrance,fired:true,phase:null};
  startBits(); interact(); placeHL();
}
function runIntro(){
  if(RM){ enterHero(); return; }
  let started=false, logoShown=false;
  const showLogo=()=>{ if(logoShown||entered) return; logoShown=true; try{vid.pause();}catch(_){} intro.classList.add('logo'); later(enterHero,1030); };
  const start=()=>{ if(started) return; started=true; try{vid.currentTime=.55;}catch(_){} const p=vid.play(); if(p&&p.catch) p.catch(()=>showLogo()); };
  vid.addEventListener('timeupdate',()=>{ if(vid.currentTime>=4.6) showLogo(); });
  vid.addEventListener('ended',showLogo); vid.addEventListener('error',showLogo);
  if(vid.readyState>=3) start(); else vid.addEventListener('canplay',start,{once:true});
  later(()=>{ if(!started||vid.paused||vid.currentTime<.6) showLogo(); },3500);
  later(enterHero,9000);
  $('#skip').addEventListener('click',enterHero);
}

/* ---------------- init ---------------- */
setTitle(MATS[0].name.toUpperCase(),1,true); countEl.textContent='01'; tagEl.textContent=MATS[0].tag; cards[0].classList.add('live'); autoBtn.setAttribute('aria-pressed',String(auto));
setStep(0,true);
document.fonts.load('700 100px "Barlow Condensed"').then(()=>{ if(!cancelled) fitTitle(); }).catch(()=>{});
const fontsDone=()=>{ if(!cancelled) fitTitle(); };
document.fonts.addEventListener?.('loadingdone',fontsDone);
on(window, 'resize',()=>{ resizeGL(); heroUnit(); fitTitle(); sizeBits(); sizeStorm(); placeHL(); });
runIntro();

/* ---------------- frame loop ---------------- */
let last=performance.now();
function frame(t){
  if(cancelled) return;
  raf=requestAnimationFrame(frame);
  const dt=Math.min(64,t-last); last=t; now=t;
  tickSmooth(dt); tickTween(); tickReveal();
  const hr=hero.getBoundingClientRect(); heroUnit();
  cx=vw/2; cy=hr.top+(phone()?heroH*.4:heroH/2-78*u);
  heroVis=hr.height>0?clamp((Math.min(hr.bottom,vh)-Math.max(hr.top,0))/hr.height):0;
  if(auto&&entered&&!drag&&!tween&&!document.hidden&&heroVis>=.6&&t-lastInteract>3200) goTo(target+1);

  /* section 2 */
  const sr=sec2.getBoundingClientRect(); const inView=sr.bottom>0&&sr.top<vh;
  if(inView!==frontVis){ frontVis=inView; inFront.style.visibility=inView?'visible':'hidden'; }
  if(inView){ const pinY=sr.top>0?sr.top:(sr.bottom<vh?sr.bottom-vh:0); inFront.style.transform=`translateY(${pinY.toFixed(2)}px)`; }
  const p=clamp(-sr.top/Math.max(1,sr.height-vh)); const s=Math.floor(Math.min(p,.759)/.19); if(s!==step) setStep(s,false);
  const q=clamp((p-.76)/.24);
  const fp=flipDur>0?clamp((t-flipT0)/flipDur):1; flipAngle=lerp(flipFrom,flipTo,sineIO(fp));
  if(inView){ const fo=(1-clamp(4*q)).toFixed(3); if(fo!==lastFo){ lastFo=fo; frontFrame.style.opacity=fo; inNumw.style.opacity=fo; } inDark.style.opacity=(clamp(3.5*q)*.42).toFixed(3); }
  tickStorm(q);

  /* continuous traveller: 1 hero → 2 precision → 3 materials → 4 parts → 5 process → 6 compare → 7 quote */
  const jT=Math.round(target), tfv=mod(jT,3);
  const p1=clamp(1-sr.top/vh), heroOn=entered&&hr.bottom>0, fade=1-clamp(1.6*p1), j0=Math.floor(pos)-3;
  for(let n=0;n<POOL;n++){ const sl=pool[n], j=j0+n; sl.j=j; if(!heroOn||j===jT||fade<=.01){ hideSlot(sl); continue; } const st=arcState(j-pos); st.flav=mod(j,3); idle(st,j); st.op*=fade; placeSlot(sl,st); }

  const shr=shop.getBoundingClientRect(); const shopIn=shr.bottom>0&&shr.top<vh;
  const cr=secC.getBoundingClientRect(); const inC=cr.bottom>0&&cr.top<vh;
  const prr=procSec.getBoundingClientRect(); const cmr=cmpSec.getBoundingClientRect(); const qrr=quoteSec.getBoundingClientRect();
  const p3=clamp((vh-shr.top)/(.7*vh));
  const pD=clamp((vh-cr.top)/(.78*vh));
  const pE=clamp((vh-prr.top)/(.78*vh));
  const pF=clamp((vh-cmr.top)/(.78*vh));
  const pG=clamp((vh-qrr.top)/(.82*vh));

  mx+=(mxT-mx)*.06; my+=(myT-my)*.06;

  if(inC!==spotVis){ spotVis=inC; spotFront.style.visibility=inC?'visible':'hidden'; }
  const catr=catSec.getBoundingClientRect(); const catIn=catr.bottom>0&&catr.top<vh;
  const procIn=prr.bottom>0&&prr.top<vh, quoteIn=qrr.bottom>0&&qrr.top<vh;
  const showGears=inC||catIn||procIn||quoteIn;
  const pCat=clamp((vh-catr.top)/(.75*vh));
  gw.classList.toggle('show', showGears);
  gearGroup.visible=showGears||catIn;
  const sp=inC||pD>0?clamp(-cr.top/Math.max(1,cr.height-vh)):0;
  const idx=sp*2; const si=clamp(Math.round(idx),0,2);
  if(inC&&si!==spotI) setSpot(si);
  if(inC){
    const pinY=cr.top>0?cr.top:(cr.bottom<vh?cr.bottom-vh:0);
    spotFront.style.transform=`translateY(${pinY.toFixed(2)}px)`;
  }
  if(showGears){
    const gy=scrollY*.14, gs=1.1+scrollY*.00004;
    g1.style.transform=`translate3d(${(mx*30).toFixed(1)}px,${(-gy+my*18).toFixed(1)}px,0) scale(${gs.toFixed(4)})`;
    g2.style.transform=`translate3d(${(-mx*18).toFixed(1)}px,${(-gy*.45-my*10).toFixed(1)}px,0) scale(${(gs+.04).toFixed(4)}) rotate(${(scrollY*.015).toFixed(2)}deg)`;
    if(gearVid){ if(gearVid.paused) gearVid.play().catch(()=>{}); const v=smooth.active?Math.abs(smooth.target-smooth.cur):8; gearVid.playbackRate=RM?.4:clamp(.45+v/90,.4,1.75); }
  } else if(gearVid&&!gearVid.paused){ gearVid.pause(); }
  if(catIn){
    const layer=$('.cat-cogs');
    if(layer) layer.style.transform=`translate3d(${(mx*16).toFixed(1)}px,${(catr.top*.12+my*10).toFixed(1)}px,0)`;
  }

  const stg=spotStage.getBoundingClientRect();
  const cxS=stg.left+stg.width/2, cyS=stg.top+stg.height/2, h0=Math.max(80,Math.min(stg.height,stg.width)*.92);
  const sideFade=clamp(pD*1.5)*(1-clamp(pE*1.35))*(1-clamp(pF));
  function flowPose(i){
    const k=i-idx, ak=Math.abs(k), ang=k*42;
    const vis=ak>=1.35?0:ak<=.7?1:1-(ak-.7)/.65;
    const bob=RM?0:Math.sin(t/2100*2*Math.PI+i)*8;
    return {x:cxS+Math.sin(ang*DEG)*stg.width*.42+mx*18, y:cyS+bob+my*10, h:h0*(1-ak*.32), rz:k*6, ry:ang+(RM?0:(t*.01)%360), rx:8+k*4, z:-ak*160, op:vis*sideFade, shadow:.85, flav:SPOT[i].flav, sx:1, sy:1};
  }

  if(!entered){ hideSlot(trav); cardBars.forEach(hideSlot); spotSlots.forEach(hideSlot); }
  else {
    let S=idle(arcState(jT-pos),jT), B=null;
    if(p1>0){ const r=inBar.getBoundingClientRect(); const bob=RM?0:Math.sin(t/2600*2*Math.PI)*6; B={x:r.left+r.width/2,y:r.top+r.height/2+bob,h:r.height,rz:14,ry:flipAngle+(RM?0:720*q),rx:0,z:0,op:1,shadow:1}; S=mix(S,B,easeIO(p1)); }
    if(p3>0&&B){ const card=cards[tfv], r=pks[tfv].getBoundingClientRect(); const C={x:r.left+r.width/2,y:r.top+r.height/2,h:r.height,rz:0,ry:Math.round((B.ry||0)/360)*360+(card._tx||0)*14,rx:-(card._ty||0)*14,z:30,op:1,shadow:.7}; S=mix(B,C,easeIO(p3)); if(phone()&&!stripScrolled){ stripScrolled=true; centerCard(tfv); } }
    if(pD>0){ const D=flowPose(si); D.op=1; D.shadow=.9; D.flav=SPOT[si].flav; S=mix(S,D,easeIO(Math.min(pD,1))); }
    if(pCat>0){
      const flavNow=(pD>.42&&pE<.45)?SPOT[si].flav:tfv;
      const live=catCards.find(c=>+c.dataset.flav===flavNow)||catCards[0];
      const r=$('.cat-ph',live).getBoundingClientRect();
      const CAT={x:r.left+r.width/2,y:r.top+r.height/2,h:Math.min(r.width,r.height)*.7,rz:0,ry:(live._tx||0)*16,rx:-(live._ty||0)*12,z:28,op:1,shadow:.55};
      S=mix(S,CAT,easeIO(Math.min(pCat,1)));
    }
    if(pE>0){ const r=procStage.getBoundingClientRect(); const ok=r.width>8; const E={x:ok?r.left+r.width/2:vw*.72, y:ok?r.top+r.height/2:vh*.46, h:ok?Math.min(r.width,r.height)*.95:Math.min(vw,vh)*.3, rz:10, ry:22+Math.sin(t/1600*2*Math.PI)*14, rx:-8, z:40, op:1, shadow:.8}; S=mix(S,E,easeIO(Math.min(pE,1))); }
    if(pF>0){ const r=cmpStage.getBoundingClientRect(); const ok=r.width>8; const F={x:ok?r.left+r.width/2:vw*.82, y:ok?r.top+r.height/2:vh*.28, h:ok?Math.min(r.width,r.height)*.9:Math.min(vw,vh)*.26, rz:-8, ry:-18+Math.sin(t/1800*2*Math.PI)*10, rx:6, z:20, op:1, shadow:.65}; S=mix(S,F,easeIO(Math.min(pF,1))); }
    if(pG>0){ const gEl=$('#glow'); const r=gEl?gEl.getBoundingClientRect():{left:vw/2,top:vh/2,width:200,height:200}; const G={x:r.left+r.width/2, y:r.top+r.height*.36, h:Math.min(r.width,r.height)*.48, rz:6, ry:14+Math.sin(t/2000*2*Math.PI)*8, rx:-4, z:50, op:1, shadow:.75}; S=mix(S,G,easeIO(Math.min(pG,1))); }

    S.flav=(pD>.42&&pE<.45)?SPOT[si].flav:tfv;
    const ps=pokeScale('trav'); S.sx=ps[0]; S.sy=ps[1];
    travDamp=dampPose(travDamp,S,RM?1:1-Math.exp(-dt/80));
    placeSlot(trav,travDamp);
    followL.position.set(travDamp.x-vw/2, vh/2-travDamp.y+70, 170);
    followL.intensity=.35+travDamp.op*.9;

    for(let i=0;i<3;i++){
      const sl=cardBars[i];
      if(!shopIn||i===tfv||pD>.2){ hideSlot(sl); continue; }
      const card=cards[i], r=pks[i].getBoundingClientRect(), pk=pokeScale('card'+i);
      placeSlot(sl,{x:r.left+r.width/2,y:r.top+r.height/2,h:r.height,rz:0,ry:(card._tx||0)*14,rx:-(card._ty||0)*14,z:30,op:1,shadow:.7,flav:i,sx:pk[0],sy:pk[1]});
    }
    for(let i=0;i<3;i++){
      if(!inC||sideFade<.02||(i===si&&pD>.35&&pE<.5)){ hideSlot(spotSlots[i]); continue; }
      placeSlot(spotSlots[i], flowPose(i));
    }
  }

  if(showGears||catIn){
    let gOp=.2; if(inC) gOp=.28+.3*(1-clamp(pE)); else if(catIn) gOp=.5; else if(procIn) gOp=.32; else if(quoteIn) gOp=.24;
    const layout=catIn&&!inC?[
      {x:.06,y:.14,s:300,z:-520},{x:.94,y:.12,s:240,z:-480},{x:.08,y:.88,s:360,z:-560},{x:.92,y:.86,s:260,z:-500},
      {x:.5,y:.5,s:190,z:-640},{x:.7,y:.62,s:150,z:-580}
    ]:null;
    GEARS.forEach((g,i)=>{
      const L=layout?layout[i]:null;
      const gx=L?L.x:g.x, gy=L?L.y:g.y, gs=L?L.s:g.s, gz=L?L.z:-420;
      g.m.position.set(gx*vw-vw/2+mx*40, vh/2-gy*vh-my*30, gz);
      g.m.scale.setScalar(gs);
      g.m.rotation.set(g.rx, (sp||pCat||pE||pG)*g.spin*.8, (RM?0:t*.00035)+(scrollY*.0012)*g.spin);
      g.m.material.opacity=gOp*(.55+.45*(1-Math.abs(gx-.5)));
    });
  } else if(!inC){ spotSlots.forEach(hideSlot); }

  if(!RM&&prr.bottom>0&&prr.top<vh){
    procSteps.forEach(el=>{
      const r=el.getBoundingClientRect(); const d=((r.top+r.height/2)-vh/2)/vh;
      const vis=clamp(1-Math.abs(d)*1.7);
      el.style.transform=`translateX(${((1-vis)*36).toFixed(1)}px) rotateX(${(d*14).toFixed(2)}deg) translateZ(${(vis*24).toFixed(1)}px)`;
      el.style.opacity=(.22+vis*.78).toFixed(3);
    });
  }

  if(progress){ const max=Math.max(1,docRoot.scrollHeight-vh); progress.style.width=(clamp(scrollY/max)*100).toFixed(2)+'%'; }
  if(heroGhost&&heroVis>0) heroGhost.style.transform=`translate3d(${(mx*24).toFixed(1)}px,${(scrollY*.16+my*-20).toFixed(1)}px,0) scale(${(1.06+scrollY*.00005).toFixed(4)})`;
  tickNav();
  renderer.render(scene,camera);
}
raf=requestAnimationFrame(frame);

  return () => {
    cancelled = true;
    ac.abort();
    if (raf) cancelAnimationFrame(raf);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    try { io.disconnect(); io2.disconnect(); } catch(_) {}
    try { detachForm(); detachImages(); } catch(_) {}
    try { document.fonts.removeEventListener?.('loadingdone', fontsDone); } catch(_) {}
    document.body.classList.remove('locked', 'dragging');
    try { heroVid?.pause(); gearVid?.pause(); vid?.pause(); } catch(_) {}
    try {
      scene.traverse((o) => {
        if (o.geometry && o.geometry.dispose) o.geometry.dispose();
        const mm = Array.isArray(o.material) ? o.material : [o.material];
        mm.forEach((m) => { if (m && m.dispose) m.dispose(); });
      });
      shadowTex.dispose();
      pmrem.dispose();
      if (scene.environment && scene.environment.dispose) scene.environment.dispose();
      renderer.dispose();
    } catch(_) {}
    host.style.removeProperty('--flav');
    host.style.removeProperty('--k');
  };

}

/* ------------------------------------------------------------------ *
 * Module-level helpers (shared with the WebGL-unavailable fallback).
 * ------------------------------------------------------------------ */
function attachImageFallbacks(host) {
  const fallbacks = [
    "/images/division-rubber.jpg",
    "/images/division-steel.jpg",
    "/images/division-aluminium.jpg",
  ];
  const imgs = [...host.querySelectorAll("img:not(.pimg):not(.sbar)")];
  const pairs = imgs.map((img, i) => {
    const handler = () => {
      if (img.dataset.fallbackDone) return;
      img.dataset.fallbackDone = "1";
      img.src = fallbacks[i % fallbacks.length];
    };
    img.addEventListener("error", handler);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) handler();
    return [img, handler];
  });
  return () => pairs.forEach(([img, handler]) => img.removeEventListener("error", handler));
}

/** Wire the supplied quote form to the site's real /api/quote route. */
function attachRealQuoteForm(host, getLabels) {
  const form = host.querySelector("#qform");
  if (!form) return () => {};
  const handler = async (event) => {
    event.preventDefault();
    const val = (sel) => {
      const el = host.querySelector(sel);
      return el ? String(el.value || "").trim() : "";
    };
    const name = val("#fn"), company = val("#fc"), email = val("#fe");
    const phone = val("#fp"), division = val("#fm"), quantity = val("#fq");
    const message = val("#ft");
    const btn = form.querySelector(".submit");
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      (name ? host.querySelector("#fe") : host.querySelector("#fn"))?.focus();
      return;
    }
    const labels = getLabels();
    const detail = [
      message,
      labels.length ? "Items in this enquiry: " + labels.join(", ") : "",
    ].filter(Boolean).join("\n\n");
    if (detail.length < 10) {
      host.querySelector("#ft")?.focus();
      return;
    }
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, company, email, phone, division, quantity,
          message: detail, website: "",
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send your enquiry.");
      const delivered = data.emailDispatched || data.webhookDispatched;
      btn.classList.add("sent");
      btn.textContent = delivered
        ? "Enquiry sent · " + data.referenceId
        : "Saved · " + data.referenceId + " — please also email or WhatsApp us";
    } catch (err) {
      btn.disabled = false;
      btn.textContent = err && err.message
        ? err.message
        : "Could not send — please email or WhatsApp us";
    }
  };
  form.addEventListener("submit", handler);
  return () => form.removeEventListener("submit", handler);
}

/** Readable, fully static page when WebGL is unavailable or three fails. */
function staticFallback(host, on, getLabels, ac) {
  const q = (s) => host.querySelector(s);
  const qa = (s) => [...host.querySelectorAll(s)];
  const intro = q("#intro");
  if (intro) intro.remove();
  document.body.classList.remove("locked");
  q(".nav")?.classList.add("in");
  q("#home")?.classList.add("in");
  const title = q("#title");
  if (title && !title.textContent.trim()) title.textContent = "RUBBER";
  const tag = q("#tag");
  if (tag && !tag.textContent.trim())
    tag.textContent =
      "Seals, gaskets, O-rings, cords, sheets & rubber-to-metal bonded components.";
  const count = q("#count");
  if (count) count.textContent = "01";
  const track = q("#mqTrack");
  if (track && !track.innerHTML) {
    const items = ["Custom rubber", "Steel fittings", "Aluminium tooling",
      "Pressed & machined in Coimbatore", "Drawn to your spec", "20+ years on the floor"];
    const line = items.map((t) => `<span>${t} <b>◦</b></span>`).join("");
    track.innerHTML = line + line;
  }
  qa(".rvw, .cat").forEach((el) => el.classList.add("on"));
  qa(".ln span").forEach((el) => { el.style.transform = "none"; });
  qa(".card, .pphoto, .tw, .qform, .shop .cap").forEach((el) => {
    el.style.opacity = "1"; el.style.translate = "0 0";
  });
  qa(".cat-card, .step").forEach((el) => {
    el.style.opacity = "1"; el.style.transform = "none";
  });
  qa(".bit").forEach((el) => { el.style.opacity = ".55"; });
  const style = document.createElement("style");
  style.textContent = `
    .home3d .inside, .home3d .spot, .home3d #inFront, .home3d #spotFront,
    .home3d #gl, .home3d #gearsWorld, .home3d .hero-ghost { display:none!important }
    .home3d .hero { min-height:72svh }
    .home3d .proc, .home3d .quote { background:#0b1220!important }
    .home3d .cat { background:var(--cream)!important }
  `;
  host.appendChild(style);
  qa('a[href^="#"]').forEach((a) => on(a, "click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id.length < 2) return;
    const el = host.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  const detachForm = attachRealQuoteForm(host, getLabels);
  const detachImages = attachImageFallbacks(host);
  return () => {
    ac?.abort();
    detachForm();
    detachImages();
    document.body.classList.remove("dragging");
  };
}
