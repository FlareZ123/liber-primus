"use strict";
function main(){
  "use strict";
  const p=29, full=(1<<p)-1;
  const mod=x=>((x%p)+p)%p;
  const pop=x=>{let n=0;while(x){x&=x-1;n++;}return n};
  const rot=(x,t)=>((x<<t)|(x>>>(p-t)))&full;
  const bit=x=>1<<x;
  const fac=k=>{let x=1n;for(let i=2;i<=k;i++)x*=BigInt(i);return x};
  let state=0x22f1c6b7;
  function rng(n){state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n)}
  function perm(n){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){let j=rng(i+1);[a[i],a[j]]=[a[j],a[i]];}return a}
  const mask=a=>a.reduce((s,i)=>s|bit(i),0);
  function domains(used,shapes){
    return shapes.map(m=>Array.from({length:p},(_,t)=>({t,m:rot(m,t)})).filter(x=>!(x.m&used)));
  }
  // Independent direct reference, chooses minimum current domain.
  function direct(used,shapes){
    const d=domains(used,shapes), out=[],a=Array(d.length).fill(-1);let nodes=0, probes=0;
    function dfs(u,left){nodes++;if(!left.length){out.push(a.join(","));return}
      let best=null,idx=-1;
      for(let i of left){const v=d[i].filter(x=>{probes++;return !(x.m&u)});if(!v.length)return;if(best===null||v.length<best.length){best=v;idx=i}}
      for(let x of best){a[idx]=x.t;dfs(u|x.m,left.filter(i=>i!==idx))}
    }
    dfs(used,d.map((_,i)=>i));return {out:out.sort(),nodes,probes};
  }
  // Exact meet-in-middle over occupied sets. Retain distinct labeled assignments
  // to a shared occupancy; never reduce masks to one representative.
  function mitm(used,shapes){
    const d=domains(used,shapes),k=d.length,free=full^used;
    let nodes=0,probes=0;
    if(!k)return {out:free?[]:[""],nodes:1,probes,split:[0,0],stored:0};
    if(d.some(v=>!v.length))return {out:[],nodes,probes,split:[0,0],stored:0};
    // Choose split minimizing upper bound on half enumeration work.
    let best=Infinity,l=[],r=[];
    for(let b=1;b<(1<<k);b++){if(k>1&&b===(1<<k)-1)continue;
      let x=[],y=[],w=1,z=1;
      for(let i=0;i<k;i++){if(b&bit(i)){x.push(i);w*=d[i].length}else{y.push(i);z*=d[i].length}}
      if(w+z<best){best=w+z;l=x;r=y}
    }
    l.sort((a,b)=>d[a].length-d[b].length);r.sort((a,b)=>d[a].length-d[b].length);
    const rows=new Map(),out=[],a=Array(k).fill(-1);
    function walk(list,pos,u,emit){nodes++;if(pos===list.length){emit(u);return}
      let i=list[pos];for(let x of d[i]){probes++;if(!(x.m&u)){a[i]=x.t;walk(list,pos+1,u|x.m,emit)}}}
    walk(l,0,0,u=>{const row=l.map(i=>a[i]);if(!rows.has(u))rows.set(u,[]);rows.get(u).push(row)});
    walk(r,0,0,u=>{const rowsL=rows.get(free^u);if(!rowsL)return;
      for(let row of rowsL){for(let j=0;j<l.length;j++)a[l[j]]=row[j];out.push(a.join(","))}
    });
    return {out:out.sort(),nodes,probes,split:[l.length,r.length],stored:[...rows.values()].reduce((s,x)=>s+x.length,0)};
  }
  // Independently verify first k moment equations on every actual packing.
  function moments(m,k){const a=Array(k).fill(0);for(let i=0;i<p;i++)if(m&bit(i)){let z=1;for(let j=0;j<k;j++){z=z*i%p;a[j]=mod(a[j]+z)}}return a}
  function checkMoments(used,shapes,solutions){const k=shapes.length,expected=moments(full^used,k);
    for(let ss of solutions){let t=ss.split(",").map(Number),actual=Array(k).fill(0);for(let i=0;i<k;i++){let m=moments(rot(shapes[i],t[i]),k);for(let j=0;j<k;j++)actual[j]=mod(actual[j]+m[j])}
      if(actual.some((x,i)=>x!==expected[i]))throw Error("moment equation failed")
    }
  }
  const summary=[];
  for(let k=2;k<=6;k++){
    const s={k,cases:0,positive:0,exactPlacements:0,largest:0,directNodes:0,mitmNodes:0,directProbes:0,mitmProbes:0,mitmFewerProbes:0,mitmMoreProbes:0,maxStored:0};
    for(let q=0;q<240;q++){
      // Random partitions and independent shapes, with half of cases planted.
      const n=Math.min(28,k+rng(15)),pvec=perm(p),free=pvec.slice(0,n),used=full^mask(free);
      const cuts=perm(n-1).slice(0,k-1).map(x=>x+1).sort((a,b)=>a-b),ends=[0,...cuts,n];
      const shapes=[],planted=[];
      for(let i=0;i<k;i++){
        const t=rng(p),part=free.slice(ends[i],ends[i+1]);planted.push(t);
        shapes.push(q%2===0?rot(mask(part),mod(-t)):mask(perm(p).slice(0,part.length)))
      }
      const a=direct(used,shapes),b=mitm(used,shapes);
      if(a.out.length!==b.out.length||a.out.some((x,i)=>x!==b.out[i]))throw Error("packing disagreement");
      if(q%2===0&&!a.out.includes(planted.join(",")))throw Error("planted solution lost");
      if(BigInt(a.out.length)>fac(k))throw Error("factorial bound contradicted");
      checkMoments(used,shapes,a.out);
      s.cases++;s.positive+=+!!a.out.length;s.exactPlacements+=a.out.length;s.largest=Math.max(s.largest,a.out.length);
      s.directNodes+=a.nodes;s.mitmNodes+=b.nodes;s.directProbes+=a.probes;s.mitmProbes+=b.probes;s.mitmFewerProbes+=+(b.probes<a.probes);s.mitmMoreProbes+=+(b.probes>a.probes);s.maxStored=Math.max(s.maxStored,b.stored)
    }
    summary.push(s)
  }
  // Extreme singleton residual: every labeled assignment is a packing.
  const tight=[];for(let k=2;k<=7;k++){
    const used=full^mask(Array.from({length:k},(_,i)=>i*3)),shapes=Array(k).fill(1);
    const b=mitm(used,shapes);if(BigInt(b.out.length)!==fac(k))throw Error("singleton factorial tightness failed");
    tight.push({k,solutions:b.out.length,mitmNodes:b.nodes})
  }
  function* partitions(n,max=n,a=[]){if(n===0){yield a;return}for(let i=Math.min(n,max);i>=1;i--)yield* partitions(n-i,i,[...a,i])}
  const rows=Array.from({length:8},(_,d)=>({d,partitions:0,oldEligible:0,newEligible:0,newOnly:0,maxOldOverNew:"0"}));
  let total=0;
  for(let sz of partitions(p)){
    total++;let f=p-sz[0],old=1n;for(let i=1;i<sz.length;i++){old*=BigInt(f);f-=sz[i]}
    const k=sz.length-1,newBound=old<fac(k)?old:fac(k);
    for(let d=0;d<8;d++){let a=old*BigInt(p)**BigInt(d),b=newBound*BigInt(p)**BigInt(d),row=rows[d];row.partitions++;if(a<=8192n)row.oldEligible++;if(b<=8192n)row.newEligible++;if(a>8192n&&b<=8192n)row.newOnly++;
      if(a/b>BigInt(row.maxOldOverNew))row.maxOldOverNew=(a/b).toString()
    }
  }
  return {p,summary,tight,totalPartitions:total,packingThreshold:8192,boundComparison:rows,scope:"Synthetic cyclic-shape controls and all integer partitions of 29; no LP2 key search, no runtime speedup inferred from probes."}
}
if(require.main===module) console.log(JSON.stringify(main(),null,2));
module.exports={main};
