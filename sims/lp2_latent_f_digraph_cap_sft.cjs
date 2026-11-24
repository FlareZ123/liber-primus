"use strict";
// #2628: exact per-bin maxima over all latent-F masks; no mapping fit.
const fs=require("node:fs"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
function caps(c){const a=new Uint16Array(841);for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++){a[c[i]*29+c[j]]++;if(c[j]!==0)break;}return a;}
function hist(a){const h=new Uint16Array(841);for(let i=0;i+1<a.length;i+=2)h[a[i]*29+a[i+1]]++;return h;}
function exactMax(c,t){let d=new Int32Array(30).fill(-99999),e=new Int32Array(30);d[29]=0;for(const x of c){e.fill(-99999);if(x===0)e.set(d);e[x]=Math.max(e[x],d[29]);for(let a=0;a<29;a++)e[29]=Math.max(e[29],d[a]+(a*29+x===t?1:0));[d,e]=[e,d];}return d[29];}
const toy=[0,1,0,1,1,0,2,2,0,1,2,0,1],z=toy.flatMap((x,i)=>x===0?[i]:[]),brute=new Uint16Array(841);
for(let m=0;m<1<<z.length;m++){const skip=new Set(z.filter((_,i)=>m>>i&1));const a=toy.filter((_,i)=>!skip.has(i));if(a.length%2)continue;const h=hist(a);h.forEach((x,i)=>brute[i]=Math.max(brute[i],x));}
for(let i=0;i<841;i++)assert.equal(exactMax(toy,i),brute[i]);
const cap=caps(C),exact=[...cap].map((x,i)=>x?exactMax(C,i):0);
const sorted=exact.slice().sort((a,b)=>b-a);
assert.equal(C.length,3008);assert.equal(C.filter(x=>x===0).length,125);assert.equal(sorted[0],13);
const summax=k=>{let s=0;for(const x of sorted){const v=Math.min(k,x);s+=v*(v-1);k-=v;if(k===0)break;}return s;};
const minDistinct=k=>{let d=0;for(const x of sorted){k-=x;d++;if(k<=0)return d;}return Infinity;};
const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert.ok(t);out.push(t.i);w=w.slice(t.s.length);}}return out;}
const files=["shakespeare_first300k.txt","emerson_essays_2944.txt","gibran_prophet_58585.txt"];
const controls=files.map(file=>{const P=native(read("resources/control/"+file)),out=[];for(let i=0;i<32;i++){const start=Math.round(i*(P.length-C.length)/31);const a=P.slice(start,start+C.length).filter(v=>v!==0),h=hist(a),n=Math.floor(a.length/2),max=Math.max(...h),collision=[...h].reduce((s,x)=>s+x*(x-1),0),distinct=h.filter(x=>x>0).length;out.push({start,n,max,collision,distinct,bound:summax(n),minDistinct:minDistinct(n)});}return {file,windows:out,passes:out.filter(x=>x.max<=sorted[0]).length,minGap:Math.min(...out.map(x=>x.collision-x.bound))};});
assert.ok(controls.every(x=>x.passes===0&&x.minGap>0));
const mp=new Map(gp.runes.map((x,i)=>[x,i])),sections=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")).sections;
let seed=0x2d1a36;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
function plant(p){const positions=p.flatMap((v,i)=>v===0?[]:[i]);if(positions.length%2)p=p.slice(0,positions.pop());const active=p.filter(v=>v!==0);const shuffled=Array.from({length:841},(_,i)=>i);for(let i=840;i>0;i--){let j=rand()%(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}const f=new Map(),inv=new Map();let k=0;for(let a=1;a<29;a++)for(let b=1;b<29;b++){f.set(a*29+b,shuffled[k]);inv.set(shuffled[k++],a*29+b);}const cipher=p.slice(),rec=p.slice();for(let i=0;i<positions.length;i+=2){const a=positions[i],b=positions[i+1],y=f.get(p[a]*29+p[b]);cipher[a]=Math.floor(y/29);cipher[b]=y%29;const x=inv.get(cipher[a]*29+cipher[b]);rec[a]=Math.floor(x/29);rec[b]=x%29;}assert.deepEqual(rec,p);const ct=positions.map(i=>cipher[i]),pHist=[...hist(active)].sort((a,b)=>b-a),cHist=[...hist(ct)].sort((a,b)=>b-a);assert.deepEqual(pHist,cHist);const h=hist(ct);h.forEach((x,i)=>{if(x)assert.ok(x<=exactMax(cipher,i));});return {runes:p.length,active:active.length,trueF:p.filter(x=>x===0).length,visibleF:cipher.filter(x=>x===0).length,hiddenConsumingF:ct.filter(x=>x===0).length,recovered:rec.length,max:pHist[0],cap:Math.max(...caps(cipher))};}
const plants=[1,4].map(i=>({name:sections[i].name,...plant([...sections[i].source_text].filter(v=>mp.has(v)).map(v=>mp.get(v)))}));
console.log(JSON.stringify({sourceLength:C.length,sourceFs:125,sourceCaps:Math.max(...cap),exactTop:sorted.slice(0,15),exactCapSum:sorted.reduce((a,b)=>a+b,0),collisionBound:[summax(1442),summax(1504)],minDistinct:[minDistinct(1442),minDistinct(1504)],controls,plants},null,2));
