'use strict';

/**
 * Source-fixed p50 256-cell literal initial-pad + period256 classical autokey.
 * Original post-table p51-p53 chapter-contiguous 534-GP29 ciphertext only.
 *
 * Base60 (published full table alphabet) and conditional omitted-f base59;
 * both signs; ciphertext vs plaintext feedback after first 256 positions.
 * Frozen phase0 at first p51 rune, one continuous key across p51/p52/p53.
 * No phase search, secret alphabet, address fitting or punctuation resets.
 * Windows 11 Node22 read-only CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname,'..','resources','liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(dir,'lp2-corpus.json'),'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(dir,'lp2-grid-256.json'),'utf8'));
const c = gp.pages.slice(51,54).flatMap(page=>page.indices);
assert.equal(c.length,534);
assert.deepEqual(gp.pages.slice(51,54).map(p=>p.indices.length),[92,263,179]);
assert.equal(grid.pages.flatMap(p=>p.bytes).length,256);
const a59 = grid.alphabet.replace('f','');
const t60 = grid.pages.flatMap(p=>p.bytes);
const t59 = grid.pages.flatMap(p=>p.tokens).map(t=>
  59*a59.indexOf(t[0])+a59.indexOf(t[1]));
assert.equal(t59.length,256);
assert(t59.every(v=>v>=0&&v<=251));

const mod = x => ((x%29)+29)%29;
const ioc = v => {
  const h = new Uint32Array(29);
  for (const x of v)h[x]++;
  return h.reduce((sum,x)=>sum+x*(x-1),0)/(v.length*(v.length-1));
};

/**
 * @param {number[]} ciphertext 29-rune register.
 * @param {number[]} table 256 byte register.
 * @param {"plain"|"cipher"} feedback autokey kind.
 * @param {-1|1} sign literal inverse sign.
 * @returns {number[]} Exact inverse, one continuous manuscript rune clock.
 */
function decode(ciphertext,table,feedback,sign){
  const p=[];
  for(let i=0;i<ciphertext.length;i++){
    const k=i<256?table[i]%29:feedback==='plain'?p[i-256]:ciphertext[i-256];
    p.push(mod(ciphertext[i]+sign*k));
  }
  return p;
}
/** Source-constant forward replay from a proposed full GP29 plaintext. */
function encode(plain,table,feedback,sign){
  const output=[];
  for(let i=0;i<plain.length;i++){
    const k=i<256?table[i]%29:feedback==='plain'?plain[i-256]:output[i-256];
    output.push(mod(plain[i]-sign*k));
  }
  return output;
}

const all=[];
for(const [radix,t] of [['base60',t60],['base59_omit_f',t59]]){
  for(const feedback of ['plain','cipher']){
    for(const sign of [-1,1]){
      const p=decode(c,t,feedback,sign);
      assert.deepEqual(encode(p,t,feedback,sign),c);
      const native=Array.from({length:c.length},
        (_,i)=>gp.pages[57].indices[i%gp.pages[57].indices.length]);
      const posCipher=encode(native,t,feedback,sign);
      assert.deepEqual(decode(posCipher,t,feedback,sign),native);
      all.push({
        radix,feedback,sign,originalRunes:p.length,
        originalIoC:Number(ioc(p).toFixed(9)),
        first256IoC:Number(ioc(p.slice(0,256)).toFixed(9)),
        postSeed278IoC:Number(ioc(p.slice(256)).toFixed(9)),
        originalFirst40:p.slice(0,40).map(x=>gp.translit[x]).join(' '),
        nativePositiveRunes:native.length,
        nativePositiveIoC:Number(ioc(native).toFixed(9)),
        originalForwardReplay:true,positiveForwardReplay:true
      });
    }
  }
}
assert.equal(all.length,8);
assert(all.every(x=>x.originalIoC<.04&&x.postSeed278IoC<.04));
assert(all.every(x=>x.nativePositiveIoC>.06));
console.log(JSON.stringify({
  experiment:'Unmodified source p50 as literal 256-rune pad + classical 256-lag plain/cipher autokey on adjacent p51-p53',
  originalPageLengths:[92,263,179],
  originalUntouchedRunes:c.length,
  candidates:all,
  result:'Zero candidate supplies native-GP prose; all original inverse replays and all native-GP positive plants pass'
},null,2));
