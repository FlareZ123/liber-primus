'use strict';
/*
 * Agent26, original p50 eight 32-byte columns -> AES-256-CTR of
 * source anti-repeat BASE28 rank payload hypothesis.
 * Motivation: 86/12956 original adjacent same runes vs 8 printed sections
 * and eight 32-byte table columns. All 10 original I/l glyph choices
 * and historical 59/60 printable alphabets tested; AES/rank/zero-IV are
 * conjectures, not authenticated Cicada operations.
 */
const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const C=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const G=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json','utf8'));
const ranges=[[0,2],[3,7],[8,15],[16,22],[23,26],[27,32],[33,39],[40,55]];
const src=ranges.map(([a,b])=>C.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
const tokens=G.pages.flatMap(p=>p.tokens);assert.equal(tokens.length,256);
assert.equal(src.reduce((s,a)=>s+a.length,0),12956);
function rankSection(a,rule){
 const d=[],repeat=[],seed=a[0];let p=seed;
 for(let i=1;i<a.length;i++){
  const c=a[i];if(c===p){repeat.push(i);continue;}
  let v=rule==='cycle'? ((c-p+29)%29)-1:c-(c>p?1:0);
  assert(v>=0&&v<28);d.push(v);p=c;
 }
 let pos=0;let q=seed;
 const back=[seed];let k=0;
 for(let i=1;i<a.length;i++){
  if(k<repeat.length&&repeat[k]===i){back.push(q);k++;continue;}
  const v=d[pos++];q=rule==='cycle'? (q+v+1)%29:v+(v>=q?1:0);
  back.push(q);
 }
 assert.deepEqual(back,a);
 assert.equal(pos,d.length);assert.equal(k,repeat.length);
 return {digits:d,repeats:repeat,seed};
}
function pack28(d,order){
 const ds=order==='forward'?d:d.slice().reverse();
 let x=0n;for(const v of ds)x=x*28n+BigInt(v);
 const n=Math.ceil(d.length*Math.log2(28)/8);
 const buf=Buffer.alloc(n);for(let i=n-1;i>=0;i--){buf[i]=Number(x&255n);x>>=8n;}
 assert.equal(x,0n);
 let y=0n;for(const v of buf)y=(y<<8n)+BigInt(v);
 const rev=Array(ds.length);for(let i=rev.length-1;i>=0;i--){rev[i]=Number(y%28n);y/=28n;}
 assert.equal(y,0n);
 assert.deepEqual(rev,ds);
 return buf;
}
function aes(buffer,key){let c=crypto.createDecipheriv('aes-256-ctr',key,Buffer.alloc(16));return Buffer.concat([c.update(buffer),c.final()]);}
function metric(p){
 let print=0,alpha=0,space=0,most=Array(256).fill(0);
 for(const v of p){if(v>=32&&v<=126)print++;if((v>=65&&v<=90)||(v>=97&&v<=122))alpha++;if(v===32)space++;most[v]++;}
 let n=p.length;return {print:print/n,alpha:alpha/n,space:space/n,topByte:Math.max(...most)/n};
}
function keyVariants(col,radix){
 const alphabet=radix===60?G.alphabet:G.alphabet.replace('f','');
 const ts=Array.from({length:32},(_,row)=>tokens[8*row+col]);
 const indexes=ts.flatMap((v,i)=>/[Il]$/.test(v)?[i]:[]);
 const variants=[];
 for(let mask=0;mask<2**indexes.length;mask++){
  const t=ts.slice();
  for(let j=0;j<indexes.length;j++)if(mask&(1<<j)){
   const i=indexes[j];t[i]=t[i].slice(0,-1)+(t[i].endsWith('I')?'l':'I');
  }
  const key=Buffer.from(t.map(s=>{
   const a=alphabet.indexOf(s[0]),b=alphabet.indexOf(s[1]);
   assert(a>=0&&b>=0);const v=a*radix+b;assert(v>=0&&v<=255);
   return v;
  }));
  variants.push({key,mask});
 }
 return variants;
}
const tests=[];
for(let j=0;j<8;j++){
 const a=src[j];let originals=[];
 for(const rank of ['static','cycle']){
  const source=rankSection(a,rank);
  for(const digits of ['forward','reversed']){
   const bytes=pack28(source.digits,digits);
   originals.push({rank,digits,bytes});
   const check=aes(aes(bytes,Buffer.alloc(32)),Buffer.alloc(32));
   assert.deepEqual(check,bytes);
  }
 }
 let best={print:-1},bestAlpha={alpha:-1};let count=0;
 const cases=[];
 for(const radix of [60,59]){
  const keys=keyVariants(j,radix);
  for(const {key,mask} of keys){
   for(const original of originals){
    for(const byteOrder of ['bigEndian','littleEndian']){
     const byteTape=byteOrder==='bigEndian'?original.bytes:Buffer.from(original.bytes).reverse();
     const p=aes(byteTape,key);
     const m=metric(p);
     const entry={col:j,radix,mask,rank:original.rank,digitOrder:original.digits,byteOrder,
       n:byteTape.length,print:m.print,alpha:m.alpha,space:m.space,topByte:m.topByte,
       firstHex:p.subarray(0,24).toString('hex'),firstASCII:p.subarray(0,40).toString('latin1').replace(/[^ -~]/g,'.')};
     if(entry.print>best.print)best=entry;
     if(entry.alpha>bestAlpha.alpha)bestAlpha=entry;
     cases.push(entry);count++;
    }
   }
  }
 }
 assert.equal(count,(2**(Array.from({length:32},(_,i)=>tokens[8*i+j]).filter(s=>/[Il]$/.test(s)).length))*16);
 tests.push({j,n:a.length,repeats:rankSection(a,'static').repeats.length,tested:count,best,bestAlpha,rareAbove60:cases.filter(t=>t.print>=.6).length});
 console.log('SECTION '+j+' nRune='+a.length+' tests='+count+' maxPrintable='+best.print.toFixed(6)+
 ' maxAlpha='+bestAlpha.alpha.toFixed(6)+' countPrintableAbove60%='+cases.filter(t=>t.print>=.6).length+
 ' best='+JSON.stringify(best));
}
console.log('SUMMARY '+JSON.stringify(tests.map(x=>({section:x.j,n:x.n,repeats:x.repeats,tested:x.tested,maxPrintable:x.best.print,maxAlpha:x.bestAlpha.alpha,rareAbove60:x.rareAbove60}))));
console.log('DONE original all-section exact reversible 28-rank/BASE28 -> AES256CTR zeroIV byte readout; no AES/BASE28 selector is authored.');
