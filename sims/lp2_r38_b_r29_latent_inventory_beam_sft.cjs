"use strict";
// #2963: exact published B-R29 A1/A2 key family, CS page reset; relaxed rank + inventory beam.
const files=["resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/derived/dukotah-r38-r39-lp1-semantic-keys.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw,config={}){
 const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ",T="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),Q=29,mod=x=>((x%Q)+Q)%Q,id=w=>String.fromCharCode(...w.map(x=>65+x)),sum=a=>a.reduce((s,x)=>s+x,0),limit=2.5,K=config.top??16,WIDTH=config.width??768;
 const values=JSON.parse(raw[2]).variants["B-R29"];if(values.length!==726||values.slice(0,5).join()!=="5,6,25,26,21")throw Error("semantic index mismatch");
 const token=T.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let j=0;j<w.length;){let t=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:token.find(x=>w.startsWith(x.t,j));if(!t)throw Error(w);a.push(t.i);j+=t.t.length}return a}
 const f=new Map(),tot=new Map();for(let ln of raw[1].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;if(m[1].length===1&&!/^[aio]$/i.test(m[1]))continue;const keys=[...new Set([id(word(m[1],true)),id(word(m[1],false))])];for(const k of keys){const n=+m[2]/keys.length;f.set(k,(f.get(k)||0)+n);tot.set(k.length,(tot.get(k.length)||0)+n)}}
 const lex=new Map([...f].map(([k,n])=>[k,-Math.log(.98*n/tot.get(k.length))])),entropy=new Map();for(const [k,n] of f)entropy.set(k.length,(entropy.get(k.length)||0)+n/tot.get(k.length)*lex.get(k));
 function parse(t){let C=[],S=[],ws=[],l=0,pages=[0];function close(){if(l){ws.push(l);l=0}}function sent(){close();if(ws.length){S.push({end:C.length,lengths:ws});ws=[]}}for(const c of t){const i=R.indexOf(c);if(i>=0){C.push(i);l++}else if("-.&$§".includes(c)||/\d/.test(c)){close();if(".&$§".includes(c))sent()}else if(c==="%")pages.push(C.length)}sent();return {C,S,pages:[...new Set(pages)]}}
 const original=parse(raw[0]);if(original.C.length!==13136||original.pages[3]!==729)throw Error("source mapping");
 function subset(lo,hi){return {C:original.C.slice(lo,hi),S:original.S.filter(x=>x.end>lo&&x.end<=hi).map(x=>({end:x.end-lo,lengths:x.lengths})),pages:[0,...original.pages.filter(x=>x>lo&&x<hi).map(x=>x-lo)]}}
 const geometry=subset(0,729);
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function key(mode,s,sign){let d=0,shifts=[];for(let k=0;k<256;k++){const v=values[(s+k)%values.length];d=mod(d+v);shifts.push(mod(sign*(mode==="A1"?v:d)))}return {mode,s,sign,shifts}}
 const keys=[];for(const mode of ["A1","A2"])for(let s=0;s<29;s++)for(const sign of [-1,1])keys.push(key(mode,s,sign));
 const donors=raw.slice(3).map(t=>{let a=t.search(/\*{3}\s*START OF/i),b=t.search(/\*{3}\s*END OF/i);if(a>=0)t=t.slice(t.indexOf("\n",a)+1,b>=0?b:undefined);return (t.match(/[A-Za-z]+/g)||[]).map(w=>word(w,true))});
 function pageOf(i,pages){let p=0;while(p+1<pages.length&&pages[p+1]<=i)p++;return p}
 function send(W,pages,ks){let C=[],pg=-1,k=0;for(let w of W){const p=pageOf(C.length,pages);if(p!==pg){pg=p;k=0}const sh=ks[p].shifts[k++];for(const x of w)C.push(mod(x+sh))}return C}
 function makePlant(j,wrong=false){
  const d=mod(j)%3,block=j<0?0:Math.floor(j/3)+1,D=donors[d],start=Math.floor(D.length*block/9),stop=Math.floor(D.length*(block+1)/9),r=rng(2963007+j*1337);
  let cursor=start+Math.floor(r()*Math.max(1,Math.floor((stop-start)/8))),old=0,W=[],S=[],ranges=[];
  for(const s of geometry.S){const n=s.end-old;old=s.end;let found=null;for(let i=cursor;i<stop&&!found;i++){let z=0,k=i;while(k<stop&&z<n)z+=D[k++].length;if(z===n)found=[i,k]}if(!found)throw Error("plant window unavailable "+j+" "+n+" "+cursor+" "+stop);let words=D.slice(...found);ranges.push(found);cursor=found[1]+3;W.push(...words);S.push({end:s.end,lengths:shuffle(words.map(w=>w.length),r)})}
  const trueKeys=geometry.pages.map(()=>keys[Math.floor(r()*keys.length)]),ks=wrong?trueKeys.map(x=>key(x.mode,29+Math.floor(r()*697),x.sign)):trueKeys;
  return {C:send(W,geometry.pages,ks),S,pages:geometry.pages,W,ks,ranges,donor:d,wrong};
 }
 function solve(input,doBeam=true){
  const {C,S,pages}=input,N=C.length;let lo=0;const meta=S.map(x=>{let ls=x.lengths.slice().sort((a,b)=>a-b),h=new Map();for(let l of ls)h.set(l,(h.get(l)||0)+1);const L=[...h.keys()],m=[],rad=[],min=[0],max=[0];let base=1;for(const l of L){m.push(base);rad.push(h.get(l)+1);base*=h.get(l)+1;if(!Number.isSafeInteger(base))throw Error("inventory overflow")}for(let j=0;j<ls.length;j++){min.push(min[j]+ls[j]);max.push(max[j]+ls[ls.length-1-j])}const s={lo,hi:x.end,n:x.end-lo,w:ls.length,L,m,rad,b:base-1,min,max,rootCache:new Map(),fullCache:new Map()};if(min[ls.length]!==s.n)throw Error("geometry");lo=x.end;return s});
  if(lo!==N)throw Error("source end");
  const maxL=Math.max(...meta.flatMap(x=>x.L)),stride=(maxL+1)*Q,table=new Float64Array(N*stride);
  for(const s of meta){const allowed=new Set(s.L);for(let i=s.lo;i<s.hi;i++){const n=Math.min(maxL,s.hi-i);for(let sh=0;sh<Q;sh++){let w="";for(let l=1;l<=n;l++){w+=String.fromCharCode(65+mod(C[i+l-1]-sh));if(allowed.has(l))table[i*stride+l*Q+sh]=lex.get(w)??(12+Math.log(Q)*l)}}}}
  const wc=(i,l,sh)=>table[i*stride+l*Q+sh];
  function dp(s,kid,k0,full=false){
   const seq=keys[kid].shifts.slice(k0,k0+s.w),tag=seq.join(",");if(k0<0||seq.length!==s.w)return full?null:Infinity;
   if(full&&s.fullCache.has(tag))return s.fullCache.get(tag);if(!full&&s.rootCache.has(tag))return s.rootCache.get(tag);
   const n=s.n,w=s.w,sz=n+1,arr=full?new Float64Array((w+1)*sz):null;
   let next=new Float64Array(sz).fill(Infinity),curr=new Float64Array(sz);next[n]=0;if(full)arr.set(next,w*sz);
   for(let j=w-1;j>=0;j--){curr.fill(Infinity);const sh=seq[j],mn=s.min[j+1],mx=s.max[j+1];for(let x=s.min[j];x<=s.max[j];x++){let best=Infinity;for(const l of s.L){const y=x+l;if(y<mn||y>mx||y>n)continue;const v=wc(s.lo+x,l,sh)+next[y];if(v<best)best=v}curr[x]=best}if(full)arr.set(curr,j*sz);[next,curr]=[curr,next]}
   s.rootCache.set(tag,next[0]);if(full){s.fullCache.set(tag,arr);return arr}return next[0]
  }
  const rank=[];
  for(let pg=0;pg<pages.length;pg++){
   const a=pages[pg],b=pages[pg+1]??N,inside=meta.filter(s=>s.lo>=a&&s.hi<=b),cross=meta.find(s=>s.lo<a&&s.hi>a),first=inside[0]?.lo??b,maxK=cross?Math.min(cross.w,Math.max(0,first-a)):0;
   const rows=[];for(let kid=0;kid<keys.length;kid++){let best=Infinity,bestK=-1;const per=[];for(let k0=0;k0<=maxK;k0++){let v=0,k=k0;for(const s of inside){v+=dp(s,kid,k);k+=s.w}per.push(v);if(v<best){best=v;bestK=k0}}rows.push({kid,best,bestK,per})}rows.sort((a,b)=>a.best-b.best||a.kid-b.kid);const cutoff=rows[Math.min(K,rows.length)-1].best,chosen=rows.filter(x=>x.best<=cutoff+1e-8).map(x=>x.kid);
   rank.push({pg,inside,maxK,rows,chosen,n:sum(inside.map(x=>x.n)),minimum:rows[0].best})
  }
  const rankedN=sum(rank.map(x=>x.n)),lower=sum(rank.map(x=>x.minimum)),publicRank=rank.map(x=>({pg:x.pg,n:x.n,maxK:x.maxK,minimum:x.minimum,chosen:x.chosen,rows:x.rows.map(({kid,best,bestK})=>({kid,best,bestK}))}));
  if(!doBeam)return {lower:lower/rankedN,rankedN,rank:publicRank,reason:"rank-only"};
  let states=[{pos:0,pg:-1,kid:-1,k:0,g:0,node:null}],clipped=0,maxStates=0,expanded=0;
  function tailCost(pg,kid,k,after){let v=0;for(const s of rank[pg].inside){if(s.lo<after)continue;v+=dp(s,kid,k);k+=s.w}return v}
  function h(s,j,x){
   const rem=s.w-j,pgEnd=pageOf(s.hi-1,pages),pgStart=pageOf(s.lo,pages);
   if(pgEnd===pgStart){const k0=x.k-j,A=dp(s,x.kid,k0,true);if(!A)return Infinity;return A[j*(s.n+1)+x.pos-s.lo]+tailCost(x.pg,x.kid,x.k+rem,s.hi)}
   let v=0;for(let z=0;z<s.L.length;z++)v+=(Math.floor(x.b/s.m[z])%s.rad[z])*(entropy.get(s.L[z])??(Math.log(Q)*s.L[z]));
   if(x.pg===pgEnd)v+=tailCost(x.pg,x.kid,x.k+rem,s.hi);else v+=rank[pgEnd].minimum;return v
  }
  for(const s of meta){
   states=states.map(x=>({...x,b:s.b}));
   for(let j=0;j<s.w;j++){
    const next=new Map();
    for(const x of states){const pg=pageOf(x.pos,pages),newpg=pg!==x.pg,ks=newpg?rank[pg].chosen:[x.kid],k=newpg?0:x.k;
     for(const kid of ks){const sh=keys[kid].shifts[k];for(let z=0;z<s.L.length;z++){if(Math.floor(x.b/s.m[z])%s.rad[z]===0)continue;const l=s.L[z],pos=x.pos+l,b=x.b-s.m[z];if(pos>s.hi||((j+1===s.w)!==(pos===s.hi)))continue;const g=x.g+wc(x.pos,l,sh),tag=pos+"|"+pg+"|"+kid+"|"+(k+1)+"|"+b,old=next.get(tag);expanded++;if(old&&old.g<=g)continue;const y={pos,pg,kid,k:k+1,g,b,node:{prev:x.node,i:x.pos,l,pg,kid,sh}};y.score=g+h(s,j+1,y);next.set(tag,y)}}
    }
    let a=[...next.values()];maxStates=Math.max(maxStates,a.length);a.sort((x,y)=>x.score-y.score||x.g-y.g||x.kid-y.kid||x.pos-y.pos);if(a.length>WIDTH){clipped+=a.length-WIDTH;a.length=WIDTH}states=a;if(!states.length)return {lower:lower/rankedN,rankedN,rank:publicRank,reason:"beam-empty",clipped,expanded,maxStates};
   }
  }
  states.sort((a,b)=>a.g-b.g);const b=states[0],W=[],used=[];for(let n=b.node;n;n=n.prev){W.push(C.slice(n.i,n.i+n.l).map(c=>mod(c-n.sh)));used[n.pg]=n.kid}W.reverse();if(send(W,pages,used.map(i=>keys[i])).join()!==C.join())throw Error("forward replay");
  return {lower:lower/rankedN,rankedN,rank:publicRank,cost:b.g/N,W,used,clipped,expanded,maxStates};
 }
 function boundary(W){let a=0,s=new Set();for(let i=0;i<W.length-1;i++){a+=W[i].length;s.add(a)}return s}
 function evalPlant(j,wrong=false){
  const x=makePlant(j,wrong),z=solve(x,!wrong);const P=x.W.flat(),p=z.W?.flat()??[],b1=boundary(x.W),b2=boundary(z.W??[]),overlap=[...b2].filter(k=>b1.has(k)).length;
  const trueKey=x.ks.map(v=>keys.findIndex(k=>k.mode===v.mode&&k.s===v.s&&k.sign===v.sign));const keyRanks=z.rank.map((p,i)=>p.rows.findIndex(k=>k.kid===trueKey[i])+1);
  return {j,wrong,donor:x.donor,ranges:x.ranges,trueKeys:x.ks.map(({mode,s,sign})=>({mode,s,sign})),trueKey,keyRanks,keyInPool:z.rank.map((p,i)=>p.chosen.includes(trueKey[i])),used:z.used??null,correctKeys:z.used?sum(z.used.map((k,i)=>+(k===trueKey[i]))):null,accuracy:p.length?sum(p.map((v,i)=>+(v===P[i])))/P.length:null,boundaryF1:z.W?2*overlap/(b1.size+b2.size):null,cost:z.cost??null,lower:z.lower,rankedN:z.rankedN,excluded:z.lower>limit,clipped:z.clipped??null,expanded:z.expanded??null,maxStates:z.maxStates??null,reason:z.reason??null,rank:z.rank.map(({rows,...p})=>p)};
 }
 const rows=[];
 if(config.original){for(const [lo,hi] of [[0,729],[729,1428]]){const x=subset(lo,hi),z=solve(x,false);rows.push({lo,hi,lower:z.lower,rankedN:z.rankedN,excluded:z.lower>limit,rank:z.rank})}}
 else for(const j of config.cases??[-1]){rows.push(evalPlant(j,false));if(config.negatives!==false)rows.push(evalPlant(j,true))}
 return {parameters:{K,WIDTH,limit,lexicon:lex.size,keyCount:keys.length,convention:"CS, independent key per physical page",geometry:"[0,262,528,729] with original sentence endpoints; separate native-spelled literary windows per sentence"},rows};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),arg=process.argv.slice(2),config=arg[0]==="original"?{original:true}:{cases:arg.length?arg.map(Number):[-1]};console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),config),null,2));}
module.exports={experiment};
