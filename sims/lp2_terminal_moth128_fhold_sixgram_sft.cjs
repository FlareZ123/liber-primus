'use strict';
/** Read-only paired GP29 latent-F six-gram decoder, fixed source-selected 128/128 tracks. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tokens=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
/** @param {string} s @returns {number[]} */
function encode(s){
 const out=[];
 for(const w of (s.toUpperCase().replaceAll('QU','CW').replaceAll('V','U').replaceAll('K','C').replaceAll('Q','C').replaceAll('Z','S').match(/[A-Z]+/g)||[]))
 for(let i=0;i<w.length;){
  if(w.startsWith('ING',i)){out.push(21);i+=3;}
  else if(w.startsWith('IO',i)){out.push(27);i+=2;}
  else {const [tok,k]=tokens.find(([t])=>w.startsWith(t,i));out.push(k);i+=tok.length;}
 }
 return out;
}
const e=encode(read('resources/control/emerson_essays_2944.txt')),g=encode(read('resources/control/gibran_prophet_58585.txt')),s=encode(read('resources/control/shakespeare_first300k.txt'));
const Q=29, ORDER=5, pow=Array.from({length:ORDER+2},(_,i)=>Q**i),maps=Array.from({length:ORDER+1},()=>new Map()),states=[];
function get(l,c){let id=maps[l].get(c);if(id===undefined){id=states.length;maps[l].set(c,id);states.push({l,c,h:new Uint32Array(Q)});}return id;}
get(0,0);
for(const t of [e,g.slice(0,Math.floor(g.length*.67)),s.slice(0,Math.floor(s.length*.67))])
 for(let i=0;i<t.length;i++){let c=0;states[0].h[t[i]]++;for(let l=1;l<=ORDER&&l<=i;l++){c+=t[i-l]*pow[l-1];states[get(l,c)].h[t[i]]++;}}
const ns=states.length,lp=new Float32Array(ns*Q),next=new Uint32Array(ns*Q);
assert.deepEqual([e.length,Math.floor(g.length*.67),Math.floor(s.length*.67),ns],[321327,41869,145461,204545]);
for(let l=0;l<=ORDER;l++)for(const [c,id] of maps[l]){
 const h=states[id].h;let total=0,d=0;
 for(const n of h){total+=n;if(n)d++;}
 const back=l?maps[l-1].get(c%pow[l-1]):0;
 for(let a=0;a<Q;a++){
  const alpha=l?Math.max(1,d):14.5,p0=l?Math.exp(lp[back*Q+a]):1/Q;
  lp[id*Q+a]=Math.log((h[a]+alpha*p0)/(total+alpha));
  let k=Math.min(ORDER,l+1),v=(c*Q+a)%pow[k],to;
  while((to=maps[k].get(v))===undefined){k--;v%=pow[k];}
  next[id*Q+a]=to;
 }
}
let rng=0x5279f1a3;
function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
function enc(p,k){let j=0;return p.map(x=>x===0?0:(x+k[j++])%Q);}
function zc(t){return t.filter(x=>x===0).length;}
const usedG=[],usedS=[];
function plant(fresh){
 for(let outer=0;outer<1000;outer++){
  let ga=Math.floor(g.length*.67)+rand(g.length-Math.floor(g.length*.67)-128),sa=Math.floor(s.length*.67)+rand(s.length-Math.floor(s.length*.67)-128);
  if(fresh&&(usedG.some(i=>Math.abs(i-ga)<128)||usedS.some(i=>Math.abs(i-sa)<128)))continue;
  const a=g.slice(ga,ga+128),b=s.slice(sa,sa+128);
  if(zc(a)>4||zc(b)>4)continue;
  for(let j=0;j<1000;j++){
   const k=Array.from({length:128},()=>rand(Q)),ca=enc(a,k),cb=enc(b,k);
   if(zc(ca)!==4||zc(cb)!==4)continue;
   let neg;
   for(let n=0;n<1000;n++){const d=enc(b,Array.from({length:128},()=>rand(Q)));if(zc(d)===4){neg=d;break;}}
   if(neg){usedG.push(ga);usedS.push(sa);return {a,b,ca,cb,neg,ga,sa};}
  }
 }
 throw Error('plant');
}
/** @param {number[]} a @param {number[]} b @param {number} B */
function decode(a,b,B){
 const na=a.length,nb=b.length,bonus=Math.log(Q),grid=new Map();
 grid.set(0,new Map([[0,{s:0,x:0,y:0,prev:null,pa:-1,pb:-1}]]));let expansions=0;
 function put(i,j,pa,pb,node,inc){
  const x=pa<0?node.x:next[node.x*Q+pa],y=pb<0?node.y:next[node.y*Q+pb],sc=node.s+inc+(pa<0?0:lp[node.x*Q+pa])+(pb<0?0:lp[node.y*Q+pb]);
  let z=i*(nb+1)+j,m=grid.get(z);if(!m){m=new Map();grid.set(z,m);}
  let key=x*ns+y,old=m.get(key);if(!old||sc>old.s)m.set(key,{s:sc,x,y,prev:node,pa,pb});expansions++;
 }
 for(let sum=0;sum<=na+nb;sum++)for(let i=Math.max(0,sum-nb);i<=Math.min(na,sum);i++){
  const j=sum-i,z=i*(nb+1)+j,m=grid.get(z);if(!m)continue;
  const nodes=[...m.values()].sort((a,b)=>b.s-a.s).slice(0,B);grid.delete(z);
  if(i===na&&j===nb){
   let p=nodes[0],aa=[],bb=[];for(let n=p;n.prev;n=n.prev){if(n.pa>=0)aa.push(n.pa);if(n.pb>=0)bb.push(n.pb);}
   return {score:p.s,a:aa.reverse(),b:bb.reverse(),expansions};
  }
  for(const n of nodes){
   if(i<na&&a[i]===0)put(i+1,j,0,-1,n,bonus);
   if(j<nb&&b[j]===0)put(i,j+1,-1,0,n,bonus);
   if(i<na&&j<nb){const d=(b[j]-a[i]+Q)%Q;for(let pa=1;pa<Q;pa++){let pb=(pa+d)%Q;if(pb)put(i+1,j+1,pa,pb,n,bonus);}}
   else if(i<na){for(let pa=1;pa<Q;pa++)put(i+1,j,pa,-1,n,0);}
   else if(j<nb){for(let pb=1;pb<Q;pb++)put(i,j+1,-1,pb,n,0);}
  }
 }
 throw Error('no path');
}
const acc=(a,b)=>a.reduce((z,v,i)=>z+(v===b[i]),0);
function replay(a,b,pa,pb){
 let ka=[],kb=[];
 for(let i=0;i<a.length;i++){if(pa[i]===0){assert.equal(a[i],0);}else ka.push((a[i]-pa[i]+Q)%Q);}
 for(let i=0;i<b.length;i++){if(pb[i]===0){assert.equal(b[i],0);}else kb.push((b[i]-pb[i]+Q)%Q);}
 assert(ka.slice(0,Math.min(ka.length,kb.length)).every((v,i)=>v===kb[i]));
 return Math.min(ka.length,kb.length);
}
function controls(n,fresh){
 const result=[];
 for(let i=0;i<n;i++){
  const t=plant(fresh),pos=decode(t.ca,t.cb,256),neg=decode(t.ca,t.neg,256);
  const row={i,offsets:[t.ga,t.sa],pos:pos.score,neg:neg.score,accuracy:[acc(t.a,pos.a),acc(t.b,pos.b)],expansions:pos.expansions,truthF:[zc(t.a),zc(t.b)],shared:replay(t.ca,t.cb,pos.a,pos.b)};
  result.push(row);console.log(JSON.stringify(row));
 }
 return result;
}
const pilot=controls(4,false),cutoff=-29.36509;
assert(Math.abs((Math.min(...pilot.map(x=>x.pos))+Math.max(...pilot.map(x=>x.neg)))/2-cutoff)<1e-4);
rng=0xab26f731;
const fresh=controls(12,true),good=fresh.filter(x=>x.pos>cutoff).length,bad=fresh.filter(x=>x.neg<=cutoff).length;
console.log(JSON.stringify({cutoff,good,bad,meanAccuracy:fresh.reduce((z,x)=>z+x.accuracy[0]+x.accuracy[1],0)/(24*128)}));
assert(good>=11&&bad>=11,'calibration gate failed');
const a=corpus.pages.find(x=>x.page===53).indices,b=corpus.pages.find(x=>x.page===54).indices,c=corpus.pages.find(x=>x.page===55).indices,x=a.slice(0,128),y=[...a.slice(128),b[0],...c];
assert.deepEqual([x.length,y.length,zc(x),zc(y)],[128,128,4,4]);
const z=decode(x,y,256);
console.log(JSON.stringify({original:{score:z.score,passes:z.score>cutoff,shared:replay(x,y,z.a,z.b),a:z.a.map(i=>corpus.translit[i]).join(''),b:z.b.map(i=>corpus.translit[i]).join(''),aIndices:z.a,bIndices:z.b,expansions:z.expansions}}));
assert(z.score<=cutoff);
