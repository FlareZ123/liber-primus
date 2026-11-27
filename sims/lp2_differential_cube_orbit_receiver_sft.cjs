// @ts-check
"use strict";
/** Original-cipher differential GP29 cube receiver, exact orbit membership and blind controls. */
const fs=require("node:fs");
const path=require("node:path");
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"].map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function experiment(inputs){
  const corpus=JSON.parse(inputs[0]), native=JSON.parse(inputs[1]);
  const mod=x=>((x%29)+29)%29;
  const fail=(b,m)=>{if(!b)throw Error(m)};
  const cube=x=>x*x*x%29;
  const orbit=new Int8Array(29).fill(-1), classes=[];
  for(let x=0;x<29;x++)if(orbit[x]<0){const c=[];let v=x;do{orbit[v]=classes.length;c.push(v);v=cube(v)}while(v!==x);classes.push(c)}
  const size=classes.map(c=>c.length);
  const q=Array.from({length:6},(_,n)=>Array.from({length:29},(_,x)=>{for(let i=0;i<n;i++)x=cube(x);return x}));
  fail(q[5].every((x,i)=>cube(x)===i),"cube order");
  const dict=new Map(corpus.translit.map((s,i)=>[s,i]));
  const glyphs=new Map(corpus.runes.map((s,i)=>[s,i]));
  const lig=["TH","EO","NG","OE","AE","IA","EA"];
  function latin(text){
    const out=[];
    for(let word of (text.match(/[A-Za-z]+/g)||[])){
      word=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
      for(let i=0;i<word.length;){const s=lig.find(g=>word.startsWith(g,i))||word[i];fail(dict.has(s),"unknown token "+s);out.push(dict.get(s));i+=s.length}
    }
    return Uint8Array.from(out)
  }
  const nativeRecords=native.sections.map(s=>({name:s.name,a:Uint8Array.from([...s.source_text].filter(x=>glyphs.has(x)).map(x=>glyphs.get(x)))}));
  const donors=["Gibran","Shakespeare","Emerson"].map((name,i)=>({name,a:latin(inputs[i+2])})).concat(nativeRecords);
  const starts=[0,3,8,15,23,27,33,40,54,56];
  function tape(lo,hi){return corpus.pages.filter(p=>p.page>=lo&&p.page<hi).flatMap(p=>p.indices)}
  fail(tape(0,56).length===12956,"unexpected original length");
  function diff(c){return c.slice(1).map((v,i)=>mod(v-c[i]))}
  function signature(c){return diff(c).map(v=>orbit[v])}
  function encode(p,b,phase,dir,iv){let c=[iv];for(let i=0;i<p.length;i++){const t=(phase+dir*i%6+6)%6;c.push(mod(c[c.length-1]+q[t][mod(p[i]-b)]))}return c}
  function decode(c,b,phase,dir){return diff(c).map((d,i)=>mod(q[(6-((phase+dir*i%6+6)%6))%6][d]+b))}
  function train(a){const u=new Float64Array(29),v=new Float64Array(841),w=new Float64Array(24389),vc=new Float64Array(29),wc=new Float64Array(841);for(let i=0;i<a.length;i++){u[a[i]]++;if(i){v[a[i-1]*29+a[i]]++;vc[a[i-1]]++}if(i>1){let j=a[i-2]*29+a[i-1];w[j*29+a[i]]++;wc[j]++}}return (a,lo=0,hi=a.length)=>{let s=0;for(let i=lo;i<hi;i++){let p=(u[a[i]]+.5)/(a.length*0+u.reduce((x,y)=>x+y,0)+14.5);if(i){p=(v[a[i-1]*29+a[i]]+10*p)/(vc[a[i-1]]+10)}if(i>1){const j=a[i-2]*29+a[i-1];p=(w[j*29+a[i]]+20*p)/(wc[j]+20)}s+=Math.log(p)}return s/(hi-lo)}}
  const score=train(donors[0].a.slice(0,Math.floor(donors[0].a.length/2)));
  function ranked(c,split){const rows=[];for(let b=0;b<29;b++)for(let phase=0;phase<6;phase++)for(const dir of [1,-1]){const p=decode(c,b,phase,dir);rows.push({b,phase,dir,train:score(p,0,split),held:score(p,split),preview:p.slice(0,70).map(x=>corpus.translit[x]).join(" ")})}rows.sort((a,b)=>b.train-a.train);const best=rows[0], p=decode(c,best.b,best.phase,best.dir);fail(JSON.stringify(encode(p,best.b,best.phase,best.dir,c[0]))===JSON.stringify(c),"original replay");return {best,sourceFixed:rows.filter(x=>x.b===2&&x.phase===0),top5:rows.slice(0,5),p}}
  const original=tape(27,33),split=tape(27,29).length-1,origRank=ranked(original,split);
  const controls=[];
  for(let j=0;j<2;j++){const p=Array.from(donors[j===0?1:2].a.slice(10000+j*20000,10000+j*20000+original.length-1));const truth={b:j?17:2,phase:j?4:1,dir:j?-1:1,iv:j?12:19};const c=encode(p,truth.b,truth.phase,truth.dir,truth.iv);const rr=ranked(c,split);controls.push({truth,best:rr.best,heldExact:p.slice(split).filter((v,i)=>v===rr.p[split+i]).length,heldLength:p.length-split})}
  // Exact arbitrary static alphabet and per-position orbit-round membership.
  // Each plaintext symbol must map consistently to one cube orbit, and no orbit
  // may be assigned more distinct plaintext symbols than its cardinality.
  // Those conditions suffice: complete each partial bijection within the orbit,
  // then choose the power of Q separately at each position.
  function matchWindow(p,offset,pattern,assign,used){assign.fill(-1);used.fill(0);for(let i=0;i<pattern.length;i++){const x=p[offset+i],y=pattern[i],old=assign[x];if(old===y)continue;if(old!==-1||used[y]===size[y])return false;assign[x]=y;used[y]++}return true}
  function scan(pattern,records){const results=[];const assigned=new Int8Array(29),used=new Uint8Array(classes.length);for(const d of records){let count=0,first=[];const n=Math.max(0,d.a.length-pattern.length+1);for(let j=0;j<n;j++)if(matchWindow(d.a,j,pattern,assigned,used)){count++;if(first.length<4)first.push(j)}results.push({name:d.name,windows:n,matches:count,first})}return results}
  const chapterResults=[];for(let j=0;j<9;j++){const c=tape(starts[j],starts[j+1]);const pattern=signature(c);const full=scan(pattern,donors);const prefix=scan(pattern.slice(0,32),donors);chapterResults.push({pages:[starts[j],starts[j+1]-1],length:pattern.length,full,prefix32:prefix,orbitCounts:classes.map((_,k)=>pattern.filter(v=>v===k).length)})}
  // Two deliberately hidden charts with independently varying round counts.
  const chartControls=[];
  let state=0x27182818;const rnd=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n};
  for(let j=0;j<2;j++){
    const src=donors[j+1],off=40000+j*1000,len=original.length-1;
    const plain=src.a.slice(off,off+len);let chart=Array.from({length:29},(_,i)=>i);
    for(let i=28;i>0;i--){const k=rnd(i+1);[chart[i],chart[k]]=[chart[k],chart[i]]}
    const c=[rnd(29)],rounds=[];for(const x of plain){const k=rnd(6);rounds.push(k);c.push(mod(c[c.length-1]+q[k][chart[x]]))}
    const sig=signature(c);const hit=scan(sig,[src])[0];
    fail(matchWindow(src.a,off,sig,new Int8Array(29),new Uint8Array(classes.length)),"true chart rejected");
    // Verify true chart/round path, and construct any compatible chart from the discovered orbit assignment.
    const assignment=new Int8Array(29),used=new Uint8Array(classes.length);
    fail(matchWindow(src.a,off,sig,assignment,used),"missing true window");
    const reconstructed=new Int8Array(29).fill(-1);
    for(let k=0;k<classes.length;k++){let j=0;for(let x=0;x<29;x++)if(assignment[x]===k)reconstructed[x]=classes[k][j++]}
    const free=Array.from({length:29},(_,x)=>x).filter(x=>!reconstructed.includes(x));let f=0;for(let x=0;x<29;x++)if(reconstructed[x]<0)reconstructed[x]=free[f++];
    let exact=0;const d=diff(c);for(let i=0;i<plain.length;i++)if(q.some(row=>row[reconstructed[plain[i]]]===d[i]))exact++;
    fail(exact===plain.length,"constructed compatible chart replay");
    chartControls.push({source:src.name,offset:off,length:len,windowSearch:hit,compatibleReconstructedRunes:exact,chartUnique:false});
  }
  return {classes,donorLengths:donors.map(d=>[d.name,d.a.length]),originalFixedClock:{pages:[27,32],train:split,held:original.length-1-split,best:origRank.best,top5:origRank.top5,sourceFixed:origRank.sourceFixed},fixedClockControls:controls,variableRoundOriginal:chapterResults,variableRoundControls:chartControls};
}
console.log(JSON.stringify(experiment(inputs),null,2));
