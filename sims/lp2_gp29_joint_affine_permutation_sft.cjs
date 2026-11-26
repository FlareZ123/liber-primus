'use strict';
// Exact affine all-different completion with jointly centered component means.
function run(source,dictText,fixture,src,options={}){
 const N=29,Q=8,ALL=(1<<N)-1,SYM="0123456789abcdefghijklmnopqrs",alpha=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const mod=x=>((x%N)+N)%N,inv=Array.from({length:N},(_,x)=>x?Array.from({length:N},(_,y)=>y).find(y=>x*y%N===1):0);
 const assert=(x,m)=>{if(!x)throw Error(m)},rot=(x,t)=>t?((x<<t)|(x>>>(N-t)))&ALL:x;
 const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
 let rng=0x462722;const rand=n=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
 const zero=()=>Array(Q).fill(0),unit=j=>{const a=zero();a[j]=1;return a};
 const plus=(a,b)=>a.map((x,j)=>mod(x+b[j])),sub=(a,b)=>a.map((x,j)=>mod(x-b[j]));
 const val=(a,x)=>mod(a[0]+x.reduce((s,v,i)=>s+v*a[i+1],0));
 const norm=pi=>pi.map(x=>mod(x-pi[0])).join(",");
 function symbolic(es){
  const roots=Array.from({length:N},(_,i)=>i),off=Array.from({length:N},zero),eq=[unit(0).concat(1)];
  for(const [c,p,j] of es){const a=roots[c],b=roots[p],v=sub(plus(off[p],unit(j)),off[c]);if(a===b){eq.push(v.concat(0));continue}for(let x=0;x<N;x++)if(roots[x]===a){roots[x]=b;off[x]=plus(off[x],v)}}
  const piv=[];let row=0;for(let j=0;j<Q;j++){let i=eq.findIndex((a,i)=>i>=row&&a[j]);if(i<0)continue;[eq[row],eq[i]]=[eq[i],eq[row]];eq[row]=eq[row].map(x=>mod(x*inv[eq[row][j]]));for(let k=0;k<eq.length;k++)if(k!==row&&eq[k][j]){let f=eq[k][j];eq[k]=eq[k].map((x,z)=>mod(x-f*eq[row][z]))}piv.push(j);row++}
  if(eq.some(a=>a.slice(0,Q).every(x=>!x)&&a[Q]))return null;
  return {eq:eq.slice(0,row),piv,roots,off};
 }
 function prepare(g){
  const free=Array.from({length:Q},(_,i)=>i).filter(i=>!g.piv.includes(i)),d=free.length;
  const key=Array.from({length:Q},(_,i)=>{const row=g.piv.indexOf(i);return row<0?[0,...free.map(j=>+(i===j))]:[g.eq[row][Q],...free.map(j=>mod(-g.eq[row][j]))]});
  const off=g.off.map(a=>Array.from({length:d+1},(_,i)=>mod(a.reduce((s,v,j)=>s+v*key[j][i],0))));
  const groups=Array.from(new Set(g.roots)).map(r=>g.roots.map((x,i)=>x===r?i:-1).filter(x=>x>=0)).sort((a,b)=>b.length-a.length||a[0]-b[0]);
  const c=groups.length;assert(c>=2&&c<=4,"component count");
  const n=groups.map(x=>x.length),m=d+c-2,forms=Array(N);
  groups.forEach((group,i)=>{
   const mean=Array.from({length:d+1},(_,j)=>mod(inv[n[i]]*group.reduce((s,x)=>s+off[x][j],0)));
   const extra=Array(c-2).fill(0);
   if(i>0&&i<c-1)extra[i-1]=1;
   if(i===c-1)for(let z=0;z<c-2;z++)extra[z]=mod(-n[z+1]*inv[n[i]]);
   for(const x of group)forms[x]=sub(off[x],mean).concat(extra);
  });
  const cons=[];let impossible=false;
  for(let i=0;i<N;i++)for(let j=0;j<i;j++){const a=sub(forms[i],forms[j]);if(a.slice(1).every(v=>!v)){if(!a[0])impossible=true;}else cons.push(a);}
  return {free,d,c,m,key,off,groups,n,forms,cons,impossible};
 }
 function buckets(p){
  const {m,cons}=p,maps=Array.from({length:m},()=>new Map());
  for(const a of cons)for(let j=0;j<m;j++)if(a[j+1]){
   const b=inv[a[j+1]],s=a.slice(1).map((v,k)=>k===j?0:mod(-v*b)),tag=s.join(","),mask=1<<mod(-a[0]*b);
   let q=maps[j].get(tag);if(!q){let support=1<<j;for(let k=0;k<m;k++)if(s[k])support|=1<<k;q={s,mask:0,support};maps[j].set(tag,q)}q.mask|=mask;
  }
  const all=maps.map(x=>[...x.values()]);
  if(all.some(a=>a.some(q=>q.mask===ALL)))return {impossible:true};
  // Exact subset-DP for the static worst-case rotation count. The weight for
  // placing j last in a subset is independent of the earlier variable order.
  const M=1<<m,dp=Array(M).fill(Infinity),last=Array(M).fill(-1);dp[0]=0;
  for(let b=1;b<M;b++){const w=N**(pop(b)-1);for(let j=0;j<m;j++)if(b&(1<<j)){const prev=b^(1<<j),count=all[j].reduce((s,q)=>s+ +((q.support&~b)===0),0),score=dp[prev]+w*count;if(score<dp[b]){dp[b]=score;last[b]=j}}}
  const order=[];for(let b=M-1;b;){const j=last[b];order.unshift(j);b^=1<<j}
  let b=0;const groups=order.map(j=>{b|=1<<j;return all[j].filter(q=>(q.support&~b)===0).map(q=>({a:order.slice(0,pop(b)-1).map(i=>q.s[i]),mask:q.mask}))});
  return {order,groups,cost:dp[M-1],impossible:false};
 }
 function solve(p,limit,leafLimit,emit,fix=null){
  const started=Date.now(),x=Array(p.m).fill(0),y=Array(p.m).fill(0);
  // Optionally freeze all key coordinates for small independent packing tests.
  if(fix){assert(fix.length===p.d,"fixed key dimension")}
  const b=buckets(p),stats={nodes:0,rotations:0,zeroMasks:0,leaves:0,primitiveLeaves:0,exhausted:true,order:b.order??[],buckets:b.groups?.map(g=>g.length)??[],staticCost:b.cost??0,ms:0};
  if(p.impossible||b.impossible){stats.ms=Date.now()-started;return stats}
  function dfs(j){
   if(!stats.exhausted)return;
   if(j===p.m){
    stats.leaves++;
    const k=p.key.map(a=>val(a,x.slice(0,p.d)));
    if(k.slice(0,4).every((v,i)=>v===k[i+4]))return;
    stats.primitiveLeaves++;
    const pi=p.forms.map(a=>val(a,x));
    assert(new Set(pi).size===N,"invalid full permutation");
    emit(norm(pi),k);
    if(stats.primitiveLeaves>=leafLimit)stats.exhausted=false;
    return;
   }
   stats.nodes++;
   if(stats.rotations>=limit||stats.nodes>=limit){stats.exhausted=false;return;}
   let forbidden=0;
   for(const q of b.groups[j]){let t=0;for(let i=0;i<j;i++)t+=q.a[i]*y[i];forbidden|=rot(q.mask,t%N);stats.rotations++;if(forbidden===ALL)break;}
   let mask=ALL&~forbidden;
   const coord=b.order[j];if(fix&&coord<p.d)mask&=1<<fix[coord];
   if(!mask){stats.zeroMasks++;return;}
   while(mask&&stats.exhausted){const bit=mask&-mask,v=31-Math.clz32(bit);mask^=bit;x[coord]=v;y[j]=v;dfs(j+1)}
  }
  dfs(0);stats.ms=Date.now()-started;return stats;
 }
 // Independent baseline: raw offsets, anchor the first component at
 // translation zero, and search disjoint cyclic masks without moment centering.
 function brute(p,kparams){
  const k=p.key.map(a=>val(a,kparams));if(k.slice(0,4).every((v,i)=>v===k[i+4]))return [];
  const offsets=p.off.map(a=>val(a,kparams)),masks=p.groups.map(g=>g.reduce((s,i)=>s|(1<<offsets[i]),0));
  if(masks.some((x,i)=>pop(x)!==p.n[i]))return [];
  const out=[],t=Array(p.c).fill(0);
  function dfs(j,used){if(j===p.c){assert(used===ALL,"coverage");const pi=offsets.slice();p.groups.forEach((g,i)=>{for(const x of g)pi[x]=mod(pi[x]+t[i])});out.push(norm(pi)+"|"+k.join(","));return}for(let x=0;x<N;x++){const b=rot(masks[j],x);if(b&used)continue;t[j]=x;dfs(j+1,used|b)}}
  dfs(1,masks[0]);return out.sort();
 }
 function plant(d,c){
  const pi=[0,...shuffle(Array.from({length:28},(_,i)=>i+1))],ip=Array(N);pi.forEach((v,i)=>ip[v]=i);const key=[1,...Array.from({length:7},()=>rand(N))];if(key.slice(0,4).every((x,i)=>x===key[i+4]))key[4]=mod(key[4]+1);
  const all=[];for(let p=1;p<N;p++)for(let j=0;j<Q;j++)all.push([ip[mod(pi[p]+key[j])],p,j]);shuffle(all);
  const roots=Array.from({length:N},(_,i)=>i),es=[];let comps=N;
  for(const e of all){const a=roots[e[0]],b=roots[e[1]];if(a===b)continue;es.push(e);for(let i=0;i<N;i++)if(roots[i]===a)roots[i]=b;if(--comps===c)break}
  assert(comps===c,"plant forest");
  let g=symbolic(es);for(const e of all){if(Q-g.piv.length===d)break;if(roots[e[0]]!==roots[e[1]])continue;const h=symbolic(es.concat([e]));assert(h,"plant graph");if(h.piv.length>g.piv.length){es.push(e);g=h}}
  assert(Q-g.piv.length===d,"plant dimension");return {g,key,pi};
 }
 const dict=new Set();
 for(const line of dictText.split(/\r?\n/)){const m=/^([a-z]+) [0-9]+$/.exec(line);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function rec(i,w){if(i===s.length){dict.add(w);return}for(let l=1;l<=3&&i+l<=s.length;l++){const v=s.slice(i,i+l),j=l===3?(v==="ING"?21:-1):alpha.indexOf(v);if(j>=0)rec(i+l,w+SYM[j])}}rec(0,"")}
 for(const w of fixture.added.split(/\s+/))if(w)dict.add(w);assert(dict.size===38938,"dictionary");
 const body=src.p54.body_groups;assert(body.length===48&&body[47]==="63g2eis46q"&&body.slice(0,47).join("").length===213,"source");
 const prefixDict=new Set([...dict].filter(w=>w.length===11).map(w=>w.slice(0,10)));
 function decode(c,pi,key,D){const ip=Array(N);pi.forEach((v,i)=>ip[v]=i);const out=new Set();function walk(i,j,w){if(i===c.length){if(D.has(w))out.add(w);return}const x=SYM.indexOf(c[i]);if(x===0)walk(i+1,j,w+"0");const p=ip[mod(pi[x]-key[j])];if(p)walk(i+1,(j+1)%Q,w+SYM[p])}for(let j=0;j<Q;j++)walk(0,j,"");return [...out].sort()}
 const actions=new Map();
 function score(piString,k){
  const id=piString+"|"+k.join(",");if(actions.has(id))return;
  const pi=piString.split(",").map(Number),carry=decode(body[47],pi,k,prefixDict);assert(carry.length,"original carry lost");
  let support=0;for(const c of body.slice(0,47))support+=+(decode(c,pi,k,dict).length>0);actions.set(id,{pi,k,support,carry});
 }
 const controls=[],rows=[];let fixedTests=0,bruteFull=0;
 function compareFixed(p,params){const a=[],b=brute(p,params);const s=solve(p,Infinity,Infinity,(pi,k)=>a.push(pi+"|"+k.join(",")),params);assert(s.exhausted&&JSON.stringify(a.sort())===JSON.stringify(b),"fixed packing mismatch");fixedTests++;return b}
 if(options.controls!==false)for(let c=3;c<=4;c++)for(let d=0;d<=3;d++)for(let rep=0;rep<2;rep++){
  const row=plant(d,c),p=prepare(row.g),known=p.free.map(j=>row.key[j]),truth=row.pi.join(",")+"|"+row.key.join(",");
  assert(compareFixed(p,known).includes(truth),"lost true plant");for(let i=0;i<10;i++)compareFixed(p,Array.from({length:d},()=>rand(N)));
  const got=[];const stats=solve(p,Infinity,Infinity,(pi,k)=>got.push(pi+"|"+k.join(",")));
  const expected=[];function enumerate(x){if(x.length===d){expected.push(...brute(p,x));return}for(let v=0;v<N;v++)enumerate(x.concat(v))}enumerate([]);
  assert(stats.exhausted&&JSON.stringify(got.sort())===JSON.stringify(expected.sort()),"full plant set mismatch");assert(got.includes(truth),"true joint action lost");bruteFull++;
  controls.push({d,c,n:p.n,solutions:got.length,stats});
 }
 const ids=options.ids??source.states.map((_,i)=>i);
 for(const index of ids){
  const row=source.states[index];assert(JSON.stringify(symbolic(row.history))===JSON.stringify(row.symbolic),"original edge replay");
  let g=row.symbolic;
  if(options.components===4){for(let i=row.history.length-1;i>=0;i--){const v=symbolic(row.history.slice(0,i));if(new Set(v.roots).size===4){g=v;break}}assert(new Set(g.roots).size===4,"missing four-component prefix")}
  const p=prepare(g),known=p.free.map(j=>row.key[j]);
  compareFixed(p,known);for(let i=0;i<10;i++)compareFixed(p,Array.from({length:p.d},()=>rand(N)));
  const stats=solve(p,options.limit??2000000,options.leafLimit??10000,score);
  if(p.d<=2&&stats.exhausted){const expected=[];function enumerate(x){if(x.length===p.d){expected.push(...brute(p,x));return}for(let v=0;v<N;v++)enumerate(x.concat(v))}enumerate([]);assert(expected.length===stats.primitiveLeaves,"original low-d count mismatch");bruteFull++}
  rows.push({index,d:p.d,c:p.c,n:p.n,carry:row.carry,stats});
 }
 const fit=[...actions.values()].sort((a,b)=>b.support-a.support),qualifying=fit.filter(x=>x.support>=44);
 const held=qualifying.map(a=>({pi:a.pi,k:a.k,support:a.support,carry:decode(body[47]+src.p55.groups[0],a.pi,a.k,dict),words:src.p55.groups.slice(1).map(c=>decode(c,a.pi,a.k,dict))}));
 return {schema:"agent46-joint-affine-permutation-v1",scope:"Original graph branches only, not canonical carry seeds. All joint key/translation solutions emitted only where exhausted=true. Four-component graph states are strict prefixes of the frozen histories. No p55 unless >=44/47 original p54 groups supported.",fixedTests,bruteFull,controls,rows,actions:{distinct:fit.length,maxSupport:fit[0]?.support??null,qualifying:qualifying.length,top:fit.slice(0,10),held}};
}
const fs=require('node:fs');
const paths=["im-results/lp2-gp29-three-component-symbolic-states.json","resources/control/english_wordfreq_textblob.txt","im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json","resources/liber-primus/lp2-page-groups-54-55-derived.json"];
const raw=paths.map(p=>fs.readFileSync(p,'utf8'));
const args=process.argv[2]?JSON.parse(process.argv[2]):{};
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw[1],JSON.parse(raw[2]),JSON.parse(raw[3]),args),null,2));
