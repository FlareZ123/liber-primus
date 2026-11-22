"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", name), "utf8"));
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d*d <= n; d++) if (n%d === 0) { prime = false; break; }
    if (prime) out.push(n);
  }
  return out;
}

/** @param {number[]} ciphertext @param {number[]} primes @returns {number[]} */
function decodeSolvedP56(ciphertext, primes) {
  assert.equal(ciphertext.length, 85);
  assert.deepEqual(ciphertext.flatMap((v, i) => v === 0 ? [i] : []), [35,47,51,56,74]);
  let j = 0;
  const plain = ciphertext.map((v,i) => i === 56 ? v : (((v-(primes[j++]-1))%29)+29)%29);
  assert.equal(j, 84);
  assert.deepEqual(plain.map((v,i) => i === 56 ? v : (v+primes[i < 56 ? i : i-1]-1)%29), ciphertext);
  return plain;
}

/** @param {string} token @param {string} alphabet @param {59|60} radix @returns {number} */
function parseByte(token, alphabet, radix) {
  assert.equal(token.length, 2);
  const f = alphabet.indexOf("f");
  const ds = [...token].map(c => {
    const i = alphabet.indexOf(c);
    assert.ok(i >= 0);
    assert.notEqual(i, f);
    return radix === 60 ? i : i-Number(i>f);
  });
  const b = radix*ds[0]+ds[1];
  assert.ok(b >= 0 && b <= 255);
  return b;
}

/**
 * Exact all-secret linear XOR consistency. Every equation imposes a byte
 * relation on 29 rune-codebook, 30 row-pad and 6 column-pad unknowns.
 * @param {number[]} plain @param {number[]} bytes
 * @returns {{rank:number,contradictions:number,first:{index:number,residual:number}|null}}
 */
function solveAnySecretRowColXor(plain,bytes) {
  assert.equal(plain.length,180);
  assert.equal(bytes.length,180);
  /** @type {({mask:bigint,rhs:number}|null)[]} */
  const pivots=Array(65).fill(null);
  let rank=0,contradictions=0;
  /** @type {{index:number,residual:number}|null} */
  let first=null;
  for(let i=0;i<180;i++){
    const r=Math.floor(i/6), c=i%6;
    let mask=(1n<<BigInt(plain[i]))^(1n<<BigInt(29+r))^(1n<<BigInt(59+c));
    let rhs=bytes[i];
    for(let bit=64;bit>=0;bit--){
      if(!(mask&(1n<<BigInt(bit))))continue;
      const pivot=pivots[bit];
      if(pivot){mask^=pivot.mask;rhs^=pivot.rhs;}
      else{pivots[bit]={mask,rhs};rank++;break;}
    }
    if(mask===0n && rhs!==0){
      contradictions++;
      if(!first)first={index:i,residual:rhs};
    }
  }
  return {rank,contradictions,first};
}

/** @param {number[]} plain @param {number[]} primeKey @returns {number[]} */
function makePositivePlant(plain,primeKey) {
  return plain.map((rune,i) =>
    ((rune*97+19)&255)^
    ((Math.floor(i/6)*53+11)&255)^
    (((i%6)*137+23)&255)^primeKey[i]);
}

function main(){
  const corpus=load("lp2-corpus.json");
  const grid=load("base60-grid.json");
  const primes=firstPrimes(280);
  const cipher=corpus.pages.find(p=>p.page===56);
  const clear=corpus.pages.find(p=>p.page===57);
  assert.ok(cipher && clear);
  const p56=decodeSolvedP56(cipher.indices,primes);
  assert.equal(p56.map(v=>corpus.translit[v]).join(""),
    "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
  assert.equal(clear.indices.length,95);
  assert.equal(corpus.translit[clear.indices[67]],"F");
  assert.equal(corpus.translit[clear.indices[68]],"I");
  const plain=p56.concat(clear.indices);
  assert.equal(plain.length,180);
  assert.equal(grid.rows.length,32);
  grid.rows.forEach(r=>assert.equal(r.length,8));
  const raw60=grid.rows.flat().map(t=>parseByte(t,grid.alphabet,60));
  assert.deepEqual(raw60,grid.byte_rows.flat());
  assert.equal(crypto.createHash("sha256").update(Buffer.from(raw60)).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  assert.deepEqual([raw60.indexOf(0),raw60.lastIndexOf(0)],[192,229]);
  const tokens=grid.rows.slice(1,31).flatMap(r=>r.slice(1,7));
  assert.equal(tokens.length,180);
  assert.equal(primes[20],73);
  assert.equal(primes[199],1223);
  const expected={
    "60-forward":{rank:57,contradictions:121,first:{index:13,residual:242}},
    "60-reverse":{rank:57,contradictions:123,first:{index:13,residual:12}},
    "59-forward":{rank:57,contradictions:123,first:{index:13,residual:247}},
    "59-reverse":{rank:57,contradictions:123,first:{index:13,residual:9}}
  };
  const results=[];
  for(const radix of [60,59]){
    const byteTable=tokens.map(t=>parseByte(t,grid.alphabet,radix));
    for(const direction of ["forward","reverse"]){
      const key=Array.from({length:180},(_,i)=>primes[20+(direction==="forward"?i:179-i)]&255);
      const planted=makePositivePlant(plain,key).map((v,i)=>v^key[i]);
      const positive=solveAnySecretRowColXor(plain,planted);
      assert.equal(positive.contradictions,0);
      assert.equal(positive.rank,57);
      const whitened=byteTable.map((v,i)=>v^key[i]);
      const measured=solveAnySecretRowColXor(plain,whitened);
      assert.deepEqual(measured,expected[String(radix)+"-"+direction]);
      results.push({radix,direction,...measured});
    }
  }
  console.log("LP2 ORIGINAL MISSING-PRIME ALL-SECRET XOR PASS");
  console.log(JSON.stringify({
    model:"T_i XOR (omitted_prime_i mod256) = M[GP_plain_i] XOR R[row] XOR C[column]",
    register:"solved p56 85 + clear p57 95",
    original:results,plantedPositives:4,authenticUnknownPlaintext:0
  },null,2));
}

if(require.main===module)main();
module.exports={main,firstPrimes,decodeSolvedP56,parseByte,solveAnySecretRowColXor,makePositivePlant};
