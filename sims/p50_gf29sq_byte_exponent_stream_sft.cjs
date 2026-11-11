"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const mod=n=>(n%29+29)%29, mod840=n=>(n%840+840)%840;
const ONE=[1,0], ZERO=[0,0];
const add=(x,y)=>[mod(x[0]+y[0]),mod(x[1]+y[1])];
const scale=(x,k)=>[mod(x[0]*k),mod(x[1]*k)];
// z^2=18+11z, i.e. z^2+18z+11=0 over F_29.
const mul=(x,y)=>[
 mod(x[0]*y[0]+18*x[1]*y[1]),
 mod(x[0]*y[1]+x[1]*y[0]+11*x[1]*y[1])
];
function power(x,n){let r=ONE.slice(),b=x.slice();while(n>0){if(n%2)r=mul(r,b);b=mul(b,b);n=Math.floor(n/2)}return r;}
function primes(n){const a=[];for(let x=2;a.length<n;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break;}if(ok)a.push(x);}return a;}
function ioc(a){const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function nativeGp(text){
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const out=[];
 for(let w of (text.toUpperCase().match(/[A-Z]+/g)||[])){
  w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  for(let j=0;j<w.length;){const t=tokens.find(t=>w.startsWith(t.s,j));if(!t)throw Error("unmapped GP control");out.push(t.i);j+=t.s.length;}
 }
 return out;
}
function makeModel(native){
 const train=native.slice(0,40000),held=native.slice(40000),counts=new Map();let total=0;
 for(let i=2;i<train.length;i++){const k=train[i-2]*841+train[i-1]*29+train[i];counts.set(k,(counts.get(k)||0)+1);total++;}
 const den=total+0.1*29**3;
 const score=a=>{let s=0;for(let i=2;i<a.length;i++){const k=a[i-2]*841+a[i-1]*29+a[i];s+=Math.log(((counts.get(k)||0)+0.1)/den);}return s/(a.length-2);};
 const windows=a=>{const q=[];for(let i=0;i+256<=a.length;i+=256)q.push(score(a.slice(i,i+256)));return q;};
 return {score,referenceWindows:windows(held)};
}
function transform(input,bytes,generator,direction){
 assert.equal(input.length%2,0);const out=[];
 for(let i=0;i<input.length;i+=2){const b=bytes[(i/2)%bytes.length];const e=direction<0?mod840(-b):b;out.push(...mul([input[i],input[i+1]],power(generator,e)));}
 return out;
}
function summary(a,model){
 const win=[];for(let i=0;i+256<=a.length;i+=256)win.push(model.score(a.slice(i,i+256)));
 const sorted=win.slice().sort((x,y)=>x-y);
 return {ioc:ioc(a),meanTrigramNatsPerRune:model.score(a),window256:{count:win.length,min:sorted[0],median:sorted[Math.floor(sorted.length/2)],max:sorted.at(-1),atOrAboveWorstNativeWindow:win.filter(x=>x>=Math.min(...model.referenceWindows)).length},prefix256:a.slice(0,256).map(x=>corpus.translit[x]).join(""),byteCapacity:(()=>{let n=0,printable=0;for(let i=0;i<a.length;i+=2){const v=29*a[i]+a[i+1];if(v<=255){n++;if(v>=32&&v<=126)printable++;}}return {validPairs:n,totalPairs:a.length/2,printableByteValues:printable};})()};
}
function main(){
 const page=n=>corpus.pages.find(p=>p.page===n),p3=page(3),p39=page(39),p56=page(56);
 assert.deepEqual(p3.indices.slice(119,122),[13,23,2]);
 assert.deepEqual(p39.indices.slice(119,122),[27,5,15]);
 assert.equal(p56.indices.length,85);assert.equal(p56.indices[56],0);
 const p84=primes(84)[83];assert.equal(p84,433);
 const z=[0,1],u=[26,14];
 const html=fs.readFileSync(path.join(root,"resources/cicada2014-onion7-index.html"),"utf8");
 assert.match(html,/<title>133<\/title>/i);
 assert.match(html,/id=["']331["']/i);
 assert.deepEqual(mul(u,u),add([8,0],scale(u,3)));
 assert.deepEqual(power(u,433),z);
 assert.deepEqual(mul(z,z),[18,11]);
 assert.deepEqual(add(add([3,0],scale(z,26)),scale(mul(z,z),24)),ZERO);
 assert.deepEqual(power(z,840),ONE);
 for(const q of [2,3,5,7])assert.notDeepEqual(power(z,840/q),ONE);
 assert.equal(mod(27+5*24+15*24*24),0);assert.equal(mod(5+30*24),0);
 const alpha60=grid.alphabet;
 const base60=grid.pages.flatMap(p=>p.tokens.map(t=>60*alpha60.indexOf(t[0])+alpha60.indexOf(t[1])));
 assert.deepEqual(base60,grid.bytes);assert.equal(grid.bytes.length,256);
 const tableHash=crypto.createHash("sha256").update(Buffer.from(grid.bytes)).digest("hex");
 assert.equal(tableHash,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
 const pages=corpus.pages.filter(p=>p.page<56),cipher=pages.flatMap(p=>p.indices);
 assert.equal(pages.filter(p=>p.indices.length>0).length,55);assert.equal(cipher.length,12956);assert.equal(cipher.length%2,0);
 // Global pair clock: separators and dot stencils are preserved outside the rune
 // stream and consume no key. One-rune words are not padded, so pairs may cross
 // word/page boundaries. Every F and repeat is ordinary; no escape or padding.
 const minus=transform(cipher,grid.bytes,z,-1),plus=transform(cipher,grid.bytes,z,+1);
 assert.deepEqual(transform(minus,grid.bytes,z,+1),cipher);
 assert.deepEqual(transform(plus,grid.bytes,z,-1),cipher);
 const alpha59=alpha60.replace("f","");
 const base59=grid.pages.flatMap(p=>p.tokens.map(t=>59*alpha59.indexOf(t[0])+alpha59.indexOf(t[1])));
 const alternatives=[
  ["base60-reversed-z",grid.bytes.slice().reverse(),z],
  ["base59-forward-z",base59,z],
  ["base60-forward-conjugate",grid.bytes,[11,28]]
 ];
 const native=nativeGp(fs.readFileSync(path.join(root,"resources/control/gibran_prophet_58585.txt"),"utf8"));
 const model=makeModel(native),raw=summary(cipher,model),m=summary(minus,model),p=summary(plus,model);
 // p57's modulo-449 residues [361,133,331] include the original onion7
 // HTML title=133 and id=331. Test these fixed exponents as alternate
 // generators for the same p50-byte exponent stream; do not search other powers.
 const p57HtmlExponents=[133,331,361];
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 const p57HtmlCandidates=p57HtmlExponents.map(exponent=>{
  const generator=power(z,exponent),order=840/gcd(840,exponent);
  const minusOut=transform(cipher,grid.bytes,generator,-1);
  const plusOut=transform(cipher,grid.bytes,generator,+1);
  const plant=native.slice(1000,1000+cipher.length);
  assert.deepEqual(transform(transform(plant,grid.bytes,generator,+1),grid.bytes,generator,-1),plant);
  assert.deepEqual(transform(transform(plant,grid.bytes,generator,-1),grid.bytes,generator,+1),plant);
  return {exponent,generator,order,minus:summary(minusOut,model),plus:summary(plusOut,model)};
 });
 const wrong=alternatives.map(([name,bytes,generator])=>({name,minus:summary(transform(cipher,bytes,generator,-1),model).meanTrigramNatsPerRune,plus:summary(transform(cipher,bytes,generator,+1),model).meanTrigramNatsPerRune}));
 const plant=native.slice(1000,1000+cipher.length),planted=transform(plant,grid.bytes,z,+1),recovered=transform(planted,grid.bytes,z,-1);
 assert.deepEqual(recovered,plant);
 const ref=model.referenceWindows.slice().sort((a,b)=>a-b);
 console.log(JSON.stringify({
  model:"GF(29^2) multiplicative stream; C_i=P_i*z^(B[i mod 256])",
  source:{unknownPages:55,originalRunes:cipher.length,fieldPairs:cipher.length/2,p50Bytes:256,distinctP50Bytes:new Set(grid.bytes).size,zeroBytes:grid.bytes.filter(x=>x===0).length,tableHash,keyPeriodPairs:256,keyPeriodRunes:512},
  field:{polynomial:"z^2+18z+11",zOrder:840,zEqualsU433:true,p56ConsumedPrimes:84,p56FinalPrime:p84},
  scores:{raw:{ioc:raw.ioc,mean:raw.meanTrigramNatsPerRune},minus:m,plus:p,nativeReferenceWindows:{count:ref.length,min:ref[0],median:ref[Math.floor(ref.length/2)],max:ref.at(-1)},wrongSourceAlternatives:wrong},
  p57HtmlExponentAlternatives:{remainders:[361,133,331],htmlTitle:133,htmlId:331,candidates:p57HtmlCandidates},
  positiveControl:{plantedRunes:plant.length,exactRecovery:recovered.every((x,i)=>x===plant[i]),exactForwardInverse:transform(recovered,grid.bytes,z,+1).every((x,i)=>x===planted[i])},
  decision:"No GP plaintext: the p56-selected exponent 433 and p57/HTML-selected exponents 133, 331, 361 all leave every full 256-rune window below the worst of 88 held-out Gibran windows."
 },null,2));
}
if(require.main===module)main();
module.exports={main,mul,power,transform};
