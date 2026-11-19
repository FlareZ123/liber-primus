"use strict";

/**
 * Director #1789 source-first p50 geometry audit.
 *
 * Source inventory:
 *   three original table pages contain 10,13,9 rows respectively;
 *   each row has exactly 8 tokens, yielding 32x8=256 cells.
 *
 * Three predeclared literal coordinate interpretations:
 *   1. global [row mod29,column];
 *   2. global [distance-to-nearest-row-edge,distance-to-nearest-column-edge];
 *   3. physical-page-local [local row,column].
 *
 * Control target is the solved-p57 typed state relation fixed independently
 * by Director #1778. We charge complete row/column rotations/reflections and
 * pair-order swaps. Unknown-page results are never consulted.
 */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");

const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
assert.deepEqual(grid.pages.map(page=>[page.rows,page.cols,page.tokens.length]),[
  [10,8,80],[13,8,104],[9,8,72],
]);

const addresses=[20,105,38,56,83]; // THE DIVINITY WITHIN AND EMERGE
const targets=[[3,15],[2,5],[4,17],[8,22],[6,19]];
const pageRows=[10,13,9];
const pageStarts=[0,10,23];

function matchesTraining(pairs){
  return pairs.slice(0,4).reduce((n,pair,index)=>
    n+(pair[0]===targets[index][0]&&pair[1]===targets[index][1]?1:0),0
  );
}
function heldout(pairs){
  return pairs[4][0]===targets[4][0]&&pairs[4][1]===targets[4][1];
}
function swap(pair,yes){return yes?[pair[1],pair[0]]:pair;}

// 1/2. Global 32x8 toroidal row/column rotations, optional axis reflections,
// pair-order swap. Both literal global coordinates and edge-distance typing.
const global={coordinate:{charged:0,bestTraining:-1,bestCount:0,bestHeldout:0},
              edge:{charged:0,bestTraining:-1,bestCount:0,bestHeldout:0}};

function charge(summary,pairs){
  summary.charged+=1;
  const score=matchesTraining(pairs), hold=heldout(pairs);
  if(score>summary.bestTraining){
    summary.bestTraining=score;summary.bestCount=1;summary.bestHeldout=hold?1:0;
  }else if(score===summary.bestTraining){
    summary.bestCount+=1;if(hold)summary.bestHeldout+=1;
  }
}

for(let rowRotation=0;rowRotation<32;rowRotation++){
  for(let columnRotation=0;columnRotation<8;columnRotation++){
    for(const rowReflect of [false,true]){
      for(const columnReflect of [false,true]){
        for(const swapPair of [false,true]){
          const coordPairs=[];
          const edgePairs=[];
          for(const address of addresses){
            let row=Math.floor(address/8),column=address%8;
            row=(row+rowRotation)%32;
            column=(column+columnRotation)%8;
            if(rowReflect) row=31-row;
            if(columnReflect) column=7-column;
            coordPairs.push(swap([row%29,column],swapPair));
            edgePairs.push(swap([
              Math.min(row,31-row),
              Math.min(column,7-column),
            ],swapPair));
          }
          charge(global.coordinate,coordPairs);
          charge(global.edge,edgePairs);
        }
      }
    }
  }
}
assert.equal(global.coordinate.charged,2048);
assert.equal(global.edge.charged,2048);
assert.equal(global.coordinate.bestTraining,1);
assert.equal(global.coordinate.bestHeldout,0);
assert.equal(global.edge.bestTraining,1);
assert.equal(global.edge.bestHeldout,0);

// 3. Physical-page-local coordinates. Charge independent row rotations and
// reflections within the source-visible 10/13/9 row blocks, plus the common
// 8-column rotation/reflection and pair-order swap.
function pageLocal(globalRow){
  for(let page=0;page<pageRows.length;page++){
    const start=pageStarts[page],rows=pageRows[page];
    if(globalRow>=start&&globalRow<start+rows){
      return {page,localRow:globalRow-start,rows};
    }
  }
  throw new Error("row outside p50");
}

const local={charged:0,bestTraining:-1,bestCount:0,bestHeldout:0};
for(let r0=0;r0<10;r0++){
 for(let r1=0;r1<13;r1++){
  for(let r2=0;r2<9;r2++){
   const rotations=[r0,r1,r2];
   for(let columnRotation=0;columnRotation<8;columnRotation++){
    for(let reflectMask=0;reflectMask<16;reflectMask++){
     for(const swapPair of [false,true]){
      const pairs=[];
      for(const address of addresses){
       const globalRow=Math.floor(address/8);
       let column=address%8;
       const info=pageLocal(globalRow);
       let row=(info.localRow+rotations[info.page])%info.rows;
       column=(column+columnRotation)%8;
       if(reflectMask&(1<<info.page)) row=info.rows-1-row;
       if(reflectMask&8) column=7-column;
       pairs.push(swap([row,column],swapPair));
      }
      charge(local,pairs);
     }
    }
   }
  }
 }
}
assert.equal(local.charged,299520);
assert.equal(local.bestTraining,1);
assert.equal(local.bestHeldout,0);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "source-first negative for three literal p50 row/column state-pair interpretations",
  sourceGeometry:{
    pages:grid.pages.map(page=>({
      page:page.page,image:page.image,rows:page.rows,cols:page.cols,
      cells:page.tokens.length,
    })),
    combinedShape:[32,8],
    physicalRowPartition:[10,13,9],
  },
  frozenSolvedControl:{
    addresses,
    targets,
    words:["THE","DIVINITY","WITHIN","AND","EMERGE"],
    heldout:"EMERGE",
  },
  interpretations:{
    globalCoordinate:global.coordinate,
    nearestFrameEdge:global.edge,
    pageLocalCoordinate:local,
  },
  decision:
    "No literal row/column coordinate type survives solved p57 training; do not apply these geometry types to unknown LP2. Preserve the 1D token tape unless a new visual clue selects a richer operation.",
},null,2));
