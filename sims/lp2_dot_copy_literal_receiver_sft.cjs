// Director #3154. Run from repository root: node sims/lp2_dot_copy_literal_receiver_sft.cjs
'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json','utf8'));
/** @param {Array<string|number>} s @returns {number[]} */
const triples = s => s.slice(0,-2).flatMap((x,i)=>x===s[i+1]&&x===s[i+2]?[i]:[]);
/** @param {Array<Array<string|number>>} rows */
const matrix = rows => {
  const cols=rows[0].map((_,i)=>rows.map(row=>row[i]));
  return {shape:[rows.length,rows[0].length],
    rowTriples:rows.flatMap((row,i)=>triples(row).map(j=>[i,j])),
    columnTriples:cols.flatMap((col,i)=>triples(col).map(j=>[j,i])),
    centerPairMatches:rows.filter(row=>row[Math.floor((row.length-1)/2)]===row[Math.floor((row.length-1)/2)+1]).length};
};
// LP1 scan05 mixed table after the established word->GP prime sum; scan16 printed integers.
const m05=[[272,138,341,131,151],[366,199,130,320,18],[226,245,91,245,226],[18,320,130,199,366],[151,131,341,138,272]];
const m16=[[434,1311,312,278,966],[204,812,934,280,1071],[626,620,809,620,626],[1071,280,934,812,204],[966,278,312,1311,434]];
// LP2 physical p15, scan32 printed integers.
const m32=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const plant=Array.from({length:5},(_,i)=>[i,10+i,20+i]).map(([l,c,r])=>[l,c,c,c,r]);
const rows=grid.pages.flatMap(p=>Array.from({length:p.rows},(_,i)=>p.tokens.slice(i*8,i*8+8)));
const unknown=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(unknown.length,12956);
assert.deepEqual(matrix(plant).rowTriples,[[0,1],[1,1],[2,1],[3,1],[4,1]]);
const output={p05:matrix(m05),p16:matrix(m16),p15:matrix(m32),p49_51:matrix(rows),plant:matrix(plant),p57:triples(corpus.pages[57].indices),allUnknown:triples(unknown),allUnknownLength:unknown.length};
console.log(JSON.stringify(output,null,2));
