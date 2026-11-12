'use strict';
/** A frozen clockwise phi-ring source-grid inverse. Node 22 / CommonJS. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const read=s=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',s),'utf8'));
const gp=read('resources/liber-primus/lp2-corpus.json');
const b=read('resources/liber-primus/lp2-grid-256.json').bytes;
assert.equal(b.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(b)).digest('hex'),
'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const pages=[55,56,57].map(n=>gp.pages.find(p=>p.page===n).indices);
assert.deepEqual(pages.map(x=>x.length),[76,85,95]);
const C=pages.flat(), mod=x=>(x%29+29)%29;
const primes=[];
for(let v=2;primes.length<100;v++){let isPrime=true;for(let i=2;i*i<=v;i++)if(v%i===0){isPrime=false;break;}if(isPrime)primes.push(v);}
let clock=0;
const known56=pages[1].map((x,i)=>i===56?0:mod(x-(primes[clock++]-1)));
assert.equal(clock,84);
const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function encodeGP(text){const out=[];for(const word of text.split(' '))for(let j=0;j<word.length;){const m=tokens.find(t=>word.startsWith(t.t,j));assert(m);out.push(m.i);j+=m.t.length;}return out;}
assert.deepEqual(known56,encodeGP('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'));
const known=known56.concat(pages[2]);
assert.equal(known.length,180);
assert.deepEqual(known.slice(-52),pages[2].slice(43));
const gcd=(a,b)=>{while(b){const t=a%b;a=b;b=t;}return a;};
const phi=n=>Array.from({length:n},(_,i)=>i+1).filter(i=>gcd(i,n)===1).length;
const rings=[];
for(let depth=0;depth<4;depth++){const r=[],lo=depth,hi=31-depth,l=depth,h=7-depth;
for(let x=l;x<=h;x++)r.push(lo*8+x);
for(let y=lo+1;y<=hi;y++)r.push(y*8+h);
for(let x=h-1;x>=l;x--)r.push(hi*8+x);
for(let y=hi-1;y>lo;y--)r.push(y*8+l);rings.push(r);}
assert.deepEqual(rings.map(r=>r.length),[76,68,60,52]);
const steps=rings.map(r=>phi(r.length));
assert.deepEqual(steps,[36,32,16,24]);
function decode(cipher){const P=[];let off=0;for(let r=0;r<4;r++){const cells=rings[r],L=cells.length;for(let j=0;j<L;j++)P.push(mod(cipher[off+(j+steps[r])%L]-b[cells[j]]));off+=L;}return P;}
function encrypt(plain){const C=Array(256);let off=0;for(let r=0;r<4;r++){const cells=rings[r],L=cells.length;for(let j=0;j<L;j++)C[off+(j+steps[r])%L]=mod(plain[off+j]+b[cells[j]]);off+=L;}return C;}
const decoded=decode(C);
assert.deepEqual(encrypt(decoded),C);
const native=pages[2].slice(0,76).concat(known);
assert.deepEqual(decode(encrypt(native)),native);
const hit=known.map((x,i)=>Number(x===decoded[76+i]));
const count=x=>x.reduce((a,b)=>a+b,0);
const innerMatches=[count(hit.slice(0,68)),count(hit.slice(68,128)),count(hit.slice(128))];
assert.deepEqual(innerMatches,[3,3,3]);
assert.equal(count(hit),9);
assert.equal(hit[0],0);
console.log(JSON.stringify({ringLengths:rings.map(r=>r.length),totientShifts:steps,
sourceSelectedVersusHypothetical:'phi and rings source-visible; clockwise-rotation/subtraction hypothetical',
testedKnown:180,matches:9,ringMatches:innerMatches,
firstKnownPositionFails:true,positivePlantRecovered:256,
originalReencryptionExact:true,p55Candidate:decoded.slice(0,76).map(x=>gp.translit[x]).join(''),
conclusion:'This frozen decoder rejected, no original LP2 plaintext'},null,2));
