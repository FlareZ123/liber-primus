'use strict';
/**
 * Exact all-key direct QR-v2 finder/module gate on original LP2 p0..p2.
 *
 * Original GP29 ciphertext 262+266+201=729 runes -> 27x27. A QR version2
 * is 25x25. Test ALL nine embedded 25x25 crops and eight dihedral rotations,
 * allowing ANY fixed mapping from the 29 rune values to binary modules.
 *
 * Fixed QR2 modules: three 7x7 finder motifs, 1-module separators,
 * 18 timing modules, 5x5 alignment centered at (18,18), and 1 dark module
 * at (17,8). Omit format bits, masked payload, and entire quiet-zone;
 * this favors the candidate (236 compulsory bits only).
 *
 * Pattern reference: ZXing MatrixUtil.java, originally 2008, QR v2.
 * No libraries, no external calls. Node.js22 Windows CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname,'..','resources','liber-primus','lp2-corpus.json'), 'utf8'));
const pageLengths = corpus.pages.slice(0,3).map(p => p.indices.length);
assert.deepEqual(pageLengths, [262, 266, 201]);
const original = corpus.pages.slice(0,3).flatMap(p => p.indices);
assert.equal(original.length, 27 * 27);
const required = new Map();
/**
 * Record a frozen required bit in QR coordinates.
 * @param {number} row @param {number} col
 * @param {number} bit @param {string} label
 */
function put(row,col,bit,label){
  assert.ok(row>=0 && row<25 && col>=0 && col<25);
  assert.ok(bit===0 || bit===1);
  const index=row*25+col,prior=required.get(index);
  if(prior) assert.equal(prior.bit,bit,'Contradictory QR basic patterns');
  required.set(index,{row,col,bit,label});
}
// Three standard finder squares, no fourth finder at bottom right.
for(const [r0,c0] of [[0,0],[0,18],[18,0]])
  for(let dr=0;dr<7;dr++)
    for(let dc=0;dc<7;dc++){
      const ring=Math.max(Math.abs(dr-3),Math.abs(dc-3));
      put(r0+dr,c0+dc,(ring===3||ring<=1)?1:0,'finder');
    }
// Horizontal/vertical 1-module white separators, not data bits.
for(let t=0;t<8;t++){
  put(7,t,0,'separator'); put(t,7,0,'separator');
  put(7,17+t,0,'separator'); put(t,17,0,'separator');
  put(17,t,0,'separator'); put(17+t,7,0,'separator');
}
// QR2 timing row and column, from the original ZXing rule (t+1) mod2.
for(let t=8;t<=16;t++){
  put(6,t,(t+1)%2,'timing');
  put(t,6,(t+1)%2,'timing');
}
// QR-v2 alignment marker centered at (18,18).
for(let dr=0;dr<5;dr++)
  for(let dc=0;dc<5;dc++){
    const ring=Math.max(Math.abs(dr-2),Math.abs(dc-2));
    put(16+dr,16+dc,(ring===2||ring===0)?1:0,'alignment');
  }
// Standard fixed dark dot, independent of format-information/ECL mask.
put(17,8,1,'dark');
const fixture = [...required.values()];
assert.equal(fixture.length,236);
/**
 * Exact minimum number of compulsory modules wrong over ALL 2^29 binary
 * mappings. Repeated rune values requiring both dark and light must conflict.
 * @param {number[]} tape @param {number} rowOffset
 * @param {number} colOffset @param {number} rotation
 * @param {number} mirrored
 */
function score(tape,rowOffset,colOffset,rotation,mirrored){
  assert.equal(tape.length,729);
  const tally=Array.from({length:29},()=>[0,0]);
  for(const p of fixture){
    let r=p.row,c=p.col;
    if(mirrored) c=24-c;
    for(let k=0;k<rotation;k++) [r,c]=[c,24-r];
    tally[tape[(rowOffset+r)*27+colOffset+c]][p.bit]++;
  }
  return {
    minErrors:tally.reduce((sum,values)=>sum+Math.min(...values),0),
    conflictedRunes:tally.filter(x=>x[0]>0&&x[1]>0).length
  };
}
const tested=[];
for(let rowOffset=0;rowOffset<=2;rowOffset++)
  for(let colOffset=0;colOffset<=2;colOffset++)
    for(let mirrored=0;mirrored<=1;mirrored++)
      for(let rotation=0;rotation<4;rotation++){
        tested.push({rowOffset,colOffset,mirrored,rotation,
          ...score(original,rowOffset,colOffset,rotation,mirrored)});
      }
assert.equal(tested.length,72);
tested.sort((a,b)=>a.minErrors-b.minErrors ||
  a.rowOffset-b.rowOffset || a.colOffset-b.colOffset ||
  a.mirrored-b.mirrored || a.rotation-b.rotation);
assert.equal(tested[0].minErrors,79);
assert.deepEqual(tested.slice(0,2).map(x=>
  [x.rowOffset,x.colOffset,x.mirrored,x.rotation,x.minErrors]),
  [[0,1,1,2,79],[0,1,0,3,80]]);
assert.equal(tested.at(-1).minErrors,95);

// Planted fixed QR module control: a static GP29 symbol dictionary CAN
// encode a valid 236-module skeleton, so the all-key detector must accept.
const plant=[...original],start=1;
for(const p of fixture)
  plant[(start+p.row)*27+start+p.col]=p.bit;
const positive=score(plant,1,1,0,0);
assert.equal(positive.minErrors,0);
assert.equal(positive.conflictedRunes,0);
// Change exactly one mandatory dark finder module to the established
// light-symbol index 0, leaving its unchanged peers as the contrast.
const altered=[...plant];
const dark=fixture.find(p=>p.label==='finder'&&p.bit===1);
altered[(start+dark.row)*27+start+dark.col]=0;
const negativeControl=score(altered,1,1,0,0);
assert.equal(negativeControl.minErrors,1);

const counts=Object.fromEntries(
  ['finder','separator','timing','alignment','dark'].map(name=>
    [name,fixture.filter(p=>p.label===name).length]));
assert.deepEqual(counts,{
  finder:147, separator:45, timing:18, alignment:25, dark:1
});
console.log(JSON.stringify({
  test:'LP2 p0-p2 GP29 binary direct QR2 code at all nine crops/eight symmetries',
  originals:{sourcePageCounts:pageLengths,runes:original.length},
  qrVersion:2,qrModules:'25x25',outerCandidate:'27x27',
  mandatoryOriginalModules:fixture.length,fixedClasses:counts,
  scoring:'exact optimum over arbitrary 29-rune -> {0,1} map',
  variants:tested.length,best:tested.slice(0,8),
  worstMinErrors:tested.at(-1).minErrors,
  plantedControl:positive,singleFlipControl:negativeControl,
  conclusion:'No fixed GP29-to-binary alphabet can produce a valid direct QR-v2 finder/alignment/timing fixture in any of the 72 arrangements. No plaintext.'
},null,2));
