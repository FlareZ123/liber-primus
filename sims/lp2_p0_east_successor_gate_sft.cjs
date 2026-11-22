"use strict";

/**
 * SFT: plaintext-blind selector for the conditional p0 EAST block.
 *
 * Starting from Agent29's source-selected THE state, this test exhausts:
 * - all original three-cell key nodes on all four axes and every radius;
 * - both direct and center-totient key derivations;
 * - physical-row-20 boundary starts satisfying Reports 01/04/06/07;
 * - every straight diagonal ciphertext block satisfying Reports 02/03/05/08;
 * - a widened local successor test that permits all four cardinal
 *   phi(center) moves from the non-boundary key outer and both adjacent
 *   physical-boundary cells.
 *
 * Binary state and parity quantities are reduced in their native moduli.
 * A prior implementation incorrectly reduced through GP29 before mod 2/3;
 * because 29 is odd, that can change a parity or phase. The corrected native
 * reductions reproduce the report's frozen 8-candidate -> 1-survivor result.
 *
 * Plaintext is checked only after the unique surviving key/path/length is
 * selected. The local boundary/successor grammar was reconstructed after the
 * public route was known, so this remains intermediate post-hoc evidence.
 *
 * Run: node sims/lp2_p0_east_successor_gate_sft.cjs
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
const grid=corpus.pages.filter(page=>page.page<=2).flatMap(page=>page.indices);
assert.equal(grid.length,729);

const at=(r,c)=>grid[(r-1)*27+c-1];
const inBounds=q=>q[0]>=1&&q[0]<=27&&q[1]>=1&&q[1]<=27;
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const mod=x=>(x%29+29)%29;
const mod2=x=>(x%2+2)%2;
const mod3=x=>(x%3+3)%3;

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

/** @param {number} a @param {number} b */
function gcd(a,b){
  let x=a;
  let y=b;
  while(y!==0){
    const next=x%y;
    x=y;
    y=next;
  }
  return x;
}

const n0=q=>27*(q[0]-1)+q[1];
const n1=q=>27*(q[1]-1)+28-q[0];
const n2=q=>730-n0(q);
const n3=q=>27*(27-q[1])+q[0];

/** @param {Array<[number,number]>} cells */
function leftmost(cells){
  return cells.reduce(
    (best,cell)=>
      cell[1]<best[1]||(cell[1]===best[1]&&cell[0]>best[0])
        ?cell
        :best,
    cells[0]
  );
}

/** @param {[number,number]} a @param {[number,number]} b */
function rayOffset(a,b){
  const dr=Math.abs(b[0]-a[0]);
  const dc=Math.abs(b[1]-a[1]);
  return Math.min(dr,dc,Math.abs(dr-dc));
}

/** @param {number[]} key */
function signature(key){
  return key.map(value=>mu(phi(value)));
}

/** @param {number[]} raw */
function transforms(raw){
  const out=[{mode:"direct",key:raw}];
  if(raw[1]!==0){
    out.push({
      mode:"phi-center",
      key:[raw[0],phi(raw[1]),raw[2]]
    });
  }
  return out;
}

const signatureTable={
  0:[[0,0,0],[1,1,1]],
  1:[[0,1,0],[1,-1,1]],
  2:[[0,-1,0],[1,0,1]]
};

const axes=[[1,0],[0,1],[1,1],[1,-1]];
const cardinals=[[-1,0],[1,0],[0,-1],[0,1]];

/**
 * Report 01 for S in [0,27].
 * @param {Array<[number,number]>} cells
 * @param {number} S
 * @param {number} outer
 */
function predictSignature(cells,S,outer){
  const mode=Math.floor(S/7);
  assert.ok(mode>=0&&mode<=3);
  const reflected=mode===1||mode===2;
  const offset=mode===0||mode===2?1:0;

  let mobiusSum=0;
  for(const cell of cells){
    mobiusSum+=mu(reflected?730-n0(cell):n0(cell));
  }
  const phase=mod3(mobiusSum+offset);
  const L=leftmost(cells);
  const nextOuter=mod2(outer+mu(n1(L)));

  return {
    phase,
    outer:nextOuter,
    signature:signatureTable[phase][nextOuter],
    SNext:S+phase
  };
}

/**
 * Reports 03-07 for the next block.
 * @param {Array<[number,number]>} cells
 * @param {[number,number]} center
 * @param {number} centerRune
 * @param {Array<[number,number]>} nodeCells
 * @param {number} currentPhase
 */
function predictGeometry(cells,center,centerRune,nodeCells,currentPhase){
  const B=cells[0];
  const E=cells.at(-1);
  const L=leftmost(cells);

  const A=n2(B)+n0(center);
  const G=gcd(n1(E),n2(E));
  const score=mu(A)+mu(G);
  const axis=score===0?"horizontal":score>0?"vertical":"diagonal";
  const tau=mod2(mu(n3(E))+phi(centerRune));

  const centerRow=mod2(1+B[1]+E[0]+center[0]+mu(n2(B)));
  const centerColumn=mod2(1+B[0]+E[0]+center[0]);

  const endpointRow=mod2(1+currentPhase+mu(n2(center)));
  const leftmostRow=mod2(
    centerRow+1+currentPhase+mu(center[0])
  );

  const allowance=mu(n0(E))===0&&mu(n3(E))===0?1:0;

  const Z=[...nodeCells].sort(
    (a,b)=>a[0]-b[0]||a[1]-b[1]
  ).at(-1);
  const distance=Math.max(
    Math.abs(Z[0]-L[0]),
    Math.abs(Z[1]-L[1])
  );
  const nextMirror=distance%3!==2;

  return {
    axis,
    tau,
    centerParity:{row:centerRow,column:centerColumn},
    rowParity:{endpoint:endpointRow,leftmost:leftmostRow},
    allowance,
    nextMirror,
    leftmost:L
  };
}

/**
 * Does at least one >=2-cell straight block from start satisfy the forecast?
 * @param {[number,number]} start
 * @param {{axis:string,tau:number,rowParity:{endpoint:number,leftmost:number}}} forecast
 */
function successorBlockExists(start,forecast){
  let dirs;
  if(forecast.axis==="horizontal")dirs=[[0,-1],[0,1]];
  else if(forecast.axis==="vertical")dirs=[[-1,0],[1,0]];
  else dirs=[[-1,-1],[-1,1],[1,-1],[1,1]];

  for(const direction of dirs){
    const cells=[];
    let q=[...start];
    while(inBounds(q)){
      cells.push([...q]);
      if(cells.length>=2){
        const L=leftmost(cells);
        const tau=same(L,cells[0])?1:same(L,cells.at(-1))?0:-1;
        if(
          tau===forecast.tau&&
          cells.at(-1)[0]%2===forecast.rowParity.endpoint&&
          L[0]%2===forecast.rowParity.leftmost
        ){
          return true;
        }
      }
      q=[q[0]+direction[0],q[1]+direction[1]];
    }
  }
  return false;
}

// Upstream source-selected conditional THE state.
const theCells=[[9,19],[9,18]];
const theCenter=[14,4];
const theCenterRune=at(...theCenter);
const theNode=[[11,4],[14,4],[17,4]];
const thePhase=1;
const theS=22;
const theOuter=0;

assert.equal(T[theCenterRune],"X");

const incomingKey=predictSignature(theCells,theS,theOuter);
assert.equal(incomingKey.phase,1);
assert.equal(incomingKey.outer,1);
assert.deepEqual(incomingKey.signature,[1,-1,1]);
assert.equal(incomingKey.SNext,23);

const incomingGeometry=predictGeometry(
  theCells,
  theCenter,
  theCenterRune,
  theNode,
  thePhase
);
assert.equal(incomingGeometry.axis,"diagonal");
assert.equal(incomingGeometry.tau,0);
assert.deepEqual(incomingGeometry.centerParity,{row:1,column:1});
assert.deepEqual(incomingGeometry.rowParity,{endpoint:0,leftmost:0});
assert.equal(incomingGeometry.allowance,1);
assert.equal(incomingGeometry.nextMirror,false);

// Enumerate every original node on every axis/radius.
const nodes=[];
const unitMirrors=[];
for(let r=1;r<=27;r++){
  for(let c=1;c<=27;c++){
    for(const axis of axes){
      for(let radius=1;radius<=13;radius++){
        const p1=[r-axis[0]*radius,c-axis[1]*radius];
        const p2=[r+axis[0]*radius,c+axis[1]*radius];
        if(!inBounds(p1)||!inBounds(p2))break;
        const raw=[at(...p1),at(r,c),at(...p2)];
        if(raw[1]===0)continue;

        const node={
          center:[r,c],
          axis,
          radius,
          p1,
          p2,
          raw,
          mirror:raw[0]===raw[2]
        };
        nodes.push(node);
        if(radius===1&&node.mirror)unitMirrors.push(node);
      }
    }
  }
}

// Candidate keys must satisfy THE's precommitted key reports. Their boundary
// outer must lie on the physical p1->p2 row (row20), and the candidate
// ciphertext start is generated by +/-phi(radius) vertically from that outer.
// This family deliberately permits both direct and center-totient derivations.
const keyStarts=[];
for(const node of nodes){
  if(node.center[0]%2!==incomingGeometry.centerParity.row)continue;
  if(node.center[1]%2!==incomingGeometry.centerParity.column)continue;
  if(node.mirror!==incomingGeometry.nextMirror)continue;

  for(const transform of transforms(node.raw)){
    if(
      JSON.stringify(signature(transform.key))!==
      JSON.stringify(incomingKey.signature)
    ){
      continue;
    }

    for(const boundary of [node.p1,node.p2].filter(cell=>cell[0]===20)){
      for(const sign of [-1,1]){
        const start=[
          boundary[0]+sign*phi(node.radius),
          boundary[1]
        ];
        if(!inBounds(start))continue;
        if(
          rayOffset(incomingGeometry.leftmost,start)>
          incomingGeometry.allowance
        ){
          continue;
        }
        keyStarts.push({
          ...node,
          transform:transform.mode,
          derived:transform.key,
          boundary,
          start
        });
      }
    }
  }
}

assert.equal(keyStarts.length,8);

// For each source-valid key/start, exhaust all diagonal blocks compatible with
// THE's predicted leftmost-END orientation and row parities. The local successor
// test is intentionally widened:
// - all four cardinal phi(center) moves from the non-boundary outer;
// - both adjacent physical-boundary cells;
// - both direct and center-totient successor-key transforms;
// - only existence, not plaintext, for the successor ciphertext.
const survivors=[];
for(const keyStart of keyStarts){
  const nonBoundary=same(keyStart.p1,keyStart.boundary)
    ?keyStart.p2
    :keyStart.p1;

  const successorStarts=[];
  for(const direction of cardinals){
    const start=[
      nonBoundary[0]+direction[0]*phi(keyStart.raw[1]),
      nonBoundary[1]+direction[1]*phi(keyStart.raw[1])
    ];
    if(inBounds(start))successorStarts.push(start);
  }

  const boundaryMirrors=[];
  for(const dc of [-1,1]){
    const neighbor=[
      keyStart.boundary[0],
      keyStart.boundary[1]+dc
    ];
    if(!inBounds(neighbor))continue;

    for(const mirror of unitMirrors){
      if(same(mirror.p1,neighbor)||same(mirror.p2,neighbor)){
        boundaryMirrors.push({neighbor,mirror});
      }
    }
  }

  for(const dr of [-1,1]){
    const read=[dr,-1];
    const cells=[];
    let q=[...keyStart.start];

    while(inBounds(q)){
      cells.push([...q]);

      if(cells.length>=2){
        const L=leftmost(cells);
        const tau=same(L,cells[0])?1:same(L,cells.at(-1))?0:-1;
        const rowPass=
          cells.at(-1)[0]%2===incomingGeometry.rowParity.endpoint&&
          L[0]%2===incomingGeometry.rowParity.leftmost;

        if(tau===incomingGeometry.tau&&rowPass){
          const outgoingKey=predictSignature(
            cells,
            incomingKey.SNext,
            incomingKey.outer
          );
          const outgoingGeometry=predictGeometry(
            cells,
            keyStart.center,
            keyStart.raw[1],
            [keyStart.p1,keyStart.center,keyStart.p2],
            incomingKey.phase
          );

          const pairs=[];
          for(const successorStart of successorStarts){
            if(
              rayOffset(
                outgoingGeometry.leftmost,
                successorStart
              )>outgoingGeometry.allowance
            ){
              continue;
            }

            for(const boundaryMirror of boundaryMirrors){
              const mirror=boundaryMirror.mirror;
              if(
                mirror.center[0]%2!==
                  outgoingGeometry.centerParity.row||
                mirror.center[1]%2!==
                  outgoingGeometry.centerParity.column||
                mirror.mirror!==outgoingGeometry.nextMirror
              ){
                continue;
              }

              for(const transform of transforms(mirror.raw)){
                if(
                  JSON.stringify(signature(transform.key))!==
                  JSON.stringify(outgoingKey.signature)
                ){
                  continue;
                }

                if(!successorBlockExists(successorStart,outgoingGeometry)){
                  continue;
                }

                pairs.push({
                  successorStart,
                  neighbor:boundaryMirror.neighbor,
                  mirror,
                  transform:transform.mode,
                  outgoingKey,
                  outgoingGeometry
                });
              }
            }
          }

          if(pairs.length){
            survivors.push({
              keyStart,
              read,
              cells:[...cells],
              pairs
            });
          }
        }
      }

      q=[q[0]+read[0],q[1]+read[1]];
    }
  }
}

assert.equal(survivors.length,1);
const winner=survivors[0];

assert.deepEqual(winner.keyStart.raw.map(i=>T[i]),["E","O","D"]);
assert.equal(winner.keyStart.transform,"direct");
assert.deepEqual(winner.keyStart.center,[13,17]);
assert.deepEqual(winner.keyStart.axis,[1,1]);
assert.equal(winner.keyStart.radius,7);
assert.deepEqual(winner.keyStart.boundary,[20,24]);
assert.deepEqual(winner.keyStart.start,[14,24]);
assert.deepEqual(winner.read,[1,-1]);
assert.deepEqual(winner.cells,[[14,24],[15,23],[16,22]]);

// Phase 1 aligns the direct E-O-D key by one cyclic left rotation.
const aligned=[
  winner.keyStart.raw[1],
  winner.keyStart.raw[2],
  winner.keyStart.raw[0]
];
assert.deepEqual(aligned.map(i=>T[i]),["O","D","E"]);

const plaintext=winner.cells.map(
  (cell,i)=>mod(at(...cell)-aligned[i%aligned.length])
);
assert.deepEqual(plaintext.map(i=>T[i]),["EA","S","T"]);

// The physical-boundary successor key is source-selected even though the next
// ciphertext start remains two-way under this broadened local grammar.
const mirrorNames=new Set(
  winner.pairs.map(pair=>pair.mirror.raw.map(i=>T[i]).join("-"))
);
assert.deepEqual([...mirrorNames],["H-T-H"]);

const mirrorCenters=new Set(
  winner.pairs.map(pair=>pair.mirror.center.join(","))
);
assert.deepEqual([...mirrorCenters],["19,26"]);

const successorStartSet=new Set(
  winner.pairs.map(pair=>pair.successorStart.join(","))
);
assert.deepEqual(
  [...successorStartSet].sort(),
  ["4,10","6,12"]
);

console.log(JSON.stringify({
  status:"PASS: source/successor family uniquely selects conditional EAST",
  incoming:{
    signature:incomingKey.signature,
    phase:incomingKey.phase,
    centerParity:incomingGeometry.centerParity,
    mirror:incomingGeometry.nextMirror,
    axis:incomingGeometry.axis,
    tau:incomingGeometry.tau,
    rowParity:incomingGeometry.rowParity,
    rayAllowance:incomingGeometry.allowance
  },
  keyStartCandidates:keyStarts.length,
  survivors:survivors.length,
  selected:{
    key:winner.keyStart.raw.map(i=>T[i]),
    transform:winner.keyStart.transform,
    center:winner.keyStart.center,
    radius:winner.keyStart.radius,
    boundary:winner.keyStart.boundary,
    start:winner.keyStart.start,
    cells:winner.cells,
    plaintext:plaintext.map(i=>T[i])
  },
  successor:{
    key:[...mirrorNames][0],
    center:[...mirrorCenters][0],
    candidateStarts:[...successorStartSet].sort()
  },
  caveat:"Reports 01-08 and the physical-boundary/successor grammar remain provisional and post-hoc. This test selects EAST without plaintext feedback inside the declared widened family; it does not yet select the following OF ciphertext start."
},null,2));
