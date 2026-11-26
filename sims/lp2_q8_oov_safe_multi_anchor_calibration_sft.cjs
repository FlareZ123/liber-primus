// OOV-safe multi-anchor calibration for the shared GP29 q8 family.
// No original ciphertext is scored; the p54 profile supplies only lengths.
// Node CommonJS, standalone, using the repository's unaugmented register.
function anchorExperiment(raw,profile,mode="long",seconds=15){
 const N=29,Q=8,S="0123456789abcdefghijklmnopqrs",A="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),mod=x=>((x%N)+N)%N;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const inv=Array.from({length:N},(_,x)=>x===0?0:Array.from({length:28},(_,i)=>i+1).find(y=>x*y%N===1));
 const spell=new Map(A.map((x,i)=>[x,S[i]]));spell.set("ING",S[21]);
 const dict=new Set();
 for(const line of raw.split(/\r?\n/)){const m=/^([a-z]+)\s+([0-9]+)$/.exec(line.trim());if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const walk=(i,w)=>{if(i===s.length){dict.add(w);return}for(let n=1;n<=3&&i+n<=s.length;n++){const a=spell.get(s.slice(i,i+n));if(a!==undefined)walk(i+n,w+a)}};walk(0,"")}
 assert(dict.size===38910,"base register "+dict.size);
 const by=Array.from({length:60},()=>[]);for(const w of dict)by[w.length].push(w);for(const w of by)w.sort();
 const prefix=new Set(by[11].map(w=>w.slice(0,10)));
 let state=mode==="long"?0x71d56291:0x59d2a638;
 const rand=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
 const actual=profile.p54.body_groups.slice(0,47).map(w=>w.length);
 assert(actual.length===47&&actual.reduce((a,b)=>a+b,0)===213,"profile");
 const B=3;
 const lengths=mode==="long"?[18,18,17,16,16,16,15,15,15,15,...actual.slice(10)]:actual;
 const order=lengths.map((_,i)=>i).sort((a,b)=>lengths[b]-lengths[a]||a-b);
 const anchors=order.slice(0,B+1);
 const randomWord=len=>Array.from({length:len},()=>S[rand(N)]).join("");
 const truth=lengths.map(n=>by[n][rand(by[n].length)]);
 // Independent, deliberately generated OOVs. The longest anchor is OOV.
 const om=[anchors[0],order[order.length-8]];
 for(const i of om){do{truth[i]=randomWord(lengths[i])}while(dict.has(truth[i]))}
 let carry;do{carry=randomWord(11)}while(prefix.has(carry.slice(0,10))||dict.has(carry));
 const held=profile.p55.groups.slice(1).map(w=>by[w.length][rand(by[w.length].length)]);
 // The key is generated only after all plaintext, omissions, and lengths.
 const pi=Array.from({length:N},(_,i)=>i);
 for(let i=N-1;i>1;i--){const j=1+rand(i);[pi[i],pi[j]]=[pi[j],pi[i]]}
 const ip=[];pi.forEach((v,i)=>ip[v]=i);
 const key=Array.from({length:Q},()=>rand(N));key[0]=1;key[4]=2;key[3]=0;
 const encode=(w,start)=>{let p=start,out="";for(const x of w){const a=S.indexOf(x);if(a===0)out+="0";else{out+=S[ip[(pi[a]+key[p])%N]];p=(p+1)%Q}}return out};
 const c=truth.map(w=>encode(w,rand(Q))),cc=encode(carry,rand(Q)),hc=held.map(w=>encode(w,rand(Q)));
 function maps(p,k){const ip=[];p.forEach((v,i)=>ip[v]=i);return k.map(v=>p.map(x=>ip[mod(x-v)]))}
 function read(w,m,D,stop=false){const out=new Set();const a=Array.from(w,x=>S.indexOf(x));function go(i,j,s){if(i===a.length){if(!D||D.has(s)){out.add(s);return stop}return false}const x=a[i];if(!x&&go(i+1,j,s+"0")&&stop)return true;const p=m[j][x];return p!==0&&go(i+1,(j+1)%Q,s+S[p])}for(let j=0;j<Q;j++)if(go(0,j,"")&&stop)break;return out}
 const trueMaps=maps(pi,key);
 const actualMiss=c.map((w,i)=>read(w,trueMaps,dict,true).size?null:i).filter(i=>i!==null);
 assert(actualMiss.length>0&&actualMiss.length<=B,"control lexical OOV count "+actualMiss);
 assert(!prefix.has(carry.slice(0,10)),"prefix unexpectedly listed");
 const truePrefixSupport=read(cc.slice(0,10),trueMaps,prefix,true).size;
 const zero=()=>Array(Q).fill(0);
 const units=Array.from({length:Q},(_,i)=>Array.from({length:Q},(_,j)=>+(i===j)));
 const add=(a,b)=>a.map((x,i)=>(x+b[i])%N),sub=(a,b)=>a.map((x,i)=>mod(x-b[i]));
 const eq=(a,b)=>a.every((v,i)=>v===b[i]);
 function newGraph(){const a=Array.from({length:Q},zero);a[0][7]=1;for(let i=1;i<Q;i++)a[i][i-1]=1;return {d:7,a,r:Array.from({length:N},(_,i)=>i),size:Array(N).fill(1),off:Array.from({length:N},zero),comps:N}}
 function clone(g){return {d:g.d,a:g.a.map(r=>r.slice()),r:g.r.slice(),size:g.size.slice(),off:g.off.map(r=>r.slice()),comps:g.comps}}
 function project(g,v){const y=zero();for(let j=0;j<Q;j++)if(v[j]){for(let k=0;k<g.d;k++)y[k]=(y[k]+v[j]*g.a[j][k])%N;y[7]=(y[7]+v[j]*g.a[j][7])%N}return y}
 function impose(g,v){const e=project(g,v);let p=g.d-1;while(p>=0&&!e[p])p--;if(p<0)return e[7]===0;const last=g.d-1;for(const r of g.a){const f=r[p]*inv[e[p]]%N;if(f){for(let j=0;j<g.d;j++)if(j!==p)r[j]=mod(r[j]-f*e[j]);r[7]=mod(r[7]-f*e[7])}if(p!==last)r[p]=r[last];r[last]=0}g.d--;return true}
 function edge(g,x,p,j){let rc=g.r[x],rp=g.r[p];const shift=sub(add(g.off[p],units[j]),g.off[x]);if(rc===rp)return impose(g,shift);if(g.size[rc]<=g.size[rp]){for(let i=0;i<N;i++)if(g.r[i]===rc){g.r[i]=rp;g.off[i]=add(g.off[i],shift)}g.size[rp]+=g.size[rc];g.size[rc]=0}else{for(let i=0;i<N;i++)if(g.r[i]===rp){g.r[i]=rc;g.off[i]=sub(g.off[i],shift)}g.size[rc]+=g.size[rp];g.size[rp]=0}g.comps--;return true}
 function extend(g,opt){const h=clone(g);for(const [x,p,j] of opt)if(!edge(h,x,p,j))return null;if(h.a.slice(0,4).every((r,i)=>eq(r,h.a[i+4])))return null;const v=h.off.map(o=>project(h,o));for(let i=0;i<N;i++)for(let j=0;j<i;j++)if(h.r[i]===h.r[j]&&eq(v[i],v[j]))return null;return h}
 function sig(g){let out=g.d+":"+g.a.map(x=>x.join(",")).join(";")+"|";const root=new Map();for(let i=0;i<N;i++){if(!root.has(g.r[i]))root.set(g.r[i],i);const a=root.get(g.r[i]);out+=a+":"+project(g,sub(g.off[i],g.off[a])).join(",")+";"}return out}
 const dim=g=>g.d+g.comps-1;
 function options(w,anchor){const a=Array.from(w,x=>S.indexOf(x)),out=[],seen=new Set();
  for(const word of by[w.length]){const p=Array.from(word,x=>S.indexOf(x));let canonical=-1,n=0,valid=true;for(let i=0;i<p.length;i++){if(p[i]===0){if(a[i]!==0){valid=false;break};continue}if(canonical<0&&p[i]!==a[i])canonical=(Q-n%Q)%Q;n++}if(!valid)continue;
   for(let st=0;st<Q;st++){if(anchor&&canonical>=0&&st!==canonical)continue;const e=[];let j=st,good=true;for(let i=0;i<p.length;i++){if(!p[i])continue;const x=a[i],y=p[i];if(j===0&&x===y){good=false;break}if(e.some(([c,p,k])=>k===j&&(((c===x)!==(p===y))||((c===p)!==(x===y))))){good=false;break}e.push([x,y,j]);j=(j+1)%Q}if(!good)continue;const id=[...new Set(e.map(t=>t.join(",")))].sort().join(";");if(seen.has(id))continue;seen.add(id);out.push({edges:e,word,st})}}
  return out}
 const seeds=[],seedKeys=new Set(),counts=[];
 for(const i of anchors){let legal=0;for(const o of options(c[i],true)){const g=extend(newGraph(),o.edges);if(!g)continue;legal++;const s=sig(g);if(!seedKeys.has(s)){seedKeys.add(s);seeds.push({g,i})}}counts.push({group:i,len:lengths[i],legal})}
 seeds.sort((a,b)=>dim(a.g)-dim(b.g)||a.i-b.i);
 // Independent plant truth checks only; search receives c and dictionary, never truth.
 function contains(g,p,k){const v=g.off.map(o=>mod(o.reduce((s,x,j)=>s+x*k[j],0)));for(let i=0;i<N;i++)if(mod(p[i]-p[g.r[i]])!==v[i])return false;
  // A reduced key-space can be checked by enumerating original-coordinate affine equations:
  // Construct the span by solving [A | key-constant] over GF29.
  const m=g.a.map((r,i)=>[...r.slice(0,g.d),mod(k[i]-r[7])]);let rank=0;for(let col=0;col<g.d;col++){const q=m.findIndex((r,i)=>i>=rank&&r[col]);if(q<0)continue;[m[rank],m[q]]=[m[q],m[rank]];let f=inv[m[rank][col]];m[rank]=m[rank].map(x=>x*f%N);for(let i=0;i<m.length;i++)if(i!==rank){f=m[i][col];if(f)m[i]=m[i].map((x,j)=>mod(x-f*m[rank][j]))}rank++}return m.every(r=>r.slice(0,g.d).some(Boolean)||!r[g.d])}
 let trueSeed=0;for(const {g} of seeds){for(let r=0;r<Q;r++)if(key[r]){const p=pi.map(x=>x*inv[key[r]]%N),k=key.map((_,j)=>key[(j+r)%Q]*inv[key[r]]%N);if(contains(g,p,k)){trueSeed++;break}}}
 assert(trueSeed>0,"true action absent from all seeds");
 const report={mode,register:dict.size,prefixes:prefix.size,groups:lengths.length,runes:lengths.reduce((a,b)=>a+b,0),anchorIndices:anchors,counts,distinctSeeds:seeds.length,trueSeeds:trueSeed,truthOov:om,actualMiss,trueCarryPrefix:carry.slice(0,10),oldPrefixSupportUnderTrueAction:!!truePrefixSupport,carryInRegister:dict.has(carry)};
 if(mode==="profile")return report;
 // Blind search: no access to plant truth, no carry or holdout in fit.
 const domains=c.map(w=>options(w,false).map(o=>o.edges));const deadline=Date.now()+seconds*1000;let timed=false,nodes=0,joins=0,keys=0,packs=0,finished=0,answer=null;
 const stop=()=>{if(Date.now()>=deadline)timed=true;return timed||answer!==null};
 function check(p,k){const m=maps(p,k);let miss=0;for(const i of order)if(!read(c[i],m,dict,true).size&&++miss>B)return;answer={p,k,miss}}
 function pack(g,k){keys++;if(k.slice(0,4).every((x,i)=>x===k[i+4]))return;const val=g.off.map(o=>mod(o.reduce((s,x,j)=>s+x*k[j],0))),parts=new Map();
  for(let i=0;i<N;i++){if(!parts.has(g.r[i]))parts.set(g.r[i],[]);const a=parts.get(g.r[i]);if(a.includes(val[i]))return;a.push(val[i])}
  const trans=new Map(),root=g.r[0];trans.set(root,mod(-val[0]));const bit=(a,t)=>a.reduce((m,x)=>m|(1<<((x+t)%N)),0);
  function rec(mask,left){if(stop())return;packs++;if(!left.length){check(g.r.map((r,i)=>mod(val[i]+trans.get(r))),k);return}
   let best=-1,opts;for(let i=0;i<left.length;i++){const a=parts.get(left[i]),o=[];for(let t=0;t<N;t++)if(!(mask&bit(a,t)))o.push(t);if(!o.length)return;if(best<0||o.length<opts.length){best=i;opts=o;if(o.length===1)break}}
   const r=left[best],rem=left.filter((_,i)=>i!==best);for(const t of opts){trans.set(r,t);rec(mask|bit(parts.get(r),t),rem);if(stop())return}}
  rec(bit(parts.get(root),trans.get(root)),[...parts.keys()].filter(r=>r!==root))}
 function enumerate(g){const a=Array(g.d).fill(0);function rec(i){if(stop())return;if(i===g.d){const k=g.a.map(r=>mod(r[7]+a.reduce((s,x,j)=>s+x*r[j],0)));pack(g,k);return}for(let x=0;x<N;x++){a[i]=x;rec(i+1);if(stop())return}}rec(0)}
 function dfs(g,rem,b){if(stop())return;nodes++;if(dim(g)<=2||rem.length<=b){enumerate(g);return}
  let pick=-1,best=[];for(let z=0;z<Math.min(3,rem.length);z++){const id=rem[z],next=[],seen=new Set();for(const e of domains[id]){if(stop())return;joins++;const h=extend(g,e);if(!h)continue;const k=sig(h);if(!seen.has(k)){seen.add(k);next.push(h)}if(pick>=0&&next.length>=best.length)break}
   if(!next.length){if(b)dfs(g,rem.filter(x=>x!==id),b-1);return}
   if(pick<0||next.length<best.length){pick=id;best=next}}
  const r=rem.filter(i=>i!==pick);best.sort((a,b)=>dim(a)-dim(b));for(const h of best){dfs(h,r,b);if(stop())return}if(b)dfs(g,r,b-1)}
 for(const {g,i} of seeds){if(stop())break;dfs(g,order.filter(x=>x!==i),B);if(!stop())finished++}
 Object.assign(report,{found:!!answer,timed,nodes,joins,keys,packs,finished});
 if(answer){const m=maps(answer.p,answer.k);const equal=Array.from({length:Q},(_,r)=>r).some(r=>m.every((a,j)=>eq(a,trueMaps[(j+r)%Q])));const h=hc.map((w,i)=>read(w,m,dict).has(held[i]));report.exactAction=equal;report.trainingTrueInRegister=c.filter((w,i)=>read(w,m,dict).has(truth[i])).length;report.holdoutCorrect=h.filter(Boolean).length;report.holdoutTotal=held.length;report.carryTruthInUnconstrainedInverse=read(cc,m,null).has(carry);report.answerOov=answer.miss}
 return report;
}
if (require.main===module){const fs=require("node:fs");const raw=fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8");const p=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8"));console.log(JSON.stringify(anchorExperiment(raw,p,"long",Number(process.argv[2]||15)),null,2));console.log(JSON.stringify(anchorExperiment(raw,p,"profile",1),null,2));}
module.exports={anchorExperiment};
