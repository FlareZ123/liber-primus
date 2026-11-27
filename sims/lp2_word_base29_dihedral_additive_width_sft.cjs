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
 const cache=new Map();
 function table(L,d){const k=Math.min(L,d),id=L+','+k;if(cache.has(id))return cache.get(id);const s=new Set();for(const w of D.get(L).values())for(const a of variants(w))s.add(pack(a.slice(-k)));cache.set(id,s);return s;}
 function row(w,d){const k=Math.min(w.length,d),m=29**k,cs=[...new Set(variants(w).map(a=>pack(a.slice(-k))))],ps=table(w.length,d);return {L:w.length,k,m,cs,ps};}
 function domain(r){const s=new Set();for(const c of r.cs)for(const p of r.ps)s.add(p>=c?p-c:p-c+r.m);return s;}
 function supported(r,key){const k=key%r.m;for(const c of r.cs){const p=c+k;if(r.ps.has(p>=r.m?p-r.m:p))return true;}return false;}
 // d=6, all 29^6 residues exactly represented by seven mandatory anchors,
 // because no more than 3 complete fit words may be outside the lexicon.
 function recover(C,budget=3){
 const rows=C.map((w,i)=>({...row(w,6),i}));const anchor=rows.filter(r=>r.L>=6).sort((a,b)=>a.cs.length*a.ps.size-b.cs.length*b.ps.size||a.i-b.i).slice(0,7);assert(anchor.length===7,'anchor count');
 let hits=new Map(),sizes=[];for(const r of anchor){const d=domain(r);sizes.push([r.i,r.L,d.size]);for(const k of d)hits.set(k,(hits.get(k)||0)+1)}
 const candidates=[];let maxAnchor=0,anchorPass=0,maxFit=0;for(const [k,n] of hits){maxAnchor=Math.max(maxAnchor,n);if(n<7-budget)continue;anchorPass++;let c=0;for(const r of rows)if(supported(r,k))c++;maxFit=Math.max(maxFit,c);if(c>=C.length-budget)candidates.push(k);}
 // For keys outside anchor union or failing anchor threshold, at least 4
 // fit groups fail, hence fit coverage <= fit count - 4.
 const maxFitUpper=Math.max(C.length-budget-1,maxFit);
 return {sizes,union:hits.size,maxAnchor,anchorPass,maxFitAmongAnchorPass:maxFit,maxFitUpper,candidates:candidates.sort((a,b)=>a-b)};
 }
 function unpack(n,L){let a=Array(L);for(let i=L-1;i>=0;i--){a[i]=Number(n%29n);n/=29n}return a;}
 function decode(w,k){const m=29n**BigInt(w.length),found=new Map();for(const c of variants(w)){const a=unpack(mod(bigpack(c)+BigInt(k),m),w.length);for(const p of variants(a))if(D.get(w.length).has(p.join()))found.set(p.join(),p);}return [...found.values()];}
 // For a fully specified representative key, replay each retained plaintext
 // by recovering the matching latent pair of orientations.
 function replay(c,p,k){const m=29n**BigInt(c.length),C=new Set(variants(c).map(x=>x.join()));for(const x of variants(p)){const y=unpack(mod(bigpack(x)-BigInt(k),m),c.length);if(C.has(y.join()))return true;}return false;}
 let seed=0x33011033;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 function widthReceiver(C){
 const by=new Map();for(let i=0;i<C.length;i++){const w=C[i];if(w.length<6)continue;if(!by.has(w.length))by.set(w.length,[]);by.get(w.length).push({w,i});}
 const out=[];for(const [L,ws] of by){
 // Up to ten fit digits are exactly representable as JS safe integers.
 const d=Math.min(L,10),rows=ws.map(({w,i})=>({...row(w,d),i}));
 const counts=new Map();let max=0;
 for(const r of rows){const s=domain(r);for(const k of s){const n=(counts.get(k)||0)+1;counts.set(k,n);max=Math.max(max,n);}}
 const winners=[];let ties=0;for(const [k,n] of counts)if(n===max){ties++;if(winners.length<3)winners.push({k,indices:rows.filter(r=>supported(r,k)).map(r=>r.i)});}
 const readings=winners.map(({k,indices})=>({k,indices,words:indices.map(i=>decode(C[i],k).slice(0,4).map(p=>p.map(x=>gp.translit[x]).join('')))}));
 out.push({L,d,groups:ws.length,union:counts.size,max,ties,readings});
 }
 return {strata:out.sort((a,b)=>a.L-b.L),minimumOOV:out.reduce((n,r)=>n+r.groups-r.max,0)};
 }
 const widths=widthReceiver(C.slice(0,47));
 return {widths,source:{words:C.length,runes:C.flat().length,fitWords:47,fitRunes:213,holdWords:17,holdRunes:86},lexicon:[...D.values()].reduce((n,s)=>n+s.size,0)};
}
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
