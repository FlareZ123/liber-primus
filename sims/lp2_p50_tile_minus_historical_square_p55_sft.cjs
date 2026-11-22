"use strict";
/**
 * Source-frozen GP29 tile-minus-square key gate for the original p55 75-rune
 * body. Run: node sims/lp2_p50_tile_minus_historical_square_p55_sft.cjs
 * Uses repository-preserved original p50, p55, p57 and 2014 square operands.
 * This is a finite historical hypothesis, not a recovered LP2 cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} rel */
function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const historical = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/u)
  .map(group => group.trim().split(/\r?\n/u)
    .map(line => line.trim().split(/\s+/u).map(Number)));
assert.deepEqual(historical.map(x => x.length), [5, 7, 5]);
assert.deepEqual(historical.map(x => x[0].reduce((a, b) => a + b, 0)), [3301, 1033, 1033]);
assert.equal(historical[2][2][2], 91);
const clauseSums = [gp.pages[57].indices.slice(7,37),
  gp.pages[57].indices.slice(37,67),gp.pages[57].indices.slice(67,95)]
  .map(v => v.reduce((a,i)=>a+gp.prime[i],0));
assert.deepEqual(clauseSums,[1259,1031,1229]);
/** @param {number} n */
function primeRank(n) {
  let k=0;
  for(let p=2;p<=n;p++) {
    let prime=true;
    for(let d=2;d*d<=p;d++) if(p%d===0) {prime=false;break;}
    if(prime)k++;
  }
  return k;
}
const address=clauseSums.map(primeRank);
assert.deepEqual(address,[205,173,201]);
const cells=grid.pages.flatMap(x=>x.tokens);
assert.equal(cells.length,256);
assert.deepEqual(address.map(i=>cells[i]),["1G","1v","1E"]);
const rows=address.map(i=>Math.floor(i/8));
const cols=address.map(i=>i%8);
const top=Math.min(...rows),left=Math.min(...cols);
assert.deepEqual([top,left,Math.max(...rows),Math.max(...cols)],[21,1,25,5]);
const tile=Array.from({length:25},(_,i)=>cells[(top+Math.floor(i/5))*8+left+(i%5)]);
assert.deepEqual(tile,["3m","4E","0s","2S","1v","2B","2k","2t","2O","0e",
  "2a","0J","1L","0c","3C","2Z","2d","1T","2u","1t","1E","3T","18","3E","1G"]);
const p55=gp.pages[55].indices;
assert.equal(p55.length,76);
assert.equal(p55[0],21); // the single NG continued from physical p54
const c=p55.slice(1);
assert.equal(c.length,75);
const alphabet59=grid.alphabet.replace("f","");
assert.equal(alphabet59.length,59);
assert.equal(grid.alphabet.length,60);
/** @param {string} value @param {number} base */
function numeral(value,base) {
  const digits=base===59?alphabet59:grid.alphabet;
  assert.equal(value.length,2);
  const a=digits.indexOf(value[0]),b=digits.indexOf(value[1]);
  assert(a>=0 && b>=0);
  return a*base+b;
}
/** @param {number} value */
const mod=value=>((value%29)+29)%29;
/** @param {number[]} arr */
function ioc(arr) {
  const f=Array(29).fill(0);
  for(const v of arr)f[v]++;
  return f.reduce((s,x)=>s+x*(x-1),0)/(arr.length*(arr.length-1));
}
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
assert.deepEqual([...transcript[54]].filter(ch=>runeIndex.has(ch))
  .map(ch=>runeIndex.get(ch)),p55);
const wordOffsets=[];
let count=0,word=[];
for(const ch of transcript[54]) {
  const v=runeIndex.get(ch);
  if(v!==undefined) {if(count>0)word.push(count-1);count++;}
  else if("-.$&§".includes(ch)) {if(word.length)wordOffsets.push(word);word=[];}
}
if(word.length)wordOffsets.push(word);
assert.equal(count,76);
assert.deepEqual(wordOffsets.map(w=>w.length),[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
/** @param {number[]} arr */
const literal=arr=>arr.map(n=>gp.translit[n]).join("");
/** @param {number[]} arr */
const printed=arr=>wordOffsets.map(w=>literal(w.map(i=>arr[i]))).join(" ");
assert.equal(c.length,wordOffsets.reduce((s,w)=>s+w.length,0));
console.log("Original source: PARABLE primes",clauseSums,"rank",address,"tile",tile);
console.log("Real p55 full-word body",c.length,"native GP29 runes; raw IoC",ioc(c).toFixed(8));
const p57Clear=gp.pages[57].indices.slice(0,75);
const all=[];
for(const base of [59,60]) {
  const numbers=tile.map(token=>numeral(token,base));
  assert.equal(numbers.reduce((a,b)=>a+b,0),base===59?3210:3258);
  for(const [name,square] of [["3301",historical[0]],["1033",historical[2]]]) {
    const sq=square.flat();
    assert.equal(sq.length,25);
    const key=numbers.map((n,i)=>mod(n-sq[i]));
    for(const sign of [-1,1]) {
      /** @param {number[]} input */
      const decode=input=>input.map((x,i)=>mod(x+sign*key[i%25]));
      /** @param {number[]} input */
      const encode=input=>input.map((x,i)=>mod(x-sign*key[i%25]));
      const planted=encode(p57Clear);
      assert.deepEqual(decode(planted),p57Clear);
      const plain=decode(c);
      assert.deepEqual(encode(plain),c);
      const record={base,sourceSquare:name,sign,ioc:ioc(plain),
        text:printed(plain),key};
      all.push(record);
      console.log(JSON.stringify({base,square:name,sign,key,IoC:record.ioc,
        p55PrintedOutput:record.text,positive:"75/75",reencode:"75/75"}));
    }
  }
}
assert.equal(all.length,8);
const best=[...all].sort((a,b)=>b.ioc-a.ioc)[0];
assert.equal(best.base,59);
assert.equal(best.sourceSquare,"1033");
assert.equal(best.sign,1);
assert(Math.abs(best.ioc-0.04252252252252252)<1e-12);
console.log("p57 clear 75 IoC",ioc(p57Clear),"p57 whole95 IoC",ioc(gp.pages[57].indices));
console.log("PASS: eight source-frozen direct-additive original gates and eight source-native plants.");
/**
 * Historic plaintext F transparency: plaintext F (rune index0) prints literally
 * as ciphertext F and consumes no key. Ciphertext F can also be an enciphered
 * non-F. Every branch is enumerated without tuning or vocabulary decisions.
 * An ordinary path that produces plaintext F is invalid under this convention.
 * @param {number[]} ciphertext @param {number[]} key @param {number} sign
 */
function authenticFPaths(ciphertext,key,sign) {
  let states=[{text:[],clock:0,skips:[]}];
  for(let i=0;i<ciphertext.length;i++) {
    const next=[];
    for(const state of states) {
      const decoded=mod(ciphertext[i]+sign*key[state.clock%25]);
      if(decoded!==0) next.push({text:[...state.text,decoded],
        clock:state.clock+1,skips:state.skips});
      if(ciphertext[i]===0) next.push({text:[...state.text,0],
        clock:state.clock,skips:[...state.skips,i]});
    }
    states=next;
    if(states.length===0) return {states,firstFail:i};
  }
  return {states,firstFail:null};
}
/** @param {number[]} plaintext @param {number[]} key @param {number} sign */
function authenticEncrypt(plaintext,key,sign) {
  let clock=0;
  return plaintext.map(p=>{
    if(p===0) return 0;
    const cipher=mod(p-sign*key[clock%25]);
    clock++;
    return cipher;
  });
}
const authentic=[];
for(const base of [59,60]) {
  const alphabet=base===59?alphabet59:grid.alphabet;
  const numbers=tile.map(v=>numeral(v,base));
  for(const [name,square] of [["3301",historical[0]],["1033",historical[2]]]) {
    const key=numbers.map((n,i)=>mod(n-square.flat()[i]));
    for(const sign of [-1,1]) {
      const plantCipher=authenticEncrypt(p57Clear,key,sign);
      const plantResult=authenticFPaths(plantCipher,key,sign);
      assert(plantResult.states.some(p=>p.text.every((v,i)=>v===p57Clear[i])),
        "true p57 plant with every genuine F transparency must be recovered");
      const actual=authenticFPaths(c,key,sign);
      const item={base,square:name,sign,paths:actual.states.length,
        firstFail:actual.firstFail,
        survivors:actual.states.map(p=>({
          skips:p.skips,IoC:ioc(p.text),words:printed(p.text),
        }))};
      authentic.push(item);
      console.log("AUTHENTIC_F",JSON.stringify(item));
    }
  }
}
assert.equal(authentic.length,8);
assert.equal(authentic.reduce((sum,item)=>sum+item.paths,0),1);
const only=authentic.find(x=>x.paths);
assert.deepEqual([only.base,only.square,only.sign],[59,"3301",-1]);
assert.deepEqual(only.survivors[0].skips,[24,40]);
assert(Math.abs(only.survivors[0].IoC-0.03315315315315315)<1e-12);
console.log("PASS: 7/8 exact F-transparent key families impossible, one valid and nonprose.");
