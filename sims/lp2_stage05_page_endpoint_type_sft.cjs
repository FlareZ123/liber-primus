"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const panel = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const inverse = [0,6,2,5,1,4,3], forward = [0,4,2,6,5,3,1];
/** @template T @param {T[]} a @param {number[]} order @returns {T[]} */
function permute(a, order) {
  assert.equal(a.length % 7, 0);
  return Array.from({length:a.length/7},(_,i)=>order.map(j=>a[7*i+j])).flat();
}
const historicalInput = "TL BE IE OV UT HT RE ID TS EO ST PO SO YR SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M".replaceAll(" ","");
const historicalOutput = "TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133";
assert.equal(permute([...historicalInput],inverse).join(""),historicalOutput);
assert.equal(permute([...historicalOutput],forward).join(""),historicalInput);
const pages = corpus.pages.slice(0,56);
assert.deepEqual(pages.map(p=>p.page),Array.from({length:56},(_,i)=>i));
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
assert.deepEqual(pages.filter(p=>!p.indices.length).map(p=>p.page),[50]);
const grid=panel.pages.find(p=>p.page===50).tokens;
assert.equal(grid.length,104);
const endpoints=pages.map(p=>p.page===50?[grid[0],grid.at(-1)]:[corpus.translit[p.indices[0]],corpus.translit[p.indices.at(-1)]]);
const doubleBoth=pages.filter((p,i)=>p.page!==50&&endpoints[i].every(x=>x.length>1)).map(p=>p.page);
assert.deepEqual(doubleBoth,[26,35,47]);
assert.deepEqual(endpoints[50],["2M","1L"]);
const outputs=[];
for(const side of [0,1]){
  const a=endpoints.map(x=>x[side]);
  for(const [name,order,undo] of [["identity",[0,1,2,3,4,5,6],[0,1,2,3,4,5,6]],["historical_inverse",inverse,forward],["historical_forward",forward,inverse]]){
    const d=permute(a,order);
    assert.deepEqual(permute(d,undo),a);
    outputs.push({side,name,n:d.length,serializedLength:d.join("").length,tablePosition:d.indexOf(a[50]),multi:d.filter(x=>x.length>1).length,output:d.join(" ")});
  }
}
assert.deepEqual(outputs.map(x=>x.serializedLength),[71,71,71,72,72,72]);
assert.deepEqual(outputs.map(x=>x.tablePosition),[50,53,55,50,53,55]);
console.log(JSON.stringify({historicalOutput,doubleBoth,p50:endpoints[50],historicalDigits:[...historicalOutput].flatMap((x,i)=>/\d/.test(x)?[i]:[]),outputs},null,2));
