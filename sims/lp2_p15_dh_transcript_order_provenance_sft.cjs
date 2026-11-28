'use strict';

const assert = require('node:assert/strict');

const maps = {
  A: { p: ['w1','S','+1'], g: ['w2','P','id'], a: ['w2','S','id'], K: ['w2','L','id'] },
  B: { p: ['w1','S','+1'], g: ['w2','S','-1'], a: ['w2','P','+1'], K: ['w2','L','id'] },
  C: { p: ['w1','S','+1'], g: ['w1','L','+1'], a: ['w2','S','id'], K: ['w2','L','id'] },
};
const wordOrders=[['w1','w2','w3'],['w3','w2','w1']];
const statisticOrders=[['L','S','P'],['L','P','S'],['S','L','P'],['S','P','L'],['P','L','S'],['P','S','L']];
const processOrders=[['p','g','a','K'],['p','a','g','K']];

function ranks(wordOrder,statisticOrder,map){
  const w=Object.fromEntries(wordOrder.map((name,i)=>[name,i]));
  const s=Object.fromEntries(statisticOrder.map((name,i)=>[name,i]));
  return Object.fromEntries(Object.entries(map).map(([role,[word,stat]])=>[role,w[word]*3+s[stat]]));
}
function strictlyIncreasing(rank,order){
  return order.every((role,i)=>i===0||rank[order[i-1]]<rank[role]);
}
const survivors=[];
for(const [mapName,map] of Object.entries(maps)){
  for(const wordOrder of wordOrders){
    for(const statisticOrder of statisticOrders){
      const rank=ranks(wordOrder,statisticOrder,map);
      for(const processOrder of processOrders){
        if(strictlyIncreasing(rank,processOrder)) survivors.push({map:mapName,wordOrder:wordOrder.join('>'),statisticOrder:statisticOrder.join('>'),processOrder:processOrder.join('>')});
      }
    }
  }
}
assert.equal(survivors.length,7);
assert.deepEqual([...new Set(survivors.map(x=>x.map))].sort(),['A','B','C']);
assert.ok(survivors.every(x=>x.wordOrder==='w1>w2>w3'));
assert.equal(survivors.filter(x=>x.statisticOrder==='L>S>P').length,0);

const publicRoleSurvivors=[];
for(const [mapName,map] of Object.entries(maps)){
  for(const wordOrder of wordOrders){
    for(const statisticOrder of statisticOrders){
      const rank=ranks(wordOrder,statisticOrder,map);
      if(strictlyIncreasing(rank,['p','g','K'])) publicRoleSurvivors.push({map:mapName,wordOrder:wordOrder.join('>'),statisticOrder:statisticOrder.join('>')});
    }
  }
}
assert.equal(publicRoleSurvivors.length,9);
assert.deepEqual([...new Set(publicRoleSurvivors.map(x=>x.map))].sort(),['A','B','C']);

const state={p:23,g:5,a:6,A:8,B:19,K:2};
const heldoutUpperW2=[5,8,26];
assert.equal((state.B*26)%29,1);
for(const mapName of Object.keys(maps)) assert.deepEqual([state.g,state.A,26],heldoutUpperW2,mapName);

console.log(JSON.stringify({
  status:'PASS',
  evidenceBoundary:'Frozen #3399 maps A/B/C; authenticated 2013 DH order; lower-red word order and all six untyped statistic orders only. No p7/p8/chapter labels or body plaintext.',
  chargedFamily:{maps:Object.keys(maps),wordDirections:wordOrders.map(x=>x.join('>')),statisticOrders:statisticOrders.map(x=>x.join('>')),serverInternalOrders:processOrders.map(x=>x.join('>')),totalPresentations:72},
  fullProcessSurvivors:survivors,
  distinctMapsSurviving:[...new Set(survivors.map(x=>x.map))].sort(),
  canonicalLSPFullProcessSurvivors:survivors.filter(x=>x.statisticOrder==='L>S>P').length,
  publicRoleProjectionSurvivors,
  heldout:{relation:'upper W2 descriptors [5,8,26] == [g,A,B^-1]',passes:Object.keys(maps)},
  decision:'NON_IDENTIFYING: transcript order fixes forward word direction but no source-visible order exists among L/S/P; all three provenance maps survive the charged ordering family.',
},null,2));
