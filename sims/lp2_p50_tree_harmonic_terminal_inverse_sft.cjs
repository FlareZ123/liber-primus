"use strict";
const fs = require("node:fs");
const path = require("node:path");
function experiment(grid,corp){
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const mod=x=>((x%29)+29)%29;
  const inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero inverse")};
  const alphabet=grid.alphabet.replace("f","");
  const ptr=grid.rows.flat().map(s=>59*alphabet.indexOf(s[0])+alphabet.indexOf(s[1]));
  const ch=Array.from({length:256},()=>[]), addr=Array.from({length:256},(_,i)=>i);
  assert(ptr.length===256&&ptr.every(x=>x>=0&&x<256),"table");
  ptr.forEach((p,i)=>{if(i!==p)ch[p].push(i)});
  const roots=addr.filter(i=>ptr[i]===i),root=roots[0],pre=[],post=[];
  function dfs(v){pre.push(v);ch[v].forEach(dfs);post.push(v)}
  assert(roots.length===1&&root===189,"root");dfs(root);
  assert(new Set(pre).size===256,"convergence");
  const leaves=addr.filter(v=>!ch[v].length),internal=addr.filter(v=>ch[v].length),idx=new Map(internal.map((v,i)=>[v,i]));
  assert(leaves.length===95&&internal.length===161,"partition");
  const adj=v=>ch[v].concat(v===root?[]:[ptr[v]]);
  function rref(matrix,n){
    const a=matrix.map(row=>row.map(mod));let p=0;const cols=[];
    for(let j=0;j<n;j++){
      let i=a.findIndex((x,k)=>k>=p&&x[j]);if(i<0)continue;
      [a[p],a[i]]=[a[i],a[p]];let d=inv(a[p][j]);a[p]=a[p].map(x=>mod(x*d));
      for(let k=0;k<a.length;k++){if(k===p||!a[k][j])continue;let m=a[k][j];for(let l=j;l<a[k].length;l++)a[k][l]=mod(a[k][l]-m*a[p][l])}
      cols.push(j);p++;
    }return {a,cols,rank:p};
  }
  const A=internal.map((v,i)=>{const a=Array(internal.length).fill(0);a[i]=adj(v).length;for(const w of adj(v))if(idx.has(w))a[idx.get(w)]--;return a});
  const n=internal.length;
  const ai=rref(A.map((a,i)=>a.concat(addr.slice(0,n).map(j=>+(i===j)))),n);
  assert(ai.rank===n,"Dirichlet uniqueness");const inverse=ai.a.map(a=>a.slice(n));
  const p55=corp.pages[55].indices,p56=corp.pages[56].indices,p57=corp.pages[57].indices;
  assert(p55.length===76&&p56.length===85&&p57.length===95,"terminal pages");
  const prime=[];for(let v=2;prime.length<84;v++)if(prime.every(p=>p*p>v||v%p))prime.push(v);
  let cursor=0;const known=p56.map((c,i)=>i===56?0:mod(c-(prime[cursor++]-1)));
  assert(cursor===84&&p56[56]===0&&known.filter(x=>x===0).length===1,"F bypass");
  assert(known.map(x=>corp.translit[x]).join("")==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","known p56");
  const knownKey=prime.map(p=>mod(p-1));
  const leafOrders={address:leaves,dfs:pre.filter(v=>!ch[v].length)};
  const internalOrders={address:internal,pre:pre.filter(v=>idx.has(v)),post:post.filter(v=>idx.has(v))};
  const orient=(a,b)=>b?[...a].reverse():[...a];
  const results=[];
  let syntheticChecks=0;
  for(const [ln,lo] of Object.entries(leafOrders))for(const lr of [false,true]){
    const l=orient(lo,lr),boundary=Array(256).fill(null);l.forEach((v,i)=>boundary[v]=p57[i]);
    const rhs=internal.map(v=>adj(v).filter(w=>!idx.has(w)).reduce((s,w)=>s+boundary[w],0));
    const x=boundary.slice();internal.forEach((v,i)=>x[v]=mod(inverse[i].reduce((s,a,j)=>s+a*rhs[j],0)));
    assert(internal.every(v=>mod(adj(v).length*x[v]-adj(v).reduce((s,w)=>s+x[w],0))===0),"harmonic replay");
    for(const [on,oo] of Object.entries(internalOrders))for(const ir of [false,true]){
      const order=orient(oo,ir);
      for(const role of ["plain85","key84"]){
        const o=role==="key84"?order.filter(v=>v!==root):order;
        const target=role==="key84"?knownKey:known;
        const matches=target.reduce((s,t,i)=>s+(t===x[o[i+76]]),0);
        const p55candidate=o.slice(0,76).map((v,i)=>role==="key84"?mod(p55[i]-x[v]):x[v]);
        // All-secret, stationary affine relation at nonroot internal nodes:
        // a*center+b*parent+c*sum(children)+d*childCount+e=0.
        // Excludes any nonzero parameter vector if rank=5.
        const obs=boundary.slice();target.forEach((v,i)=>obs[o[i+76]]=v);
        const stencil=internal.filter(v=>v!==root&&[v,ptr[v],...ch[v]].every(w=>obs[w]!==null));
        const rows=stencil.map(v=>[obs[v],obs[ptr[v]],mod(ch[v].reduce((s,w)=>s+obs[w],0)),ch[v].length,1]);
        const rank=rref(rows,5).rank;
        // Mechanical positive: use the genuinely computed harmonic field as planted truth,
        // reveal only the same target locations, and verify the inverse and stencil.
        const planted=o.slice(76).map(v=>x[v]),plantObs=boundary.slice();planted.forEach((v,i)=>plantObs[o[i+76]]=v);
        assert(stencil.every(v=>mod((ch[v].length+1)*plantObs[v]-plantObs[ptr[v]]-ch[v].reduce((s,w)=>s+plantObs[w],0))===0),"plant stencil");
        assert(planted.length===target.length&&o.slice(0,76).length===76,"complete receiver");
        syntheticChecks++;
        results.push({ln,lr,on,ir,role,matches,denom:target.length,rank,fullyKnownStencils:rows.length,decoded:p55candidate.map(v=>corp.translit[v]).join("")});
      }
    }
  }
  const stats={root,leaves:leaves.length,internal:n,dirichletRank:ai.rank,syntheticChecks,roles:{}};
  for(const role of ["plain85","key84"]){const a=results.filter(x=>x.role===role).sort((a,b)=>b.matches-a.matches);stats.roles[role]={n:a.length,max:a[0],matchRange:[Math.min(...a.map(x=>x.matches)),a[0].matches],exact:a.filter(x=>x.matches===x.denom).length,allSecretRankCounts:Array.from({length:6},(_,k)=>a.filter(x=>x.rank===k).length),stencilRange:[Math.min(...a.map(x=>x.fullyKnownStencils)),Math.max(...a.map(x=>x.fullyKnownStencils))]}}
  return {stats,results};
}
const base=path.join(__dirname,"..","resources","liber-primus");
const read=n=>JSON.parse(fs.readFileSync(path.join(base,n),"utf8"));
console.log(JSON.stringify(experiment(read("base60-grid.json"),read("lp2-corpus.json")),null,2));
