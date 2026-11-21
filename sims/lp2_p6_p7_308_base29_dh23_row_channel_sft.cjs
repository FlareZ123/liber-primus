"use strict";
/**
 * Small historical-operation test on a *new* exact p6/p7 11×28 source packet.
 * The signed 2013 server specified base29 and a worked DH modulus23;
 * the original p6 red passage supplies 11, and the black gap supplies 28 rows.
 * Interpret each 11-GP rune row as an unsigned BIG-ENDIAN base29 integer,
 * reduce it modulo historic 23 and use literal historic DH exponents3,6,15.
 * This checks a 28-symbol instruction channel. It is not reversible
 * decryption of 308 ciphertext runes, and a non-linguistic readout is a
 * bounded negative for this one selected operation.
 *
 * Windows Node22: node sims/lp2_p6_p7_308_base29_dh23_row_channel_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const page = n => gp.pages.find(p => p.page === n).indices;
const red6=ink.pages.find(p=>p.page===6).red_spans[0];
const red7=ink.pages.find(p=>p.page===7).red_spans[0];
assert.deepEqual([red6.start,red6.length,red7.start,red7.length], [71,11,194,14]);
const source = page(6).slice(82).concat(page(7).slice(0,194));
assert.equal(source.length, 308);
assert.equal(source.length / red6.length, 28);
const base=29n, modulus=23n;
const asBigInteger = numbers =>
  numbers.reduce((acc,d)=>acc*base+BigInt(d),0n);
const asBase29 = (n,width) => {
  const digits=Array(width).fill(0);
  for(let i=width-1;i>=0;i--){digits[i]=Number(n%base);n/=base;}
  assert.equal(n,0n);
  return digits;
};
const example=BigInt(3301);
assert.deepEqual(asBase29(example,3),[3,26,24]); // signed BASE29 3301 -> 3QO
const rows = Array.from({length:28},(_,row)=>source.slice(row*11,row*11+11));
const numbers=rows.map(asBigInteger);
assert.ok(numbers.every((n,i)=>
  asBase29(n,11).every((v,j)=>v===rows[i][j])));
const residues=numbers.map(x=>Number(x%modulus));
const power=(x,exponent)=>{
  let result=1n,base=BigInt(x),e=BigInt(exponent);
  while(e>0n){if(e%2n)result=result*base%modulus;
    base=base*base%modulus;e/=2n;}
  return Number(result);
};
const render=values=>values.map(v=>gp.translit[v]).join("");
const outputs=[1,3,6,15].map(e=>{
  const vals=residues.map(x=>power(x,e));
  return {exponent:e,GP29values:vals,romanized:render(vals),
    runeZeroCount:vals.filter(x=>x===0).length};
});
console.log(JSON.stringify({
  conclusion:"Small fixed 28-rune potential instruction channel; not a reversible 308-rune decryption",
  source:"original p6red11..p7red14, 308 uninterpreted black ciphertext glyphs",
  rowCount:rows.length,rowWidth:11,modulus:23,
  exactHistoricalBase29Control:"3301 => 3QO",
  originalResidues:residues,
  outputs
},null,2));
