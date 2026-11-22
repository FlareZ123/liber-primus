'use strict';
/**
 * Literal source-red 79-rune pad as a 28-digit no-repeat byte codec.
 * Tests every declared direction, phase, page/global reset, packet alignment
 * and GP-index/prime-value numerical interpretation. Uses an EXACT
 * necessary condition for five base28 digits to encode three bytes:
 * the leading digits cannot begin 27, >=9 (even if later digits unknown).
 * Every original setting has violations, so this model is excluded.
 *
 * Node.js 22 CommonJS, no npm dependencies, manual-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const N=pages.reduce((s,p)=>s+p.indices.length,0);
assert.equal(N,12956);
const key=[15,40,53].flatMap(p=>ink.pages.find(x=>x.page===p).red_spans
  .flatMap(s=>corpus.pages[p].indices.slice(s.start,s.start+s.length)));
assert.equal(key.length,79);
const keys={idx:key,prime:key.map(x=>corpus.prime[x])};
const rank={
  cyclic:pages.map(p=>p.indices.map((v,i)=>i===0||v===p.indices[i-1]
    ?-1:(v-p.indices[i-1]+29)%29-1)),
  sorted:pages.map(p=>p.indices.map((v,i)=>i===0||v===p.indices[i-1]
    ?-1:v-Number(v>p.indices[i-1])))
};
assert.equal(rank.cyclic.flat().filter(x=>x<0).length,141);
const mod28=x=>(x%28+28)%28;

/** @param {number[][]} source @param {number[]} sourceKey
 *  @param {boolean} reverse @param {number} sign @param {string} reset
 *  @param {number} phase
 */
function stream(source,sourceKey,reverse,sign,reset,phase){
  const data=[];let absolute=0;
  for(const p of source){
    for(let i=0;i<p.length;i++){
      const x=p[i],t=reset==='page'?i:absolute;
      const j=(t+phase)%79,k=sourceKey[reverse?78-j:j];
      data.push(x<0?-1:mod28(x+sign*k));
      absolute++;
    }
  }
  return data;
}

/**
 * @param {number[]} data Exact, original-position 28 digits with -1 erasures
 * @param {'page'|'global'} framing
 * @param {number} first
 * @param {'big'|'little'} endian
 * @returns {{invalidLeaders:number,complete:number}}
 */
function capacity(data,framing,first,endian){
  const scopes=[];let begin=0;
  for(const p of pages){
    scopes.push([begin,begin+p.indices.length]);
    begin+=p.indices.length;
  }
  if(framing==='global')scopes.splice(0,scopes.length,[0,N]);
  let invalidLeaders=0,complete=0;
  for(const [a,b] of scopes)for(let i=a+first;i+4<b;i+=5){
    if(data[i]<0||data[i+1]<0||data[i+2]<0||data[i+3]<0||data[i+4]<0)continue;
    const d0=data[i+(endian==='big'?0:4)];
    const d1=data[i+(endian==='big'?1:3)];
    complete++;
    if(d0===27&&d1>=9)invalidLeaders++;
  }
  return {invalidLeaders,complete};
}

/** Deterministic source-key positive: 3 unsigned bytes -> 5 exact base28 digits. */
function plant(){
  let state=0x79281279;
  const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
  const source=[],cipher=[],expected=[];
  for(const p of pages){
    const out=[rnd()%29],digits=Array(p.indices.length).fill(-1);
    for(let start=1;start+4<p.indices.length;start+=5){
      let n=rnd()%16777216;
      for(let k=4;k>=0;k--){digits[start+k]=n%28;n=Math.floor(n/28);}
    }
    for(let i=1;i<p.indices.length;i++){
      const d=digits[i]===-1?rnd()%28:digits[i];
      out.push((out[i-1]+1+mod28(d+key[i%79]))%29);
    }
    source.push(digits);cipher.push(out);
    expected.push(digits);
  }
  const actual=stream(rankFromCipher(cipher),key,false,-1,'page',0);
  const check=capacity(actual,'page',1,'big');
  assert.ok(check.complete>2400);
  assert.equal(check.invalidLeaders,0);
  let position=0,recovered=0,eligible=0;
  for(const p of expected)for(const d of p){
    if(d>=0){recovered+=actual[position]===d;eligible++;}
    position++;
  }
  assert.equal(recovered,eligible);
  return {validBytePackets:check.complete,invalidLeaders:0,
    recoveredDigits:recovered,eligibleDigits:eligible};
}
function rankFromCipher(ps){
  return ps.map(p=>p.map((x,i)=>i===0||x===p[i-1]?-1:(x-p[i-1]+29)%29-1));
}

function main(){
  let scenarios=0,best=null,zeros=0;
  for(const method of ['cyclic','sorted'])
  for(const name of Object.keys(keys))
  for(const sign of [-1,1])
  for(const reverse of [false,true])
  for(const keyReset of ['global','page'])
  for(let phase=0;phase<79;phase++){
    const data=stream(rank[method],keys[name],reverse,sign,keyReset,phase);
    for(const framing of ['global','page'])
    for(let start=0;start<5;start++)
    for(const endian of ['big','little']){
      const v=capacity(data,framing,start,endian);
      scenarios++;
      zeros+=Number(v.invalidLeaders===0);
      if(best===null||v.invalidLeaders<best.invalidLeaders){
        best={method,name,sign,reverse,keyReset,phase,framing,start,endian,...v};
      }
    }
  }
  assert.equal(scenarios,50560);
  assert.ok(best.invalidLeaders>0);
  assert.equal(zeros,0);
  const positive=plant();
  const result={
    source:'original 79 red runes on LP2 pages15,40,53',
    unknownOriginalPlaintextRecovered:false,
    originalRunes:N,sourceKeyRunes:key.length,scenarios,
    model:'fixed 5 base28 digits per 3 bytes, direct red79 shifted predecessor-excluded ranks',
    best,zeroViolationModels:zeros,positive};
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={stream,capacity,plant,main};
