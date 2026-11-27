'use strict';
function study(g){
const N=29,seq=n=>Array.from({length:n},(_,i)=>i),rot=(a,k)=>a.slice(k).concat(a.slice(0,k)),move=(a,from,to)=>{a=a.slice();let v=a.splice(from,1)[0];a.splice(to,0,v);return a},eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),check=(a,m)=>{if(!a)throw Error(m)};
function step(L,R,k){let m=Math.floor(L.length/2);return [move(rot(L,k),1,m),move(rot(R,(k+1)%R.length),2,m)]}
function crypt(x,L,R,dec=false){L=L.slice();R=R.slice();const out=[],states=[];for(let v of x){let k=(dec?L:R).indexOf(v);check(k>=0,"unknown");out.push((dec?R:L)[k]);[L,R]=step(L,R,k);states.push([L,R]);}return {out,states}}
const a26=[..."HXUCZVAMDSLKPEFJRIGTWOBNYQ"],b26=[..."PTLNBQDEOYSFAVZKGJRIHWXUMC"],published=crypt([..."WELLDONEISBETTERTHANWELLSAID"],a26,b26).out.join("");check(published==="OAHQHCNYNXTSZJRRHJBYHQKSOUJY","published table control "+published);
let seed=0x3124aa01;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const F=seq(N).map(k=>step(seq(N),seq(N),k));
const undoL=move(seq(N),Math.floor(N/2),1),undoR=rot(move(seq(N),Math.floor(N/2),2),N-1);
const B=seq(N).map(k=>[rot(undoL,k),rot(undoR,k)]);
const perm=(a,p)=>p.map(i=>a[i]);
function recover(p,c,cap=200000,anchors=3){
let n=p.length;const order=seq(n).map(anchor=>{
 let l=anchor-1,r=anchor+1,sl=new Set([c[anchor]]),sr=new Set([p[anchor]]),cost=0,both=0;for(let i=0;i<Math.min(35,n-1);i++){let score=k=>k<0||k>=n?-1:+sl.has(c[k]) + +sr.has(p[k]);let x=score(l),y=score(r);let j=x>=y?l--:r++;if(!sl.has(c[j])&&!sr.has(p[j])){both++;cost+=Math.log(Math.max(1,N-Math.max(sl.size,sr.size)));}sl.add(c[j]);sr.add(p[j]);}return {anchor,cost,both}}).sort((a,b)=>a.cost-b.cost||a.anchor-b.anchor).slice(0,anchors);
let runs=[];for(const {anchor,cost} of order){
const lv=Array(N).fill(-1),rv=Array(N).fill(-1),li=Array(N).fill(-1),ri=Array(N).fill(-1);
function assign(vals,inv,s,v){if(vals[s]===v)return false;check(vals[s]===-1&&inv[v]===-1,"assign contradiction");vals[s]=v;inv[v]=s;return true}
function unassign(vals,inv,s,v,a){if(a){vals[s]=-1;inv[v]=-1}}
assign(lv,li,0,c[anchor]);assign(rv,ri,N-1,p[anchor]);
const counters={nodes:0,dead:0,branches:0,maxDepth:1};let capped=false,solution=null;
function choices(L,R,x,y,back){let out=[],l=li[x],r=ri[y];for(let k=0;k<N;k++){let i=L[k],j=R[back?(k+N-1)%N:k];if((l>=0?i===l:lv[i]===-1)&&(r>=0?j===r:rv[j]===-1))out.push([k,i,j]);}return out}
function visit(lo,hi,L0,R0,L1,R1){
if(++counters.nodes>cap){capped=true;return false}counters.maxDepth=Math.max(counters.maxDepth,hi-lo+1);
if(lo===0&&hi===n-1){solution={lv:lv.slice(),rv:rv.slice(),anchor,L1:L1.slice(),R1:R1.slice(),L0:L0.slice(),R0:R0.slice()};return true}
let forward=hi<n-1?choices(L1,R1,c[hi+1],p[hi+1],false):null;
let BL=lo>0?perm(L0,undoL):null,BR=lo>0?perm(R0,undoR):null;
let backward=lo>0?choices(BL,BR,c[lo-1],p[lo-1],true):null;
if(forward?.length===0||backward?.length===0){counters.dead++;return false}
let back=forward===null||(backward!==null&&backward.length<=forward.length),opts=back?backward:forward,at=back?lo-1:hi+1,x=c[at],y=p[at];
if(opts.length>1)counters.branches++;
for(let [k,i,j] of opts){let al=assign(lv,li,i,x),ar=assign(rv,ri,j,y),ok;if(back){ok=visit(lo-1,hi,perm(L0,B[k][0]),perm(R0,B[k][1]),L1,R1)}else{ok=visit(lo,hi+1,L0,R0,perm(L1,F[k][0]),perm(R1,F[k][1]))}
if(ok)return true;unassign(lv,li,i,x,al);unassign(rv,ri,j,y,ar);if(capped)return false;}
return false;
}
visit(anchor,anchor,seq(N),seq(N),seq(N),seq(N));
runs.push({anchor,cost,...counters,capped,solved:!!solution});if(solution)return {runs,solution};
}
return {runs,solution:null};
}
const native=g.sections.map(x=>({name:x.name,p:[...x.source_text].filter(c=>g.runes.includes(c)).map(c=>g.runes.indexOf(c))}));
const trainAll=native.slice(0,7).flatMap(x=>x.p);
function plant(p,h,cap,anchors){const L=shuffle(seq(N)),R=shuffle(seq(N));const z=crypt(p.concat(h),L,R);check(eq(crypt(z.out,L,R,true).out,p.concat(h)),"GP29 roundtrip");const res=recover(p,z.out.slice(0,p.length),cap,anchors);let out={n:p.length,held:h.length,ptDistinct:new Set(p).size,ctDistinct:new Set(z.out.slice(0,p.length)).size,runs:res.runs};if(!res.solution)return out;const s=res.solution,truth=z.states[s.anchor];out.knownLeft=s.lv.filter(v=>v>=0).length;out.knownRight=s.rv.filter(v=>v>=0).length;out.correctKnownLeft=s.lv.every((x,i)=>x===-1||x===truth[0][i]);out.correctKnownRight=s.rv.every((x,i)=>x===-1||x===truth[1][i]);const fill=a=>{let miss=seq(N).filter(x=>!a.includes(x));return a.map(x=>x<0?miss.shift():x)};let endL=perm(fill(s.lv),s.L1),endR=perm(fill(s.rv),s.R1);out.heldExact=crypt(z.out.slice(p.length),endL,endR,true).out.filter((x,i)=>x===h[i]).length;out.cipherRepeats=z.out.slice(1).filter((x,i)=>x===z.out[i]).length;return out}
return {publishedControl:published,tests:[plant(native[1].p.slice(0,223),native[1].p.slice(223,309),100000,3),plant(native[3].p.slice(0,223),native[3].p.slice(223,309),100000,3),plant(trainAll.slice(0,1000),trainAll.slice(1000,1086),200000,3)]};
}
const fs=require('node:fs');const path=require('node:path');console.log(JSON.stringify(study(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/external/relikd-solved-gp29-native-v1.json'),'utf8'))),null,2));
