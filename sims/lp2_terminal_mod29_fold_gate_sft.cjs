'use strict';
const fs = require('node:fs');
const path = require('node:path');
function experiment(corpus, ink, native) {
  const mod=x=>(x%29+29)%29;
  const count=weights=>{let dp=Array(29).fill(0n);dp[0]=1n;for(const w of weights){dp=dp.map((v,s)=>v+dp[mod(s-w)]);}if(dp.reduce((a,b)=>a+b,0n)!==(1n<<BigInt(weights.length)))throw Error("count");return dp;};
  const primeMinusOne=[];for(let p=2;primeMinusOne.length<13000;p++){let ok=true;for(let k=2;k*k<=p;k++)if(p%k===0){ok=false;break;}if(ok)primeMinusOne.push(mod(p-1));}
  let tape=[],offsets={};for(const p of corpus.pages.filter(p=>p.page<56)){offsets[p.page]=tape.length;tape.push(...p.indices);}
  const marks=ink.pages.filter(p=>p.page<56).flatMap(p=>(p.large_punctuation||[]).filter(x=>x[1]===13&&x[2]==="red").map(x=>({page:p.page,offset:x[0],end:offsets[p.page]+x[0]})));
  let start=0;
  const frames=marks.map(mark=>{let s=tape.slice(start,mark.end),by=Array.from({length:29},()=>[]);for(let i=1;i<s.length;i++)by[mod(s[i]-s[i-1])].push(i);const ranks=by.slice(1).map((pos,i)=>{const counts=count(pos.map(j=>primeMinusOne[j-1]));const min=counts.filter(v=>v>0n).reduce((a,b)=>a<b?a:b);const simple=count(pos.map(()=>1));const lower=pos.length>28?1n<<BigInt(pos.length-28):1n;if(min<lower)throw Error("universal lower bound");return {d:i+1,m:pos.length,constant13:String(simple[13]),prime13:String(counts[13]),primeMin:String(min),universalMin:String(lower),primeUniqueStates:counts.filter(x=>x===1n).length};});const frame={...mark,start,n:s.length,repeats:by[0].length,minAlias:Math.min(...ranks.map(x=>x.m)),maxAlias:Math.max(...ranks.map(x=>x.m)),ranks};start=mark.end;return frame;});
  if(tape.length!==12956||start!==tape.length||marks.length!==27)throw Error("framing");
  // Plant controls with same lengths and exact repeat positions from independent original frames;
  // give the decoder repeat plaintext values as an oracle (optimistic relaxation).
  const nativeTape=native.sections.flatMap(s=>[...s.source_text].map(r=>native.runes.indexOf(r)).filter(x=>x>=0));
  function plant(p,repeat,weights){let C=[p[0]],state=0,alias=[],oracle={};for(let i=1;i<p.length;i++){if(repeat.has(i)){C.push(C[i-1]);oracle[i]=p[i];continue;}const d=p[i]===28?1:p[i]+1;C.push(mod(C[i-1]+d));if(d===1){alias.push(i);if(p[i]===28)state=mod(state+weights(i));}}
    const dp=count(alias.map(weights));let replayState=0;const recovered=[C[0]];for(let i=1;i<C.length;i++){const d=mod(C[i]-C[i-1]);const v=d===0?oracle[i]:d===1?p[i]:d-1;recovered.push(v);if(d===1&&v===28)replayState=mod(replayState+weights(i));}if(replayState!==state||recovered.some((v,i)=>v!==p[i]))throw Error("plant truth");return {n:p.length,repeat:repeat.size,alias:alias.length,state,trueMultiplicity:String(dp[state]),wrongStateMultiplicity:String(dp[mod(state+1)]),anyWrongStateUnique:dp.some((v,i)=>i!==state&&v===1n)};}
  const plants=frames.filter(f=>f.n>=100&&f.n<=nativeTape.length).map((f,k)=>{const orig=tape.slice(f.start,f.end);const rep=new Set();for(let j=1;j<orig.length;j++)if(orig[j]===orig[j-1])rep.add(j);const off=(k*173)%(nativeTape.length-f.n+1);return {frameEnd:f.end,off,...plant(nativeTape.slice(off,off+f.n),rep,j=>primeMinusOne[j-1])};});
  // Short exactly enumerable positive and wrong endpoint control.
  const short=plant([15,28,7],new Set(),()=>1);
  if(short.trueMultiplicity!=="1"||short.wrongStateMultiplicity!=="0")throw Error("short plant");
  // Exhaustive small-control subset counts independently of DP.
  for(let n=0;n<=12;n++){const ws=Array.from({length:n},(_,i)=>primeMinusOne[i]);const brute=Array(29).fill(0n);for(let mask=0;mask<2**n;mask++){let t=0;for(let j=0;j<n;j++)if(mask>>j&1)t+=ws[j];brute[mod(t)]++;}if(count(ws).some((v,i)=>v!==brute[i]))throw Error("brute");}
  return {frames,plants,short,sourceRunes:tape.length,marks:marks.length,nativeRunes:nativeTape.length};
}
function witness(corpus,start,end,target) {
  const mod=x=>(x%29+29)%29;const c=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices).slice(start,end);
  let w=[];for(let p=2;w.length<c.length;p++){let ok=true;for(let k=2;k*k<=p;k++)if(p%k===0){ok=false;break;}if(ok)w.push(mod(p-1));}
  let alias=[];for(let i=1;i<c.length;i++)if(mod(c[i]-c[i-1])===1)alias.push(i);
  // Suffix DP and rank-select, using distinct canonical binary paths.
  const suffix=Array(alias.length+1);suffix[alias.length]=Array(29).fill(0n);suffix[alias.length][0]=1n;
  for(let j=alias.length-1;j>=0;j--)suffix[j]=suffix[j+1].map((v,s)=>v+suffix[j+1][mod(s-w[alias[j]-1])]);
  function decode(rank) {let rem=target,ones=new Set();for(let j=0;j<alias.length;j++){const zero=suffix[j+1][rem];if(rank>=zero){rank-=zero;ones.add(alias[j]);rem=mod(rem-w[alias[j]-1]);}}if(rem||rank)throw Error("unrank");
    const p=[c[0]];for(let i=1;i<c.length;i++){const d=mod(c[i]-c[i-1]);p.push(d===0?0:d===1?(ones.has(i)?28:0):d-1);}
    let out=[p[0]],state=0;for(let i=1;i<p.length;i++){const repeat=c[i]===c[i-1];const d=repeat?0:p[i]===28?1:p[i]+1;out.push(mod(out[i-1]+d));if(!repeat&&p[i]===28)state=mod(state+w[i-1]);}if(state!==target||out.some((v,i)=>v!==c[i]))throw Error("replay");return p;
  }
  const p0=decode(0n),p1=decode(1n);if(p0.every((v,i)=>v===p1[i]))throw Error("same witness");
  return {start,end,target,alias:alias.length,count:String(suffix[0][target]),different:p0.flatMap((x,i)=>x===p1[i]?[]:[[i,x,p1[i]]]),p0,p1};
}
const root=path.resolve(__dirname,'..');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json","resources/external/relikd-solved-gp29-native-v1.json"];
const sources=paths.map(p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')));
const result=experiment(...sources);
result.witness=witness(sources[0],9640,12648,13);
console.log(JSON.stringify(result,null,2));
