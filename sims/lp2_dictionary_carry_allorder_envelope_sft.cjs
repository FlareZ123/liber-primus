'use strict';
// Agent12, Director #2273. Exact all-order upper-state envelope for dictionary-ranked streaming carry.
const fs=require('node:fs');
const path=require('node:path');
function analyze(ct,raw,dict,nt){
 const corpus=JSON.parse(ct), native=JSON.parse(nt),gp=new Map(corpus.runes.map((c,i)=>[c,i]));
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const bitlen=x=>x===0n?0:x.toString(2).length;
 const words=[];let cur=[],page=0,start=0;
 const finish=()=>{if(cur.length){words.push({a:cur,p:start>=50?start+1:start});cur=[]}};
 for(const c of raw.split("%").slice(0,55).join("%")){
   if(gp.has(c)){if(!cur.length)start=page;cur.push(gp.get(c))}
   else if(c==="%")page++;
   else if(c!=="/"&&!/\s/u.test(c))finish();
 }
 finish();
 assert(words.length===2896&&words.flatMap(x=>x.a).join(",")===corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join(","),"physical source");
 const lex=Array.from({length:15},()=>new Map());
 const add=a=>{if(a.length&&a.length<=14&&a.every(x=>x!==undefined))lex[a.length].set(a.join(","),a)};
 const spell=corpus.translit.map((x,i)=>[x,i]);spell.push(["ING",21],["IO",27]);
 for(const line of dict.split("\n")){
  const m=/^([a-z]+)\s+\d+\s*$/.exec(line);if(!m)continue;
  const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const walk=(p,a)=>{if(p===s.length){add(a);return}if(a.length===14)return;for(const [t,i] of spell)if(s.startsWith(t,p))walk(p+t.length,a.concat(i))};
  walk(0,[]);
 }
 const donor=native.sections.flatMap(s=>(s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(x=>gp.get(x))));
 donor.forEach(add);
 const dicts=lex.map(m=>[...m.values()].sort((a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0}));
 const D=dicts.map(x=>x.length);
 const idx=dicts.map(a=>new Map(a.map((w,i)=>[w.join(","),BigInt(i)])));
 const choose=(n,k)=>{if(k<0||k>n)return 0n;let x=1n;for(let i=1;i<=k;i++)x=x*BigInt(n+1-i)/BigInt(i);return x};
 const frame=(a,p)=>{const L=a.length,e=a.slice(1).filter((x,j)=>x===a[j]).length;return {L,e,p,type:a.join(","),M:29n*choose(L-1,e)*28n**BigInt(L-1-e),P:BigInt(D[L])}};
 const rows=words.map(({a,p})=>frame(a,p));
 assert(rows.reduce((s,x)=>s+x.e,0)===63,"source repeat count");
 /** @param {number} bits @param {typeof rows} rr */
 function bound(bits,rr=rows){
  let U=(1n<<BigInt(bits))-1n,firstZero=null;const caps=new Map; const restart=new Set(rr.map((v,i)=>v.restart?i:-1));
  for(let i=0;i<rr.length;i++){
   if(restart.has(i))U=(1n<<BigInt(bits))-1n; const {L,e,p,type,M,P}=rr[i];
   const vmax=(U+1n)*P-1n,cap=vmax<M?vmax:M-1n,k=L+":"+e;
   if(!caps.has(k))caps.set(k,new Map);
   const mp=caps.get(k),old=mp.get(type);if(!old||cap<old.cap)mp.set(type,{cap,i,p});
   U=vmax/M;
   if(U===0n&&firstZero===null)firstZero=i;
  }
  const fails=[],groups=[];
  for(const [k,mp] of caps){
   const a=[...mp.values()].sort((a,b)=>a.cap<b.cap?-1:a.cap>b.cap?1:0);
   const j=a.findIndex((v,i)=>v.cap<BigInt(i));
   const [L]=k.split(":").map(Number);
   groups.push({frame:k,types:a.length,capBelowP:a.filter(x=>x.cap<BigInt(D[L])).length});
   if(j>=0)fails.push({frame:k,rank:j,cap:a[j].cap.toString(),word:a[j].i,page:a[j].p,types:a.length});
  }
  return {bits,firstZero,fails,groups,terminalUpper:U.toString()};
 }
 // Canonical mixed-radix pack: head, equality-position combinadic, nonrepeat successor ranks.
 function pack(a){
  let B=0n,R=0n,e=0;
  for(let j=1;j<a.length;j++)if(a[j]===a[j-1])B+=choose(j-1,++e);
  else R=28n*R+BigInt(a[j]-(a[j]>a[j-1]?1:0));
  return (BigInt(a[0])*choose(a.length-1,e)+B)*28n**BigInt(a.length-1-e)+R;
 }
 function unpack(r,L,e){
  const T=28n**BigInt(L-1-e),S=choose(L-1,e);
  let R=r%T,B=(r/T)%S;const a=[Number(r/T/S)];
  const eq=new Set();let top=L-1;
  for(let j=e;j>=1;j--){let k=top-1;while(choose(k,j)>B)k--;eq.add(k);B-=choose(k,j);top=k}
  assert(B===0n,"combinadic");
  const ds=Array(L-1-e);for(let i=ds.length-1;i>=0;i--){ds[i]=Number(R%28n);R/=28n}
  let j=0;for(let i=0;i<L-1;i++){const p=a.at(-1);if(eq.has(i))a.push(p);else{const d=ds[j++];a.push(d+(d>=p?1:0))}}
  return a;
 }
 function decode(rr,ranks,terminal){
  let s=terminal;const d=Array(rr.length);
  for(let i=rr.length-1;i>=0;i--){const {P,M}=rr[i],v=s*M+ranks[i];d[i]=v%P;s=v/P}
  return {seed:s,d};
 }
 function encode(rr,d,seed){
  let s=seed;const ranks=rr.map(({P,M},i)=>{const v=s*P+d[i],r=v%M;s=v/M;return r});return {terminal:s,ranks};
 }
 const ranks=words.map(({a},i)=>{const r=pack(a);assert(unpack(r,rows[i].L,rows[i].e).join(",")===a.join(","),"source rank replay");return r});
 const orig=decode(rows,ranks,0n),re=encode(rows,orig.d,orig.seed);
 assert(re.terminal===0n&&re.ranks.every((r,i)=>r===ranks[i]),"original carry replay");
 const preview=orig.d.slice(0,40).map((d,i)=>dicts[rows[i].L][Number(d)].map(x=>corpus.translit[x]).join("")).join(" ");
 // Real solved native words, original-length repeat schedules, fixed reversed rank as a hidden permutation.
 const control=donor.filter(a=>a.length<=14);
 const sch=control.map((a,i)=>{const same=rows.filter(r=>r.L===a.length),e=same[i%same.length].e;return {L:a.length,e,M:29n*choose(a.length-1,e)*28n**BigInt(a.length-1-e),P:BigInt(D[a.length])}});
 const dd=control.map(a=>idx[a.length].get(a.join(","))),plant=encode(sch,dd,3301n);
 const planted=sch.map(({L,e,M},i)=>unpack(M-1n-plant.ranks[i],L,e));
 const pr=planted.map(a=>frame(a,0)),secretRanks=planted.map((a,i)=>pr[i].M-1n-pack(a));
 assert(secretRanks.every((r,i)=>r===plant.ranks[i]),"secret rank plant");
 const dec=decode(pr,secretRanks,plant.terminal);
 assert(dec.seed===3301n&&dec.d.every((d,i)=>d===dd[i]),"native plant replay");
 assert(bound(12,pr).fails.length===0,"all-order bound rejects valid native plant");
 // Exhaustively compare the sorted-upper-cap assignment test to brute force on small domains.
 let toy=0;for(let M=1;M<=4;M++)for(let n=1;n<=M;n++){
   const caps=Array(n).fill(0);const walk=i=>{if(i===n){const a=[...caps].sort((x,y)=>x-y),criterion=a.every((v,j)=>v>=j);
     const match=(j,used)=>j===n||Array.from({length:caps[j]+1},(_,k)=>k).some(k=>!(used&(1<<k))&&match(j+1,used|(1<<k)));
     assert(criterion===match(0,0),"cap matching oracle");toy++;return}
     for(let k=0;k<M;k++){caps[i]=k;walk(i+1)}
   };walk(0)
 }
 let lo=0,hi=100000;assert(bound(lo).fails.length>0&&bound(hi).fails.length===0,"binary endpoints");
 while(hi-lo>1){const m=(lo+hi)>>1;if(bound(m).fails.length)lo=m;else hi=m}
 const b=bound(2048),low=bound(lo),high=bound(hi);
 const sections=raw.split("%").slice(0,55).join("%").split("$").filter(x=>[...x].some(c=>gp.has(c))).map(x=>{let z=[],w=[];for(const c of x){if(gp.has(c))w.push(gp.get(c));else if(c!=="/"&&c!=="%"&&!/\s/u.test(c)&&w.length){z.push(w);w=[]}}if(w.length)z.push(w);return z});
 assert(sections.flat().map(w=>w.join(",")).join("|")===words.map(w=>w.a.join(",")).join("|"),"source section partition");
 let offset=0;const split=sections.map(s=>{const i=offset;offset+=s.length;return rows.slice(i,offset)});
 const resetRows=split.flatMap(rs=>rs.map((v,i)=>({...v,restart:i===0})));
 const sharedReset=bound(256,resetRows),privateReset=split.map((rs,i)=>({section:i,words:rs.length,...bound(256,rs),canonicalMinimumSeedBits:bitlen(decode(rs,rs.map(v=>pack(v.type.split(",").map(Number))),0n).seed)}));
 assert(sharedReset.fails.length>0&&privateReset.every(x=>x.canonicalMinimumSeedBits>256),"section reset gate");
 const sectionReset={shared:{...sharedReset,groups:sharedReset.groups.filter(x=>x.frame==="1:0"||x.frame==="2:0")},private:privateReset.map(x=>({section:x.section,words:x.words,firstZero:x.firstZero,fails:x.fails,canonicalMinimumSeedBits:x.canonicalMinimumSeedBits}))};
 assert(lo===16650&&hi===16651&&b.firstZero===169&&b.fails.length===2,"original envelope expected");
 return {D,lexicon:D.reduce((a,b)=>a+b,0),sourceWords:rows.length,sourceRunes:words.flatMap(w=>w.a).length,sourceRepeats:63,sectionReset,table:b,lastExcluded:low,firstNotExcluded:high,canonical:{minimumSeedBits:bitlen(orig.seed),preview,exactReplay:rows.length},control:{seed:3301,words:control.length,runes:control.flat().length,terminal:plant.terminal.toString(),hiddenRank:"reverse",exactReplay:true,envelopePass:true},toy};
}
const root=path.join(__dirname,'..');
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(analyze(...paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));
