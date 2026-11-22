'use strict';

/**
 * Direct GF256 [256,76] systematic erasure test using the original 256-byte
 * LP2 p50 table as a bytewise XOR mask, following Cicada's authentic 2013
 * XOR-then-transport precedent. Unknown p55=76 data, solved p56+p57=180
 * parity. Genuine byte-level RS evaluation over GF256, no key or fit.
 * Run: node sims/lp2_terminal256_xor_rs76_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {gf256,interpolate,encode}=
  require('./lp2_terminal_76border_rs256_180interior_sft.cjs');
const read=name=>JSON.parse(fs.readFileSync(path.join(
  __dirname,'..',name),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const grid=read('resources/liber-primus/lp2-grid-256.json').pages
  .flatMap(p=>p.bytes);
assert.equal(grid.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const page=n=>corpus.pages.find(p=>p.page===n).indices;
const [p55,p56,p57]=[page(55),page(56),page(57)];
assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
const words='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const alphabet=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
const solved56=[];
for(const word of words.split(' ')) {
  for(let j=0;j<word.length;) {
    const entry=alphabet.find(x=>word.startsWith(x.token,j));
    assert(entry,'Invalid published p56 plaintext rune');
    solved56.push(entry.index);
    j+=entry.token.length;
  }
}
assert.equal(solved56.length,85);

/** Standard source 32x8 clockwise outside-in ring, 256 distinct byte cells. */
function ringCellIndices(){
  const cells=[];
  for(let m=0;m<4;m++){
    const top=m,bottom=31-m,left=m,right=7-m;
    for(let c=left;c<=right;c++)cells.push(8*top+c);
    for(let r=top+1;r<=bottom;r++)cells.push(8*r+right);
    for(let c=right-1;c>=left;c--)cells.push(8*bottom+c);
    for(let r=bottom-1;r>top;r--)cells.push(8*r+left);
  }
  assert.equal(new Set(cells).size,256);
  return cells;
}
const cells=ringCellIndices(),results=[];
const expected=[
  [0x11d,'ring-index','solved',0,117,197,7,0],
  [0x11d,'ring-index','visible',0,100,194,6,0],
  [0x11d,'table-cell-index','solved',1,210,197,7,0],
  [0x11d,'table-cell-index','visible',1,144,194,5,1],
  [0x11b,'ring-index','solved',1,210,197,10,0],
  [0x11b,'ring-index','visible',0,170,194,11,0],
  [0x11b,'table-cell-index','solved',0,64,197,9,0],
  [0x11b,'table-cell-index','visible',0,74,194,9,0]
];
for(const [polynomial,geometry,register,wantMatches,wantPred,
  wantActual,wantSubfield,wantP55] of expected){
  const field=gf256(polynomial);
  const index=j=>geometry==='ring-index'?j:cells[j];
  const selected=Array.from({length:76},(_,i)=>index(76+i));
  const fit=interpolate(field,selected);
  // Full native-field positive: exact recovery from only 76 evaluations.
  const sourceCoefficients=Array.from({length:76},(_,j)=>
    p57[j%p57.length]);
  const planted=encode(field,sourceCoefficients);
  assert(Array.from({length:256},(_,i)=>i)
    .every(i=>fit(planted,i)===planted[i]));
  const runes=(register==='solved'?solved56:p56).concat(p57);
  const ciphertext=Array(256).fill(0);
  for(let j=76;j<256;j++)
    ciphertext[index(j)]=runes[j-76]^grid[cells[j]];
  const heldout=Array.from({length:104},(_,i)=>{
    const j=152+i;
    return {predicted:fit(ciphertext,index(j)),
      actual:ciphertext[index(j)]};
  });
  const matched=heldout.filter(x=>x.predicted===x.actual).length;
  const decoded=Array.from({length:76},(_,j)=>
    fit(ciphertext,index(j))^grid[cells[j]]);
  const native=decoded.filter(n=>n<29).length;
  const matchesP55=decoded.filter((n,j)=>n===p55[j]).length;
  assert.deepEqual([matched,heldout[0].predicted,heldout[0].actual,
    native,matchesP55],[wantMatches,wantPred,wantActual,
    wantSubfield,wantP55]);
  results.push({field:field.name,geometry,register,
    parityChecksPassed:matched,parityChecksTotal:104,
    firstCheck:heldout[0],candidateP55Native:native,
    candidateP55MatchingVisible:matchesP55,
    plantRecovered:256});
}
console.log(JSON.stringify({status:'PASS',source:'Original LP2 p50 bytes, p55 unknown, pp56-57 solved',
  hypothesis:'GF256 [256,76] parity with original-byte XOR mask',
  output:results,conclusion:'All eight frozen models fail independent known parity; no p55 plaintext.'},null,2));
