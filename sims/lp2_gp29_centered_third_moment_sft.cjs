'use strict';
const fs=require('node:fs');
function run(source,dictText,fixture,src){
 const N=29,Q=8,ALL=(1<<N)-1,SYM="0123456789abcdefghijklmnopqrs",alpha=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const mod=x=>((x%N)+N)%N,iv=Array.from({length:N},(_,x)=>x?Array.from({length:N},(_,y)=>y).find(y=>x*y%N===1):0);
 const sq=Array.from({length:N},()=>[]);for(let x=0;x<N;x++)sq[x*x%N].push(x);
 const assert=(x,m)=>{if(!x)throw Error(m)},rot=(x,t)=>t?((x<<t)|(x>>>(N-t)))&ALL:x;
 let rng=7301;const rand=n=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng%n};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
 const zero=()=>Array(Q).fill(0),unit=j=>{const a=zero();a[j]=1;return a};
 const plus=(a,b)=>a.map((x,j)=>mod(x+b[j])),sub=(a,b)=>a.map((x,j)=>mod(x-b[j]));
 function symbolic(es){
  const roots=Array.from({length:N},(_,i)=>i),off=Array.from({length:N},zero),eq=[unit(0).concat(1)];
  for(const [c,p,j] of es){const a=roots[c],b=roots[p],v=sub(plus(off[p],unit(j)),off[c]);if(a===b){eq.push(v.concat(0));continue}for(let x=0;x<N;x++)if(roots[x]===a){roots[x]=b;off[x]=plus(off[x],v)}}
  let piv=[],row=0;for(let j=0;j<Q;j++){let i=eq.findIndex((a,i)=>i>=row&&a[j]);if(i<0)continue;[eq[row],eq[i]]=[eq[i],eq[row]];eq[row]=eq[row].map(x=>mod(x*iv[eq[row][j]]));for(let k=0;k<eq.length;k++)if(k!==row&&eq[k][j]){let f=eq[k][j];eq[k]=eq[k].map((x,z)=>mod(x-f*eq[row][z]))}piv.push(j);row++}
  if(eq.some(a=>a.slice(0,Q).every(x=>!x)&&a[Q]))return null;
  return {eq:eq.slice(0,row),piv,roots,off};
 }
 const padd=(a,b)=>Array.from({length:Math.max(a.length,b.length)},(_,i)=>mod((a[i]||0)+(b[i]||0)));
 const scale=(a,k)=>a.map(x=>mod(x*k));
 function mul(a,b){const o=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]=mod(o[i+j]+a[i]*b[j]);return o}
 function ev(a,t){let s=0;for(let i=a.length-1;i>=0;i--)s=mod(s*t+a[i]);return s}
 function prepare(g){
  const free=Array.from({length:Q},(_,i)=>i).filter(i=>!g.piv.includes(i)),d=free.length;
  const forms=Array.from({length:Q},(_,i)=>{const row=g.piv.indexOf(i);return row<0?[0,...free.map(j=>+(i===j))]:[g.eq[row][Q],...free.map(j=>mod(-g.eq[row][j]))]});
  const off=g.off.map(a=>Array.from({length:d+1},(_,i)=>mod(a.reduce((s,v,j)=>s+v*forms[j][i],0))));
  const groups=Array.from(new Set(g.roots)).map(r=>g.roots.map((x,i)=>x===r?i:-1).filter(x=>x>=0)).sort((a,b)=>b.length-a.length||a[0]-b[0]);
  assert(groups.length===3,"three components");const n=groups.map(x=>x.length);
  const centered=groups.map(group=>{const m=Array.from({length:d+1},(_,i)=>mod(iv[group.length]*group.reduce((s,x)=>s+off[x][i],0)));return group.map(x=>off[x].map((a,i)=>mod(a-m[i])))});
  const ratio=mod(-n[1]*iv[n[2]]),coef=mod(n[1]+n[2]*ratio*ratio);assert(coef,"nonzero coefficient");
  return {free,d,forms,off,groups,n,centered,ratio,coef};
 }
 const val=(a,x)=>mod(a[0]+x.reduce((s,v,i)=>s+v*a[i+1],0));
 function slice(p,prefix){
  const d=p.d,lin=a=>[val(a,prefix),d?a[d]:0];
  const centered=p.centered.map(g=>g.map(lin)),m2=[],m3=[];
  for(const g of centered){let b=[0,0,0],c=[0,0,0,0];for(const l of g){const q=mul(l,l);b=padd(b,q);c=padd(c,mul(q,l))}m2.push(b);m3.push(c)}
  const q=scale(m2.reduce(padd),-iv[p.coef]);
  const A=padd(scale(padd(m2[1],scale(m2[2],p.ratio)),3),scale(q,p.n[1]+p.n[2]*p.ratio**3));
  const B=m3.reduce(padd),R=padd(mul(B,B),scale(mul(q,mul(A,A)),-1));
  return {centered,q,A,B,R};
 }
 const norm=pi=>pi.map(x=>mod(x-pi[0])).join(",");
 function baseline(p,x){
  const offs=p.off.map(a=>val(a,x)),masks=p.groups.map(g=>g.reduce((m,i)=>m|(1<<offs[i]),0));
  if(masks.some((m,i)=>{let n=0;while(m){m&=m-1;n++}return n!==p.n[i]}))return null;
  const out=[];for(let t=0;t<N;t++){const b=rot(masks[1],t);if(b&masks[0])continue;for(let u=0;u<N;u++){const c=rot(masks[2],u);if(c&(b|masks[0]))continue;const pi=offs.slice();for(const i of p.groups[1])pi[i]=mod(pi[i]+t);for(const i of p.groups[2])pi[i]=mod(pi[i]+u);out.push(norm(pi))}}return out.sort();
 }
 function fast(p,s,t){
  const q=ev(s.q,t),A=ev(s.A,t),B=ev(s.B,t),r=ev(s.R,t);if(r)return {root:false,means:0,out:[]};
  const cand=A?[mod(-B*iv[A])]:B?[]:sq[q],out=[];let means=0;
  for(const v of cand){if(mod(v*v-q))continue;means++;const mu=[0,v,mod(p.ratio*v)],pi=Array(N),mask=[0];let valid=true;
   for(let j=0;j<3&&valid;j++)for(let i=0;i<p.groups[j].length;i++){const x=mod(ev(s.centered[j][i],t)+mu[j]),b=1<<x;if(mask[0]&b){valid=false;break}mask[0]|=b;pi[p.groups[j][i]]=x}
   if(valid){assert(mask[0]===ALL,"full cover");out.push(norm(pi))}
  }return {root:true,means,out:out.sort()};
 }
 // Original keys are fitted against all 47 complete p54 words and the carry prefix.
 // No p55 suffix or word is consulted unless a frozen action passes this fit.
 const dict=new Set();for(const line of dictText.split(/\r?\n/)){const m=/^([a-z]+) [0-9]+$/.exec(line);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function rec(i,w){if(i===s.length){dict.add(w);return}for(let l=1;l<=3&&i+l<=s.length;l++){const v=s.slice(i,i+l),j=l===3?(v==="ING"?21:-1):alpha.indexOf(v);if(j>=0)rec(i+l,w+SYM[j])}}rec(0,"")}
 for(const w of fixture.added.split(/\s+/))if(w)dict.add(w);assert(dict.size===38938,"dictionary");
 const prefixDict=new Set([...dict].filter(w=>w.length===11).map(w=>w.slice(0,10)));
 const body=src.p54.body_groups;assert(body.length===48&&body[47]==="63g2eis46q","source");
 function decode(c,pi,key,D){const ip=Array(N);pi.forEach((v,i)=>ip[v]=i);const out=new Set();function walk(i,j,w){if(i===c.length){if(D.has(w))out.add(w);return}const x=SYM.indexOf(c[i]);if(x===0)walk(i+1,j,w+"0");const p=ip[mod(pi[x]-key[j])];if(p)walk(i+1,(j+1)%Q,w+SYM[p])}for(let j=0;j<Q;j++)walk(0,j,"");return [...out].sort()}
 const actions=new Map();function score(piString,k){const id=piString+"|"+k.join(",");if(actions.has(id))return;const pi=piString.split(",").map(Number),carry=decode(body[47],pi,k,prefixDict);assert(carry.length,"original graph carry lost");let support=0;for(const c of body.slice(0,47))support+=+(decode(c,pi,k,dict).length>0);actions.set(id,{pi,k,support,carry})}
 function plant(target,seed){
  const pi=[0,...shuffle(Array.from({length:28},(_,i)=>i+1))],ip=Array(N);pi.forEach((v,i)=>ip[v]=i);const key=[1,...Array.from({length:7},()=>rand(N))];if(key.slice(0,4).every((x,i)=>x===key[i+4]))key[4]=mod(key[4]+1);
  const all=[];for(let p=1;p<N;p++)for(let j=0;j<Q;j++)all.push([ip[mod(pi[p]+key[j])],p,j]);shuffle(all);
  const roots=Array.from({length:N},(_,i)=>i),es=[];let comps=N;for(const e of all){const a=roots[e[0]],b=roots[e[1]];if(a===b)continue;es.push(e);for(let i=0;i<N;i++)if(roots[i]===a)roots[i]=b;if(--comps===3)break}assert(comps===3,"plant forest");
  let g=symbolic(es);for(const e of all){if(Q-g.piv.length===target)break;if(roots[e[0]]!==roots[e[1]])continue;const h=symbolic(es.concat([e]));assert(h,"plant graph");if(h.piv.length>g.piv.length){es.push(e);g=h}}
  assert(Q-g.piv.length===target,"plant dimension");return {symbolic:g,key,pi,seed,history:es};
 }
 const original=source.states;assert(original.length===32,"source state count");const plants=[];for(let i=0;i<12;i++)plants.push(plant([0,1,2,3,4,5,6,7,1,2,3,3][i],i));
 const results=[];
 function test(row,kind,index){
  const g=row.symbolic;assert(JSON.stringify(symbolic(row.history))===JSON.stringify(g),"edge replay");
  const p=prepare(g),d=p.d,stats={kind,index,d,prefixes:0,zeroPolynomial:0,nonzeroPolynomial:0,emptyNonzero:0,maxNonzeroRoots:0,assignments:0,primitive:0,collisionFree:0,resultantRoots:0,rootAndCollisionFree:0,means:0,exactKeys:0,placements:0,plantedRecovered:false};
  const prefixes=[];if(d<=3){const rec=a=>{if(a.length>=Math.max(0,d-1)){prefixes.push(a);return}for(let t=0;t<N;t++)rec(a.concat(t))};rec([])}else{const known=p.free.slice(0,-1).map(i=>row.key[i]),seen=new Set([known.join(",")]);prefixes.push(known);while(prefixes.length<64){const a=Array.from({length:d-1},()=>rand(N)),id=a.join(",");if(!seen.has(id)){seen.add(id);prefixes.push(a)}}}
  for(const pref of prefixes){stats.prefixes++;const s=slice(p,pref),nonzero=s.R.some(x=>x);if(nonzero)stats.nonzeroPolynomial++;else stats.zeroPolynomial++;let nroot=0;
   for(let t=0;t<(d?N:1);t++){const x=d?pref.concat(t):[],k=p.forms.map(a=>val(a,x));stats.assignments++;const F=fast(p,s,t);nroot+=+F.root;
    if(k.slice(0,4).every((v,j)=>v===k[j+4]))continue;stats.primitive++;const B=baseline(p,x);stats.collisionFree+=+(B!==null);stats.resultantRoots+=+F.root;stats.rootAndCollisionFree+=+(F.root&&B!==null);stats.means+=F.means;
    assert(JSON.stringify(F.out)===JSON.stringify(B||[]),"packing mismatch "+kind+" "+index+" "+x);
    if(F.out.length){stats.exactKeys++;stats.placements+=F.out.length;if(kind==="original")for(const pi of F.out)score(pi,k);else if(k.join(",")===row.key.join(",")&&F.out.includes(row.pi.join(",")))stats.plantedRecovered=true}
   }if(nonzero){assert(nroot<=6,"nonzero polynomial has >6 roots");stats.maxNonzeroRoots=Math.max(stats.maxNonzeroRoots,nroot);stats.emptyNonzero+=+(nroot===0)}
  }
  if(kind==="plant")assert(stats.plantedRecovered,"hidden planted action lost "+index);results.push(stats);
 }
 original.forEach((x,i)=>test(x,"original",i));plants.forEach((x,i)=>test(x,"plant",i));
 const fit=[...actions.values()].sort((a,b)=>b.support-a.support),qualifying=fit.filter(x=>x.support>=44);
 // Holdout only after the training candidate list has been frozen.
 const held=qualifying.map(a=>({pi:a.pi,k:a.k,support:a.support,carry:decode(body[47]+src.p55.groups[0],a.pi,a.k,dict),words:src.p55.groups.slice(1).map(c=>decode(c,a.pi,a.k,dict))}));
 const totals=kind=>{const arr=results.filter(x=>x.kind===kind);return Object.fromEntries(["prefixes","zeroPolynomial","nonzeroPolynomial","emptyNonzero","assignments","primitive","collisionFree","resultantRoots","rootAndCollisionFree","means","exactKeys","placements"].map(k=>[k,arr.reduce((s,x)=>s+x[k],0)]))};
 return {schema:"agent7-centered-third-moment-sft-v1",sourceCount:original.length,plantCount:plants.length,original:totals("original"),plants:totals("plant"),rows:results,actions:{distinct:fit.length,maxSupport:fit[0]?.support??null,qualifying:qualifying.length,top:fit.slice(0,10),held},scope:"Complete free assignments for d<=3; 64 sampled prefixes for each d>=4, all last-coordinate values; high-dimensional graph branches are not exhausted."};
}
const out=run(JSON.parse(fs.readFileSync("im-results/lp2-gp29-three-component-symbolic-states.json",'utf8')),fs.readFileSync("resources/control/english_wordfreq_textblob.txt",'utf8'),JSON.parse(fs.readFileSync("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json",'utf8')),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json",'utf8')));
console.log(JSON.stringify(out,null,2));
