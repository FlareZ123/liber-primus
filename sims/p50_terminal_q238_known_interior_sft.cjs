"use strict";

/**
 * Source-exact test of the degree-238 table factor as a terminal [256,18]
 * polynomial code over GF29. This is a candidate code, not an authenticated
 * Cicada decoding instruction. The known 180-symbol interior completely
 * determines any such codeword. Test predictions on the other 162 cells.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const bytes = table.byte_rows.flat();
assert.equal(bytes.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
/** @param {number} a @returns {number} */
function inverse(a) {
  for(let i=1;i<29;i++)if(mod(i*a)===1)return i;
  throw new Error("GF29 inverse missing");
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a,b) {
  const result=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)result[i+j]=mod(result[i+j]+a[i]*b[j]);
  return result;
}
const g16=[
  [5,1],[5,1],[11,18,1],[24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1],
].reduce(multiply,[1]);
assert.equal(g16.length,17);
/**
 * Exact polynomial quotient and remainder, ascending GF29 coefficients.
 * @param {number[]} dividend
 * @param {number[]} divisor Monic.
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(dividend,divisor) {
  const rest=dividend.map(mod);
  while(rest.length>1&&rest.at(-1)===0)rest.pop();
  const quotient=Array(rest.length-divisor.length+1).fill(0);
  for(let k=quotient.length-1;k>=0;k--) {
    const v=rest[k+divisor.length-1];
    quotient[k]=v;
    for(let j=0;j<divisor.length;j++)rest[k+j]=mod(rest[k+j]-v*divisor[j]);
  }
  return {quotient,remainder:rest.slice(0,divisor.length-1)};
}
const originalResidues=bytes.map(value=>value%29);
const division=divide(originalResidues.slice().reverse(),g16);
assert.deepEqual(division.remainder,Array(16).fill(0));
assert.equal(division.quotient.length,239);
const factor238=division.quotient.map(value=>mod(value*inverse(division.quotient.at(-1))));
assert.equal(factor238[238],1);
assert.equal(factor238[0],5);

/** @type {number[]} */
const border=[];
/** @type {number[]} */
const interior=[];
for(let i=0;i<256;i++){
  const row=Math.floor(i/8),col=i%8;
  (row===0||row===31||col===0||col===7?border:interior).push(i);
}
assert.deepEqual([border.length,interior.length],[76,180]);

// Every full-length multiple of the monic 238th-degree factor has the unique
// coefficient representation Q238(X)*R(X), deg R<=17. This grants 18 unknown
// secret coefficients but no hidden phase, position permutation or alphabet.
const basis=Array.from({length:18},(_,j)=>{
  const output=Array(256).fill(0);
  for(let i=0;i<factor238.length;i++)output[255-(i+j)]=factor238[i];
  return output;
});
/** @param {number[]} coefficients @returns {number[]} */
function codeword(coefficients) {
  const out=Array(256).fill(0);
  for(let j=0;j<18;j++)for(let i=0;i<256;i++){
    out[i]=mod(out[i]+coefficients[j]*basis[j][i]);
  }
  return out;
}
/**
 * Solve a completely unknown 18-coordinate secret from 180 known interior
 * evaluations, then test every interior evaluation without refitting.
 * @param {number[]} known
 * @returns {{rank:number,coefficients:number[],prediction:number[],matches:number}}
 */
function recover(known) {
  assert.equal(known.length,180);
  const rows=interior.map((position,i)=>[...basis.map(b=>b[position]),known[i]]);
  let rank=0;
  for(let column=0;column<18;column++){
    let chosen=rank;
    while(chosen<180&&rows[chosen][column]===0)chosen++;
    assert.ok(chosen<180,"full 18-coefficient rank required");
    [rows[rank],rows[chosen]]=[rows[chosen],rows[rank]];
    const scale=inverse(rows[rank][column]);
    for(let j=column;j<=18;j++)rows[rank][j]=mod(rows[rank][j]*scale);
    for(let row=0;row<180;row++)if(row!==rank&&rows[row][column]){
      const multiple=rows[row][column];
      for(let j=column;j<=18;j++){
        rows[row][j]=mod(rows[row][j]-multiple*rows[rank][j]);
      }
    }
    rank++;
  }
  assert.equal(rank,18);
  const coefficients=rows.slice(0,18).map(row=>row[18]);
  const prediction=codeword(coefficients);
  const matches=interior.filter((position,i)=>prediction[position]===known[i]).length;
  return {rank,coefficients,prediction,matches};
}

/** @param {string} text @returns {number[]} */
function gp(text) {
  const dictionary=corpus.translit.slice().sort((a,b)=>b.length-a.length);
  const out=[];
  for(const word of text.split(" ")){
    for(let at=0;at<word.length;){
      const part=dictionary.find(token=>word.startsWith(token,at));
      assert.ok(part,"Unrecognized source spelling");
      out.push(corpus.translit.indexOf(part));
      at+=part.length;
    }
  }
  return out;
}
const p55=corpus.pages.find(x=>x.page===55).indices;
const p56=corpus.pages.find(x=>x.page===56).indices;
const p57=corpus.pages.find(x=>x.page===57).indices;
const p56Plain=gp("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.deepEqual([p55.length,p56.length,p57.length,p56Plain.length],[76,85,95]);

// The original 256-byte table must be recovered fully as a positive control.
const originalSourceFit=recover(interior.map(pos=>originalResidues[pos]));
assert.equal(originalSourceFit.matches,180);
assert.deepEqual(originalSourceFit.prediction,originalResidues);
// Another independent authentic-GP full-codeword plant also must recover.
const independentSeed=p56Plain.slice(0,18);
const planted=codeword(independentSeed);
const nativePlant=recover(interior.map(pos=>planted[pos]));
assert.deepEqual(nativePlant.prediction,planted);
assert.deepEqual(nativePlant.coefficients,independentSeed);

const originalPlainFit=recover([...p56Plain,...p57]);
const originalVisibleFit=recover([...p56,...p57]);
assert.deepEqual([originalPlainFit.matches,originalVisibleFit.matches],[21,20]);
const plainP55Hits=border.filter((pos,i)=>originalPlainFit.prediction[pos]===p55[i]).length;
const visibleP55Hits=border.filter((pos,i)=>originalVisibleFit.prediction[pos]===p55[i]).length;
assert.deepEqual([plainP55Hits,visibleP55Hits],[2,4]);

console.log(JSON.stringify({
  sourceByteHash:crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  q238Degree:factor238.length-1,
  independentInteriorKeyRank:18,
  fullyReconstructedActualGridSymbols:originalSourceFit.prediction.length,
  fullyReconstructedNativePlantSymbols:nativePlant.prediction.length,
  knownInteriorSymbols:180,
  originalSolvedPlaintextMatchedInterior:originalPlainFit.matches,
  originalVisibleCiphertextMatchedInterior:originalVisibleFit.matches,
  predictedP55RuneMatches:[plainP55Hits,visibleP55Hits],
  originalSolvedPlaintextModelSeed:originalPlainFit.coefficients,
  originalVisibleCiphertextModelSeed:originalVisibleFit.coefficients,
  outcome:"All-secret degree-238 polynomial-code terminal decoder rejected; no recovered plaintext",
},null,2));
