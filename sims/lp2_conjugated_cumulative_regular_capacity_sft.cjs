'use strict';
/** Spacing-free all-secret cumulative GP29 regular-graph capacity. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function regular(w,k){
 if(!k)return 0;const n=w.length,S=2*n,T=S+1,N=T+1,g=Array.from({length:N},()=>[]);
 const add=(a,b,cap,cost)=>{let x={to:b,cap,cost,rev:g[b].length},y={to:a,cap:0,cost:-cost,rev:g[a].length};g[a].push(x);g[b].push(y)};
 for(let a=0;a<n;a++){add(S,a,k,0);add(a+n,T,k,0);for(let b=0;b<n;b++)if(a!==b)add(a,b+n,1,-w[a][b])}
 let cost=0;
 for(let f=0;f<n*k;f++){let d=Array(N).fill(Infinity),pv=Array(N).fill(-1),pe=Array(N).fill(-1),inq=Array(N).fill(false),q=[S];d[S]=0;inq[S]=true;
  for(let h=0;h<q.length;h++){let a=q[h];inq[a]=false;for(let i=0;i<g[a].length;i++){let e=g[a][i];if(e.cap&&d[a]+e.cost<d[e.to]){d[e.to]=d[a]+e.cost;pv[e.to]=a;pe[e.to]=i;if(!inq[e.to]){q.push(e.to);inq[e.to]=true}}}}
  if(!Number.isFinite(d[T]))throw Error("infeasible regular graph");
  for(let b=T;b!==S;){let a=pv[b],e=g[a][pe[b]];e.cap--;g[b][e.rev].cap++;b=a}cost+=d[T];
 }
 return -cost;
}
function encode(gp,s){const out=[];let tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);out.push(t[1]);i+=t[0].length}}return out}
function experiment(gp,em,gi){
 const docs=[encode(gp,em),encode(gp,gi)],K=5;
 const bound=c=>{let w=Array.from({length:29},()=>Array(29).fill(0));for(let i=1;i<c.length;i++)w[c[i-1]][c[i]]++;let diagonal=w.reduce((s,r,i)=>s+r[i],0),row=w.map(r=>r.slice().sort((a,b)=>b-a)),reg=Array.from({length:K+1},(_,i)=>regular(w,i));return {n:c.length-1,diag:diagonal,row:Array.from({length:K},(_,i)=>row.reduce((s,r)=>s+r.slice(0,i+1).reduce((a,b)=>a+b,0),0)),regular:reg.slice(1),cap:reg.slice(1).map((v,i)=>Math.max(v,diagonal+reg[i]))}};
 const minWindow=(data,n,cap)=>{let a=Array(29).fill(0),min=Array(K).fill(Infinity),survive=0,first=-1;for(let i=0;i<data.length;i++){a[data[i]]++;if(i>=n)a[data[i-n]]--;if(i>=n-1){let sorted=a.slice().sort((x,y)=>y-x),s=0,pass=true;for(let k=0;k<K;k++){s+=sorted[k];if(s<min[k])min[k]=s;if(s>cap[k])pass=false}if(pass){survive++;if(first<0)first=i-n+1}}}return {min,survive,first,windows:data.length-n+1}};
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[16,22],[0,55]];
 let rows=ranges.map(([lo,hi])=>{let c=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices),b=bound(c);return {range:[lo,hi],...b,controls:docs.map(d=>minWindow(d,b.n,b.cap))}});
 let key=Array.from({length:29},(_,i)=>(i*11+3)%29);[key[0],key[12]]=[key[12],key[0]];let inv=[];key.forEach((x,i)=>inv[x]=i);
 let p=docs[1].slice(10000,11743),c=[7],count=Array(29).fill(0);for(let x of p){count[x]++;c.push(inv[(key[c.at(-1)]+(x*7+5)%29)%29])}
 let control=bound(c),sum=0,actual=count.sort((a,b)=>b-a).slice(0,K).map(x=>sum+=x);if(actual.some((x,i)=>x>control.cap[i]))throw Error("control bound");
 // Exhaustive small graph verification for all regular subsets (n=4).
 let toy=[[0,4,3,1],[3,0,5,2],[1,4,0,7],[6,2,1,0]],edges=[];for(let a=0;a<4;a++)for(let b=0;b<4;b++)if(a!==b)edges.push([a,b]);
 let max=Array(4).fill(-Infinity);for(let mask=0;mask<(1<<edges.length);mask++){let r=Array(4).fill(0),c=Array(4).fill(0),v=0;for(let i=0;i<edges.length;i++)if(mask>>i&1){let [a,b]=edges[i];r[a]++;c[b]++;v+=toy[a][b]}let k=r[0];if(r.every(x=>x===k)&&c.every(x=>x===k))max[k]=Math.max(max[k],v)}
 for(let k=0;k<=3;k++)if(regular(toy,k)!==max[k])throw Error("toy enumeration");
 return {rows,control:{...control,actual},toy:max};
}
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/control/emerson_essays_2944.txt'),read('resources/control/gibran_prophet_58585.txt')),null,2));
