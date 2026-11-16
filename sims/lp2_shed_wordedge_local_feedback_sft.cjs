'use strict';
/**
 * Original-source p57 "shed circumferences" local word-edge keys, exact
 * reversible 32-mode GP29 plaintext-interior tests against p0..55.
 * Windows Node.js 22: node sims/lp2_shed_wordedge_local_feedback_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=src.pages.filter(p=>p.page<56&&p.indices.length);
const chunks=read('resources/liber-primus/lp2-transcription.txt').split('%');
const rune=new Map(src.runes.map((r,i)=>[r,i]));
const mod=n=>(n%29+29)%29;
function parse(chunksSubset,expectedPages){
  const words=[];let word=[],physical=[],global=0;
  chunksSubset.forEach((chunk,p)=>{
    const observed=[...chunk].filter(c=>rune.has(c)).map(c=>rune.get(c));
    assert.deepEqual(observed,expectedPages[p].indices,'exact source page '+p);
    for(const ch of [...chunk]){
      if(rune.has(ch)){word.push(rune.get(ch));physical.push(global++);}
      else if('-.$&§'.includes(ch)&&word.length){
        words.push({source:word,offset:physical});
        word=[];physical=[];
      }
    }
  });
  if(word.length)words.push({source:word,offset:physical});
  assert.equal(words.reduce((s,w)=>s+w.source.length,0),global);
  return words;
}
const words=parse(chunks.slice(0,pages.length),pages);
assert.equal(words.length,2896);
assert.equal(words.reduce((s,w)=>s+w.source.length,0),12956);
assert.equal(words.filter(w=>w.source.length===1).length,83);
const clear=parse([chunks.at(-1)],[src.pages[57]]);
assert.equal(clear.length,20);
assert.equal(clear.reduce((s,w)=>s+w.source.length,0),95);
const ioc=arr=>{
  const f=new Uint32Array(29);
  arr.forEach(x=>f[x]++);
  return f.reduce((s,x)=>s+x*(x-1),0)/(arr.length*(arr.length-1));
};
assert.equal(ioc(clear.flatMap(w=>w.source.slice(1,-1))),0.07138047138047138);
function key(word,code){
  const left=word[0],right=word.at(-1);
  if(code==='first')return left;
  if(code==='last')return right;
  if(code==='sum')return mod(left+right);
  assert.equal(code,'difference');
  return mod(right-left);
}
/**
 * Encipher just word interiors; the two transmitted boundary runes
 * are retained verbatim as IV/side channel, so total source is lossless.
 * @param {number[]} w @param {string} step @param {string} keyMode
 * @param {number} sign @returns {number[]}
 */
function decode(w,step,keyMode,sign){
  if(w.length<=2)return w.slice();
  const k=key(w,keyMode),out=w.slice();
  for(let j=1;j<w.length-1;j++){
    const before=step==='plain'?0:step==='firstdiff'?w[j-1]:
      step==='lastdiff'?w[j+1]:j>=5?w[j-5]:w[0];
    out[j]=mod(w[j]-before+sign*k);
  }
  return out;
}
/** Inverse under exact saved ciphertext endpoints and word clock. */
function encode(decoded,step,keyMode,sign){
  if(decoded.length<=2)return decoded.slice();
  const k=key(decoded,keyMode),out=decoded.slice();
  if(step==='lastdiff'){
    for(let j=out.length-2;j>=1;j--)
      out[j]=mod(decoded[j]+out[j+1]-sign*k);
  }else for(let j=1;j<out.length-1;j++){
    const before=step==='plain'?0:step==='firstdiff'?out[j-1]:
      j>=5?out[j-5]:out[0];
    out[j]=mod(decoded[j]+before-sign*k);
  }
  return out;
}
const source=words.flatMap(w=>w.source);
const controls=clear.map(w=>w.source);
const models=[];
for(const step of ['plain','firstdiff','lastdiff','fiveback'])
  for(const keyMode of ['first','last','sum','difference'])
    for(const sign of [-1,1]){
      const encrypted=words.map(w=>w.source);
      const decoded=words.map(w=>decode(w.source,step,keyMode,sign));
      const rebuilt=decoded.map(w=>encode(w,step,keyMode,sign));
      assert.deepEqual(rebuilt,encrypted);
      assert.deepEqual(rebuilt.flat(),source);
      const inner=decoded.flatMap(w=>w.slice(1,-1));
      assert.equal(inner.length,7247);
      const nativeCipher=controls.map(w=>encode(w,step,keyMode,sign));
      const nativeReversed=nativeCipher.map(w=>decode(w,step,keyMode,sign));
      assert.deepEqual(nativeReversed,controls,'full 95-rune authentic p57 positive');
      const metric=ioc(inner);
      assert.ok(metric<0.04,'original has no GP-native interior concentration');
      models.push({step,keyMode,sign,ioc:metric,
        p0originalIntro:decoded.slice(0,3).map(w=>w.map(x=>src.translit[x]).join(''))});
    }
assert.equal(models.length,32);
models.sort((a,b)=>b.ioc-a.ioc);
assert.equal(models[0].ioc,0.03458851752108413);
assert.ok(models.every(m=>m.ioc<0.04));
const allSecretBounds={};
for(const rule of ['first','last','sum','difference']){
  const tables=Array.from({length:29},()=>new Uint32Array(29));
  for(const word of words){
    const w=word.source,group=key(w,rule);
    w.slice(1,-1).forEach(symbol=>tables[group][symbol]++);
  }
  const top=(k)=>tables.reduce((total,row)=>total+[...row].sort((a,b)=>b-a)
    .slice(0,k).reduce((s,x)=>s+x,0),0);
  allSecretBounds[rule]={top1:top(1),top5:top(5),top12:top(12)};
}
assert.deepEqual(allSecretBounds,{
  first:{top1:435,top5:1878,top12:3928},
  last:{top1:440,top5:1889,top12:3940},
  sum:{top1:435,top5:1895,top12:3957},
  difference:{top1:443,top5:1888,top12:3933}
});
const clearCounts=new Uint32Array(29);
controls.flatMap(w=>w.slice(1,-1)).forEach(x=>clearCounts[x]++);
const clearSorted=[...clearCounts].sort((a,b)=>b-a);
assert.equal(clearSorted[0],8);
assert.equal(clearSorted.slice(0,12).reduce((s,x)=>s+x,0),50);

console.log(JSON.stringify({
  hypothesis:'source p57 SHED OUR OWN CIRCUMFERENCES: exterior runes supply local key to interior runes',
  source:'unaltered 12956 GP29 LP2 runes, 2896 printed words, 32 physical-page carries',
  model:'4 low-complexity source feedback operators × 4 edge keys × 2 GP29 signs',
  originalRemainderRunes:7247,sourceOriginalInteriorIOC:
    ioc(words.flatMap(w=>w.source.slice(1,-1))),
  authenticClearP57InteriorIOC:ioc(controls.flatMap(w=>w.slice(1,-1))),
  positive:'95/95 authentic p57 runes re-encoded and inverted, 32/32 models',
  originalRoundTrip:'12956/12956, all modes, endpoints transmitted verbatim',
  result:'all 32 original interior outputs near uniform, no unknown plaintext/key',
  topModes:models.slice(0,4),minIOC:models.at(-1).ioc,
  allSecretAny29PermutationUpperBounds:allSecretBounds
},null,2));
