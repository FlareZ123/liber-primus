#!/usr/bin/env node
"use strict";

// Bounded 41-cell geometry test: p55 interior (minus its two D markers)
// is placed in the 2014 Onion7 7x7 square after omitting its eight
// prime-valued perimeter cells. No free orientation or key search.
const square = [
  [7,375,236,190,27,17,181],
  [351,223,14,47,293,98,7],
  [456,232,121,114,72,23,15],
  [16,65,270,331,270,65,16],
  [15,23,72,114,121,232,456],
  [7,98,293,47,14,223,351],
  [181,17,27,190,236,375,7],
];
const omitted = new Set(["0,0","0,5","0,6","1,6","5,0","6,0","6,1","6,6"]);
const p55Interior43 = [19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18];
const p55Interior41 = p55Interior43.filter((_, i) => i !== 4 && i !== 22);
const translit = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];

function rowMajorActive() {
  const out = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) if (!omitted.has(`${r},${c}`)) out.push([r,c]);
  return out;
}
function outsideInActive() {
  const all = [];
  for (let k = 0; k < 4; k++) {
    const top = k, bottom = 6-k, left = k, right = 6-k;
    for (let c = left; c <= right; c++) all.push([top,c]);
    for (let r = top+1; r <= bottom; r++) all.push([r,right]);
    if (bottom > top) for (let c = right-1; c >= left; c--) all.push([bottom,c]);
    if (right > left) for (let r = bottom-1; r > top; r--) all.push([r,left]);
  }
  return all.filter(([r,c]) => !omitted.has(`${r},${c}`));
}
function transform(fill, read) {
  const grid = new Map();
  fill.forEach((xy, i) => grid.set(xy.join(","), p55Interior41[i]));
  return read.map(xy => grid.get(xy.join(",")));
}
function render(indices) { return indices.map(i => translit[i]).join(" "); }
const row = rowMajorActive();
const spiral = outsideInActive();
if (p55Interior41.length !== 41 || row.length !== 41 || spiral.length !== 41) throw new Error("41-cell alignment failed");
const results = {
  input: render(p55Interior41),
  fillOutsideInReadRowMajor: render(transform(spiral, row)),
  fillRowMajorReadOutsideIn: render(transform(row, spiral)),
};
console.log(JSON.stringify({ omitted: [...omitted], activeCellCount: row.length, results }, null, 2));
