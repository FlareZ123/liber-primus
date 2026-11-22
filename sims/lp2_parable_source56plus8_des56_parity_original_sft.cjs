"use strict";
/**
 * 2013 PARABLE S201=56 and S173=8 disjoint sets as a hypothetical
 * DES 56 effective key bits plus 8 parity bit slots.
 *
 * No historical source names DES, so this is an explicitly bounded trial.
 * Windows Node22 CommonJS. All original inputs and positive DES KAT are native.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const json = name => JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const g = json("resources/liber-primus/lp2-grid-256.json");
const c = json("resources/liber-primus/lp2-corpus.json");
const tokens = g.pages.flatMap(p=>p.tokens);
const T = tokens.map(s=>60*g.alphabet.indexOf(s[0])+g.alphabet.indexOf(s[1]));
assert.equal(tokens.length,256);
assert(T.every(v=>Number.isInteger(v)&&v>=0&&v<=255));
const table = Buffer.from(T);

/** @param {number} n @returns {Set<number>} */
function orbit(n) {
  const seen = new Set();
  while(!seen.has(n)){seen.add(n);n=T[n];}
  return seen;
}
/** @param {number} n @returns {number[]} */
function subtree(n){
  return Array.from({length:256},(_,i)=>i).filter(i=>orbit(i).has(n));
}
/**
 * @param {number} root
 * @returns {number[]}
 */
function largerChildInorder(root) {
  const nodes = subtree(root), allowed = new Set(nodes);
  const children = new Map(nodes.map(i=>[i,[]]));
  for(const i of nodes)if(i!==root){
    assert(allowed.has(T[i]));
    children.get(T[i]).push(i);
  }
  const sizes = new Map();
  /** @param {number} n */
  function size(n) {
    const z=1+children.get(n).reduce((a,k)=>a+size(k),0);
    sizes.set(n,z);return z;
  }
  size(root);
  const output=[];
  /** @param {number} n */
  function visit(n) {
    const ch=children.get(n).slice().sort((a,b)=>sizes.get(b)-sizes.get(a)||a-b);
    if(ch.length)visit(ch[0]);
    output.push(n);
    for(const k of ch.slice(1))visit(k);
  }
  visit(root);
  return output;
}
assert.deepEqual([201,74,205].map(n=>subtree(n).length),[56,57,58]);
assert.equal(subtree(173).length,8);
assert.equal(subtree(201).filter(n=>subtree(173).includes(n)).length,0);
const source = {
  printed: [subtree(201),subtree(173)],
  inorder: [largerChildInorder(201),largerChildInorder(173)]
};
assert.equal(largerChildInorder(205).indexOf(201),50);

/** @param {Buffer} key @param {Buffer} data @param {boolean} decrypt @param {"ecb"|"cbc"} mode */
function des(key,data,decrypt,mode){
  assert.equal(key.length,8);
  assert.equal(data.length%8,0);
  const name=mode==="ecb"?"des-ede3":"des-ede3-cbc";
  const iv=mode==="ecb"?null:Buffer.alloc(8,0);
  const t=decrypt?crypto.createDecipheriv(name,Buffer.concat([key,key,key]),iv):
    crypto.createCipheriv(name,Buffer.concat([key,key,key]),iv);
  t.setAutoPadding(false);
  return Buffer.concat([t.update(data),t.final()]);
}
const nistKey=Buffer.from("133457799BBCDFF1","hex");
const nistPlain=Buffer.from("0123456789ABCDEF","hex");
const nistEncrypted=Buffer.from("85E813540F0AB405","hex");
assert.deepEqual(des(nistKey,nistPlain,false,"ecb"),nistEncrypted);
assert.deepEqual(des(nistKey,nistEncrypted,true,"ecb"),nistPlain);

const p57 = c.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const results=[];
for(const [order,sets] of Object.entries(source)) {
  const [dataNodes,parityNodes]=sets;
  assert.equal(dataNodes.length,56);
  assert.equal(parityNodes.length,8);
  for(const operand of ["address","value"]){
    const readBit = n => (operand==="address"?n:T[n]) & 1;
    const bits=dataNodes.map(readBit);
    const parity=parityNodes.map(readBit);
    const key=Buffer.alloc(8);
    const compatible=[];
    for(let i=0;i<8;i++){
      let b=0, x=0;
      for(let j=0;j<7;j++) {
        const bit=bits[7*i+j];
        b=(b<<1)|bit;
        x^=bit;
      }
      const parityBit=parity[i];
      compatible.push((x^parityBit)===1);
      key[i]=(b<<1)|parityBit;
    }
    const parityCount=compatible.filter(Boolean).length;
    for(const mode of ["ecb","cbc"]) {
      const plain=des(key,table,true,mode);
      assert.deepEqual(des(key,plain,false,mode),table);
      const known=p57;
      const interior=[];
      for(let row=1;row<31;row++)
        for(let col=1;col<7;col++)
          interior.push(plain[row*8+col]);
      assert.equal(interior.length,180);
      const tail=interior.slice(-95);
      const hitExact=tail.filter((b,i)=>b===known[i]).length;
      const hitModulo=tail.filter((b,i)=>b%29===known[i]).length;
      const ascii=Array.from(plain).filter(b=>b>=32&&b<=126).length;
      const native=interior.filter(b=>b<29).length;
      const printable=Array.from(plain,b=>b>=32&&b<=126?"1":"0").join("");
      const longest=(printable.match(/1+/g)||[""]).reduce((m,s)=>Math.max(m,s.length),0);
      results.push({order,operand,mode,key:key.toString("hex"),
        sourceOddParityCount:parityCount,sourceParityStatus:compatible,
        printableAscii:ascii,longestPrintableRun:longest,
        nativeGP29Interior:native,
        p57ExactLast95:hitExact,p57Modulo29Last95:hitModulo,
        first24:plain.subarray(0,24).toString("hex")});
    }
  }
}
assert.equal(results.length,8);
console.log(JSON.stringify({
  status:"PASS",
  sourceParablePrimeRankNodes:[205,173,201],
  selectedNodeCounts:{keyNodes:56,parityNodes:8,union:64},
  originalGridRows:32,
  originalTableBytes:256,
  sourceKnownTailP56P57Runes:[85,95],
  historicalCipherOpcodeAuthenticated:false,
  type:"bounded hypothetical DES original full-table ECB/zero-IV-CBC",
  results,
  recoveredRecognizablePlaintext:false
},null,2));
