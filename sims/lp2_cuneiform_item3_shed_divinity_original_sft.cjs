'use strict';
/**
 * Test one human-readable, first-party LP cipher hypothesis:
 *
 * p57 solved command "SHED OUR OWN CIRCUMFERENCES ... FIND THE DIVINITY WITHIN"
 * selects the strictly INSIDE rune of each word and the independently solved
 * LP1 "DIVINITY" 8-rune Vigenere key. On p37 printed red item3 these are
 * exactly 49 GP29 interior runes after removing one first and last rune from
 * 25 complete printed words (one singleton contributes no interior).
 *
 * The known cipher's plaintext-F branch must be exact: literal P=F encodes
 * C=F and does not advance key; ordinary non-F letters advance. Explore all
 * legal ciphertext-F alternatives before scoring any output.
 *
 * Compare original intact 98, peeled 49 interior and 49 exteriors; do not
 * fit a secret, direction, period, phase, reset, order or language model.
 * Original-source results and solved-native p57 positive plant are replayed.
 *
 * Windows 11 Node22 CommonJS. No writes/network.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const authentic=require('./authentic_lp1_p03_p04_vigenere_recovery.cjs');
const key=authentic.key;
assert.deepEqual(key,[23,10,1,10,9,10,16,26]);
assert.equal(authentic.plaintext.length,515);
const map=new Map(corpus.runes.map((x,i)=>[x,i]));
const raw=read('resources/lp2-transcription.txt').split('%')[37];
let start=0,offset=0,word=[],words=[];
const finish=()=>{if(word.length){words.push({start,end:offset,w:word});word=[]}};
for(const ch of raw){
  if(map.has(ch)){if(!word.length)start=offset;word.push(map.get(ch));offset++}
  else if(ch==='/'||/\s/u.test(ch)){}else finish();
}
finish();
assert.equal(offset,228);
const item=words.filter(x=>x.start>=91&&x.end<=189);
assert.equal(item.length,25);
const whole=item.flatMap(x=>x.w);
const interior=item.flatMap(x=>x.w.slice(1,-1));
const edges=item.flatMap(x=>x.w.length===1?[x.w[0]]:[x.w[0],x.w.at(-1)]);
assert.deepEqual([whole.length,interior.length,edges.length],[98,49,49]);
const mod=x=>((x%29)+29)%29;
/**
 * Enumerate all valid original-plaintext histories under source-known key.
 * @param {number[]} cipher
 * @returns {{plain:number[],phase:number[]} }
 */
function decodeAll(cipher){
  let states=[{plain:[],phase:0}];
  for(const c of cipher){
    const next=[];
    for(const state of states){
      if(c===0)next.push({plain:state.plain.concat(0),phase:state.phase});
      const p=mod(c-key[state.phase%key.length]);
      if(p!==0)next.push({plain:state.plain.concat(p),phase:state.phase+1});
    }
    states=next;
    if(!states.length)break;
  }
  return {
    paths:states,
    decodedLen:states.length?cipher.length:Math.max(0,cipher.length),
    survived:states.length>0
  };
}
/** @param {number[]} plain */
function encrypt(plain){
  let phase=0;
  return plain.map(p=>p===0?0:mod(p+key[(phase++)%key.length]));
}
/** @param {number[]} values */
function ioc(values){
  const h=Array(29).fill(0);for(const v of values)h[v]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {number[]} values */
const print=values=>values.map(i=>corpus.translit[i]).join('');
const results=[];
for(const [name,cipher] of [['whole98',whole],['interior49',interior],['edges49',edges]]){
  const decode=decodeAll(cipher);
  const valid=decode.paths.filter(p=>p.plain.length===cipher.length);
  for(const x of valid)assert.deepEqual(encrypt(x.plain),cipher);
  results.push({
    target:name,n:cipher.length,ciphertextFPositions:cipher.flatMap((x,i)=>x===0?[i]:[]),
    legalDecodings:valid.length,
    candidates:valid.map(x=>({nativeIoc:ioc(x.plain),keySteps:x.phase,
      transliteration:print(x.plain)}))
  });
}
assert.equal(results[0].legalDecodings,0);
assert.equal(results[1].legalDecodings,1);
assert.equal(results[2].legalDecodings,0);
// Independent original holdouts under the exact same solved cipher and
// original one-layer SHED rule. Red item3/4 stand-alone algebraic survival is
// insufficient to establish prose: a true source key should transfer.
const allRawPages=read('resources/lp2-transcription.txt').split('%');
/** @param {number} pageIndex */
function parseWords(pageIndex){
  const words=[];
  let current=[],offset=0,start=0;
  const flush=()=>{
    if(current.length){words.push({start,end:offset,w:current});current=[];}
  };
  for(const ch of allRawPages[pageIndex]){
    if(map.has(ch)){
      if(!current.length)start=offset;
      current.push(map.get(ch));offset++;
    }else if(ch==='/'||/\s/u.test(ch)){}else flush();
  }
  flush();
  return words;
}
const parsed={36:parseWords(36),37:parseWords(37),38:parseWords(38)};
const specs=[
  [{page:36,start:99,end:238}],
  [{page:37,start:0,end:91}],
  [{page:37,start:91,end:189}],
  [{page:37,start:189,end:228},{page:38,start:0,end:57}],
  [{page:38,start:57,end:186}]
];
const itemHoldouts=specs.map((parts,index)=>{
  const complete=parts.flatMap(({page,start,end})=>
    parsed[page].filter(w=>w.start>=start&&w.end<=end).map(w=>w.w));
  const intact=complete.flat();
  const peeled=complete.flatMap(w=>w.slice(1,-1));
  const border=complete.flatMap(w=>w.length===1?[w[0]]:[w[0],w.at(-1)]);
  return {
    item:index+1,wordCount:complete.length,intact: intact.length,
    peeled:peeled.length,border:border.length,
    intactSurvives:decodeAll(intact).paths.some(v=>v.plain.length===intact.length),
    peeledSurvives:decodeAll(peeled).paths.some(v=>v.plain.length===peeled.length),
    borderSurvives:decodeAll(border).paths.some(v=>v.plain.length===border.length)
  };
});
assert.deepEqual(itemHoldouts.map(x=>x.intact),[139,91,98,96,129]);
assert.deepEqual(itemHoldouts.map(x=>x.peeled),[79,51,49,58,74]);
assert.deepEqual(itemHoldouts.map(x=>x.border),[60,40,49,38,55]);
assert.deepEqual(itemHoldouts.map(x=>x.peeledSurvives),[false,false,true,true,false]);
assert.deepEqual(itemHoldouts.map(x=>x.intactSurvives),[false,false,false,false,false]);
assert.deepEqual(itemHoldouts.map(x=>x.borderSurvives),[false,false,false,false,false]);
const p57=corpus.pages.find(p=>p.page===57).indices;
const native=p57.slice(0,49);
assert.equal(native.length,49);
const nativeCipher=encrypt(native);
const nativeRecovered=decodeAll(nativeCipher).paths.some(p=>p.plain.length===native.length&&p.plain.every((v,i)=>v===native[i]));
assert(nativeRecovered);
const nativeFull=corpus.pages.find(p=>p.page===57).indices;
assert.equal(nativeFull.length,95);
assert(decodeAll(encrypt(nativeFull)).paths.some(p=>p.plain.every((v,i)=>v===nativeFull[i])));
console.log(JSON.stringify({
  premise:'exact authentic DIVINITY key on true word-interiors selected by solved p57 command',
  sourceItem:'p37 [91,189) item3 25 words, 98 original GP29 runes',
  testedKey: key,sourceNativeP57Positive49:nativeRecovered,
  sourceNativeP57Positive95:true,
  conclusion:'interior49 algebraically compatible with authenticated historical cipher but resulting native symbols are not coherent unknown-page plaintext',
  results,itemHoldouts
},null,2));
