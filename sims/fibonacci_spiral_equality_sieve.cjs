'use strict';
/**
 * Test LP2 page-15 Fibonacci-prime spiral keys as hidden GP additive streams
 * behind a single unknown 29-way output rune alphabet.
 *
 * Unlike IoC-after-direct-decryption, equality-of-output is invariant under
 * any fixed symbol bijection. This is a manuscript-clue-specific key sieve.
 * All source keys come from the independently exact 4x4 square, not LP2
 * ciphertext optimization.
 *
 * Node 22 CommonJS, manual-only CI, results exploratory until plaintext is
 * independently recovered.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {candidates}=require('./fibonacci_spiral_key_derivation.cjs');
const {stream}=require('./base60_seeded_stream.cjs');
const {score}=require('./equality_pad_scan.cjs');
const {corpusWords}=require('./relative_key_english_probe.cjs');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const all=corpus.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(all.length,55);
const next=all.filter(p=>p.page===16);
const section=all.filter(p=>p.page>=16&&p.page<=22);
assert.equal(next.length,1);
assert.equal(section.length,7);
const keyList=candidates();
assert.equal(keyList.length,32);
/** @param {number} seed */
function rng(seed){
  let s=seed>>>0;
  return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};
}
const random=rng(0x341116);
/** @param {number} n */
function draw(n){return Math.floor(random()*n);}
/** @param {Buffer} bytes @param {'mod'|'scale'} mapping */
function mapBytes(bytes,mapping){
  return Uint8Array.from(bytes,x=>mapping==='mod'?x%29:Math.floor(29*x/256));
}
/**
 * @param {Array<{page:number,indices:number[]}>} group
 * @param {string} cipher
 * @param {Buffer} key
 * @param {'reset'|'continuous'|'page-iv'} align
 * @param {number} drop
 * @param {'mod'|'scale'} mapping
 */
function padFor(group,cipher,key,align,drop,mapping){
  if(align==='continuous'){
    const total=group.reduce((n,p)=>n+p.indices.length,0);
    const raw=mapBytes(stream(cipher,key,'zero',0,total,drop),mapping);
    let offset=0;
    return group.map(p=>{
      const a=raw.subarray(offset,offset+p.indices.length);
      offset+=p.indices.length;return a;
    });
  }
  const max=Math.max(...group.map(p=>p.indices.length));
  const fixed=align==='reset'?mapBytes(
    stream(cipher,key,'zero',0,max,drop),mapping):null;
  return group.map(p=>fixed?fixed.subarray(0,p.indices.length):mapBytes(
    stream(cipher,key,'last-be',p.page,p.indices.length,drop),mapping));
}
/**
 * @param {Array<{page:number,indices:number[]}>} group
 */
function scan(group){
  const ciphertext=group.map(x=>x.indices);
  const ranked=[];
  for(const secret of keyList)
    for(const cipher of ['aes-256-ctr','chacha20','rc4'])
      for(const align of cipher==='rc4'?['reset','continuous']:
        ['reset','continuous','page-iv'])
        for(const drop of [0,256])
          for(const mapping of ['mod','scale']){
            const pad=padFor(group,cipher,secret.key,align,drop,mapping);
            for(const sign of [-1,1])
              ranked.push({key:secret.name,cipher,align,drop,mapping,sign,
                value:score(ciphertext,pad,sign)});
          }
  ranked.sort((a,b)=>b.value-a.value);
  return {count:ranked.length,top:ranked.slice(0,8)};
}
/** Planted true AES-CTR, raw spiral BE key + unknown output permutation. */
function plantControl(){
  const source=keyList.find(k=>k.name==='absolute-spiral:BE');
  assert.ok(source);
  const pad=padFor(section,'aes-256-ctr',source.key,'reset',0,'mod');
  const english=corpusWords(fs.readFileSync(path.join(root,
    'resources/control/shakespeare_first300k.txt'),'utf8')
    .slice(240000)).flat();
  const total=section.reduce((n,p)=>n+p.indices.length,0);
  assert.ok(english.length>total);
  const permutation=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){const j=draw(i+1);[permutation[i],permutation[j]]=
    [permutation[j],permutation[i]];}
  let pos=draw(english.length-total),rewrites=0;
  const planted=section.map((page,index)=>{
    const ciphertext=[];
    for(let i=0;i<page.indices.length;i++){
      let c=permutation[(english[pos++]+pad[index][i])%29];
      if(i>0&&c===ciphertext[i-1]&&random()<.81){
        c=(c+1+draw(28))%29;rewrites++;
      }
      ciphertext.push(c);
    }
    return {page:page.page,indices:ciphertext};
  });
  const results=scan(planted);
  const exact=results.top.find(v=>v.key===source.name&&
    v.cipher==='aes-256-ctr'&&v.align==='reset'&&v.drop===0&&
    v.mapping==='mod'&&v.sign===1);
  return {rewrites,exactTop8:!!exact,highest:results.top[0],options:results.count};
}
/**
 * @param {Array<{page:number,indices:number[]}>} group
 * @param {{key:string,cipher:string,align:string,drop:number,mapping:string,sign:number,value:number}} winner
 */
function randomPadCalibration(group,winner){
  const real=group.map(p=>p.indices);
  const nullScores=[],max=Math.max(...group.map(p=>p.indices.length));
  for(let j=0;j<500;j++){
    const k=Uint8Array.from({length:max},()=>draw(256));
    const pad=group.map(p=>k.subarray(0,p.indices.length));
    const scores=[score(real,pad,1),score(real,pad,-1)];
    nullScores.push(Math.max(...scores));
  }
  nullScores.sort((a,b)=>a-b);
  const above=nullScores.filter(x=>x>=winner.value).length;
  return {sampleCount:500,median:nullScores[250],maximum:nullScores[499],
    perCandidateUpperTail:(above+1)/501,bonferroniUpperBound:
      Math.min(1,(keyList.length*3*3*2*2*2)*(above+1)/501)};
}

/**
 * Select only from pages16–18, then predict equality on untouched pages19–22.
 * A continuous key is advanced across the training pages before evaluation.
 * Null streams respect the model's reset/continuous/page-IV key sharing.
 */
function splitHoldout(){
  const left=section.slice(0,3),right=section.slice(3);
  const selected=scan(left);
  const winner=selected.top[0];
  const source=keyList.find(x=>x.name===winner.key);
  assert.ok(source);
  const truePad=padFor(section,winner.cipher,source.key,winner.align,
    winner.drop,winner.mapping).slice(3);
  const cipher=right.map(x=>x.indices);
  const out=score(cipher,truePad,winner.sign);
  const nulls=[];
  for(let rep=0;rep<1000;rep++){
    const max=Math.max(...section.map(p=>p.indices.length));
    let fake;
    if(winner.align==='continuous'){
      const length=section.reduce((n,p)=>n+p.indices.length,0);
      const master=Uint8Array.from({length},()=>draw(256)%29);
      let at=0;
      fake=section.map(p=>{
        const sub=master.subarray(at,at+p.indices.length);
        at+=p.indices.length;return sub;
      }).slice(3);
    } else if(winner.align==='reset'){
      const shared=Uint8Array.from({length:max},()=>draw(256)%29);
      fake=right.map(p=>shared.subarray(0,p.indices.length));
    } else {
      fake=right.map(p=>Uint8Array.from({length:p.indices.length},
        ()=>draw(256)%29));
    }
    nulls.push(score(cipher,fake,winner.sign));
  }
  nulls.sort((a,b)=>a-b);
  const larger=nulls.filter(x=>x>=out).length;
  return {selectedPages:[16,17,18],heldoutPages:[19,20,21,22],
    selectedWinner:winner,holdoutScore:out,
    heldoutNullMedian:nulls[500],heldoutNull95:nulls[950],
    heldoutUpperTailP:(larger+1)/1001,holdoutNullExceedances:larger,
    note:'Heldout p is valid only for a frozen key and stationary plaintext model; selection family and source register may still require additional controls.'};
}

function main(){
  const next16=scan(next),s16to22=scan(section),all55=scan(all);
  const calibration=randomPadCalibration(section,s16to22.top[0]);
  const pageSplit=splitHoldout();
  const control=plantControl();
  const result={
    source:'Exact Fibonacci-indexed prime spiral on original LP2 JPEG 32',
    keyCandidates:32,
    decoder:'additive GP rune pad with unknown bijective ciphertext alphabet',
    configurations:{next16:next16.count,following16to22:s16to22.count,
      all55:all55.count},
    following16to22:{best:s16to22.top,calibration,pageSplit},
    next16:{best:next16.top},
    all55:{best:all55.top},
    positive:control,
    verdict:'No key or plaintext claimed without independently readable GP text and held-out rune predictions.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)main();
module.exports={scan,padFor,plantControl,splitHoldout,main};
