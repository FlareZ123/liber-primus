'use strict';

/**
 * Source-only p0–2 27×27 geometry and 13/phi13 anchor equivalence.
 * Eight 27-square dihedral orientations are equally lossless. Compare only
 * independently visible 13 and phi(13)=12 anchor placements (both row/col
 * orders and one- versus zero-based coordinate conventions), without any
 * proposed English plaintext or ciphertext score.
 *
 * Windows Node22: node sims/lp2_p0_square27_anchor_symmetry_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const N = 27;
const runes = corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(runes.length,N*N);
assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
assert.equal(corpus.translit[11],'J');

const visible = [
  ['identity', (r,c)=>[r,c]],
  ['flip-rows', (r,c)=>[26-r,c]],
  ['flip-columns', (r,c)=>[r,26-c]],
  ['half-turn', (r,c)=>[26-r,26-c]],
  ['transpose', (r,c)=>[c,r]],
  ['transpose-flip-rows', (r,c)=>[26-c,r]],
  ['transpose-flip-columns', (r,c)=>[c,26-r]],
  ['transpose-half-turn', (r,c)=>[26-c,26-r]]
];
const anchors = [
  [13,12], [12,13],       // one-based 13 and phi(13)=12
  [14,13], [13,14]        // same literals treated as zero-based
];
const axes=[[0,1],[1,0],[1,1],[1,-1]];

/** @param {number[]} grid @returns {{row:number,col:number,dr:number,dc:number,outer:string[]}[]} */
function findReversedNameJNodes(grid) {
  const out=[];
  for (let r=1;r<N-1;r++) for (let c=1;c<N-1;c++) {
    if(grid[r*N+c]!==11) continue;
    for (const [dr,dc] of axes) {
      const [r0,c0,r1,c1]=[r-dr,c-dc,r+dr,c+dc];
      if(r0<0||r1>=N||c0<0||c1<0||c0>=N||c1>=N) continue;
      const left=corpus.translit[grid[r0*N+c0]];
      const right=corpus.translit[grid[r1*N+c1]];
      if (left.length===2 && right===left.split('').reverse().join('') && left!==right) {
        out.push({row:r+1,col:c+1,dr,dc,outer:[left,right]});
      }
    }
  }
  return out;
}

function main() {
  const found=[];
  const exact=[];
  for (const [name,transform] of visible) {
    const grid=Array(N*N).fill(-1);
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){
      const [x,y]=transform(r,c);
      assert.ok(x>=0&&x<N&&y>=0&&y<N);
      grid[x*N+y]=runes[r*N+c];
    }
    assert.ok(!grid.includes(-1));
    assert.deepEqual(grid.slice().sort((a,b)=>a-b),
      runes.slice().sort((a,b)=>a-b));
    const j= findReversedNameJNodes(grid);
    assert.equal(j.length,1, 'Exactly one J-centred AE/EA or EO/OE opposed glyph pair');
    found.push({orientation:name,center:[j[0].row,j[0].col],
      axis:[j[0].dr,j[0].dc],outer:j[0].outer});
    for (const [r,c] of anchors) {
      if (j.some(n=>n.row===r&&n.col===c)) {
        exact.push({orientation:name,anchor:[r,c]});
      }
    }
  }
  assert.deepEqual(exact,[
    {orientation:'identity',anchor:[13,12]},
    {orientation:'transpose',anchor:[12,13]}
  ]);
  assert.equal(found.length,8);
  assert.deepEqual(runes.slice(334,337).map(x=>corpus.translit[x]),['AE','J','EA']);
  assert.equal(11, corpus.translit.indexOf('J'));
  console.log(JSON.stringify({
    original_runes:runes.length,
    anchor_grid_candidates:visible.length*anchors.length,
    source_selected_full_orientation_candidates:exact,
    all_8_original_geometry_j_nodes:found
  },null,2));
  console.log('PASS: source-only anchor 2-of-32 equivalence; no plaintext fit or decryption claim.');
}
main();
