'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT=path.resolve(__dirname,'..');
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/base60-grid.json'),'utf8'));
const signed=fs.readFileSync(path.join(ROOT,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const signedBody=signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const words=signedBody.match(/\b[A-Za-z]+\b/g)
  .filter((word)=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(word))
  .map((word)=>word.toUpperCase());
assert.equal(words.length,43);

const bytes=grid.byte_rows.flat();
const tokens=grid.rows.flat();
assert.equal(bytes.length,256);
assert.equal(tokens.length,256);

const Q=[17,24];
const basisU=[0,1];
const mod=(x)=>((x%29)+29)%29;
const mul=(x,y)=>[
  mod(x[0]*y[0]+8*x[1]*y[1]),
  mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1]),
];
assert.deepEqual(mul(Q,basisU),[18,2]);
assert.deepEqual([words[18],words[2]],['MAP','PATH']);

const addressPair=[18,2];
const addressValues=addressPair.map((cell)=>bytes[cell]);
assert.deepEqual(addressValues,[15,167]);
assert.equal(words[addressValues[0]],'WORDS');
assert.ok(addressValues[1]>=words.length);

const walk=[18];
for(let i=0;i<2;i+=1)walk.push(bytes[walk.at(-1)]);
assert.deepEqual(walk,[18,15,212]);
assert.ok(walk.at(-1)>=words.length);

const signedInRangeEdges=[];
for(let i=0;i<words.length;i+=1){
  const value=bytes[i];
  if(value<words.length) signedInRangeEdges.push({
    fromIndex:i,fromWord:words[i],toIndex:value,toWord:words[value],token:tokens[i],
  });
}
const mapEdge=signedInRangeEdges.find((edge)=>edge.fromIndex===18);
assert.deepEqual(mapEdge,{fromIndex:18,fromWord:'MAP',toIndex:15,toWord:'WORDS',token:'0F'});

const result={
  schema:'lp2-p3-q-map-path-p50-consumer-v1',
  classification:'prospectively frozen literal MAP/PATH p50 consumer; one typed edge, one failed component',
  upstream:{Q,basisU,qTimesU:[18,2],words:['MAP','PATH']},
  addressPair:{
    cells:addressPair,
    tokens:addressPair.map((i)=>tokens[i]),
    base60Values:addressValues,
    typed:[
      {cell:18,value:15,signedWord:words[15],physicalPage:15},
      {cell:2,value:167,signedWord:null,physicalPage:null},
    ],
  },
  twoHopPath:{start:18,hops:2,walk,terminalTyped:walk.at(-1)<words.length},
  finiteControl:{
    signedSourceIndices:words.length,
    signedToSignedP50Edges:signedInRangeEdges.length,
    edges:signedInRangeEdges,
    exactMapToWordsEdge:signedInRangeEdges.filter((edge)=>edge.fromWord==='MAP'&&edge.toWord==='WORDS').length,
  },
  decision:'Retain the preregistered MAP18->WORDS15/p15 edge as a prospective cross-lock back to the Q source page. Reject the full two-coordinate address readout as a typed pair and reject the literal two-hop MAP18/PATH2 walk; do not tune cell2 or the hop count.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
