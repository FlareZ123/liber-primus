'use strict';
/**
 * SFT: solved p57's 55 word interiors as page-specific starting keys
 * for the genuine solved p56 prime/totient plaintext-F-transparent cipher.
 * Test original p0..55 pages without changing a rune or page break.
 * Run: node sims/lp2_p57_55interior_pageprime_fskip_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const chunks=read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeIndex=new Map(source.runes.map((r,i)=>[r,i]));
const pages=source.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
const solved57=source.pages.find(p=>p.page===57);
assert.equal(solved57.indices.length,95);
const words=[];let pending=[];
for(const rune of [...chunks.at(-1)]){
  if(runeIndex.has(rune))pending.push(runeIndex.get(rune));
  else if('-.$&§'.includes(rune)&&pending.length){
    words.push(pending);pending=[];
  }
}
if(pending.length)words.push(pending);
assert.equal(words.length,20);
assert.deepEqual(words.flat(),solved57.indices);
assert.deepEqual(words.map(w=>w.length),
  [7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]);
const interior=words.flatMap(w=>w.slice(1,-1));
assert.equal(interior.length,55,'literal p57 shedding gives one key per unknown rune page');
assert.equal(interior.length,pages.length);
const composite=new Uint8Array(180000),key=[];
for(let p=2;p<composite.length&&key.length<9000;p++){
  if(composite[p])continue;
  key.push((p-1)%29);
  if(p*p<composite.length)
    for(let q=p*p;q<composite.length;q+=p)composite[q]=1;
}
assert.equal(key.length,9000);
const mod=n=>(n%29+29)%29;
function encrypt(plain,start){
  let used=0;
  return plain.map(p=>p===0?0:mod(p+key[start+used++]));
}
function furthest(cipher,start){
  let states=[0];
  for(let i=0;i<cipher.length;i++){
    const c=cipher[i],seen=new Uint8Array(i+2),next=[];
    for(const used of states){
      if(c===0&&!seen[used]){seen[used]=1;next.push(used);}
      if(mod(c-key[start+used])!==0&&!seen[used+1]){
        seen[used+1]=1;next.push(used+1);
      }
    }
    if(!next.length)return i;
    states=next;
  }
  return cipher.length;
}
function gpWord(s){
  s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S')
    .replace(/ING/g,'NG').replace(/IO/g,'IA');
  const tokens=source.translit.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
  const out=[];
  for(let i=0;i<s.length;){
    const match=tokens.find(t=>s.startsWith(t.v,i));
    assert.ok(match,'known solved text must be encodable');
    out.push(match.i);i+=match.v.length;
  }
  return out;
}
const p56Plain=('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE '+
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(p56Plain.length,85);
assert.deepEqual(encrypt(p56Plain,0),source.pages[56].indices);
assert.equal(furthest(source.pages[56].indices,0),85);
const results=[];
for(const interpretation of ['ordinal','prime']){
  const rows=pages.map((page,i)=>{
    const rune=interior[i];
    // GP ordinal is 0..28; GP prime value is 2..109.
    const firstPrimeIndex=interpretation==='ordinal'?rune:source.prime[rune];
    const reached=furthest(page.indices,firstPrimeIndex);
    const planted=Array.from({length:page.indices.length},
      (_,j)=>solved57.indices[j%solved57.indices.length]);
    const nativeCipher=encrypt(planted,firstPrimeIndex);
    assert.equal(furthest(nativeCipher,firstPrimeIndex),page.indices.length);
    assert.deepEqual(encrypt(planted,firstPrimeIndex),nativeCipher);
    return {page:page.page,keyRune:source.translit[rune],
      keyValue:firstPrimeIndex,runes:page.indices.length,furthest:reached};
  });
  const full=rows.filter(r=>r.runes===r.furthest);
  const failures=rows.filter(r=>r.runes!==r.furthest);
  assert.equal(full.length,1);
  assert.equal(failures.length,54);
  assert.deepEqual(full.map(x=>x.page),[interpretation==='ordinal'?43:49]);
  if(interpretation==='ordinal'){
    assert.equal(rows[0].furthest,49);
    assert.equal(rows[1].furthest,66);
    assert.equal(rows[2].furthest,28);
  }else{
    assert.equal(rows[0].furthest,2);
    assert.equal(rows[1].furthest,26);
    assert.equal(rows[2].furthest,22);
  }
  results.push({interpretation,nativeControlPages:55,
    completeOriginalPages:full,failedOriginalPages:failures.length,
    originalPage0FirstImpossibleAt:rows[0].furthest,
    originalSourcePageDecisions:rows});
}
console.log(JSON.stringify({source:'unmodified original LP2 55 pages plus clear p57',
  selector:'one GP rune per page from p57 word interiors; 55/55 exact',
  model:'genuine p56 phi(prime) with plaintext-F nonconsuming and page reset',
  knownP56Control:'85/85 real plaintext recovered',
  nativePositive:'55/55 complete pages under each key interpretation',
  decision:'Both source-key interpretations fail on 54 of 55 original pages; no unknown plaintext',
  results},null,2));
