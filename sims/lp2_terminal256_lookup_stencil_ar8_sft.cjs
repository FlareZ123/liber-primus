"use strict";
// Original-input exact GF29 codebook + local stencil + plaintext AR(8) gate.
// Run: node sims/lp2_terminal256_lookup_stencil_ar8_sft.cjs
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
function run(corpus,grid) {
  const p56=corpus.pages.find(p=>p.page===56).indices,p57=corpus.pages.find(p=>p.page===57).indices;
  const mod=x=>(x%29+29)%29,primes=[];
  for(let n=2;primes.length<84;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
  let clock=0;const plain=p56.map((c,i)=>i===56?c:mod(c-primes[clock++]+1));
  let tick=0;const replay=plain.map((p,i)=>i===56?p:mod(p+primes[tick++]-1));
  if(clock!==84||p56[56]!==0||p56.length!==85||p57.length!==95||replay.some((c,i)=>c!==p56[i])||plain.map(i=>corpus.translit[i]).join("")!=="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE")throw Error("native p56 regression");
  const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const neighbors=([r,c])=>dirs.map(([dr,dc])=>grid[r+dr][c+dc]%29);
  const inner=Array.from({length:30},(_,r)=>Array.from({length:6},(_,c)=>[r+1,c+1])).flat();
  function ring(k){const t=k,b=31-k,l=k,r=7-k,a=[];for(let c=l;c<=r;c++)a.push([t,c]);for(let row=t+1;row<=b;row++)a.push([row,r]);for(let c=r-1;c>=l;c--)a.push([b,c]);for(let row=b-1;row>t;row--)a.push([row,l]);return a}
  function variants(k){const a=ring(k),corners=[[k,k],[k,7-k],[31-k,7-k],[31-k,k]],n=a.length;return corners.flatMap(([r,c])=>{const j=a.findIndex(x=>x[0]===r&&x[1]===c);return [1,-1].map(s=>Array.from({length:n},(_,i)=>a[(j+s*i+n)%n]))})}
  const routes=[{name:"row-major",coords:inner}],v=[1,2,3].map(variants);
  for(let i=0;i<8;i++)for(let j=0;j<8;j++)for(let k=0;k<8;k++)routes.push({name:`${i},${j},${k}`,coords:v[0][i].concat(v[1][j],v[2][k])});
  const featAt=(coords,p,i)=>neighbors(coords[i]).concat(Array.from({length:8},(_,j)=>p[i-j-1]??0));
  function solve(coords,p,{reset=false,trainEnd=p.length,byteMap=x=>x}={}){
    const basis=Array(16).fill(null),first=new Map();let rank=0,eq=0,bad=0,firstBad=null;
    for(let i=8;i<trainEnd;i++){
      if(reset&&i>=85&&i<93)continue;
      const [r,c]=coords[i],byte=byteMap(grid[r][c]),feat=featAt(coords,p,i),prev=first.get(byte);
      if(!prev){first.set(byte,{feat,y:p[i],i});continue}
      eq++;const row=feat.map((x,j)=>mod(x-prev.feat[j])).concat(mod(p[i]-prev.y));let added=false;
      for(let j=0;j<16;j++){if(!row[j])continue;if(basis[j]){const a=row[j];for(let k=j;k<=16;k++)row[k]=mod(row[k]-a*basis[j][k])}else{const inv=Array.from({length:28},(_,i)=>i+1).find(x=>mod(x*row[j])===1);for(let k=j;k<=16;k++)row[k]=mod(row[k]*inv);basis[j]=row;rank++;added=true;break}}
      if(!added&&row[16]){bad++;if(firstBad===null)firstBad={i,prior:prev.i,byte,residue:row[16],rank}}
    }
    let weights=null,lookup=null;
    if(!bad&&rank===16){weights=Array(16).fill(0);for(let j=15;j>=0;j--)weights[j]=mod(basis[j][16]-weights.slice(j+1).reduce((s,x,k)=>s+x*basis[j][j+1+k],0));lookup=new Map([...first].map(([byte,{feat,y}])=>[byte,mod(y-feat.reduce((s,x,j)=>s+x*weights[j],0))]))}
    return {rank,eq,bad,firstBad,weights,lookup}
  }
  const result=[];
  for(const [register,p] of [["solved",plain.concat(p57)],["printed",p56.concat(p57)]])for(const reset of [false,true]){
    let exact=0,minBad=Infinity,maxPrefix=0,minRank=16,maxRank=0,rowMajor=null,best=[];
    for(const route of routes){
      const s=solve(route.coords,p,{reset});if(!s.bad)exact++;
      if(s.bad<minBad){minBad=s.bad;best=[route.name]}else if(s.bad===minBad)best.push(route.name);
      maxPrefix=Math.max(maxPrefix,s.firstBad?.i??180);minRank=Math.min(minRank,s.rank);maxRank=Math.max(maxRank,s.rank);
      if(route.name==="row-major")rowMajor={...s,lookup:undefined}
    }
    result.push({register,reset,exact,minBad,best,maxPrefix,minRank,maxRank,rowMajor})
  }
  const weights=[3,11,7,2,19,5,13,23,17,6,4,21,9,1,15,12];
  let seed=0xa54ff53a;const draw=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%29};
  const table=Array.from({length:256},draw);
  function plant(byteMap){const planted=[];for(let i=0;i<180;i++){const [r,c]=inner[i],f=featAt(inner,planted,i);planted.push(mod(table[byteMap(grid[r][c])]+f.reduce((s,x,j)=>s+x*weights[j],0)))}return planted}
  const planted=plant(x=>x),ctl=solve(inner,planted);
  function heldout(modulus){
    const residue=x=>x%modulus,p2=plant(residue),fit=solve(inner,p2,{trainEnd:120,byteMap:residue});
    const decoded=p2.slice(0,120);let firstUnseen=null;
    if(fit.weights&&fit.lookup)for(let i=120;i<180;i++){const [r,c]=inner[i],d=fit.lookup.get(residue(grid[r][c]));if(d===undefined){firstUnseen={i,residue:residue(grid[r][c])};break}decoded.push(mod(d+featAt(inner,decoded,i).reduce((s,x,j)=>s+x*fit.weights[j],0)))}
    return {modulus,rank:fit.rank,bad:fit.bad,weightsRecovered:JSON.stringify(fit.weights)===JSON.stringify(weights),lookupEntries:fit.lookup?.size,heldoutRecovered:decoded.slice(120).filter((x,i)=>x===p2[120+i]).length,heldoutProduced:decoded.length-120,firstUnseen}
  }
  const outer=Array.from({length:32},(_,r)=>Array.from({length:8},(_,c)=>[r,c])).flat().filter(([r,c])=>r===0||r===31||c===0||c===7);
  const fullPositive={rank:ctl.rank,bad:ctl.bad,eq:ctl.eq,weightsRecovered:JSON.stringify(ctl.weights)===JSON.stringify(weights),lookupRecovered:ctl.lookup&&[...ctl.lookup].every(([x,y])=>y===table[x]),lookupEntries:ctl.lookup?.size,outerUnobserved:outer.filter(([r,c])=>!ctl.lookup?.has(grid[r][c])).length};
  return {clock,p56F:p56[56],routes:routes.length,result,fullPositive,heldoutPositive:[heldout(29),heldout(23)]}
}
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const result=run(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/base60-grid.json").byte_rows);
assert.equal(result.routes,513);
assert.deepEqual(result.result.map(x=>x.exact),[0,0,0,0]);
assert.deepEqual(result.result.map(x=>x.minBad),[27,23,26,23]);
assert.equal(result.fullPositive.weightsRecovered,true);
assert.equal(result.fullPositive.lookupRecovered,true);
assert.deepEqual(result.heldoutPositive.map(x=>x.heldoutRecovered),[15,60]);
assert.ok(result.heldoutPositive.every(x=>x.heldoutRecovered===x.heldoutProduced&&x.weightsRecovered));
console.log(JSON.stringify(result,null,2));
