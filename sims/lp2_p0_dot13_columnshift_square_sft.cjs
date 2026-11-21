'use strict';

/**
 * A genuinely distinct source-symmetry class for p0's physical 13-dot glyph:
 * allow an arbitrary original-square-cell lookup f(value) and one static
 * shift per VISIBLE dot column C/L/R. Unlike an affine/quadratic time clock,
 * paired non-center positions differ by an unknown constant L-R.
 *
 * The complete original 8|5 lexical inverse is KEY-INDEPENDENT.
 * Windows 11 Node.js 22 CommonJS SFT:
 * node sims/lp2_p0_dot13_columnshift_square_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const cipher = corpus.pages.find(page=>page.page===0).indices.slice(0,13);
assert.deepEqual(cipher,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const mod=x=>((x%29)+29)%29;
const letters=new Map(corpus.translit.map((s,i)=>[s,i]));
const tokens=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
const cols=Array.from({length:13},(_,i)=>i%3===0?'C':i%3===1?'L':'R');
assert.deepEqual(cols,['C','L','R','C','L','R','C','L','R','C','L','R','C']);

/** @param {string} raw @param {'native'|'letter'} spelling @returns {number[]} */
function encode(raw,spelling){
  const word=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<word.length;){
    if(spelling==='native'&&word.startsWith('ING',i)){
      out.push(21);i+=3;
    }else if(spelling==='native'&&word.startsWith('IO',i)){
      out.push(27);i+=2;
    }else if(spelling==='letter'){
      assert(letters.has(word[i]));
      out.push(letters.get(word[i]));i++;
    }else{
      const t=tokens.find(t=>word.startsWith(t.s,i));
      assert.ok(t,raw);out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}

/** @param {'native'|'letter'} spelling @returns {[Map<string,string>,Map<string,string>]} */
function dictionaries(spelling){
  const eights=new Map(),fives=new Map();
  for(const raw of (read('resources/control/english_wordfreq_textblob.txt')
    .match(/^[a-z]+/gmi)||[])){
    const v=encode(raw,spelling),to=v.length===8?eights:v.length===5?fives:null;
    if(to&&!to.has(v.join(',')))to.set(v.join(','),raw);
  }
  return [eights,fives];
}

/**
 * The 13-source-value physical order is invariant under 180-degree
 * rotation, so opposite C dots share shift and opposite L/R dots
 * differ by the SAME unknown delta = offset[L]-offset[R].
 * First word position7 fixes delta unless C7 is literal F.
 * @param {number[]} original
 * @param {Map<string,string>} eights
 * @param {Map<string,string>} fives
 * @param {boolean} fixedPositionLiteralF
 */
function screen(original,eights,fives,fixedPositionLiteralF){
  const hits=[];
  let firstEligible=0,deltaCases=0;
  for(const [key,first] of eights){
    const a=key.split(',').map(Number);
    if(fixedPositionLiteralF&&a.some((v,i)=>v===0&&original[i]!==0))
      continue;
    firstEligible++;
    const deltas=fixedPositionLiteralF&&a[7]===0
      ?Array.from({length:29},(_,i)=>i)
      :[mod(original[7]-a[7]-original[5]+a[5])];
    for(const delta of deltas){
      deltaCases++;
      const b=[
        mod(a[4]+original[8]-original[4]+delta),
        mod(a[3]+original[9]-original[3]),
        mod(a[2]+original[10]-original[2]-delta),
        mod(a[1]+original[11]-original[1]+delta),
        mod(a[0]+original[12]-original[0])
      ];
      if(fixedPositionLiteralF&&b.some((v,i)=>v===0&&original[i+8]!==0))
        continue;
      const second=fives.get(b.join(','));
      if(second)hits.push({first,second,delta});
    }
  }
  return {firstCandidates:eights.size,secondCandidates:fives.size,
    firstEligible,deltaCases,exactWordPairs:hits};
}

/** @returns {number[][]} */
function squareBands(){
  const matrices=read('resources/cicada2014-openpuff-magic-squares.txt')
    .trim().split(/\r?\n\s*\r?\n/).map(block=>block.trim()
      .split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(matrices.map(m=>m.length),[5,7,5]);
  return [matrices[0],matrices[2]].map(matrix=>{
    const entries=[];
    for(let s=0;s<=8;s++){
      for(let r=0;r<5;r++){
        const c=s-r;
        if(c>=0&&c<5&&Math.abs(r-c)<=1)
          entries.push({value:matrix[r][c],column:r===c?'C':r<c?'L':'R'});
      }
    }
    assert.equal(entries.length,13);
    assert.deepEqual(entries.map(x=>x.column),cols);
    for(let i=0;i<6;i++)
      assert.equal(entries[i].value,entries[12-i].value);
    assert.equal(new Set(entries.map(x=>x.value)).size,7);
    return entries;
  });
}

/** @param {{value:number,column:string}[]} band
 * @param {number[]} plain @param {number} delta
 * @param {boolean} passF @returns {number[]} */
function plant(band,plain,delta,passF){
  return plain.map((p,i)=>{
    if(passF&&p===0)return 0;
    const k=mod(band[i].value+({C:0,L:delta,R:0})[band[i].column]);
    return mod(p+k);
  });
}

/** @param {number[]} plain @returns {number[]} */
const keyOf=plain=>cipher.map((v,i)=>mod(v-plain[i]));
/** @param {number[]} k @param {{value:number,column:string}[]} band
 * @param {number} delta @returns {boolean} */
function hasCodebook(k,band,delta){
  const codebook=new Map();
  for(let i=0;i<13;i++){
    const f=mod(k[i]-(band[i].column==='L'?delta:0));
    const n=band[i].value;
    if(codebook.has(n)&&codebook.get(n)!==f)return false;
    codebook.set(n,f);
  }
  return codebook.size===7;
}

/** @param {number} value @returns {number} */
function eulerPhi(value){
  let n=value,result=value;
  for(let p=2;p*p<=n;p++){
    if(n%p===0){
      while(n%p===0)n/=p;
      result=result/p*(p-1);
    }
  }
  if(n>1)result=result/n*(n-1);
  return result;
}

/** @param {number[]} residual @param {{value:number,column:string}[]} band
 * @param {(v:number)=>number} valueMap @returns {boolean} */
function hasFrozenNumericMap(residual,band,valueMap){
  const h=new Map();
  for(let i=0;i<13;i++){
    const column=band[i].column;
    const diff=mod(residual[i]-valueMap(band[i].value));
    if(h.has(column)&&h.get(column)!==diff)return false;
    h.set(column,diff);
  }
  return h.size===3;
}

function main(){
  const bands=squareBands(),out={};
  for(const spelling of ['native','letter']){
    const [eights,fives]=dictionaries(spelling);
    const exact=screen(cipher,eights,fives,false);
    const bypass=screen(cipher,eights,fives,true);
    const expected=spelling==='native'
      ?[['regulate','tamed',16],['revulsion','taxed',16]]
      :[['regulate','tamed',16]];
    assert.deepEqual(exact.exactWordPairs.map(h=>[h.first,h.second,h.delta]),expected);
    assert.deepEqual(bypass.exactWordPairs.map(h=>[h.first,h.second,h.delta]),expected);
    // Reconstruct f(sourceValue) for each survivor on BOTH actual 5x5 squares:
    // The model is sufficient as well as necessary for these source values.
    for(const hit of exact.exactWordPairs){
      const plain=[...encode(hit.first,spelling),...encode(hit.second,spelling)];
      assert.equal(plain.length,13);
      for(const band of bands)assert(hasCodebook(keyOf(plain),band,hit.delta));
    }
    // Historical 2014 numeric source candidates, raw residue and Euler phi:
    // even with arbitrary independent column shifts, none of the surviving
    // phrases can be produced by these two first-party-style value maps.
    let sourceMapMatches=0;
    for(const hit of exact.exactWordPairs){
      const plain=[...encode(hit.first,spelling),...encode(hit.second,spelling)];
      const key=keyOf(plain);
      for(const band of bands)for(const f of [
        v=>mod(v),v=>mod(eulerPhi(v))
      ])if(hasFrozenNumericMap(key,band,f))sourceMapMatches++;
    }
    assert.equal(sourceMapMatches,0);
    // The historically quoted EPIPHANY SEEKS can no longer be rescued by
    // static column offsets (two mirrored center pairs disagree).
    const quoted=[...encode('epiphany',spelling),...encode('seeks',spelling)];
    const quotedKey=keyOf(quoted);
    assert.notEqual(quotedKey[0],quotedKey[12]);
    assert.notEqual(quotedKey[3],quotedKey[9]);
    // Test two real historical numeric band sources and distinct shifts.
    let positive=0;
    for(const band of bands)for(const delta of [7,16]){
      const phrase=[...encode('regulate',spelling),...encode('tamed',spelling)];
      const synthetic=plant(band,phrase,delta,false);
      const found=screen(synthetic,eights,fives,false).exactWordPairs;
      assert(found.some(h=>h.first==='regulate'&&h.second==='tamed'
        &&h.delta===delta));
      positive++;
      const bypassPhrase=[...encode('mischief',spelling),...encode('tamed',spelling)];
      assert.equal(bypassPhrase.length,13);
      assert.equal(bypassPhrase[7],0);
      const syntheticBypass=plant(band,bypassPhrase,delta,true);
      assert.equal(syntheticBypass[7],0);
      const foundBypass=screen(syntheticBypass,eights,fives,true).exactWordPairs;
      assert(foundBypass.some(h=>h.first==='mischief'&&h.second==='tamed'
        &&h.delta===delta));
      positive++;
    }
    assert.equal(positive,8);
    out[spelling]={uninterrupted:exact,fixedPositionLiteralF:bypass,positive,sourceMapMatches};
  }
  console.log(JSON.stringify({
    status:'PASS',
    input:'original p0 13-title runes; 2014 two 5x5 squares; original physical 13-dot raster C,L,R',
    class:'K[i]=secret_function(square_cell[i])+static_offset(dot_column[i]) over GP29',
    result:out,
    conclusion:'Exact 2 native and 1 letter-normalized wholeword algebraic survivors have unnatural title semantics and need secret fitted source-value codebooks; EPIPHANY SEEKS is impossible even under unknown column shifts. No authenticated plaintext/key.'
  },null,2));
}
if(require.main===module)main();
module.exports={encode,screen,squareBands,plant,hasCodebook};
