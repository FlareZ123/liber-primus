'use strict';
const fs=require('node:fs');
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[3]),ix=new Map(gp.runes.map((r,i)=>[r,i])),assert=(v,m)=>{if(!v)throw Error(m)};
 const words=[];let page=0,w=[],start=0;const finish=()=>{if(w.length){words.push({w,page:start>=50?start+1:start});w=[];}};
 for(const c of raw[1].split('%').slice(0,55).join('%')){if(ix.has(c)){if(!w.length)start=page;w.push(ix.get(c));}else if(c==='%')page++;else if(c==='/'||/\s/u.test(c))continue;else finish();}finish();
 assert(words.length===2896&&words.flatMap(x=>x.w).join()===gp.pages.slice(0,56).flatMap(p=>p.indices).join(),'canonical parse');
 const C=words.filter(x=>x.page>=54).slice(2).map(x=>x.w);assert(C.length===64&&C.flat().length===299&&C.flat().join()===gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join(),'terminal');
 const tok=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),D=new Map();
 function add(a){if(a.length<1||a.length>14)return;const k=a.join(',');if(!D.has(a.length))D.set(a.length,new Map());D.get(a.length).set(k,a);}
 for(const line of raw[2].split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/i);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');for(const alt of [false,true]){const a=[];let j=0;while(j<s.length){const t=alt&&s.startsWith('ING',j)?{t:'ING',i:21}:alt&&s.startsWith('IO',j)?{t:'IO',i:27}:tok.find(t=>s.startsWith(t.t,j));assert(t,'unmapped '+s);a.push(t.i);j+=t.t.length;}add(a);}}
 for(const sec of gold.sections)for(const s of sec.source_text.split(/[^\u16a0-\u16ff]+/u)){if(s&&[...s].every(c=>ix.has(c)))add([...s].map(c=>ix.get(c)));}
 const pack=w=>w.reduce((n,x)=>29n*n+BigInt(x),0n),mod=(x,m)=>(x%m+m)%m;
 const M=L=>29n**BigInt(L)-1n;
 const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};
 function inv(a,m){let x=0n,y=1n,b=m;while(a){const q=b/a;[b,a]=[a,b-q*a];[x,y]=[y,x-q*y];}assert(b===1n,'nonunit');return mod(x,m);}
 function unpack(n,L){const a=Array(L);for(let j=L-1;j>=0;j--){a[j]=Number(n%29n);n/=29n;}return a;}
 const rev=w=>[...w].reverse(),rot=(w,i)=>w.slice(i).concat(w.slice(0,i));
 const variants=w=>{const s=new Map();for(const a of [w,rev(w)])for(let i=0;i<w.length;i++){const v=rot(a,i);s.set(v.join(),v)}return [...s.values()]};
 function canon(k,m,L){let b=k;for(let i=1;i<L;i++){k=k*29n%m;if(k<b)b=k;}return b;}
 const widths=[6,7,8,10];
 const lex=new Map(widths.map(L=>[L,[...D.get(L).values()].map(w=>({w,v:[...new Set([pack(w),pack(rev(w))])]}))]));
 // Each candidate key orbit permits independent dihedral views of the plaintext and ciphertext.
 // Zero and all-max sentinel remain distinct. For nonunit c solve the linear congruence exactly,
 // but give the entire anchor a free pass if gcd exceeds the fixed enumeration cap.
 function domain(c){
  const L=c.length,m=M(L),cv=[...new Set([pack(c),pack(rev(c))])],out=new Set(),g=cv.map(x=>gcd(x,m));
  if(g.some(x=>x>2048n))return {keys:null,g:g.map(String)};
  for(let i=0;i<cv.length;i++){const d=g[i],q=m/d;if(q===1n)return {keys:null,g:g.map(String)};const u=inv(cv[i]/d,q);
   for(const {v} of lex.get(L))for(const p of v){if(p===m||p%d)continue;const base=mod(u*(p/d),q);
    for(let j=0n;j<d;j++){const k=base+j*q;if(gcd(k,m)===1n)out.add(canon(k,m,L));}
   }
  }
  return {keys:out,g:g.map(String)};
 }
 function decode(c,k){const m=M(c.length),out=new Map();for(const v of variants(c)){const x=pack(v),p=x===m?m:k*x%m;for(const u of variants(unpack(p,c.length)))if(D.get(c.length).has(u.join()))out.set(u.join(),u);}return [...out.values()];}
 function solve(A){const results=[];for(const L of widths){const rows=A.map((w,i)=>({w,i})).filter(x=>x.w.length===L);const counts=new Map(),domains=[];let free=0,max=0;
  for(const {w,i} of rows){const {keys,g}=domain(w);domains.push({i,g,n:keys?.size??null});if(!keys){free++;continue;}for(const k of keys){const n=(counts.get(k)||0)+1;counts.set(k,n);if(n>max)max=n;}}
  const winners=[...counts].filter(x=>x[1]===max).map(x=>x[0]);const examples=winners.slice(0,3).map(k=>({key:String(k),readings:rows.map(({w,i})=>({i,words:decode(w,k).slice(0,4).map(x=>x.map(r=>gp.translit[r]).join(''))})).filter(r=>r.words.length)}));
  results.push({L,groups:rows.length,domains,max,maxWithFree:max+free,ties:winners.length,union:counts.size,examples,winners});
 }return results;}
 let state=0x10333301;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state;};
 function plant(){const K=new Map();for(const L of widths){const m=M(L);let k;do{k=(BigInt(rand())<<32n|BigInt(rand()))%m;}while(gcd(k,m)!==1n);K.set(L,k);}
  const P=C.map(w=>{const a=[...D.get(w.length).values()];return a[rand()%a.length]});
  const E=P.map(p=>{if(!K.has(p.length))return p;const L=p.length,m=M(L),k=K.get(L),a=variants(p),u=a[rand()%a.length],n=pack(u),x=n===m?m:inv(k,m)*n%m;assert(x===m||k*x%m===n,'forward replay');const z=variants(unpack(x,L));return z[rand()%z.length];});
  const fit=solve(E.slice(0,47));return fit.map(r=>{const k=canon(K.get(r.L),M(r.L),r.L),retain=r.winners.includes(k)||r.domains.every(x=>x.n===null);assert(retain&&r.maxWithFree===r.groups,'plant lost');let held=0,heldRunes=0,unique=0,uniqueRunes=0;if(r.winners.length===1){for(let i=47;i<64;i++)if(E[i].length===r.L){const a=decode(E[i],r.winners[0]);assert(a.some(w=>w.join()===P[i].join()),'held truth lost');held++;heldRunes+=P[i].length;if(a.length===1){unique++;uniqueRunes+=P[i].length;}}}return {L:r.L,groups:r.groups,ties:r.ties,retain,held,heldRunes,unique,uniqueRunes};});
 }
 const original=solve(C.slice(0,47));for(const r of original)delete r.winners;
 return {model:"per-width secret unit multiplication modulo 29^L-1, arbitrary dihedral views on both sides, all-max sentinel fixed",lexicon:[...D.values()].reduce((n,s)=>n+s.size,0),source:{fitWords:47,fitRunes:213,holdWords:17,holdRunes:86},original,minimumOOV:original.reduce((n,r)=>n+r.groups-r.maxWithFree,0),controls:[plant(),plant()]};
}
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(p,'utf8'))),null,2));
