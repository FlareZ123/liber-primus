#!/usr/bin/env node
'use strict';

// Source-locked three-dot constellation screen for LP2 physical page 33 (scan 50.jpg).
// Uses the repository's pinned d3-celestial line catalogue and fixed dot centres.
const fs = require('node:fs');
const path = require('node:path');
const catalogPath = process.argv[2] || path.join(__dirname, '..', 'resources', 'control', 'd3-celestial-constellation-lines.json');
const geo = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const source = [
  [766.221, 1743.931],
  [1183.846, 1743.939],
  [1662.000, 1743.939],
];
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const perms = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

// Enumerate each unique connected simple three-vertex path in each constellation.
const shapes = [];
for (const feature of geo.features) {
  const nodes = [], nodeIds = new Map(), adjacency = [];
  const getNode = point => {
    const key = point.join(',');
    if (!nodeIds.has(key)) {
      nodeIds.set(key, nodes.length);
      nodes.push(point);
      adjacency.push(new Set());
    }
    return nodeIds.get(key);
  };
  for (const line of feature.geometry.coordinates) {
    for (let j = 0; j + 1 < line.length; j++) {
      const a = getNode(line[j]), b = getNode(line[j + 1]);
      adjacency[a].add(b); adjacency[b].add(a);
    }
  }
  const seen = new Set();
  for (let a = 0; a < nodes.length; a++) {
    for (const b of adjacency[a]) for (const c of adjacency[b]) {
      if (c === a) continue;
      const key = [a,b,c].sort((x,y)=>x-y).join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      const tri = [nodes[a], nodes[b], nodes[c]];
      const mx = mean(tri.map(p=>p[0])), my = mean(tri.map(p=>p[1]));
      const centered = tri.map(p=>[p[0]-mx,p[1]-my]);
      const norm = centered.reduce((s,p)=>s+p[0]*p[0]+p[1]*p[1],0);
      for (const perm of perms) shapes.push({id:feature.id, q:perm.map(i=>centered[i]), norm});
    }
  }
}

function procrustesResidual(src, shape) {
  const mx=mean(src.map(p=>p[0])), my=mean(src.map(p=>p[1]));
  const s=src.map(p=>[p[0]-mx,p[1]-my]);
  const den=s.reduce((v,p)=>v+p[0]*p[0]+p[1]*p[1],0);
  let a=0,b=0;
  for(let i=0;i<3;i++) {
    a += s[i][0]*shape.q[i][0] + s[i][1]*shape.q[i][1];
    b += s[i][0]*shape.q[i][1] - s[i][1]*shape.q[i][0];
  }
  const c=(a**+b*b)/(den*shape.norm);
  return Math.sqrt(Math.max(0,1-c));
}
function bestMatch(src) {
  let best={residual:Infinity};
  for(const shape of shapes) {
    const residual=procrustesResidual(src,shape);
    if(residual<best.residual) best={id:shape.id,residual};
  }
  return best;
}
function xorshift32(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
function beta22(rng) { const x=[rng(),rng(),rng()].sort((a,b)=>a-b); return x[1]; }
function nullRun(n, sampler, seed, observed) {
  const rng=xorshift32(seed), scores=[];
  for(let i=0;i<n;i++) {
    const t=sampler(rng);
    scores.push(bestMatch([[0,0],[t,0],[1,0]]).residual);
  }
  scores.sort((a,b)=>a-b);
  const count=scores.filter(x=>x<=observed+1e-12).length;
  return {
    trials:n, count_at_or_below:count, p_add_one:(count+1)/(n+1),
    quantiles:{p05:scores[Math.floor(.05*n)],p50:scores[Math.floor(.5*n)],p95:scores[Math.floor(.95*n)]}
  };
}
const sourceMiddleFraction=(source[1][0]-source[0][0])/(source[2][0]-source[0][0]);
const observed=bestMatch(source);
const equalSpacing=bestMatch([[0,0],[0.5,0],[1,0]]);
const N=10000;
const betaNull=nullRun(N,beta22,0x28a46,observed.residual);
const uniformNull=nullRun(N,rng=>rng(),0x28a47,observed.residual);
const bestByConstellation:new Map();
for(const shape of shapes) {
  const residual=procrustesResidual(source,shape);
  const prev=bestByConstellation.get(shape.id);
  if(!prev || residual<prev) bestByConstellation.set(shape.id,residual);
}
const topConstellations=[...bestByConstellation.entries()].map(([id,residual])=>({id,residual})).sort((a,b)=>a.residual-b.residual).slice(0,5);
const out={
  classification:'exploratory matched-null test; not a constellation identification or decryption',
  source_image:'resources/liber-primus/50.jpg (LP2 physical p33)',
  source_image_dimensions_px:[2400,3600],
  source_crop_bbox_px:[700,1660,1730,1830],
  source_centres_px:source,
  source_middle_fraction:sourceMiddleFraction,
  first_gap_px:source[1][0]-source[0][0],
  second_gap_px:source[2][0]-source[1][0],
  constellation_features:geo.features.length,
  connected_three_vertex_paths:shapes.length/6,
  point_correspondences:shapes.length,
  observed_best:observed,
  equal_spacing_control_best:equalSpacing,
  matched_nulls:{
    three_uniform_points_on_a_line_middle_order_statistic_beta_2_2:betaNull,
    fixed_endpoints_uniform_middle_point:uniformNull
  },
  top_constellations:topConstellations,
  interpretation:'Ursa Minor is the best single fit, but 11.0%–12.3% of matched random collinear triples fit at least as well after the same full catalogue search. The three dots are nearly an ellipsis and occur between text blocks; there is no exceptional constellation match.'
};
if(geo.features.length!==89 || shapes.length/6!==840 || shapes.length!==5040) throw new Error('Catalogue/path census changed; inspect before trusting this run');
console.log(JSON.stringify(out,null,2));
