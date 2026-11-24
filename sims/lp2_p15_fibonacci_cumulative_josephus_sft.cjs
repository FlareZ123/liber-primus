'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(gp,sol){
 const fib=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987],nums=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 const sieve=new Uint8Array(6000000),pr=[];for(let i=2;i<sieve.length&&pr.length<350000;i++)if(!sieve[i]){pr.push(i);if(i*i<sieve.length)for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1}
 if(!nums.every((n,i)=>Math.abs(3301-pr[fib[i]])===n))throw Error("source grid");
 const ks=pr.map(p=>(p-1)%29),seq=(inc,before,sign,n)=>{let j=0;return Array.from({length:n},(_,i)=>{const step=fib[i%16]+inc;if(before)j+=step;const k=sign*(pr[j]-1);if(!before)j+=step;return (k%29+29)%29})};
 const data=gp.pages.slice(15,23).flatMap(p=>p.indices),local=[["lower rubric",data.slice(9)],["black body",data.slice(20)],["next page",data.slice(gp.pages[15].indices.length)]];
 function reach(c,k,s=0,sign=1){let states=new Set([s]),peak=1;for(let i=0;i<c.length;i++){const next=new Set;for(const j of states){const p=(c[i]-sign*k[j]+29)%29;if(c[i]===0)next.add(j);if(p!==0)next.add(j+1)}if(!next.size)return{max:i,peak};states=next;peak=Math.max(peak,states.size)}return{max:c.length,peak,terminal:states.size}}
 const ix=new Map(gp.runes.map((x,i)=>[x,i])),gptext=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x)),p57=gp.pages[57].indices,p56=gptext(sol.sections.find(s=>s.name==="p56_an_end").source_text);
 function encode(p,k,s=0,sign=1){return p.map(v=>v===0?0:(v+sign*k[s++]+29)%29)}
 if(!encode(p56,ks).every((v,i)=>v===gp.pages[56].indices[i]))throw Error("p56");
 const cumulative=[];for(const inc of [0,1])for(const before of [false,true])for(const sign of [1,-1]){const k=seq(inc,before,sign,data.length);if(k.some(x=>!Number.isFinite(x)))throw Error("sieve insufficient");cumulative.push({inc,before,sign,plant:reach(encode(p57,k),k),targets:local.map(([label,c])=>({label,len:c.length,...reach(c,k)}))})}
 function perm(n){const remaining=Array.from({length:n},(_,i)=>i),order=[];let j=0;for(let i=0;remaining.length;i++){j=(j+fib[i%16])%remaining.length;order.push(remaining.splice(j,1)[0])}return order}
 const permute=(c,order)=>order.map(i=>c[i]),unpermute=(c,order)=>{const a=new Array(c.length);order.forEach((i,j)=>a[i]=c[j]);return a};
 const src=sol.sections.filter(s=>!["0_koan_1","p56_an_end","p57_parable"].includes(s.name)).map(s=>gptext(s.source_text));
 const uni=new Float64Array(29).fill(1),bi=Array.from({length:29},()=>new Float64Array(29)),tri=Array.from({length:841},()=>new Float64Array(29));for(const a of src)for(let i=0;i<a.length;i++){uni[a[i]]++;if(i)bi[a[i-1]][a[i]]++;if(i>1)tri[a[i-2]*29+a[i-1]][a[i]]++}const sum=a=>a.reduce((s,x)=>s+x,0),ut=sum(uni),up=Array.from(uni,x=>x/ut),bp=bi.map(row=>{const z=sum(row)+10;return Array.from(row,(x,j)=>(x+10*up[j])/z)}),tl=tri.map((row,i)=>{const z=sum(row)+10;return Array.from(row,(x,j)=>Math.log((x+10*bp[i%29][j])/z))}),bl=bp.map(r=>r.map(Math.log)),ul=up.map(Math.log),score=(a,b,p)=>b===29?ul[p]:a===29?bl[b][p]:tl[a*29+b][p];
 function decode(c,s,sign,lo,hi,initial={j:s,a:29,b:29,l:0,seq:""}){let states=[initial];for(let i=lo;i<hi;i++){const next=new Map;for(const v of states){const p=(c[i]-sign*ks[v.j]+29)%29;function add(p,j){const l=v.l+score(v.a,v.b,p),key=(j*30+v.b)*30+p,old=next.get(key);if(!old||l>old.l)next.set(key,{j,a:v.b,b:p,l,seq:v.seq+String.fromCharCode(65+p)})}if(c[i]===0)add(0,v.j);if(p!==0)add(p,v.j+1)}states=Array.from(next.values());if(!states.length)return null}return states.reduce((a,b)=>a.l>b.l?a:b)}
 const read=v=>Array.from(v.seq,x=>x.charCodeAt(0)-65);
 function fit(c,prefix){const o=perm(c.length);let max=0,legal=0,full=0,best=null,rows=[];for(const [dir,d] of [["read",permute(c,o)],["restore",unpermute(c,o)]])for(const s of fib)for(const sign of [1,-1]){const n=reach(d,ks,s,sign).max;if(n>max){max=n;rows=[]}if(n===max)rows.push({dir,s,sign});if(n===c.length)full++;if(n<prefix)continue;legal++;const v=decode(d,s,sign,0,prefix);if(!best||v.l>best.v.l)best={dir,d,s,sign,v}}if(!best)return{max,rows,legal,full};const h=decode(best.d,best.s,best.sign,prefix,c.length,best.v),p=h&&read(h);return{max,rows,legal,full,key:{dir:best.dir,s:best.s,sign:best.sign},train:best.v.l/prefix,heldoutScore:h?(h.l-best.v.l)/(c.length-prefix):null,prefixPlain:read(best.v),heldoutPlain:p?.slice(prefix),replay:p?((best.dir==="read"?unpermute(encode(p,ks,best.s,best.sign),o):permute(encode(p,ks,best.s,best.sign),o)).every((v,i)=>v===c[i])):false}}
 const p=gptext(sol.sections.find(x=>x.name==="0_koan_1").source_text),s=89,sign=1,c=permute(encode(p,ks,s,sign),perm(p.length)),f=fit(c,240);
 const plant={len:p.length,...f,prefixPlain:f.prefixPlain?.filter((v,i)=>v===p[i]).length,heldoutPlain:f.heldoutPlain?.filter((v,i)=>v===p[i+240]).length};
 const traversal=local.map(([name,c])=>({name,len:c.length,...fit(c,Math.floor(c.length/2))}));
 return{cumulative,traversal:{plant,original:traversal}};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(...files.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')))),null,2));
