'use strict';
/**
 * Original signed-2013 DH23 exponent pair as a Möbius action on the
 * source-identified LP2 p3 field, and an exact p36-norm consumer gate.
 * Run: node sims/p36_dh23_mobius_signed_original_pole_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(dir,'lp2-corpus.json'),'utf8'));
const source=fs.readFileSync(path.join(dir,'lp2-transcription.txt'),'utf8').split('%').slice(0,56);
const mod=x=>(x%29+29)%29, neg=a=>a.map(x=>mod(-x));
/** @param {[number,number]} a @param {[number,number]} b @returns {[number,number]} */
function mul(a,b){
  const [x,y]=a,[z,w]=b;
  return [mod(x*z+8*y*w),mod(x*w+y*z+3*y*w)];
}
/** @param {[number,number]} a @param {number} e @returns {[number,number]} */
function power(a,e){
  let r=[1,0];
  while(e>0){if(e%2)r=mul(r,a);a=mul(a,a);e=Math.floor(e/2)}
  return r;
}
const order=a=>{for(let n=1;n<=840;n++)if(power(a,n).join(',')==='1,0')return n;throw Error('order')};
/** @param {[number,number]} a @returns {[number,number]} */
const inverse=a=>power(a,839);
const u=[0,1],z=[23,27],v=[19,26];
assert.deepEqual(power(u,2),[8,3],'p3 red primitive quadratic u²=3u+8');
assert.deepEqual(power(z,15).map(x=>mod(10*x)),v,'prior source-field p36 norm projection');
assert.deepEqual(power(v,2),[27,0],'p36 relative norm v²=-2');
assert.equal(order(v),56);
const p23=(a,e)=>{let r=1;for(let i=0;i<e;i++)r=r*a%23;return r};
const server=[...Array(22)].map((_,i)=>i+1).filter(n=>p23(5,n)===8);
const client=[...Array(22)].map((_,i)=>i+1).filter(n=>p23(5,n)===19);
assert.deepEqual(server,[6]);
assert.deepEqual(client,[15]);
assert.equal(p23(19,server[0]),2);
assert.equal(p23(8,client[0]),2);
// Möbius f(x)=-6x/(x+15) on the original GF(29²) p3 register.
// At x=u it lands EXACTLY on the p36 relative norm v.
const denominator=[15,1],numerator=[0,23];
assert.deepEqual(mul(denominator,v),numerator);
const mapped=mul(numerator,inverse(denominator));
assert.deepEqual(mapped,v);
assert.equal(order(denominator),15);
assert.equal(order(numerator),840);
const trace=a=>mod(2*a[0]+3*a[1]);
const norm=a=>mul(a,[mod(a[0]+3*a[1]),mod(-a[1])])[0];
assert.equal(trace(numerator),11);
assert.equal(norm(numerator),2);
assert.equal(norm(v),2);
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const entire=pages.flatMap(p=>p.indices);
assert.equal(entire.length,12956);
// f has pole x=-15 = GP pair [14,0]; f^-1 has pole y=-6 = [23,0].
// P¹ can handle infinity, but the original 29-rune pair register cannot.
// Count poles under all natural continuous/page-reset phase registrations.
const records=[];
for(const frame of ['book','page'])for(const phase of [0,1]){
  const segments=frame==='book'?[{page:'book',indices:entire}]:pages;
  const counts={forward:0,inverse:0,forwardInsideWords:0,inverseInsideWords:0};
  for(const page of segments){
    const sep=new Set();
    if(frame==='page'){
      let i=0;
      for(const ch of source[page.page]){
        if(/[\u16A0-\u16FF]/u.test(ch))i++;
        if(ch==='-')sep.add(i);
      }
    }
    for(let i=phase;i+1<page.indices.length;i+=2){
      const a=page.indices[i],b=page.indices[i+1];
      for(const [name,scalar] of [['forward',14],['inverse',23]]){
        if(a!==scalar||b!==0)continue;
        counts[name]++;
        if(frame==='page'&&!sep.has(i+1)&&!sep.has(i+2))counts[name+'InsideWords']++;
      }
    }
  }
  assert.ok(counts.forward>0&&counts.inverse>0);
  records.push({frame,phase,...counts});
}
assert.deepEqual(records.map(r=>[r.forward,r.inverse]),
  [[7,7],[3,8],[6,6],[4,9]]);
assert.ok(records.filter(r=>r.frame==='page').every(r=>r.forwardInsideWords>0&&r.inverseInsideWords>0));
console.log(JSON.stringify({
  inputs:'GPG-signed 2013 DH23 worked exchange; LP2 original p3 root and p36 norm; full LP2 runes',
  field:'u²=3u+8 over GF29',
  signedDH23:{serverPrivate:server[0],clientPrivate:client[0],shared:2},
  p36NormBasis:v,
  sourceMobius:'v=-6u/(u+15), exact GF(29²) identity',
  independentOrders:{norm:order(v),denominator:order(denominator),numerator:order(numerator)},
  scalarTraceNorm:[trace(numerator),norm(numerator)],
  originalPoleRegistrations:records,
  decision:'The literal fixed Möbius GP29 pair decoder is undefined inside original printed words under all tested clocks; no plaintext or key.'
},null,2));
