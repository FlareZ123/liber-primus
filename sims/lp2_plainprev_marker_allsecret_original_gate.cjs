'use strict';
/**
 * Agent26 2026-11-23: full original all-secret test of one concrete
 * dynamic-repeat marker family:
 *
 *   C_i==C_(i-1)  iff  P_i=f(P_(i-1));
 *   otherwise the 28 remaining GP29 plaintext values map bijectively
 *   into the 28 nonzero C_i−C_(i-1) transitions, using ANY secret
 *   time-varying permutation, including a running 2013 byte stream.
 *
 * This source-specific necessary equality invariant is independent of
 * *every* unknown 28-way key; a fixed native-GP natural-language
 * donor with >86 f-hit transitions cannot decrypt any full original LP2
 * ciphertext under that EXACT family.
 *
 * The functions include historically source-relevant GP prime/totient
 * maps and simple GP order maps; NO source authenticates any f as the
 * real LP2 emission law. Finite negative, not a solution.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const C=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const cipher=C.pages.filter(x=>x.status==='unsolved').flatMap(x=>x.indices);
assert.equal(cipher.length,12956);
const source=fs.readFileSync(path.join(root,'resources/cicada2013-twitter-hex-stream.txt'),'utf8');
const twitter=require('./cicada2013_twitter_original_pad_inverse.cjs').twitterBytes(source);
assert.equal(twitter.length,64167);
const GP29=29,WORDLEN=12956;
const ordered=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function nativeGP(t){
 const out=[];
 for(const s of t.toUpperCase().match(/[A-Z]+/g)||[]){
  const w=s.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
  for(let i=0;i<w.length;){const z=ordered.find(x=>w.startsWith(x.s,i));assert(z,'unknown GP spelling at '+w.slice(i));out.push(z.i);i+=z.s.length;}
 }
 return out;
}
function gcd(a,b){while(b){const z=a%b;a=b;b=z;}return a;}
function euler(n){if(n===0)return 0;let c=0;for(let i=1;i<=n;i++)c+=gcd(i,n)===1;return c;}
const fspec=[
 ['identity',x=>x],
 ['ordinalSuccessor',x=>(x+1)%GP29],
 ['ordinalReflection',x=>GP29-1-x],
 ['totientOrdinal',x=>euler(x)%GP29],
 ['primeResidue',x=>C.prime[x]%GP29],
 ['totientGPPrime',x=>(C.prime[x]-1)%GP29]
];
const observed=cipher.reduce((n,v,i)=>n+(i>0&&v===cipher[i-1]),0);
assert.equal(observed,86);
const sourceControls=[
 ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
 ['Shakespeare','resources/control/shakespeare_first300k.txt'],
 ['Emerson','resources/control/emerson_essays_2944.txt']
].map(([name,p])=>({name,arr:nativeGP(fs.readFileSync(path.join(root,p),'utf8'))}));
assert(sourceControls.every(x=>x.arr.length>WORDLEN));
const solved=C.pages.find(x=>x.page===57).indices;
function rate(a,f,start=1){let n=0;for(let i=start;i<a.length;i++)n+=(a[i]===f(a[i-1]));return n;}
function allWindowStats(a,f){
 let flags=new Uint8Array(a.length);
 for(let i=1;i<a.length;i++)flags[i]=+(a[i]===f(a[i-1]));
 const ps=new Uint32Array(a.length+1);for(let i=0;i<a.length;i++)ps[i+1]=ps[i]+flags[i];
 let min=Infinity,max=-Infinity,at=-1;
 for(let i=0;i+WORDLEN<=a.length;i++){
  const k=ps[i+WORDLEN]-ps[i+1]; // 12955 true adjacent positions within the window
  if(k<min){min=k;at=i;}if(k>max)max=k;
 }
 return {originalLengthWindows:a.length-WORDLEN+1,minimum:min,maximum:max,minAt:at,fullNativeRate:rate(a,f)/(a.length-1)};
}
function invert(ciphertext,key,f){
 const out=[];let pc=0,pp=0;
 for(let i=0;i<ciphertext.length;i++){
  const v=ciphertext[i],marker=f(pp),stream=key[i%key.length]%28;
  let p;
  if(v===pc)p=marker;
  else{
   const delta=(v-pc+29)%29;
   assert(delta>=1&&delta<=28);
   const rank=(delta-1-stream+28)%28;
   p=rank+(rank>=marker?1:0);
  }
  out.push(p);pc=v;pp=p;
 }
 return out;
}
function encrypt(plaintext,key,f){
 const out=[];let pp=0,pc=0;
 for(let i=0;i<plaintext.length;i++){
  const p=plaintext[i],marker=f(pp),k=key[i%key.length]%28;
  assert(p>=0&&p<29);
  const q=p===marker?pc:(pc+1+((p-(p>marker?1:0))+k)%28)%29;
  out.push(q);pp=p;pc=q;
 }
 return out;
}
function ioc(arr){const hist=Array(29).fill(0);for(const x of arr)hist[x]++;return hist.reduce((s,v)=>s+v*(v-1),0)/(arr.length*(arr.length-1));}
const data=[];
for(const [name,f] of fspec){
 let native=sourceControls.map(o=>({source:o.name,...allWindowStats(o.arr,f)}));
 const p=invert(cipher,twitter,f);
 assert.deepEqual(encrypt(p,twitter,f),cipher);
 assert.equal(rate(p,f),observed);
 const planted=encrypt(solved,twitter,f);
 assert.deepEqual(invert(planted,twitter,f),solved);
 // Also enforce all 29 symbols in each of the 29 previous-plaintext states.
 const all=[];for(let prev=0;prev<29;prev++)for(let rune=0;rune<29;rune++)all.push(rune);
 assert.deepEqual(invert(encrypt(all,twitter,f),twitter,f),all);
 const earliest=Math.min(...native.map(v=>v.minimum));
 const result={map:name,originalSameTransitions:observed,lowerBoundMatchedContiguousNative:earliest,
  impossibleOnAllThreeSourceControlRegisters:native.every(v=>v.minimum>observed),
  native,solvedP57MarkerCount:rate(solved,f),solvedP57Transitions:solved.length-1,
  originalInverseIoC:ioc(p),originalFirst45:p.slice(0,45).map(i=>C.translit[i]).join(' '),
  originalForwardExact:true,solvedP57ForwardInverseExact:true};
 data.push(result);
 console.log('SOURCE_MAP '+name+' originalSame='+observed+' minMatchedNative='+earliest+
  ' p57_hits='+rate(solved,f)+' GP_IoC='+ioc(p).toFixed(6)+
  ' allKeyNativeIncompatibility='+native.every(v=>v.minimum>observed));
 for(const v of native)console.log('   NATIVE '+v.source+' length='+v.originalLengthWindows+' min='+v.minimum+' max='+v.maximum+' rate='+v.fullNativeRate.toFixed(6));
}
assert.equal(data.length,6);
assert(data.every(z=>z.impossibleOnAllThreeSourceControlRegisters));
console.log('DONE all-key necessary condition rejects all SIX exact dynamic plaintext-marker functions against EVERY original-length contiguous native window in Gibran, Shakespeare and Emerson; 12956/12956 original rerender and p57 plants exact. No original plaintext.');
