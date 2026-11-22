'use strict';
/**
 * Collaborator Agent3 original red225+13dot31 source: exact feasibility
 * against the actual p56 solved selective-F GP29 interrupter law.
 * This is a different deterministic key-clock architecture than the
 * previously tested unconditional additive source pads.
 *
 * Key material and chronology are imported unchanged from Agent3's
 * source-audited 256-event implementation. Try ten ordered sources,
 * two known GP29 additive signs, continuous-book and physical-page reset.
 * A true-key native English-GP control must be exactly reachable.
 * This is a finite necessary-condition exclusion; it does not guess
 * language, fit passwords or infer a cryptographic key.
 *
 * Node.js 22/CommonJS. No file writes. @module red256_literal_f_source_gate
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {events,keyTables}=require('./red_256_event_key_inverse.cjs');
const {encode}=require('./grid_keyskip_viterbi.cjs');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const ROOT=path.join(__dirname,'..');
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const lengths=pages.map(p=>p.indices.length);
assert.equal(pages.length,55);
assert.equal(lengths.reduce((a,b)=>a+b,0),12956);
const sorted=events();
assert.equal(sorted.length,256);
const sources=keyTables(sorted);
assert.equal(sources.size,10);
const mod=x=>(x%29+29)%29;
/**
 * Necessary and sufficient existence of a hidden literal-F mask given
 * a fixed periodic keystream. Every plaintext F emits cipher F and draws
 * no key. All other plaintext runes consume one key index.
 *
 * @param {number[]} glyphs original ciphertext
 * @param {number[]} key source pad, repeats modulo key length
 * @param {-1|1} sign
 */
function feasibility(glyphs,key,sign){
  let states=new Set([0]),maxStates=1;
  for(let i=0;i<glyphs.length;i++){
    const next=new Set();
    for(const t of states){
      const p=mod(glyphs[i]+sign*key[t%key.length]);
      if(p!==0)next.add(t+1);
      if(glyphs[i]===0)next.add(t);
    }
    if(!next.size)return {possible:false,firstImpossible:i,priorStates:states.size,
      peakStates:maxStates};
    states=next;maxStates=Math.max(maxStates,states.size);
  }
  return {possible:true,firstImpossible:null,endStates:states.size,
    peakStates:maxStates};
}
/** @param {number[]} plaintext @param {number[]} pad @param {-1|1} sign */
function encodeTransparent(plaintext,pad,sign){
  let k=0;
  return plaintext.map(p=>p===0?0:mod(p-sign*pad[(k++)%pad.length]));
}
const original=pages.flatMap(p=>p.indices);
/** @param {number[]} ciphertext @param {number[]} key @param {-1|1} sign @param {'book'|'page'} scope */
function scan(ciphertext,key,sign,scope){
  if(scope==='book')return {possible:feasibility(ciphertext,key,sign).possible,
    errors:feasibility(ciphertext,key,sign).possible?[]:
      [{page:0,index:feasibility(ciphertext,key,sign).firstImpossible}]};
  const errs=[];let offset=0;
  for(let i=0;i<pages.length;i++){
    const x=feasibility(ciphertext.slice(offset,offset+lengths[i]),key,sign);
    if(!x.possible)errs.push({page:pages[i].page,index:x.firstImpossible});
    offset+=lengths[i];
  }
  return {possible:errs.length===0,errors:errs};
}
function run(){
  const source=fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'),'utf8');
  const sample=encode(source.slice(240000)).slice(0,12956);
  assert.equal(sample.length,12956);
  const cases=[];
  for(const [keyName,key] of sources)
    for(const sign of [-1,1])
      for(const scope of ['book','page']){
        const output=scan(original,key,sign,scope);
        cases.push({key:keyName,sign,scope,...output});
      }
  assert.equal(cases.length,40);
  const survivors=cases.filter(x=>x.possible);
  const literal=sources.get('literal/chronological');
  const run32=sources.get('redRun32/forward');
  assert.ok(literal&&run32);
  const controls=[];
  for(const [label,key,sign,scope] of [
    ['original-256-events',literal,-1,'book'],
    ['original-stencil-run32',run32,1,'page']
  ]){
    let cipher;
    if(scope==='book')cipher=encodeTransparent(sample,key,sign);
    else{
      cipher=[];let offset=0;
      for(const n of lengths){cipher.push(...encodeTransparent(sample.slice(offset,offset+n),key,sign));offset+=n;}
    }
    const check=scan(cipher,key,sign,scope);
    assert.equal(check.possible,true,'Known source-padded English must pass exact gate');
    controls.push({label,sourceRunes:sample.length,sourceF:sample.filter(x=>x===0).length,
      possible:check.possible,scope,sign});
  }
  const summary={
    classification:'conditional original-input pure solved-p56 F-transparency finite exclusion',
    source:'original 225 red runes+31 13-dot glyphs with solitary black exception',
    sourceMaterial:{sourceTables:sources.size,red:225,thirteenDot:31,
      gridBytes:256,stencilLengths:32},
    exactCipher:'plain GP F always emits cipher F without consuming key, all other GP symbols consume one source pad byte',
    original:{runes:12956,models:cases.length,fullyPossible:survivors.length,
      survivors,
      modes:cases.map(x=>({key:x.key,sign:x.sign,scope:x.scope,
        possible:x.possible,
        firstImpossible:x.errors[0]||null,
        impossiblePageCount:x.scope==='page'?x.errors.length:undefined}))},
    controls,
    limitations:'Finite original source key readings only, direct GP29 additive pads with solved-p56 transparent F. Does not exclude custom key derivation, hidden 29-symbol permutation, repaired ciphertext output, word-key clock or nonperiodic source.'
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if(require.main===module)run();
module.exports={run,feasibility,scan,encodeTransparent};
