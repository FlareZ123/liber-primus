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
const mod=x=>((x%MOD)+MOD)%MOD;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const pow=(x,n)=>{let r=[1,0],b=x;while(n){if(n&1)r=mul(r,b);b=mul(b,b);n>>=1;}return r;};
const ev=a=>{let z=[0,0],p=[1,0];for(const c of a){z=[mod(z[0]+c*p[0]),mod(z[1]+c*p[1])];p=mul(p,[0,1]);}return z;};
const Q=[17,24],Qinv=pow(Q,839),Q29=pow(Q,29),Qminus29=pow(Q,811);
const F=x=>pow(x,29);
assert.deepEqual(Q29,[2,5]);

const words=signed.split('-----BEGIN PGP SIGNATURE-----')[0].match(/\b[A-Za-z]+\b/g)
 .filter(w=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(w)).map(w=>w.toUpperCase());
assert.equal(words[29],'DIRECTION');

const states=[];
for(const pr of ink.pages)for(const sp of(pr.red_spans||[])){
 const e=ev([...sp.runes].map(r=>runeIndex.get(r)));
 states.push({page:pr.page,start:sp.start,length:sp.length,e});
}
assert.equal(states.length,18);
const byState=new Map(states.map(s=>[s.e.join(','),s]));
const state=(page,start)=>{const s=states.find(x=>x.page===page&&x.start===start);assert(s);return s;};
const p56=state(56,0),p40=state(40,0),p8=state(8,0);

const operations=[
 ['Qx',x=>mul(Q,x)],
 ['Q^-1x',x=>mul(Qinv,x)],
 ['F(x)',x=>F(x)],
 ['F(Qx)',x=>F(mul(Q,x))],
 ['QF(x)',x=>mul(Q,F(x))],
 ['F(Q^-1x)',x=>F(mul(Qinv,x))],
 ['Q^-1F(x)',x=>mul(Qinv,F(x))],
 ['Q^29x',x=>mul(Q29,x)],
 ['Q^-29x',x=>mul(Qminus29,x)],
];

const control=operations.map(([name,fn])=>({name,out:fn(p56.e)}));
assert.deepEqual(control,[
 {name:'Qx',out:[1,2]},
 {name:'Q^-1x',out:[7,0]},
 {name:'F(x)',out:[14,6]},
 {name:'F(Qx)',out:[7,27]},
 {name:'QF(x)',out:[27,0]},
 {name:'F(Q^-1x)',out:[7,0]},
 {name:'Q^-1F(x)',out:[19,7]},
 {name:'Q^29x',out:[27,0]},
 {name:'Q^-29x',out:[11,22]},
]);
assert.deepEqual(control.filter(x=>x.out[0]===1&&x.out[1]===2),[{name:'Qx',out:[1,2]}]);

const survivor=operations.find(([name])=>name==='Qx')[1];
const redEdges=[];
const outputs=[];
for(const source of states){
 const out=survivor(source.e),target=byState.get(out.join(','));
 outputs.push({source:[source.page,source.start,source.length],out,words:out.map(i=>words[i]||null),redTarget:target?[target.page,target.start,target.length]:null});
 if(target&&target!==source)redEdges.push({source:[source.page,source.start],target:[target.page,target.start]});
}
assert.deepEqual(redEdges,[]);
const p40out=outputs.find(x=>x.source[0]===40);assert(p40out);
const p8out=outputs.find(x=>x.source[0]===8);assert(p8out);
assert.deepEqual(p40out.out,[17,10]);
assert.deepEqual(p40out.words,['THE','PRIMUS']);
assert.deepEqual(p8out.out,[10,16]);
assert.deepEqual(p8out.words,['PRIMUS','ARE']);

const semilinear=operations.find(([name])=>name==='F(Qx)')[1];
const semilinearEdges=[];
for(const source of states){
 const out=semilinear(source.e),target=byState.get(out.join(','));
 if(target&&target!==source)semilinearEdges.push({source:[source.page,source.start],target:[target.page,target.start]});
}
assert.deepEqual(semilinearEdges,[
 {source:[15,0],target:[40,0]},
 {source:[40,0],target:[27,0]},
]);

const result={
 schema:'director-3462-q-direction-operation-adjudication-v1',
 classification:'source-control operator adjudication; semilinear navigation downgraded',
 family:'minimal no-fitted-constant family: Q±1 multiplication, Frobenius, Q±1/F compositions in both orders, Q±29 path strides',
 directionIndex:29,
 solvedControl:{
   source:'solved p56 red state; previously established Q output [1,2] is the real prime-minus-one opening pair',
   input:p56.e,
   candidates:control,
   uniqueMatch:'Qx',
 },
 frozenSurvivor:{
   operation:'Qx',
   p40:p40out,
   otherHeldRed:p8out,
   nontrivialPrintedRedEdges:redEdges,
 },
 rejectedAsSourceSelected:{
   operation:'F(Qx)',
   p56Output:semilinear(p56.e),
   knownPrintedRedEdges:semilinearEdges,
   reason:'It creates the attractive p15->p40->p27 chain but loses the independent solved-p56 control that uniquely selects plain Q multiplication in the same source-motivated family.',
 },
 decision:'DIRECTION=29 does not source-only select F(Qx) over simpler rivals. The strongest solved/source-typed control uniquely selects Qx, whose one-step action has zero nontrivial printed-red transitions and does not reproduce p40->p27. Therefore the semilinear red chain remains a post-discovery structural coincidence/conditional navigation hypothesis rather than independently authenticated Q transition opcode.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
