'use strict';
// Agent22: mapped historical DIVINITY common-cycle exact affine-space anchor test.
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/control/english_wordfreq_textblob.txt",
    "sha": "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  },
  {
    "path": "resources/control/gibran_prophet_58585.txt",
    "sha": "df260a07d56bf5998d40a6360b6132c35c252d10"
  },
  {
    "path": "resources/control/emerson_essays_2944.txt",
    "sha": "a92be8ba5b3511a003a22ba31523c14397aaa83a"
  }
];
function experiment(raw,config={}) {
 const [gp,trans,native,lex,...donors]=raw;
 const G=JSON.parse(gp),N=JSON.parse(native),K=[23,10,1,10,9,10,16,26],W=29,L=28,mod=x=>(x+841)%29;
 const check=(x,m)=>{if(!x)throw Error(m)},key=w=>String.fromCharCode(...w),idx=new Map(G.runes.map((x,i)=>[x,i]));
 const parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)));
 const all=parse(trans.replace(/[\s/%]/g,"")),C=all.slice(2830,2896);
 check(all.length===2941&&C.length===66&&C.flat().length===308&&C.flat().join()===G.pages.slice(54,56).flatMap(p=>p.indices).join(),"physical source mismatch");
 const alpha=new Map(G.translit.map((x,i)=>[x,i])),dict=new Map();
 function add(w,f){let k=key(w);if(!dict.has(k)||dict.get(k).f<f)dict.set(k,{w,f})}
 function variants(word,fn){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){fn(w);return}for(let n=1;n<=3;n++){let t=s.slice(i,i+n),v=n===3?(t==="ING"?alpha.get("NG"):undefined):alpha.get(t);if(t.length===n&&v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const line of lex.split(/\r?\n/)){let m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],w=>add(w,+m[2]))}
 const pool=N.sections.flatMap(s=>parse(s.source_text));for(const w of pool)add(w,1);
 const by=Array.from({length:40},()=>[]);for(const x of dict.values())by[x.w.length].push(x);
 const inv=Array(29).fill(0);for(let x=1;x<29;x++)for(let y=1;y<29;y++)if(x*y%29===1)inv[x]=y;
 /** Each of the 29 coordinate rows is affine in d active parameters; column 28 is constant. */
 function constrain(s,terms){
  const a=s.a,d=s.d,eq=new Int16Array(29);let p=-1;
  for(let j=0;j<d;j++){let z=0;for(const [x,v] of terms)z+=v*a[x*W+j];eq[j]=mod(z);if(eq[j])p=j}
  let z=0;for(const [x,v] of terms)z+=v*a[x*W+L];eq[L]=mod(z);if(p<0)return eq[L]===0;
  const reciprocal=inv[eq[p]];
  for(let x=0;x<29;x++){let off=x*W,f=a[off+p]*reciprocal%29;if(f){for(let j=0;j<d;j++)if(j!==p)a[off+j]=mod(a[off+j]-f*eq[j]);a[off+L]=mod(a[off+L]-f*eq[L]);}if(p!==d-1)a[off+p]=a[off+d-1];a[off+d-1]=0;}
  s.vars[p]=s.vars[d-1];s.vars.pop();s.d--;return true;
 }
 function valid(s){const set=new Set(),a=s.a,d=s.d;for(let x=0;x<29;x++){let o=x*W,k=String.fromCharCode(...a.subarray(o,o+d),a[o+L]);if(set.has(k))return false;set.add(k)}return true}
 function base(){let s={a:new Uint8Array(W*W),d:0,vars:[]};for(let x=1;x<29;x++)if(x!==23){s.a[x*W+s.d++]=1;s.vars.push(x)}s.a[23*W+L]=1;check(constrain(s,Array.from({length:29},(_,i)=>[i,1]))&&s.d===26,"sum gauge");return s}
 function clone(s){return {a:s.a.slice(),d:s.d,vars:s.vars.slice()}}
 function apply(s,edges){const v=clone(s);for(const [c,p,k] of edges)if(!constrain(v,[[c,1],[p,-1],[k,-1]]))return null;return valid(v)?v:null}
 function edges(c,w,start){let j=start,e=[];for(let i=0;i<c.length;i++){if(w[i]===0){if(c[i]!==0)return null;continue}let k=K[j];if(c[i]===w[i]||c[i]===k)return null;e.push([c[i],w[i],k]);j=(j+1)%8}return e}
 const b=base(),show=w=>w.map(x=>G.translit[x]).join("");
 function options(c){let ret=[];for(const {w,f} of by[c.length])for(let j=0;j<8;j++){let e=edges(c,w,j);if(!e)continue;let s=apply(b,e);if(s)ret.push({e,s,w,j,f})}return ret}
 function evaluate(s,params){return Array.from({length:29},(_,x)=>{let o=x*W,z=s.a[o+L];for(let j=0;j<s.d;j++)z+=params[j]*s.a[o+j];return z%29})}
 function contains(s,pi){return evaluate(s,s.vars.map(x=>pi[x])).every((v,i)=>v===pi[i])}
 function encode(w,pi,start){const ip=[];pi.forEach((v,i)=>ip[v]=i);let j=start;return w.map(p=>{if(p===0)return 0;let c=ip[(pi[p]+pi[K[j]])%29];j=(j+1)%8;return c})}
 function decode(c,pi){const ip=[];pi.forEach((v,i)=>ip[v]=i);const found=new Map();for(let start=0;start<8;start++){function walk(i,j,w){if(i===c.length){if(dict.has(key(w))){check(encode(w,pi,start).join()===c.join(),"replay");found.set(key(w),w)}return}if(c[i]===0)walk(i+1,j,[...w,0]);let p=ip[mod(pi[c[i]]-pi[K[j]])];if(p!==0)walk(i+1,(j+1)%8,[...w,p])}walk(0,start,[])}return [...found.values()]}
 function pair(A,B,first=false){let tested=0,passed=[],ds={};outer:for(const a of A)for(const bb of B){tested++;const s=apply(a.s,bb.e);if(!s)continue;passed.push({s,a,bb});ds[s.d]=(ds[s.d]||0)+1;if(first)break outer;}return {tested,passed,ds}}

 /** Affine hyperplane filtering: a single proposed edge cannot force two coordinates equal. */
 function filterState(s){
  const {a,d}=s,forbidden=new Set(),cache=new Int32Array(29*29).fill(-1);
  function signature(row){let j=0;while(j<d&&!row[j])j++;if(j===d)return row[d]?null:"";const z=inv[row[j]];if(d<=9){let n=1;for(let k=0;k<=d;k++)n=n*29+row[k]*z%29;return n}const out=[];for(let k=0;k<=d;k++)out.push(row[k]*z%29);return String.fromCharCode(...out)}
  const row=new Uint8Array(d+1);
  for(let x=0;x<29;x++)for(let y=x+1;y<29;y++){let u=x*W,v=y*W;for(let j=0;j<d;j++)row[j]=mod(a[u+j]-a[v+j]);row[d]=mod(a[u+L]-a[v+L]);const sig=signature(row);if(sig)forbidden.add(sig)}
  function mask(c,k){const ci=c*29+k;if(cache[ci]>=0)return cache[ci];let bits=0;for(let p=1;p<29;p++){if(c===p||c===k)continue;let u=c*W,v=p*W,w=k*W;for(let j=0;j<d;j++)row[j]=mod(a[u+j]-a[v+j]-a[w+j]);row[d]=mod(a[u+L]-a[v+L]-a[w+L]);const sig=signature(row);if(sig!==null&&!forbidden.has(sig))bits|=1<<p}return cache[ci]=bits}
  const allowed=e=>e.every(([c,p,k])=>(mask(c,k)&(1<<p))!==0);allowed.mask=mask;return allowed;
 }
 /** Search each anchored affine space, grant two additional arbitrary OOV long groups. */
 function robustSearch(cipher,anchor,config){
  const other=anchor===56?49:56, allLong=cipher.map((c,i)=>({i,l:c.length})).filter(x=>x.l>=(config.minLength??8)).sort((a,b)=>b.l-a.l||a.i-b.i).map(x=>x.i);
  const rest=allLong.filter(i=>i!==anchor&&i!==other);
  const cache=new Map(),index=new Map();
  function get(i){if(!cache.has(i)){const m=new Map();for(const o of options(cipher[i])){const k=[...new Set(o.e.map(x=>x.join(",")))].sort().join(";");if(!m.has(k))m.set(k,o)}
    const list=[...m.values()],positions=Array.from({length:cipher[i].length},()=>new Map());
    for(const o of list){let phase=o.j;for(let at=0;at<o.w.length;at++){const p=o.w[at],k=p?K[phase]:0,feature=k*29+p;if(p)phase=(phase+1)%8;const m=positions[at];if(!m.has(feature))m.set(feature,[]);m.get(feature).push(o)}}
    cache.set(i,list);index.set(i,positions);
  }return cache.get(i)}
  const A=get(anchor),begin=config.start??0,end=Math.min(config.end??A.length,A.length);
  for(const i of rest)get(i);
  const maxFilter=config.maxFilter??150000000,maxJoins=config.maxJoins??500000,maxNodes=config.maxNodes??100000,maxEnum=config.maxEnum??3000000;
  let nodes=0,joins=0,filters=0,featureTests=0,dimensionNodes={},enumNodes=0,enumerated=0,cap=null,completed=begin,maxLong=0,maxAll=0,accepted=0,best=[],leaves=0;
  const seenMaps=new Set();
  function score(q){const id=q.join();if(seenMaps.has(id))return;seenMaps.add(id);enumerated++;
   const long=allLong.filter(i=>decode(cipher[i],q).length).length;maxLong=Math.max(maxLong,long);
   if(long<allLong.length-3)return;
   const decoded=cipher.map(c=>decode(c,q)),coverage=decoded.filter(x=>x.length).length;
   if(coverage>maxAll){maxAll=coverage;best=[]}
   if(coverage===maxAll&&best.length<5)best.push({pi:q,coverage,long,words:decoded.map((v,i)=>({i,words:v.slice(0,5).map(show),total:v.length})).filter(x=>x.total)});
   if(coverage>=63)accepted++;
  }
  function enumerate(s){
   const {a,d}=s,rows=Array.from({length:d},()=>[]),params=new Uint8Array(d);let used=0;
   for(let x=0;x<29;x++){let off=x*W,j=d-1;while(j>=0&&!a[off+j])j--;if(j<0){const bit=1<<a[off+L];if(used&bit)return;used|=bit}else rows[j].push(off)}
   function visit(j,mask){if(cap)return;if(++enumNodes>maxEnum){cap="enumeration";return}
    if(j===d){score(evaluate(s,params));return}
    for(let v=0;v<29;v++){if(mask&(1<<v))continue;params[j]=v;let n=mask,ok=true;for(const off of rows[j]){let x=a[off+L];for(let k=0;k<=j;k++)x+=params[k]*a[off+k];const bit=1<<(x%29);if(n&bit){ok=false;break}n|=bit}if(ok)visit(j+1,n);if(cap)return}
   }visit(0,used);
  }
  function visit(s,remaining,budget){
   if(cap)return;if(++nodes>maxNodes){cap="nodes";return}
   dimensionNodes[s.d]=(dimensionNodes[s.d]||0)+1;
   if(s.d<=(config.enumDim??3)||remaining.length<=budget){leaves++;enumerate(s);return}
   const f=filterState(s);let pick=-1,domain=null;
   for(const i of remaining){
    // Among all positions, select the smallest exact single-position postings union.
    let count=Infinity,post=null;const positions=index.get(i);
    for(let j=0;j<positions.length;j++){let n=0,lists=[],c=cipher[i][j];for(const [feature,list] of positions[j]){
      featureTests++;const k=Math.floor(feature/29),p=feature%29;if(p&&(f.mask(c,k)&(1<<p))===0)continue;
      n+=list.length;lists.push(list);if(n>=count)break;
     }if(n<count){count=n;post=lists;if(!count)break}}
    const d=[];outer:for(const list of post)for(const o of list){if(++filters>maxFilter){cap="filter";return}if(f(o.e)){d.push(o);if(domain&&d.length>=domain.length)break outer}}
    if(domain===null||d.length<domain.length){pick=i;domain=d;if(!d.length)break}
   }
   const next=remaining.filter(i=>i!==pick);
   const dedup=new Set();
   for(const o of domain){if(++joins>maxJoins){cap="joins";return}const t=apply(s,o.e);if(!t)continue;
    const id=t.vars.join(",")+";"+String.fromCharCode(...t.a);if(dedup.has(id))continue;dedup.add(id);visit(t,next,budget);if(cap)return;
   }
   if(budget>0)visit(s,next,budget-1);
  }
  for(let i=begin;i<end&&!cap;i++){visit(A[i].s,rest,2);if(!cap)completed=i+1}
  return {anchor,forcedOtherOOV:other,anchorOptions:A.length,range:[begin,end],completedThrough:completed,complete:completed===end,cap,nodes,joins,filters,featureTests,dimensionNodes,enumNodes,enumerated,leaves,maxLong,maxAll,accepted,best,domains:Object.fromEntries([anchor,...rest].map(i=>[i,get(i).length]))};
 }
 function rng(seed){let s=seed;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0}}
 function plant(text,seed){
  const rnd=rng(seed),types=Array.from({length:40},()=>new Map());
  const begin=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text),end=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text);
  for(const word of new Set((text.slice(begin?begin.index+begin[0].length:0,end?end.index:text.length).toLowerCase().match(/[a-z]+/g)||[])))variants(word,w=>{if(dict.has(key(w)))types[w.length].set(key(w),{w,word})});
  const pi=Array(29).fill(-1),slots=Array.from({length:27},(_,i)=>i+2);pi[0]=0;pi[23]=1;for(let i=slots.length-1;i>0;i--){let j=rnd()%(i+1);[slots[i],slots[j]]=[slots[j],slots[i]]}let at=0;for(let i=1;i<29;i++)if(i!==23)pi[i]=slots[at++];
  const truth=C.map((c,i)=>{const p=[...types[c.length].values()];check(p.length,"literary length "+c.length);let {w,word}=p[rnd()%p.length];return {w,word,start:rnd()%8}});
  const cipher=truth.map(x=>encode(x.w,pi,x.start));return {cipher,truth,pi,types:types.map(x=>x.size)};
 }
 function summarize(cipher,truth,pi){
  const anchors=[56,49],opts=anchors.map(i=>options(cipher[i])),joined=pair(...opts);
  let trueLocal=truth?anchors.map((i,j)=>opts[j].some(o=>o.j===truth[i].start&&key(o.w)===key(truth[i].w)&&contains(o.s,pi))):null;
  let trueJoint=truth?joined.passed.filter(x=>contains(x.s,pi)).length:null;
  if(truth)check(trueLocal.every(Boolean)&&trueJoint>0,"planted map lost");
  const out={anchors,words:truth?anchors.map(i=>truth[i].word):null,plain:truth?anchors.map(i=>show(truth[i].w)):null,domains:opts.map(x=>x.length),tested:joined.tested,passed:joined.passed.length,remainingDimensions:joined.ds,trueLocal,trueJoint};
  if(truth){let states=joined.passed.map(x=>x.s);const train=Array.from({length:17},(_,i)=>49+i).filter(i=>!anchors.includes(i)).sort((a,b)=>cipher[b].length-cipher[a].length);out.extra=[];let visits=0,cap=2500000,complete=new Map(),capped=false;
   // Enumerate exact affine spaces once small enough; use a further long group for large spaces.
   function enumerate(s){const p=new Int8Array(s.d);function visit(j){if(visits++>=cap){capped=true;return}if(j===p.length){const q=evaluate(s,p);if(new Set(q).size===29)complete.set(q.join(),q);return}for(let x=0;x<29&&!capped;x++){p[j]=x;visit(j+1)}}visit(0)}
   for(let j=0;j<train.length&&states.length&&!capped;j++){
    const remaining=[];for(const s of states){if(s.d<=3)enumerate(s);else remaining.push(s)}states=remaining;if(!states.length||capped)break;
    const i=train[j],o=options(cipher[i]),next=[];let trials=0;for(const s of states){for(const x of o){if(trials++>=cap){capped=true;break}const t=apply(s,x.e);if(t)next.push(t)}if(capped)break}
    out.extra.push({group:i,length:cipher[i].length,domain:o.length,trials,states:next.length,truthSpaces:next.filter(s=>contains(s,pi)).length});states=next;
   }
   if(!capped)for(const s of states){if(s.d<=3)enumerate(s);else capped=true}
   let best=-1,winners=[];for(const q of complete.values()){let count=train.filter(i=>decode(cipher[i],q).length).length;if(count>best){best=count;winners=[]}if(count===best)winners.push(q)}
   out.permutationEnumeration={visits,complete:complete.size,capped,bestTrain:best,totalTrain:train.length,winners:winners.length,plantedMapEnumerated:complete.has(pi.join()),plantedWinner:winners.some(q=>q.join()===pi.join()),holdout:winners.slice(0,20).map(q=>{const d=cipher.slice(0,49).map(c=>decode(c,q));return {isTruth:q.join()===pi.join(),supported:d.filter(x=>x.length).length,true:d.filter((x,i)=>x.some(w=>key(w)===key(truth[i].w))).length,uniqueTrue:d.filter((x,i)=>x.length===1&&key(x[0])===key(truth[i].w)).length}})};
  }
  return out;
 }
 if(config.robust!==undefined)return robustSearch(C,config.robust,config);
 const original=summarize(C,null,null);
 const plants=donors.map((d,i)=>{const p=plant(d,[3301,20141125][i]);return {seed:[3301,20141125][i],longTypeCounts:[p.types[11],p.types[13]],...summarize(p.cipher,p.truth,p.pi)}});
 const long=C.map((c,i)=>({i,l:c.length})).filter(x=>x.l>=8).sort((a,b)=>b.l-a.l||a.i-b.i);
 const cache=new Map();function get(i){if(!cache.has(i))cache.set(i,options(C[i]));return cache.get(i)}
 const pairs=[];const used=new Set([56,49]); // first exact contradiction.
 // Greedily seek independent contradictions; stop at the first compatible affine-space witness for each pair.
 for(let x=0;x<long.length;x++){const i=long[x].i;if(used.has(i))continue;for(let y=x+1;y<long.length;y++){const j=long[y].i;if(used.has(j))continue;const A=get(i),B=get(j),v=pair(A,B,true);pairs.push({i,j,lengths:[C[i].length,C[j].length],domains:[A.length,B.length],tested:v.tested,affineCompatible:v.passed.length>0});if(!v.passed.length){used.add(i);used.add(j);break}}if(used.size>=8)break}
 return {dict:dict.size,native:pool.length,model:"pi(DIVINITY), pi(F)=0, pi(D)=1, independent group starts, literal F hold",original,plants,long,pairs,disjointContradictions:used.size/2};
}
const raw=inputs.map(x=>{const b=fs.readFileSync(path.resolve(__dirname,'..',x.path));const sha=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(sha!==x.sha)throw Error('input changed: '+x.path);return b.toString('utf8')});
const config=process.argv[2]==="--robust"?{robust:Number(process.argv[3]),start:Number(process.argv[4]||0),end:process.argv[5]===undefined?undefined:Number(process.argv[5]),minLength:process.argv[6]===undefined?8:Number(process.argv[6])}:{};
console.log(JSON.stringify(experiment(raw,config),null,2));
