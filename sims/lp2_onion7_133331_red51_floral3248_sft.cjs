'use strict';

/**
 * Reproduces one source-bounded LP2 original-input test:
 * onion7 original HTML title133 + div331, 16 floral pages p40..55,
 * highlighted p15 3299, and exact red p53 51-rune span.
 *
 * Excluding two red title rubrics and the red51 passage leaves
 * (3299-51) = 3248 = 7*(133+331) = 7*16*29 source runes.
 *
 * This is a hypothetical geometry and red-key cipher, NOT an authenticated
 * decryption. Original-source IoC must be assessed apart from exact round trips.
 * Node.js 22 CommonJS, no external packages or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT=path.resolve(__dirname,'..');
const get=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(get('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(get('resources/liber-primus/lp2-ink-annotations.json'));
const html=get('resources/cicada2014-onion7-index.html');
const id=Number(html.match(/<div id="(\d+)"/i)?.[1]);
const title=Number(html.match(/<title>(\d+)<\/title>/i)?.[1]);
assert.deepEqual([title,id],[133,331]);
assert.equal((html.match(/<img src="\d+\.jpg"/g)||[]).length,58);
assert.equal(title+id,464);
assert.equal(corpus.runes.length,29);

/** @param {number} page */
function page(page) {
  const q=corpus.pages.find(p=>p.page===page);
  assert.ok(q,'Missing original physical page '+page);
  return q;
}

/** @param {number} page */
function spans(page) {
  return ink.pages.find(p=>p.page===page)?.red_spans||[];
}

const retained=[],retainedPerPage=[];
let red51;
for(let p=40;p<=55;p++){
  const body=page(p).indices.slice();
  const initial=spans(p).find(s=>s.start===0)?.length||0;
  if(p===40) assert.equal(initial,8);
  if(p===54) assert.equal(initial,9);
  if(p!==40&&p!==54)assert.equal(initial,0);
  body.splice(0,initial);
  if(p===53){
    const mark=spans(p).find(s=>s.start===128&&s.length===51);
    assert.ok(mark,'Missing 51-rune exact original red span');
    red51=page(p).indices.slice(mark.start,mark.start+mark.length);
    body.splice(128,51);
  }
  retained.push(...body);
  retainedPerPage.push({page:p,runes:body.length});
}
assert.equal(red51.length,51);
assert.equal(retained.length+red51.length,3299);
assert.equal(retained.length,7*(title+id));
assert.equal(retained.length,7*16*29);
assert.equal(retainedPerPage.find(p=>p.page===50).runes,0);

const N=retained.length;
const historical2014SevenOrder=Object.freeze([0,6,2,5,1,4,3]);
const inverseSevenOrder=historical2014SevenOrder.map((_,i)=>historical2014SevenOrder.indexOf(i));
const permutationMaps={
  identity:Array.from({length:N},(_,i)=>i),
  seven_block_forward:Array.from({length:N},(_,i)=>7*Math.floor(i/7)+historical2014SevenOrder[i%7]),
  seven_block_inverse:Array.from({length:N},(_,i)=>7*Math.floor(i/7)+inverseSevenOrder[i%7]),
  seven_rows_to_columns:Array.from({length:N},(_,i)=>(i%7)*464+Math.floor(i/7)),
  seven_columns_to_rows:Array.from({length:N},(_,i)=>(i%464)*7+Math.floor(i/464))
};
assert.deepEqual(Object.values(permutationMaps).map(p=>new Set(p).size),[N,N,N,N,N]);

/** @param {number[]} a @returns {number} */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const x of a)counts[x]++;
  return counts.reduce((v,n)=>v+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @param {number[]} pi */
function trans(a,pi){return pi.map(i=>a[i]);}
/** @param {number[]} pi */
function inverseMap(pi){
  const out=Array(pi.length);
  for(let i=0;i<pi.length;i++)out[pi[i]]=i;
  return out;
}
/** @param {number[]} a @param {number[]} key @param {number} sign */
function shift(a,key,sign){
  return a.map((v,i)=>(v+sign*key[i%key.length]+29)%29);
}
/** @param {number[]} a @param {{map:number[],key:number[],sign:number,before:boolean}} cfg */
function decode(a,cfg){
  return cfg.before?trans(shift(a,cfg.key,cfg.sign),cfg.map):
    shift(trans(a,cfg.map),cfg.key,cfg.sign);
}
/** @param {number[]} a @param {{map:number[],key:number[],sign:number,before:boolean}} cfg */
function encode(a,cfg){
  const inv=inverseMap(cfg.map);
  return cfg.before?shift(trans(a,inv),cfg.key,-cfg.sign):
    trans(shift(a,cfg.key,-cfg.sign),inv);
}

// Planted reference is actual solved p57 source GP29 text, repeated solely
// to check exact inverse mapping of every candidate. It does not select a key.
const known=page(57).indices;
assert.equal(known.length,95);
const plant=Array.from({length:N},(_,i)=>known[i%known.length]);

const variants=[];
for(const [order,map] of Object.entries(permutationMaps)){
  for(const sign of [-1,1])for(const direction of ['forward','reverse']){
    const key=direction==='forward'?red51:red51.slice().reverse();
    for(const before of [true,false]){
      const cfg={map,key,sign,before};
      const plain=decode(retained,cfg);
      const inverseCheck=encode(plain,cfg);
      assert.deepEqual(inverseCheck,retained,'Original decode inverse mismatch');
      const plantedCipher=encode(plant,cfg);
      const recovered=decode(plantedCipher,cfg);
      assert.deepEqual(recovered,plant,'Source-native planted plaintext lost');
      variants.push({
        permutation:order,keyDirection:direction,sign,
        layer:before?'key_then_permutation':'permutation_then_key',
        ioc:ioc(plain),
        sample:plain.slice(0,30).map(x=>corpus.translit[x]).join('-')
      });
    }
  }
}
assert.equal(variants.length,40);
variants.sort((a,b)=>b.ioc-a.ioc);
assert.ok(variants.every(v=>v.ioc<0.045),'Source candidate exceeded conservative prose-IoC discriminator');
const output={
  source:'original LP2 p40-p55, two red rubrics, p53 red51; historical onion7 HTML 133/331',
  firstPage:40,lastPage:55,sourceTitle:title,sourceDiv:id,
  physicalPageCount:16,gpAlphabetSize:29,
  indexedBodyBeforeRed51Removal:3299,red51Length:red51.length,
  derivedRegisterLength:N,exactFactorization:'3248 = 7 * (133+331) = 7 * 16 * 29',
  retainedPerPage,originalIoC:ioc(retained),syntheticNativePlantIoC:ioc(plant),
  positiveControls:variants.length,negativeOriginalVariants:variants.filter(v=>v.ioc<0.045).length,
  maxOriginalIoC:variants[0].ioc,minOriginalIoC:variants.at(-1).ioc,
  bestOriginalVariant:variants[0],worstOriginalVariant:variants.at(-1),
  verdict:'Bounded original-negative: no native-GP plaintext or selected historical inverse; geometry remains retrospective and operator/key unprescribed.'
};
console.log(JSON.stringify(output,null,2));
