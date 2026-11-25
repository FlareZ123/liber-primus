'use strict';
// Original p50 32x8 grid: exact Boolean XOR known-tail inversion.
const fs = require('node:fs');
const path = require('node:path');
function study(grid,corpus,lp1){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const mod=x=>(x%29+29)%29;
 const xor=xs=>xs.reduce((a,b)=>a^b,0);
 const pc=x=>{let n=0;for(;x;x&=x-1)n++;return n};
 const primes=[];for(let n=2;primes.length<85;n++){if(primes.every(p=>p*p>n||n%p))primes.push(n)}
 const spell=s=>{const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);return s.replace(/K/g,"C").replace(/V/g,"U").split(/\s+/).filter(Boolean).flatMap(word=>{const a=[];while(word){const token=tokens.find(({t})=>word.startsWith(t));assert(token,"missing GP spelling: "+word);a.push(token.i);word=word.slice(token.t.length)}return a})};
 let k=0;const p56=corpus.pages[56].indices.map((v,i)=>i===56?0:mod(v-(primes[k++]-1)));
 const expected=spell("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
 assert(k===84&&JSON.stringify(expected)===JSON.stringify(p56),"p56 authentic wording");
 const known=p56.concat(corpus.pages[57].indices);
 const inside=Array.from({length:256},(_,i)=>i).filter(i=>(i>>3)!==0&&(i>>3)!==31&&(i&7)!==0&&(i&7)!==7);
 const outside=Array.from({length:256},(_,i)=>i).filter(i=>!inside.includes(i));
 assert(inside.length===180&&outside.length===76&&known.length===180&&corpus.pages[55].indices.length===76,"lengths");
 /** @param {number[]} table */
 function anf(table){const a=table.slice();for(let bit=0;bit<8;bit++)for(let x=0;x<256;x++)if(x&(1<<bit))a[x]^=a[x^(1<<bit)];return a}
 /** @param {number} x @param {number[]} terms */
 function features(x,terms){let v=0n;terms.forEach((m,j)=>{if((m&x)===m)v|=1n<<BigInt(j)});return v}
 /** @param {number[]} xs @param {number[]} ys @param {number} degree */
 function fit(xs,ys,degree){
   const terms=Array.from({length:256},(_,i)=>i).filter(i=>pc(i)<=degree);
   /** @type {Map<number,{v:bigint,y:number}>} */ const rows=new Map();
   let conflicts=0, conflictMask=0;
   const reduce=(v,y)=>{while(v){const j=v.toString(2).length-1;const row=rows.get(j);if(!row)return {v,y,j};v^=row.v;y^=row.y}return {v,y,j:-1}};
   xs.forEach((x,i)=>{const r=reduce(features(x,terms),ys[i]);if(r.j<0){if(r.y){conflicts++;conflictMask|=r.y}}else rows.set(r.j,{v:r.v,y:r.y})});
   const predictions=outside.map(x=>{const r=reduce(features(x,terms),0);return r.j<0?r.y:null});
   return {degree,terms:terms.length,rank:rows.size,nullity:terms.length-rows.size,conflicts,conflictMask,forced:predictions.filter(v=>v!==null).length,predictions};
 }
 const results=[];
 for(const radix of [60,59]){
  const alphabet=radix===60?grid.alphabet:grid.alphabet.replace("f","");
  const bytes=grid.rows.flat().map(t=>{assert(alphabet.includes(t[0])&&alphabet.includes(t[1]),"digit");return alphabet.indexOf(t[0])*radix+alphabet.indexOf(t[1])});
  assert(bytes.length===256&&bytes.every(x=>x>=0&&x<256),"byte");
  const coefficients=anf(bytes),byteXor=xor(bytes);
  assert(coefficients[255]===byteXor,"top monomial");
  for(const encoding of ["index","prime"]){
   const encode=i=>encoding==="index"?i:corpus.prime[i];
   const forbidden=encoding==="index"?0xe0:0x80;
   const residual=inside.map((x,i)=>bytes[x]^encode(known[i]));
   const rows=Array.from({length:9},(_,d)=>fit(inside,residual,d));
   const firstFit=rows.find(r=>!r.conflicts);
   assert(firstFit.degree===6&&firstFit.rank===180&&firstFit.forced===0,"expected geometry and fit");
   const minFullDegree=Math.max(...coefficients.map((v,i)=>(v&forbidden)?pc(i):-1));
   const target=byteXor^xor(known.map(encode));
   // Degree 7 imposes exactly one byte-wide parity equation; degree 8 is free.
   let count=29n**76n;
   if(minFullDegree===7){
    let dp=Array(256).fill(0n);dp[0]=1n;
    for(let i=0;i<76;i++){const next=Array(256).fill(0n);for(let s=0;s<256;s++)for(let v=0;v<29;v++)next[s^encode(v)]+=dp[s];dp=next}
    count=dp[target];
   }
   assert(minFullDegree===8||(radix===59&&encoding==="prime"&&minFullDegree===7&&count>0n),"full degree");
   results.push({radix,encoding,byteXor,highBitDegree:minFullDegree,firstFit:firstFit.degree,forcedAtFirstFit:firstFit.forced,firstFullDegree:minFullDegree,degree7ParityTarget:minFullDegree===7?target:null,valid76Completions:String(count),rows:rows.map(({predictions,...r})=>r)});
  }
 }
 // The independent LP1 warning supplies 76 withheld authentic-language runes.
 const warning=lp1.split("### 1\n")[1].split("### 3\n")[0].trim();
 const plain=spell(warning).slice(0,76);
 assert(plain.length===76,"independent donor length");
 const testKey=x=>0xA5^(x&1?0x39:0)^(x&8?0x71:0)^(x&128?0x8E:0);
 const planted=Array(256);inside.forEach((x,i)=>planted[x]=known[i]^testKey(x));outside.forEach((x,i)=>planted[x]=plain[i]^testKey(x));
 const positive=fit(inside,inside.map((x,i)=>planted[x]^known[i]),1);
 assert(positive.conflicts===0&&positive.forced===76,"positive recovery");
 assert(outside.every((x,i)=>(planted[x]^positive.predictions[i])===plain[i]),"holdout");
 const colWitness=x=>Number((x&7)===0||(x&7)===7),rowWitness=x=>Number((x>>3)===0||(x>>3)===31);
 const degree=f=>Math.max(...anf(Array.from({length:256},(_,x)=>f(x))).map((v,i)=>v?pc(i):-1));
 assert(degree(colWitness)===2&&degree(rowWitness)===4,"witness degrees");
 assert(inside.every(x=>!colWitness(x)&&!rowWitness(x))&&outside.every(x=>colWitness(x)||rowWitness(x)),"geometry");
 return {results,positive:{rank:positive.rank,heldout:76,donor:"LP1 WARNING"},nullWitness:{columnDegree:2,rowDegree:4,covered:76}};
}
const root=path.join(__dirname,'..','resources','liber-primus');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
console.log(JSON.stringify(study(JSON.parse(read('base60-grid.json')),JSON.parse(read('lp2-corpus.json')),read('lp1-plaintext-reference.txt')),null,2));
