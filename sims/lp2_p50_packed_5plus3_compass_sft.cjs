"use strict";
/**
 * Original LP2 256-byte 32-by-8 grid: two literal 5+3-bit
 * rune/compass interpretations. Read-only Node.js 22 SFT.
 *
 * Byte-to-state alternatives:
 *  A: rune=B>>>3 (5 bits); direction=B&7 (3 bits).
 *  B: rune=B&31 (5 bits); direction=B>>>5 (3 bits).
 * The 29 GP runes occupy labels 0..28; 29..31 are explicit
 * unassigned controls, never silently reduced modulo 29.
 *
 * Eight compass vectors begin N,NE,E,SE,S,SW,W,NW; all eight
 * rotations and both handedness choices are included.
 * Explore both physical-edge exits and toroidal wrapping,
 * retaining a source-selected one-based start at cell 103
 * from the original p48 GEMY fourgram / GP(Y)=103.
 *
 * No manuscript instruction selects this codec or compass
 * orientation. This is a bounded competing architecture
 * check, not a cryptographic proof or plaintext recovery.
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const source = require("../resources/liber-primus/base60-grid.json");
const BYTES = source.byte_rows.flat();
const D = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
assert.equal(BYTES.length,256);
assert.deepEqual(source.byte_rows.map(x=>x.length),Array(32).fill(8));
const p48=corpus.pages.find(p=>p.page===48);
assert.deepEqual(p48.indices.slice(139,143),[6,18,19,26]);
assert.equal(corpus.prime[26],103);
assert.equal(source.rows.flat()[102],"0W");
assert.equal(BYTES[102],32);

/**
 * @param {number} sourceStart One-based cell.
 * @param {number} mode 0=high5 rune/low3 direction; 1=low5 rune/high3 direction.
 * @param {number} rotation N-origin rotated clockwise.
 * @param {boolean} reflect Reverse the direction ring.
 * @param {boolean} wrap Wrap row/column modulo 32/8 or terminate at edge.
 * @returns {{cells:number[],labels:number[],reason:string,cycleLength:number}}
 */
function walk(sourceStart,mode,rotation,reflect,wrap){
  let at=sourceStart-1;
  const seen=new Map(),cells=[],labels=[];
  for(;;){
    if(seen.has(at))
      return {cells,labels,reason:"cycle",cycleLength:cells.length-seen.get(at)};
    assert.ok(cells.length<256,"A deterministic finite state repeats before 257 entries");
    seen.set(at,cells.length);
    const byte=BYTES[at];
    const letter=mode===0?byte>>>3:byte&31;
    const d=mode===0?byte&7:byte>>>5;
    cells.push(at+1);labels.push(letter);
    const delta=D[(rotation+(reflect?-d:d)+8)%8];
    const r=Math.floor(at/8)+delta[0], c=at%8+delta[1];
    if(!wrap && (r<0||r>=32||c<0||c>=8))
      return {cells,labels,reason:"edge",cycleLength:0};
    at=((r+32)%32)*8+(c+8)%8;
  }
}

/** @returns {object} Exact exhaustive original-grid census. */
function main(){
  const tally={edge:{max:0,maxAt103:0,minAt103:256},
    wrap:{max:0,maxAt103:0,minAt103:256}};
  let checked=0;
  for(let mode=0;mode<2;mode++)
    for(let rotation=0;rotation<8;rotation++)
      for(const reflect of [false,true])
        for(const wrap of [false,true]){
          const kind=wrap?"wrap":"edge",bucket=tally[kind];
          for(let start=1;start<=256;start++){
            const got=walk(start,mode,rotation,reflect,wrap);
            bucket.max=Math.max(bucket.max,got.cells.length);
            if(start===103){
              bucket.maxAt103=Math.max(bucket.maxAt103,got.cells.length);
              bucket.minAt103=Math.min(bucket.minAt103,got.cells.length);
            }
          }
          checked++;
        }
  assert.equal(checked,64);
  assert.deepEqual(tally,{
    edge:{max:19,maxAt103:13,minAt103:2},
    wrap:{max:24,maxAt103:13,minAt103:2}
  });
  const canonicalA=walk(103,0,0,false,false);
  const canonicalB=walk(103,1,0,false,false);
  assert.deepEqual(canonicalA.cells,[103,95,87,78,70,63,71,64]);
  assert.deepEqual(canonicalA.labels,[4,7,13,18,9,15,21,6]);
  assert.deepEqual(canonicalB.cells,[103,96]);
  assert.deepEqual(canonicalB.labels,[0,3]);
  assert.equal(canonicalA.reason,"edge");
  assert.equal(canonicalB.reason,"edge");
  const countInvalid=mode=>BYTES.filter(byte=>
    (mode===0?(byte>>>3):(byte&31))>=29).length;
  assert.deepEqual([countInvalid(0),countInvalid(1)],[25,16]);
  return {
    originalTable:{cells:256,rows:32,columns:8,
      unassignedCodes5high:25,unassignedCodes5low:16},
    sourcePointer:{page:48,runeOffset:139,wordPart:"GEMY",cell:103,
      canonicalByte:32},
    tested:{interpretations:2,rotations:8,handedness:2,
      boundaryConventions:2,totalGraphs:checked,startsPerGraph:256},
    pathLengths:tally,
    directNClockwise:{
      high5Remainder:{cells:canonicalA.cells,
        labels:canonicalA.labels.map(k=>corpus.translit[k]),
        termination:canonicalA.reason},
      low5Remainder:{cells:canonicalB.cells,
        labels:canonicalB.labels.map(k=>corpus.translit[k]),
        termination:canonicalB.reason}
    },
    conclusion:"No one-pass source-selected binary 5+3 compass walk produces a full 76-rune p55 key, let alone a complete unknown-page plaintext."
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+"\n");
module.exports={walk,main};
