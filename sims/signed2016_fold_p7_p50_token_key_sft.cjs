'use strict';
/**
 * Source-locked FOLD p7/p50 test: p7 has 208 GP ciphertext runes, its
 * p50 folded partner has 104 printed two-character base60 tokens = 208
 * character slots. Test natural token-pair numeric pads without seed search.
 * 24 direct GP29 additive models, independent native-GP train/test plant,
 * exact original recipher, shuffled-token matched negative reference.
 * Node.js 22 CJS: node sims/signed2016_fold_p7_p50_token_key_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode,train}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const target=gp.pages[7].indices;
const page50=grid.pages.find(x=>x.page===50);
const tokens=page50.tokens,bytes=page50.bytes;
const ALPHA='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const M=29,mod=x=>(x%M+M)%M;
assert.equal(target.length,208);
assert.equal(tokens.length,104);assert.equal(bytes.length,104);
assert(tokens.every(x=>x.length===2));
assert(tokens.every((x,i)=>ALPHA.indexOf(x[0])*60+ALPHA.indexOf(x[1])===bytes[i]));
assert.equal(tokens.join('').length,target.length);
const shakespeare=read('resources/control/shakespeare_first300k.txt');
const lm=train(shakespeare.slice(0,200000));
const source=encode(shakespeare.slice(237000)).slice(0,target.length);
assert.equal(source.length,target.length);
const settings=[];
for(const family of ['printed-base60-digits','byte-hex-nibbles','byte-base29-quotient-remainder'])
for(const reversedTokens of [false,true])
for(const swapPair of [false,true])
for(const sign of [-1,1])
  settings.push({family,reversedTokens,swapPair,sign});
assert.equal(settings.length,24);
/** @param {number[]} arr @param {{family:string,reversedTokens:boolean,swapPair:boolean,sign:number}} c */
function pad(arr,c){
  const tok=c.reversedTokens?arr.slice().reverse():arr;
  const out=[];
  for(const n of tok){
    let a,b;
    if(c.family==='printed-base60-digits'){
      a=Math.floor(n/60);b=n%60;
    }else if(c.family==='byte-hex-nibbles'){
      a=n>>>4;b=n&15;
    }else{
      a=Math.floor(n/29);b=n%29;
    }
    if(c.swapPair)[a,b]=[b,a];
    out.push(a%M,b%M);
  }
  assert.equal(out.length,208);
  return out;
}
/** @param {number[]} ciphertext @param {number[]} key @param {number} sign @returns {number[]} */
function dec(ciphertext,key,sign){
  return ciphertext.map((c,i)=>mod(c-sign*key[i]));
}
function enc(plain,key,sign){
  return plain.map((p,i)=>mod(p+sign*key[i]));
}
/** @param {number[]} plain */
function score(plain){
  let total=lm.unigram[plain[0]];
  for(let i=1;i<plain.length;i++)
    total+=i===1?lm.bigram[plain[i-1]*M+plain[i]]:
      lm.trigram[(plain[i-2]*M+plain[i-1])*M+plain[i]];
  return {train:total/plain.length,
    firstHalf:(lm.unigram[plain[0]]+
      plain.slice(1,104).reduce((sum,x,j)=>sum+(j===0?
        lm.bigram[plain[0]*M+x]:
        lm.trigram[(plain[j-1]*M+plain[j]*M)+x]),0))/104};
}
/** Fair separated two-window GP-language score, no transition across split. */
function splitScore(plain){
  const vals=[];
  for(const seq of [plain.slice(0,104),plain.slice(104)]){
    let v=lm.unigram[seq[0]];
    for(let i=1;i<seq.length;i++)
      v+=i===1?lm.bigram[seq[0]*M+seq[1]]:
      lm.trigram[(seq[i-2]*M+seq[i-1])*M+seq[i]];
    vals.push(v/seq.length);
  }
  return vals;
}
function run(ciphertext,sourceBytes=bytes){
  const ranked=settings.map(c=>{
    const k=pad(sourceBytes,c),p=dec(ciphertext,k,c.sign);
    assert.deepEqual(enc(p,k,c.sign),ciphertext);
    const [train,held]=splitScore(p);
    return {...c,train,held,preview:p.slice(0,44).map(x=>gp.translit[x]).join('')};
  });
  ranked.sort((a,b)=>b.train-a.train);
  return ranked;
}
const model={family:'printed-base60-digits',reversedTokens:false,swapPair:false,sign:1};
const k=pad(bytes,model);
const fake=enc(source,k,model.sign);
assert.deepEqual(dec(fake,k,model.sign),source);
const control=run(fake);
const correct=control.findIndex(x=>Object.entries(model)
  .every(([a,b])=>x[a]===b))+1;
assert(correct===1,'source-key plant rank1');
const actual=run(target),winner=actual[0];
let seed=0x20160750;
function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const SHUFFLES=128,shifted=[];
for(let i=0;i<SHUFFLES;i++){
  const a=bytes.slice();
  for(let j=a.length-1;j>0;j--){
    const k=rand()%(j+1);
    [a[j],a[k]]=[a[k],a[j]];
  }
  const ranked=run(target,a);
  shifted.push({train:ranked[0].train,held:ranked[0].held});
}
const ge=shifted.filter(x=>x.held>=winner.held).length;
console.log(JSON.stringify({
  hypothesis:'2016 THE->FOLD p7/p50 58-page mirror, 208 original GP runes and 104 original 2-character numeric tokens',
  sourcePages:[7,50],originalRunes:208,sourceTokens:104,
  exactTwoSourceCharactersPerRune:true,candidateSettings:24,
  trainRunes:104,heldoutRunes:104,
  planted:{source:'independent Shakespeare GP',trueModel:model,
    blindTrainRank:correct,originalRecovered:208,of:208,
    trueTrain:control[0].train,trueHeld:control[0].held},
  original:{winner,topThree:actual.slice(0,3),sourceTrueFamily:actual
    .filter(x=>x.family==='printed-base60-digits'&&!x.reversedTokens&&!x.swapPair)},
  tokenShuffleControls:{trials:SHUFFLES,seed:'0x20160750',
    shuffledTrainingBest:shifted.reduce((a,b)=>a+b.train,0)/SHUFFLES,
    shuffledHeldoutBest:shifted.reduce((a,b)=>a+b.held,0)/SHUFFLES,
    exceedObservedSelectedHeldout:ge,plusOneUpperTail:(ge+1)/(SHUFFLES+1)},
  caveat:'The equality 208=2x104 is source-structural; no plaintext follows unless original source-target inverse exhibits independently readable language'
},null,2));
