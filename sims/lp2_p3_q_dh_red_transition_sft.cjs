'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const signed=fs.readFileSync(path.join(ROOT,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const DH=Object.freeze({p:23,g:5,a:6,A:8,b:15,B:19,K:2});
const core=new Set([DH.p,DH.g,DH.a,DH.A,DH.b,DH.B,DH.K]);
const mod=x=>((x%MOD)+MOD)%MOD;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const ev=a=>{let z=[0,0],p=[1,0];for(const c of a){z=[mod(z[0]+c*p[0]),mod(z[1]+c*p[1])];p=mul(p,[0,1]);}return z;};
const span=(page,start,length)=>{const pr=ink.pages.find(x=>x.page===page);assert(pr);const s=(pr.red_spans||[]).find(x=>x.start===start&&x.length===length);assert(s);return [...s.runes].map(r=>{const v=runeIndex.get(r);assert.notEqual(v,undefined);return v;});};
const body=signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const words=body.match(/\b[A-Za-z]+\b/g).filter(w=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(w)).map(w=>w.toUpperCase());
assert.equal(words.length,43);

const Q=[17,24];
const dlog=new Map();let state=[1,0];
for(let k=0;k<840;k++){dlog.set(state.join(','),k);state=mul(state,Q);}
assert.deepEqual(state,[1,0]);

const printed=[];
for(const pr of ink.pages)for(const s of (pr.red_spans||[])){
  const residue=ev([...s.runes].map(r=>runeIndex.get(r)));
  if(residue[0]===0&&residue[1]===0){printed.push({page:pr.page,start:s.start,length:s.length,residue,zero:true});continue;}
  const k=dlog.get(residue.join(','));assert.notEqual(k,undefined);
  printed.push({page:pr.page,start:s.start,length:s.length,residue,k,coord:[Math.floor(k/29),k%29]});
}
const nonzero=printed.filter(x=>!x.zero);

const p40=nonzero.find(x=>x.page===40&&x.start===0);assert(p40);
const p23=nonzero.find(x=>x.page===23&&x.start===0);assert(p23);
assert.deepEqual(p40.coord,[DH.g,DH.A]);
assert.equal(p40.k,29*DH.g+DH.A);
assert.equal(p23.k,p40.k+DH.K);
assert.deepEqual(p23.coord,[DH.g,DH.A+DH.K]);

let qK=[1,0];for(let i=0;i<DH.K;i++)qK=mul(qK,Q);
assert.deepEqual(mul(p40.residue,qK),p23.residue);

const sourceInterval=(a,b)=>words.slice(a,b+1).join(' ');
assert.equal(sourceInterval(...p40.coord),'EPIPHANY SEEKS THE DEVOTED');
assert.equal(sourceInterval(...p23.coord),'EPIPHANY SEEKS THE DEVOTED LIBER PRIMUS');
assert.equal(p23.page,DH.p);

const typedCoordinateSources=nonzero.filter(x=>core.has(x.coord[0])&&core.has(x.coord[1]));
assert.deepEqual(typedCoordinateSources.map(x=>[x.page,x.start,x.coord]),[[40,0,[DH.g,DH.A]]]);

const dhStepEdges=[];
for(const from of nonzero)for(const to of nonzero){
  if(from===to)continue;
  const delta=(to.k-from.k+840)%840;
  for(const [name,value] of Object.entries(DH)){
    if(delta===value)dhStepEdges.push({from:[from.page,from.start,from.coord],to:[to.page,to.start,to.coord],step:[name,value]});
  }
}
assert.deepEqual(dhStepEdges,[
  {from:[0,0,[8,26]],to:[27,0,[9,5]],step:['A',8]},
  {from:[40,0,[5,8]],to:[23,0,[5,10]],step:['K',2]},
]);

const fullyTypedEdges=dhStepEdges.filter(edge=>{
  const fromCoord=edge.from[2],toPage=edge.to[0];
  return core.has(fromCoord[0])&&core.has(fromCoord[1])&&core.has(toPage);
});
assert.deepEqual(fullyTypedEdges,[dhStepEdges[1]]);

const result={
  schema:'lp2-p3-q-dh-red-transition-v1',
  classification:'post-discovery finite red-span transition cross-lock; no unknown plaintext',
  DH,
  p40:{...p40,sourceInterval:sourceInterval(...p40.coord),typedCoordinate:'[g,A]'},
  transition:{step:'K',amount:DH.K,qPower:qK,destination:p23,sourceInterval:sourceInterval(...p23.coord),destinationPageTyped:'p'},
  finiteControls:{
    nonzeroPrintedRedSpans:nonzero.length,
    typedCoordinateSources:typedCoordinateSources.map(x=>({page:x.page,start:x.start,coord:x.coord})),
    allDhStepEdges:dhStepEdges,
    fullyTypedEdges,
  },
  interpretation:'The unique printed nonzero red span whose Q-discrete-log base29 coordinate is entirely authenticated DH state is p40: [g,A]=[5,8]. Advancing the primitive Q path by the independently recovered shared secret K=2 lands exactly on the printed p23 red span at [g,A+K]=[5,10], and the destination page number is p=23. Numerically this extends the source interval EPIPHANY SEEKS THE DEVOTED by LIBER PRIMUS.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
