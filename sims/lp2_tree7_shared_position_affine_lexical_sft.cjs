"use strict";
/** Shared position affine inverse using exact word/column arc consistency.
 * Every column allows all 812 inverse AGL(1,29) maps. Printed-word model only.
 * node sims/lp2_tree7_shared_position_affine_lexical_sft.cjs original|plant0|plant1
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const ix=new Map(gp.runes.map((c,i)=>[c,i])),N=137,K=812,Q=29,FULL=(1<<29)-1;
const maps=Array.from({length:K},(_,k)=>Uint8Array.from({length:Q},(_,c)=>((1+Math.floor(k/Q))*c+k%Q)%Q));
const id=w=>w.join(","),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function parse(t,separator){const words=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&separator.test(between)){words.push(w);w=[]}w.push(ix.get(c));between="";}else between+=c;}if(w.length)words.push(w);return words;}
const nativeWords=native.sections.map(s=>parse(s.source_text,/[^\u16a0-\u16ff]/u));
assert.equal(nativeWords.flat(2).length,2979);
const vocabulary=new Map();
function add(w){if(w.length&&w.length<=24)vocabulary.set(id(w),w);}
function spell(text,alt){const w=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v);p.push(v.i);j+=v.t.length;}return p;}
for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true])add(spell(m[1],alt));}
for(const words of nativeWords)for(const w of words)add(w);
for(let x=0;x<29;x++)add([x]);
const byLen=Array.from({length:25},()=>[]);for(const w of vocabulary.values())byLen[w.length].push(w);
const whole=parse(read("resources/transcriptions/lp2-image-corrected.txt"),/[-.&]/u);
assert.equal(id(whole.flat().slice(0,12956)),id(gp.pages.slice(0,56).flatMap(p=>p.indices)));
assert.equal(whole.slice(0,2896).flat().length,12956);
function intervals(words){let at=0;return words.map(w=>{let s=at;at+=w.length;return {s,e:at,w};});}
const sourceIntervals=intervals(whole.slice(0,2896));
const original=gp.pages.slice(8,15).map(p=>p.indices.slice(0,N));
assert.deepEqual(gp.pages.slice(8,15).map(p=>p.indices.length),[255,268,263,273,261,272,137]);
let pageStart=gp.pages.slice(0,8).reduce((a,p)=>a+p.indices.length,0);
const sourceWords=[];
for(let j=0;j<7;j++){const off=pageStart;sourceWords.push(sourceIntervals.filter(w=>w.s>=off&&w.e<=off+N).map(w=>({s:w.s-off,e:w.e-off,w:w.w})));pageStart+=gp.pages[8+j].indices.length;}
function initialize(C,W,num=6){const words=[];for(let j=0;j<num;j++)for(const w of W[j])words.push({j,s:w.s,e:w.e,d:byLen[w.e-w.s]||[]});return words;}
/** Exact necessary arc consistency; missing words/columns are unconstrained. */
function propagate(C,words,seedDomains=null){
 let domains=seedDomains?seedDomains.map(d=>d.slice()):Array.from({length:N},()=>Array.from({length:K},(_,i)=>i));
 let W=words.map(w=>({...w,d:w.d.slice()})), rounds=0;
 while(true){rounds++;let changed=false;
  const masks=Array.from({length:C.length},()=>new Int32Array(N).fill(FULL));
  for(const w of W){
   if(!w.d.length)return {status:"empty-word",rounds,words:W,domains};
   const m=new Int32Array(w.e-w.s);for(const v of w.d)for(let r=0;r<v.length;r++)m[r]|=1<<v[r];
   for(let r=0;r<m.length;r++)masks[w.j][w.s+r]&=m[r];
  }
  for(let t=0;t<N;t++){const old=domains[t];domains[t]=old.filter(k=>{for(let j=0;j<C.length;j++)if(!(masks[j][t]&(1<<maps[k][C[j][t]])))return false;return true;});
   if(!domains[t].length)return {status:"empty-column",t,rounds,words:W,domains};
   if(domains[t].length!==old.length)changed=true;
  }
  const allowed=Array.from({length:C.length},()=>new Int32Array(N));
  for(let t=0;t<N;t++)for(const k of domains[t])for(let j=0;j<C.length;j++)allowed[j][t]|=1<<maps[k][C[j][t]];
  for(const w of W){const old=w.d;w.d=old.filter(v=>v.every((x,r)=>allowed[w.j][w.s+r]&(1<<x)));
   if(!w.d.length)return {status:"empty-word",rounds,words:W,domains};
   if(w.d.length!==old.length)changed=true;
  }
  if(!changed)return {status:"fixed",rounds,words:W,domains};
 }
}
function summary(r){return {status:r.status,t:r.t,rounds:r.rounds,uniqueKeys:r.domains.filter(d=>d.length===1).length,meanKeyDomain:r.domains.reduce((a,d)=>a+d.length,0)/N,uniqueWords:r.words.filter(w=>w.d.length===1).length,wordCount:r.words.length};}
function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n;};}
function control(which){
 const spec=which===0?[[1,3],[3,4]]:[[4,5],[5,2]];
 const W=[],P=[];
 for(const [s,n] of spec){const tape=nativeWords[s].flat(),ints=intervals(nativeWords[s]);for(let i=0;i<n;i++){const off=i*N;P.push(tape.slice(off,off+N));W.push(ints.filter(w=>w.s>=off&&w.e<=off+N).map(w=>({s:w.s-off,e:w.e-off,w:w.w})));}}
 const rand=rng(461101+which),truth=Array.from({length:N},()=>rand(K)),C=P.map(p=>p.map((x,t)=>maps[truth[t]].indexOf(x)));
 const r=propagate(C.slice(0,6),initialize(C,W));assert.equal(r.status,"fixed");
 assert(r.domains.every((d,t)=>d.includes(truth[t])));assert(r.words.every(w=>w.d.some(x=>id(x)===id(P[w.j].slice(w.s,w.e)))));
 const heldUnique=r.domains.map((d,t)=>new Set(d.map(k=>maps[k][C[6][t]]))).filter(d=>d.size===1).length;
 const heldTruth=r.domains.every((d,t)=>d.some(k=>maps[k][C[6][t]]===P[6][t]));
 return {...summary(r),heldUnique,heldTruth,which};
}
function originalGate(){
 const C=original.slice(0,6),words=initialize(C,sourceWords);
 const r=propagate(C,words);
 // Find disjoint contradictory word sets in increasing prefix widths.
 // Each core is exact and requires >=1 separate OOV word. Remove only its
 // members before next search; no key-domain results are reused.
 let pool=words.slice(),cores=[];
 while(pool.length){const full=propagate(C,pool);if(full.status==="fixed")break;
  let core=pool;
  // Binary search shortest prefix containing a contradiction.
  let lo=0,hi=N;while(lo+1<hi){const mid=(lo+hi)>>1,sub=pool.filter(w=>w.e<=mid);if(propagate(C,sub).status==="fixed")lo=mid;else hi=mid;}
  core=pool.filter(w=>w.e<=hi);
  for(let i=core.length-1;i>=0;i--){const sub=core.filter((_,j)=>j!==i);if(propagate(C,sub).status!=="fixed")core=sub;}
  assert(core.length&&propagate(C,core).status!=="fixed");
  cores.push(core.map(w=>({page:w.j+8,s:w.s,e:w.e})));const used=new Set(core);pool=pool.filter(w=>!used.has(w));
 }
 return {...summary(r),vocabulary:vocabulary.size,completeWordsByPage:sourceWords.map(w=>w.length),disjointOOVLowerBound:cores.length,budget:Math.floor(words.length*.05),cores,remaining:pool.length};
}
const mode=process.argv[2]||"original";
console.log(JSON.stringify(mode==="original"?originalGate():control(Number(mode.slice(-1)))));
