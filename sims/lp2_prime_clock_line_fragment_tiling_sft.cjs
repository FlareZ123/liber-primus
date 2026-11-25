'use strict';
/** Standalone native prime-clock line receiver. Run from repository root with Node. */
const fs = require('node:fs');
function experiment(corpus,transcript,native){
  const assert=(x,m)=>{if(!x)throw Error(m)}, A=29, N=16257, CAP=16, map=new Map(corpus.runes.map((x,i)=>[x,i]));
  const parse=s=>Array.from(s).filter(x=>map.has(x)).map(x=>map.get(x));
  const sections=native.sections.map(s=>parse(s.source_text)), train=sections.slice(0,4), donor=sections.slice(4,7).flat();
  const lines=transcript.split(/\n/).map(parse).filter(x=>x.length).slice(0,594);
  assert(lines.flat().join(",")===corpus.pages.slice(0,56).flatMap(p=>p.indices).join(","),"original alignment");
  const K=[],sieve=new Uint8Array(200001);
  for(let p=2;p<sieve.length&&K.length<N+32;p++){if(!sieve[p]){K.push((p-1)%A);for(let j=p*p;j<sieve.length;j+=p)sieve[j]=1}}
  assert(K.length===N+32,"prime count");
  const emit=(P,j,sign=1)=>{let C=[];for(const p of P){C.push(p===0?0:(p+sign*K[j++]+A)%A)}return {C,end:j}};
  const p56=emit(sections[7],0);
  assert(p56.C.join(",")===corpus.pages[56].indices.join(","),"p56 native replay");
  const uni=new Float64Array(A), bi=new Float64Array(A*A),tri=new Float64Array(A*A*A), bn=new Float64Array(A),tn=new Float64Array(A*A);
  for(const P of train){for(let i=0;i<P.length;i++){const p=P[i];uni[p]++;if(i){bi[P[i-1]*A+p]++;bn[P[i-1]]++}if(i>=2){let z=P[i-2]*A+P[i-1];tri[z*A+p]++;tn[z]++}}}
  const T=uni.reduce((a,b)=>a+b,0), u=Float64Array.from(uni,x=>(x+.5)/(T+.5*A)),b=new Float64Array(A*A),l=new Float64Array(A*A*A);
  for(let x=0;x<A;x++)for(let y=0;y<A;y++)b[x*A+y]=(bi[x*A+y]+5*u[y])/(bn[x]+5);
  for(let x=0;x<A*A;x++)for(let y=0;y<A;y++)l[x*A+y]=Math.log((tri[x*A+y]+8*b[(x%A)*A+y])/(tn[x]+8));
  const logu=Float64Array.from(u,Math.log),logb=Float64Array.from(b,Math.log);
  function scan(C,sign=1,truth=null){
    let best=-Infinity,bestStart=-1,bestP=null,bestEnd=-1,total=0,paths=0,correctOriginBest=-Infinity,originBetter=0;
    const P=new Uint8Array(C.length), trueStart=truth?.start,top=[];
    const score=(i,x,y,p)=>i===0?logu[p]:i===1?logb[y*A+p]:l[(x*A+y)*A+p];
    const truthScore=truth?truth.P.reduce((sum,p,i)=>sum+score(i,truth.P[i-2],truth.P[i-1],p),0):-Infinity;
    let start=0,ob=-Infinity;
    function walk(i,j,x,y,s){
      for(;i<C.length;i++){
        let c=C[i],p=(c-sign*K[j]+A)%A;
        if(c===0&&p!==0){P[i]=0;walk(i+1,j,y,0,s+score(i,x,y,0))}
        if(p===0){if(c!==0)return;P[i]=0;s+=score(i,x,y,0);x=y;y=0;continue}
        P[i]=p;s+=score(i,x,y,p);x=y;y=p;j++;
      }
      paths++;total+=Math.exp(s);if(s>ob)ob=s;
      if(s>best){best=s;bestStart=start;bestP=Array.from(P);bestEnd=j}
      if(top.length<CAP||s>top[top.length-1].score){
        const k=top.findIndex(e=>e.start===start&&e.end===j);
        if(k<0||top[k].score<s){if(k>=0)top.splice(k,1);top.push({start,end:j,score:s,P:Array.from(P)});top.sort((a,b)=>b.score-a.score||a.start-b.start||a.end-b.end);if(top.length>CAP)top.pop()}
      }
    }
    for(start=0;start<N;start++){ob=-Infinity;walk(0,start,-1,-1,0);if(ob>truthScore+1e-9)originBetter++;if(start===trueStart)correctOriginBest=ob}
    assert(bestP&&emit(bestP,bestStart,sign).C.join(",")===C.join(","),"best replay");
    for(const edge of top){const e=emit(edge.P,edge.start,sign);assert(e.C.join(",")===C.join(",")&&e.end===edge.end,"edge replay")}
    return {best:best/C.length,logMarginal:(Math.log(total/N)+C.length*Math.log(A))/C.length,paths,bestStart,bestEnd,bestP,truthRank:truth?originBetter+1:null,truthOriginBest:truth?correctOriginBest/C.length:null,exact:truth?bestStart===trueStart&&bestP.join(",")===truth.P.join(","):null,truthIntervalInTop:truth?top.some(e=>e.start===truth.start&&e.end===truth.end):null,top};
  }
  let seed=0x60f3301;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
  function permute(C){let D=C.slice(),idx=D.map((x,i)=>x?i:-1).filter(i=>i>=0);for(let i=idx.length-1;i>0;i--){let j=rand()%(i+1);[D[idx[i]],D[idx[j]]]=[D[idx[j]],D[idx[i]]]}return D}
  const chosen=lines.map((C,i)=>({C,i})).sort((a,b)=>b.C.length-a.C.length||a.i-b.i).slice(0,22).sort((a,b)=>a.i-b.i), L=chosen.reduce((s,x)=>s+x.C.length,0);
  assert(donor.length>=2*L,"disjoint native donor windows");
  function pack(s){return {meanBest:s.reduce((a,x)=>a+x.best,0)/s.length,meanMarginal:s.reduce((a,x)=>a+x.logMarginal,0)/s.length,minBest:Math.min(...s.map(x=>x.best)),maxBest:Math.max(...s.map(x=>x.best)),exact:s.filter(x=>x.exact).length,top5:s.filter(x=>x.truthRank!==null&&x.truthRank<=5).length,trueIntervals:s.filter(x=>x.truthIntervalInTop).length,rows:s.map(({bestP,top,...x})=>({...x,text:bestP.map(p=>corpus.translit[p]).join(""),top:top.map(({P,...e})=>({...e,P}))}))}}
  function tile(scans,truths){
    // Input lines are deliberately permuted by reversal of index order; no original order is used by search.
    const ids=scans.map((_,i)=>scans.length-1-i), byStart=new Map();
    for(const id of ids)for(const e of scans[id].top){if(!byStart.has(e.start))byStart.set(e.start,[]);byStart.get(e.start).push({...e,id})}
    let nodes=0,solutions=0,best=-Infinity,bestPath=null;
    const all=(1<<scans.length)-1,path=[];
    function dfs(at,mask,s){nodes++;if(mask===all){solutions++;if(s>best){best=s;bestPath=path.slice()}return}
      for(const e of byStart.get(at)||[]){const bit=1<<e.id;if(mask&bit)continue;path.push(e);dfs(e.end,mask|bit,s+e.score);path.pop()}
    }
    for(const at of byStart.keys())if(at<=3301)dfs(at,0,0);
    return {nodes,solutions,bestScore:Number.isFinite(best)?best:null,exactOrder:bestPath?bestPath.every((e,i)=>e.id===i):null,exactIntervals:bestPath?bestPath.filter(e=>e.start===truths[e.id].start&&e.end===truths[e.id].end).length:null,correctRunes:bestPath?bestPath.reduce((sum,e)=>sum+e.P.filter((p,i)=>p===truths[e.id].P[i]).length,0):null,order:bestPath?.map(e=>e.id)||null}
  }
  const controls=[];for(let k=0;k<2;k++){let off=k*L,j=k===0?1033:3301;let pos=[],neg=[],truths=[];for(const {C} of chosen){let P=donor.slice(off,off+C.length),e=emit(P,j),truth={P,start:j,end:e.end};truths.push(truth);pos.push(scan(e.C,1,truth));neg.push(scan(permute(e.C)));j=e.end;off+=C.length}controls.push({origin:k===0?1033:3301,positive:pack(pos),negative:pack(neg),tiling:tile(pos,truths),nullTiling:tile(neg,truths)})}
  const original=chosen.map(({C})=>scan(C)),nulls=chosen.map(({C})=>scan(permute(C)));
  return {lines:chosen.map(({C,i})=>({line:i,length:C.length})),L,p56Replay:p56.C.length,p56Consumed:p56.end,trainRunes:T,controls,original:pack(original),originalNull:pack(nulls)};
}
const read = p => fs.readFileSync(p, 'utf8');
const result = experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")));
console.log(JSON.stringify(result,null,2));
