'use strict';
/**
 * P7 GF29^2 residual + source p8 red products -> h=4+3alpha,
 * original complete p8-black+p9-carry 248-rune direct field-inverse gate.
 * Frozen on Director issue #2309 before observing original decipherment.
 * Node 22 / Windows 11; no dependencies, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'..','resources','liber-primus');
const gp=JSON.parse(fs.readFileSync(path.join(dir,'lp2-corpus.json'),'utf8'));
const spans=fs.readFileSync(path.join(dir,'lp2-transcription.txt'),'utf8').split('%');
const rune=new Map(gp.runes.map((s,i)=>[s,i]));
const mod=x=>(x%29+29)%29;
/** @param {[number,number]} a @param {[number,number]} b @param {number} d @returns {[number,number]} */
function mul(a,b,d=8){
  return [mod(a[0]*b[0]+d*a[1]*b[1]),mod(a[0]*b[1]+a[1]*b[0])];
}
/** @param {[number,number]} a @param {number} n @param {number} d @returns {[number,number]} */
function power(a,n,d=8){
  let z=[1,0],b=a,k=n;
  while(k){if(k%2)z=mul(z,b,d);b=mul(b,b,d);k=Math.floor(k/2);}
  return z;
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const f=Array(29).fill(0);a.forEach(x=>f[x]++);
  return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
const p7Words=[];let word=[];
for(const c of spans[7]){
  if(rune.has(c))word.push(rune.get(c));
  else if((c==='-'||c==='.')&&word.length){p7Words.push(word);word=[];}
}
if(word.length)p7Words.push(word);
const p7Terminal=p7Words.slice(-5).map(w=>w.reduce((a,x)=>mod(a*x),1));
assert.deepEqual(p7Terminal,[11,26,8,15,2]);
const p8=gp.pages[8].indices,p9=gp.pages[9].indices;
assert.equal(p8.length,255);
const products=[p8.slice(0,4),p8.slice(4,12)]
  .map(w=>w.reduce((a,x)=>mod(a*x),1));
assert.deepEqual(products,[4,3]);
assert.equal(p8[11],17);
const P=x=>mod(11+26*x+8*x*x+15*x*x*x+2*x*x*x*x);
for(const x of [3,4])assert.equal(P(x),x);
const h=[4,3],g=[3,4],hInverse=[2,13];
assert.deepEqual(mul(h,hInverse),[1,0]);
assert.equal(mod(h[0]*h[0]-8*h[1]*h[1]),2);
const Hinv=[2,17,13,2];
assert.equal(mod(Hinv[0]*Hinv[3]-Hinv[1]*Hinv[2]),15);
assert.equal(mod(2*15),1);
assert.deepEqual(power(h,3),[0,12]);
assert.deepEqual(power(h,12),[6,0]);
assert.deepEqual(power(h,24),[7,0]);
assert.deepEqual(power(g,15),[0,24]);
assert.deepEqual(power(g,15),power(h,3).map(x=>mod(x*2)));
assert.deepEqual(power(h,168),[1,0]);
assert.deepEqual(power(g,840),[1,0]);
for(let n=1;n<168;n++)assert.notDeepEqual(power(h,n),[1,0]);
for(let n=1;n<840;n++)assert.notDeepEqual(power(g,n),[1,0]);
// Each observed complete identity is unique to the source d=8 under
// a PREDEFINED comparison of all 29 possible quadratic constants.
for(const [base,exp,expected] of [
  [h,3,[0,12]],[h,12,[6,0]],[h,24,[7,0]],[g,15,[0,24]]
]){
  const roots=[];
  for(let d=0;d<29;d++){
    if(power(base,exp,d).every((v,i)=>v===expected[i]))roots.push(d);
  }
  assert.deepEqual(roots,[8]);
}
const receiver=p8.slice(12).concat(p9.slice(0,5));
assert.equal(receiver.length,248);
assert.equal(p8.slice(12).length,243);
const solved=gp.pages[57].indices;
assert.equal(solved.length,95);
assert(ioc(solved)>0.06);
/** @param {number[]} input @param {[number,number]} key @returns {number[]} */
function apply(input,key){
  const out=[];
  for(let i=0;i<input.length;i+=2)out.push(...mul([input[i],input[i+1]],key));
  return out;
}
const outputs=[];
for(const rootSign of [1,-1]){
  const key=[4,mod(3*rootSign)];
  const inverse=[2,mod(13*rootSign)];
  assert.deepEqual(mul(key,inverse),[1,0]);
  for(const direction of ['inverse','forward']){
    const k=direction==='inverse'?inverse:key,rev=direction==='inverse'?key:inverse;
    const output=apply(receiver,k);
    assert.deepEqual(apply(output,rev),receiver);
    const plain=Array.from({length:receiver.length},(_,i)=>solved[i%solved.length]);
    assert.deepEqual(apply(apply(plain,k),rev),plain);
    outputs.push({rootSign,direction,originalRunes:receiver.length,ioc:ioc(output),
      firstGP:output.slice(0,28).map(i=>gp.translit[i]).join(' ')});
  }
}
assert.equal(outputs.length,4);
assert(outputs.every(x=>x.ioc<0.038));
console.log(JSON.stringify({
  p7SourceRedProducts:p7Terminal,p8OriginalRedWordProducts:products,
  sourceField:'alpha^2=8; title h=4+3alpha; inverse h^-1=2+13alpha',
  sourceMatrixInverse:Hinv,norm:2,inverseDeterminant15:true,
  sourceArithmetic:{hCubed:[0,12],h12:[6,0],h24:[7,0],g15:[0,24],
    fourSourceTargetedEqualitiesUniqueQuadraticConstant:8,
    orderH:168,orderReversedG:840},
  originalReceiver:'p8 black243 plus physically continuing p9 first five runes (248)',
  sourceOriginalIoC:ioc(receiver),solvedP57ClearIoC:ioc(solved),
  sourceReplayAndSolvedPositive:'PASS',models:outputs,
  recoveredUnknownPlaintext:false
},null,2));
console.log('PASS: source red field-cubic identities and frozen original 248-rune h inverse gate');
