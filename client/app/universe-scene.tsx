"use client";

import { useEffect, useRef, useState } from "react";

type Kind = "city" | "globe" | "gold" | "energy" | "market";
type V = [number,number,number];
type Face = {p:V[]; m:number; u:number[][]};
type Model = Face[];
const TAU=Math.PI*2;
const palette=["#233b4b","#705433","#d19a4e","#c8ad7a","#25546a","#b6a484","#c28a52","#38526c","#b0c9c9","#102c37","#e8c67e","#43999d","#88afbc","#ded8b8"];
const rgb=palette.map(s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255));
const uv=[[0,0],[1,0],[1,1],[0,1]];
function face(m:Model,p:V[],mat:number,u=uv){m.push({p,m:mat,u});}
function ring(m:Model,a:number,b:number,y:number,slant:number,mat:number,width:number,phase=0,sweep=TAU){
  const dot=(t:number,r:number):V=>[Math.cos(t)*a*r, y+Math.cos(t+.2)*slant+Math.sin(t)*slant*.3,Math.sin(t)*b*r];
  const n=Math.ceil(96*sweep/TAU);
  for(let i=0;i<n;i++){const t=phase+i*sweep/n,v=phase+(i+1)*sweep/n;face(m,[dot(t,1-width),dot(v,1-width),dot(v,1+width),dot(t,1+width)],mat);}
}
function deck(m:Model,x:number,z:number,y:number,levels:number[][],sides:number,mat:number,rotate=0){
 const pts=(l:number[],i:number):V=>[x+l[0]*Math.cos(rotate+TAU*i/sides),y+l[2],z+l[1]*Math.sin(rotate+TAU*i/sides)];
 for(let j=0;j<levels.length-1;j++){const lo=levels[j],hi=levels[j+1];for(let i=0;i<sides;i++){face(m,[pts(lo,i),pts(lo,i+1),pts(hi,i+1),pts(hi,i)],lo[3]??mat);}}
 const last=levels[levels.length-1];for(let i=0;i<sides;i++)face(m,[[x,y+last[2],z],pts(last,i),pts(last,i+1)],last[3]??mat,[[.5,.5],[1,0],[0,1]]);
}
function box(m:Model,x:number,z:number,base:number,w:number,d:number,h:number,mat:number,top=1,angle=0,roof=3,shear=0){
 const point=(i:number,j:number,k:number):V=>{const a=(i-.5)*w*(k?top:1),b=(j-.5)*d*(k?top:1);return [x+a*Math.cos(angle)-b*Math.sin(angle)+k*shear,base+k*h,z+a*Math.sin(angle)+b*Math.cos(angle)];};
 for(const [i,j,ii,jj] of [[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0]])face(m,[point(i,j,0),point(ii,jj,0),point(ii,jj,1),point(i,j,1)],mat,[[0,0],[w*2,0],[w*2,h*2],[0,h*2]]);
 face(m,[point(0,0,1),point(1,0,1),point(1,1,1),point(0,1,1)],roof);
}
function bar(m:Model,a:V,b:V,w:number,mat:number){
 const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d)||1,n:V=[-d[2]/(Math.hypot(d[0],d[2])||1),0,d[0]/(Math.hypot(d[0],d[2])||1)];if(!n[0]&&!n[2])n[0]=1;
 const o:V=[n[2]*d[1]/len,(n[0]*d[2]-n[2]*d[0])/len,-n[0]*d[1]/len];
 const at=(v:V,i:number):V=>v.map((k,j)=>k+w*(n[j]*Math.cos(i*TAU/4)+o[j]*Math.sin(i*TAU/4))) as V;
 for(let i=0;i<4;i++)face(m,[at(a,i),at(a,i+1),at(b,i+1),at(b,i)],mat);
}
function building(m:Model,x:number,z:number,h:number,w:number,d:number,mat:number,variant:number){
 const y=-.35;
 box(m,x,z,y,w*1.2,d*1.2,.075,1,1,0,3);
 if(variant===0){ // terraces and tapering, illuminated spire
 let base=y+.075;
 for(const [f,hh] of [[1,.37],[.84,.24],[.66,.16],[.46,.105],[.28,.06]]){
 box(m,x,z,base,w*f,d*f,h*hh,mat,.96,0,3);box(m,x,z,base+h*hh-.012,w*f*1.01,d*f*1.01,.018,2);
 base+=h*hh;}
 deck(m,x,z,base,[[w*.085,d*.085,0],[.008,.008,h*.12]],8,3);
 bar(m,[x,base,z],[x,base+h*.22,z],.009,10);
 }else if(variant===1){ // crown with a tilted glass blade
 box(m,x,z,y+.075,w,d,h,mat,.9,0,3,.085);
 for(const i of [-1,1])bar(m,[x+i*w/2,y+.07,z+d*.5],[x+.085+i*w*.45,y+.07+h+(i+1)*.075,z+d*.45],.013,3);
 }else{
 const points:number[][]=[[w*.56,d*.56,0,mat],[w*.55,d*.55,h*.62,mat],[w*.48,d*.48,h*.89,mat],[w*.33,d*.33,h,3]];
 deck(m,x,z,y+.07,points,8,mat,.1);
 for(let i=0;i<8;i++){const a=.1+TAU*i/8;bar(m,[x+points[0][0]*Math.cos(a),y+.075,z+points[0][1]*Math.sin(a)],[x+points[2][0]*Math.cos(a),y+.07+h*.89,z+points[2][1]*Math.sin(a)],.006,3);}
 }
}
const lands=[
 [[-168,66],[-150,73],[-116,71],[-92,73],[-70,60],[-51,51],[-62,46],[-80,26],[-90,19],[-82,10],[-96,17],[-108,23],[-123,38],[-131,52],[-153,59]],
 [[-82,12],[-67,12],[-48,0],[-35,-6],[-48,-27],[-58,-37],[-69,-54],[-76,-48],[-70,-18],[-80,-1]],
 [[-55,60],[-46,59],[-21,75],[-22,83],[-49,83],[-63,71]],
 [[-17,34],[4,37],[24,32],[32,31],[39,16],[51,12],[47,3],[42,-11],[36,-22],[28,-34],[18,-35],[11,-16],[8,3],[-8,5],[-17,15]],
 [[-10,36],[-9,44],[0,51],[15,54],[10,60],[23,71],[38,68],[53,71],[80,74],[116,74],[143,67],[172,67],[176,58],[152,50],[139,45],[126,36],[122,25],[112,20],[104,9],[99,10],[93,21],[85,22],[78,8],[72,19],[65,25],[52,26],[58,22],[51,14],[43,13],[35,30],[27,38],[17,40],[11,44],[3,42]],
 [[112,-21],[121,-16],[130,-13],[138,-16],[142,-10],[153,-25],[150,-37],[137,-36],[128,-32],[115,-35]],[[48,-13],[50,-16],[46,-26],[43,-23]],[[130,31],[141,44],[145,44],[137,32]]
];
function isLand(x:number,y:number){return lands.some(poly=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ax,ay]=poly[i],[bx,by]=poly[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)yes=!yes;}return yes;});}
function geography(m:Model){const pt=(lon:number,lat:number,r=1.18):V=>{const a=(lon-45)*Math.PI/180,b=lat*Math.PI/180;return [Math.sin(a)*Math.cos(b)*r,.12+Math.sin(b)*r,Math.cos(a)*Math.cos(b)*r];};
 for(let lat=-90;lat<90;lat+=6)for(let lon=-180;lon<180;lon+=6){
 const land=isLand(lon+3,lat+3);face(m,[pt(lon,lat),pt(lon+6,lat),pt(lon+6,lat+6),pt(lon,lat+6)],land?((lon+lat)%18===0?3:6):9);}
 for(let lat=-60;lat<=60;lat+=30)for(let lon=-180;lon<180;lon+=10)bar(m,pt(lon,lat,1.182),pt(lon+10,lat,1.182),.003,12);
 for(const [lon,lat] of [[55,25],[46,24],[51,25],[0,51],[103,1],[72,19]]){const p=pt(lon,lat,1.20);deck(m,p[0],p[2],p[1],[[.016,.016,0],[.012,.012,.03]],6,10);}
}
function make(kind:Kind):Model{
 const m:Model=[];
 if(kind==="globe"){
 geography(m);ring(m,1.53,1.55,-.29,.28,2,.008);ring(m,1.64,1.62,-.29,.28,10,.003,.5,4.4);return m;}
 deck(m,0,0,-.80,[[.42,.32,0,1],[1.62,.99,.22,0],[1.70,1.04,.27,3],[1.73,1.07,.31,1],[1.78,1.08,.35,2],[1.79,1.09,.38,0],[1.73,1.04,.44,0],[1.63,.99,.45,0]],48,0);
 ring(m,1.78,1.08,-.45,0,10,.005);
 for(let i=0;i<47;i++){const a=i*TAU/47;bar(m,[1.64*Math.cos(a),-.55,1.0*Math.sin(a)],[1.73*Math.cos(a),-.50,1.055*Math.sin(a)],.007,i%4===0?10:1);}
 if(kind==="city"){
  building(m,-.65,-.13,1.25,.36,.34,7,1);
  building(m,-.11,-.26,2.17,.42,.41,4,0);
  building(m,.49,-.34,1.49,.37,.36,7,2);
  building(m,.79,.04,.99,.32,.31,4,1);
  building(m,-.44,.38,.75,.28,.33,4,2);
  building(m,.24,.34,.65,.28,.31,7,1);
  for(const [x,z] of [[-1.04,.19],[-.94,.50],[-.89,-.45],[.87,-.45]]){box(m,x,z,-.34,.33,.25,.17,7,1,0,3);box(m,x,z,-.17,.25,.19,.07,5);}
  for(const [x,z,y] of [[.68,.55,-.33],[.98,.45,-.33],[.83,.50,-.14]])box(m,x,z,y,.39,.23,.19,2,.72,-.32,10);
  for(let i=0;i<9;i++){
  const a=TAU*i/9, x=Math.cos(a)*1.36,z=Math.sin(a)*.81;
  bar(m,[x,-.34,z],[x+.015,-.03,z],.011,1);
  for(let j=0;j<7;j++){const ang=TAU*j/7;face(m,[[x,-.025,z],[x+.083*Math.cos(ang)-.025*Math.sin(ang),.01,z+.083*Math.sin(ang)+.025*Math.cos(ang)],[x+.14*Math.cos(ang),-.075,z+.14*Math.sin(ang)]],9);}
  }
 }else if(kind==="gold"){
 for(const [x,z,y] of [[-.62,.28,-.34],[.0,.28,-.34],[.62,.28,-.34],[-.29,.24,-.005],[.33,.24,-.005],[.03,.22,.33]]){box(m,x,z,y,.56,.89,.325,2,.74,-.15,10);}
 box(m,-.65,-.49,-.24,.78,.62,.88,2,.81,-.20,10,.2);
 }else if(kind==="energy"){
 for(const [x,z,h] of [[-.65,-.25,1.24],[.10,-.48,1.57],[.75,-.27,1.04]]){
 deck(m,x,z,-.34,[[.065,.065,0],[.036,.036,h]],12,8);const yy=-.34+h;
 for(let i=0;i<3;i++){let a=TAU*i/3+.31;const p=(r:number,offset:number):V=>[x+Math.cos(a)*r-Math.sin(a)*offset,yy+Math.sin(a)*r+Math.cos(a)*offset,z+.035];face(m,[p(0,0),p(.17,.056),p(.53,-.018),p(.18,-.021)],13);}
 }
 for(let j=0;j<2;j++)for(let i=0;i<6;i++){const x=-.93+i*.31,z=.12+j*.34; face(m,[[x,-.24,z],[x+.28,-.24,z],[x+.28,-.34,z+.27],[x,-.34,z+.27]],i%3===0?4:7);}
 }else{
 for(let i=0;i<11;i++){const x=-1.29+i*.245,k=.33+i*.085+Math.sin(i*1.4)*.19,z=-.1+i*.010,mat=i%3===0?6:11;
 box(m,x,z,-.34+k*.46,.127,.14,k*.49,mat,1,0,mat);bar(m,[x,-.34+k*.22,z],[x,-.34+k*1.23,z],.014,mat);}
 }
 ring(m,2.00,1.32,-.02,.34,2,.008);ring(m,2.03,1.35,-.011,.34,10,.003,.16,4.25);
 ring(m,1.91,1.26,-.13,.29,6,.002,2.3,3.5);
 return m;
}
const labels:Record<Kind,string>={city:"الجزيرة المعمارية",gold:"سبائك الذهب",globe:"أطلس الأسواق",energy:"الطاقة والمشروعات",market:"مشهد السوق"};
const tags:Record<Kind,string>={city:"GULF ARCHIPELAGO",gold:"PRECIOUS METALS",globe:"WORLD ATLAS",energy:"ENERGY LANDSCAPE",market:"MARKET STRUCTURE"};
const vert=`
attribute vec3 p,n,c;attribute vec2 uv;attribute float mat;
uniform vec4 cam;uniform vec2 scale;uniform float focus;
varying vec3 norm,col,pos;varying vec2 tex;varying float material;
void main(){vec3 a=vec3(cam.x*p.x+cam.y*p.z,p.y-focus,-cam.y*p.x+cam.x*p.z);
vec3 q=vec3(a.x,cam.z*a.y-cam.w*a.z,cam.w*a.y+cam.z*a.z);
float w=1.-q.z*.055;gl_Position=vec4(q.xy*scale,-q.z*.14,w);
vec3 l=vec3(cam.x*n.x+cam.y*n.z,n.y,-cam.y*n.x+cam.x*n.z);
norm=vec3(l.x,cam.z*l.y-cam.w*l.z,cam.w*l.y+cam.z*l.z);
col=c;pos=p;tex=uv;material=mat;}`;
const frag=`
precision mediump float;
varying vec3 norm,col,pos;varying vec2 tex;varying float material;
float hash(vec2 k){return fract(sin(dot(k,vec2(17.127,71.73)))*1345.983);}
void main(){vec3 N=normalize(norm);if(N.z<0.)N=-N;
vec3 V=normalize(vec3(-pos.x*.05,(.3-pos.y)*.05,1.));
vec3 L=normalize(vec3(-.64,.65,.62)), H=normalize(V+L);
float diffuse=max(dot(N,L),0.), facing=max(dot(N,V),0.);
float fres=pow(1.-facing,2.4);
vec3 R=reflect(-V,N);
float band=.5+.5*sin(5.5*R.x+3.3*R.y+pos.y*.35);
vec3 light=col*(.48+.61*diffuse)+vec3(.08,.15,.18)*fres;
bool glass=abs(material-4.)<.3||abs(material-7.)<.3;
if(glass){vec2 t=tex*vec2(9.,12.);vec2 f=fract(t);
float frame=max(1.-smoothstep(.025,.095,f.x),1.-smoothstep(.025,.11,f.y));
float lit=step(.73,hash(floor(t)));vec3 reflectColor=mix(vec3(.047,.10,.145),vec3(.40,.60,.69),band*band);
light=mix(reflectColor,vec3(.63,.48,.32),frame*.81)+vec3(.77,.48,.21)*lit*(1.-frame)*(.2+.48*diffuse);
}else if(abs(material-2.)<.3||abs(material-3.)<.3||abs(material-6.)<.3||abs(material-10.)<.3||abs(material-1.)<.3){
float shine=pow(band,4.0);light=col*(.42+.63*diffuse+.32*band)+vec3(1.,.78,.42)*(.31*shine+.2*fres);
if(abs(material-10.)<.3)light+=vec3(.19,.13,.035);
}else if(abs(material-9.)<.3){light=col*(.7+.56*diffuse)+vec3(.025,.14,.18)*fres;}
light+=vec3(1.,.88,.62)*pow(max(dot(H,N),0.),28.)*.28;
gl_FragColor=vec4(clamp(light,0.,1.),1.);}`;
function normal(p:V[]):V{const v=p[1].map((s,i)=>s-p[0][i]),w=p[2].map((s,i)=>s-p[0][i]);const n:V=[v[1]*w[2]-v[2]*w[1],v[2]*w[0]-v[0]*w[2],v[0]*w[1]-v[1]*w[0]],d=Math.hypot(...n)||1;return n.map(s=>s/d) as V;}
type Draw=(yaw:number,pitch:number,w:number,h:number)=>void;
function hardware(canvas:HTMLCanvasElement,mesh:Model,city:boolean):{draw:Draw;free:()=>void}|null{
 const gl=canvas.getContext("webgl",{alpha:true,antialias:true,powerPreference:"low-power",premultipliedAlpha:true});if(!gl)return null;
 const shaders:WebGLShader[]=[];const program=gl.createProgram(),buf=gl.createBuffer();
 const free=()=>{for(const s of shaders)gl.deleteShader(s);gl.deleteBuffer(buf);gl.deleteProgram(program);};
 if(!program||!buf){free();return null;}
 for(const [mode,src] of [[gl.VERTEX_SHADER,vert],[gl.FRAGMENT_SHADER,frag]] as const){const s=gl.createShader(mode);if(!s){free();return null;}shaders.push(s);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){free();return null;}gl.attachShader(program,s);}
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){free();return null;}
 const floats:number[]=[];
 for(const f of mesh){const n=normal(f.p);for(let j=1;j<f.p.length-1;j++)for(const i of [0,j,j+1])floats.push(...f.p[i],...n,...rgb[f.m],...f.u[i],f.m);}
 gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(floats),gl.STATIC_DRAW);
 for(const [name,length,offset] of [["p",3,0],["n",3,3],["c",3,6],["uv",2,9],["mat",1,11]] as const){const i=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,length,gl.FLOAT,false,48,offset*4);}
 gl.clearColor(0,0,0,0);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 const c=gl.getUniformLocation(program,"cam"),s=gl.getUniformLocation(program,"scale"),count=floats.length/12;
 return {free,draw(yaw,pitch,w,h){const size=Math.min(w/4.48,h/(city?3.72:3.02));gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(gl.getUniformLocation(program,"focus"),city?.66:.34);gl.uniform4f(c,Math.cos(yaw),Math.sin(yaw),Math.cos(pitch),Math.sin(pitch));gl.uniform2f(s,size*2/w,size*2/h);gl.drawArrays(gl.TRIANGLES,0,count);}};
}
function software(cv:HTMLCanvasElement,mesh:Model,city:boolean):Draw|null{
 const ctx=cv.getContext("2d");if(!ctx)return null;
 const fs=mesh.map(f=>({...f,n:normal(f.p)}));return (yaw,pitch,w,h)=>{
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),s=Math.min(w/4.48,h/(city?3.72:3.02));
 const project=(p:V)=>{const x=cy*p[0]+sy*p[2],z=-sy*p[0]+cy*p[2],y=p[1]-(city?.66:.34),d=sp*y+cp*z,k=s/(1-d*.055);return [w*.5+x*k,h*.5-(cp*y-sp*z)*k,d];};
 const sorted=fs.map(f=>{const pts=f.p.map(project);return {f,pts,depth:pts.reduce((v,p)=>v+p[2],0)/pts.length};}).sort((a,b)=>a.depth-b.depth);
 ctx.clearRect(0,0,w,h);
 const glow=(x:number,y:number,r:number,c:string)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(.34,c.slice(0,7)+"22");g.addColorStop(1,c.slice(0,7)+"00");ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
 if(city){const q=project([-.22,.63,-.40]);glow(q[0],q[1],s*.89,"#ffbd6b45");const wtr=project([0,-.88,0]);ctx.save();ctx.translate(wtr[0],wtr[1]);ctx.scale(1,.117);glow(0,0,1.82*s,"#6ccfe66a");ctx.restore();}
 for(const {f,pts} of sorted){
 const n=f.n;let nx=cy*n[0]+sy*n[2],nz=-sy*n[0]+cy*n[2],ny=cp*n[1]-sp*nz;nz=sp*n[1]+cp*nz;
 if(nz<0){nx=-nx;ny=-ny;nz=-nz;}
 const light=Math.max(0,-.66*nx+.32*ny+.57*nz),shine=Math.pow(Math.max(0,-.63*nx+.40*ny+.66*nz),5),color=rgb[f.m],glass=f.m===4||f.m===7,metal=[1,2,3,6,10].includes(f.m);
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),lx=Math.min(...xs),rx=Math.max(...xs),top=Math.min(...ys),bt=Math.max(...ys);
 const interpolate=(a:number[],b:number[],t:number)=>a.map((v,i)=>v+(b[i]-v)*t);
 const css=(v:number[])=>"rgb("+v.map(i=>Math.max(0,Math.min(255,Math.round(i)))).join(",")+")";
 const gradient=(stops:[number,number[]][])=>{const grad=ctx.createLinearGradient(lx,bt,Math.max(lx+.02,rx),top);for(const [v,c] of stops)grad.addColorStop(v,css(c));return grad;};
 ctx.fillStyle=css(color.map(v=>v*255*(.45+light*.69)));
 if(glass){const front=(nx+1)/2;const k=light*.58+shine*.18;const warm=[255,177,98],base=interpolate([13,40,60],[38,84,99],front);
 ctx.fillStyle=gradient([[0,interpolate(base,[4,13,27],.3)],[.248,interpolate(base,[58,113,134],.47)],[.43,interpolate(base,[137,183,194],.30+shine*.35)],[.58,interpolate(base,warm,k*.64)],[.68,interpolate(base,[109,154,173],.28)],[1,interpolate(base,[144,173,189],.51)]]);
 }else if(metal){const lo=interpolate([64,39,22],[146,81,30],light),mid=interpolate([135,79,26],[240,172,78],light),hi=interpolate([191,137,66],[255,241,177],Math.min(1,light*.8+shine*.5));
 ctx.fillStyle=gradient([[0,lo],[.30,mid],[.49,hi],[.57,interpolate(mid,hi,.52)],[.68,mid],[1,interpolate(mid,hi,.78)]]);
 }else if(f.m===0){ctx.fillStyle=gradient([[0,[10,23,35]],[.52,[20+light*13,48+light*11,64+light*10]],[1,[71,89,92]]]);}
 ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fill();
 if(glass&&pts.length===4){const [a,b,c,d]=pts,rows=Math.min(27,Math.max(3,Math.ceil(Math.hypot(d[0]-a[0],d[1]-a[1])/h*105))),cols=Math.max(2,Math.min(9,Math.round(Math.hypot(a[0]-b[0],a[1]-b[1])/w*98)));
 const on=(x:number,y:number)=>{const l=interpolate(a,d,y),r=interpolate(b,c,y);return interpolate(l,r,x);};
 ctx.save();ctx.clip();
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const seed=(i*37+j*13+Math.round(lx*.1))%23;if(seed!==2&&seed!==4&&seed!==8&&seed!==9)continue;const p=on((i+.17)/cols,(j+.22)/rows),q=on((i+.83)/cols,(j+.22)/rows),r=on((i+.83)/cols,(j+.76)/rows),t=on((i+.17)/cols,(j+.76)/rows);ctx.fillStyle=seed%2?"#ffd285aa":"#ffc3786b";ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.lineTo(r[0],r[1]);ctx.lineTo(t[0],t[1]);ctx.fill();}
 ctx.strokeStyle="rgba(176,198,201,.40)";ctx.lineWidth=Math.max(.4,w/1350);ctx.beginPath();
 for(let j=1;j<rows;j++){const t=j/rows;ctx.moveTo(a[0]+(d[0]-a[0])*t,a[1]+(d[1]-a[1])*t);ctx.lineTo(b[0]+(c[0]-b[0])*t,b[1]+(c[1]-b[1])*t);}
 for(let j=1;j<cols;j++){const t=j/cols;ctx.moveTo(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);ctx.lineTo(d[0]+(c[0]-d[0])*t,d[1]+(c[1]-d[1])*t);}ctx.stroke();
 ctx.strokeStyle="#f4ce9699";ctx.lineWidth=Math.max(.7,w/900);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(d[0],d[1]);ctx.lineTo(c[0],c[1]);ctx.stroke();ctx.restore();}
 if(metal&&f.m===10&&pts.length===4&&rx-lx>s*.02&&bt-top>s*.07){ctx.strokeStyle="#ffedbdb3";ctx.lineWidth=w/850;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);ctx.stroke();}
 }
 if(city){const p=project([-.11,2.02,-.26]);glow(p[0],p[1],.076*s,"#ffe09c88");
 for(const a of [.75,2.28,3.42,5.65]){const q=project([2.0*Math.cos(a),-.02+Math.cos(a+.2)*.34+Math.sin(a)*.102,1.32*Math.sin(a)]);glow(q[0],q[1],s*.095,"#ffdd93bd");}}
};
}
function Skyline(){return <svg viewBox="0 0 620 300" preserveAspectRatio="none" aria-hidden="true" style={{position:"absolute",inset:"18% 0 auto",width:"100%",height:"65%",opacity:.34}}><g fill="#355567">{Array.from({length:59},(_,i)=>{const x=i*11,w=4+(i*23%11),h=5+((i*37+17)%39)*(i%8===1?1.7:1);return <path key={x} d={`M${x} 241v-${h}h${w*.23}v-${w*.6}h${w*.54}v${w*.6}h${w*.23}v${h}z`}/>;})}</g><path d="M0 245Q143 236 301 246T620 237" fill="none" stroke="#8ba0a1" opacity=".55"/></svg>;}
export default function UniverseScene({kind="city",label}:{kind?:Kind;label?:string}){
 const el=useRef<HTMLDivElement>(null),gpu=useRef<HTMLCanvasElement>(null),cpu=useRef<HTMLCanvasElement>(null),nudge=useRef<(v:number)=>void>(()=>{}),[live,setLive]=useState(false);
 useEffect(()=>{const host=el.current,g=gpu.current,c=cpu.current;if(!host||!g||!c)return;
 let engine:ReturnType<typeof hardware>=null,draw:Draw|null=null,chosen=c,frame=0,visible=false,w=0,h=0,elapsed=0,previous=0,angle=0,offset=0,driftX=0,driftY=0,tx=0,ty=0,drag:number|null=null,lastX=0,displaced=0,scroll=0,started=false,dirty=true;
 const reduce=matchMedia("(prefers-reduced-motion: reduce)"),compact=matchMedia("(max-width:700px)"),touch=matchMedia("(pointer:coarse)");
 function measure(){if(!host)return;const r=host.getBoundingClientRect();const px=Math.min(devicePixelRatio||1,compact.matches?1.35:1.65,940/Math.max(1,r.width));w=Math.max(1,Math.round(r.width*px));h=Math.max(1,Math.round(r.height*px));if(chosen.width!==w||chosen.height!==h){chosen.width=w;chosen.height=h;dirty=true;}updateScroll();}
 function updateScroll(){if(!host||!visible)return;const r=host.getBoundingClientRect();scroll=reduce.matches?0:Math.max(-1,Math.min(1,(innerHeight*.49-r.top-r.height*.5)/innerHeight));dirty=true;schedule();}
 function render(t:number){frame=0;if(!draw||!visible||document.hidden)return;const delay=chosen===c?64:(compact.matches?40:32);if(!dirty&&previous&&t-previous<delay){schedule();return;}const dt=previous?Math.min(.08,(t-previous)/1000):0;previous=t;dirty=false;elapsed+=dt;
 driftX+=(tx-driftX)*.16;driftY+=(ty-driftY)*.16;angle+=(offset-angle)*.16;
 const rest=kind==="city"?-.30:kind==="globe"?-.05:-.24;
 draw(rest+angle+(reduce.matches?0:driftX+.035*Math.sin(elapsed*.3)+scroll*.11),.255+(reduce.matches?0:driftY+scroll*.055),w,h);
 if(!started){started=true;chosen.style.opacity="1";setLive(true);}
 if((chosen!==c&&!reduce.matches&&!touch.matches)||Math.abs(offset-angle)>.001||(!reduce.matches&&(Math.abs(tx-driftX)>.001||Math.abs(ty-driftY)>.001)))schedule();
 }
 function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
 function start(){if(draw||!g||!c)return;const mesh=make(kind);
 engine=hardware(g,mesh,kind==="city");if(engine){draw=engine.draw;chosen=g;}else{draw=software(c,mesh,kind==="city");chosen=c;}measure();}
 function observe(v:boolean){visible=v;if(v){start();measure();schedule();}else{cancelAnimationFrame(frame);frame=0;previous=0;}}
 const io=new IntersectionObserver(entries=>observe(entries[0].isIntersecting),{threshold:.015});io.observe(host);
 const ro=new ResizeObserver(measure);ro.observe(host);
 const m=(e:PointerEvent)=>{if(!host)return;if(drag===e.pointerId){const dx=e.clientX-lastX;if(touch.matches&&Math.abs(e.clientX-displaced)<6)return;offset+=dx*.007;lastX=e.clientX;}
 else if(!touch.matches&&!reduce.matches){const r=host.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*.36;ty=((e.clientY-r.top)/r.height-.5)*.14;}dirty=true;schedule();};
 const down=(e:PointerEvent)=>{if((e.target as HTMLElement).closest('button')||!e.isPrimary)return;drag=e.pointerId;lastX=displaced=e.clientX;host.setPointerCapture?.(e.pointerId);};
 const up=()=>{drag=null;};const leave=()=>{tx=ty=0;dirty=true;schedule();};
 const vis=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0;}else schedule();};
 const motion=()=>{dirty=true;updateScroll();schedule();};
 const loss=(e:Event)=>{e.preventDefault();if(!c)return;engine?.free();engine=null;g.style.opacity="0";draw=software(c,make(kind),kind==="city");chosen=c;started=false;measure();schedule();};
 nudge.current=(v:number)=>{offset+=v;dirty=true;schedule();};
 host.addEventListener("pointerdown",down);host.addEventListener("pointermove",m);host.addEventListener("pointerleave",leave);host.addEventListener("pointerup",up);host.addEventListener("lostpointercapture",up);host.addEventListener("pointercancel",up);g.addEventListener("webglcontextlost",loss);
 window.addEventListener("scroll",updateScroll,{passive:true});document.addEventListener("visibilitychange",vis);reduce.addEventListener("change",motion);
 return ()=>{io.disconnect();ro.disconnect();cancelAnimationFrame(frame);engine?.free();g.style.opacity=c.style.opacity="0";nudge.current=()=>{};host.removeEventListener("pointerdown",down);host.removeEventListener("pointermove",m);host.removeEventListener("pointerleave",leave);host.removeEventListener("pointerup",up);host.removeEventListener("lostpointercapture",up);host.removeEventListener("pointercancel",up);g.removeEventListener("webglcontextlost",loss);window.removeEventListener("scroll",updateScroll);document.removeEventListener("visibilitychange",vis);reduce.removeEventListener("change",motion);};
 },[kind]);
 return <div className="gu-scene" data-kind={kind} ref={el} style={{isolation:"isolate",width:"100%",position:"relative",overflow:"hidden",minWidth:0,aspectRatio:"1.46",borderRadius:"1.45rem",touchAction:"pan-y",background:"radial-gradient(ellipse at 48% 52%,#635849 0%,#3c484f 17%,#23384a 34%,#122936 54%,#071722 84%)"}}>
 <Skyline/><div aria-hidden="true" style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 40% 8% at 50% 78%,#d4a35a22,transparent),radial-gradient(ellipse 45% 36% at 36% 48%,#ba80451f,transparent),linear-gradient(0deg,#071723 0%,transparent 26%)"}}/>
 <div aria-hidden="true" style={{position:"absolute",inset:"8% 4% 12%",opacity:.46,backgroundImage:"radial-gradient(circle at 21% 19%,#ffe4a7 0 1px,transparent 2px),radial-gradient(circle at 63% 13%,#ffe4a7 0 .7px,transparent 2px),radial-gradient(circle at 79% 32%,#8ac9ce 0 1px,transparent 2px)",backgroundSize:"47% 61%,59% 52%,61% 48%"}}/>
 {!live&&<svg aria-hidden="true" viewBox="0 0 160 90" style={{position:"absolute",inset:"19% 18%",width:"64%",height:"62%"}}><g fill="none" stroke="#cfa86b" strokeWidth=".6"><ellipse cx="80" cy="67" rx="70" ry="13"/><ellipse cx="80" cy="68" rx="54" ry="8"/>{kind==="globe"?<><circle cx="80" cy="40" r="28"/><ellipse cx="80" cy="40" rx="11" ry="28"/><ellipse cx="80" cy="40" rx="28" ry="10"/></>:kind==="gold"?<path d="m45 62 6-13h40l6 13zm19-15 6-13h40l6 13z"/>:kind==="energy"?<path d="M78 66V24l-11-10m11 10 16 2m-16-2-3 17"/>:kind==="market"?<path d="M45 57l15-19 11 10 15-20 9 8 21-17"/>:<path d="M47 59V38l7-6 8 6v20m6 2V27l5-3 3-19 3 19 4 3v32m6 1V34l10-8 7 8v26"/>}</g></svg>}
 {[gpu,cpu].map((ref,i)=><canvas aria-hidden="true" ref={ref} key={i} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0,pointerEvents:"none"}}/>)}
 <span role="img" aria-label={label??labels[kind]} style={{position:"absolute",top:"6%",left:"5%",color:"#f1d19a",font:"500 .63rem/1.2 ui-monospace,monospace",letterSpacing:".16em",direction:"ltr"}}>◈ &nbsp;{tags[kind]}</span>
 <div style={{position:"absolute",bottom:"4.1%",left:"5%",right:"5%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,color:"#eee1c9",fontSize:".78rem"}}><span>{label??labels[kind]}</span>{live&&<button type="button" aria-label={"دوّر المجسّم: "+labels[kind]} onClick={()=>nudge.current(.39)} style={{minWidth:44,minHeight:44,padding:"0 12px",lineHeight:1,border:"1px solid #a5916f85",background:"#091c28d9",color:"#f0d4a5",borderRadius:30,cursor:"pointer",fontFamily:"inherit"}}>⟳ &nbsp; تدوير</button>}</div>
 </div>;
}
