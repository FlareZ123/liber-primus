'use strict';
/**
 * Source-visible repeated moth p53/p55: affine-equivalent plaintext repeats.
 * Searches true length>=8 substring collisions under every affine GP29
 * relabeling x -> a*x+b (a=1..28, b=0..28), without enumerating keys.
 * Also checks all pages including solved p56/p57 as independent witnesses.
 * Read-only, Node 22 CommonJS.
 */
const assert=require('node:assert/strict');
const db=require('../resources/liber-primus/lp2-corpus.json');
const p=db.pages.filter(x=>x.page>=0&&x.page<=57&&x.indices.length);
const countUnknown=p.filter(x=>x.page<=55).reduce((t,x)=>t+x.indices.length,0);
assert.equal(countUnknown,12956);
const mod=x=>(x%29+29)%29;
const inv=Array.from({length:29},(_,n)=>n===0?0:
  Array.from({length:28},(_,i)=>i+1).find(i=>i*n%29===1));
assert.equal(inv[13]*13%29,1);
const indexes=new Map();
const events=[];
function keyOf(a,off,L){
  const first=a[off]; let j=1;
  while(j<L&&a[off+j]===first)j++;
  if(j===L)return {key:'CONST'+L,first,step:0,j};
  const step=mod(a[off+j]-first),inverse=inv[step];
  const items=[];
  for(let k=0;k<L;k++)items.push(mod(a[off+k]-first)*inverse%29);
  return {key:items.join(','),first,step,j};
}
const L=8;
for(const page of p){
  for(let off=0;off+L<=page.indices.length;off++){
    const desc=keyOf(page.indices,off,L);
    const past=indexes.get(desc.key)||[];
    for(const prev of past){
      if(prev.page===page.page)continue;
      const firstA=p.find(x=>x.page===prev.page).indices;
      const firstB=page.indices;
      const a=mod(desc.step*inv[prev.step]),b=mod(desc.first-a*prev.first);
      let n=0;
      while(prev.off+n<firstA.length&&off+n<firstB.length
        &&mod(a*firstA[prev.off+n]+b)===firstB[off+n])n++;
      const left=prev.off>0&&off>0&&mod(a*firstA[prev.off-1]+b)===firstB[off-1];
      if(!left)events.push({
        p:prev.page,offset:prev.off,q:page.page,qoffset:off,
        length:n,a,b,prefixA:firstA.slice(prev.off,prev.off+Math.min(n,16)),
        prefixB:firstB.slice(off,off+Math.min(n,16)),
        repeatedMoth:(prev.page===53&&page.page===55),
        knownControl:prev.page>=56||page.page>=56
      });
    }
    past.push({page:page.page,off,first:desc.first,step:desc.step});
    indexes.set(desc.key,past);
  }
}
events.sort((a,b)=>b.length-a.length||a.p-b.p||a.offset-b.offset);
console.log('ORIGINAL_AFFINE '+JSON.stringify({
  positions:countUnknown,sourcePages:p.length,
  unknownPages:p.filter(x=>x.page<=55).length,
  keyWindow:L,fullAffineModels:812,
  crossPageMatches:events.length,
  biggest:events.slice(0,50),
  mothP53P55:events.filter(e=>e.repeatedMoth),
  solvedCross:events.filter(e=>e.knownControl).slice(0,25)
}));
const plantFrom=p.find(x=>x.page===53);
const plantTo=p.find(x=>x.page===55);
const fake=plantFrom.indices.slice(3,3+20).map(x=>mod(12*x+9));
const gate=keyOf(plantFrom.indices,3,8);
const test=keyOf(fake,0,8);
assert.equal(gate.key,test.key);
const art53=p.find(x=>x.page===53).indices;
const art55=p.find(x=>x.page===55).indices;
let best=0;
for(let o1=0;o1<=art53.length-L;o1++)for(let o2=0;o2<=art55.length-L;o2++){
  const x=keyOf(art53,o1,L);
  const y=keyOf(art55,o2,L);
  if(x.key===y.key)best++;
}
assert.equal(best,events.filter(e=>e.repeatedMoth).length);
console.log('PLANT PASS 20/20 known affine GP29 shared phrase; original motif pair length8 matches='+best);
