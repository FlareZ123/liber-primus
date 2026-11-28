"use strict";
// Agent39, issue #3323. Run from repository with Node.js 22.
const fs = require("node:fs");
const path = require("node:path");
function experiment(grid,corpus){
  const mod=x=>((x%29)+29)%29;
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const inv=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw Error("zero inverse")};
  const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
  const primes=[];for(let n=2;primes.length<84;n++)if(!Array.from({length:Math.floor(Math.sqrt(n))-1},(_,i)=>i+2).some(d=>n%d===0))primes.push(n);
  let clock=0;
  const p56=corpus.pages[56].indices.map((v,i)=>i===56?0:mod(v-primes[clock++]+1));
  const p57=corpus.pages[57].indices, known=p56.concat(p57);
  assert(clock===84 && p56.map(i=>corpus.translit[i]).join("")==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","authentic p56");
  assert(known.length===180&&corpus.pages[55].indices.length===76,"page sizes");
  const tokens=grid.pages.flatMap(p=>p.tokens);
  assert(tokens.length===256,"grid size");
  const cells=tokens.map((t,i)=>({i,r:Math.floor(i/8),c:i%8,t})).map(o=>({...o,s:2*(o.r%2)+o.c%2,inner:o.r>0&&o.r<31&&o.c>0&&o.c<7}));
  const inner=cells.filter(o=>o.inner),rim=cells.filter(o=>!o.inner);
  assert(inner.length===180&&rim.length===76,"geometry");
  const mon=o=>[1,mod(o.r),o.c,mod(o.r*o.r),mod(o.r*o.c),mod(o.c*o.c)];
  const feat=(o,x)=>[...mon(o).map(v=>mod(v*x)),...mon(o)];
  /** Exact row reduction, retaining a solution when consistent. */
  function solve(A,y){
    const n=A[0].length, a=A.map((row,i)=>[...row,mod(y[i])]),p=[];
    for(let j=0;j<n;j++){
      let k=p.length;while(k<a.length&&!a[k][j])k++;if(k===a.length)continue;
      const r=p.length;[a[r],a[k]]=[a[k],a[r]];const f=inv(a[r][j]);a[r]=a[r].map(v=>mod(v*f));
      for(let l=0;l<a.length;l++)if(l!==r&&a[l][j]){const f=a[l][j];a[l]=a[l].map((v,h)=>mod(v-f*a[r][h]));}
      p.push(j);
    }
    const bad=a.slice(p.length).filter(row=>row[n]!==0).length;
    const w=Array(n).fill(0);p.forEach((j,i)=>w[j]=a[i][n]);
    return {rank:p.length,augRank:p.length+(bad?1:0),bad,w,errors:A.reduce((s,row,i)=>s+(dot(row,w)!==y[i]),0)};
  }
  const results=[];
  for(const radix of [59,60]){
    const alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
    const val=o=>{const a=alphabet.indexOf(o.t[0]),b=alphabet.indexOf(o.t[1]);assert(a>=0&&b>=0,"token");return mod(a*radix+b)};
    for(const reflect of [false,true]){
      const order=reflect?Array.from({length:30},(_,r)=>inner.slice(r*6,r*6+6).reverse()).flat():inner;
      const records=order.map((o,j)=>({...o,x:val(o),y:known[j]}));
      const classes=[];
      for(let s=0;s<4;s++){
        const z=records.filter(o=>o.s===s);
        const fit=solve(z.map(o=>feat(o,o.x)),z.map(o=>o.y));
        const groups=new Map();
        for(const o of z){if(!groups.has(o.t))groups.set(o.t,[]);groups.get(o.t).push(o);}
        let ceiling=0,witness=null;
        for(const group of groups.values()){
          const counts=new Map();for(const o of group)counts.set(o.y,(counts.get(o.y)||0)+1);
          ceiling+=Math.max(...counts.values());
          if(!witness&&counts.size>1){const a=group[0],b=group.find(o=>o.y!==a.y);witness=[a,b].map(o=>({row:o.r+1,col:o.c+1,token:o.t,y:o.y}));}
        }
        classes.push({s,n:z.length,rank:fit.rank,augRank:fit.augRank,errors:fit.errors,lookupCeiling:ceiling,witness});
      }
      assert(classes.some(a=>a.augRank>a.rank),"original compatibility unexpectedly survives");
      results.push({radix,reflect,classes});
    }
  }
  const plant=[];
  for(const reflect of [false,true]){
    const order=reflect?Array.from({length:30},(_,r)=>inner.slice(r*6,r*6+6).reverse()).flat():inner;
    const rimOrder=reflect?rim.slice().sort((a,b)=>a.r-b.r||b.c-a.c):rim;
    const yByI=new Map([...order.map((o,j)=>[o.i,known[j]]),...rimOrder.map((o,j)=>[o.i,p57[j]])]);
    const key=Array.from({length:4},(_,s)=>{const k=s+1;return [2*k,0,0,k,4*k,4*k,7+s,3+s,5+s,2+s,6+s,9+s].map(mod)});
    const synthetic=cells.map(o=>{const w=key[o.s],a=dot(mon(o),w.slice(0,6)),b=dot(mon(o),w.slice(6));assert(a!==0,"noninvertible plant");return {...o,y:yByI.get(o.i),x:mod((yByI.get(o.i)-b)*inv(a))}});
    const fitted=Array.from({length:4},(_,s)=>{const z=synthetic.filter(o=>o.inner&&o.s===s);return solve(z.map(o=>feat(o,o.x)),z.map(o=>o.y))});
    assert(fitted.every((f,s)=>f.rank===12&&f.augRank===12&&f.w.every((v,i)=>v===key[s][i])),"plant recovery");
    const held=synthetic.filter(o=>!o.inner).filter(o=>dot(feat(o,o.x),fitted[o.s].w)===o.y).length;
    const replay=synthetic.filter(o=>{const w=fitted[o.s].w,a=dot(mon(o),w.slice(0,6)),b=dot(mon(o),w.slice(6));return mod((o.y-b)*inv(a))===o.x}).length;
    assert(held===76&&replay===256,"plant holdout/replay");
    plant.push({reflect,rank:fitted.map(f=>f.rank),held,replay,coefficients:key});
  }
  return {model:"4 parity classes; P=A_s(r,c)*T+B_s(r,c) mod29, both A,B total degree <=2",results,plant};
}
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-grid-256.json"),read("resources/liber-primus/lp2-corpus.json")),null,2));
