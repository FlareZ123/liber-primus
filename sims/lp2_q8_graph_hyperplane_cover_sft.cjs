'use strict';
const fs=require('node:fs');
function experiment(lex,fixture,source){
 const N=29,Q=8,ALL=(1<<29)-1,S="0123456789abcdefghijklmnopqrs",A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const md=x=>(x%N+N)%N,inv=Array.from({length:N},(_,a)=>Array.from({length:N},(_,b)=>b).find(b=>a*b%N===1)||0),z=()=>Array(Q).fill(0);
 const add=(a,b)=>a.map((x,i)=>md(x+b[i])),sub=(a,b)=>a.map((x,i)=>md(x-b[i])),scale=(a,b)=>a.map(x=>md(x*b));
 let seed=0x291145;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n};
 const D=new Set();for(const line of lex.split("\n")){const m=/^([a-z]+)\s+\d+\s*$/.exec(line);if(!m)continue;const t=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function v(i,w){if(i===t.length){D.add(w);return}for(let n=1;n<=3&&i+n<=t.length;n++){let a=n===3?(t.slice(i,i+n)==="ING"?21:-1):A.indexOf(t.slice(i,i+n));if(a>=0)v(i+n,w+S[a])}}v(0,"")}
 if(D.size!==38910)throw Error("dictionary "+D.size);for(const w of JSON.parse(fixture).added.trim().split(/\s+/))D.add(w);if(D.size!==38938)throw Error("full dictionary "+D.size);
 const groups=JSON.parse(source).p54.body_groups,by=Array.from({length:60},()=>[]);for(const w of D)by[w.length].push(w);const pref=[...new Set(by[11].map(w=>w.slice(0,10)))].sort();
 function graph(edges){
  const adj=Array.from({length:N},()=>[]);for(const [c,p,j] of edges){adj[p].push([c,j,1]);adj[c].push([p,j,-1])}
  const root=Array(N).fill(-1),off=Array(N),eq=[];let e=z();e[0]=1;eq.push([...e,1]);
  for(let x=0;x<N;x++)if(root[x]<0){root[x]=x;off[x]=z();let stack=[x];while(stack.length){const u=stack.pop();for(const [v,j,s] of adj[u]){let a=off[u].slice();a[j]=md(a[j]+s);if(root[v]<0){root[v]=x;off[v]=a;stack.push(v)}else eq.push([...sub(a,off[v]),0])}}}
  let r=0,piv=[];for(let j=0;j<Q;j++){let k=eq.findIndex((v,i)=>i>=r&&v[j]);if(k<0)continue;[eq[r],eq[k]]=[eq[k],eq[r]];eq[r]=eq[r].map(x=>md(x*inv[eq[r][j]]));for(let i=0;i<eq.length;i++)if(i!==r&&eq[i][j]){let f=eq[i][j];eq[i]=eq[i].map((x,l)=>md(x-f*eq[r][l]))}piv.push(j);r++}
  if(eq.slice(r).some(v=>v[Q]))return null;const free=Array.from({length:Q},(_,j)=>j).filter(j=>!piv.includes(j)),d=free.length;
  const project=a=>{let b=[...a,0];for(let i=0;i<r;i++){const f=b[piv[i]];for(let j=0;j<Q;j++)b[j]=md(b[j]-f*eq[i][j]);b[Q]=md(b[Q]+f*eq[i][Q])}return [...free.map(j=>b[j]),b[Q]]};
  const forbid=new Map();let parallel=false;for(let i=0;i<N;i++)for(let j=0;j<i;j++)if(root[i]===root[j]){const a=project(sub(off[i],off[j])),k=a.findIndex((x,i)=>i<d&&x);if(k<0){if(!a[d])return null;continue}const v=a.map(x=>md(x*inv[a[k]])),key=v.slice(0,d).join(",");let mask=forbid.get(key)||0;mask|=1<<md(-v[d]);if(mask===ALL)parallel=true;forbid.set(key,mask)}
  if(parallel)return null;return {d,forbid,root,off,free,piv,eq};
 }
 function domain(c,words,anchor){let out=[],seen=new Set();for(const w of words){let consumed=0,canonical=-1;if(anchor){for(let i=0;i<w.length;i++){let p=S.indexOf(w[i]),x=S.indexOf(c[i]);if(!p)continue;if(p!==x){canonical=md(8-consumed%8)%8;break}consumed++}}
  for(let st=0;st<Q;st++){if(canonical>=0&&st!==canonical)continue;let j=st,e=[],ok=true;for(let i=0;i<c.length;i++){let p=S.indexOf(w[i]),x=S.indexOf(c[i]);if(!p){if(x){ok=false;break}continue}if(j===0&&p===x||e.some(([cc,pp,jj])=>jj===j&&((cc===x)!==(pp===p)||(cc===pp)!==(x===p)))){ok=false;break}e.push([x,p,j]);j=(j+1)%Q}if(!ok)continue;let sig=[...new Set(e.map(x=>x.join(",")))].sort().join(";");if(!seen.has(sig)&&graph(e)){seen.add(sig);out.push(e)}}}return out}
 function exact(d,forbid,oracle=false){
  const rows=[...forbid].map(([s,mask])=>[s.split(",").map(Number),mask]);if(!d)return {count:1,rank:0};
  const last=d-1,params=Array(d).fill(0),basis=[],pivot=[],first=null;let count=0,origin;
  const accept=()=>{count++;if(!origin){origin=params.slice();return}let v=params.map((x,i)=>md(x-origin[i]));for(let i=0;i<basis.length;i++){let f=v[pivot[i]];v=v.map((x,j)=>md(x-f*basis[i][j]))}let j=v.findIndex(Boolean);if(j>=0){let f=inv[v[j]];basis.push(v.map(x=>md(x*f)));pivot.push(j)}};
  function rec(i){if(i===last){let blocked=0;if(oracle){for(let t=0;t<N;t++){params[last]=t;if(rows.every(([a,m])=>!(m&(1<<md(a.reduce((s,x,j)=>s+x*params[j],0))))))accept()}return}
    for(const [a,mask] of rows){let b=0;for(let j=0;j<last;j++)b+=a[j]*params[j];b=md(b);let q=a[last];if(!q){if(mask&(1<<b)){blocked=ALL;break}}else{let m=mask;while(m){let bit=31-Math.clz32(m&-m);m&=m-1;blocked|=1<<md((bit-b)*inv[q])}if(blocked===ALL)break}}
    let allowed=ALL^blocked;while(allowed){let t=31-Math.clz32(allowed&-allowed);allowed&=allowed-1;params[last]=t;accept()}return}
   for(let t=0;t<N;t++){params[i]=t;rec(i+1)}}rec(0);return {count,rank:basis.length};
 }
 const carry=domain(groups[47],pref,true),indices=[...Array(47).keys()].sort((a,b)=>groups[b].length-groups[a].length).slice(0,9),domains=indices.map(i=>domain(groups[i],by[groups[i].length],false));const stats=Array.from({length:4},()=>({states:0,empty:0,rankReduced:0,one:0,counts:[],oracle:0}));let joins=0,accepted=0,trailEnds=0;
 // Fixed randomized partial joins only: no p55, no exhaustive original key claim.
 for(let trial=0;trial<250;trial++){let edges=carry[rnd(carry.length)].slice(),g=graph(edges);
  for(let j=0;j<domains.length;j++){let arr=domains[j],found=false;for(let t=0;t<30;t++){let next=edges.concat(arr[rnd(arr.length)]),h=graph(next);joins++;if(!h)continue;edges=next;g=h;accepted++;found=true;break}if(!found)break;
   if(g.d<=3){let s=stats[g.d],a=exact(g.d,g.forbid);s.states++;s.empty+=a.count===0;s.rankReduced+=a.count>0&&a.rank<g.d;s.one+=a.count===1;s.counts.push(a.count);if(s.oracle<12){let b=exact(g.d,g.forbid,true);if(a.count!==b.count||a.rank!==b.rank)throw Error("oracle mismatch");s.oracle++}if(!a.count)break}
  }trailEnds++;
 }
 // Controlled affine arrangements with no full parallel class; two independent
 // directions cover all except one point, then a third excludes that point.
 const allBut0=ALL^1,ex=new Map([["1,0",allBut0],["0,1",allBut0],["1,1",1]]),one=new Map([["1,0",allBut0],["0,1",allBut0]]);
 if(exact(2,ex).count!==0||exact(2,one).count!==1||exact(2,one).rank!==0)throw Error("constructed gate");
 const generated=[];for(let d=1;d<=3;d++){let tested=0,zero=0,rankReduced=0;for(let i=0;i<40;i++){let f=new Map();for(let j=0;j<12;j++){let a=Array.from({length:d},()=>rnd(N)),k=a.findIndex(Boolean);if(k<0)continue;a=a.map(x=>md(x*inv[a[k]]));let key=a.join(","),mask=f.get(key)||0;for(let l=0;l<1+rnd(18);l++)mask|=1<<rnd(N);f.set(key,mask)}let a=exact(d,f),b=exact(d,f,true);if(a.count!==b.count||a.rank!==b.rank)throw Error("random mismatch");tested++;zero+=a.count===0;rankReduced+=a.count>0&&a.rank<d}generated.push({d,tested,zero,rankReduced})}
 return {dictionary:D.size,prefixes:pref.length,carryOptions:carry.length,indices,domainSizes:domains.map(x=>x.length),joins,accepted,trailEnds,stats:stats.map(({counts,...s},d)=>({d,...s,min:counts.length?Math.min(...counts):null,max:counts.length?Math.max(...counts):null,mean:counts.length?counts.reduce((a,b)=>a+b,0)/counts.length:null})),generated,scope:"Randomized partial original p54 lexical joins, no p55 data used in fitting, no exhaustive search or key recovery."};
}
console.log(JSON.stringify(experiment(...['resources/control/english_wordfreq_textblob.txt','im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json','resources/liber-primus/lp2-page-groups-54-55-derived.json'].map(p=>fs.readFileSync(p,'utf8'))),null,2));
