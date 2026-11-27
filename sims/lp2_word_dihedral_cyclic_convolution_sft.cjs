'use strict';
const fs=require('node:fs'),path=require('node:path');
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[3]),ix=new Map(gp.runes.map((r,i)=>[r,i])),assert=(v,m)=>{if(!v)throw Error(m)};
 const words=[];let page=0,w=[],start=0;const finish=()=>{if(w.length){words.push({w,page:start>=50?start+1:start});w=[];}};
 for(const c of raw[1].split('%').slice(0,55).join('%')){if(ix.has(c)){if(!w.length)start=page;w.push(ix.get(c));}else if(c==='%')page++;else if(c==='/'||/\s/u.test(c))continue;else finish();}
 finish();assert(words.length===2896&&words.flatMap(x=>x.w).join()===gp.pages.slice(0,56).flatMap(p=>p.indices).join(),'canonical parse');
 const C=words.filter(x=>x.page>=54).slice(2).map(x=>x.w);
 assert(C.length===64&&C.flat().length===299&&C.flat().join()===gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join(),'terminal body');
 const tok=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length), D=new Map();
 function add(a){if(a.length<1||a.length>14)return;const k=a.join(',');if(!D.has(a.length))D.set(a.length,new Map());D.get(a.length).set(k,a);}
 for(const line of raw[2].split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/i);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');for(const alt of [false,true]){const a=[];let j=0;while(j<s.length){const t=alt&&s.startsWith('ING',j)?{t:'ING',i:21}:alt&&s.startsWith('IO',j)?{t:'IO',i:27}:tok.find(t=>s.startsWith(t.t,j));assert(t,'unmapped '+s);a.push(t.i);j+=t.t.length;}add(a);}}
 for(const sec of gold.sections)for(const s of sec.source_text.split(/[^\u16a0-\u16ff]+/u)){if(s&&[...s].every(c=>ix.has(c)))add([...s].map(c=>ix.get(c)));}
 const rot=(w,i)=>w.slice(i).concat(w.slice(0,i));
 const variants=w=>{const r=new Map();for(const a of [w,[...w].reverse()])for(let j=0;j<w.length;j++){const b=rot(a,j);r.set(b.join(),b)}return [...r.values()]};
 const pack=w=>w.reduce((n,x)=>29*n+x,0),bigpack=w=>w.reduce((n,x)=>29n*n+BigInt(x),0n),mod=(x,m)=>(x%m+m)%m;

 const invs=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(b=>a*b%29===1):0);
 const m29=x=>(x%29+29)%29;
 function conv(a,b){const L=a.length,out=Array(L).fill(0);for(let i=0;i<L;i++)for(let j=0;j<L;j++)out[(i+j)%L]+=a[i]*b[j];return out.map(m29);}
 function rankSolver(c){
  const L=c.length,A=Array.from({length:L},(_,i)=>Array.from({length:2*L},(_,j)=>j<L?c[(i-j+L)%L]:+(i===j-L)));
  const piv=[];let r=0;for(let j=0;j<L;j++){let k=r;while(k<L&&A[k][j]===0)k++;if(k===L)continue;[A[r],A[k]]=[A[k],A[r]];let q=invs[A[r][j]];A[r]=A[r].map(x=>x*q%29);for(let i=0;i<L;i++)if(i!==r&&A[i][j]){q=A[i][j];A[i]=A[i].map((x,k)=>m29(x-q*A[r][k]));}piv.push(j);r++;}
  const free=Array.from({length:L},(_,i)=>i).filter(i=>!piv.includes(i));
  const basis=free.map(j=>{const v=Array(L).fill(0);v[j]=1;for(let i=0;i<r;i++)v[piv[i]]=m29(-A[i][j]);return v;});
  function solve(p,fn){
   const y=A.map(a=>a.slice(L).reduce((n,x,i)=>n+x*p[i],0)%29);
   if(y.slice(r).some(Boolean))return;
   const v=Array(L).fill(0);for(let i=0;i<r;i++)v[piv[i]]=y[i];
   function rec(i){if(i===basis.length){fn(v);return;}for(let j=0;j<29;j++){rec(i+1);for(let k=0;k<L;k++)v[k]=(v[k]+basis[i][k])%29;}}
   rec(0);
  }
  return {r,free,basis,solve};
 }
 function canon(a){return Math.min(...variants(a).map(pack));}
 function unpack(n,L){const a=Array(L);for(let i=L-1;i>=0;i--){a[i]=n%29;n=Math.floor(n/29);}return a;}
 function domain(c){
  const S=rankSolver(c),L=c.length,out=new Set();
  if(S.free.length>2)return {r:S.r,keys:null};
  // By changing both orientations together we can fix c. Rotating the
  // plaintext merely rotates the key, so the key orbit needs two P options.
  for(const p of D.get(L).values())for(const v of [p,[...p].reverse()])S.solve(v,k=>out.add(canon(k)));
  return {r:S.r,keys:out};
 }
 function decode(c,k){const a=unpack(k,c.length),out=new Map();for(const x of variants(c)){const b=conv(a,x);for(const p of variants(b))if(D.get(c.length).has(p.join()))out.set(p.join(),p);}return [...out.values()];}
 function receiver(C){
 const by=new Map();for(let i=0;i<C.length;i++){const w=C[i];if(w.length<6||w.length>10)continue;if(!by.has(w.length))by.set(w.length,[]);by.get(w.length).push({w,i});}
 const out=[];for(const [L,ws] of by){const counts=new Map(),domains=[];let max=0,skipped=0;for(const {w,i} of ws){const {r,keys}=domain(w);domains.push({i,r,n:keys?.size??null});if(!keys){skipped++;continue;}for(const k of keys){const n=(counts.get(k)||0)+1;counts.set(k,n);max=Math.max(max,n);}}
 const winners=[];for(const [k,n] of counts)if(n===max)winners.push(k);
 const examples=winners.slice(0,3).map(k=>({k,unit:rankSolver(unpack(k,L)).r===L,readings:ws.map(({w,i})=>({i,words:decode(w,k).slice(0,4).map(p=>p.map(x=>gp.translit[x]).join(''))})).filter(r=>r.words.length)}));
 out.push({L,groups:ws.length,domains,union:counts.size,max,maxWithSkipped:max+skipped,ties:winners.length,examples,winners});
 }
 return {strata:out.sort((a,b)=>a.L-b.L),minimumOOV:out.reduce((n,r)=>n+r.groups-r.maxWithSkipped,0)};
 }
 let seed=0x273301;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 const controls=[];
 for(let t=0;t<2;t++){
 const key=new Map();for(const L of [6,7,8,10]){let a;do{a=Array.from({length:L},()=>rand()%29);}while(rankSolver(a).r!==L);key.set(L,a);}
 const plain=C.map(w=>{const a=[...D.get(w.length).values()];return a[rand()%a.length]});
 const cipher=plain.map(w=>{const L=w.length;if(!key.has(L))return w;const a=key.get(L),vs=variants(w),v=vs[rand()%vs.length];let p;rankSolver(a).solve(v,x=>p=[...x]);assert(p,'unit solve');assert(conv(a,p).join()===v.join(),'replay');const z=variants(p);return z[rand()%z.length];});
 const fit=receiver(cipher.slice(0,47));
 const stats=[];for(const r of fit.strata){const k=canon(key.get(r.L));assert(r.maxWithSkipped===r.groups,'plant omitted');const retained=r.winners.includes(k)||r.domains.every(d=>d.n===null);assert(retained,'true key orbit missing');let held=0,unique=0,heldRunes=0,uniqueRunes=0;if(r.winners.length===1){for(let i=47;i<64;i++)if(cipher[i].length===r.L){const d=decode(cipher[i],r.winners[0]);assert(d.some(w=>w.join()===plain[i].join()),'truth absent');held++;heldRunes+=plain[i].length;if(d.length===1){unique++;uniqueRunes+=plain[i].length;}}}stats.push({L:r.L,groups:r.groups,rank:r.domains.map(d=>d.r),ties:r.ties,key:k,retained,held,heldRunes,unique,uniqueRunes});}
 controls.push(stats);
 }
 const original=receiver(C.slice(0,47));for(const r of original.strata)delete r.winners;
 return {source:{words:C.length,runes:C.flat().length,fitWords:47,fitRunes:213,holdWords:17,holdRunes:86},lexicon:[...D.values()].reduce((n,s)=>n+s.size,0),model:"independent per-width cyclic convolution in GF29[x]/(x^L-1), both sides arbitrary dihedral, including nonunit kernels as relaxation",original,controls};
}

console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
