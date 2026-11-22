'use strict';

/**
 * Original LP2 p6/p7 308-rune body + two 13-dot boundary values -> 310-rune
 * five-column source Hill gate. No fitted plaintext, key, phase or padding.
 *
 * Reproducer (Windows Node.js 22): node sims/lp2_p6_p7_markerrestored_hill5_original_sft.cjs
 * Original source inputs only; no output files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages = read('resources/liber-primus/lp2-transcription.txt').split('%');
const GP = new Map(book.runes.map((s, i) => [s, i]));
/** @param {number} page @returns {number[]} */
const indices = page => book.pages.find(p => p.page === page).indices;
/** @param {number} page */
const annotations = page => ink.pages.find(p => p.page === page);
const p6 = indices(6);
const p7 = indices(7);
assert.equal(p6.length, 196);
assert.equal(p7.length, 208);
assert.deepEqual(annotations(6).red_spans.map(s => [s.start,s.length]), [[71,11]]);
assert.deepEqual(annotations(7).red_spans.map(s => [s.start,s.length]), [[194,14]]);
for (const [page, offset] of [[6,82],[7,194]])
  assert(annotations(page).large_punctuation.some(
    event => event[0] === offset && event[1] === 13 && event[2] === 'red'));

/** Original p7 five printed red words: 2+4+3+2+3 runes. */
const lengths = [2,4,3,2,3];
let ptr = 194;
const redWords = lengths.map(n => {
  const v = p7.slice(ptr,ptr+n);
  ptr += n;
  return v;
});
assert.equal(ptr,208);
assert.deepEqual(redWords,[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]]);
const products = redWords.map(w => w.reduce((s,x) => s*x %29,1));
assert.deepEqual(products,[11,26,8,15,2]);

// Freeze the same right-rotating p7 source matrix already reported in
// im-results/lp2-p7-red-circulant-dh-original-inverse.md.
const M = Array.from({length:5},(_,i) =>
  Array.from({length:5},(_,j) => products[(j-i+5)%5]));
const I = [[23,2,5,2,19],[19,23,2,5,2],[2,19,23,2,5],
  [5,2,19,23,2],[2,5,2,19,23]];
/** @param {number[][]} A @returns {number[][]} */
const transpose = A => A.map((r,i) => r.map((_,j) => A[j][i]));
for(let i=0;i<5;i++)
  for(let j=0;j<5;j++)
    assert.equal(M[i].reduce((sum,v,k)=>sum+v*I[k][j],0)%29,Number(i===j));
/** @param {number[][]} A @param {number[]} a @returns {number[]} */
function apply(A,a) {
  assert.equal(a.length%5,0);
  return a.map((_,i) => A[i%5].reduce(
    (sum,v,j) => sum+v*a[i-i%5+j],0)%29);
}
const body = [...p6.slice(82),...p7.slice(0,194)];
assert.equal(body.length,308);
// Two original red 13-dot marks are represented by GP29 index13, at the
// exact delimiting positions. The inserted values are hypothetical operands,
// NOT original GP ciphertext runes.
const input = [13,...body,13];
assert.equal(input.length,310);
const plain = apply(I,input);
const transposed = apply(transpose(I),input);
assert.deepEqual(apply(M,plain),input);
assert.deepEqual(apply(transpose(M),transposed),input);

// Native clear p57 positive controls, exactly 95 original GP symbols.
const clear = indices(57);
assert.equal(clear.length,95);
assert.deepEqual(apply(I,apply(M,clear)),clear);
assert.deepEqual(apply(transpose(I),apply(transpose(M),clear)),clear);

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const hist = Array(29).fill(0);
  for(const s of a) hist[s]++;
  return hist.reduce((t,n)=>t+n*(n-1),0)/(a.length*(a.length-1));
}
const runic = ch => GP.has(ch);
const cut = new Set(['-','.','&','$','§']);
/** Preserve printed word bounds while ignoring physical line/page wraps.
 *  @param {string} text @returns {number[][]}
 */
function printedBounds(text) {
  let off=0,start=0,word=[];
  const out=[];
  for(const ch of text) {
    if(runic(ch)) {off++;word.push(ch);}
    else if(cut.has(ch)&&word.length) {
      out.push([start,off]); start=off; word=[];
    }
  }
  if(word.length)out.push([start,off]);
  return out;
}
/** @param {number} page @param {number} begin @param {number} end */
function sourceSlice(page,begin,end) {
  const block=pages[page>=50?page-1:page];
  let off=0,s='';
  for(const ch of block) {
    if(runic(ch)) {
      if(off>=begin&&off<end)s+=ch;
      off++;
    } else if(off>=begin&&off<end) s+=ch;
  }
  assert.equal(off,indices(page).length);
  return s;
}
const source = sourceSlice(6,82,196) + '%' + sourceSlice(7,0,194);
const bounds = printedBounds(source);
assert.equal(bounds.length,70);
assert.equal(bounds.reduce((sum,[a,b])=>sum+b-a,0),308);
const long = bounds.filter(([a,b])=>b-a>=4);
assert.equal(long.length,40);

const tokens=[['ING',21],['IO',27],...book.translit.map((s,i)=>[s,i])]
  .sort((a,b)=>b[0].length-a[0].length);
/** @param {string} raw @returns {string|null} */
function nativeKey(raw) {
  const s=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;) {
    const token=tokens.find(([t])=>s.startsWith(t,i));
    if(!token)return null;
    out.push(token[1]);i+=token[0].length;
  }
  return out.join(',');
}
const lex=new Set();
for(const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m=line.match(/^([a-z]+)\s+(\d+)/);
  if(!m||Number(m[2])<5)continue;
  const encoded=nativeKey(m[1]);
  if(encoded)lex.add(encoded);
}
/** @param {number[]} a @returns {number} */
const longHits=a=>long.filter(([start,end])=>
  lex.has(a.slice(start,end).join(','))).length;
const baseline=longHits(body);
const direct=longHits(plain.slice(1,-1));
const other=longHits(transposed.slice(1,-1));
assert.deepEqual([baseline,direct,other],[0,0,0]);

const sumWords = bounds.map(([start,end]) =>
  body.slice(start,end).reduce((total,value) => total+value,0)%29);
const productWords = bounds.map(([start,end]) =>
  body.slice(start,end).reduce((total,value) => total*value%29,1));
assert.equal(sumWords.length,70);
assert.equal(productWords.length,70);
const wordReads = {
  gp0sum: {plain:apply(I,sumWords),transposed:apply(transpose(I),sumWords)},
  product: {plain:apply(I,productWords),transposed:apply(transpose(I),productWords)}
};
assert.deepEqual(apply(M,wordReads.gp0sum.plain),sumWords);
assert.deepEqual(apply(M,wordReads.product.plain),productWords);
assert.deepEqual(apply(transpose(M),wordReads.gp0sum.transposed),sumWords);
assert.deepEqual(apply(transpose(M),wordReads.product.transposed),productWords);


/**
 * Different original-source key: join exactly the p6 red11 and p7 red14
 * runes into the 25-element Hill-5 matrix, independently investigated
 * previously on p8 and pp8..14. Test it here only on our new p6/p7
 * marker-bounded and 70-complete-word receivers.
 */
const red25 = [...p6.slice(71,82), ...p7.slice(194,208)];
assert.equal(red25.length,25);
const R = Array.from({length:5},(_,i)=>red25.slice(5*i,5*i+5));
const Rinv = [[12,24,21,20,25],[12,25,15,15,20],
  [0,17,15,1,17],[3,28,11,21,16],[24,24,1,25,27]];
assert.deepEqual(R,[[24,16,14,17,19],[6,27,15,17,14],
  [12,23,3,22,16],[2,25,5,7,11],[14,28,6,28,19]]);
for(let i=0;i<5;i++)
  for(let j=0;j<5;j++)
    assert.equal(R[i].reduce((sum,v,k)=>sum+v*Rinv[k][j],0)%29,Number(i===j));
const red25Decoders=[['inverse',Rinv,R],['forward',R,Rinv],
  ['transpose-inverse',transpose(Rinv),transpose(R)],
  ['transpose-forward',transpose(R),transpose(Rinv)]];
const red25Receivers=[
  ['marker-restored-310',input],
  ['word-index-sums-70',sumWords],
  ['word-index-products-70',productWords]
];
const red25Results = [];
for(const [receiver,source] of red25Receivers) {
  for(const [direction,decoder,encoder] of red25Decoders) {
    const plain=apply(decoder,source);
    assert.deepEqual(apply(encoder,plain),source);
    const item={receiver,direction,runes:plain.length,IoC:ioc(plain),
      text:plain.slice(0,receiver==='marker-restored-310'?35:70)
        .map(x=>book.translit[x]).join(' ')};
    if(receiver==='marker-restored-310') {
      item.exactLongWords=longHits(plain.slice(1,-1));
    }
    red25Results.push(item);
  }
}
assert(Math.abs(red25Results[0].IoC-0.035243762396909906)<1e-12);
assert(Math.abs(red25Results[4].IoC-0.03602484472049689)<1e-12);
assert(Math.abs(red25Results[10].IoC-0.0443064182194617)<1e-12);

const observed={
  inputSource:'p6 offsets82..195, p7 offsets0..193, two literal red13-dot counts',
  sourceCount:{bodyRunes:308,restoredLength:310,blackWords:70,longWords:40},
  p7ProductRow:products,
  ioc:{original:ioc(input),standard:ioc(plain),transposed:ioc(transposed),
    originalSolvedP57:ioc(clear)},
  nativeGPFiveOrMoreFrequencyLongWordHits:{
    ciphertext:baseline,standard:direct,transposed:other},
  standardPrefix:plain.slice(0,30).map(x=>book.translit[x]).join(' '),
  transposedPrefix:transposed.slice(0,30).map(x=>book.translit[x]).join(' '),
  wordLevelSourceCount:70,
  wordLevelReadouts:Object.fromEntries(Object.entries(wordReads).map(([name,r])=>
    [name,{standardIoC:ioc(r.plain),transposedIoC:ioc(r.transposed),
      standardText:r.plain.map(x=>book.translit[x]).join(' '),
      transposedText:r.transposed.map(x=>book.translit[x]).join(' ')}])),
  originalRed25Matrix:R,
  red25OriginalReceivers:red25Results,
  forwardReplay:true,solvedPlant:true,
  decision:'Both exact marker-restored 310-rune Hill5 consumers reject direct native-GP reading under fixed printed words.'
};
assert(Math.abs(observed.ioc.original-0.03447123916901555)<1e-12);
assert(Math.abs(observed.ioc.standard-0.03409541705814803)<1e-12);
assert(Math.abs(observed.ioc.transposed-0.034325086125900406)<1e-12);
console.log(JSON.stringify(observed,null,2));
