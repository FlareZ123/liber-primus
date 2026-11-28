"use strict";
const assert=require("node:assert/strict");
const mod29=x=>((x%29)+29)%29;
const widths=[4,1,4,2];
const outer={diff:Math.abs(widths[0]-widths[3]),sum:widths[0]+widths[3]};
const inner={diff:Math.abs(widths[1]-widths[2]),sum:widths[1]+widths[2]};
assert.deepEqual(outer,{diff:2,sum:6});
assert.deepEqual(inner,{diff:3,sum:5});
const invariantMagnitudes=[outer.diff,inner.diff,inner.sum,outer.sum].sort((a,b)=>a-b);
assert.deepEqual(invariantMagnitudes,[2,3,5,6]);
const support=[{rank:17,coord:3,dir:-1},{rank:22,coord:5,dir:+1},{rank:38,coord:6,dir:+1},{rank:39,coord:2,dir:+1}];
assert.deepEqual(support.map(x=>x.coord).sort((a,b)=>a-b), invariantMagnitudes);
const kIndex=support.findIndex(x=>x.coord===outer.diff);
assert.equal(kIndex,3);
const forward=[...support.slice(kIndex),...support.slice(0,kIndex)];
const globalSign=forward[0].dir===1?1:-1;
const serialized=forward.map(x=>globalSign*x.dir*x.coord);
assert.deepEqual(serialized,[2,-3,5,6]);
const variants=[];
for(let start=0;start<4;start++) for(const reverse of [false,true]) for(const sign of [1,-1]){
  const order=[];
  for(let j=0;j<4;j++){const step=reverse?-j:j;order.push(support[(start+step+40)%4]);}
  variants.push({start,reverse,sign,vector:order.map(x=>sign*x.dir*x.coord)});
}
assert.equal(variants.length,16);
const selected=variants.filter(v=>v.start===kIndex && !v.reverse && v.vector[0]===outer.diff);
assert.equal(selected.length,1);
assert.deepEqual(selected[0].vector,serialized);
const [K,minusE,g,a]=serialized.map(mod29), F=0, one=1;
const L=[minusE,one,mod29(-minusE),K];
const C=[minusE,one,F,one,mod29(-minusE)];
const T=[mod29(-a),g,mod29(-K),one];
const R=L.map((x,i)=>mod29(x+T[i]));
assert.deepEqual([L,C,T,R],[[26,1,3,2],[26,1,0,1,3],[23,5,27,1],[20,6,1,3]]);
console.log(JSON.stringify({status:"PASS",p6MirrorInvariant:{outer,inner},p50IncreasingPrimeSupports:support,independentStart:"column2 = K",chargedCyclicVariants:variants.length,sourceSelectedVariants:selected.length,orderedStatePacket:serialized,gridProgram:{L,C,T,R},conclusion:"P50 support order/direction plus its independently selected K column serializes the p6 mirror-pair magnitudes as [K,-e,g,a] without invoking canonical H; this exactly regenerates the p6 4/5/4 grid program. The bridge remains post-discovery and is not a plaintext inverse."},null,2));
