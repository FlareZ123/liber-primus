"use strict";
/**
 * Original LP2 source roots as a complete p55 predecessor-step key.
 * Source: 55 rune-bearing pages 0–55 and 256 base60 cells pp49–51.
 * Fixed model: per-page distinct GF29 polynomial roots (ascending root
 * order) then table root24, consumed by the 75 within-p55 transitions.
 * Tests only historical DH23 public share 8 / derived exponent 15 as
 * primitive generators in GF29, with both arithmetic signs.
 * Run: node sims/lp2_original_roots75_p55_stepkey_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const c=load("resources/liber-primus/lp2-corpus.json");
const t=load("resources/liber-primus/base60-grid.json");
const mod=(x,n)=>((x%n)+n)%n;
/** @param {number[]} coefficients Descending polynomial coefficients. */
function roots(coefficients) {
  const found=[];
  for(let x=0;x<29;x++){
    let v=0;
    for(const a of coefficients)v=(v*x+a)%29;
    if(v===0)found.push(x);
  }
  return found;
}
/** @param {number} generator */
function logs(generator){
  const tab=Array(29).fill(-1);
  let x=1;
  for(let e=0;e<28;e++){
    assert.equal(tab[x],-1);
    tab[x]=e;x=x*generator%29;
  }
  assert.equal(x,1);
  assert.equal(tab.slice(1).filter(n=>n!==-1).length,28);
  return tab;
}
/** @param {number[]} data @param {number[]} key
 * @param {number} generator @param {-1|1} sign */
function decode(data,key,generator,sign){
  assert.equal(data.length,key.length+1);
  const log=logs(generator);
  return key.map((k,i)=>{
    const d=mod(data[i+1]-data[i],29);
    return d===0?28:mod(log[d]+sign*k,28);
  });
}
/** @param {number[]} plain @param {number} leader @param {number[]} key
 * @param {number} generator @param {-1|1} sign */
function encode(plain,leader,key,generator,sign){
  assert.equal(plain.length,key.length);
  const powers=[1];
  for(let i=1;i<28;i++)powers.push(powers.at(-1)*generator%29);
  const out=[leader];
  for(let i=0;i<plain.length;i++){
    const d=plain[i]===28?0:powers[mod(plain[i]-sign*key[i],28)];
    out.push(mod(out.at(-1)+d,29));
  }
  return out;
}
/** @param {number[]} data */
function ioc(data){
  let sum=0;
  for(let k=0;k<29;k++){
    const n=data.filter(v=>v===k).length;
    sum+=n*(n-1);
  }
  return sum/(data.length*(data.length-1));
}
const values=t.rows.flat().map(s=>{
  assert.equal(s.length,2);
  const x=t.alphabet.indexOf(s[0])*60+t.alphabet.indexOf(s[1]);
  assert.ok(x>=0&&x<=255);
  return x;
});
assert.equal(values.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(values)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const pages=c.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((a,p)=>a+p.indices.length,0),12956);
const pr=pages.map(p=>({page:p.page,roots:roots(p.indices)}));
const key=pr.flatMap(p=>p.roots).concat(roots(values));
assert.equal(pr.flatMap(p=>p.roots).length,74);
assert.deepEqual(roots(values),[24]);
assert.deepEqual(pr.at(-1),{page:55,roots:[]});
assert.equal(key.length,75);
const original=c.pages[55].indices;
assert.equal(original.length,76);
assert.equal(original.slice(1).filter((v,i)=>v===original[i]).length,1);
const native=c.pages[57].indices.slice(0,75);
assert.equal(native.length,75);
const plant=native.slice();
plant[15]=28;
const decoded=[];
for(const g of [8,15]){
  for(const sign of [-1,1]){
    const p=decode(original,key,g,sign);
    assert.deepEqual(encode(p,original[0],key,g,sign),original);
    const synthetic=encode(plant,original[0],key,g,sign);
    assert.deepEqual(decode(synthetic,key,g,sign),plant);
    const wrong=key.slice();
    wrong[0]=mod(wrong[0]+1,28);
    assert.notDeepEqual(decode(synthetic,wrong,g,sign),plant);
    decoded.push({
      generator:g,sign,ioc:ioc(p),
      gpText:p.map(i=>c.translit[i]).join("")
    });
  }
}
console.log(JSON.stringify({
  originalSource:"LP2 55 rune-bearing pages plus source 256-byte table",
  pageDistinctRoots:74,tableDistinctRoots:[24],
  page55WithinPageSteps:75,rootKeyLength:75,
  originalP55AdjacentRepeats:1,
  solvedP57First75IoC:ioc(native),
  decoded,
  conclusion:"No authentic new LP2 plaintext; this entire direct key hypothesis fails."
},null,2));
