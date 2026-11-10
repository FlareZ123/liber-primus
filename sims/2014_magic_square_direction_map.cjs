#!/usr/bin/env node
"use strict";

// Reproduce the 2014 stage04 5x5 magic-square direction-map hypothesis.
// Run from the repository root: node sims/2014_magic_square_direction_map.cjs

const fs = require("node:fs");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const magic = [
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272],
];
const mod = n => ((n % 29) + 29) % 29;
function phi(n) {
  let out=n;
  for(let p=2;p*p<=n;p++) if(n%p===0) {
    while(n%p===0)n/=p;
    out-=out/p;
  }
  if(n>1)out-=out/n;
  return Math.round(out);
}
const dirs=[
  {name:"E",dr:0,dc:1},{name:"NE",dr:-1,dc:1},
  {name:"N",dr:-1,dc:0},{name:"NW",dr:-1,dc:-1},
  {name:"W",dr:0,dc:-1},{name:"SW",dr:1,dc:-1},
  {name:"S",dr:1,dc:0},{name:"SE",dr:1,dc:1},
];
const cells=[];
for(let r=0;r<5;r++)for(let c=0;c<5;c++){
  const n=magic[r][c],angle=((n%360)+360)%360;
  const dir=dirs[Math.floor((angle+22.5)/45)%8];
  const tr=r+dir.dr,tc=c+dir.dc,inside=tr>=0&&tr<5&&tc>=0&&tc<5;
  const runeIndex=mod(phi(n));
  cells.push({cell:r*5+c+1,number:n,angle,direction:dir.name,phi:phi(n),
    runeIndex,translit:corpus.translit[runeIndex],target:inside?tr*5+tc+1:null});
}
const byCell=new Map(cells.map(x=>[x.cell,x]));
const cycleKeys=new Set(),cycles=[];
for(let start=1;start<=25;start++){
  const path=[],pos=new Map();let cur=start;
  while(cur!==null&&!pos.has(cur)){pos.set(cur,path.length);path.push(cur);cur=byCell.get(cur).target;}
  if(cur!==null&&pos.has(cur)){
    const cycle=path.slice(pos.get(cur)),min=Math.min(...cycle),i=cycle.indexOf(min);
    const canonical=cycle.slice(i).concat(cycle.slice(0,i)),key=canonical.join(",");
    if(!cycleKeys.has(key)){cycleKeys.add(key);cycles.push(canonical);}
  }
}
cycles.sort((a,b)=>a.length-b.length||a[0]-b[0]);
const mutualPairs=cells.filter(x=>x.target!==null&&byCell.get(x.target).target===x.cell)
  .map(x=>[x.cell,x.target]).filter(([a,b])=>a<b);
const rowSums=magic.map(r=>r.reduce((a,b)=>a+b,0));
const colSums=Array.from({length:5},(_,c)=>magic.reduce((s,r)=>s+r[c],0));
const diagonalSums=[magic.reduce((s,r,i)=>s+r[i],0),magic.reduce((s,r,i)=>s+r[4-i],0)];
const result={
  magicConstant:1033,rowSums,columnSums:colSums,diagonalSums,
  selector:{patienceValue:761,phi761:phi(761),phi761mod29:mod(phi(761)),epiphanyDay:6},
  cell6:byCell.get(6),cell7:byCell.get(7),
  inBoundsEdges:cells.filter(x=>x.target!==null).length,
  exits:cells.filter(x=>x.target===null).map(x=>x.cell),
  mutualPairs,
  cycles:cycles.map(ids=>({cells:ids,runes:ids.map(id=>byCell.get(id).translit),
    directions:ids.map(id=>byCell.get(id).direction)})),
};
if(!rowSums.every(x=>x===1033)||!colSums.every(x=>x===1033)||!diagonalSums.every(x=>x===1033))throw Error("magic-square check failed");
if(mod(phi(761))!==6||byCell.get(6).translit!=="R"||byCell.get(7).translit!=="A"||
   byCell.get(6).target!==7||byCell.get(7).target!==6||!mutualPairs.some(x=>x[0]===6&&x[1]===7)) {
  throw Error("cell 6 Rad <-> cell 7 Ac did not reproduce");
}
console.log(JSON.stringify(result,null,2));
