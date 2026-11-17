'use strict';
/**
 * Historical 2014 Stage10 two 5x5-square center crosses -> original LP2 p15
 * nine-rune caption and untouched p15-p22 cipher. Complete original F-bypass
 * inverse: no tuned offsets, no modified ciphertext, no fitted key material.
 * Standalone Windows 11 Node22:
 * node sims/lp2_stage10_magic5_cross9_ftransparent_original_sft.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p));
const original=read('resources/cicada2014-openpuff-magic-squares.txt');
assert.equal(createHash('sha256').update(original).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const squares=original.toString('utf8').trim().split(/\r?\n\s*\r?\n/u)
  .map(b=>b.trim().split(/\r?\n/u)
    .map(row=>row.trim().split(/\s+/u).map(Number)))
  .filter(x=>x.length===5&&x.every(r=>r.length===5));
assert.equal(squares.length,2);
assert.deepEqual(squares.map(m=>m[0].reduce((a,b)=>a+b,0)),[3301,1033]);
assert.deepEqual(squares.map(m=>m[2][2]),[809,91]);
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod=n=>((n%29)+29)%29;
const title=corpus.pages[15].indices.slice(0,9);
assert.deepEqual(title,[0,1,20,19,24,28,26,22,24]);
const sum=runes=>runes.reduce((n,i)=>n+corpus.prime[i],0);
assert.deepEqual([sum(title.slice(0,4)),sum(title.slice(4))],[149,489]);
const chapter=corpus.pages.slice(15,23).flatMap(p=>p.indices);
const body=chapter.slice(9),clear=corpus.pages[57].indices;
assert.deepEqual([chapter.length,body.length,clear.length],[1903,1894,95]);

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @returns {number}
 */
function furthest(cipher,key,sign){
  let states=new Set([0]);
  for(let i=0;i<cipher.length;i++){
    const next=new Set(),c=cipher[i];
    for(const consumed of states){
      if(c===0)next.add(consumed);
      if(mod(c+sign*key[consumed%key.length])!==0)
        next.add(consumed+1);
    }
    if(next.size===0)return i;
    states=next;
  }
  return cipher.length;
}

/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function encrypt(plain,key,sign){
  let consumed=0;
  return plain.map(p=>p===0?0:mod(p-sign*key[(consumed++)%key.length]));
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @returns {string[]}
 */
function titlePaths(cipher,key,sign){
  let states=[{used:0,plain:[]}];
  for(const c of cipher){
    const next=[];
    for(const s of states){
      if(c===0)next.push({used:s.used,plain:[...s.plain,0]});
      const p=mod(c+sign*key[s.used%key.length]);
      if(p!==0)next.push({used:s.used+1,plain:[...s.plain,p]});
    }
    states=next;
  }
  return states.map(s=>s.plain.map(i=>corpus.translit[i]).join(''));
}
const expected={
  3301:{horizontalFirst:{minus:[198,189],plus:[173,71]},
    verticalFirst:{minus:[63,54],plus:[76,44]}},
  1033:{horizontalFirst:{minus:[81,25],plus:[142,133]},
    verticalFirst:{minus:[39,30],plus:[171,162]}}
};
const tests=[];
for(const square of squares){
  const sumRow=square[0].reduce((a,b)=>a+b,0);
  assert.ok(square.every(row=>row.reduce((a,b)=>a+b,0)===sumRow));
  const h=square[2],v=square.map(row=>row[2]);
  assert.ok(h.every((x,i)=>x===h[4-i]));
  const arms={
    horizontalFirst:[...h,...v.filter((_,i)=>i!==2)],
    verticalFirst:[...v,...h.filter((_,i)=>i!==2)]
  };
  for(const [order,sourceKey] of Object.entries(arms)){
    const key=sourceKey.map(mod);
    assert.equal(key.length,9);
    for(const sign of [-1,1]){
      const mode=sign<0?'minus':'plus';
      const reached=[furthest(chapter,key,sign),furthest(body,key,sign)];
      assert.deepEqual(reached,expected[sumRow][order][mode]);
      assert.equal(furthest(title,key,sign),9);
      const titleDecodes=titlePaths(title,key,sign);
      assert.equal(titleDecodes.length,2);
      const planted=encrypt(clear,key,sign);
      assert.equal(furthest(planted,key,sign),95);
      let used=0;
      for(let i=0;i<clear.length;i++)
        assert.equal(planted[i],clear[i]===0?0:
          mod(clear[i]-sign*key[(used++)%key.length]));
      tests.push({magicSum:sumRow,order,inverseSign:sign,
        key,originalCaption:titleDecodes,
        originalFullChapter:{reached:reached[0],of:1903},
        originalBodyFreshClock:{reached:reached[1],of:1894},
        plantedNativeClear:'95/95'});
    }
  }
}
assert.equal(tests.length,8);
console.log(JSON.stringify({
  source:'original Stage10 OpenPuff two five-by-five magic squares',
  originalCaptionPrimeSums:[149,489],captionSize:9,
  operation:'natural nine-cell center cross mod29, period9, authentic F bypass',
  tests,decision:'All eight original-cipher inverse paths exhaust before 199 of 1903 original p15-p22 runes; no real unknown plaintext or key.'},null,2));
