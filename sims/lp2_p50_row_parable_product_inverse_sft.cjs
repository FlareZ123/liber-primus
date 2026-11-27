'use strict';
const fs = require('node:fs');
const path = require('node:path');
function run(grid, corpus, transcription) {
  const assert=(b,m)=>{if(!b)throw Error(m)};
  const lookup=new Map(corpus.runes.map((x,i)=>[x,i]));
  const heading="ᛈᚪᚱᚪᛒᛚᛖ.";
  const pos=transcription.lastIndexOf(heading);
  assert(pos>=0,"missing p57");
  const clauses=transcription.slice(pos).split(".").map(s=>[...s].filter(ch=>lookup.has(ch)).map(ch=>lookup.get(ch))).filter(a=>a.length);
  assert(clauses.length===4,"p57 clause count");
  assert(JSON.stringify(clauses.flat())===JSON.stringify(corpus.pages.find(p=>p.page===57).indices),"p57 rune reconciliation");
  const sums=clauses.slice(1).map(a=>a.reduce((s,i)=>s+corpus.prime[i],0));
  const control=sums.reduce((p,x)=>p*BigInt(x),1n);
  assert(control===1595277641n,"historical parable product");
  const total=corpus.pages.reduce((s,p)=>s+p.indices.length,0);
  const maxPrime=Math.max(...corpus.prime),bound=total*maxPrime;
  const composite=new Uint8Array(bound+1),primes=[];
  for(let p=2;p<=bound;p++)if(!composite[p]){primes.push(BigInt(p));if(p*p<=bound)for(let j=p*p;j<=bound;j+=p)composite[j]=1}
  /** @param {bigint} n */
  function factor(n){
    assert(n>0n,"positive integer required");
    let residual=n;
    const factors=[];
    for(const p of primes){
      if(p*p>residual)break;
      while(residual%p===0n){factors.push(Number(p));residual/=p;}
    }
    if(residual>1n&&residual<=BigInt(bound)){factors.push(Number(residual));residual=1n;}
    assert(factors.reduce((a,b)=>a*BigInt(b),residual)===n,"factor replay");
    return {factors,residual:String(residual),smooth:residual===1n,minimumRunes:residual===1n?Math.ceil(factors.reduce((a,b)=>a+b,0)/maxPrime):null};
  }
  /** @param {number[]} digits @param {number} radix */
  const pack=(digits,radix)=>digits.reduce((a,b)=>a*BigInt(radix)+BigInt(b),0n);
  /** @param {bigint} n @param {number} radix @param {number} width */
  function unpack(n,radix,width){
    const d=Array(width).fill(0),b=BigInt(radix);
    for(let i=width-1;i>=0;i--){d[i]=Number(n%b);n/=b;}
    assert(n===0n,"overflow");
    return d;
  }
  const controlFactors=factor(control);
  assert(JSON.stringify(controlFactors.factors)===JSON.stringify([...sums].sort((a,b)=>a-b)),"control factors");
  const tokens=grid.pages.flatMap(p=>p.tokens);
  assert(tokens.length===256,"grid shape");
  const rows=Array.from({length:32},(_,i)=>tokens.slice(i*8,i*8+8));
  const variants=[];
  for(const alphabet of [grid.alphabet,grid.alphabet.replace("f","")]){
    for(const representation of ["bytes","digits"]){
      const radix=representation==="bytes"?256:alphabet.length,width=representation==="bytes"?8:16;
      assert(pack(unpack(control,radix,width),radix)===control,"control serialization");
      const results=rows.map((row,i)=>{
        const d=row.flatMap(s=>[...s].map(c=>alphabet.indexOf(c)));
        assert(d.every(x=>x>=0),"unknown digit");
        const digits=representation==="digits"?d:row.map((_,j)=>d[2*j]*alphabet.length+d[2*j+1]);
        assert(digits.every(x=>x<radix),"digit overflow");
        const n=pack(digits,radix);
        assert(JSON.stringify(unpack(n,radix,width))===JSON.stringify(digits),"row replay");
        return {row:i+1,integer:String(n),...factor(n)};
      });
      variants.push({alphabetSize:alphabet.length,representation,smoothRows:results.filter(x=>x.smooth).map(x=>x.row),possibleRows:results.filter(x=>x.smooth&&x.minimumRunes<=total).map(x=>x.row),rows:results});
    }
  }
  return {control:{sums,product:String(control),...controlFactors},total,maxPrime,bound,variants};
}
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-grid-256.json')),JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/transcriptions/lp2-image-corrected.txt')),null,2));
