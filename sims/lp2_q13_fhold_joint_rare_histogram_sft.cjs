"use strict";
// Director #3077: exact joint histogram separation, no language scoring.
function run(gp,raw,gold,lp1){
 const assert=(x,m)=>{if(!x)throw Error(m)}, q=13,A=29,INF=10000,mod=(x,a=A)=>(x%a+a)%a;
 const C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 let hash=2166136261;for(const c of C)hash=Math.imul(hash^c,16777619)>>>0;
 assert(C.length===3008&&C.filter(x=>x===0).length===125&&hash===1862123327,"original tape");
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const D=[];for(let w of raw.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"token");D.push(t.i);w=w.slice(t.s.length)}}
 assert(D.length===217106,"donor length");
 function hist(v,a=A){const h=Array(a).fill(0);for(const x of v)h[x]++;return h}
 const n=C.length, h=hist(D.slice(0,n)), unique=new Map();let windows=0;
 for(let i=0;i<=D.length-n;i++){if(h[18]<=286&&h[0]<=125){windows++;const id=h.join(",");if(!unique.has(id))unique.set(id,{start:i,h:h.slice()})}if(i<D.length-n){h[D[i]]--;h[D[i+n]]++}}
 const rows=[...unique.values()];assert(windows===1197&&rows.length===1116,"donor counts");
 const stats=gp.translit.map((s,j)=>({symbol:s,index:j,min:Math.min(...rows.map(x=>x.h[j])),max:Math.max(...rows.map(x=>x.h[j]))}));
 // Source-only objective: all absent non-F symbols become forbidden; take the
 // two nonzero symbols with smallest maximum counts, before optimizing C.
 const forbidden=stats.filter(x=>x.index!==0&&x.max===0).map(x=>x.index);
 const rare=stats.filter(x=>x.index!==0&&x.max>0).sort((a,b)=>a.max-b.max||a.index-b.index).slice(0,2).map(x=>x.index);
 const upper=Math.max(...rows.map(x=>rare.reduce((s,j)=>s+x.h[j],0)));
 assert(forbidden.join()==="22,25"&&rare.join()==="12,14"&&upper===3,"frozen objective");
 function blockSolver(c,period,alphabet,sub,ban,pen){
  const blocks=[];let b=[];for(const x of c){if(x===0){blocks.push(b);b=[]}else b.push(x)}blocks.push(b);
  const reject=new Set([0,...ban]),cost=new Set(pen);
  const per=blocks.map(run=>{const h=Array.from({length:period},()=>new Int16Array(alphabet));for(let i=0;i<run.length;i++)h[i%period][run[i]]++;
   return {n:run.length,per:sub.map(j=>Array.from({length:alphabet},(_,k)=>Int16Array.from({length:period},(_,s)=>{const v=h[mod(j-s,period)];for(const x of reject)if(v[mod(k+x,alphabet)])return INF;let out=0;for(const x of cost)out+=v[mod(k+x,alphabet)];return out})))}
  });
  const fixed=new Int8Array(period),d=new Int16Array(period),e=new Int16Array(period);
  return keys=>{fixed.fill(-1);sub.forEach((j,i)=>fixed[j]=keys[i]);d.fill(0);
   for(let z=0;z<per.length;z++){e.fill(INF);let any=false;const block=per[z];for(let s=0;s<period;s++){let v=d[s];if(v>=INF)continue;for(let j=0;j<sub.length;j++){v+=block.per[j][keys[j]][s];if(v>=INF)break}if(v>=INF)continue;const a=(s+block.n)%period,k=fixed[a];if(v<e[a])e[a]=v;any=true;
    if(z<per.length-1&&(k<0||!reject.has(mod(-k,alphabet)))){const w=v+ +(k>=0&&cost.has(mod(-k,alphabet)));if(w<e[(a+1)%period])e[(a+1)%period]=w}}
    if(!any)return INF;d.set(e)}return Math.min(...d)
  }
 }
 // Independent per-rune DP, no nonzero-run compression.
 function direct(c,period,alphabet,sub,keys,ban,pen){
  const K=Array(period).fill(-1);sub.forEach((j,i)=>K[j]=keys[i]);const bad=new Set([0,...ban]),cost=new Set(pen);
  let d=new Int16Array(period),e=new Int16Array(period);
  for(const x of c){e.fill(INF);for(let s=0;s<period;s++){const v=d[s];if(v>=INF)continue;if(x===0&&v<e[s])e[s]=v;const p=K[s]<0?-1:mod(x-K[s],alphabet);if(p<0||!bad.has(p)){const w=v+ +(cost.has(p));if(w<e[(s+1)%period])e[(s+1)%period]=w}}[d,e]=[e,d]}
  return Math.min(...d)
 }
 function exhaustive(c,period,alphabet,sub,ban,pen,crosscheck=false){
  const solve=blockSolver(c,period,alphabet,sub,ban,pen),keys=Array(sub.length).fill(0),counts={},scores=[];let best=INF,bestKeys=null,legal=0;
  for(let i=0;i<alphabet**sub.length;i++){let x=i;for(let j=keys.length-1;j>=0;j--){keys[j]=x%alphabet;x=Math.floor(x/alphabet)}const v=solve(keys);if(crosscheck)assert(v===direct(c,period,alphabet,sub,keys,ban,pen),"block/direct mismatch");scores.push(v);if(v<INF){legal++;counts[v]=(counts[v]||0)+1}if(v<best){best=v;bestKeys=keys.slice()}}
  return {sub,best,bestKeys,legal,assignments:scores.length,counts,scores,lower:Math.ceil(period*best/sub.length)}
 }
 // Independent exhaustive path oracle on small tapes and all pair assignments.
 let seed=0x253077;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 let toy=0;for(let t=0;t<40;t++){const a=5,p=3+t%3,sub=[0,1],c=Array.from({length:10},()=>rng()%a),ban=[1],pen=[2,3],f=blockSolver(c,p,a,sub,ban,pen);
  for(let k0=0;k0<a;k0++)for(let k1=0;k1<a;k1++){const keys=[k0,k1],K=[k0,k1,...Array(p-2).fill(-1)];let best=INF;
   function rec(i,s,v){if(i===c.length){best=Math.min(best,v);return}const x=c[i];if(x===0)rec(i+1,s,v);const z=K[s]<0?-1:mod(x-K[s],a);if(z!==0&&z!==1)rec(i+1,(s+1)%p,v+ +(pen.includes(z)))}
   for(let s=0;s<p;s++)rec(0,s,0);assert(f(keys)===best&&direct(c,p,a,sub,keys,ban,pen)===best,"toy brute oracle");toy++}
 }
 const single=exhaustive(C,q,A,[0],forbidden,rare,true),pair=exhaustive(C,q,A,[0,1],forbidden,rare,true);
 assert(single.best===0&&pair.best===12&&pair.legal===51&&pair.lower===78,"original certificate");
 function encrypt(p,k,start){let phase=start;const counts=Array(q).fill(0),cipher=p.map(x=>{if(x===0)return 0;const s=phase++%q;if(rare.includes(x))counts[s]++;return mod(x+k[s])});return {cipher,counts}}
 const idx=new Map(gp.runes.map((x,i)=>[x,i])),extract=s=>Array.from(s).filter(x=>idx.has(x)).map(x=>idx.get(x));
 const native=extract(gold.sections[5].source_text),nativeC=extract(lp1.split("$")[5]),nativeK=[0,10,4,0,1,19,0,18,4,18,9,0,18];
 assert(native.length===319&&nativeC.join()===encrypt(native,nativeK,0).cipher.join(),"authentic q13 replay");
 // Reuse the authentic key and arbitrary pre-encryption positions. Same frozen
 // rare/forbidden coordinates, with an exact donor histogram and hidden phase.
 const controls=[];for(const row of [rows[0],rows[Math.floor(rows.length/2)],rows.at(-1)]){
  const p=D.slice(row.start,row.start+n);for(let j=p.length-1;j>0;j--){const i=rng()%(j+1);[p[i],p[j]]=[p[j],p[i]]}
  assert(hist(p).join()===row.h.join(),"permuted donor histogram");
  const k=controls.length===0?nativeK:Array.from({length:q},()=>rng()%A),start=1+rng()%12,{cipher,counts}=encrypt(p,k,start);
  const known=[];for(let j=0;j<q;j++){const sub=[j,(j+1)%q],keys=sub.map(x=>k[x]),v=blockSolver(cipher,q,A,sub,forbidden,rare)(keys);assert(v===direct(cipher,q,A,sub,keys,forbidden,rare),"plant DP agreement");assert(v<=counts[j]+counts[(j+1)%q],"true plant excluded");known.push(v)}
  const res=exhaustive(cipher,q,A,[0,1],forbidden,rare);assert(res.lower<=rare.reduce((s,j)=>s+row.h[j],0),"plant full bound");
  controls.push({start:row.start,phase:start,key:k,rareCount:rare.reduce((s,j)=>s+row.h[j],0),hist:row.h,conditional:known,allPairMin:res.best,lower:res.lower})
 }
 return {n,hash,donorLength:D.length,windows,unique:rows.length,stats,forbidden,rare,upper,toy,authentic:{n:native.length,key:nativeK,exactReplay:true},single,pair,controls,excludedWindows:windows};
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt"];
const a=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(JSON.parse(a[0]),a[1],JSON.parse(a[2]),a[3]),null,2));
