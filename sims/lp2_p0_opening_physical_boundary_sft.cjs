"use strict";

/**
 * SFT: plaintext-blind p0 opening selector through the physical p0 end.
 *
 * Upstream source premises:
 * - the rubrication-selected p0-p2 span is 729 = 27^2 runes;
 * - the visible red-13/totient clue supplies n=13 and phi(13)=12;
 * - the candidate mechanism transforms node centers by Euler phi and uses the
 *   established mu(phi(k)) cyclic alignment.
 *
 * This test removes English/dictionary scoring from AS I GO THE / WEATHER /
 * TURNS. It exhausts the natural anchor/axis choices, selects the opening start
 * by the fixed source movement rule, selects the opening stop by a globally
 * unique X-OE-X -> matrix-center relation, and uses the physical p0 final rune
 * to delimit WEATHER and TURNS.
 *
 * The transition grammar was reconstructed after the public route was known.
 * This is therefore a strong intermediate source selector, not authenticated
 * Liber Primus plaintext.
 *
 * Run: node sims/lp2_p0_opening_physical_boundary_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),
  "utf8"
));
const T=corpus.translit;
const pages=corpus.pages.filter(page=>page.page<=2);
assert.deepEqual(pages.map(page=>page.indices.length),[262,266,201]);
const grid=pages.flatMap(page=>page.indices);
assert.equal(grid.length,729);

const side=27;
const position=([row,column])=>(row-1)*side+column-1;
const coordinate=index=>[Math.floor(index/side)+1,index%side+1];
const at=([row,column])=>grid[position([row,column])];
const inBounds=([row,column])=>row>=1&&row<=side&&column>=1&&column<=side;
const mod29=value=>(value%29+29)%29;

/** @param {number} n */
function phi(n){
  let value=n;
  let rest=n;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    while(rest%p===0)rest/=p;
    value-=value/p;
  }
  if(rest>1)value-=value/rest;
  return value;
}

/** @param {number} n */
function mu(n){
  let rest=n;
  let signValue=1;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    rest/=p;
    signValue=-signValue;
    if(rest%p===0)return 0;
  }
  return rest>1?-signValue:signValue;
}

/** @param {number[]} raw */
function deriveKey(raw){
  const derived=[raw[0],phi(raw[1]),raw[2]];
  const rotation=((derived.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
  return {
    derived,
    rotation,
    key:derived.slice(rotation).concat(derived.slice(0,rotation))
  };
}

/** @param {number[]} cells @param {number[]} key */
function decryptIndices(cells,key){
  return cells.map((index,i)=>mod29(grid[index]-key[i%key.length]));
}

/** @param {Array<[number,number]>} cells @param {number[]} key */
function decryptCells(cells,key){
  return cells.map((cell,i)=>mod29(at(cell)-key[i%key.length]));
}

const matrixCenter=[14,14];
const matrixCenterIndex=position(matrixCenter);
assert.equal(matrixCenterIndex,364);

const endpointCandidates=[];
for(let index=0;index+2<grid.length;index++){
  const [row,column]=coordinate(index);
  if(column>25)continue;
  const raw=[grid[index],grid[index+1],grid[index+2]];
  if(raw[0]!==raw[2]||raw[1]===0)continue;
  if(index+phi(raw[1])===matrixCenterIndex){
    endpointCandidates.push({index,coordinate:[row,column],raw});
  }
}
assert.equal(endpointCandidates.length,1);
const openingEndpoint=endpointCandidates[0];
assert.equal(openingEndpoint.index,354);
assert.deepEqual(openingEndpoint.coordinate,[14,4]);
assert.deepEqual(openingEndpoint.raw.map(i=>T[i]),["X","OE","X"]);
assert.equal(phi(openingEndpoint.raw[1]),10);

const n=13;
assert.equal(phi(n),12);
const anchors=[[n,phi(n)],[phi(n),n]];
const axes=[
  {name:"H",delta:[0,1]},
  {name:"V",delta:[1,0]},
  {name:"NWSE",delta:[1,1]},
  {name:"NESW",delta:[1,-1]}
];

const openingFamily=[];
for(const anchor of anchors){
  for(const axis of axes){
    const [dr,dc]=axis.delta;
    const first=[anchor[0]-dr,anchor[1]-dc];
    const last=[anchor[0]+dr,anchor[1]+dc];
    if(!inBounds(first)||!inBounds(last))continue;

    const raw=[at(first),at(anchor),at(last)];
    if(raw[1]===0)continue;
    const derivation=deriveKey(raw);
    const distance=phi(raw[1])+phi(derivation.derived[1]);
    const start=[
      first[0]+dr*distance,
      first[1]+dc*distance
    ];
    const startIndex=inBounds(start)?position(start):null;

    openingFamily.push({
      anchor,
      axis:axis.name,
      first,
      last,
      raw,
      derivation,
      distance,
      start,
      startIndex,
      admissible:startIndex!==null&&startIndex<=openingEndpoint.index
    });
  }
}
assert.equal(openingFamily.length,8);
const openingWinners=openingFamily.filter(row=>row.admissible);
assert.equal(openingWinners.length,1);

const opening=openingWinners[0];
assert.deepEqual(opening.anchor,[13,12]);
assert.equal(opening.axis,"H");
assert.deepEqual(opening.raw.map(i=>T[i]),["AE","J","EA"]);
assert.deepEqual(opening.derivation.derived.map(i=>T[i]),["AE","I","EA"]);
assert.equal(opening.derivation.rotation,0);
assert.deepEqual(opening.derivation.key.map(i=>T[i]),["AE","I","EA"]);
assert.equal(opening.distance,14);
assert.deepEqual(opening.start,[13,25]);
assert.equal(opening.startIndex,348);

const openingCells=[];
for(let index=opening.startIndex;index<=openingEndpoint.index;index++){
  openingCells.push(index);
}
assert.deepEqual(openingCells.map(coordinate),[
  [13,25],[13,26],[13,27],[14,1],[14,2],[14,3],[14,4]
]);
const openingPlain=decryptIndices(openingCells,opening.derivation.key);
assert.deepEqual(openingPlain.map(i=>T[i]),["A","S","I","G","O","TH","E"]);

const block2Derivation=deriveKey(openingEndpoint.raw);
assert.deepEqual(block2Derivation.derived.map(i=>T[i]),["X","I","X"]);
assert.equal(block2Derivation.rotation,2);
assert.deepEqual(block2Derivation.key.map(i=>T[i]),["X","X","I"]);

const block2StartIndex=openingEndpoint.index+phi(openingEndpoint.raw[1]);
assert.equal(block2StartIndex,matrixCenterIndex);
assert.deepEqual(coordinate(block2StartIndex),matrixCenter);
const block2Direction=[0,1];

const p0EndIndex=pages[0].indices.length-1;
const p0End=coordinate(p0EndIndex);
assert.deepEqual(p0End,[10,19]);

const weatherBoundaryHits=[];
let cursor=[...matrixCenter];
let length=1;
while(inBounds(cursor)){
  const next=[cursor[0]+block2Direction[0],cursor[1]+block2Direction[1]];
  if(inBounds(next)&&next[1]===p0End[1]){
    weatherBoundaryHits.push({length,endpoint:[...cursor],next});
  }
  cursor=next;
  length++;
}
assert.equal(weatherBoundaryHits.length,1);
const weatherBoundary=weatherBoundaryHits[0];
assert.equal(weatherBoundary.length,5);
assert.deepEqual(weatherBoundary.endpoint,[14,18]);
assert.deepEqual(weatherBoundary.next,[14,19]);

const weatherCells=[];
cursor=[...matrixCenter];
for(let i=0;i<weatherBoundary.length;i++){
  weatherCells.push([...cursor]);
  cursor=[cursor[0]+block2Direction[0],cursor[1]+block2Direction[1]];
}
const weatherPlain=decryptCells(weatherCells,block2Derivation.key);
assert.deepEqual(weatherPlain.map(i=>T[i]),["W","EA","TH","E","R"]);

const turnsStart=weatherBoundary.next;
const priorCenter=block2Derivation.derived[1];
assert.equal(T[priorCenter],"I");
const turnsCenter=[
  turnsStart[0]+block2Direction[0]*phi(priorCenter),
  turnsStart[1]+block2Direction[1]*phi(priorCenter)
];
assert.deepEqual(turnsCenter,[14,23]);

const perpendicular=[block2Direction[1],-block2Direction[0]];
const node3Cells=[
  [turnsCenter[0]-perpendicular[0]*priorCenter,turnsCenter[1]-perpendicular[1]*priorCenter],
  turnsCenter,
  [turnsCenter[0]+perpendicular[0]*priorCenter,turnsCenter[1]+perpendicular[1]*priorCenter]
];
assert.ok(node3Cells.every(inBounds));
const key3=node3Cells.map(at);
assert.deepEqual(key3.map(i=>T[i]),["H","NG","C"]);
const rotation3=((key3.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
assert.equal(rotation3,0);

assert.equal(turnsStart[1],p0End[1]);
assert.ok(turnsStart[0]>=p0End[0]);
const turnsCells=[];
for(let row=turnsStart[0];row>=p0End[0];row--){
  turnsCells.push([row,turnsStart[1]]);
}
assert.deepEqual(turnsCells,[[14,19],[13,19],[12,19],[11,19],[10,19]]);
const turnsPlain=decryptCells(turnsCells,key3);
assert.deepEqual(turnsPlain.map(i=>T[i]),["T","U","R","N","S"]);
assert.deepEqual(turnsCells.at(-1),p0End);

console.log(JSON.stringify({
  status:"PASS: opening through TURNS selected without dictionary scoring",
  physicalPages:{lengths:pages.map(p=>p.indices.length),p0End},
  endpoint:{
    globalCandidates:endpointCandidates.length,
    cell:openingEndpoint.coordinate,
    node:openingEndpoint.raw.map(i=>T[i]),
    phiCenter:phi(openingEndpoint.raw[1]),
    matrixCenter
  },
  opening:{
    naturalNodeCandidates:openingFamily.length,
    admissibleStarts:openingWinners.length,
    anchor:opening.anchor,
    node:opening.raw.map(i=>T[i]),
    key:opening.derivation.key.map(i=>T[i]),
    distance:opening.distance,
    cells:openingCells.map(coordinate),
    plaintext:openingPlain.map(i=>T[i])
  },
  weather:{
    start:matrixCenter,
    boundaryHits:weatherBoundaryHits.length,
    cells:weatherCells,
    key:block2Derivation.key.map(i=>T[i]),
    plaintext:weatherPlain.map(i=>T[i])
  },
  turns:{
    start:turnsStart,
    keyNode:key3.map(i=>T[i]),
    cells:turnsCells,
    end:p0End,
    plaintext:turnsPlain.map(i=>T[i])
  },
  caveat:"The node/movement/boundary grammar was reconstructed after the public route. It removes English feedback from selection while remaining an intermediate post-hoc mechanism until independently instructed or transferred prospectively."
},null,2));
