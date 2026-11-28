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
const mod840=x=>((x%840)+840)%840;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const ev=a=>{let z=[0,0],p=[1,0];for(const c of a){z=[mod(z[0]+c*p[0]),mod(z[1]+c*p[1])];p=mul(p,[0,1]);}return z;};
const Q=[17,24];

const words=signed.split('-----BEGIN PGP SIGNATURE-----')[0].match(/\b[A-Za-z]+\b/g)
 .filter(w=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(w)).map(w=>w.toUpperCase());
assert.equal(words.length,43);
assert.equal(words[20],'MEANING');
assert.equal(words[23],'ROAD');
assert.equal(words[25],'THEIR');
assert.equal(words[29],'DIRECTION');

const tokens=grid.pages.flatMap(p=>p.tokens);
const bytes60=grid.pages.flatMap(p=>p.bytes);
assert.equal(tokens.length,256);
const a60=grid.alphabet,a59=a60.replace('f','');
const value=(token,alphabet,radix)=>{
 const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
 return hi<0||lo<0?null:radix*hi+lo;
};

const dlog=new Map();let state=[1,0];
for(let k=0;k<840;k++){dlog.set(state.join(','),k);state=mul(state,Q);}
assert.deepEqual(state,[1,0]);

const red=[];
for(const pr of ink.pages)for(const sp of(pr.red_spans||[])){
 const residue=ev([...sp.runes].map(r=>runeIndex.get(r)));
 if(residue[0]===0&&residue[1]===0)continue;
 const k=dlog.get(residue.join(','));assert.notEqual(k,undefined);
 const qout=mul(Q,residue);
 red.push({
   page:pr.page,start:sp.start,length:sp.length,residue,k,
   coord:[Math.floor(k/29),k%29],
   qout,qwords:qout.map(i=>words[i]),
 });
}
assert.equal(red.length,17);

const helloOutputs=red.filter(r=>r.qout.includes(0));
const meaningOutputs=red.filter(r=>r.qout.includes(20));
assert.deepEqual(helloOutputs.map(r=>[r.page,r.start,r.qout,r.qwords]),[
 [54,0,[0,20],['HELLO','MEANING']],
]);
assert.deepEqual(meaningOutputs.map(r=>[r.page,r.start,r.qout,r.qwords]),[
 [54,0,[0,20],['HELLO','MEANING']],
]);

const meaningCell={
 index:20,token:tokens[20],base60:bytes60[20],
 base59:value(tokens[20],a59,59),
 base29:[Math.floor(bytes60[20]/29),bytes60[20]%29],
};
assert.deepEqual(meaningCell,{index:20,token:'1g',base60:102,base59:100,base29:[3,15]});
assert.deepEqual(bytes60.map((v,i)=>[v,i]).filter(([v])=>v===102),[[102,20]]);

const statesByK=new Map();
for(const r of red){
 if(!statesByK.has(r.k))statesByK.set(r.k,[]);
 statesByK.get(r.k).push(r);
}

function census(radix,alphabet,addressOrigin,coordIndex,sign){
 const hits=[];
 for(const from of red){
   const address=from.qout[coordIndex]+addressOrigin;
   const step=value(tokens[address],alphabet,radix);
   if(step===null)continue;
   const targetK=mod840(from.k+sign*step);
   const targets=statesByK.get(targetK)||[];
   if(targets.length)hits.push({
     from:[from.page,from.start,from.k,from.coord],
     qout:from.qout,
     qwords:from.qwords,
     selected:[address,words[address]],
     token:tokens[address],
     step,
     targetK,
     targetCoord:[Math.floor(targetK/29),targetK%29],
     targetWords:[words[Math.floor(targetK/29)]||null,words[targetK%29]||null],
     targets:targets.map(t=>[t.page,t.start,t.length]),
   });
 }
 return hits;
}

const variants=[];
for(const [radix,alphabet] of [[60,a60],[59,a59]])for(const addressOrigin of [0,1])for(const coordIndex of [0,1])for(const sign of [1,-1]){
 variants.push({radix,addressOrigin,coordinate:coordIndex===0?'first':'second',direction:sign===1?'forward':'backward',hits:census(radix,alphabet,addressOrigin,coordIndex,sign)});
}
assert.deepEqual(variants.map(v=>[v.radix,v.addressOrigin,v.coordinate,v.direction,v.hits.length]),[
 [60,0,'first','forward',0],[60,0,'first','backward',0],[60,0,'second','forward',1],[60,0,'second','backward',0],
 [60,1,'first','forward',1],[60,1,'first','backward',0],[60,1,'second','forward',0],[60,1,'second','backward',0],
 [59,0,'first','forward',0],[59,0,'first','backward',0],[59,0,'second','forward',3],[59,0,'second','backward',1],
 [59,1,'first','forward',0],[59,1,'first','backward',1],[59,1,'second','forward',0],[59,1,'second','backward',0],
]);

const canonical=variants.find(v=>v.radix===60&&v.addressOrigin===0&&v.coordinate==='second'&&v.direction==='forward');
assert(canonical);
assert.equal(canonical.hits.length,1);
const edge=canonical.hits[0];
assert.deepEqual(edge,{
 from:[54,0,646,[22,8]],
 qout:[0,20],
 qwords:['HELLO','MEANING'],
 selected:[20,'MEANING'],
 token:'1g',
 step:102,
 targetK:748,
 targetCoord:[25,23],
 targetWords:['THEIR','ROAD'],
 targets:[[15,9,11],[57,0,7]],
});

const p15Second=red.find(r=>r.page===15&&r.start===9);
const p57=red.find(r=>r.page===57&&r.start===0);
assert(p15Second&&p57);
assert.deepEqual(p15Second.residue,p57.residue);
assert.equal(p15Second.k,748);
assert.equal(p57.k,748);

const p54=red.find(r=>r.page===54&&r.start===0);assert(p54);
assert.equal(p54.k+meaningCell.base60,748);
assert.deepEqual([Math.floor(748/29),748%29],[25,23]);

const roadCell={index:23,token:tokens[23],base60:bytes60[23],base59:value(tokens[23],a59,59)};
assert.deepEqual(roadCell,{index:23,token:'1R',base60:87,base59:86});
assert.deepEqual(bytes60.map((v,i)=>[v,i]).filter(([v])=>v===87),[[87,23]]);
const afterRoad=mod840(748+roadCell.base60);
const afterRoadCoord=[Math.floor(afterRoad/29),afterRoad%29];
assert.equal(afterRoad,835);
assert.deepEqual(afterRoadCoord,[28,23]);
assert.deepEqual(afterRoadCoord.map(i=>words[i]),['THE','ROAD']);
const base59MeaningTarget=mod840(p54.k+meaningCell.base59);
assert.equal(base59MeaningTarget,746);
assert.deepEqual([Math.floor(base59MeaningTarget/29),base59MeaningTarget%29].map(i=>words[i]),['THEIR','IS']);
const base59RoadTarget=mod840(748+roadCell.base59);
assert.equal(base59RoadTarget,834);
assert.deepEqual([Math.floor(base59RoadTarget/29),base59RoadTarget%29].map(i=>words[i]),['THE','THE']);

const result={
 schema:'lp2-q-plain-wordnumber-direction-redgraph-v1',
 classification:'complete red-state source/table direction census; post-discovery navigation cross-lock, no plaintext',
 sourceRule:'plain Q maps red state to authenticated word-number pair; selected word number addresses original-verified p49-51 table; full table number is Q-orbit direction',
 sourceBoundary:{meaningIndex:20,roadIndex:23,directionIndex:29},
 startSelector:{
   helloOccurrencesAmongPlainQRedOutputs:helloOutputs.length,
   meaningOccurrencesAmongPlainQRedOutputs:meaningOutputs.length,
   uniquePair:meaningOutputs[0],
   numberingOrigin:'zero-based source index is required to interpret field coordinate0 as HELLO0; one-based ordinal0 is undefined',
 },
 meaningUniqueness:{
   occurrencesAmongPlainQRedOutputs:meaningOutputs.length,
   occurrence:meaningOutputs[0],
   tableCell:meaningCell,
   value102OccurrencesAcross256:bytes60.filter(v=>v===102).length,
 },
 finiteFamily:variants,
 originControl:{meaningZeroBased:{cell:20,k:748,words:['THEIR','ROAD']},meaningOneBased:{cell:21,k:783,words:['ARE','HELLO']},roadZeroBased:{cell:23,k:835,words:['THE','ROAD']},roadOneBasedFromK748:{cell:24,k:17,words:['HELLO','THE']}},
 canonicalEdge:edge,
 qDefiningTarget:{
   p15Second:[p15Second.page,p15Second.start,p15Second.residue,p15Second.k],
   p57:[p57.page,p57.start,p57.residue,p57.k],
   sameFieldResidue:true,
 },
 continuation:{roadCell,afterRoad:{k:afterRoad,coord:afterRoadCoord,words:afterRoadCoord.map(i=>words[i])},base59Meaning:{k:base59MeaningTarget,words:[Math.floor(base59MeaningTarget/29),base59MeaningTarget%29].map(i=>words[i])},base59Road:{k:base59RoadTarget,words:[Math.floor(base59RoadTarget/29),base59RoadTarget%29].map(i=>words[i])}},
 interpretation:'Solved-p56-selected plain Q produces HELLO0 and MEANING20 exactly once in the complete nonzero red class, together and ordered HELLO/MEANING on p54. Under canonical base60, MEANING20 uniquely addresses value102; advancing p54 k646 by102 lands at k748=[25,23]=THEIR/ROAD, exactly the shared p15-second/solved-p57 residue that defined the p3 quotient construction. ROAD23 then uniquely addresses87 and advances to k835=[28,23]=THE/ROAD. Base59 instead sends MEANING to THEIR/IS and ROAD from k748 to THE/THE. In the zero-based 8-way radix/coordinate/sign family, canonical base60 second-coordinate forward has exactly the p54 red edge. Charging one-based table-address origin adds one unrelated base60 p33->p40 hit, but destroys the MEANING and ROAD checkpoints; the source-word reading itself also requires zero-based origin because p54's first field coordinate is literal HELLO0. This strengthens an executable source/table navigation grammar but remains post-discovery and does not decrypt black text.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
