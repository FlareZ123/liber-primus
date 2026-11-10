'use strict';
/**
 * CommonJS SFT: historical 2014 signed-clue 14-column permutation combined
 * with the independently archived 2013 Twitter byte pad. This tests the two
 * authentic historical operations, not a freely fitted symbol permutation.
 *
 * 2014 fixed key from
 * github.com/lastpacketbender/991948530947554/blob/main/2014/004-first-three-pages/columnar.py
 * The original 2014 message is decoded by out[i]=input[KEY[i]].
 *
 * Run: node sims/cicada2014_column14_twitter_joint_inverse.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=require('./cicada2013_twitter_original_pad_inverse.cjs');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const twitter=base.twitterBytes(fs.readFileSync(path.join(root,'resources/cicada2013-twitter-hex-stream.txt'),'utf8'));
const shakespeare=base.nativeGP(fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8'));
const probs=base.logF(shakespeare.subarray(0,120000));
const pages=corpus.pages.filter(p=>p.status==='unsolved'&&p.indices.length);
const canonical=Uint8Array.from(pages.flatMap(p=>p.indices));
const KEY=[2,8,9,1,12,13,11,4,5,7,3,0,6,10];
assert.equal(canonical.length,12956);
/**
 * @param {Uint8Array} input
 * @param {'historical-decode'|'historical-encode'} direction
 * @returns {Uint8Array}
 */
function blockPermutation(input,direction){
  const result=input.slice();
  for(let start=0;start+14<=input.length;start+=14)
    for(let i=0;i<14;i++){
      if(direction==='historical-decode')result[start+i]=input[start+KEY[i]];
      else result[start+KEY[i]]=input[start+i];
    }
  return result;
}
/**
 * @param {Uint8Array} input
 * @param {'page'|'continuous'} scope
 * @param {'historical-decode'|'historical-encode'} direction
 */
function transform(input,scope,direction){
  if(scope==='continuous')return blockPermutation(input,direction);
  let position=0;
  const parts=[];
  for(const p of pages){
    const block=input.subarray(position,position+p.indices.length);
    parts.push(blockPermutation(block,direction));
    position+=block.length;
  }
  assert.equal(position,input.length);
  return Uint8Array.from(parts.flatMap(part=>Array.from(part)));
}
/** @param {'historical-decode'|'historical-encode'} direction */
const reverseDirection=direction=>direction==='historical-decode'?
  'historical-encode':'historical-decode';
/**
 * Evaluate all four period-14 source-fixed transpositions, each with
 * the same exhaustive historical-byte original-language fit.
 * @param {Uint8Array} input
 */
function fitAll(input){
  let selected=null;
  const models=[];
  for(const scope of ['continuous','page'])
    for(const direction of ['historical-decode','historical-encode']){
      const transposed=transform(input,scope,direction);
      const fit=base.fit(transposed,twitter,probs);
      const restored=transform(
        base.encode(fit.plaintext,base.keyStream(twitter,fit.selected.mode),
          fit.selected.offset,fit.selected.sign),
        scope,reverseDirection(direction));
      assert.deepEqual(restored,input);
      const item={
        scope,direction,key:fit.selected,trainingLogLikelihood:fit.train,
        heldoutLogLikelihood:fit.heldout,decodedIoC:fit.ioc,
        candidateFirst50GP:fit.first50,exactReencryption:true
      };
      models.push(item);
      if(selected===null || item.trainingLogLikelihood>selected.trainingLogLikelihood)
        selected=item;
    }
  return {selected,models};
}
function main(){
  const original=fitAll(canonical);
  const hidden={
    scope:'page',direction:'historical-decode',
    key:{mode:'scaled29',sign:-1,offset:9901}
  };
  const native=shakespeare.subarray(120000,120000+canonical.length);
  const mixed=base.encode(native,
    base.keyStream(twitter,hidden.key.mode),hidden.key.offset,hidden.key.sign);
  const cipherPlant=transform(mixed,hidden.scope,reverseDirection(hidden.direction));
  const positive=fitAll(cipherPlant);
  assert.equal(positive.selected.scope,hidden.scope);
  assert.equal(positive.selected.direction,hidden.direction);
  assert.deepEqual(positive.selected.key,hidden.key);
  const decrypted=base.decode(transform(cipherPlant,hidden.scope,hidden.direction),
    base.keyStream(twitter,hidden.key.mode),hidden.key.offset,hidden.key.sign);
  assert.deepEqual(decrypted,native);
  const report={
    classification:'Finite two-historical-clue original negative; no authentic LP2 plaintext',
    sourcePermutation:KEY, originalRuneCount:canonical.length,
    candidateKeys:original.models.length*4*(twitter.length-canonical.length+1),
    original,
    nativeGPPositive:{sourceRunesRecovered:canonical.length,
      trueModelRecovered:hidden,
      firstTrainingLogLikelihood:positive.selected.trainingLogLikelihood,
      firstHeldoutLogLikelihood:positive.selected.heldoutLogLikelihood,
      exactRecovery:true},
    scope:'Two source-locked 14-column directions, page/continuous blocks, 2013 tweet byte modulo29 or scaled29, two signs, all contiguous source-key phases. No reset/shift variations, unknown alphabet or other cipher layers.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={blockPermutation,transform,reverseDirection,fitAll,main};
