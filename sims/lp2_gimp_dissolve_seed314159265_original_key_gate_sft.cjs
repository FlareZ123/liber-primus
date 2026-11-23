'use strict';
/**
 * 2014-period GIMP Dissolve RNG as a source-selected candidate LP2 cipher.
 * Tests intact 12,956 original GP29 runes plus original 32x8 p50 grid bytes.
 * Windows 11, Node22, CommonJS SFT, no network or writes.
 *
 * 2013 source: https://mail.gnome.org/archives/commits-list/2013-May/msg02217.html
 * 2014 GLib: https://fuchsia.googlesource.com/third_party/glib/+/refs/tags/2.43.3/glib/grand.c
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const grid=read('resources/liber-primus/lp2-grid-256.json');
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const controls=corpus.pages.find(p=>p.page===57).indices;
const table=grid.pages.flatMap(p=>p.bytes);
assert.equal(pages.length,55);
assert.equal(pages.flat().length,12956);
assert.equal(controls.length,95);
assert.equal(table.length,256);

/** 32-bit MT19937 matching GLib g_rand_int() with a single seed. */
class MT {
  /** @param {number} seed */
  constructor(seed) {
    this.a=new Uint32Array(624);this.a[0]=seed>>>0;
    for(let i=1;i<624;i++)
      this.a[i]=(Math.imul(1812433253,this.a[i-1]^(this.a[i-1]>>>30))+i)>>>0;
    this.index=624;
  }
  /** @returns {number} */
  next() {
    if(this.index>=624){
      for(let k=0;k<624;k++){
        const v=(this.a[k]&0x80000000)|(this.a[(k+1)%624]&0x7fffffff);
        this.a[k]=(this.a[(k+397)%624]^(v>>>1)^((v&1)?0x9908b0df:0))>>>0;
      }
      this.index=0;
    }
    let x=this.a[this.index++];
    x^=x>>>11;x^=(x<<7)&0x9d2c5680;x^=(x<<15)&0xefc60000;x^=x>>>18;
    return x>>>0;
  }
}
const seed=314159265;
const known=[3721122731,618219707,807213306,3144837749,
  3447982176,3230631767,755972506,1398685501];
const validate=new MT(seed);
assert.deepEqual(known.map(()=>validate.next()),known);
const mod=x=>(x%29+29)%29;
/** @param {number[]} v */
const ioc=v=>{
  const n=Array(29).fill(0);
  for(const x of v)n[x]++;
  return n.reduce((s,x)=>s+x*(x-1),0)/(v.length*(v.length-1));
};
/**
 * Full exact inverse/forward transform. Feedback uses previous ciphertext rune
 * and restarts at each authentic physical-page boundary; RNG global/page.
 * @param {number[][]} chunks
 * @param {'direct'|'feedback'} mode
 * @param {'global'|'page'} clock
 * @param {number} sign
 * @param {boolean} inverse
 */
function transform(chunks,mode,clock,sign,inverse) {
  let rng=new MT(seed);
  return chunks.map(chunk=>{
    if(clock==='page')rng=new MT(seed);
    let prev=0;
    return chunk.map(r=>{
      const k=rng.next()%29;
      if(inverse){
        const p=mod(r-(mode==='feedback'?prev:0)+sign*k);
        prev=r;return p;
      }
      const c=mod(r+(mode==='feedback'?prev:0)-sign*k);
      prev=c;return c;
    });
  });
}
console.log('Original GP ciphertext IoC='+ioc(pages.flat()).toFixed(9));
console.log('Native clear GP p57 IoC='+ioc(controls).toFixed(9));
const sample=[controls.slice(0,39),controls.slice(39)];
for(const mode of ['direct','feedback']){
  for(const clock of ['global','page']){
    for(const sign of [-1,1]){
      const plain=transform(pages,mode,clock,sign,true);
      assert.deepEqual(transform(plain,mode,clock,sign,false),pages);
      const cipher=transform(sample,mode,clock,sign,false);
      assert.deepEqual(transform(cipher,mode,clock,sign,true),sample);
      const s=ioc(plain.flat());
      assert(s>0.033&&s<0.036);
      console.log('GP '+mode+'/'+clock+'/'+sign+
        ' originalIoC='+s.toFixed(9)+' forward=12956/12956 native=95/95 PASS');
    }
  }
}
const source=new MT(seed);
const rowSeeds=Array.from({length:4096},()=>source.next());
assert.equal(rowSeeds[0],known[0]);
/** @param {string} mode */
function bytes(mode){
  if(mode.startsWith('mt-')){
    const r=new MT(seed);
    return Array.from({length:256},()=>{
      const x=r.next();return mode==='mt-low8'?x&255:x%255;
    });
  }
  const out=[];
  for(let y=0;y<32;y++){
    const r=new MT(rowSeeds[y]);
    for(let x=0;x<8;x++){
      const k=r.next();
      out.push(mode==='row-low8'?k&255:mode==='row-high8'?k>>>24:k%255);
    }
  }
  return out;
}
for(const mode of ['mt-low8','mt-range255','row-low8','row-range255','row-high8']){
  const v=bytes(mode);
  const same=v.filter((n,i)=>n===table[i]).length;
  const xor=v.map((n,i)=>n^table[i]);
  const printable=xor.filter(n=>n>=32&&n<=126).length;
  let run=0, longest=0;
  for(const n of xor){run=n>=32&&n<=126?run+1:0;longest=Math.max(run,longest);}
  assert(same<=2&&longest<=6);
  console.log('P50 '+mode+' exact='+same+'/256 XORprintable='+
    printable+'/256 longestASCII='+longest+
    ' XORhead='+Buffer.from(xor.slice(0,12)).toString('hex'));
}

/**
 * Source-frozen constrained alternative: every nonzero ciphertext difference
 * represents one GP29 symbol except F=0; a zero difference represents F.
 * F is an explicit escape. Unlike a free alphabet fit, the natural
 * printed rune order and the historical MT seed fully determine each stream.
 * The page's first rune is a preserved IV, not decoded; 12901 positions.
 * @param {number[][]} chunks
 * @param {'global'|'page'} clock
 * @param {-1|1} sign
 * @param {'int28'|'threshold255'} keyType
 * @param {boolean} inverse
 */
function gp28Chain(chunks,clock,sign,keyType,inverse){
  let rng=new MT(seed);
  return chunks.map(chunk=>{
    if(clock==='page')rng=new MT(seed);
    let last=chunk[0]; // always the original IV in both directions
    const out=[last];
    for(let i=1;i<chunk.length;i++){
      const value=rng.next();
      const key=(keyType==='int28'?value:value%255)%28;
      if(inverse){
        const d=mod(chunk[i]-last);
        out.push(d===0?0:1+((d-1+sign*key)%28+28)%28);
        last=chunk[i];
      }else{
        const plain=chunk[i];
        const d=plain===0?0:1+((plain-1-sign*key)%28+28)%28;
        const c=mod(last+d);
        out.push(c);last=c;
      }
    }
    return out;
  });
}
for(const clock of ['global','page']){
  for(const sign of [-1,1]){
    for(const keyType of ['int28','threshold255']){
      const received=gp28Chain(pages,clock,sign,keyType,true);
      assert.deepEqual(gp28Chain(received,clock,sign,keyType,false),pages);
      const nativeCipher=gp28Chain([[17,...controls]],clock,sign,keyType,false);
      const nativeReceived=gp28Chain(nativeCipher,clock,sign,keyType,true)[0].slice(1);
      assert.deepEqual(nativeReceived,controls);
      const recovered=received.flatMap(p=>p.slice(1));
      const score=ioc(recovered);
      assert.equal(recovered.length,12901);
      assert.equal(recovered.filter(v=>v===0).length,86);
      assert(score>0.034&&score<0.036);
      console.log('GP28 CHAIN '+clock+'/'+sign+'/'+keyType+
        ' IoC='+score.toFixed(9)+
        ' escapedF=86/12901 forward=12956/12956 native=95/95 PASS');
    }
  }
}

console.log('PASS: all 8 full-original GP inverse/forward and 5 GIMP-derived p50 byte receivers');
console.log('No original unknown plaintext, authenticated key or final Cicada endpoint recovered');
