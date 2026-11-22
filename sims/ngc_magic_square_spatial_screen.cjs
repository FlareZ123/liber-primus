#!/usr/bin/env node
'use strict';

// Conditional spatial-layout screen for the LP1 scan-05 5x5 magic square.
// Data subset is extracted from OpenNGC (CC-BY-SA-4.0); see JSON provenance.
const fs = require('node:fs');
const path = require('node:path');
const dataPath = process.argv[2] || path.join(__dirname, 'openngc-square-subset.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const matrix = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272],
];
const byId = new Map(data.objects.map(o => [o.id, o]));
const rad = Math.PI / 180;
function parseRa(s) {
  const [h, m, sec] = s.split(':').map(Number);
  return (h + m / 60 + sec / 3600) * 15;
}
function parseDec(s) {
  const sign = s.startsWith('-') ? -1 : 1;
  const [d, m, sec] = s.slice(1).split(':').map(Number);
  return sign * (d + m / 60 + sec / 3600);
}
const coords = new Map(data.objects.map(o => [o.id, [parseRa(o.ra), parseDec(o.dec)]]));
for (const row of matrix) for (const id of row) if (!coords.has(id)) throw new Error(`Missing NGC ${id}`);
const rowSums = matrix.map(row => row.reduce((a, b) => a + b, 0));
const colSums = Array.from({length:5}, (_,j)=>matrix.reduce((s,row)=>s+row[j],0));
const diagSums = [matrix.reduce((s,row,i)=>s+row[i],0), matrix.reduce((s,row,i)=>s+row[4-i],0)];
if (![...rowSums,...colSums,...diagSums].every(x=>x===1033)) throw new Error('Magic-square checksum mismatch');
function angularDistance(idA, idB) {
  const [ra1, dec1] = coords.get(idA).map(x => x * rad);
  const [ra2, dec2] = coords.get(idB).map(x => x * rad);
  const sd = Math.sin((dec2-dec1)/2), sr = Math.sin((ra2-ra1)/2);
  const h = sd*sd + Math.cos(dec1)*Math.cos(dec2)*sr*sr;
  return 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, h)))) / rad;
}
function metrics(grid) {
  const edges=[];
  for(let i=0;i<5;i++) for(let j=0;j<5;j++) {
    if(j<4) edges.push(angularDistance(grid[i][j],grid[i][j+1]));
    if(i<4) edges.push(angularDistance(grid[i][j],grid[i+1][j]));
  }
  return {
    total: edges.reduce((a,b)=>a+b,0),
    squared: edges.reduce((a,b)=>a+b*b,0),
    max: Math.max(...edges),
    median: edges.slice().sort((a,b)=>a-b)[Math.floor(edges.length/2)],
    edges,
  };
}
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
}
function shuffle(a, rng) {
  const out=a.slice();
  for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  return out;
}
function summarize(scores, observed) {
  const sorted=scores.slice().sort((a,b)=>a-b);
  const count=scores.filter(x=>x<=observed).length;
  return {
    trials:scores.length,
    count_at_or_below:count,
    p_add_one:(count+1)/(scores.length+1),
    mean:scores.reduce((a,b)=>a+b,0)/scores.length,
    quantiles:{p01:sorted[Math.floor(.01*sorted.length)],p05:sorted[Math.floor(.05*sorted.length)],p50:sorted[Math.floor(.50*sorted.length)],p95:sorted[Math.floor(.95*sorted.length)]},
  };
}
const observed=metrics(matrix);

function permutations(items) {
  if (items.length <= 1) return [items.slice()];
  const out=[];
  for(let i=0;i<items.length;i++) {
    const head=items[i];
    const rest=items.slice(0,i).concat(items.slice(i+1));
    for(const tail of permutations(rest)) out.push([head,...tail]);
  }
  return out;
}
function dihedralForms(grid) {
  const forms=[];
  const rotate=g=>g[0].map((_,j)=>g.map(row=>row[j]).reverse());
  const reflect=g=>g.map(row=>row.slice().reverse());
  let g=grid.map(row=>row.slice());
  for(let k=0;k<4;k++) { forms.push(g); forms.push(reflect(g)); g=rotate(g); }
  const uniqueForms=new Map(forms.map(g=>[JSON.stringify(g),g]));
  return [...uniqueForms.values()];
}
const unique=[...new Set(matrix.flat())];
const center=matrix[2][2];
// Exact magic-square-conditioned null. Central symmetry forces four opposite-value
// pairs to sum 471; the remaining four values occupy B,D,F,J. Enumerate every
// assignment and retain only matrices preserving all 12 magic sums.
const pairCandidates=[];
for(let i=0;i<unique.length;i++) for(let j=i+1;j<unique.length;j++) {
  const a=unique[i],b=unique[j];
  if(a!==center && b!==center && a+b===471) pairCandidates.push([a,b]);
}
const pairSet=new Set(pairCandidates.flat());
const leftovers=unique.filter(x=>x!==center && !pairSet.has(x));
if(pairCandidates.length!==4 || leftovers.length!==4) throw new Error('Unexpected complement-pair structure');
const roles=['AG','EI','CH','KL'];
const validMagic=[];
for(const pairOrder of permutations(pairCandidates)) {
  for(let mask=0;mask<16;mask++) {
    const roleValues={};
    roles.forEach((role,k)=>{const p=pairOrder[k];roleValues[role]=(mask&(1<<k))?[p[1],p[0]]:[p[0],p[1]];});
    for(const rem of permutations(leftovers)) {
      const [B,D,F,J]=rem;
      const [A,G]=roleValues.AG,[E,I]=roleValues.EI,[C,H]=roleValues.CH,[K,L]=roleValues.KL;
      const grid=[[A,B,C,D,E],[F,G,H,I,J],[K,L,center,L,K],[J,I,H,G,F],[E,D,C,B,A]];
      const rows=grid.map(row=>row.reduce((a,b)=>a+b,0));
      const cols=Array.from({length:5},(_,j)=>grid.reduce((s,row)=>s+row[j],0));
      const diags=[grid.reduce((s,row,i)=>s+row[i],0),grid.reduce((s,row,i)=>s+row[4-i],0)];
      if([...rows,...cols,...diags].every(x=>x===1033)) validMagic.push({grid,cost:metrics(grid)});
    }
  }
}
if(validMagic.length!==32) throw new Error(`Expected 32 valid magic squares, got ${validMagic.length}`);
const sortedMagic=validMagic.slice().sort((a,b)=>a.cost.total-b.cost.total);
const minCost=sortedMagic[0].cost.total;
const minMagic=sortedMagic.filter(x=>Math.abs(x.cost.total-minCost)<1e-9);
const sourceForms=new Set(dihedralForms(matrix).map(g=>JSON.stringify(g)));
const allMinAreDihedral=minMagic.every(x=>sourceForms.has(JSON.stringify(x.grid)));
const costLevels={};
for(const x of validMagic){const k=x.cost.total.toFixed(6);costLevels[k]=(costLevels[k]||0)+1;}
const pairPositions=[];
for(let i=0;i<5;i++) for(let j=0;j<5;j++) {
  const ii=4-i, jj=4-j;
  if(i<ii || (i===ii && j<jj)) pairPositions.push([[i,j],[ii,jj]]);
}
if(pairPositions.length!==12) throw new Error('Expected 12 antipodal pairs');
const pairIds=pairPositions.map(([[i,j],[ii,jj]])=>{
  if(matrix[i][j]!==matrix[ii][jj]) throw new Error('Square not 180-degree symmetric');
  return matrix[i][j];
});
if(new Set(pairIds).size!==12 || center!==91) throw new Error('Unexpected pair/center multiplicity');
const N=100000;
// Null A: preserve exact center and 180-degree pairing, randomize which object occupies each pair.
const rngA=xorshift32(0x28a46);
const pairScores=[];
const pairSquared=[];
const pairMax=[];
for(let t=0;t<N;t++){
  const perm=shuffle(pairIds,rngA);
  const grid=Array.from({length:5},()=>Array(5).fill(null));
  grid[2][2]=center;
  for(let k=0;k<pairPositions.length;k++){
    const [[i,j],[ii,jj]]=pairPositions[k];
    grid[i][j]=perm[k]; grid[ii][jj]=perm[k];
  }
  const m=metrics(grid); pairScores.push(m.total); pairSquared.push(m.squared); pairMax.push(m.max);
}
// Null B: preserve the full 25-cell multiset, but randomize all cell locations.
const rngB=xorshift32(0x28a47);
const multiset=matrix.flat();
const freeScores=[];
for(let t=0;t<N;t++){
  const p=shuffle(multiset,rngB);
  const grid=Array.from({length:5},(_,i)=>p.slice(i*5,i*5+5));
  freeScores.push(metrics(grid).total);
}
const lowerTail = (scores, observedValue) => {
  const n=scores.filter(x=>x<=observedValue).length;
  return {count_at_or_below:n,p_add_one:(n+1)/(scores.length+1)};
};
const upperTail = (scores, observedValue) => {
  const n=scores.filter(x=>x>=observedValue).length;
  return {count_at_or_above:n,p_add_one:(n+1)/(scores.length+1)};
};
const out={
  classification:'exploratory conditional geometry test; not a decryption or calibrated discovery p-value',
  source:data.source,
  matrix,
  unique_ids:unique,
  object_types:Object.fromEntries(unique.map(id=>[id,byId.get(id).type])),
  constellations:Object.fromEntries(unique.map(id=>[id,byId.get(id).const])),
  magic_sums:{rows:rowSums,columns:colSums,diagonals:diagSums},
  observed:{total_edge_degrees:observed.total,mean_edge_degrees:observed.total/40,sum_squared_edge_degrees:observed.squared,max_edge_degrees:observed.max,median_edge_degrees:observed.median},
  exact_magic_square_conditioned_null:{valid_matrices:validMagic.length,distinct_cost_levels:costLevels,min_cost: minCost,min_count:minMagic.length,exact_rank_fraction:minMagic.length/validMagic.length,all_minima_are_dihedral_forms_of_source:allMinAreDihedral,source_matrix_is_minimum:Math.abs(observed.total-minCost)<1e-9},
  null_A_fixed_center_and_antipodal_pairs:{total_length:summarize(pairScores,observed.total),sum_squared:lowerTail(pairSquared,observed.squared),max_edge:lowerTail(pairMax,observed.max)},
  null_B_free_25_cell_multiset:{total_length:summarize(freeScores,observed.total)},
  interpretation:'The source matrix is the minimum-cost spatial arrangement among 32 matrices with the same 13 values, center, 180-degree symmetry, and all 12 magic sums; four dihedral forms tie. The much smaller p-values from unconstrained permutations are not the appropriate discovery null because they destroy the magic-square constraints. The NGC interpretation and spatial metric were selected after inspection; no LP2 key/plaintext follows.'
};
console.log(JSON.stringify(out,null,2));
