"use strict";
/**
 * Test whether the unique 72,700-byte mirrored trailer on LP1 05.jpg
 * supplies LP2's additive pad, allowing up to two collision-rejected
 * key draws per rune. This is a hypothesis, not a recovered key.
 * Reproduce: node sims/mirror_jpeg_pad.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { train, encode } = require("./grid_keyskip_viterbi.cjs");
const ROOT = path.join(__dirname, "..");
const MOD = 29, ADVANCE = 3, PENALTY = 3.5, WINDOW = 180;
const OFFSETS = [0,1,29,256,3301], NULL_ROUNDS = 24;
const mod = n => (n % MOD + MOD) % MOD;

/** @param {number} seed @returns {() => number} */
function generator(seed) {
  let s = seed >>> 0;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296; };
}

/**
 * Exact Viterbi across all key-skip patterns in the declared model.
 * @param {number[]} cipher Gematria Primus runic ciphertext indices.
 * @param {Uint8Array} key Candidate pad, reduced modulo 29.
 * @param {number} offset Pad start position.
 * @param {1|-1} sign Encryption sign, C=(P+sign*K) modulo29.
 * @param {ReturnType<typeof train>} language Trigram language model.
 * @returns {{score:number,perRune:number,plain:number[],skips:number}}
 */
function decode(cipher,key,offset,sign,language) {
  assert.ok(cipher.length >= 3 && offset < key.length);
  const p0 = mod(cipher[0]-sign*key[offset]);
  let previous = new Map([[offset*ADVANCE, {
    score:language.unigram[p0], index:offset, p:p0,
    parent:null, skips:0
  }]]);
  for (let i=1; i<cipher.length; i++) {
    const next = new Map();
    for (const state of previous.values()) {
      for (let d=1; d<=ADVANCE; d++) {
        const j=state.index+d;
        if(j>=key.length) continue;
        const p=mod(cipher[i]-sign*key[j]);
        let valid=true;
        for(let h=1;h<d;h++) if(mod(p+sign*key[state.index+h])!==cipher[i-1]) {
          valid=false;break;
        }
        if(!valid) continue;
        const ll=i===1 ? language.bigram[state.p*MOD+p]
          : language.trigram[(state.parent.p*MOD+state.p)*MOD+p];
        const s=state.score+ll-PENALTY*(d-1),id=j*ADVANCE+d-1;
        const old=next.get(id);
        if(!old || s>old.score) next.set(id,{
          score:s,index:j,p,parent:state,skips:state.skips+d-1
        });
      }
    }
    previous=next;
    assert.ok(previous.size>0);
  }
  let best=null;
  for(const s of previous.values()) if(!best||s.score>best.score) best=s;
  const score=best.score,skips=best.skips,plain=new Array(cipher.length);
  for(let i=cipher.length-1;i>=0;i--){plain[i]=best.p;best=best.parent;}
  return {score,perRune:score/cipher.length,plain,skips};
}

/**
 * Synthetic known-key anti-repeat plant for a positive control.
 * @param {number[]} plain @param {Uint8Array} key
 * @param {number} offset @param {1|-1} sign @param {number} seed
 */
function encrypt(plain,key,offset,sign,seed) {
  const random=generator(seed), cipher=[];
  let j=offset,prev=-1,skips=0;
  for(const p of plain){
    let c=mod(p+sign*key[j]),tries=0;
    while(c===prev && tries<ADVANCE-1 && random()<0.82) {
      j++;tries++;skips++;c=mod(p+sign*key[j]);
    }
    cipher.push(c);prev=c;j++;
  }
  return {cipher,skips};
}

/** @param {Buffer} jpeg */
function imageStreams(jpeg){
  const eoi=jpeg.lastIndexOf(Buffer.from([255,217]))+2;
  assert.ok(eoi>=2 && eoi<jpeg.length);
  const tail=Uint8Array.from(jpeg.subarray(eoi));
  const front=Uint8Array.from(tail).reverse();
  assert.equal(tail.length,72700);
  assert.deepEqual(front,Uint8Array.from(jpeg.subarray(0,tail.length)));
  const valid=Uint8Array.from(jpeg.subarray(0,eoi));
  return [
    {name:"trailing-mirror",bytes:tail},
    {name:"unmirrored-prefix",bytes:front},
    {name:"whole-jpeg",bytes:valid},
    {name:"reversed-jpeg",bytes:Uint8Array.from(valid).reverse()}
  ];
}

/** @param {{name:string,bytes:Uint8Array}[]} streams */
function candidateKeys(streams){
  const keys=[];
  for(const {name,bytes} of streams){
    keys.push({name:name+":mod29",key:Uint8Array.from(bytes,n=>n%29)});
    keys.push({name:name+":scaled29",
      key:Uint8Array.from(bytes,n=>Math.floor(n*29/256))});
  }
  return keys;
}

/**
 * All candidate orientations and shifts on one ciphertext window.
 * @param {number[]} cipher @param {{name:string,key:Uint8Array}[]} keys
 * @param {ReturnType<typeof train>} lm
 */
function scan(cipher,keys,lm){
  const results=[];
  for(const candidate of keys) for(const sign of [-1,1])
    for(const offset of OFFSETS) {
      const value=decode(cipher,candidate.key,offset,sign,lm);
      results.push({name:candidate.name,sign,offset,
        score:value.perRune,skips:value.skips,first35:value.plain.slice(0,35)});
    }
  return results.sort((a,b)=>b.score-a.score);
}

function main() {
  const jpeg=fs.readFileSync(path.join(ROOT,"resources","liber-primus","05.jpg"));
  const keys=candidateKeys(imageStreams(jpeg));
  const lm=train(fs.readFileSync(
    path.join(ROOT,"resources","control","shakespeare_first300k.txt"),"utf8"));
  const corpus=JSON.parse(fs.readFileSync(
    path.join(ROOT,"resources","liber-primus","lp2-corpus.json"),"utf8"));
  const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
  assert.equal(pages.length,55);
  assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
  const source=fs.readFileSync(path.join(
    ROOT,"resources","liber-primus","lp1-plaintext-reference.txt"),"utf8");
  const plain=encode(source.split("### 3")[1].split("### 4")[0]).slice(0,WINDOW);
  assert.equal(plain.length,WINDOW);
  assert.ok(new Set(keys[0].key.slice(3301,3301+WINDOW)).size>=25,
    "Positive pad must vary across the planted window");
  const plant=encrypt(plain,keys[0].key,3301,1,0x05a3301f);
  const replay=decode(plant.cipher,keys[0].key,3301,1,lm);
  const exact=replay.plain.filter((p,i)=>p===plain[i]).length;
  console.log("CONTROL",JSON.stringify({
    length:WINDOW,key:keys[0].name,sign:1,offset:3301,
    plantedSkips:plant.skips,decodedSkips:replay.skips,
    recovered:exact,recoveryRate:exact/WINDOW,score:replay.perRune
  }));
  assert.ok(exact>=Math.ceil(0.85*WINDOW),"Known-pad control failed");

  const testedPages=[0,1,20,49,51,55],observed=[];
  for(const page of testedPages){
    const cipher=pages.find(p=>p.page===page).indices.slice(0,WINDOW);
    const models=scan(cipher,keys,lm);
    observed.push({page,length:cipher.length,
      strongest:models.slice(0,3),weakest:models.at(-1).score});
  }
  console.log("OBSERVED",JSON.stringify(observed));

  const random=generator(0x13051713);
  const target=pages[0].indices.slice(0,WINDOW);
  const actual=scan(target,keys,lm)[0].score;
  const nullMaxima=[];
  for(let trial=0;trial<NULL_ROUNDS;trial++){
    const rotations=keys.map(item=>{
      const shift=Math.floor(random()*(item.key.length-500));
      const key=new Uint8Array(item.key.length);
      for(let j=0;j<key.length;j++)key[j]=item.key[(j+shift)%key.length];
      return {name:item.name,key};
    });
    nullMaxima.push(scan(target,rotations,lm)[0].score);
  }
  const mean=nullMaxima.reduce((s,n)=>s+n,0)/NULL_ROUNDS;
  const sd=Math.sqrt(nullMaxima.reduce((s,n)=>s+(n-mean)**2,0)/(NULL_ROUNDS-1));
  console.log("NULL",JSON.stringify({
    page:0,window:WINDOW,candidates:keys.length*2*OFFSETS.length,
    randomSeed:"0x13051713",nullTrials:NULL_ROUNDS,
    observedMax:actual,nullMean:mean,nullSD:sd,
    nullMax:Math.max(...nullMaxima),
    empiricalP:(1+nullMaxima.filter(n=>n>=actual).length)/(NULL_ROUNDS+1)
  }));
}
if(require.main===module) main();
module.exports={decode,encrypt,imageStreams,candidateKeys,scan};
