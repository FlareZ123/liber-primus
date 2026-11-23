'use strict';

// Frozen source-transfer hypothesis:
// LP2 p10's unique literal "7G" supplies 7 and GP-prime(G)=17, selecting the
// original 2013 CicadaOS DATA/560.17 object. A 2016 participant independently
// speculated about XORing 560.17 with the first seventeen LP2 pages.
// Test only p0..p16, continuous from source offset 0, one 5-bit GP29 symbol
// per source byte, with the two obvious 5-bit windows (low and high).
// No offset search, page resets, phase tuning, or other key transforms.

const fs = require('node:fs');
const crypto = require('node:crypto');

const URI = 'https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/3301-contents/data/560.17';
const EXPECTED_LENGTH = 1183811;
const EXPECTED_GIT_SHA1 = '49df8e57f8e6052eb2d5c2b483282461e53ef5ff';

function sha1GitBlob(data) {
  const prefix = Buffer.from('blob ' + data.length + '\0', 'ascii');
  return crypto.createHash('sha1').update(prefix).update(data).digest('hex');
}
function ioc(values) {
  const counts = Array(29).fill(0);
  let n = 0;
  for (const v of values) if (v >= 0 && v < 29) { counts[v]++; n++; }
  return n > 1 ? counts.reduce((s,c)=>s+c*(c-1),0)/(n*(n-1)) : 0;
}
function summarize(values, corpus, pages) {
  const valid = values.filter(v => v >= 0 && v < 29);
  const invalidPositions = [];
  for (let i=0;i<values.length;i++) if (values[i] > 28) invalidPositions.push(i);
  const counts = Array(29).fill(0);
  for (const v of valid) counts[v]++;
  const text = values.map(v => v < 29 ? corpus.translit[v] : '['+v+']').join('');
  const flat = values.map(v => v < 29 ? corpus.translit[v] : '?').join('');
  const words = ['THE','AND','YOU','THAT','THIS','WITH','FROM','WERE','HAVE','NOT','ARE','FOR','ONE','ALL','WE','TO','OF','IN','IS'];
  const wordHits = Object.fromEntries(words.map(w=>[w,(flat.match(new RegExp(w,'g'))||[]).length]));
  let at=0;
  const perPage=pages.map(p=>{
    const slice=values.slice(at,at+p.indices.length); at+=p.indices.length;
    return {page:p.page,length:slice.length,invalid:slice.filter(v=>v>28).length,ioc:ioc(slice)};
  });
  const grams=(n)=>{
    const m=new Map();
    for(let i=0;i<=valid.length-n;i++){
      const g=valid.slice(i,i+n).join(',');
      m.set(g,(m.get(g)||0)+1);
    }
    return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([g,count])=>({symbols:g.split(',').map(Number).map(v=>corpus.translit[v]).join(''),count}));
  };
  return {
    symbols:values.length,
    invalidCount:invalidPositions.length,
    invalidFraction:Number((invalidPositions.length/values.length).toFixed(6)),
    invalidFirst40:invalidPositions.slice(0,40),
    validSymbolIoC:Number(ioc(values).toFixed(6)),
    topSymbols:counts.map((count,index)=>({symbol:corpus.translit[index],index,count})).sort((a,b)=>b.count-a.count).slice(0,12),
    commonWordSubstringHits:wordHits,
    topBigrams:grams(2),
    topTrigrams:grams(3),
    perPage,
    first300Translit:text.slice(0,300)
  };
}

async function main() {
  const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
  const pages = corpus.pages.filter(p=>p.page>=0&&p.page<=16);
  if (pages.length !== 17 || pages.some((p,i)=>p.page!==i)) throw new Error('LP2 p0..p16 corpus selection is incomplete or reordered');
  const cipher = pages.flatMap(p=>p.indices);
  const response = await fetch(URI);
  if (!response.ok) throw new Error('560.17 download failed: HTTP '+response.status);
  const key = Buffer.from(await response.arrayBuffer());
  if (key.length !== EXPECTED_LENGTH) throw new Error('560.17 length mismatch: '+key.length);
  const blobSha1 = sha1GitBlob(key);
  if (blobSha1 !== EXPECTED_GIT_SHA1) throw new Error('560.17 original Git blob SHA-1 mismatch: '+blobSha1);
  if (cipher.length > key.length) throw new Error('source key shorter than selected text');

  const low5 = cipher.map((v,i)=>v ^ (key[i] & 31));
  const high5 = cipher.map((v,i)=>v ^ (key[i] >>> 3));
  const result = {
    hypothesis: 'LP2 p10 literal 7G -> 2013 DATA/560.17; continuous XOR over the first seventeen LP2 pages.',
    historicalSelector: '2016 participant speculation about 560.17 and first seventeen pages; not an author-authenticated instruction.',
    source: {uri:URI,length:key.length,gitBlobSha1:blobSha1,sha256:crypto.createHash('sha256').update(key).digest('hex')},
    receiver: {pages:pages.map(p=>p.page),symbolCount:cipher.length,sourceOffset:0,continuous:true},
    operation: 'one GP29 index per byte; XOR with low-five or high-five bits of each source byte',
    low5: summarize(low5,corpus,pages),
    high5: summarize(high5,corpus,pages),
    scopeLimit: 'No arbitrary offset, phase, reset, alternate serialization, or language-tuned search.'
  };
  console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
