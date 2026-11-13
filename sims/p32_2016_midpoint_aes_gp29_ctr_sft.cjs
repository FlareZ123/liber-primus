'use strict';
/**
 * Exact GP29 AES-CTR direct-cipher inversion selected by the 2016 image
 * midpoint AE/S/X and p32 32/24/16-rune key perimeters.
 * Standalone Windows 11 SFT: node sims/p32_2016_midpoint_aes_gp29_ctr_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const load=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const corpus=JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const p32=corpus.pages.find(p=>p.page===32).indices;
const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const originalPages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices.length);
const chapterLengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
const sum=a=>a.reduce((s,x)=>s+x,0);
assert.equal(C.length,12956);
assert.equal(sum(chapterLengths),C.length);
assert.equal(originalPages.length,55);
assert.equal(p32.length,121);
const at=(row,col)=>p32[row*11+col];
const primeAt=(row,col)=>corpus.prime[at(row,col)];
const x=Array.from({length:11},(_,i)=>primeAt(0,i));
const y=Array.from({length:11},(_,i)=>primeAt(i,0));
assert.deepEqual([sum(x),sum(y)],[563,569]);
const tile=(lengths,coord)=>{
  let edge=0;
  for(let i=0;i<lengths.length;i++){
    if(edge<=coord&&coord<edge+lengths[i])return i;
    edge+=lengths[i];
  }
  throw new Error('bad pixel');
};
const ix=tile(x,281), iy=tile(y,284);
assert.deepEqual([iy,ix],[6,4]);
assert.deepEqual([corpus.translit[at(0,ix)],corpus.translit[at(iy,0)],
  corpus.translit[at(iy,ix)]],['AE','S','X']);
const perimeter=(r)=>{
  const z=10-r,coords=[];
  for(let col=r;col<=z;col++)coords.push([r,col]);
  for(let row=r+1;row<=z;row++)coords.push([row,z]);
  for(let col=z-1;col>=r;col--)coords.push([z,col]);
  for(let row=z-1;row>r;row--)coords.push([row,r]);
  return {
    clockwise:coords,
    counterclockwise:[coords[0],...coords.slice(1).reverse()],
    rowMajor:coords.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),
  };
};
const rings=[1,2,3].map(r=>({r,paths:perimeter(r)}));
assert.deepEqual(rings.map(z=>z.paths.clockwise.length),[32,24,16]);
assert.equal(sum(rings[2].paths.clockwise.map(([r,c])=>primeAt(r,c))),1136);

const letter=new Map(corpus.translit.map((s,i)=>[s,i]));
function englishGp(text){
  const normalized=text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  const out=[];
  for(const word of normalized.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      let n=0,value;
      for(const width of [3,2,1]){
        const token=word.slice(i,i+width);
        if(letter.has(token)){n=width;value=letter.get(token);break;}
      }
      assert.ok(n,'Unmapped character in source native-GP control');
      out.push(value);
      i+=n;
    }
  }
  return out;
}
const shakespeare=englishGp(load('resources/control/shakespeare_first300k.txt'));
const gibran=englishGp(load('resources/control/gibran_prophet_58585.txt'));
assert.ok(gibran.length>=12956);
const native=gibran.slice(500,500+C.length);
const tri=new Uint32Array(29*29*29);
for(let i=2;i<shakespeare.length;i++)
  tri[shakespeare[i-2]*841+shakespeare[i-1]*29+shakespeare[i]]++;
const den=shakespeare.length-2+tri.length*0.2;
const log=Float64Array.from(tri,v=>Math.log((v+0.2)/den));
const tripleScore=a=>{
  let s=0;
  for(let i=2;i<a.length;i++)s+=log[a[i-2]*841+a[i-1]*29+a[i]];
  return s/(a.length-2);
};
const ioc=a=>{
  const f=Array(29).fill(0);
  a.forEach(v=>f[v]++);
  return f.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
};
const mod=v=>(v%29+29)%29;
function aesStream(lengths,key,iv){
  const out=[];
  for(const length of lengths){
    const en=crypto.createCipheriv('aes-'+(key.length*8)+'-ctr',key,iv);
    out.push(en.update(Buffer.alloc(length)));
    out.push(en.final());
  }
  return Buffer.concat(out);
}
const clocks={
  book:[C.length],
  page:originalPages,
  visualChapter:chapterLengths,
};
const sourceIV=Buffer.from(rings[2].paths.clockwise.map(([r,c])=>primeAt(r,c)));
const variants=[];
for(const ring of rings){
  for(const orientation of ['clockwise','counterclockwise','rowMajor']){
    const coords=ring.paths[orientation];
    for(const encoding of ['prime','ordinal']){
      const key=Buffer.from(coords.map(([r,c])=>
        encoding==='prime'?primeAt(r,c):at(r,c)));
      for(const ivKind of ['zero','innerRing']){
        const iv=ivKind==='zero'?Buffer.alloc(16):sourceIV;
        for(const [clock,lengths] of Object.entries(clocks)){
          const keyBytes=aesStream(lengths,key,iv);
          assert.equal(keyBytes.length,C.length);
          for(const sign of [-1,1]){
            const P=C.map((v,i)=>mod(v+sign*(keyBytes[i]%29)));
            variants.push({
              keyBits:key.length*8,
              ring:ring.r,orientation,encoding,ivKind,clock,sign,
              ioc:ioc(P),trigramNats:tripleScore(P),
              preview:P.slice(0,72).map(i=>corpus.translit[i]).join(' '),
            });
          }
        }
      }
    }
  }
}
assert.equal(variants.length,216);
const key=Buffer.from(rings[2].paths.clockwise.map(([r,c])=>primeAt(r,c)));
const iv=sourceIV;
const stream=aesStream(chapterLengths,key,iv);
const syntheticCipher=native.map((v,i)=>mod(v+(stream[i]%29)));
const recovered=syntheticCipher.map((v,i)=>mod(v-(stream[i]%29)));
assert.deepEqual(recovered,native);
const nativeIoc=ioc(native);
const sourceIoc=ioc(C);
const nativeScore=tripleScore(native);
const sourceScore=tripleScore(C);
const byTrigram=variants.slice().sort((a,b)=>b.trigramNats-a.trigramNats);
const byIoc=variants.slice().sort((a,b)=>b.ioc-a.ioc);
const maxIoc=byIoc[0].ioc;
const bestScore=byTrigram[0].trigramNats;
console.log(JSON.stringify({
  hypothesis:'AES-CTR prime-ring keys from signed-2016 p32 midpoint AE/S/X, native-GP29 keystream modulo29',
  source:{originalRunes:C.length,sourcePages:originalPages.length,
    visualChapters:chapterLengths.length,imageMidpoint:[281,284],
    tile:[iy,ix],name:'AE/S/X',keyLengths:rings.map(z=>z.paths.clockwise.length)},
  controls:{GibranNativeIoc:nativeIoc,GibranNativeTrigramNats:nativeScore,
    originalIoc:sourceIoc,originalTrigramNats:sourceScore,
    plantedExactPositions:recovered.length,plantCipherIoc:ioc(syntheticCipher)},
  original:{attempted:variants.length,bestTrigram:byTrigram.slice(0,6),
    topIoc:byIoc.slice(0,6),
    containsEnglishLikeIoc:maxIoc>=nativeIoc*0.8,
    containsEnglishLikeTrigram:bestScore>=nativeScore-1.5},
  decision:'Direct original-input AES-CTR residue stream tested; a random-looking inverse does not identify historical AES or rule out other codecs/modes',
},null,2));
