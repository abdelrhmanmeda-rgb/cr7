"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

const views = [
  { label: "النمو", title: "أصول تستهدف النمو", text: "الأسهم ممكن تضيف نمو للمحفظة، وقيمتها تتحرك مع الأسواق.", link: "/guide/stocks", color: "#efc789" },
  { label: "الدخل", title: "أصول تستهدف الدخل", text: "الصكوك وبعض الأصول العقارية ممكن تضيف تدفقات، بحسب شروط الأصل.", link: "/guide/income", color: "#e5a679" },
  { label: "السيولة", title: "أصول تدعم السيولة", text: "سهولة تحويل الأصل إلى نقد تختلف حسب السوق وشروط الاسترداد.", link: "/guide/liquidity-and-returns", color: "#91dfd8" },
] as const;

type Vec = readonly [number, number, number];
type Mesh = number[];
const gold: Vec = [.83, .55, .26];
const cyan: Vec = [.22, .66, .69];
const copper: Vec = [.78, .39, .25];
const stone: Vec = [.12, .22, .31];
const spin = Math.PI * 2;
const vertex = `
  attribute vec3 point, normal, pigment;
  uniform vec2 rotation;
  uniform float aspect;
  varying vec3 n, c, p;
  vec3 turn(vec3 v) {
    float cy = cos(rotation.x), sy = sin(rotation.x);
    float cx = cos(rotation.y), sx = sin(rotation.y);
    vec3 w = vec3(cy*v.x + sy*v.z, v.y, -sy*v.x + cy*v.z);
    return vec3(w.x, cx*w.y - sx*w.z, sx*w.y + cx*w.z);
  }
  void main() {
    n = turn(normal);
    c = pigment;
    p = turn(point);
    float depth = 6.5 - p.z;
    gl_Position = vec4(3.65 * p.x / aspect, 3.65 * (p.y + 0.07), 0.93 * depth - 0.9, depth);
  }`;
const fragment = `
  precision mediump float;
  varying vec3 n, c, p;
  void main() {
    vec3 N = normalize(n);
    vec3 L = normalize(vec3(-2.4, 3.6, 2.0));
    vec3 V = normalize(vec3(-p.x, -p.y, 6.5-p.z));
    float diffuse = max(dot(N,L),0.0);
    float rim = pow(1.0 - max(dot(N,V),0.0), 2.2);
    float spec = pow(max(dot(N,normalize(L+V)), 0.0), 24.0);
    float fill = max(dot(N,normalize(vec3(1.0,0.1,-0.7))),0.0);
    vec3 outColor = c * (0.38 + diffuse*0.69) + vec3(0.28,0.68,0.84)*fill*.19
      + vec3(1.0,0.85,0.58)*spec*.49 + vec3(0.38,0.76,0.88)*rim*.13;
    gl_FragColor = vec4(outColor,1.0);
  }`;

function face(mesh: Mesh, a: Vec, b: Vec, c: Vec, color: Vec) {
  const [ux, uy, uz] = b.map((v, i) => v - a[i]);
  const [vx, vy, vz] = c.map((v, i) => v - a[i]);
  const nx = uy*vz-uz*vy, ny = uz*vx-ux*vz, nz = ux*vy-uy*vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  for (const v of [a, b, c]) mesh.push(...v, nx/len, ny/len, nz/len, ...color);
}

function prism(mesh: Mesh, x: number, z: number, bottom: number, top: number, radius: number, topRadius: number, sides: number, color: Vec, angle = 0) {
  const at = (i: number, y: number, r: number): Vec => [x+r*Math.cos(angle + spin*i/sides), y, z+r*Math.sin(angle + spin*i/sides)];
  for (let i = 0; i < sides; i++) {
    const a = at(i, bottom, radius), b = at(i+1, bottom, radius);
    const c = at(i+1, top, topRadius), d = at(i, top, topRadius);
    face(mesh, a, d, c, color); face(mesh, a, c, b, color);
    face(mesh, [x,top,z], c, d, color);
    face(mesh, [x,bottom,z], a, b, color);
  }
}

function ring(mesh: Mesh, radius: number, thickness: number, y: number, tilt: number, color: Vec, start = 0, sweep = spin, n = 64, m = 8) {
  const at = (i: number, j: number): Vec => {
    const angle = start + sweep*i/n, cross = spin*j/m;
    const r = radius + thickness*Math.cos(cross), v = thickness*Math.sin(cross), z = r*Math.sin(angle);
    return [r*Math.cos(angle), y + v*Math.cos(tilt)-z*Math.sin(tilt), v*Math.sin(tilt)+z*Math.cos(tilt)];
  };
  for (let i=0;i<n;i++) for (let j=0;j<m;j++) {
    const a=at(i,j), b=at(i+1,j), c=at(i+1,j+1), d=at(i,j+1);
    face(mesh,a,d,c,color); face(mesh,a,c,b,color);
  }
}

function geometry(view: number, detail = 64) {
  const mesh: Mesh = [];
  const accent = [gold, copper, cyan][view];
  prism(mesh,0,0,-1.04,-.84,1.73,1.83,12,stone);
  prism(mesh,0,0,-.84,-.78,1.83,1.83,12,accent);
  prism(mesh,0,0,-.78,-.62,1.83,1.68,12,stone);
  prism(mesh,0,0,-.62,-.50,1.34,1.45,10,[.16,.29,.41]);
  ring(mesh,1.6,.015,-.66,0,cyan,0,spin,detail,6);
  ring(mesh,2.0,.022,-.15,-.38,accent,-.39,4.73,detail,6);
  ring(mesh,2.13,.011,-.31,-.38,cyan,1.27,4.61,detail,6);
  if (view === 0) {
    for (const [x,z,h,r] of [[-.73,.24,.35,.38],[.05,.17,.94,.43],[.68,-.29,1.57,.45],[-.23,-.57,1.14,.32]]) {
      prism(mesh,x,z,-.50,h-.28,r,r*.65,5,accent,.44);
      prism(mesh,x,z,h-.28,h,r*.65,r*.14,5,[.98,.70,.37],.44);
    }
  } else if (view === 1) {
    for (let i=0;i<5;i++) {
      const y=-.50+i*.31, r=1.17-i*.14;
      prism(mesh,i*.09-.16,-i*.04,y,y+.19,r,r*.91,8,i%2 ? accent : gold,i*.32);
      prism(mesh,i*.09-.16,-i*.04,y+.19,y+.24,r*.91,r*.82,8,accent,i*.32);
    }
  } else {
    for (const [x,z,y,r] of [[-.76,.29,-.31,.44],[.04,.28,.18,.54],[.69,-.42,-.04,.44],[-.48,-.54,.60,.33],[.32,-.36,.95,.26]]) {
      prism(mesh,x,z,y-.22,y+.22,r,r*.85,6,accent,.30);
      prism(mesh,x,z,y+.22,y+.40,r*.85,r*.28,6,[.53,.84,.88],.30);
    }
  }
  return new Float32Array(mesh);
}

function renderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "low-power" });
  if (!gl) return null;
  function compile(kind: number, source: string) {
    const shader = gl!.createShader(kind);
    if (!shader) return null;
    gl!.shaderSource(shader,source); gl!.compileShader(shader);
    if (gl!.getShaderParameter(shader,gl!.COMPILE_STATUS)) return shader;
    gl!.deleteShader(shader);
    return null;
  }
  const vs = compile(gl.VERTEX_SHADER,vertex), fs = compile(gl.FRAGMENT_SHADER,fragment);
  const program = gl.createProgram(), buffer = gl.createBuffer();
  const dispose = () => {
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
  };
  if (vs && fs && program) {
    gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
  }
  if (vs) gl.deleteShader(vs);
  if (fs) gl.deleteShader(fs);
  if (!(vs && fs && program && buffer && gl.getProgramParameter(program,gl.LINK_STATUS))) {
    dispose();
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for (const [index,key] of ["point","normal","pigment"].entries()) {
    const loc=gl.getAttribLocation(program,key);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,3,gl.FLOAT,false,36,index*12);
  }
  const rotation=gl.getUniformLocation(program,"rotation"), aspect=gl.getUniformLocation(program,"aspect");
  gl.clearColor(0,0,0,0); gl.enable(gl.DEPTH_TEST);
  let previous=-1, count=0;
  return {
    dispose,
    draw(index: number, yaw: number, pitch: number) {
      if (index!==previous) {
        const data=geometry(index); previous=index; count=data.length/9;
        gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      }
      const scale=Math.min(window.devicePixelRatio || 1, 1.7);
      const w=Math.max(1,Math.round(canvas.clientWidth*scale)),h=Math.max(1,Math.round(canvas.clientHeight*scale));
      if(canvas.width!==w || canvas.height!==h) { canvas.width=w; canvas.height=h; }
      gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform2f(rotation,yaw,pitch); gl.uniform1f(aspect,w/h); gl.drawArrays(gl.TRIANGLES,0,count);
    },
  };
}

// Draw the same 3D mesh where WebGL is disabled. Back-face culling,
// perspective projection and a depth buffer run only on interaction or resize.
function softwareRenderer(canvas: HTMLCanvasElement): ReturnType<typeof renderer> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let pastIndex = -1;
  let mesh = new Float32Array();
  let pixels: ImageData | null = null;
  let depths = new Float32Array();
  return {
    dispose() {},
    draw(index, yaw, pitch) {
      if (index !== pastIndex) { mesh = geometry(index, 30); pastIndex = index; }
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth*dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight*dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width=w; canvas.height=h; }
      if (!pixels || pixels.width !== w || pixels.height !== h) {
        pixels=ctx.createImageData(w,h);
        depths=new Float32Array(w*h);
      }
      const rgba=pixels.data;
      rgba.fill(0); depths.fill(0);
      const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
      const rotate = (x: number, y: number, z: number): Vec => {
        const depth=-sy*x+cy*z;
        return [cy*x+sy*z,cx*y-sx*depth,sx*y+cx*depth];
      };
      const shade = (value: number) => Math.round(Math.min(1,Math.max(0,value))*255);
      const project = ([x,y,z]: Vec): Vec => {
        const reciprocal=1/(6.5-z), k=1.825*h*reciprocal;
        return [w*.5+x*k,h*.5-(y+.07)*k,reciprocal];
      };
      const edge = (a: Vec, b: Vec, x: number, y: number) => (b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);
      for (let i=0;i<mesh.length;i+=27) {
        const a=rotate(mesh[i],mesh[i+1],mesh[i+2]), b=rotate(mesh[i+9],mesh[i+10],mesh[i+11]);
        const c=rotate(mesh[i+18],mesh[i+19],mesh[i+20]), n=rotate(mesh[i+3],mesh[i+4],mesh[i+5]);
        const [x,y,z]=a, depth=6.5-z;
        const view=Math.hypot(x,y,depth), faceView=(-n[0]*x-n[1]*y+n[2]*depth)/view;
        if (faceView<=0) continue;
        const diffuse=Math.max(0,-.509*n[0]+.764*n[1]+.424*n[2]);
        const fill=Math.max(0,.817*n[0]+.082*n[1]-.572*n[2]);
        const spec=Math.pow(Math.max(0,-.32*n[0]+.48*n[1]+.817*n[2]),24);
        const rim=Math.pow(1-faceView,2.2);
        const light=.38+.69*diffuse;
        const color=[0,1,2].map(ch => shade(mesh[i+6+ch]*light + [0.28,0.68,0.84][ch]*fill*.19 + [1,.85,.58][ch]*spec*.49 + [.38,.76,.88][ch]*rim*.13));
        const pa=project(a),pb=project(b),pc=project(c);
        const area=edge(pa,pb,pc[0],pc[1]);
        if (Math.abs(area)<.01) continue;
        const minX=Math.max(0,Math.floor(Math.min(pa[0],pb[0],pc[0])));
        const minY=Math.max(0,Math.floor(Math.min(pa[1],pb[1],pc[1])));
        const maxX=Math.min(w-1,Math.ceil(Math.max(pa[0],pb[0],pc[0])));
        const maxY=Math.min(h-1,Math.ceil(Math.max(pa[1],pb[1],pc[1])));
        for (let iy=minY;iy<=maxY;iy++) {
          let wa=edge(pb,pc,minX+.5,iy+.5)/area;
          let wb=edge(pc,pa,minX+.5,iy+.5)/area;
          const stepA=(pb[1]-pc[1])/area, stepB=(pc[1]-pa[1])/area;
          for (let ix=minX;ix<=maxX;ix++,wa+=stepA,wb+=stepB) {
            const wc=1-wa-wb;
            if (wa<0 || wb<0 || wc<0) continue;
            const depth=wa*pa[2]+wb*pb[2]+wc*pc[2];
            const offset=iy*w+ix;
            if (depth<=depths[offset]) continue;
            depths[offset]=depth;
            const out=offset*4;
            rgba[out]=color[0]; rgba[out+1]=color[1]; rgba[out+2]=color[2]; rgba[out+3]=255;
          }
        }
      }
      ctx.putImageData(pixels,0,0);
    },
  };
}

export default function AssetObservatory() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const softwareRef = useRef<HTMLCanvasElement>(null);
  const redraw = useRef<() => void>(() => {});
  const pose = useRef({ index: 0, yaw: -.64, pitch: .39 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [selection, setSelection] = useState(0);
  const view = views[selection];

  useEffect(() => {
    const canvas=canvasRef.current, soft=softwareRef.current;
    const viewport=canvas?.parentElement;
    if (!canvas || !soft || !viewport) return;
    let engine: ReturnType<typeof renderer> = null, frame=0, mounting=true;
    const paint = () => {
      frame=0;
      if (!engine) return;
      const { index,yaw,pitch }=pose.current;
      engine.draw(index,yaw,pitch);
    };
    const schedule = () => { if (!frame) frame=requestAnimationFrame(paint); };
    const enable = () => {
      engine?.dispose();
      try { engine=renderer(canvas); } catch { engine=null; }
      const mode=engine?"webgl":"software";
      if (!engine) engine=softwareRenderer(soft);
      if (!engine) return;
      viewport.setAttribute("data-scene",mode);
      paint();
      redraw.current=schedule;
    };
    const lost = (event: Event) => {
      event.preventDefault();
      engine=softwareRenderer(soft);
      if (engine) { viewport.setAttribute("data-scene","software"); schedule(); }
      else viewport.removeAttribute("data-scene");
    };
    const restored = () => { if (mounting) enable(); };
    const resize=new ResizeObserver(schedule);
    resize.observe(viewport);
    canvas.addEventListener("webglcontextlost",lost);
    canvas.addEventListener("webglcontextrestored",restored);
    enable();
    return () => {
      mounting=false;
      resize.disconnect(); cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost",lost);
      canvas.removeEventListener("webglcontextrestored",restored);
      engine?.dispose(); redraw.current=()=>{};
      viewport.removeAttribute("data-scene");
    };
  }, []);

  function turn(event: PointerEvent<HTMLDivElement>) {
    const current=drag.current;
    if (!current || current.id!==event.pointerId) return;
    pose.current.yaw+=(event.clientX-current.x)*.014;
    pose.current.pitch=Math.min(.88,Math.max(-.24,pose.current.pitch+(event.clientY-current.y)*.009));
    current.x=event.clientX; current.y=event.clientY;
    redraw.current();
  }

  return (
    <section className="sgf-observatory" aria-labelledby="sgf-observatory-title">
      <div className="sgf-ob-header"><h2 id="sgf-observatory-title">مرصد الأصول</h2><span>نموذج توضيحي</span></div>
      <div className="sgf-ob-viewport" data-view={selection}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0 || !event.currentTarget.dataset.scene) return;
          drag.current={ id:event.pointerId, x:event.clientX, y:event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={turn}
        onLostPointerCapture={() => { drag.current=null; }}
      >
        <div className="sgf-ob-fallback" aria-hidden="true">
          <svg viewBox="0 0 360 260" fill="none">
            <ellipse cx="180" cy="196" rx="128" ry="32" stroke="#8baac980" />
            <ellipse cx="180" cy="193" rx="106" ry="25" fill="#10283f" stroke={view.color} />
            <path d="m81 176 99-44 99 44-99 45Z" fill="#284769" stroke={view.color} />
            <path d="M107 125v51l31 17v-51Zm53-40v77l31 18v-78Zm58-46v109l31 18V57Z" fill={view.color} opacity=".8" />
            <path d="m107 125 27-13 31 17-27 13Zm53-40 27-13 31 17-27 13Zm58-46 23-14 34 17-26 15Z" fill="#fff0cb" />
            <path d="m138 142 27-13v51l-27 13Zm53-40 27-13v76l-27 15Zm58-45 26-15v110l-26 14Z" fill="#6f5036" />
          </svg>
        </div>
        <canvas ref={canvasRef} className="sgf-ob-gpu" aria-hidden="true" />
        <canvas ref={softwareRef} className="sgf-ob-software" aria-hidden="true" />
        <span className="sgf-ob-drag" aria-hidden="true">اسحب المجسّم لتدويره</span>
      </div>
      <div className="sgf-ob-body">
        <div className="sgf-ob-controls" aria-label="فئات المرصد">
          {views.map(({label},index) => (
            <button key={label} type="button" aria-pressed={selection===index} onClick={() => {
              pose.current.index=index; setSelection(index); redraw.current();
            }}>{label}</button>
          ))}
          <button type="button" className="sgf-ob-turn" onClick={() => {pose.current.yaw+=Math.PI/5; redraw.current();}}>دوّر</button>
        </div>
        <div className="sgf-ob-description" aria-live="polite">
          <div><strong>{view.title}</strong><p>{view.text}</p></div>
          <a href={view.link}>اقرأ التفاصيل</a>
        </div>
      </div>
    </section>
  );
}
