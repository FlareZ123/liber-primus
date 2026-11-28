'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;

const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const signed=fs.readFileSync(path.join(ROOT,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%MOD)+MOD)%MOD;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const ev=a=>{let z=[0,0],p=[1,0];for(const c of a){z=[mod(z[0]+c*p[0]),mod(z[1]+c*p[1])];p=mul(p,[0,1]);}return z;};
const Q=[17,24];

const words=signed.split('-----BEGIN PGP SIGNATURE-----')[0].match(/\b[A-Za-z]+\b/g)
 .filter(w=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(w)).map(w=>w.toUpperCase());
assert.equal(words.length,43);

const dlog=new Map();let state=[1,0];
for(let k=0;k<840;k++){dlog.set(state.join(','),k);state=mul(state,Q);}
assert.deepEqual(state,[1,0]);

const red=[];
for(const pr of ink.pages)for(const sp of(pr.red_spans||[])){
 const residue=ev([...sp.runes].map(r=>runeIndex.get(r)));
 if(residue[0]===0&&residue[1]===0)continue;
 const k=dlog.get(residue.join(','));assert.notEqual(k,undefined);
 red.push({page:pr.page,start:sp.start,length:sp.length,k});
}
assert.equal(red.length,17);
const uniqueRed=[...new Map(red.map(r=>[r.k,r])).values()];
assert.equal(uniqueRed.length,16);

const tokens=grid.pages.flatMap(p=>p.tokens),a60=grid.alphabet,a59=a60.replace('f','');
const value=(token,alphabet,radix)=>{
 const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
 return hi<0||lo<0?null:radix*hi+lo;
};

function analyze(radix,alphabet){
 const steps=Array.from({length:MOD},(_,i)=>value(tokens[i],alphabet,radix));
 assert(steps.every(Number.isInteger));
 const next=k=>(k+steps[k%MOD])%840;
 const cycleId=new Array(840).fill(null),onCycle=new Array(840).fill(false),distance=new Array(840).fill(null),cycles=[];
 for(let start=0;start<840;start++){
   if(cycleId[start]!==null)continue;
   const path=[],pos=new Map();let x=start;
   while(cycleId[x]===null&&!pos.has(x)){pos.set(x,path.length);path.push(x);x=next(x);}
   let id;
   if(pos.has(x)){
     const cut=pos.get(x),cycle=path.slice(cut);id=cycles.length;cycles.push(cycle);
     for(const v of cycle){cycleId[v]=id;onCycle[v]=true;distance[v]=0;}
     for(let i=cut-1;i>=0;i--){cycleId[path[i]]=id;distance[path[i]]=distance[next(path[i])]+1;}
   }else{
     id=cycleId[x];
     for(let i=path.length-1;i>=0;i--){cycleId[path[i]]=id;distance[path[i]]=distance[next(path[i])]+1;}
   }
 }
 const basins=cycles.map((cycle,id)=>({id,length:cycle.length,basin:cycleId.filter(x=>x===id).length,minState:Math.min(...cycle)}));
 const redOnCycle=uniqueRed.filter(r=>onCycle[r.k]).map(r=>({...r,cycle:cycleId[r.k]}));
 return {radix,steps,next,cycles,cycleId,onCycle,distance,basins,redOnCycle};
}

const b60=analyze(60,a60),b59=analyze(59,a59);
assert.deepEqual(b60.cycles.map(c=>c.length).sort((a,b)=>a-b),[4,4,4,4,4,4,4,54]);
assert.deepEqual(b59.cycles.map(c=>c.length).sort((a,b)=>a-b),[14,14,53]);
assert.deepEqual(b60.redOnCycle.map(r=>[r.page,r.start,r.k]).sort((a,b)=>a[2]-b[2]),[
 [6,71,456],[39,119,516],[7,194,603],[57,0,748],
]);
assert.equal(b59.redOnCycle.length,0);

const p39=red.find(r=>r.page===39&&r.start===119);assert(p39);
const p39Cycle=b60.cycles[b60.cycleId[p39.k]];
assert.equal(p39Cycle.length,54);
assert.equal(b60.basins.find(x=>x.id===b60.cycleId[p39.k]).basin,753);

const seq=[];let k=p39.k;
for(let step=0;step<p39Cycle.length;step++){
 const row=Math.floor(k/29),col=k%29,direction=b60.steps[col];
 seq.push({step,k,coord:[row,col],words:[words[row]||null,words[col]||null],directionWord:words[col]||null,tableValue:direction});
 k=b60.next(k);
}
assert.equal(k,p39.k);
assert.deepEqual(seq.slice(0,3).map(x=>[x.k,x.coord,x.words]),[
 [516,[17,23],['THE','ROAD']],
 [603,[20,23],['MEANING','ROAD']],
 [690,[23,23],['ROAD','ROAD']],
]);

const redCyclePositions=seq
 .map((x,i)=>({i,x}))
 .filter(({x})=>uniqueRed.some(r=>r.k===x.k))
 .map(({i,x})=>({stepFromP39:i,k:x.k,coord:x.coord,words:x.words,red:uniqueRed.filter(r=>r.k===x.k).map(r=>[r.page,r.start,r.length])}));
assert.deepEqual(redCyclePositions,[
 {stepFromP39:0,k:516,coord:[17,23],words:['THE','ROAD'],red:[[39,119,8]]},
 {stepFromP39:1,k:603,coord:[20,23],words:['MEANING','ROAD'],red:[[7,194,6]]},
 {stepFromP39:7,k:456,coord:[15,21],words:['WORDS','IS'],red:[[6,71,5]]},
 {stepFromP39:19,k:748,coord:[25,23],words:['THEIR','ROAD'],red:[[57,0,7]]},
]);

const result={
 schema:'lp2-q-dlog-table-functional-graph-v1',
 classification:'complete 840-state functional-graph census for the uniform dlog-coordinate word-number direction rule; post-discovery structural evidence, no plaintext',
 rule:'k -> (k + tableValue[wordIndex = k mod29]) mod840',
 base60:{
   cycleLengths:b60.cycles.map(c=>c.length).sort((a,b)=>a-b),
   basins:b60.basins,
   p39CycleLength:p39Cycle.length,
   p39CycleBasin:753,
   distinctRedStatesOnCycles:b60.redOnCycle.length,
   redCyclePositions,
 },
 base59:{
   cycleLengths:b59.cycles.map(c=>c.length).sort((a,b)=>a-b),
   distinctRedStatesOnCycles:b59.redOnCycle.length,
 },
 boundary:'The canonical map has a dominant 753-state basin, so eventual basin membership is weak evidence. The discriminating finite observation is cycle membership: four distinct printed red residues lie on the same canonical 54-cycle, including the exact p39->p7 edge and the solved p57/p15-second Q-defining residue, whereas base59 places no printed red residue on any cycle. This remains post-discovery and is not a plaintext recovery.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
