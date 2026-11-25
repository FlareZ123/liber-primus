"use strict";
/** Exact period-13 common cyclic GP29 predecessor-feedback capacity. Node 22 CommonJS. */
function experiment(gp,refs) {
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const sum=a=>a.reduce((s,x)=>s+x,0);
  const mod=(x,n)=>(x%n+n)%n;
  const rng=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const shuffle=(n,r)=>{const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  /** @param {string} text @returns {number[]} */
  function encode(text) {
    const sym=gp.translit.map((name,index)=>({name,index})).sort((a,b)=>b.name.length-a.name.length);
    const clean=text.replace(/^#.*$/gm," ").toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
    return (clean.match(/[A-Z]+/g)||[]).flatMap(w=>{const a=[];for(let i=0;i<w.length;){let h=sym.find(x=>w.startsWith(x.name,i));check(h,"Unmapped GP word "+w);a.push(h.index);i+=h.name.length}return a});
  }
  function minimumWindow(a,w,e) {
    let c=0,m=Infinity,o=-1;
    for(let i=0;i<a.length;i++){c+=+(a[i]===e);if(i>=w)c-=+(a[i-w]===e);if(i>=w-1&&c<m){m=c;o=i-w+1}}
    return {nativeRunes:a.length,windows:a.length-w+1,minimumE:m,offset:o};
  }
  /** @param {number[][]} pages @param {number} q @param {boolean} local @param {number} n */
  function matrices(pages,q,local,n=29) {
    const A=Array.from({length:q},()=>Array.from({length:n},()=>new Int32Array(n)));
    let off=0;
    for(const x of pages){for(let j=1;j<x.length;j++)A[(local?j:off+j)%q][x[j-1]][x[j]]++;off+=x.length}
    return A;
  }
  /** Exact max assignment plus a feasible integer dual; forbidSelf imposes a derangement. */
  function hungarian(A,forbidSelf) {
    const n=A.length,u=new Int32Array(n+1),v=new Int32Array(n+1),p=new Int32Array(n+1),way=new Int32Array(n+1);
    const penalty=1+sum(A.map(row=>sum(row)));
    const cost=(i,j)=>forbidSelf&&i===j?penalty:-A[i][j];
    for(let i=1;i<=n;i++){
      p[0]=i;let j0=0;const minv=new Int32Array(n+1).fill(1e9),used=new Uint8Array(n+1);
      do{
        used[j0]=1;const i0=p[j0];let delta=1e9,j1=0;
        for(let j=1;j<=n;j++)if(!used[j]){const cur=cost(i0-1,j-1)-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}
        for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;
        j0=j1;
      }while(p[j0]!==0);
      do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0);
    }
    const perm=new Int32Array(n);for(let j=1;j<=n;j++)perm[p[j]-1]=j-1;
    const opt=sum(Array.from(perm,(j,i)=>A[i][j]));
    const rc=A.map((row,i)=>Int32Array.from(row,(_,j)=>cost(i,j)-u[i+1]-v[j+1]));
    check(!rc.some(r=>r.some(x=>x<0))&&!perm.some((j,i)=>rc[i][j]!==0||(forbidSelf&&j===i)),"Invalid assignment dual");
    return {opt,perm,rc};
  }
  /** Exhaustively enumerate all Hamiltonian permutations within D of relaxed assignment optimum. */
  function enumerate(rc,D,visit) {
    const n=rc.length,all=(1<<n)-1,nxt=new Int32Array(n).fill(-1);
    let nodes=0,leaves=0;
    const masks=Array.from({length:n},(_,i)=>Array.from({length:D+1},(_,d)=>rc[i].reduce((s,v,j)=>i!==j&&v<=d?s|(1<<j):s,0)));
    const pc=x=>{let n=0;while(x){x&=x-1;n++}return n};
    function rec(rows,cols,budget) {
      nodes++;
      if(rows===0){leaves++;visit(nxt);return}
      let chosen=-1,choice=0,best=n+1,minsum=0;
      for(let rb=rows;rb;rb&=rb-1){
        const i=31-Math.clz32(rb&-rb),m=masks[i][budget]&cols;
        if(!m)return;
        let min=0;while(min<=budget&&!(masks[i][min]&cols))min++;
        minsum+=min;if(minsum>budget)return;
        const count=pc(m);if(count<best){best=count;chosen=i;choice=m}
      }
      for(let cb=choice;cb;cb&=cb-1){
        const j=31-Math.clz32(cb&-cb);let v=j;
        while(nxt[v]!==-1&&v!==chosen)v=nxt[v];
        if(v===chosen&&rows!==(1<<chosen))continue;
        nxt[chosen]=j;
        rec(rows^(1<<chosen),cols^(1<<j),budget-rc[chosen][j]);
        nxt[chosen]=-1;
      }
    }
    rec(all,all,D);
    return {nodes,leaves};
  }
  /** Prime n: normalize the generator by its unique power sending 0 to 1. */
  function canonical(nxt) {
    const n=nxt.length,order=[0];
    while(order.length<n)order.push(nxt[order.at(-1)]);
    check(new Set(order).size===n&&nxt[order.at(-1)]===0,"Not Hamiltonian");
    const k=order.indexOf(1);return Array.from({length:n},(_,i)=>order[i*k%n]);
  }
  function score(A,order) {
    const n=order.length,ext=order.concat(order),shifts=[];let total=0;
    for(const a of A){
      let best=-1,bk=0;
      for(let k=0;k<n;k++){let v=0;for(let j=0;j<n;j++)v+=a[order[j]][ext[j+k]];if(v>best){best=v;bk=k}}
      total+=best;shifts.push(bk);
    }
    return {sum:total,shifts};
  }
  function commonBound(A,free,target) {
    const H=A.map(a=>hungarian(a,true)),diag=A.map(a=>sum(a.map((row,i)=>row[i]))),M=H.map((h,i)=>Math.max(h.opt,diag[i]));
    const relaxed=sum(M)+free,D=relaxed-target;
    if(D<0)return {relaxed,upper:relaxed};
    const threshold=Math.floor(D/A.length);
    check(H.every((h,i)=>h.opt===M[i]&&M[i]-diag[i]>threshold),"Identity can be an anchor; this instance requires a different certificate");
    let best=-1,bestOrder=null,bestShifts=null;const seen=new Set(),counts=[];
    for(let i=0;i<A.length;i++){
      counts.push(enumerate(H[i].rc,threshold,nxt=>{
        const order=canonical(nxt),key=String.fromCharCode(...order);
        if(seen.has(key))return;
        seen.add(key);
        const z=score(A,order);
        if(z.sum>best){best=z.sum;bestOrder=order;bestShifts=z.shifts}
      }));
    }
    const nonAnchor=relaxed-A.length*(threshold+1),anchorMax=best<0?null:best+free;
    return {diag,M,relaxed,D,threshold,counts,uniqueSubgroups:seen.size,anchorMax,nonAnchor,upper:Math.max(anchorMax??-Infinity,nonAnchor),bestOrder,bestShifts};
  }
  function permutations(a,visit,i=0) {
    if(i===a.length){visit(a);return}
    for(let j=i;j<a.length;j++){[a[i],a[j]]=[a[j],a[i]];permutations(a,visit,i+1);[a[i],a[j]]=[a[j],a[i]]}
  }
  // Independent exhaustive check of dual optima, enumeration and complete bound.
  let toyCases=0,toyCycles=0,toyBounds=0;
  const rand=rng(0x3301);
  for(const n of [5,7])for(let trial=0;trial<12;trial++){
    const A=Array.from({length:3},()=>Array.from({length:n},(_,i)=>Int32Array.from({length:n},(_,j)=>i===j?0:1+Math.floor(rand()*9))));
    const brute=[];
    permutations(Array.from({length:n-1},(_,i)=>i+1),a=>{const order=[0,...a],nxt=new Int32Array(n);order.forEach((v,i)=>nxt[v]=order[(i+1)%n]);brute.push(Array.from(nxt))});
    for(const a of A){
      const H=hungarian(a,true);let best=-1;
      permutations(Array.from({length:n},(_,i)=>i),p=>{if(!p.some((j,i)=>j===i))best=Math.max(best,sum(p.map((j,i)=>a[i][j])))});
      check(best===H.opt,"Assignment differs from brute force");
      const D=2,expected=new Set(brute.filter(p=>sum(p.map((j,i)=>a[i][j]))>=best-D).map(p=>p.join(","))),actual=new Set();
      enumerate(H.rc,D,p=>actual.add(Array.from(p).join(",")));
      check(actual.size===expected.size&&[...expected].every(k=>actual.has(k)),"Cycle enumeration differs from brute force");
      toyCycles+=actual.size;toyCases++;
    }
    const maxTrue=Math.max(...brute.map(p=>score(A,canonical(p)).sum));
    const relaxed=sum(A.map(a=>hungarian(a,true).opt)),target=relaxed-3;
    const z=commonBound(A,0,target);
    check(z.upper>=maxTrue,"Incorrect complete upper bound");
    if(z.upper<target)check(maxTrue<target,"False exclusion");
    toyBounds++;
  }
  const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
  const n=sum(pages.map(p=>p.length)),free=pages.length,e=gp.translit.indexOf("E");
  check(n===12956&&free===55&&e===18,"Original inputs differ");
  const native=refs.map(encode),minimum=native.map(a=>minimumWindow(a,n,e)),floor=Math.min(...minimum.map(z=>z.minimumE));
  check(floor===1397,"Unexpected finite literary floor");
  const twoSided=[];
  for(const q of [11,12])for(const local of [false,true]){
    const A=matrices(pages,q,local);
    twoSided.push({q,local,upper:free+sum(A.map(a=>hungarian(a,false).opt))});
  }
  check(twoSided.every(z=>z.upper<floor),"Period 11/12 gate changed");
  const original=[false,true].map(local=>({local,...commonBound(matrices(pages,13,local),free,floor)}));
  check(original[0].upper===1391&&original[1].upper===1395&&original.every(z=>z.upper<floor),"Original q13 gate changed");
  // Source-sized reversible native controls, independent random phase bijections.
  // Known keys are supplied to the decoder: this is not blind key recovery.
  const plants=[];
  for(let i=0;i<native.length;i++){
    const r=rng([3301,20161125,133331][i]),local=i===1,order=shuffle(29,r),inv=new Int32Array(29);
    order.forEach((v,j)=>inv[v]=j);
    const H=Array.from({length:13},()=>shuffle(29,r)),Hi=H.map(p=>{let a=[];p.forEach((v,j)=>a[v]=j);return a});
    const plain=native[i].slice(10000,10000+n),encrypted=[],decoded=[];let off=0;
    for(const pg of pages){
      const P=plain.slice(off,off+pg.length),C=[order[P[0]]],R=[inv[C[0]]];
      for(let j=1;j<P.length;j++){
        const t=(local?j:off+j)%13;
        C.push(order[(inv[C[j-1]]+H[t][P[j]])%29]);
        R.push(Hi[t][mod(inv[C[j]]-inv[C[j-1]],29)]);
      }
      encrypted.push(C);decoded.push(...R);off+=P.length;
    }
    check(decoded.every((v,j)=>v===plain[j])&&decoded.length===n,"Native inverse mismatch");
    const A=matrices(encrypted,13,local),trueE=plain.filter(x=>x===e).length;
    const diag=A.map(a=>sum(a.map((row,j)=>row[j])));
    const relaxed=free+sum(A.map((a,j)=>Math.max(hungarian(a,true).opt,diag[j])));
    const trueGroupMax=free+score(A,order).sum;
    check(trueE<=trueGroupMax&&trueGroupMax<=relaxed,"Native capacity witness fails");
    plants.push({source:i,local,recovered:decoded.length,trueE,trueGroupMax,relaxed});
  }
  return {n,free,minimum,floor,twoSided,original,toy:{assignmentAndEnumerationCases:toyCases,enumeratedCycles:toyCycles,fullBoundCases:toyBounds},plants};
}
if(require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");
 const read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
 console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),paths.slice(1).map(read)),null,2));
}
module.exports={experiment};
