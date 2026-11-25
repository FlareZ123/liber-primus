"use strict";
/** All-function adjacent-repeat gate. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,raw,sourceBlobShas){
 const N=29,A=(a,b,d)=>(a*N+b)*N+d,B=(a,k)=>a*N+k;
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function build(pt,q,hold,lens){const W=new Int32Array(N*N*N);let constant=0,skip=0,offset=0;for(const n of lens){const r=new Int16Array(n).fill(-1),active=[];for(let i=0;i<n;i++)if(!hold||pt[offset+i]!==0)active.push(i);for(let j=q;j<active.length;j++)r[active[j]]=pt[offset+active[j-q]];for(let i=0;i+1<n;i++){let p=pt[offset+i],p2=pt[offset+i+1],x=r[i],y=r[i+1],d=(p2-p+N)%N;if(hold&&p===0&&p2===0){constant++;continue}if(x<0||y<0){skip++;continue}if(x===y){if(d===0)constant++;continue}W[A(x,y,d)]++;W[A(y,x,(N-d)%N)]++}offset+=n}return {W,constant,skip}}
 function objective(W,constant,f){let s=constant;for(let a=0;a<N;a++)for(let b=a+1;b<N;b++)s+=W[A(a,b,(f[a]-f[b]+N)%N)];return s}
 // All functions, including nonbijective maps. Common translation is a symmetry.
 function gate(pt,q,hold,lens,limit,cap=100000,witness=null){const {W,constant,skip}=build(pt,q,hold,lens);let base=constant;for(let a=0;a<N;a++)for(let b=a+1;b<N;b++){let m=Infinity;for(let d=0;d<N;d++)m=Math.min(m,W[A(a,b,d)]);base+=m;for(let d=0;d<N;d++){W[A(a,b,d)]-=m;W[A(b,a,d)]-=m}}const deg=Array(N).fill(0);for(let a=0;a<N;a++)for(let b=0;b<N;b++)if(a!==b)for(let d=0;d<N;d++)deg[a]+=W[A(a,b,d)];const order=Array.from({length:N},(_,i)=>i).sort((a,b)=>deg[b]-deg[a]||a-b);const C=new Int32Array(N*N),anchor=order[0];for(let j=1;j<N;j++)for(let k=0;k<N;k++)C[B(order[j],k)]=W[A(order[j],anchor,k)];let nodes=0,depthMax=0,ans="UNSAT";function dfs(depth,used){if(++nodes>cap){ans="CAP";return}depthMax=Math.max(depthMax,depth);const budget=limit-base-used;if(budget<0)return;if(depth===N){ans="SAT";return}let bound=0;for(let j=depth;j<N;j++){let v=order[j],mn=Infinity;for(let k=0;k<N;k++)mn=Math.min(mn,C[B(v,k)]);bound+=mn;if(bound>budget)return}const v=order[depth],choices=[];for(let k=0;k<N;k++)if(C[B(v,k)]<=budget)choices.push([C[B(v,k)],k]);choices.sort((a,b)=>a[0]-b[0]);for(const [cost,k] of choices){for(let j=depth+1;j<N;j++){let a=order[j];for(let b=0;b<N;b++)C[B(a,b)]+=W[A(a,v,(b-k+N)%N)]}dfs(depth+1,used+cost);for(let j=depth+1;j<N;j++){let a=order[j];for(let b=0;b<N;b++)C[B(a,b)]-=W[A(a,v,(b-k+N)%N)]}if(ans!=="UNSAT")return}}
 if(witness){let used=0;const f=witness.map(k=>(k-witness[anchor]+N)%N);for(let depth=1;depth<N;depth++){let v=order[depth],k=f[v],bound=0;for(let j=depth;j<N;j++){let a=order[j],mn=Infinity;for(let b=0;b<N;b++)mn=Math.min(mn,C[B(a,b)]);bound+=mn}if(base+used+bound>limit)throw Error("known map pruned");used+=C[B(v,k)];for(let j=depth+1;j<N;j++){let a=order[j];for(let b=0;b<N;b++)C[B(a,b)]+=W[A(a,v,(b-k+N)%N)]}}if(base+used!==limit)throw Error("map objective disagreement");return {witness:true,base,objective:base+used}}
 dfs(1,0);return {base,nodes,depthMax,ans,skip}}
 const pages=gp.pages.slice(0,56),ct=pages.flatMap(p=>p.indices),n=ct.length,limit=pages.reduce((s,p)=>s+p.indices.slice(1).filter((x,i)=>x===p.indices[i]).length,0),lens=pages.map(p=>p.indices.length);
 if(n!==12956||limit!==86)throw Error("canonical source shape");
 let seed=0x45a110f;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function perm(){const a=Array.from({length:N},(_,i)=>i);for(let i=N-1;i>0;i--){let j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const P=raw.map(native),controls=[];
 for(const q of [8,13])for(const hold of [false,true]){
  const pt=P[(q+(+hold))%P.length].slice(4000,4000+n),f=Array.from({length:N},()=>rng()%N),a=2+rng()%27;
  let offset=0,actual=0;for(const len of lens){const queue=Array.from({length:q},()=>rng()%N),out=[],sigma=perm(),b=rng()%N;for(let j=0;j<len;j++){let p=pt[offset+j];if(hold&&p===0){out.push(0);continue}out.push(sigma[(a*(p+queue.shift())+b)%N]);queue.push(f[p])}for(let j=1;j<out.length;j++)if(out[j]===out[j-1])actual++;offset+=len}
  const x=build(pt,q,hold,lens),obj=objective(x.W,x.constant,f);if(obj>actual)throw Error("lower bound exceeds forward ciphertext");const w=gate(pt,q,hold,lens,obj,100000,f);controls.push({q,hold,a,actual,objective:obj,witness:w.witness});
 }
 let summary=[],details=[];for(let j=0;j<P.length;j++){let p=P[j];for(let q of [8,13])for(let hold of [false,true]){let res=[];for(let i=0;i<32;i++){let start=Math.round(i*(p.length-n)/31),z=gate(p.slice(start,start+n),q,hold,lens,limit);res.push({i,start,...z})}details.push({j,q,hold,res});summary.push({j,length:p.length,q,hold,status:res.reduce((a,x)=>(a[x.ans]=(a[x.ans]||0)+1,a),{}),minBase:Math.min(...res.map(z=>z.base)),maxNodes:Math.max(...res.map(z=>z.nodes)),maxDepth:Math.max(...res.map(z=>z.depthMax))})}}
 return {sourceBlobShas,n,limit,lens,controls,summary,details};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const shas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),shas),null,2));
