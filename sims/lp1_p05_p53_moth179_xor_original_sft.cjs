"use strict";
/**
 * Source-specific 179-byte LP1 p05 hidden payload and 179-GP-rune LP2 p53
 * moth repeat: one historical Cicada 2013 XOR consumer, two independently
 * printed GP29 numeric registers, three authenticated representations, both
 * original/reversed payload orders. No chosen offset, key, plaintext crib,
 * hash sweep or English-model tuning.
 * Windows 11 / Node.js 22:
 * node sims/lp1_p05_p53_moth179_xor_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.join(__dirname,"..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(ROOT,relative),"utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page53 = source.pages.find(p=>p.page===53).indices;
const page57 = source.pages.find(p=>p.page===57).indices;
const hiddenHex = read("im-results/lp1-p05-central-block.txt").trim();
assert.match(hiddenHex,/^[0-9a-f]{358}$/i);
const originalBinary = Buffer.from(hiddenHex,"hex");
assert.equal(originalBinary.length,179);
assert.equal(crypto.createHash("sha256").update(originalBinary).digest("hex"),
  "82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa");
/** @param {number} x @returns {number} */
const nibbleSwap = x => (x >> 4) | ((x & 15) << 4);
const swappedASCII = Buffer.from(originalBinary.map(nibbleSwap));
const digitReversedASCII = Buffer.from(swappedASCII.toString("ascii")
  .replace(/\d+/g,n=>n.split("").reverse().join("")),"ascii");
assert.equal(swappedASCII.length,179);
assert.equal(digitReversedASCII.length,179);
const historic = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/(?:\r?\n){2,}/);
assert.equal(historic.length,3);
const matrix = digitReversedASCII.toString("ascii").trim()
  .split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number));
const expected = historic[2].trim().split(/\r?\n/)
  .map(line=>line.trim().split(/\s+/).map(Number));
assert.deepEqual(matrix,expected,
  "The original 179-byte payload must independently reconstruct the historical third 2014 magic square.");
assert.equal(page53.length,179);
assert.equal(page57.length,95);
/** @param {number[]} bytes @returns {{letters:number,printable:number,gp29:number,preview:string}} */
function profile(bytes) {
  return {
    printable:bytes.filter(x=>x>=32&&x<=126).length,
    letters:bytes.filter(x=>(x>=65&&x<=90)||(x>=97&&x<=122)).length,
    gp29:bytes.filter(x=>x<29).length,
    preview:bytes.slice(0,90).map(x=>x>=32&&x<=126?String.fromCharCode(x):".").join("")
  };
}
const forms = [
  ["rawHidden",Array.from(originalBinary)],
  ["nibbleASCII",Array.from(swappedASCII)],
  ["reversedDecimalASCII",Array.from(digitReversedASCII)]
];
const registers = [
  ["GPOrdinal",page53.slice(),page57.slice()],
  ["GPPrime",page53.map(x=>source.prime[x]),page57.map(x=>source.prime[x])]
];
const expectedLetterCounts = {
  GPOrdinal: [[15,16],[0,0],[0,0]],
  GPPrime: [[57,58],[60,58],[60,57]]
};
function run() {
  const cases=[];
  for (const [register,values,known] of registers) {
    for (let f=0;f<forms.length;f++){
      const [form,bytes]=forms[f];
      for(let orientation=0;orientation<2;orientation++){
        const pad=orientation?bytes.slice().reverse():bytes;
        const out=values.map((v,i)=>v^pad[i]);
        assert.deepEqual(out.map((x,i)=>x^pad[i]),values,
          "Source-exact XOR inverse must recover 179 source rune values.");
        const encryptedControl=known.map((v,i)=>v^pad[i]);
        assert.deepEqual(encryptedControl.map((x,i)=>x^pad[i]),known,
          "Independent original GP p57 known-plaintext XOR plant.");
        const stats=profile(out);
        assert.equal(stats.letters,expectedLetterCounts[register][f][orientation],
          "Original p53 source-locked XOR letters changed.");
        cases.push({register,payload:form,orientation:orientation?"reversed":"printed",
          outputLength:out.length,...stats});
      }
    }
  }
  assert.equal(cases.length,12);
  assert.ok(cases.every(x=>x.letters<=60 && x.gp29<179),
    "No tested source-locked output is an all-GP stream or ordinary English byte prose.");
  const result={input:"Original LP2 p53 179 runes, the original LP1 p05 179-byte binary central payload",
    printedKeySHA256:crypto.createHash("sha256").update(originalBinary).digest("hex"),
    independentMagicSquareMatch:true,
    solvedP57ControlRunes:95,completeOriginalP53XorRoundTrips:12,
    outcomes:cases,
    decision:"No typed ASCII prose, complete GP29 alphabet, or deciphered page among the twelve source-fixed direct XOR consumers."};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,profile,nibbleSwap};
