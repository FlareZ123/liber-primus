"use strict";
/** Phase-specific two-sided GP29 feedback capacities, including chapter seams. */
function experiment(gp,refs,task="summary"){
 const n=29,check=(v,m)=>{if(!v)throw Error(m)},sum=a=>a.reduce((s,x)=>s+x,0);
 const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices),tape=pages.flat();
 const ends=[729,1874,3603,5506,6527,7960,9640,12648,12956],chapters=ends.map((e,i)=>tape.slice(ends[i-1]||0,e));
 check(tape.length===12956&&pages.length===55,"source length");
 const names=gp.translit.map((name,i)=>({name,i})).sort((a,b)=>b.name.length-a.name.length);
 function encode(text){return (text.replace(/^#.*$/gm," ").toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C").match(/[A-Z]+/g)||[]).flatMap(w=>{let a=[];for(let i=0;i<w.length;){let s=names.find(x=>w.startsWith(x.name,i));check(s,w);a.push(s.i);i+=s.name.length}return a})}
 function matrices(blocks,q,local){const h=Array.from({length:q},()=>new Int32Array(n*n));let off=0;for(const b of blocks){for(let j=1;j<b.length;j++)h[(j+(local?0:off))%q][n*b[j-1]+b[j]]++;off+=b.length}return h}
 /** Max-weight simple k-regular bipartite graph. Fixed capacity SSP from zero flow. */
 function cap(h,k,m=n){
  if(k===0)return 0;
  const N=2*m+2,S=2*m,T=S+1,g=Array.from({length:N},()=>[]);
  function add(u,v,cap,cost){g[u].push({v,cap,cost,rev:g[v].length});g[v].push({v:u,cap:0,cost:-cost,rev:g[u].length-1})}
  for(let i=0;i<m;i++){add(S,i,k,0);add(m+i,T,k,0);for(let j=0;j<m;j++)add(i,m+j,1,-h[m*i+j])}
  let cost=0;for(let it=0;it<m*k;it++){
   const d=new Float64Array(N).fill(Infinity),pv=new Int32Array(N).fill(-1),pe=new Int32Array(N).fill(-1),inq=new Uint8Array(N);const q=[S];let head=0;d[S]=0;inq[S]=1;
   while(head<q.length){const u=q[head++];inq[u]=0;for(let i=0;i<g[u].length;i++){const e=g[u][i];if(e.cap&&d[e.v]>d[u]+e.cost){d[e.v]=d[u]+e.cost;pv[e.v]=u;pe[e.v]=i;if(!inq[e.v]){inq[e.v]=1;q.push(e.v)}}}}
   check(pv[T]>=0,"infeasible flow");cost+=d[T];for(let v=T;v!==S;v=pv[v]){const e=g[pv[v]][pe[v]];e.cap--;g[v][e.rev].cap++}
  }
  const chosen=g.slice(0,m).map(row=>row.filter(e=>e.v>=m&&e.v<2*m&&e.cap===0).map(e=>e.v-m));
  check(chosen.every(a=>a.length===k),"row capacity");const cols=new Int32Array(m);for(const a of chosen)for(const j of a)cols[j]++;
  check(cols.every(v=>v===k),"column capacity");
  check(sum(chosen.map((a,i)=>sum(a.map(j=>h[i*m+j]))))===-cost,"objective mismatch");return -cost;
 }
 /** Independent integer Hungarian k=1 optimization. */
 function assignment(h){const m=n,u=new Int32Array(m+1),v=new Int32Array(m+1),p=new Int32Array(m+1),way=new Int32Array(m+1);
 for(let i=1;i<=m;i++){p[0]=i;let j0=0;const minv=new Int32Array(m+1).fill(1e9),used=new Uint8Array(m+1);do{used[j0]=1;const i0=p[j0];let delta=1e9,j1=0;for(let j=1;j<=m;j++)if(!used[j]){const cur=-h[(i0-1)*m+j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=m;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;j0=j1}while(p[j0]);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}
 let score=0;for(let j=1;j<=m;j++){score+=h[(p[j]-1)*m+j-1];check(-h[(p[j]-1)*m+j-1]-u[p[j]]-v[j]===0,"assignment complementarity");for(let i=1;i<=m;i++)check(-h[(i-1)*m+j-1]-u[i]-v[j]>=0,"assignment dual")}return score}
 function rowOnly(a,k){return sum(Array.from({length:n},(_,i)=>sum(Array.from(a.slice(i*n,i*n+n)).sort((a,b)=>b-a).slice(0,k))))}
 const scopes=[["continuous",[tape],false],["chapter-local",chapters,true],["chapter-absolute",chapters,false],["page-local",pages,true],["page-absolute",pages,false]];
 if(task==="summary"){
 const native=refs.map(encode),floor=native.map(a=>{const h=new Int32Array(n),lo=new Array(15).fill(Infinity);let minE=Infinity;for(let i=0;i<a.length;i++){h[a[i]]++;if(i>=tape.length)h[a[i-tape.length]]--;if(i>=tape.length-1){minE=Math.min(minE,h[18]);let z=0;const sorted=Array.from(h).sort((a,b)=>b-a);for(let k=0;k<lo.length;k++){z+=sorted[k];lo[k]=Math.min(lo[k],z)}}}return {length:a.length,windows:a.length-tape.length+1,minE,lo}});
 const results=scopes.map(([name,b,l])=>({name,free:b.length,periods:Array.from({length:29},(_,j)=>{let h=matrices(b,j+1,l);return {q:j+1,latin:b.length+sum(h.map(assignment)),rowOnly:b.length+sum(h.map(a=>rowOnly(a,1)))}})}));
 let seed=3301;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
 function perm(){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function inv(a){const b=[];a.forEach((v,i)=>b[v]=i);return b}
 const plants=[];
 for(let s=0;s<3;s++){const [name,blocks,local]=scopes[s],q=13,keys=Array.from({length:q},()=>({A:perm(),B:perm(),O:perm()})),plain=native[s].slice(10000,10000+tape.length),c=[],decoded=[];let off=0;
 for(const b of blocks){let C=[plain[off]],R=[C[0]];for(let j=1;j<b.length;j++){const {A,B,O}=keys[(j+(local?0:off))%q];C.push(inv(O)[(A[C[j-1]]+B[plain[off+j]])%n]);R.push(inv(B)[(O[C[j]]-A[C[j-1]]+n)%n])}c.push(C);decoded.push(...R);off+=b.length}
 check(decoded.every((v,i)=>v===plain[i])&&decoded.length===tape.length,"plant replay");const h=matrices(c,q,local),hist=Array.from({length:n},(_,i)=>plain.filter(x=>x===i).length).sort((a,b)=>b-a);const a1=blocks.length+sum(h.map(assignment)),a2=blocks.length+sum(h.map(x=>cap(x,2)));check(hist[0]<=a1&&hist[0]+hist[1]<=a2,"plant bound");
 plants.push({name,recovered:decoded.length,trueTop1:hist[0],trueTop2:hist[0]+hist[1],cap1:a1,cap2:a2})}
 let toys=0;for(let t=0;t<8;t++){let h=Int32Array.from({length:9},()=>Math.floor(rand()*10));for(let k=1;k<=3;k++){let best=-Infinity;for(let mask=0;mask<512;mask++){let rows=[0,0,0],cols=[0,0,0],w=0;for(let i=0;i<9;i++)if(mask>>i&1){rows[Math.floor(i/3)]++;cols[i%3]++;w+=h[i]}if(rows.every(x=>x===k)&&cols.every(x=>x===k))best=Math.max(best,w)}check(cap(h,k,3)===best,"toy exhaustive");toys++}}
 return {n:tape.length,floor,results,plants,toys};
 }
 if(task.startsWith("page13-window:")){
  const scope=task.split(":")[1],local=scope==="page-local";check(local||scope==="page-absolute","invalid scope");
  const h=matrices(pages,13,local),phaseCaps=h.map(assignment),bounds=Array.from({length:15},(_,j)=>pages.length+sum(h.map(a=>j===0?assignment(a):cap(a,j+1))));
  const groups=Array.from({length:13},()=>[]);let off=0;for(const pg of pages){for(let j=1;j<pg.length;j++)groups[(j+(local?0:off))%13].push(off+j);off+=pg.length}
  const windows=refs.map(encode).map(a=>{let hist=new Int32Array(n),passE=0,passAll=0,passPhaseE=0,minMaxPhaseMargin=Infinity,first=null;
   for(let i=0;i<a.length;i++){hist[a[i]]++;if(i>=tape.length)hist[a[i-tape.length]]--;if(i<tape.length-1||hist[18]>bounds[0])continue;passE++;
    let t=0;const v=Array.from(hist).sort((a,b)=>b-a).slice(0,15).map(z=>t+=z);if(!v.every((z,k)=>z<=bounds[k]))continue;passAll++;
    const offset=i-tape.length+1,counts=groups.map(g=>g.reduce((s,k)=>s+(a[offset+k]===18),0)),margin=Math.max(...counts.map((z,k)=>z-phaseCaps[k]));
    minMaxPhaseMargin=Math.min(minMaxPhaseMargin,margin);if(margin<=0){passPhaseE++;if(first===null)first=offset}
   }
   return {windows:a.length-tape.length+1,passE,passAll,passPhaseE,minMaxPhaseMargin:Number.isFinite(minMaxPhaseMargin)?minMaxPhaseMargin:null,first};
  });return {scope,q:13,phaseCaps,bounds,windows};
 }
 const [scope,q0,ks0="1,2,3,5,9,15"]=task.split(":");const [,b,l]=scopes.find(x=>x[0]===scope),q=Number(q0),ks=ks0.split(",").map(Number),h=matrices(b,q,l);
 return {scope,q,free:b.length,capacities:ks.map(k=>({k,latin:b.length+sum(h.map(a=>k===1?assignment(a):cap(a,k))),rowOnly:b.length+sum(h.map(a=>rowOnly(a,k)))}))};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),paths.slice(1).map(read),process.argv[2]||"summary"),null,2));}
module.exports={experiment};
