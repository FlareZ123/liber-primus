"use strict";
// Agent1: all-placement seven-phase deletion bound. Node 22/CommonJS.
const fs=require("node:fs"), path=require("node:path");
function assert(x,msg="assertion failed"){if(!x)throw Error(msg)}

function divide(x){const r=x.slice(),q=[];for(let i=0;i<x.length-2;i++){const u=r[i]*2%29;q.push(u);for(let k=0;k<3;k++)r[i+k]=(r[i+k]-u*[15,5,27][k]+29*29)%29}assert(!r.slice(-2).some(Boolean),"nonzero G remainder");return q}

function assignment(w){const n=w.length,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();for(let i=1;i<=n;i++){p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-w[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)}return p.slice(1).reduce((sum,i,j)=>sum+w[i-1][j],0)}

function bound(s,t,clock,{q=7,alphabet=29,cuts=[]}={}){
 const source=clock==="source",k=s.length-t.length,base=source?s:t,other=source?t:s;
 assert(k>=0&&(!cuts.length||source),"invalid bound input");
 const groups=Array.from({length:q},()=>Array.from({length:alphabet},()=>[]));
 base.forEach((x,i)=>groups[i%q][x].push(i));
 const lo=base.map((_,i)=>source?Math.max(0,k-(s.length-1-i)):0),hi=base.map((_,i)=>source?Math.min(k,i):k);
 for(const [c,d] of cuts)for(let i=0;i<base.length;i++){
   if(i<c){lo[i]=Math.max(lo[i],d-(c-1-i));hi[i]=Math.min(hi[i],d)}
   else {lo[i]=Math.max(lo[i],d);hi[i]=Math.min(hi[i],d+i-c)}
 }
 let free=0,bijective=0;const phases=[],obstructions=[];
 for(let phase=0;phase<q;phase++){
   const weights=[];
   for(let label=0;label<alphabet;label++){
     const js=groups[phase][label],row=[];
     for(let x=0;x<alphabet;x++){
       // dp[r] = least attainable last offset after retaining r occurrences;
       // skipping any occurrence is allowed. This relaxes cross-label offset consistency.
       const dp=[0,...Array(js.length).fill(k+1)];
       for(const j of js)for(let r=js.length;r>=1;r--){
         let d=Math.max(dp[r-1],lo[j]);while(d<=hi[j]&&other[j+(source?-d:d)]!==x)d++;
         if(d<=hi[j]&&d<dp[r])dp[r]=d;
       }
       const m=dp.findIndex(x=>x>k);row.push(m<0?js.length:m-1);
     }
     weights.push(row);
     const max=Math.max(...row);if(max<js.length)obstructions.push({phase,label,positions:js,deficit:js.length-max});
   }
   const n=groups[phase].reduce((z,g)=>z+g.length,0),f=n-weights.reduce((z,r)=>z+Math.max(...r),0),b=n-assignment(weights);
   free+=f;bijective+=b;phases.push({phase,count:n,free:f,bijective:b});
 }
 return {free,bijective,phases,obstructions};
}

function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}

function shuffle(arr,next){const a=arr.slice();for(let i=a.length-1;i>0;i--){let j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}

function plant(t,k,clock,seed,q=7,alphabet=29){const next=rng(seed),n=t.length+k,deleted=new Set(shuffle(Array.from({length:n},(_,i)=>i),next).slice(0,k));const inverse=Array.from({length:q},()=>shuffle(Array.from({length:alphabet},(_,i)=>i),next));const s=[],kept=[];let j=0;for(let i=0;i<n;i++){if(deleted.has(i)){s.push(next()%alphabet);continue}const phase=(clock==="source"?i:j)%q;s.push(inverse[phase][t[j]]);kept.push(i);j++}return {s,kept,deleted,inverse}}

function exactCost(s,t,kept,clock,q,alphabet){const w=Array.from({length:q},()=>Array.from({length:alphabet},()=>Array(alphabet).fill(0)));kept.forEach((i,j)=>w[(clock==="source"?i:j)%q][s[i]][t[j]]++);return t.length-w.reduce((z,g)=>z+assignment(g),0)}

function combinations(n,m){const out=[];function go(start,x){if(x.length===m){out.push(x.slice());return}for(let i=start;i<=n-(m-x.length);i++){x.push(i);go(i+1,x);x.pop()}}go(0,[]);return out}

function toyCheck(){const next=rng(0x7d19ac3),q=2,alphabet=3;let checks=0,matching=0;const perms=combinations(3,3)[0];for(let b=0;b<128;b++){const w=Array.from({length:3},()=>Array.from({length:3},()=>next()%7));let max=0;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==j)max=Math.max(max,w[0][i]+w[1][j]+w[2][3-i-j]);assert(assignment(w)===max,"assignment toy");matching++;const s=Array.from({length:8},()=>next()%3),t=Array.from({length:6},()=>next()%3),all=combinations(8,6),cut=1+next()%7,witness=all[next()%all.length],d=cut-witness.filter(i=>i<cut).length;for(const clock of ["source","target"]){const cases=clock==="source"?[[],[[cut,d]]]:[[]];for(const cuts of cases){const feasible=all.filter(k=>cuts.every(([c,e])=>c-k.filter(i=>i<c).length===e));const cost=Math.min(...feasible.map(k=>exactCost(s,t,k,clock,q,alphabet)))+(clock==="source"?2:0);assert(bound(s,t,clock,{q,alphabet,cuts}).bijective<=cost,"unsound toy lower bound");checks++}}}return {assignmentChecks:matching,alignmentBoundChecks:checks}}

function experiment(p,t){const original=[];for(const [label,S,T] of [["raw",p,t],["quotient",divide(p),divide(t)]])for(let rev=0;rev<2;rev++){
  const s=S,t=rev?T.slice().reverse():T,k=s.length-t.length,mid=Math.floor(s.length/2),quarter=Math.floor(mid/2);
  const target=bound(s,t,"target"),targetReverse=bound(s.slice().reverse(),t.slice().reverse(),"target");assert(target.bijective>0&&targetReverse.bijective>0);
  const sourceRoot=bound(s,t,"source").bijective;
  const midBounds=Array.from({length:k+1},(_,d)=>bound(s,t,"source",{cuts:[[mid,d]]}).bijective);
  const branches=[];for(let d=0;d<=k;d++){if(midBounds[d]>k)continue;const lo=Math.max(0,d-(mid-quarter)),hi=Math.min(d,quarter),quarterBounds=[];for(let e=lo;e<=hi;e++)quarterBounds.push({e,bound:bound(s,t,"source",{cuts:[[mid,d],[quarter,e]]}).bijective});assert(quarterBounds.every(x=>x.bound>k),"unresolved source branch");branches.push({d,quarter,quarterBounds})}
  original.push({label,oppositeDirection:!!rev,k,target:{free:target.free,bijective:target.bijective,firstObstruction:target.obstructions[0]},targetBothReversed:{free:targetReverse.free,bijective:targetReverse.bijective,firstObstruction:targetReverse.obstructions[0]},source:{root:sourceRoot,mid,midBounds,branches}});
 }
 const controls=[];for(const [name,T] of [["raw",t],["quotient",divide(t)]])for(const clock of ["source","target"])for(let k=0;k<3;k++){
   const r=plant(T,21,clock,0x5d7b0001+k+(name==="raw"?0:100)+(clock==="source"?0:10));const replay=exactCost(r.s,T,r.kept,clock,7,29);assert(replay===0);
   const root=bound(r.s,T,clock).bijective;
   const cuts=[Math.floor(r.s.length/2),Math.floor(r.s.length/4)].map(c=>[c,[...r.deleted].filter(i=>i<c).length]);
   const conditioned=clock==="source"?bound(r.s,T,clock,{cuts}).bijective:root;
   assert(root<=(clock==="source"?21:0)&&conditioned<=(clock==="source"?21:0),"plant excluded");
   controls.push({name,clock,seed:k,exactMatches:T.length,root,conditioned,cuts:clock==="source"?cuts:[]});
 }
 return {original,controls,toys:toyCheck()};
}
const root=path.resolve(__dirname,".."),read=n=>JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus",n),"utf8"));
const p=read("lp2-corpus.json").pages[29].indices,t=read("lp2-grid-256.json").bytes.map(x=>x%29);
assert(p.length===277&&t.length===256);
console.log(JSON.stringify(experiment(p,t),null,2));
