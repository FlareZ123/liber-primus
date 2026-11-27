'use strict';
/**
 * Exact multi-crib inversion of the stationary GP29 literal-F-held
 * predecessor permutation law. No printed separator or language score.
 * Exhaustively index disjoint crib placements by compatible partial keys.
 * All source and original intervals are contained in one physical record.
 */
function run(gp,native,prior){
 const A=29,ALL=(1<<29)-1,NON=ALL&~1,mod=x=>(x+58)%29;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 assert(gp.runes.join()===native.runes.join(),"alphabet");
 const records=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text).map(c=>gp.runes.indexOf(c)).filter(x=>x>=0)}));
 const original=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>({page:p.page,c:p.indices}));
 assert(original.length===55&&original.reduce((s,x)=>s+x.c.length-1,0)===12901,"geometry");
 const k=new Int8Array(A),r=new Int8Array(A);
 function fit(P,j,C,i,L){
  k.fill(-1);r.fill(-1);let q=i===1?0:-1;
  for(let n=0;n<L;n++){
   const p=P[j+n],c=C[i+n];
   if(p===0){if(c!==0)return null;continue;}
   if(q>=0){
    const v=mod(p-c+C[i+n-1]);
    if(k[q]>=0&&k[q]!==v||r[v]>=0&&r[v]!==q)return null;
    k[q]=v;r[v]=q;
   }
   q=p;
  }
  return Array.from(k);
 }
 function prefixData(pages){
  const pref=pages.map(({c})=>{let d=[];for(let i=1;i<c.length&&c[i]!==0;i++)d.push(mod(c[i]-c[i-1]));return d;}).filter(d=>d.length);
  const init=Array.from({length:A},(_,k)=>k).filter(k=>pref.every(d=>mod(d[0]+k)!==0));
  return {pref,init};
 }
 function prefixK0(K,{pref,init}){
  let mask=0;
  for(const k0 of init){
   if(K[0]>=0&&K[0]!==k0||K.some((v,q)=>q!==0&&v===k0))continue;
   if(pref.every(d=>{let q=0;for(const x of d){const v=q===0?k0:K[q];if(v<0)return true;q=mod(x+v);if(q===0)return false;}return true;}))mask|=1<<k0;
  }
  return mask;
 }
 function merge(a,b){
  const K=a.slice(),rev=new Int8Array(A).fill(-1);
  for(let q=0;q<A;q++)if(K[q]>=0)rev[K[q]]=q;
  for(let q=0;q<A;q++)if(b[q]>=0){
   const v=b[q];if(K[q]>=0&&K[q]!==v||rev[v]>=0&&rev[v]!==q)return null;
   K[q]=v;rev[v]=q;
  }
  return K;
 }
 function rotate(mask,d){return ((mask<<d)|(mask>>>(A-d)))&ALL;}
 // Relaxed exact state reachability: each unspecified row may choose
 // any unused key value independently on every visit. This relaxation
 // contains every completion of the partial permutation. A completed K
 // makes the state DP exact, including both interpretations of C=F.
 function legality(C,K,anchors=[]){
  let free=ALL;for(const v of K)if(v>=0)free&=~(1<<v);
  let S=1;
  for(let i=1;i<C.length;i++){
   const d=mod(C[i]-C[i-1]),z=C[i]===0;
   let force=-1;for(const a of anchors)if(i>=a.i&&i<a.i+a.p.length){force=a.p[i-a.i];break;}
   let next=z&&force<=0?S:0;
   if(force!==0){
    let c=0,unknown=false;
    for(let x=S;x;){const bit=x&-x,q=31-Math.clz32(bit);x^=bit;const v=K[q];if(v<0)unknown=true;else c|=1<<mod(d+v);}
    if(unknown)c|=rotate(free,d);
    c&=NON;if(force>0)c&=1<<force;next|=c;
   }
   S=next;if(!S)return i;
  }
  return -1;
 }
 function restrict(pages,K,mask,hits,L){
  let valid=0;
  const byPage=new Map();
  for(const h of hits){const p=records[h.record].p.slice(h.j,h.j+L);if(!byPage.has(h.page))byPage.set(h.page,[]);byPage.get(h.page).push({i:h.i,p});}
  // Anchored pages first, then all independent other original frames.
  const order=[...pages.filter(p=>byPage.has(p.page)),...pages.filter(p=>!byPage.has(p.page))];
  for(let x=mask;x;){const bit=x&-x,k0=31-Math.clz32(bit);x^=bit;const fixed=K.slice();fixed[0]=k0;
   if(order.every(p=>legality(p.c,fixed,byPage.get(p.page)||[])<0))valid|=bit;
  }
  return valid;
 }
 function scan(pages,L){
  const prefix=prefixData(pages),hits=[];let pairs=0,raw=0;
  for(const {page,c} of pages)for(let i=1;i+L<=c.length;i++)for(let record=0;record<records.length;record++){
   const p=records[record].p;for(let j=0;j+L<=p.length;j++){
    pairs++;const K=fit(p,j,c,i,L);if(!K)continue;raw++;
    const mask=prefixK0(K,prefix);if(mask)hits.push({page,i,record,j,K,mask});
   }
  }
  return {pairs,raw,hits,prefix};
 }
 // Conflict index: for each (row,value), a compatible candidate either
 // uses neither coordinate, or uses exactly this row/value assignment.
 // Shared allowed initial K[0] must also be nonempty. The bitset filter
 // is equivalent to explicit pairwise partial-permutation merge.
 function index(hits,L){
  const N=hits.length,W=Math.ceil(N/32);
  const row=Array.from({length:A},()=>new Uint32Array(W)),val=Array.from({length:A},()=>new Uint32Array(W)),edge=Array.from({length:A*A},()=>new Uint32Array(W)),start=Array.from({length:A},()=>new Uint32Array(W));
  for(let i=0;i<N;i++){
   const w=i>>>5,b=1<<(i&31),h=hits[i];
   for(let q=0;q<A;q++)if(h.K[q]>=0){const k=h.K[q];row[q][w]|=b;val[k][w]|=b;edge[q*A+k][w]|=b;}
   for(let x=h.mask;x;){const bit=x&-x,q=31-Math.clz32(bit);x^=bit;start[q][w]|=b;}
  }
  const after=new Int32Array(N);let j=0,total=0;
  for(let i=0;i<N;i++){
   j=Math.max(j,i+1);
   while(j<N&&hits[j].page===hits[i].page&&hits[j].i<hits[i].i+L)j++;
   after[i]=j;total+=N-j;
  }
  const caches=new Map();
  function initialBits(mask){
   if(!caches.has(mask)){
    const arr=new Uint32Array(W);for(let x=mask;x;){const bit=x&-x,q=31-Math.clz32(bit);x^=bit;const src=start[q];for(let w=0;w<W;w++)arr[w]|=src[w];}
    caches.set(mask,arr);
   }
   return caches.get(mask);
  }
  function* compatible(K,mask,begin){
   if(!mask||begin>=N)return;
   const constraints=[];
   for(let q=0;q<A;q++)if(K[q]>=0){const k=K[q];constraints.push([row[q],val[k],edge[q*A+k]]);}
   const init=initialBits(mask);
   for(let w=begin>>>5;w<W;w++){
    let bits=init[w];if(w===(begin>>>5))bits&=0xffffffff<<(begin&31);
    for(let k=0;bits&&k<constraints.length;k++){const [a,b,e]=constraints[k];bits&=(~(a[w]|b[w])|e[w]);}
    while(bits){const bit=bits&-bits;bits^=bit;yield w*32+31-Math.clz32(bit);}
   }
  }
  return {after,total,compatible};
 }
 function publicHit(h){return {page:h.page,i:h.i,name:records[h.record].name,j:h.j};}
 function solve(pages,L,checkIndex=false){
  const {pairs,raw,hits,prefix}=scan(pages,L),idx=index(hits,L);
  let pairCompatible=0,pairPrefix=0,pairRelaxed=0,tripCompatible=0,tripPrefix=0,tripRelaxed=0;
  const viablePairs=[],viableTriples=[];
  let firstPrefixFailure=null;
  for(let a=0;a<hits.length;a++){
   const ha=hits[a],compatible=idx.compatible(ha.K,ha.mask,idx.after[a]);
   if(checkIndex){
    const explicit=[];for(let b=idx.after[a];b<hits.length;b++)if((ha.mask&hits[b].mask)&&merge(ha.K,hits[b].K))explicit.push(b);
    assert(JSON.stringify([...idx.compatible(ha.K,ha.mask,idx.after[a])])===JSON.stringify(explicit),"bitset merge equality");
   }
   for(const b of compatible){
    const hb=hits[b],K=merge(ha.K,hb.K);assert(K,"index soundness");pairCompatible++;
    const mask=prefixK0(K,prefix)&ha.mask&hb.mask;
    if(!mask){if(!firstPrefixFailure)firstPrefixFailure={a:publicHit(ha),b:publicHit(hb),K,sharedMask:ha.mask&hb.mask};continue;}
    pairPrefix++;
    const ok=restrict(pages,K,mask,[ha,hb],L);if(!ok)continue;
    pairRelaxed++;viablePairs.push({a:publicHit(ha),b:publicHit(hb),K,mask:ok});
    for(const c of idx.compatible(K,ok,idx.after[b])){
     const hc=hits[c],KK=merge(K,hc.K);assert(KK,"triple index");
     tripCompatible++;const mask3=prefixK0(KK,prefix)&ok&hc.mask;if(!mask3)continue;tripPrefix++;
     const valid=restrict(pages,KK,mask3,[ha,hb,hc],L);if(!valid)continue;
     tripRelaxed++;viableTriples.push({a:publicHit(ha),b:publicHit(hb),c:publicHit(hc),K:KK,mask:valid});
    }
   }
  }
  return {L,pairs,raw,singles:hits.length,disjointPairs:idx.total,pairCompatible,pairPrefix,pairRelaxed,tripCompatible,tripPrefix,tripRelaxed,firstPrefixFailure,viablePairs,viableTriples};
 }
 // Sender and index controls: three disjoint native 12-rune blocks,
 // one random common permutation, separate IVs. Hidden alignment scan.
 let seed=0x1343301;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;}
 function perm(){const K=Array.from({length:A},(_,i)=>i);for(let i=A-1;i>0;i--){const j=rand(i+1);[K[i],K[j]]=[K[j],K[i]];}return K;}
 function encode(P,K,iv){let q=0,c=[iv];for(const p of P){c.push(p===0?0:mod(c.at(-1)+p-K[q]));if(p)q=p;}return c;}
 const controls=[];
 for(let t=0;t<4;t++){
  const K=perm(),L=12,plant=[];
  for(let p=0;p<3;p++){
   const record=(t*2+p)%records.length,src=records[record],j=rand(src.p.length-L+1);
   plant.push({page:p,record,j,c:encode(src.p.slice(j,j+L),K,1+rand(28))});
  }
  const s=solve(plant,L,true);
  const witness=s.viableTriples.find(w=>[w.a,w.b,w.c].every((h,p)=>h.i===1&&h.name===records[plant[p].record].name&&h.j===plant[p].j));
  assert(witness&&witness.K.every((v,q)=>v<0||v===K[q])&&(witness.mask&(1<<K[0])),"true triple");
  const hold=records[(t*2+3)%records.length].p.slice(0,80),C=encode(hold,K,19);
  let q=0,pred=0;for(let i=1;i<C.length&&C[i]!==0&&witness.K[q]>=0;i++){q=mod(C[i]-C[i-1]+witness.K[q]);assert(q===hold[i-1],"frozen heldout");pred++;}
  // Different secret assignments to the same row cannot merge.
  const rival=witness.K.slice(),known=rival.findIndex(v=>v>=0);rival[known]=mod(rival[known]+1);assert(!merge(witness.K,rival),"conflicting key control");
  controls.push({plant:plant.map(p=>({name:records[p.record].name,j:p.j})),knownRows:witness.K.filter(x=>x>=0).length,pred,blindSingles:s.singles,blindPairs:s.pairRelaxed,blindTriples:s.tripRelaxed});
 }
 // Follow-up on the exact 16-rune single-seed unresolved domain. This
 // rejects only if every completion fails even the relaxed anchored DP.
 const priorGate=[];
 for(const h of prior.hits)for(const dom of h.domains)if(dom.status==="UNKNOWN"){
  const record=records.findIndex(s=>s.name===h.name),p=records[record].p.slice(h.j,h.j+16),K=h.rows.slice();K[0]=dom.k0;
  const failures=original.map(f=>({page:f.page,fail:legality(f.c,K,f.page===h.page?[{i:h.i,p}]:[])})).filter(x=>x.fail>=0);
  priorGate.push({page:h.page,i:h.i,name:h.name,j:h.j,k0:dom.k0,failures});
 }
 const L13=solve(original,13);
 const L12=solve(original,12);
 return {controls,priorGate,L13,L12};
}
if(typeof require!=='undefined'&&require.main===module){
 const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'),read('im-results/lp2-plainprev-fhold-native-crib-seed-output.json')),null,2));
}
