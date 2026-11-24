'use strict';
// Read-only Node/CommonJS reproducer for Director #2552.
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const experiment=function experiment(ct,tx,gt,lt){
 const gp=JSON.parse(ct),gold=JSON.parse(gt),A=29,Q=13,mod=x=>(x+A)%A,id=a=>a.join(","),eq=(a,b)=>id(a)===id(b),assert=(v,m)=>{if(!v)throw Error(m)},glyph=new Map(gp.runes.map((x,i)=>[x,i]));
 /** Parse genuine words, preserving printed page and line carries. */
 function parse(raw,printed){let w=[],ws=[],pos=0;for(const ch of raw){if(glyph.has(ch))w.push({pos:pos++,c:glyph.get(ch)});else if(w.length&&(printed?ch==="-"||ch===".":ch!=="'"&&ch!=="’")){ws.push(w);w=[]}}if(w.length)ws.push(w);return ws}
 const words=parse(tx,true),native=gold.sections.map(s=>parse(s.source_text,false)),seq=ws=>ws.flatMap(w=>w.map(x=>x.c)),tape=gp.pages.slice(0,56).flatMap(p=>p.indices);
 assert(eq(seq(words),gp.pages.flatMap(p=>p.indices)),"source mismatch");
 assert(tape.length===12956&&words.filter(w=>w.length===1&&w[0].pos<12956).length===83,"counts");
 const offs=[0];for(const p of gp.pages.slice(0,56))offs.push(offs.at(-1)+p.indices.length);
 const chapter=[[0,2],[3,7],[8,14],[15,22],[23,27],[28,32],[33,39],[40,53],[54,55]];
 function clock(c){let j=0;return c.map(x=>{const t=j;j=(j+gp.prime[x])%Q;return t})}
 function encrypt(p,k){let j=0;return p.map(x=>{const c=(x+k[j])%A;j=(j+gp.prime[c])%Q;return c})}
 function decrypt(c,k){const ph=clock(c);return c.map((x,i)=>mod(x-k[ph[i]]))}
 function localWords(lo,hi){return words.filter(w=>w[0].pos>=lo&&w.at(-1).pos<hi).map(w=>({start:w[0].pos-lo,len:w.length}))}
 function domains(c,ph,ws,alphabet){const d=Array.from({length:Q},()=>Array.from({length:A},(_,i)=>i));for(const w of ws)if(w.len===1){const i=w.start,j=ph[i];d[j]=d[j].filter(k=>alphabet.includes(mod(c[i]-k)))}return d}
 function gate(lo,hi){
   const c=tape.slice(lo,hi),ph=clock(c),ws=localWords(lo,hi),ds=domains(c,ph,ws,[10,24]),d3=domains(c,ph,ws,[3,10,24]);
   let out={lo,hi,singletons:ws.filter(w=>w.len===1).length,bad:ds.flatMap((d,j)=>d.length?[]:[j]),bad3:d3.flatMap((d,j)=>d.length?[]:[j])};
   if(out.bad.length)return out;
   const h=Array.from({length:Q},()=>Array(A).fill(0));c.forEach((x,i)=>h[ph[i]][x]++);
   const max=[0,0,0];function scan(chosen,start){if(chosen.length){const m=h.reduce((s,row,j)=>s+Math.max(...ds[j].map(k=>chosen.reduce((u,x)=>u+row[(x+k)%A],0))),0);max[chosen.length-1]=Math.max(max[chosen.length-1],m)}if(chosen.length===3)return;for(let i=start;i<A;i++)scan([...chosen,i],i+1)}scan([],0);
   const n=c.length,ctrl=[];for(const [si,w] of native.entries()){const p=seq(w);for(let i=0;i+n<=p.length;i++){let h=Array(A).fill(0);for(let j=i;j<i+n;j++)h[p[j]]++;h.sort((a,b)=>b-a);ctrl.push({si,i,top:[h[0],h[0]+h[1],h[0]+h[1]+h[2]]})}}
   out.frequency={max,controls:ctrl.length,mins:[0,1,2].map(j=>Math.min(...ctrl.map(x=>x.top[j]))),survivors:ctrl.filter(x=>x.top.every((v,j)=>v<=max[j]))};return out
 }
 const whole=gate(0,tape.length),gates=chapter.map(([a,b])=>({pages:[a,b],...gate(offs[a],offs[b+1])}));
 assert(whole.bad.length===13&&whole.bad3.length===13&&gates.filter(x=>!x.bad.length).length===2,"singleton gate");
 assert(gates[0].frequency.survivors.length===0&&gates[8].frequency.survivors.length===4,"frequency gate");
 const tok=new Map(gp.translit.map((x,i)=>[x,i]));for(const [s,i] of [["ING",21],["IO",27],["K",5],["V",1],["Z",15]])tok.set(s,i);
 const tokens=[...tok.keys()].sort((a,b)=>b.length-a.length);
 function encode(w){let out=[];w=w.toUpperCase();while(w.length){const t=tokens.find(t=>w.startsWith(t));if(!t)return null;out.push(tok.get(t));w=w.slice(t.length)}return out}
 const base=new Map();for(const line of lt.split(/\r?\n/)){const m=line.match(/^([a-z]+) (\d+)$/);if(m){const a=encode(m[1]);if(a)base.set(id(a),a)}}
 function train(exclude){
   const lex=new Map(base),uni=Array(A).fill(.5),bi=Array.from({length:A},()=>Array(A).fill(.3)),tri=Array.from({length:A*A},()=>Array(A).fill(.1));
   for(let si=0;si<native.length;si++)if(si!==exclude){const p=seq(native[si]);for(const w of native[si]){const a=w.map(x=>x.c);lex.set(id(a),a)}for(let i=0;i<p.length;i++){uni[p[i]]++;if(i>=1)bi[p[i-1]][p[i]]++;if(i>=2)tri[p[i-2]*A+p[i-1]][p[i]]++}}
   const norm=row=>{const s=row.reduce((a,b)=>a+b,0);return row.map(x=>Math.log(x/s))},byLen=new Map();for(const a of lex.values()){if(!byLen.has(a.length))byLen.set(a.length,[]);byLen.get(a.length).push(a)}
   return {lex,byLen,uni:norm(uni),bi:bi.map(norm),tri:tri.map(norm)};
 }
 function language(p,m){let s=m.uni[p[0]];if(p.length>1)s+=m.bi[p[0]][p[1]];for(let i=2;i<p.length;i++)s+=m.tri[p[i-2]*A+p[i-1]][p[i]];return s}
 function lexScore(p,ws,m){let hits=0,long=0,longRunes=0;for(const w of ws){if(m.lex.has(id(p.slice(w.start,w.start+w.len)))){hits++;if(w.len>=4){long++;longRunes+=w.len}}}return {hits,words:ws.length,long,longRunes}}
 function recover(c,ws,m,seed){
   const ph=clock(c),ds=domains(c,ph,ws,[10,24]);assert(ds.every(d=>d.length),"infeasible prefix");
   const hist=Array.from({length:Q},()=>Array(A).fill(0));c.forEach((x,i)=>hist[ph[i]][x]++);
   const rank=ds.map((d,j)=>d.map(k=>({k,v:hist[j].reduce((s,n,x)=>s+n*m.uni[mod(x-k)],0)})).sort((a,b)=>b.v-a.v||a.k-b.k).map(x=>x.k));
   const score=k=>{const p=c.map((x,i)=>mod(x-k[ph[i]]));let s=language(p,m);for(const w of ws)if(w.len>=3&&m.lex.has(id(p.slice(w.start,w.start+w.len))))s+=2*w.len;return s};
   const anchors=[];
   for(const w of ws){
     const phases=ph.slice(w.start,w.start+w.len),phaseSet=[...new Set(phases)].sort((a,b)=>a-b),mask=phaseSet.reduce((s,j)=>s|(1<<j),0);
     if(phaseSet.length<6)continue;const part=new Map();
     for(const p of m.byLen.get(w.len)||[]){const k=Array(Q).fill(-1);let ok=true;for(let i=0;i<w.len;i++){const j=phases[i],d=mod(c[w.start+i]-p[i]);if(!ds[j].includes(d)||(k[j]!==-1&&k[j]!==d)){ok=false;break}k[j]=d}if(ok)part.set(id(k),k)}
     anchors.push({start:w.start,mask,phaseSet,part:[...part.values()]});
   }
   const pop=n=>{let k=0;while(n){n&=n-1;k++}return k},cand=new Map();let checks=0,joins=0;
   function add(k){cand.set(id(k),k)}
   function complete(k,j=0){while(j<Q&&k[j]!==-1)j++;if(j===Q){add(k.slice());return}for(const x of rank[j].slice(0,4)){k[j]=x;complete(k,j+1)}k[j]=-1}
   for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++){
     const a=anchors[i],b=anchors[j],common=a.mask&b.mask,union=a.mask|b.mask;if(pop(common)<2||pop(union)<11)continue;
     const phases=a.phaseSet.filter(x=>common&(1<<x)),map=new Map();for(const k of b.part){const key=phases.map(x=>k[x]).join(",");if(!map.has(key))map.set(key,[]);map.get(key).push(k)}
     for(const k of a.part){checks++;for(const l of map.get(phases.map(x=>k[x]).join(","))||[]){joins++;complete(k.map((v,x)=>v>=0?v:l[x]))}}
   }
   let state=seed>>>0;function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296}
   add(rank.map(r=>r[0]));for(let i=0;i<64;i++)add(rank.map(r=>r[Math.floor(random()*Math.min(6,r.length))]));
   const seeds=[...cand.values()].map(k=>({k,s:score(k)})).sort((a,b)=>b.s-a.s||id(a.k).localeCompare(id(b.k))).slice(0,24),refined=new Map();
   for(const start of seeds){let k=start.k.slice(),best=start.s;for(let sweep=0;sweep<12;sweep++){let improved=false;for(let j=0;j<Q;j++){const old=k[j];let pick=old,s=best;for(const x of ds[j]){if(x===old)continue;k[j]=x;const v=score(k);if(v>s+1e-9){s=v;pick=x}}k[j]=pick;if(s>best+1e-9){best=s;improved=true}}if(!improved)break}refined.set(id(k),{k,s:best})}
   return {anchors:anchors.map(a=>[a.start,a.phaseSet.length,a.part.length]),checks,joins,candidates:cand.size,top:[...refined.values()].sort((a,b)=>b.s-a.s||id(a.k).localeCompare(id(b.k))).slice(0,5)};
 }
 function assess(c,ws,m,r,expected){
   const split=232,tw=ws.filter(w=>w.start+w.len<=split),hw=ws.filter(w=>w.start>=split).map(w=>({start:w.start-split,len:w.len})),p=decrypt(c,r.top[0].k),a=p.slice(0,split),b=p.slice(split);assert(eq(encrypt(p,r.top[0].k),c),"roundtrip");
   return {...r,train:{nats:language(a,m)/a.length,...lexScore(a,tw,m)},hold:{nats:language(b,m)/b.length,...lexScore(b,hw,m),text:hw.map(w=>b.slice(w.start,w.start+w.len).map(x=>gp.translit[x]).join("")).join(" "),raw:b.map(x=>gp.translit[x]).join("")},expected:expected?{k:expected.k,keyExact:eq(r.top[0].k,expected.k),prefixExact:a.filter((x,i)=>x===expected.p[i]).length,holdExact:b.filter((x,i)=>x===expected.p[232+i]).length,truthHoldNats:language(expected.p.slice(232),m)/b.length}:null,replay:true};
 }
 const controls=[];for(const [s,k] of [[1,[3,21,24,12,14,1,2,18,8,16,5,27,0]],[3,[28,0,5,12,7,19,4,1,8,23,9,14,17]],[4,[1,6,21,5,27,11,9,3,20,24,4,28,16]],[5,[13,2,25,0,6,19,17,23,8,4,21,15,3]]]){
   const p=seq(native[s]).slice(0,308),ws=native[s].filter(w=>w.at(-1).pos<308).map(w=>({start:w[0].pos,len:w.length})),m=train(s),c=encrypt(p,k);assert(p.length===308,"plant length");
   controls.push({section:s,...assess(c,ws,m,recover(c.slice(0,232),ws.filter(w=>w.start+w.len<=232),m,2013+s),{k,p})});
 }
 const lo=offs[54],hi=offs[56],c=tape.slice(lo,hi),ws=localWords(lo,hi),m=train(-1),r=recover(c.slice(0,232),ws.filter(w=>w.start+w.len<=232),m,2026),original=assess(c,ws,m,r,null);
 return {whole,gates,lexicon:base.size,controls,original};
};
console.log(JSON.stringify(experiment(...paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
