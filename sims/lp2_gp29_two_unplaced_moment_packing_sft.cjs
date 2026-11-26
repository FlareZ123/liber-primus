/** Agent7 exact two-component moment packing SFT. Run from repository root. */
'use strict';
const fs=require('node:fs');
function run(dictText,fixture,src){
 const N=29,Q=8,ALL=(1<<N)-1,SYM="0123456789abcdefghijklmnopqrs",alpha=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const mod=x=>((x%N)+N)%N,inv=Array.from({length:N},(_,x)=>x?Array.from({length:N},(_,y)=>y).find(y=>x*y%N===1):0);
 const square=Array.from({length:N},()=>[]);for(let t=0;t<N;t++)square[t*t%N].push(t);
 const rot=(x,d)=>d?((x<<d)|(x>>>(N-d)))&ALL:x;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 let rng=3301;const rand=n=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng%n};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
 const elems=m=>{const a=[];for(let i=0;i<N;i++)if((m>>>i)&1)a.push(i);return a};
 const mask=a=>a.reduce((m,x)=>m|(1<<x),0);
 const moments=m=>{let a=0,b=0,n=0;for(const x of elems(m)){a+=x;b+=x*x;n++}return [n,mod(a),mod(b)]};
 // Exact placements of two remaining labelled components in a nonempty complement.
 // Complement moments minus local moments give n*t + m*u = S and
 // n*t^2+2*a*t+m*u^2+2*b*u = T. Eliminate u=(S-n*t)/m.
 function pairMoment(A,B,R){
  const [n,a,aa]=moments(A),[m,b,bb]=moments(B),[z,s,ss]=moments(R);
  assert(n&&m&&z===n+m&&z<N,"pair sizes");
  const S=mod(s-a-b),T=mod(ss-aa-bb),u0=mod(S*inv[m]),u1=mod(-n*inv[m]);
  const qa=mod(n+m*u1*u1),qb=mod(2*a+2*m*u0*u1+2*b*u1),qc=mod(m*u0*u0+2*b*u0-T);
  assert(qa!==0,"quadratic must have nonzero leading coefficient");
  const out=[];for(const d of square[mod(qb*qb-4*qa*qc)]){
   const t=mod((-qb+d)*inv[mod(2*qa)]),u=mod(u0+u1*t),x=rot(A,t),y=rot(B,u);
   if(!(x&y)&&(x|y)===R)out.push([t,u]);
  }
  return out;
 }
 function pairBrute(A,B,R){const out=[];for(let t=0;t<N;t++){const x=rot(A,t);if(x&~R)continue;for(let u=0;u<N;u++){const y=rot(B,u);if(!(x&y)&&(x|y)===R)out.push([t,u])}}return out}
 const sortPairs=a=>a.map(x=>x.join(",")).sort().join(";");
 const pairTests={planted:0,random:0,zero:0,one:0,two:0};
 for(let i=0;i<5000;i++){
  const labels=shuffle(Array.from({length:N},(_,j)=>j)),n=1+rand(14),m=1+rand(28-n);
  const R=mask(labels.slice(0,n+m)),planted=i%2===0,t=rand(N),u=rand(N);
  const A=planted?rot(mask(labels.slice(0,n)),mod(-t)):mask(shuffle(labels.slice()).slice(0,n));
  const B=planted?rot(mask(labels.slice(n,n+m)),mod(-u)):mask(shuffle(labels.slice()).slice(0,m));
  const got=pairMoment(A,B,R),want=pairBrute(A,B,R);
  assert(sortPairs(got)===sortPairs(want),"pair oracle mismatch");
  if(planted)assert(got.some(x=>x[0]===t&&x[1]===u),"plant lost");
  pairTests[planted?"planted":"random"]++;pairTests[["zero","one","two"][got.length]]++;
 }
 // Full placement oracle anchored at largest component (global translation gauge).
 function pack(ms,fast){
  const a=ms.map((m,i)=>({m,i,n:moments(m)[0]})).sort((a,b)=>b.n-a.n||a.i-b.i);
  const trans=Array(ms.length).fill(0),out=[];let nodes=0,tests=0,closures=0;
  function visit(used,left){
   nodes++;
   if(!left.length){out.push(trans.join(","));return}
   if(fast&&left.length===2){closures++;for(const [t,u] of pairMoment(left[0].m,left[1].m,ALL^used)){trans[left[0].i]=t;trans[left[1].i]=u;out.push(trans.join(","))}return}
   let pick=-1,opts=[];
   for(let i=0;i<left.length;i++){const z=[];for(let t=0;t<N;t++){tests++;if(!(rot(left[i].m,t)&used))z.push(t)}if(!z.length)return;if(pick<0||z.length<opts.length){pick=i;opts=z;if(z.length===1)break}}
   const w=left[pick],rem=left.filter((_,i)=>i!==pick);
   for(const t of opts){trans[w.i]=t;visit(used|rot(w.m,t),rem)}
  }
  visit(a[0].m,a.slice(1));return {out:out.sort(),nodes,tests,closures}
 }
 const totals={planted:{cases:0,nodes:[0,0],tests:[0,0],closures:0,solutions:0},original:{cases:0,nodes:[0,0],tests:[0,0],closures:0,solutions:0}};
 function compare(ms,kind){const a=pack(ms,false),b=pack(ms,true);assert(a.out.join(";")===b.out.join(";"),"full packing mismatch");const x=totals[kind];x.cases++;x.nodes[0]+=a.nodes;x.nodes[1]+=b.nodes;x.tests[0]+=a.tests;x.tests[1]+=b.tests;x.closures+=b.closures;x.solutions+=b.out.length;return b.out.length}
 for(let i=0;i<300;i++){const labels=shuffle(Array.from({length:N},(_,j)=>j)),count=3+rand(4),cuts=[0,...shuffle(Array.from({length:28},(_,j)=>j+1)).slice(0,count-1).sort((a,b)=>a-b),29];const ms=[];for(let j=0;j<count;j++)ms.push(rot(mask(labels.slice(cuts[j],cuts[j+1])),rand(N)));assert(compare(ms,"planted")>0,"full plant lost")}
 // Build the exact published finite lexicon and original carry seed domain.
 const dict=new Set();for(const line of dictText.split(/\r?\n/)){const m=/^([a-z]+) [0-9]+$/.exec(line);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function rec(i,w){if(i===s.length){dict.add(w);return}for(let l=1;l<=3&&i+l<=s.length;l++){const v=s.slice(i,i+l),j=l===3?(v==="ING"?21:-1):alpha.indexOf(v);if(j>=0)rec(i+l,w+SYM[j])}}rec(0,"")
 }
 assert(dict.size===38910,"base dictionary "+dict.size);for(const w of fixture.added.split(/\s+/))if(w)dict.add(w);assert(dict.size===38938,"dictionary");
 const by=Array.from({length:60},()=>[]);for(const w of dict)by[w.length].push(w);for(const a of by)a.sort();
 const body=src.p54.body_groups;assert(body.length===48&&body.join("").length===223&&body[47]==="63g2eis46q","source");
 const words=Array.from(new Set(by[11].map(w=>w.slice(0,10)))).sort();
 function edges(c,w,j){let es=[];for(let i=0;i<c.length;i++){const p=SYM.indexOf(w[i]),x=SYM.indexOf(c[i]);if(!p){if(x)return null;continue}es.push([x,p,j]);j=(j+1)%Q}return es}
 function fit(c,w){let count=0;for(let i=0;i<c.length;i++){const p=SYM.indexOf(w[i]),x=SYM.indexOf(c[i]);if(!p)continue;if(p!==x)return mod8(-count);count++}return 0}
 const mod8=x=>(x%8+8)%8;
 // Symbolic graph (affine RREF) used only to obtain valid keys for sampled carry states.
 const zero=()=>Array(Q).fill(0),unit=j=>{const a=zero();a[j]=1;return a};
 const plus=(a,b)=>a.map((x,j)=>mod(x+b[j])),sub=(a,b)=>a.map((x,j)=>mod(x-b[j]));
 function symbolic(es){
  const roots=Array.from({length:N},(_,i)=>i),off=Array.from({length:N},zero),eq=[unit(0).concat(1)];
  for(const [c,p,j] of es){const a=roots[c],b=roots[p],v=sub(plus(off[p],unit(j)),off[c]);if(a===b){eq.push(v.concat(0));continue}for(let x=0;x<N;x++)if(roots[x]===a){roots[x]=b;off[x]=plus(off[x],v)}}
  let piv=[],row=0;for(let j=0;j<Q;j++){let i=eq.findIndex((a,i)=>i>=row&&a[j]);if(i<0)continue;[eq[row],eq[i]]=[eq[i],eq[row]];eq[row]=eq[row].map(x=>mod(x*inv[eq[row][j]]));for(let k=0;k<eq.length;k++)if(k!==row&&eq[k][j]){let f=eq[k][j];eq[k]=eq[k].map((x,z)=>mod(x-f*eq[row][z]))}piv.push(j);row++}
  if(eq.some(a=>a.slice(0,Q).every(x=>!x)&&a[Q]))return null;
  return {eq:eq.slice(0,row),piv,roots,off};
 }
 function getKey(g){const k=Array.from({length:Q},()=>rand(N));for(let i=0;i<g.piv.length;i++){const j=g.piv[i],a=g.eq[i];let v=a[Q];for(let l=0;l<Q;l++)if(l!==j)v-=a[l]*k[l];k[j]=mod(v)}return k}
 function graph(){return {r:Array.from({length:N},(_,i)=>i),o:Array(N).fill(0),m:Array(N).fill(1)}}
 function merge(g,es,k){const r=g.r.slice(),o=g.o.slice(),m=g.m.slice();for(const [c,p,j] of es){const a=r[c],b=r[p],t=mod(o[p]+k[j]-o[c]);if(a===b){if(t)return null;continue}const z=rot(m[a],t);if(z&m[b])return null;for(let x=0;x<N;x++)if(r[x]===a){r[x]=b;o[x]=mod(o[x]+t)}m[b]|=z;m[a]=0}return {r,o,m}}
 const seeds=[];for(const w of words){const es=edges(body[47],w,fit(body[47],w));if(!es)continue;const s=symbolic(es);if(s)seeds.push({w,es,s})}
 let attempts=0,validCarry=0,greedyMerges=0;const details=[],seen=new Set();
 // Sample only actual original group edges, fixed numeric key and whole-word alternatives.
 // No use of p55 or its suffix. Select the first randomly permuted valid option.
 for(const seed of shuffle(seeds.slice()).slice(0,80)){
  for(let z=0;z<12;z++){attempts++;const k=getKey(seed.s);if(k.slice(0,4).every((x,j)=>x===k[j+4]))continue;let g=merge(graph(),seed.es,k);if(!g)continue;validCarry++;
   const groups=shuffle(Array.from({length:47},(_,i)=>i));groups.sort((a,b)=>body[b].length-body[a].length);
   for(const i of groups){const wlist=by[body[i].length],offset=rand(wlist.length);let next=null;
    for(let z=0;z<wlist.length&&!next;z++){const w=wlist[(z+offset)%wlist.length];const s=rand(Q);for(let j=0;j<Q&&!next;j++){const es=edges(body[i],w,(s+j)%Q);if(es)next=merge(g,es,k)}}
    if(!next)continue;g=next;greedyMerges++;
    const ms=g.m.filter(Boolean),n=ms.length;
    if(n>=3&&n<=6){const sig=ms.join(",");if(!seen.has(sig)){seen.add(sig);const solutions=compare(ms,"original");details.push({carry:seed.w,key:k,group:i,components:ms.map(x=>moments(x)[0]),masks:ms,solutions})}if(n===3)break}
    if(n<3||details.length>=150)break;
   }if(details.length>=150)break;
  }if(details.length>=150)break;
 }
 return {schema:"agent7-moment-packing-sft-v1",seed:3301,pairTests,totals,originalSampling:{symbolicCarryWords:seeds.length,attempts,validCarry,greedyMerges,details},limitations:"Original samples are partial lexical states with fixed sampled keys; not a seed exhaustion or key recovery. Work counts exclude moment arithmetic; no C++ timing or full receiver calibration."};
}
const out=run(fs.readFileSync("resources/control/english_wordfreq_textblob.txt",'utf8'),JSON.parse(fs.readFileSync("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json",'utf8')),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json",'utf8')));
console.log(JSON.stringify(out,null,2));
