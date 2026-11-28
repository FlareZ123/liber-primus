"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
const MOD=29;
const mod=x=>((x%MOD)+MOD)%MOD;

// Independently established strict p50 support edges, ordered by starting prime rank.
// coord3 north, coord5 east, coord6 south, coord2 south.
const supports=[
  {coord:3,sign:-1},
  {coord:5,sign:+1},
  {coord:6,sign:+1},
  {coord:2,sign:+1},
];
const oriented=supports.map(x=>mod(x.sign*x.coord));
assert.deepEqual(oriented,[26,5,6,2]);

// Independent physical column2 tunnel fixes the cyclic start at support coord2.
// Rotate the source-ordered support packet to that start.
const packet=[oriented[3],oriented[0],oriented[1],oriented[2]];
assert.deepEqual(packet,[2,26,5,6]);
const [K,minusE,g,a]=packet;
const e=mod(-minusE);

// Independently selected p40 ROAD×MAP intersection is p50 cell43.
assert.equal(grid.rows.flat()[43],"1D");
const alpha60=grid.alphabet;
const alpha59=alpha60.replace("f","");
const value=(token,alphabet,radix)=>{
  const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
  assert.ok(hi>=0&&lo>=0);
  return radix*hi+lo;
};
const token=grid.rows.flat()[43];
const v59=value(token,alpha59,59),v60=value(token,alpha60,60);
assert.deepEqual([v59,v60],[72,73]);
const boundary=[v59-43,v60-43];
assert.deepEqual(boundary,[29,30]);
const [F,one]=boundary.map(mod);
assert.deepEqual([F,one],[0,1]);

// Reconstruct the p6 4/5/4 numeric program with no p6-local H,
// printed singleton, or Fehu value used as a numeric input.
const L=[minusE,one,e,K];
const C=[minusE,one,F,one,e];
const T=[mod(-a),g,mod(-K),one];
const R=L.map((x,i)=>mod(x+T[i]));
assert.deepEqual(L,[26,1,3,2]);
assert.deepEqual(C,[26,1,0,1,3]);
assert.deepEqual(T,[23,5,27,1]);
assert.deepEqual(R,[20,6,1,3]);
const externalDeltaTape=L.concat(C,R);
const observedCorridorDeltaTape=[26,1,3,2,26,1,0,1,3,20,6,1,3];
assert.deepEqual(externalDeltaTape,observedCorridorDeltaTape);

console.log(JSON.stringify({
  status:"PASS",
  p50SupportPacket:{oriented,cyclicFromColumn2:packet},
  cell43:{token,v59,v60,forwardDisplacements:boundary,mod29Constants:[F,one]},
  regeneratedGrid:{L,C,T,R,externalDeltaTape,observedCorridorDeltaTape,exactTapeMatch:true},
  conclusion:"P50 support geometry plus the p40-selected cell43 DIRECTION/SEEK boundary independently provide every numeric operand [K,-e,g,a,F,1] of the p6 L/C/T/R tape. P6 is still needed to select the 4/5/4 red13 geometry/receiver context; this is causal reconstruction, not a new plaintext decoder.",
},null,2));
