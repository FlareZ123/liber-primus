#!/usr/bin/env node
'use strict';
/**
 * LP2 no-repeat radix-repacking inverse: an explicitly reversible alternative
 * to a keystream explanation of the unusual lag-1 equality deficit.
 *
 * If an author base-converted native 29-ary GP text to 28-ary digits, the
 * 28 digits can be carried without immediate rune repetition by indexing
 * the 28-symbol alphabet excluding the previous output rune. A repeated
 * ciphertext rune is outside this ordinary channel: the bounded test
 * treats it as a frame separator and starts a fresh no-repeat segment.
 *
 * We charge both natural rank conventions, left-to-right / reversed tape,
 * and first-symbol-as-prefix vs externally supplied initial state.
 * This is a family TEST, not a claimed author-selected operation.
 * Node 22; no npm dependencies. Run from any directory.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const {plaintext:known}=require('./authentic_lp1_p03_p04_vigenere_recovery.cjs');
const unknown=corpus.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(unknown.length,55);
assert.equal(unknown.reduce((a,p)=>a+p.indices.length,0),12956);
const mod29=n=>(n%29+29)%29;

function toInteger(digits,base) {
  let value=0n, b=BigInt(base);
  for(const digit of digits) {assert(digit>=0&&digit<base);
    value=value*b+BigInt(digit);}
  return value;
}
function toDigits(value,base) {
  assert(value>=0n);
  const out=[],b=BigInt(base);
  while(value>0n){out.push(Number(value%b));value/=b;}
  return out.length?out.reverse():[0];
}
function rank(last,current,mode) {
  assert(current!==last);
  if(mode==='ordered') return current<last?current:current-1;
  if(mode==='cyclic') return mod29(current-last-1);
  throw Error('rank mode');
}
function emit(last,r,mode) {
  assert(r>=0&&r<28);
  return mode==='ordered'?(r<last?r:r+1):mod29(last+r+1);
}
function noRepeatBlocks(cipher,reverse) {
  const out=[];
  for(const p of cipher) {
    const a=reverse?p.indices.slice().reverse():p.indices;
    let start=0;
    for(let i=1;i<a.length;i++){
      if(a[i]===a[i-1]){
        out.push({page:p.page,sourceStart:start,bytes:a.slice(start,i)});
        start=i;
      }
    }
    out.push({page:p.page,sourceStart:start,bytes:a.slice(start)});
  }
  return out;
}
function decode(block,mode,includeInitial) {
  const c=block.bytes;
  if(!c.length) return [];
  const digits=[];
  if(includeInitial)digits.push(c[0]);
  for(let i=1;i<c.length;i++) digits.push(rank(c[i-1],c[i],mode));
  // Mixed radix 29*28^k when initial rune is data; else pure 28^k.
  // Since the first digit is <29, treating the entire mixed-radix integer
  // as a base29 numeral is equivalent to this recurrence.
  let n=includeInitial?BigInt(digits[0]):0n;
  for(let i=includeInitial?1:0;i<digits.length;i++)
    n=28n*n+BigInt(digits[i]);
  return toDigits(n,29);
}
function encodePlain(plain,start,mode){
  assert(plain.length&&plain[0]!==0,'known control starts with a nonzero GP digit');
  const v=toInteger(plain,29);
  let k=1,cap=28n;
  while(cap<=v){cap*=28n;k++;}
  const digits=new Array(k).fill(0);
  let n=v;
  for(let i=k-1;i>=0;i--){digits[i]=Number(n%28n);n/=28n;}
  assert.equal(n,0n);
  const out=[start];let last=start;
  for(const digit of digits){
    const current=emit(last,digit,mode);
    assert(current!==last);out.push(current);last=current;
  }
  return out;
}
function ioc(a){
  const counts=new Array(29).fill(0);
  for(const x of a)counts[x]++;
  return a.length>1?counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1)):0;
}
function hist(a){
  const h=Array(29).fill(0);for(const x of a)h[x]++;
  return {runes:a.length,ioc:ioc(a),
    top5:h.map((count,index)=>({gp:corpus.translit[index],count}))
      .sort((x,y)=>y.count-x.count).slice(0,5)};
}
function scan(mode,reverse,includeInitial){
  const blocks=noRepeatBlocks(unknown,reverse);
  const text=blocks.flatMap(b=>decode(b,mode,includeInitial));
  const page0=blocks.filter(b=>b.page===0)
    .flatMap(b=>decode(b,mode,includeInitial));
  return {mode,reverse,includeInitial,blocks:blocks.length,
    ...hist(text),page0IoC:ioc(page0),
    previewGp:page0.slice(0,90).map(x=>corpus.translit[x]).join('')};
}
function run(){
  assert.equal(known.length,515);
  const controls=[];
  for(const mode of ['ordered','cyclic']){
    for(const start of [0,7,28]){
      const coded=encodePlain(known,start,mode);
      assert(coded.every((x,i)=>i===0||x!==coded[i-1]));
      const recovered=decode({bytes:coded},mode,false);
      assert.deepEqual(recovered,known);
      controls.push({mode,seed:start,source:known.length,cipher:coded.length,
        exact:true,nativeIoC:ioc(known)});
    }
  }
  const scored=[];
  for(const mode of ['ordered','cyclic'])
    for(const reverse of [false,true])
      for(const includeInitial of [false,true])
        scored.push(scan(mode,reverse,includeInitial));
  const observed=unknown.flatMap(p=>p.indices);
  return {schema:'lp2-no-repeat-base28-repack-v1',source:'canonical GP29 LP2 pages0..55',
    original:hist(observed),nativeLP1Control:hist(known),
    nativePlantedControls:controls,
    interpretation:'First rune seeds a no-repeat index or begins a mixed-radix integer; each ciphertext equality is a mandatory new frame. No unknown plaintext; rank/base conversion only.',
    results:scored,
    verdict:'All eight frozen direct rank/base28 inverses retain uniform GP29 source frequencies, far from the exact native GP29 control. The bare no-repeat radix-repacking inverse is not an LP2 plaintext decoder.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={rank,emit,encodePlain,decode,noRepeatBlocks,run};
