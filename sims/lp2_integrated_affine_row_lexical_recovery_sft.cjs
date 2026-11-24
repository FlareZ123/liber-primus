"use strict";
/** Exact lexicon-conditioned shared affine-row integrated feedback recovery.
 * C_j=C_(j-1)+A(P_(j-1))*G(P_j)+B(P_(j-1)) mod29; G bijective, A nonzero.
 * Independent first ciphertext rune per word. A finite dictionary is an assumption.
 * Node 22 / CommonJS. No genuine LP2 key or plaintext asserted.
 */
const fs=require("node:fs");
const path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
function experiment(gp,transcript,controls,frequency,donor,cap=4000000){
 const mod=x=>(x%29+29)%29;
 const inv=Array.from({length:29},(_,i)=>i?Array.from({length:28},(_,j)=>j+1).find(j=>mod(i*j)===1):0);
 const glyph=new Map(gp.runes.map((r,i)=>[r,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(original,sourceNative=false){
   let w=original.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
   if(sourceNative)w=w.replace(/ING/g,"NG").replace(/IO/g,"IA");
   const p=[];while(w.length){const t=tokens.find(t=>w.startsWith(t.t));if(!t)throw Error(w);p.push(t.i);w=w.slice(t.t.length)}return {p,original};
 }
 const dict=new Map();
 function store(w){if(w.p.length<30&&!dict.has(w.p.join(",")))dict.set(w.p.join(","),w)}
 for(const raw of controls)for(const original of raw.toUpperCase().match(/[A-Z]+/g)||[])store(native(original));
 const narrow=Array.from({length:30},()=>[]);for(const w of dict.values())narrow[w.p.length].push(w);
 const narrowSize=dict.size;
 for(const raw of controls)for(const original of raw.toUpperCase().match(/[A-Z]+/g)||[])store(native(original,true));
 for(const line of frequency.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m){store(native(m[1]));store(native(m[1],true))}}
 const rx=new RegExp("["+gp.runes.join("")+"]+","gu");
 const donorWords=donor.sections.flatMap(s=>(s.source_text.match(rx)||[]).map(w=>({p:[...w].map(x=>glyph.get(x)),original:[...w].map(x=>gp.translit[glyph.get(x)]).join("")})));
 if(donorWords.length!==740||donorWords.flatMap(x=>x.p).length!==2979)throw Error("donor mismatch");
 for(const w of donorWords)store(w);
 const broad=Array.from({length:30},()=>[]);for(const w of dict.values())broad[w.p.length].push(w);
 // Original physical page mapping and complete printed groups, including carries.
 let page=0,start=0,end=0,word=[];const words=[];
 function finish(){if(word.length){words.push({C:word,index:words.length,start:start>=50?start+1:start,end:end>=50?end+1:end});word=[]}}
 const tape=transcript.split("%").slice(0,55).join("%");
 for(const ch of tape){if(glyph.has(ch)){if(!word.length)start=page;word.push(glyph.get(ch));end=page}else if(ch==="%")page++;else if(ch!=="/"&&!/\s/u.test(ch))finish()}finish();
 if(words.length!==2896||words.filter(w=>w.start!==w.end).length!==32||words.flatMap(w=>w.C).join(",")!==gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join(","))throw Error("source mismatch");
 // Inverse affine law G[p] = a_q * delta + b_q, where G is a permutation and a_q nonzero.
 // Eliminate each row's a_q,b_q using its first two assigned distinct points.
 function initial(){
   const rows=Array.from({length:29},()=>[]),basis=Array(29).fill(null);
   basis[0]=new Int8Array(30);basis[0][0]=1;
   basis[1]=new Int8Array(30);basis[1][1]=1;basis[1][29]=1;
   return {rows,basis,rank:2};
 }
 function clone(s){return {rows:s.rows.slice(),basis:s.basis.slice(),rank:s.rank}}
 function equation(s,v){
   for(let k=0;k<29;k++)if(v[k]&&s.basis[k]){const a=v[k],b=s.basis[k];for(let j=k;j<30;j++)v[j]=mod(v[j]-a*b[j])}
   const k=v.findIndex((x,i)=>i<29&&x!==0);
   if(k<0)return v[29]===0;
   const a=inv[v[k]];for(let j=k;j<30;j++)v[j]=mod(v[j]*a);
   for(let j=0;j<29;j++)if(s.basis[j]?.[k]){
     const row=s.basis[j].slice(),b=row[k];for(let l=k;l<30;l++)row[l]=mod(row[l]-b*v[l]);s.basis[j]=row;
   }
   s.basis[k]=v;s.rank++;
   // Equal affine expressions for different G variables contradict bijectivity.
   const seen=new Set();
   for(let i=0;i<29;i++){
     const row=s.basis[i];if(!row)continue;
     let count=0,only=-1;
     for(let j=0;j<29;j++)if(j!==i&&row[j]){count++;only=j}
     if(row[29]===0&&count===1&&row[only]===28&&!s.basis[only])return false;
     let key=String(row[29])+"|";for(let j=0;j<29;j++)if(j!==i&&row[j])key+=j+":"+row[j]+",";
     if(seen.has(key))return false;seen.add(key);
   }
   return true;
 }
 function add(s,edges){
   const changed=new Set();
   for(const [q,p,d] of edges){
     let row=s.rows[q],exists=false;
     for(const [x,y] of row){
       if(x===p){if(y!==d)return false;exists=true;break}
       if(y===d)return false;
     }
     if(exists)continue;
     if(row.length>=2){
       const [[p0,d0],[p1,d1]]=row;
       const v=new Int8Array(30);v[p]=mod(d1-d0);v[p1]=mod(v[p1]-d+d0);v[p0]=mod(v[p0]+d-d1);
       if(!equation(s,v))return false;
     }
     if(!changed.has(q)){row=row.slice();s.rows[q]=row;changed.add(q)}
     row.push([p,d]);
   }
   return true;
 }
 function prepare(C,w){return w.p.slice(1).map((p,j)=>[w.p[j],p,mod(C[j+1]-C[j])])}
 function candidates(C,by){return by[C.length].flatMap(w=>{const e=prepare(C,w);return add(initial(),e)?[{...w,e}]:[]})}
 function solve(rows,by,limit){
 const tasks=rows.map(({C,index,P})=>({C,index,P,cands:candidates(C,by)})).sort((a,b)=>a.cands.length-b.cands.length||b.C.length-a.C.length);
 // For a candidate's known (q,p,d), remove any other word requiring (q,p,!=d)
 // or (q,!=p,d). Bitset indexes give exact necessary pair compatibility.
 const n=tasks.length;
 function full(k){const out=new Uint32Array(Math.ceil(k/32)).fill(0xffffffff);if(k%32)out[out.length-1]=2**(k%32)-1;return out}
 function setbit(map,k,i,sz){let bits=map.get(k);if(!bits){bits=new Uint32Array(sz);map.set(k,bits)}bits[i>>>5]|=1<<(i&31)}
 function pop(x){x-=x>>>1&0x55555555;x=(x&0x33333333)+(x>>>2&0x33333333);return ((x+(x>>>4)&0x0f0f0f0f)*0x01010101)>>>24}
 const ix=tasks.map(t=>{
  const sz=Math.ceil(t.cands.length/32),p=new Map(),d=new Map(),e=new Map();
  for(let i=0;i<t.cands.length;i++)for(const [q,x,y] of t.cands[i].e){
   setbit(p,q*29+x,i,sz);setbit(d,q*29+y,i,sz);setbit(e,(q*29+x)*29+y,i,sz);
  }
  return {sz,p,d,e};
 });
 const cache=tasks.map(t=>t.cands.map(()=>new Map()));
 let cached=0,cacheHits=0,cacheMisses=0;
 function mask(i,c,j){
  const m=cache[i][c];if(m.has(j)){cacheHits++;return m.get(j)}
  cacheMisses++;const {p,d,e,sz}=ix[j],out=full(tasks[j].cands.length);
  for(const [q,x,y] of tasks[i].cands[c].e){
   const pb=p.get(q*29+x),db=d.get(q*29+y),eb=e.get((q*29+x)*29+y);
   if(!pb&&!db)continue;
   for(let k=0;k<sz;k++)out[k]&=~(((pb?.[k]||0)|(db?.[k]||0))&~(eb?.[k]||0));
  }
  if(cached+sz<=24000000){m.set(j,out);cached+=sz}
  return out;
 }
 let nodes=0,complete=0,maxDepth=0,truncated=false,emptyDomains=0;
 const levels=Array(n).fill(0),maxRank=Array(n).fill(0),survivors=[],chosen=Array(n).fill(null);
 function dfs(s,depth,domains,counts){
  if(depth===n){complete++;if(survivors.length<100)survivors.push({s,chosen:chosen.slice()});return}
  let i=-1;
  for(let j=0;j<n;j++)if(domains[j]&&(i<0||counts[j]<counts[i]))i=j;
  if(i<0||counts[i]===0)return;
  const bits=domains[i];
  for(let k=0;k<bits.length;k++){
   let v=bits[k];
   while(v){
    const one=v&-v,c=k*32+31-Math.clz32(one);v=(v^one)>>>0;
    if(++nodes>limit){truncated=true;return}
    const w=tasks[i].cands[c],next=clone(s);if(!add(next,w.e))continue;
    levels[depth]++;maxRank[depth]=Math.max(maxRank[depth],next.rank);maxDepth=Math.max(maxDepth,depth+1);
    const nd=domains.slice(),nc=counts.slice();nd[i]=null;nc[i]=0;let viable=true;
    for(let j=0;j<n;j++)if(nd[j]){
     const dm=nd[j],cm=mask(i,c,j),out=new Uint32Array(dm.length);let count=0;
     for(let l=0;l<dm.length;l++){out[l]=dm[l]&cm[l];count+=pop(out[l])}
     if(!count){emptyDomains++;viable=false;break}
     nd[j]=out;nc[j]=count;
    }
    if(viable){chosen[i]=w;dfs(next,depth+1,nd,nc);chosen[i]=null;if(truncated)return}
   }
  }
 }
 dfs(initial(),0,tasks.map(t=>full(t.cands.length)),tasks.map(t=>t.cands.length));
 return {nodes,complete,maxDepth,truncated,levels,maxRank,tasks,survivors,emptyDomains,cacheHits,cacheMisses,cached};
}
 const long=words.filter(x=>x.C.length>=10),long13=long.filter(x=>x.C.length>=13),long12=long.filter(x=>x.C.length>=12);
 const summary=x=>({nodes:x.nodes,complete:x.complete,maxDepth:x.maxDepth,truncated:x.truncated,levels:x.levels,maxRank:x.maxRank,anchors:x.tasks.map(t=>[t.index,t.cands.length]),sample:x.survivors.slice(0,1).map(s=>s.chosen.map(w=>w.original))});
 const originalNarrow=solve(long13,narrow,cap),originalBroad=solve(long13,broad,cap);
 // Positive native-text control: secret nonlinear permutation and independent row slopes and offsets.
 let seed=330129;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const G=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rand(j+1);[G[j],G[k]]=[G[k],G[j]]}
 const a=Array.from({length:29},()=>rand(28)+1),b=Array.from({length:29},()=>rand(29));
 const Gi=Array(29);G.forEach((v,i)=>Gi[v]=i);
 function encode(P){const C=[rand(29)];for(let j=1;j<P.length;j++)C.push(mod(C[j-1]+a[P[j-1]]*G[P[j]]+b[P[j-1]]));
   const Q=[P[0]];for(let j=1;j<C.length;j++)Q.push(Gi[mod((C[j]-C[j-1]-b[Q[j-1]])*inv[a[Q[j-1]]])]);if(Q.join(",")!==P.join(","))throw Error("plant inverse");return C}
 const plants=long.map(({C,index})=>{const w=narrow[C.length][rand(narrow[C.length].length)];return {C:encode(w.p),P:w.p,index}});
 const train=plants.filter(x=>x.C.length>=12),held=plants.filter(x=>x.C.length<12);
 const plant=solve(train,broad,cap);
 const authentic=donorWords.filter(w=>w.p.length>=5).map((w,index)=>({C:encode(w.p),P:w.p,index}));
 function evaluate(rows,s,by){
   let compatible=0,unique=0,correct=0,runes=0,truthPresent=0;
   for(const {C,P} of rows){
      const cs=candidates(C,by).filter(w=>add(clone(s),w.e));compatible+=!!cs.length;
      const present=cs.some(w=>w.p.join(",")===P.join(","));truthPresent+=present;
      if(cs.length===1){unique++;if(present){correct++;runes+=P.length}}
   }
   return {words:rows.length,compatible,unique,correct,runes,truthPresent};
 }
 const normalizedG=G.map(x=>mod((x-G[0])*inv[mod(G[1]-G[0])]));
 const evaluation=plant.survivors.slice(0,10).map(({s,chosen})=>{
   const forced=s.basis.flatMap((row,i)=>row&&row.slice(0,29).filter(x=>x!==0).length===1?[[i,row[29]]]:[]);
   const matches=chosen.filter((w,i)=>w.p.join(",")===plant.tasks[i].P.join(",")).length;
   const allRowsFit=s.rows.every((r,q)=>r.every(([p,d])=>mod(a[q]*G[p]+b[q])===d));
   return {trainingMatches:matches,trainingCount:train.length,rank:s.rank,forcedG:forced.length,forcedGCorrect:forced.filter(([i,v])=>normalizedG[i]===v).length,allRowsFit,holdout:evaluate(held,s,broad),authenticHoldout:evaluate(authentic,s,broad)};
 });
 const chapters=[];
 return {narrowSize,broadSize:dict.size,originalNarrow:summary(originalNarrow),originalBroad:summary(originalBroad),plant:summary(plant),evaluation,chapters};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const data=files.map(read);
const result=experiment(JSON.parse(data[0]),data[1],data.slice(2,5),data[5],JSON.parse(data[6]));
console.log(JSON.stringify(result,null,2));
