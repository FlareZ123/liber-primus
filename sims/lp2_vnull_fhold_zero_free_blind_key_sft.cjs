"use strict";
const fs=require("node:fs");
const {words,mod,makeRng,names,SUPP}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
const Q=29,NEG=-Infinity,ln=Math.log(SUPP/28),lr=Math.log1p(-SUPP);
function model(seqs){
 const count=new Float64Array(Q*Q),u=new Float64Array(Q);
 for(const P of seqs)for(let i=0;i<P.length;i++)if(P[i]){u[P[i]]++;if(i&&P[i-1])count[P[i-1]*Q+P[i]]++}
 const us=u.reduce((s,x)=>s+x,0),B=new Float64Array(Q*Q).fill(NEG),best=new Float64Array(Q).fill(NEG);
 for(let a=1;a<Q;a++){let z=0;for(let b=1;b<Q;b++)z+=count[a*Q+b];for(let b=1;b<Q;b++){const v=Math.log((count[a*Q+b]+12*(u[b]+.5)/(us+14))/(z+12));B[a*Q+b]=v;best[b]=Math.max(best[b],v)}}
 return {B,best};
}
/** Pairwise relaxation of the exact F-free event MAP; every genuine event has an upper-bounded log-language contribution and every null has exact insertion cost. */
function factors(C,q,M,prev=0){
 if(C.some(x=>x===0)||C.length<2)throw Error("requires nonzero interval");
 const F=Array.from({length:q},()=>new Float64Array(Q*Q));
 for(let i=0;i+1<C.length;i++){
  const c=C[i],d=C[i+1],p=i?C[i-1]:prev,fa=F[i%q];
  for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){
   const ar=mod(c-x),an=mod(p-x),br=mod(d-y),bn=mod(c-y);
   const A=i===0&&ar?M.best[ar]+(c===p?lr:0):0,AN=i===0?ln:0,R=d===c?lr:0;
   let v=NEG;
   if(ar&&br)v=Math.max(v,A+M.B[ar*Q+br]+R);
   if(ar&&bn&&d!==c)v=Math.max(v,A+ln);
   if(an&&c!==p&&br&&an===br)v=Math.max(v,AN+M.best[br]+R);
   if(an&&c!==p&&bn&&d!==c&&an===bn)v=Math.max(v,AN+ln);
   fa[x*Q+y]+=v;
  }
 }
 return F;
}
/** Actual key-constrained event Viterbi, with unknown preceding plaintext and optionally pending final null. */
function exact(C,K,M,prev=0){
 let D=new Map([[0,{last:0,pending:0,s:0,back:null}]]);
 for(let i=0;i<C.length;i++){
  const c=C[i],p=i?C[i-1]:prev,k=K[i%K.length],ar=mod(c-k),an=mod(p-k),T=new Map();
  const add=(last,pending,s,back,event,value)=>{const id=last*Q+pending,o=T.get(id);if(!o||s>o.s)T.set(id,{last,pending,s,back,event,value})};
  for(const z of D.values()){
   if(ar&&(!z.pending||z.pending===ar))add(ar,0,z.s+(z.last?M.B[z.last*Q+ar]:M.best[ar])+(c===p?lr:0),z,"R",ar);
   if(an&&c!==p&&(!z.pending||z.pending===an))add(z.last,an,z.s+ln,z,"N",an);
  }
  D=T;if(!D.size)return null;
 }
 let b=null;for(const z of D.values())if(!b||z.s>b.s)b=z;
 const P=[],events=[];for(let z=b;z.back;z=z.back){events.push(z.event);if(z.event==="R")P.push(z.value)}events.reverse();P.reverse();
 let j=0,pending=0;for(let i=0;i<C.length;i++){const c=C[i],prevC=i?C[i-1]:prev,p=events[i]==="R"?P[j++]:mod(prevC-K[i%K.length]);if(!p||pending&&pending!==p||mod(p+K[i%K.length])!==(events[i]==="R"?c:prevC)||events[i]==="N"&&c===prevC)throw Error("replay");pending=events[i]==="N"?p:0}
 return {score:b.s,P,events:events.join(""),pending:b.pending};
}
class Heap{
 constructor(){this.a=[]}
 push(x){let a=this.a,i=a.length;a.push(x);while(i){let p=(i-1)>>1;if(a[p].bound>=x.bound)break;a[i]=a[p];i=p}a[i]=x}
 pop(){const a=this.a,t=a[0],x=a.pop();if(a.length){let i=0;while(2*i+1<a.length){let j=2*i+1;if(j+1<a.length&&a[j+1].bound>a[j].bound)j++;if(a[j].bound<=x.bound)break;a[i]=a[j];i=j}a[i]=x}return t}
}
function search(C,q,M,limit=512,truth=null,prev=0,Foverride=null){
 const F=Foverride??factors(C,q,M,prev),H=Array.from({length:Q},()=>Array.from({length:q},()=>new Float64Array(Q).fill(NEG))),heap=new Heap();
 for(let first=0;first<Q;first++){
  for(let x=0;x<Q;x++)H[first][q-1][x]=F[q-1][x*Q+first];
  for(let j=q-2;j>=0;j--)for(let x=0;x<Q;x++){let b=NEG;for(let y=0;y<Q;y++)b=Math.max(b,F[j][x*Q+y]+H[first][j+1][y]);H[first][j][x]=b}
  const bound=H[first][0][first];if(Number.isFinite(bound))heap.push({K:[first],g:0,bound});
 }
 let best=null,expanded=0,n=0,feasible=0,truthRank=null,certified=false,initial=heap.a[0]?.bound??NEG;
 const target=truth?truth.join(","):null;
 while(heap.a.length&&n<limit){
  if(best&&heap.a[0].bound<best.score-1e-10){certified=true;break}
  const z=heap.pop(),j=z.K.length-1,x=z.K[j],f=z.K[0];expanded++;
  if(j===q-1){n++;const d=exact(C,z.K,M,prev);if(d){feasible++;if(d.score>z.bound+1e-8)throw Error("upper bound violated");if(!best||d.score>best.score)best={K:z.K,...d,bound:z.bound};}if(target===z.K.join(","))truthRank=n;continue}
  for(let y=0;y<Q;y++){const g=z.g+F[j][x*Q+y],bound=g+H[f][j+1][y];if(Number.isFinite(bound))heap.push({K:[...z.K,y],g,bound})}
 }
 if(!heap.a.length)certified=true;
 if(best&&heap.a[0]&&heap.a[0].bound<best.score-1e-10)certified=true;
 return {q,n:C.length,enumerated:n,expanded,feasible,initialBound:initial,nextBound:heap.a[0]?.bound??null,certified,truthRank,best,truthBound:truth?truth.reduce((s,x,j)=>s+F[j][x*Q+truth[(j+1)%q]],0):null};
}
function encode(P,K,rng,prev=0){
 const C=[];for(const p of P)while(true){const x=mod(p+K[C.length%K.length]),last=C.length?C.at(-1):prev;if(x===last&&rng(1000000)/1000000<SUPP){let z=rng(28);if(z>=x)z++;C.push(z)}else{C.push(x);break}}
 return C;
}
function run(raw,limit=512,controls=12){
 const corpus=JSON.parse(raw[0]),seq=raw.slice(1,4).map(x=>words(x).flat()),M=model(seq.slice(0,2)),rng=makeRng(0x47a57a),native=JSON.parse(raw[4]),rm=new Map(native.runes.map((r,i)=>[r,i])),ns=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x))}));const out=[];
 const runs=[];for(const {name,P} of [{name:"Gibran",P:seq[2]},...ns]){let start=0;for(let i=0;i<=P.length;i++)if(i===P.length||P[i]===0){if(i-start>=169)runs.push({name,P:P.slice(start,i),start});start=i+1}}
 for(let i=0;i<controls;i++){
  const q=i%2?13:8,run=runs[rng(runs.length)],L=169,offset=rng(run.P.length-L+1),P=run.P.slice(offset,offset+L);let K,C,attempts=0;
  do{K=Array.from({length:q},()=>rng(Q));C=encode(P,K,rng);attempts++;if(attempts>100000)throw Error("plant conditioning budget")}while(C.includes(0));
  const a=search(C,q,M,limit,K),truth=exact(C,K,M);if(!truth||truth.score>a.truthBound+1e-8)throw Error("truth invalid");
  out.push({donor:run.name,offset:run.start+offset,attempts,truthKey:K,truthScore:truth.score,truthText:P.map(x=>names[x]).join(""),correctKey:a.best?.K.join(",")===K.join(","),correctText:a.best?.P.join(",")===P.join(","),...a});
 }
 const original=[];for(const [page,a,b] of [[7,25,194],[8,35,161],[54,66,195]])for(const q of [8,13]){const C=corpus.pages[page].indices.slice(a,b),d=search(C,q,M,limit);original.push({page,start:a,end:b,...d,text:d.best?.P.map(x=>names[x]).join("")??null})}
 return {controls:out,original,limit};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8")),Number(process.argv[2]||512),Number(process.argv[3]||12)),null,2));
module.exports={run,search,exact,factors,model,paths,encode};