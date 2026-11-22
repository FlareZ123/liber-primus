'use strict';
/**
 * Original-input gate for the deterministic legacy GIMP Dissolve GRand field.
 * Historical source: GIMP gimpoperationdissolve.c: a fixed 4096-entry table
 * seeded by 314159265, row y seeded from table[y], x advances GRand.
 * Source use as an LP2 key is conjectural. No postselected pad offset.
 *
 * SFT: node sims/gimp_dissolve_source_pad_gate.cjs
 * Uses Node 22 and the checked-in original corpus/reference only.
 * @module gimp_dissolve_source_pad_gate
 */
const MOD=29, SIDE=27, N=SIDE*SIDE;
const mod=v=>(v%MOD+MOD)%MOD;
/** @param {number} seed */
function mt(seed){
  const a=new Uint32Array(624);
  a[0]=seed>>>0;
  for(let i=1;i<624;i++)
    a[i]=(Math.imul(1812433253,a[i-1]^(a[i-1]>>>30))+i)>>>0;
  let pos=624;
  return function next(){
    if(pos>=624){
      for(let i=0;i<624;i++){
        const y=(a[i]&0x80000000)|(a[(i+1)%624]&0x7fffffff);
        a[i]=a[(i+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0);
      }
      pos=0;
    }
    let y=a[pos++];
    y^=y>>>11; y^=(y<<7)&0x9d2c5680;
    y^=(y<<15)&0xefc60000; y^=y>>>18;
    return y>>>0;
  };
}
/** GLib modern GRand integer range. @param {()=>number} next */
function intRange(next,n){
  const limit=4294967295-(4294967296%n);
  let value;
  do{value=next();}while(value>limit);
  return value%n;
}
function sourcePads(){
  const initial=mt(314159265);
  const seeds=Array.from({length:4096},()=>initial());
  const pads={};
  for(const type of ['raw','byte255','range29']){
    const out=[];
    for(let row=0;row<SIDE;row++){
      const next=mt(seeds[row]);
      for(let col=0;col<SIDE;col++)
        out.push((type==='raw'?next():
          intRange(next,type==='byte255'?255:29))%MOD);
    }
    pads[type]=out;
  }
  return {seeds,pads};
}
/** @param {number[]} cipher @param {number[]} pad */
function decode(cipher,pad,sign,chain){
  return cipher.map((v,i)=>mod((chain?v-(i?cipher[i-1]:0):v)+sign*pad[i]));
}
/** @param {number[]} plain @param {number[]} pad */
function encrypt(plain,pad,sign,chain){
  const result=[];
  for(let i=0;i<plain.length;i++){
    const v=mod(plain[i]-sign*pad[i]);
    result.push(chain?mod(v+(i?result[i-1]:0)):v);
  }
  return result;
}
function ioc(symbols){
  const counts=new Uint32Array(MOD);
  for(const n of symbols)counts[n]++;
  let equal=0;
  for(const n of counts)equal+=n*(n-1);
  return equal/(symbols.length*(symbols.length-1));
}
/** @param {string} reference @param {string[]} alphabet */
function englishGP(reference,alphabet){
  const map=alphabet.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
  const rows=reference.split(/\r?\n/).filter(s=>
    !s.startsWith('#')&&!s.startsWith('[')&&!/^\s*[\d\s]+$/.test(s));
  const text=rows.join(' ').toUpperCase().replaceAll('K','C')
    .replaceAll('Q','C').replaceAll('V','U');
  const out=[];
  for(let i=0;i<text.length;){
    const token=map.find(x=>text.startsWith(x.v,i));
    if(token){out.push(token.i);i+=token.v.length;}else i++;
  }
  return out;
}
function xorshift(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
/** Evaluate all frozen 3 projection ×2 sign ×2 clock family. */
function run(corpus,reference,trials=500){
  const original=corpus.pages.slice(0,3).flatMap(p=>p.indices);
  if(original.length!==N)throw Error('Unexpected LP2 p0-2 source length');
  const {seeds,pads}=sourcePads();
  const checkRaw=mt(seeds[0]),checkByte=mt(seeds[0]);
  const control={seeds:seeds.slice(0,8),
    raw:Array.from({length:8},()=>checkRaw()),
    byte255:Array.from({length:8},()=>intRange(checkByte,255))};
  const expectedSeeds=[3721122731,618219707,807213306,3144837749,
    3447982176,3230631767,755972506,1398685501];
  const expectedRaw=[505524582,4277517655,1702989131,912900261,
    1432505218,4108960502,2270003630,316039421];
  const expectedByte=[87,10,191,6,133,152,5,71];
  if(JSON.stringify(control.seeds)!==JSON.stringify(expectedSeeds)||
     JSON.stringify(control.raw)!==JSON.stringify(expectedRaw)||
     JSON.stringify(control.byte255)!==JSON.stringify(expectedByte))
    throw Error('Historical GLib GRand reference-vector mismatch');
  const modes=[];
  for(const [name,pad] of Object.entries(pads))
  for(const sign of [-1,1])
  for(const chain of [false,true])
    modes.push({name,sign,chain,ioc:ioc(decode(original,pad,sign,chain))});
  modes.sort((a,b)=>b.ioc-a.ioc);
  const best=modes[0];
  const referenceGP=englishGP(reference,corpus.translit).slice(0,N);
  if(referenceGP.length!==N)throw Error('Insufficient independent GP control');
  const fake=encrypt(referenceGP,pads[best.name],best.sign,best.chain);
  const recovered=decode(fake,pads[best.name],best.sign,best.chain);
  if(recovered.some((v,i)=>v!==referenceGP[i]))
    throw Error('Source-native exact forward inverse failed');
  const next=xorshift(0x3411317);
  const shuffled=original.slice(),nulls=[];
  for(let t=0;t<trials;t++){
    for(let i=N-1;i>0;i--){
      const j=next()%(i+1);
      [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    let top=-Infinity;
    for(const pad of Object.values(pads))
    for(const sign of [-1,1])
    for(const chain of [false,true])
      top=Math.max(top,ioc(decode(shuffled,pad,sign,chain)));
    nulls.push(top);
  }
  nulls.sort((a,b)=>a-b);
  const exceed=nulls.filter(x=>x>=best.ioc).length;
  return {source:'LP2 physical pages0..2, 729 GP runes; GIMP Dissolve fixed MT19937 seed314159265',
    sourceControl:control,modelCount:12,modes,originalMaximum:best,
    shuffledMax:{trials,seed:'0x3411317',exceed,p:(exceed+1)/(trials+1),
      median:nulls[Math.floor(trials/2)],max:nulls[trials-1]},
    synthetic:{sourceRuna:N,sourceIoC:ioc(referenceGP),
      exactRecovery:recovered.length,recoveredIoC:ioc(recovered)},
    conclusion:'No original plaintext recovered. All tested source-fixed direct and chain pad projections remain near-uniform; hidden key skips and other clocks are not addressed.'};
}
if(typeof module!=='undefined')module.exports={mt,intRange,sourcePads,decode,encrypt,ioc,englishGP,run};
if(typeof require==='function'&&require.main===module){
  const fs=require('node:fs'),path=require('node:path');
  const root=path.resolve(__dirname,'..');
  const corpus=JSON.parse(fs.readFileSync(path.join(root,
    'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const reference=fs.readFileSync(path.join(root,
    'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
  const result=run(corpus,reference);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
