'use strict';
/**
 * Source-constrained 4/4 scroll-anagram GF4/radix59 pad consumed as a GP29
 * previous-cipher rank28 nonrepeat decoder on the entire untouched original
 * 10,827-rune LP2 p9–p55 ciphertext. Four natural clock/sign variants.
 *
 * No author-signed opcode has been found: negative direct native-GP test.
 * Windows Node22: node sims/lp2_source_gf4_fourpair_rank28_original_cipher_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(base,'lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(base,'lp2-grid-256.json'),'utf8'));
const src=fs.readFileSync(path.join(base,'lp2-transcription.txt'),'utf8');
/** @param {number} x @param {number} n @returns {number} */
const mod=(x,n)=>((x%n)+n)%n;
const alpha59=grid.alphabet.replace('f','');
const panel=grid.pages.flatMap(p=>p.tokens).map(t=>
  59*alpha59.indexOf(t[0])+alpha59.indexOf(t[1]));
assert.equal(panel.length,256);
/** @param {number} a @param {number} b @returns {number} */
function gf4mul(a,b){
  let y=0;
  for(let j=0;j<2;j++){if((b>>j)&1)y^=a;a<<=1;if(a&4)a^=7;}
  return y;
}
let state=[2,0,0,0];
const pad=[];
for(let i=0;i<255;i++){
  pad.push(panel[state.reduce((a,b)=>4*a+b,0)]);
  let next=0;
  for(let j=0;j<4;j++)next^=gf4mul(state[j],[3,2,0,3][j]);
  state=[state[1],state[2],state[3],next];
}
assert.deepEqual(state,[2,0,0,0]);
const p8=corpus.pages.find(p=>p.page===8).indices;
const pairs=[[47,240],[48,231],[235,236],[88,179]];
const decodedOriginalPage8=p8.map((v,i)=>mod(v+pad[i],29));
assert.deepEqual(pairs.map(([i,j])=>
  [decodedOriginalPage8[i],decodedOriginalPage8[j]]),
  [[20,20],[8,8],[2,2],[9,9]]);
const pages=corpus.pages.filter(p=>p.page>=9&&p.page<=55);
const cipher=pages.flatMap(p=>p.indices);
assert.equal(cipher.length,10827);
const predecessor=p8.at(-1);
const gpMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const wordClock=[];
let wholeWordIndex=0;
for(const ch of src.split('%').slice(8,55).join('%')){
  if(gpMap.has(ch))wordClock.push(wholeWordIndex);
  else if(ch==='-'||ch==='.')wholeWordIndex++;
}
assert.equal(wordClock.length,p8.length+cipher.length);
const pageOffsets=new Map();let off=0;
for(const p of pages){pageOffsets.set(p.page,off);off+=p.indices.length;}
/** @param {number[]} text @returns {number} */
function ioc(text){
  const counts=Array(29).fill(0);
  for(const v of text)counts[v]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(text.length*(text.length-1));
}
/**
 * @param {number[]} data
 * @param {-1|1} sign
 * @param {'rune'|'word'} clock
 * @returns {number[]}
 */
function decode(data,sign,clock){
  const out=Array(data.length);
  let prev=predecessor;
  for(let i=0;i<data.length;i++){
    const d=mod(data[i]-prev,29);
    prev=data[i];
    const k=clock==='rune'?pad[i%255]:pad[wordClock[255+i]%255];
    out[i]=d===0?28:mod(d-1+sign*k,28);
  }
  return out;
}
/**
 * @param {number[]} plain
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encodeRuneClock(plain,sign){
  let prev=predecessor;
  return plain.map((r,i)=>{
    const d=r===28?0:mod(r-sign*pad[i%255],28)+1;
    prev=mod(prev+d,29);
    return prev;
  });
}
const records=[];
for(const sign of [-1,1]){
  for(const clock of ['rune','word']){
    const p=decode(cipher,sign,clock);
    const page9=p.slice(pageOffsets.get(9),pageOffsets.get(9)+pages[0].indices.length);
    const page16=p.slice(pageOffsets.get(16),pageOffsets.get(16)+
      corpus.pages.find(x=>x.page===16).indices.length);
    const page40=p.slice(pageOffsets.get(40),pageOffsets.get(40)+
      corpus.pages.find(x=>x.page===40).indices.length);
    records.push({sign,clock,originalRunes:p.length,
      wholeIoC:ioc(p),page9IoC:ioc(page9),
      page16IoC:ioc(page16),page40IoC:ioc(page40),
      escapeRunes:p.filter(x=>x===28).length});
    assert.equal(ioc(p)<0.036,true,'original whole non-native-GP');
    assert.equal(p.filter(x=>x===28).length,73);
    if(clock==='rune'){
      assert.deepEqual(encodeRuneClock(p,sign),cipher);
      const solved=corpus.pages.find(x=>x.page===57).indices;
      assert.equal(solved.length,95);
      assert.deepEqual(decode(encodeRuneClock(solved,sign),sign,'rune'),solved);
      const injected=solved.slice();
      injected[11]=28;
      const encrypted=encodeRuneClock(injected,sign);
      assert.equal(encrypted[11],encrypted[10]);
      assert.deepEqual(decode(encrypted,sign,'rune'),injected);
    }
  }
}
console.log(JSON.stringify({sourceAnagramEquals:4,originalReceiverRunes:cipher.length,
  solvedP57IoC:ioc(corpus.pages.find(x=>x.page===57).indices),
  records},null,2));
console.log('PASS: frozen 4/4 source-key four natural rank28 inverses remain nonprose; exact original replay and solved 95-rune plants pass.');
