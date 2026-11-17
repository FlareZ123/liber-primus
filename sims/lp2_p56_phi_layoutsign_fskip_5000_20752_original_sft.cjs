/**
 * Source-frozen GP29 authentic p56 prime-totient key with 23 exact original
 * physical page/line signs; 5,000 starts; EVERY possible plaintext-F bypass.
 * All legal output paths (not just one arbitrary beam path) on opening p0–2.
 *
 * Windows 11 / Node 22:
 *   node sims/lp2_p56_phi_layoutsign_fskip_5000_20752_original_sft.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
function read(p){return fs.readFileSync(path.join(base,p),'utf8');}
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const master=read('resources/transcriptions/liber_primus_master.txt').replace(/\r\n/g,'\n');
const glyphs='ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
/** @typedef {{pa:number,ps:number,ln:number,ls:number,po:number,rp:number,nr:number,nl:number}} F */
/** @type {{r:number[],f:F[]}[]} */
const segments=[];
let page=1,line=1,pos=0;
const source=master.substring(master.indexOf('\n\n')+2).split('§')[0];
for(const part of source.split('$')){
 let ps=1,ls=1;
 const r=[],f=[];
 for(const ch of part){
  const i=glyphs.indexOf(ch);
  if(i>=0){
   pos++;r.push(i);
   f.push({pa:page,ps,ln:line,ls,po:pos,rp:0,nr:0,nl:0});
  }else if(ch==='%'){page++;ps++;line=1;pos=0;}
  else if(ch==='/'){line++;ls++;pos=0;}
 }
 if(r.length)segments.push({r,f});
}
assert.equal(segments.length,18);
assert.deepEqual(segments.slice(7,16).map(x=>x.r.length),
 [729,1145,1729,9,1894,1021,1524,1589,3316]);
assert.deepEqual(segments.slice(7,16).flatMap(x=>x.r),
 corpus.pages.slice(0,56).flatMap(x=>x.indices));
const pg=new Map(),lines=new Map(),seen=new Map();
for(const s of segments)for(const f of s.f){
 pg.set(f.pa,(pg.get(f.pa)||0)+1);
 lines.set(f.pa,Math.max(lines.get(f.pa)||0,f.ln));
}
for(const s of segments)for(const f of s.f){
 f.rp=(seen.get(f.pa)||0)+1;
 seen.set(f.pa,f.rp);
 f.nr=pg.get(f.pa);f.nl=lines.get(f.pa);
}
const opening=segments[7];
const N=opening.r.length;
assert.equal(N,729);
const par=x=>x%2===0?1:-1,m3=(x,p)=>(x+p)%3<=1?1:-1;
/** @type {Record<string,(f:F)=>number>} */
const rules={
 Pa_par:f=>par(f.pa),Ps_par:f=>par(f.ps),
 Ln_par:f=>par(f.ln),Ls_par:f=>par(f.ls),
 Po_par:f=>par(f.po),PL_xor:f=>par(f.pa+f.ln),
 Pg_half_runes:f=>2*f.rp<=f.nr?1:-1,
 Pg_half_lines:f=>2*f.ln<=f.nl?1:-1
};
for(const [name,col] of Object.entries({Pa:'pa',Ps:'ps',Ln:'ln',Ls:'ls',Po:'po'}))
 for(let phase=0;phase<3;phase++)
  rules[name+'_m3_'+phase]=f=>m3(f[col],phase);
assert.equal(Object.keys(rules).length,23);

// Genuine p56 φ(prime) mod29 stream. Prime 2 starts at index0.
const bound=180000,sieve=new Uint8Array(bound).fill(1);
sieve[0]=sieve[1]=0;
for(let p=2;p*p<bound;p++)if(sieve[p])
 for(let q=p*p;q<bound;q+=p)sieve[q]=0;
const prime=[];
for(let p=2;p<bound&&prime.length<6000;p++)if(sieve[p])prime.push((p-1)%29);
assert.equal(prime.length,6000);
const phiSource=corpus.pages[56].indices;
assert.equal(phiSource.length,85);
const authentic=[];
let consumed=0;
for(let i=0;i<phiSource.length;i++){
 if(i===56){assert.equal(phiSource[i],0);authentic.push(0);}
 else {
  const pt=(phiSource[i]-prime[consumed]+58)%29;
  assert.notEqual(pt,0,'literal plaintext F must bypass the key');
  authentic.push(pt);
  consumed++;
 }
}
assert.equal(consumed,84);
assert.equal(authentic.slice(0,22).map(i=>corpus.translit[i]).join(''),
 'ANENDWITHINTHEDEEPWEBTHER');
let keypos=0;
assert.deepEqual(authentic.map((p,i)=>i===56?0:(p+prime[keypos++])%29),phiSource);
assert.equal(keypos,84);
console.log('PASS authentic p56 plaintext-F bypass and actual 85/85 original ciphertext');

// Native GP29 controls, with source-authored CH, TH, ING and five GP digraphs.
const dict=corpus.translit.map((name,i)=>({name:name.toLowerCase(),i}))
 .sort((a,b)=>b.name.length-a.name.length);
const control=read('resources/control/shakespeare_first300k.txt')
 .toLowerCase().replace(/v/g,'u').replace(/[kq]/g,'c').replace(/z/g,'s');
const native=[];
for(const word of control.match(/[a-z]+/g)||[]){
 for(let i=0;i<word.length;){
  if(word.startsWith('ing',i)){native.push(21);i+=3;continue;}
  const t=dict.find(item=>word.startsWith(item.name,i));
  assert(t,'unhandled source token '+word.slice(i));
  native.push(t.i);i+=t.name.length;
 }
}
assert.equal(native.length,217644);
const histogram=new Float64Array(29).fill(1);
for(const symbol of native)histogram[symbol]++;
const size=histogram.reduce((s,x)=>s+x,0);
const weights=Array.from(histogram,x=>Math.log(29*x/size));
/** @param {number[]} arr @returns {{ioc:number,llr:number}} */
function score(arr){
 const count=new Uint16Array(29);let llr=0;
 for(const rune of arr){count[rune]++;llr+=weights[rune];}
 let eq=0;for(const n of count)eq+=n*(n-1);
 return {ioc:eq/(arr.length*(arr.length-1)),llr:llr/arr.length};
}
let nativeMinIoc=1,nativeMaxIoc=0,nativeMinLLR=Infinity,nativeMaxLLR=-Infinity;
for(let j=0;j<20;j++){
 const sample=score(native.slice(10000+j*10000,10729+j*10000));
 nativeMinIoc=Math.min(nativeMinIoc,sample.ioc);
 nativeMaxIoc=Math.max(nativeMaxIoc,sample.ioc);
 nativeMinLLR=Math.min(nativeMinLLR,sample.llr);
 nativeMaxLLR=Math.max(nativeMaxLLR,sample.llr);
}
assert(nativeMinIoc>0.0565 && nativeMinLLR>0.35);

// An exact automaton: state k is # encrypted GP symbols already consumed.
// For C=F, a true plaintext F can bypass without advancing; encrypted
// non-F is possible only when (C - signedKey) != plaintext F.
// For C!=F, key consumption is forced and P=F is forbidden.
const active=new Uint8Array(N+2),next=new Uint8Array(N+2);
/**
 * @param {number[]} signs
 * @param {number} direction
 * @param {number} start
 * @returns {boolean}
 */
function legal(signs,direction,start){
 active.fill(0);active[0]=1;
 let lo=0,hi=0;
 for(let i=0;i<N;i++){
  const c=opening.r[i];
  next.fill(0,lo,hi+2);
  let outLo=N+1,outHi=-1;
  for(let k=lo;k<=hi;k++)if(active[k]){
   if(c===0){next[k]=1;outLo=Math.min(outLo,k);outHi=Math.max(outHi,k);}
   const p=(c-direction*signs[i]*prime[start+k]+58)%29;
   if(p!==0){next[k+1]=1;outLo=Math.min(outLo,k+1);outHi=Math.max(outHi,k+1);}
  }
  if(outHi<0)return false;
  active.set(next.subarray(outLo,outHi+1),outLo);
  // IMPORTANT: active outside [lo,hi] may remain set; the updated
  // interval alone is read on the next iteration.
  lo=outLo;hi=outHi;
 }
 return true;
}
let survivorCount=0,pathCount=0,bestIoc={ioc:0},bestLLR={llr:-Infinity};
/**
 * @param {number[]} signs @param {number} direction
 * @param {number} start @param {string} rule
 */
function enumerate(signs,direction,start,rule){
 const forward=new Array(N+1);forward[0]=new Set([0]);
 for(let i=0;i<N;i++){
  const c=opening.r[i],nextState=new Set();
  for(const k of forward[i]){
   if(c===0)nextState.add(k);
   const p=(c-direction*signs[i]*prime[start+k]+58)%29;
   if(p!==0)nextState.add(k+1);
  }
  assert(nextState.size,'reachability prefilter vs enumerator mismatch');
  forward[i+1]=nextState;
 }
 const back=new Array(N+1);back[N]=forward[N];
 for(let i=N-1;i>=0;i--){
  const c=opening.r[i],states=new Set();
  for(const k of forward[i]){
   if(c===0&&back[i+1].has(k))states.add(k);
   const p=(c-direction*signs[i]*prime[start+k]+58)%29;
   if(p!==0&&back[i+1].has(k+1))states.add(k);
  }
  back[i]=states;
 }
 assert(back[0].has(0));
 const plaintext=new Uint8Array(N),freq=new Uint16Array(29);
 /** @param {number} i @param {number} k @param {number} numerator @param {number} llr */
 function walk(i,k,numerator,llr){
  if(i===N){
   pathCount++;
   const ioc=numerator/(N*(N-1)), language=llr/N;
   if(ioc>bestIoc.ioc)bestIoc={rule,direction,start,ioc,llr:language,
    preview:Array.from(plaintext.slice(0,85),x=>corpus.translit[x]).join('')};
   if(language>bestLLR.llr)bestLLR={rule,direction,start,ioc,llr:language,
    preview:Array.from(plaintext.slice(0,85),x=>corpus.translit[x]).join('')};
   return;
  }
  const c=opening.r[i];
  if(c===0&&back[i+1].has(k)){
   plaintext[i]=0;
   const old=freq[0]++;walk(i+1,k,numerator+2*old,llr+weights[0]);freq[0]--;
  }
  const p=(c-direction*signs[i]*prime[start+k]+58)%29;
  if(p!==0&&back[i+1].has(k+1)){
   plaintext[i]=p;
   const old=freq[p]++;walk(i+1,k+1,numerator+2*old,llr+weights[p]);freq[p]--;
  }
 }
 walk(0,0,0,0);
}
// Freeze 23 source-defined original rules, both arithmetic signs,
// and 5,000 prime starts. Never choose a new sign rule after scoring.
let models=0;
for(const [name,fn] of Object.entries(rules)){
 const signs=opening.f.map(fn);
 for(const direction of [-1,1])for(let start=0;start<5000;start++){
  models++;
  if(legal(signs,direction,start)){
   survivorCount++;
   enumerate(signs,direction,start,name);
  }
 }
}
assert.equal(models,230000);
assert.equal(survivorCount,95);
assert.equal(pathCount,20752);
assert.equal(bestIoc.ioc,0.03571428571428571);
assert(bestLLR.llr < -0.72);
assert(bestIoc.ioc < nativeMinIoc-0.02);
assert(bestLLR.llr < nativeMinLLR-1.0);
console.log(JSON.stringify({models,survivorCount,pathCount,
 bestIoc,bestLLR,native20:{minIoc:nativeMinIoc,maxIoc:nativeMaxIoc,
 minLLR:nativeMinLLR,maxLLR:nativeMaxLLR},
 decision:'All 20,752 exact legal source-input paths are nonprose; no genuine unknown plaintext.'},null,2));
