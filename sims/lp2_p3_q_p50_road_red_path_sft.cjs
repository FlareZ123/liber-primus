'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/base60-grid.json'),'utf8'));
const signed=fs.readFileSync(path.join(ROOT,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%MOD)+MOD)%MOD;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const ev=a=>{let z=[0,0],p=[1,0];for(const c of a){z=[mod(z[0]+c*p[0]),mod(z[1]+c*p[1])];p=mul(p,[0,1]);}return z;};
const Q=[17,24],DH={p:23,g:5,A:8,K:2};
const body=signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const words=body.match(/\b[A-Za-z]+\b/g).filter(w=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(w)).map(w=>w.toUpperCase());
assert.equal(words.length,43);
const dlog=new Map();let state=[1,0];
for(let k=0;k<840;k++){dlog.set(state.join(','),k);state=mul(state,Q);}
assert.deepEqual(state,[1,0]);

const red=[];
for(const pr of ink.pages)for(const sp of(pr.red_spans||[])){
 const residue=ev([...sp.runes].map(r=>runeIndex.get(r)));
 if(residue[0]===0&&residue[1]===0)continue;
 const k=dlog.get(residue.join(','));assert.notEqual(k,undefined);
 red.push({page:pr.page,start:sp.start,length:sp.length,residue,k,coord:[Math.floor(k/29),k%29]});
}
assert.equal(red.length,17);

const tokens=grid.rows.flat(),a60=grid.alphabet,a59=a60.replace('f','');
const value=(token,alphabet,radix)=>radix*alphabet.indexOf(token[0])+alphabet.indexOf(token[1]);
function edgeCensus(radix,alphabet){
 const hits=[];
 for(const from of red){
   const address=from.coord[1],token=tokens[address],step=value(token,alphabet,radix);
   for(const to of red){
     if(from===to)continue;
     if((to.k-from.k+840)%840===step)hits.push({from,to,address,token,step});
   }
 }
 return hits;
}
const base60=edgeCensus(60,a60),base59=edgeCensus(59,a59);
assert.equal(base60.length,1);
assert.equal(base59.length,0);
const edge=base60[0];
assert.deepEqual([edge.from.page,edge.from.start,edge.from.k,edge.from.coord],[39,119,516,[17,23]]);
assert.deepEqual([edge.to.page,edge.to.start,edge.to.k,edge.to.coord],[7,194,603,[20,23]]);
assert.equal(edge.address,23);
assert.equal(words[23],'ROAD');
assert.equal(edge.token,'1R');
assert.equal(edge.step,87);
assert.equal(87,3*29);
assert.equal(value(edge.token,a59,59),86);

const nextK=(edge.to.k+edge.step)%840;
assert.equal(nextK,690);
const nextCoord=[Math.floor(nextK/29),nextK%29];
assert.deepEqual(nextCoord,[23,23]);
assert.deepEqual(nextCoord.map(i=>words[i]),['ROAD','ROAD']);

const p40=red.find(x=>x.page===40&&x.start===0),p23=red.find(x=>x.page===23&&x.start===0);
assert(p40&&p23);
assert.deepEqual(p40.coord,[DH.g,DH.A]);
assert.equal((p23.k-p40.k+840)%840,DH.K);
assert.equal(p23.page,DH.p);

const result={
 schema:'lp2-p3-q-p50-road-red-path-v1',
 classification:'post-discovery exact red-state/p50 path edge with radix discrimination; no unknown plaintext',
 model:'For each printed nonzero red span, take Q-discrete-log coordinate [row,col], read p50[col] as a step, and advance the Q exponent by that value.',
 finiteControls:{printedNonzeroRedSpans:red.length,orderedCandidateEdges:red.length*(red.length-1),base60Hits:base60.length,base59Hits:base59.length},
 uniqueEdge:{
   from:{page:39,k:edge.from.k,coord:edge.from.coord,endpointWords:edge.from.coord.map(i=>words[i])},
   address:{cell:edge.address,word:words[edge.address],token:edge.token,base60:edge.step,base59:value(edge.token,a59,59)},
   to:{page:7,k:edge.to.k,coord:edge.to.coord,endpointWords:edge.to.coord.map(i=>words[i])},
 },
 continuation:{repeatRoadStepFromP7:{k:nextK,coord:nextCoord,words:nextCoord.map(i=>words[i]),interpretation:'diagonal ROAD/ROAD numerically selects signed index23 / physical p23 as a candidate stop'}},
 independentP23Crosslock:{p40Coord:p40.coord,p40Typed:'[g,A]',step:'K=2',p23RedCoord:p23.coord,p23Page:'p=23'},
 interpretation:'The endpoint-number-as-p50-address rule has exactly one printed-red transition under canonical base60: p39 -> p7 through ROAD23 -> 87 = 3*29. Base59 has none. Repeating the same ROAD step reaches [23,23]=ROAD/ROAD; separately the DH-typed p40 [g,A] state advances by K to the actual p23 red state on physical p=23. This makes p23 a convergent Q-path node, while the diagonal-to-page interpretation remains a hypothesis.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
