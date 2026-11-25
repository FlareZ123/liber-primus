"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");

/**
 * Necessary nested capacity conditions for disjoint literal 2014 book-code tuples.
 * Grants arbitrary cell ordering and all combinations of independently bounded fields.
 * @param {string} source Exact historical Self-Reliance witness.
 * @param {{alphabet:string,pages:{tokens:string[]}[]}} grid Canonical LP2 cells.
 */
function gate(source,grid) {
 const paragraphs=source.split("\n\n").map(p=>p.split(/(?<=[.!?])\s+/).map(s=>s.replace(/\n/g," ").split(" ")));
 const maxima=[paragraphs.length-1,Math.max(...paragraphs.map(p=>p.length)),Math.max(...paragraphs.flat().map(s=>s.length)),Math.max(...paragraphs.flat(2).map(w=>w.length))];
 const codes=["1:2:3:1","3:3:13:5","45:5:2:3","20:3:20:5","8:3:8:6","48:5:14:2","21:13:4:1","25:1:7:4","15:9:3:4","1:1:16:3","4:3:3:1","8:3:26:4","47:3:3:5","3","13:2:5:4","1:4:16:4",".","o","n","i","o","n"];
 const decoded=codes.map(t=>{if(!t.includes(":"))return t;const [p,s,w,c]=t.split(":").map(Number);return paragraphs[p-1+(p>=45?1:0)][s-1][w-1][c-1];}).join("");
 const thresholds=maxima.slice().sort((a,b)=>a-b);
 const outputs=[59,60].map(radix=>{
  const v=grid.pages.flatMap(p=>p.tokens).map(t=>radix*grid.alphabet.indexOf(t[0])+grid.alphabet.indexOf(t[1]));
  const counts=thresholds.map(m=>v.filter(n=>n>0&&n<=m).length);
  return {radix,zeros:v.filter(n=>n===0).length,thresholds,counts,upperTetrads:Math.min(...counts.map((n,i)=>Math.floor(n/(i+1))))};
 });
 return {decoded,maxima,outputs};
}

const read = name => fs.readFileSync(path.join(root,name));
const source = read("resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const blob = data => crypto.createHash("sha1").update("blob "+data.length+"\0").update(data).digest("hex");
assert.equal(blob(source),"12a6bc018047a1276e77f2b7f633d5905732fff9");
assert.equal(blob(grid),"2550eae357442912220e05dc51147523a61dd75a");
const result = gate(source.toString("utf8"),JSON.parse(grid));
assert.deepEqual(result,{
  "decoded": "auqgnxjtvdbll3pv.onion",
  "maxima": [
    50,
    25,
    105,
    16
  ],
  "outputs": [
    {
      "radix": 59,
      "zeros": 2,
      "thresholds": [
        16,
        25,
        50,
        105
      ],
      "counts": [
        10,
        18,
        41,
        101
      ],
      "upperTetrads": 9
    },
    {
      "radix": 60,
      "zeros": 2,
      "thresholds": [
        16,
        25,
        50,
        105
      ],
      "counts": [
        10,
        18,
        41,
        99
      ],
      "upperTetrads": 9
    }
  ]
});
console.log(JSON.stringify(result,null,2));
