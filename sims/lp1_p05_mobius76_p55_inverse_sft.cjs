'use strict';
/**
 * Original LP1 p05 literal MOBIUS and 76-rune printed-word tape versus original
 * moth-linked LP2 p55 76 runes. Source-fixed Dirichlet inverses with the
 * two fully specified places for additive key application. Node 22 CommonJS.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const book=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt');
const anchor='272-138-';
assert.ok(lp1.includes(anchor));
assert.equal(lp1.indexOf(anchor),lp1.lastIndexOf(anchor));
const rows=lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0,5)
  .map(line=>line.replace(/\/$/,'').split('-'));
assert.deepEqual(rows.map(row=>row.length),[5,5,5,5,5]);
const cells=rows.flatMap(row=>row.filter(cell=>!/^\d+$/.test(cell)));
assert.equal(cells.length,13);
const names=cells.map(cell=>Array.from(cell).map(c=>book.translit[book.runes.indexOf(c)]).join(''));
assert.deepEqual(names,['SHADOWS','AETHEREAL','BUFFERS','UOID','CARNAL','OBSCURA',
  'FORM','MOBIUS','ANALOG','UOID','MOURNFUL','AETHEREAL','CABAL']);
const source=Array.from(cells.join('')).map(c=>book.runes.indexOf(c));
const cipher=book.pages.find(page=>page.page===55).indices;
const native=book.pages.find(page=>page.page===57).indices.slice(0,76);
assert.equal(source.length,76);
assert.equal(cipher.length,76);
assert.equal(native.length,76);
/** @param {number} x @returns {number} */
const mod=x=>(x%29+29)%29;
/** @param {number[]} a @returns {number[]} */
function zeta(a){
  const r=Array(a.length).fill(0);
  for(let n=1;n<=a.length;n++)for(let d=1;d<=n;d++)if(n%d===0)r[n-1]=mod(r[n-1]+a[d-1]);
  return r;
}
/** @param {number[]} a @returns {number[]} */
function mobius(a){
  const r=a.slice();
  for(let n=1;n<=a.length;n++)for(let d=1;d<n;d++)if(n%d===0)r[n-1]=mod(r[n-1]-r[d-1]);
  return r;
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const count=Array(29).fill(0);
  for(const x of a){assert.ok(x>=0&&x<29);count[x]++;}
  return count.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
}
assert.deepEqual(mobius(zeta(native)),native);
assert.deepEqual(zeta(mobius(native)),native);
const wordLengths=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(wordLengths.reduce((s,x)=>s+x,0),75);
/**
 * @param {number[]} a Ciphertext or planted stream
 * @param {'mobius'|'zeta'} kernel
 * @param {'none'|'pre'|'post'} placement
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decode(a,kernel,placement,key,sign){
  const input=placement==='pre'?a.map((v,i)=>mod(v+sign*key[i])):a;
  const interim=kernel==='mobius'?mobius(input):zeta(input);
  return placement==='post'?interim.map((v,i)=>mod(v+sign*key[i])):interim;
}
/**
 * The exact inverse of decode, used for original-source linguistic plants.
 * @param {number[]} a
 * @param {'mobius'|'zeta'} kernel
 * @param {'none'|'pre'|'post'} placement
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encode(a,kernel,placement,key,sign){
  const plainInput=placement==='post'?a.map((v,i)=>mod(v-sign*key[i])):a;
  const transformed=kernel==='mobius'?zeta(plainInput):mobius(plainInput);
  return placement==='pre'?transformed.map((v,i)=>mod(v-sign*key[i])):transformed;
}
const results=[];
for(const cipherDirection of ['forward','reversed']){
  const orientedCipher=cipherDirection==='forward'?cipher:cipher.slice().reverse();
  const orientedNative=cipherDirection==='forward'?native:native.slice().reverse();
for(const kernel of ['mobius','zeta']){
  for(const placement of ['none','pre','post']){
    for(const direction of ['printed','reversed']){
      for(const sign of [-1,1]){
        if(placement==='none'&&(direction!=='printed'||sign===1))continue;
        const key=direction==='printed'?source:source.slice().reverse();
        const recoveredOriented=decode(orientedCipher,kernel,placement,key,sign);
        const recovered=cipherDirection==='forward'?recoveredOriented:recoveredOriented.slice().reverse();
        assert.deepEqual(encode(recoveredOriented,kernel,placement,key,sign),orientedCipher);
        assert.deepEqual(decode(encode(orientedNative,kernel,placement,key,sign),kernel,placement,key,sign),orientedNative);
        const outputIoC=ioc(recovered);
        assert.ok(outputIoC<=0.040351,'Unexpected original output; assess independently');
        const body=recovered.slice(1);
        const words=[];
        let offset=0;
        for(const len of wordLengths){words.push(body.slice(offset,offset+len).map(v=>book.translit[v]).join(''));offset+=len;}
        results.push({cipherDirection,kernel,placement,direction,sign,ioc:outputIoC,firstSevenWords:words.slice(0,7).join(' ')});
      }
    }
  }
}
}
assert.equal(results.length,36);
results.sort((a,b)=>b.ioc-a.ioc);
assert.equal(results[0].kernel,'mobius');
assert.equal(results[0].placement,'post');
assert.ok(Math.abs(results[0].ioc-0.04035087719298246)<1e-14);
console.log(JSON.stringify({
  source:'Original LP1 p05 MOBIUS word cells => p55 76-rune exact-length link',
  sourceKeyLength:source.length,originalCipherLength:cipher.length,
  nativeSolvedP57First76IoC:ioc(native),rawP55IoC:ioc(cipher),
  tested:results.length,best:results[0],all:results,
  decision:'No original p55 plaintext from frozen full-length Möbius/Zeta source-key operations',
},null,2));
