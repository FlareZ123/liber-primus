'use strict';
/**
 * Source-addressed direct original LP2 inverse: 256 byte-grid values
 * matched to 256 punctuation/physical-page intervals, with the
 * base29 quotient/remainder as one simple affine-rune state per interval.
 * Distinct from stationary-per-interval substitution gates.
 * Windows 11, Node 22: node sims/lp2_grid256_interval_affine_byte_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/base60-grid.json')).byte_rows.flat();
assert.equal(table.length,256);
assert(table.every(b=>Number.isInteger(b)&&b>=0&&b<256));
const raw=read('resources/liber-primus/lp2-transcription.txt');
const pieces=raw.split('%');
assert.equal(pieces.length,57);
const physical=[...pieces.slice(0,50),'',...pieces.slice(50,55)];
const source=physical.join('%');
const separators=[...source].filter(c=>'.&$%'.includes(c));
const counts=Object.fromEntries([...'.&$%'].map(c=>[c,separators.filter(x=>x===c).length]));
assert.deepEqual(counts,{'.':175,'&':17,'$':8,'%':55});
const runeId=new Map(gp.runes.map((r,i)=>[r,i]));
const intervals=source.split(/[.&$%]/u).map(segment=>[...segment]
  .filter(ch=>runeId.has(ch)).map(ch=>runeId.get(ch)));
const length=intervals.map(x=>x.length);
const original=intervals.flat();
assert.equal(intervals.length,256);
assert.equal(intervals.filter(w=>!w.length).length,37);
assert.equal(original.length,12956);
assert.deepEqual(original,gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
const mod=(x,n)=>(x%n+n)%n;
/** @param {number[]} xs */
function ioc(xs){
  let n=0;const f=new Uint32Array(29);
  for(const x of xs){assert(x>=0&&x<29);f[x]++;n++;}
  return f.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));
}
const token=gp.translit.map((text,index)=>({text,index})).sort((a,b)=>b.text.length-a.text.length);
/** @param {string} raw */
function encodeNative(raw){
  const words=raw.match(/[A-Za-z]+/g)||[],out=[];
  for(const w of words){
    const s=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/[KQ]/g,'C').replace(/Z/g,'S');
    for(let j=0;j<s.length;){
      if(s.startsWith('ING',j)){out.push(21);j+=3;continue;}
      if(s.startsWith('IO',j)){out.push(27);j+=2;continue;}
      const t=token.find(x=>s.startsWith(x.text,j));
      assert(t, 'unmapped native spelling '+s.slice(j));
      out.push(t.index);j+=t.text.length;
    }
  }
  return out;
}
const references=[
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
].map(([name,file])=>{
  const xs=encodeNative(read(file));
  assert(xs.length>=12956);
  return {name,runicSourceLength:xs.length,
    originalSizedFirstWindowIoc:ioc(xs.slice(0,12956)),runes:xs};
});
/** @param {number} byte @param {number} j @param {boolean} swap */
function phase(byte,j,swap){
  const q=Math.floor(byte/29),r=byte%29;
  return mod((swap?q:r)+(swap?r:q)*j,29);
}
/**
 * @param {number[][]} segments
 * @param {boolean} swap
 * @param {-1|1} sign
 * @returns {number[][]}
 */
function decode(segments,swap,sign){
  return segments.map((seg,i)=>seg.map((x,j)=>
    mod(x+sign*phase(table[i],j,swap),29)));
}
/**
 * @param {number[]} data
 * @param {boolean} swap
 * @param {-1|1} sign
 */
function plant(data,swap,sign){
  assert.equal(data.length,original.length);
  let i=0;
  const encrypted=length.map((size,segment)=>{
    const xs=data.slice(i,i+size);
    i+=size;
    return xs.map((x,j)=>mod(x-sign*phase(table[segment],j,swap),29));
  });
  assert.deepEqual(decode(encrypted,swap,sign).flat(),data);
  return encrypted;
}
const native=references[0].runes.slice(0,12956);
const variants=[];
for(const swap of [false,true])for(const sign of [-1,1]){
  const plain=decode(intervals,swap,sign).flat();
  const recovered=plant(native,swap,sign);
  assert.deepEqual(decode(recovered,swap,sign).flat(),native);
  const nativeEncryptedIoc=ioc(recovered.flat());
  variants.push({
    reading:swap?'quotient-as-intercept, remainder-as-slope':'remainder-as-intercept, quotient-as-slope',
    sign,plaintextIoc:ioc(plain),
    prefix:plain.slice(0,65).map(x=>gp.translit[x]).join(''),
    nativePlantRoundtrip:12956,nativePlantCiphertextIoc:nativeEncryptedIoc
  });
}
const rawIoc=ioc(original);
const maxOriginalIoc=Math.max(...variants.map(x=>x.plaintextIoc));
const minNativeIoc=Math.min(...references.map(x=>x.originalSizedFirstWindowIoc));
console.log(JSON.stringify({
  status:'finite source-addressed direct moving-shift inverse, no author-selected operator',
  source:{physicalPunctuation:counts,totalIntervals:length.length,empty:37,
    tableBytes:table.length,originalRunes:original.length,
    uniqueTableBytes:new Set(table).size},
  rawIoc,maxOriginalIoc,minNativeIoc,
  controls:references.map(({runes,...fields})=>fields),
  variants,
  decision:'The literal base29 byte quotient/remainder affine-progressive interval key does not recover native GP29 plaintext.'
},null,2));
