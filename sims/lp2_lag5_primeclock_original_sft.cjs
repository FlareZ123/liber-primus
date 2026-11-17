'use strict';
/** Original-source GP29 ciphertext-lag5 conditioned prime-totient key clock.
 * Windows 11 / Node22 standalone SFT. No writes, CLI args, dependencies or RNG.
 * Tests modes -1/0/+1 key-clock adjustments after each within-word C[i]=C[i-5].
 * This is a hypothetical lossless 5-dot clue consumer, not a claimed Cicada cipher.
 * @author Agent45, 2026-11-17 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
/** @param {string} f @returns {string} */
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const d=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw=read('resources/liber-primus/lp2-transcription.txt');
/** @param {string} s @returns {number[][]} */
function originalWords(s){
 const words=[];let w=[];
 for(const c of s.split('%').slice(0,55).join('%')){
  if(/[\u16a0-\u16ff]/u.test(c)){const i=d.runes.indexOf(c);assert(i>=0);w.push(i);}
  else if(c!=='%'&&c!=='/'&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}
 }
 if(w.length)words.push(w);
 return words;
}
const words=originalWords(raw),C=words.flat();
const canon=d.pages.filter(p=>p.status==='unsolved').flatMap(p=>p.indices);
assert.equal(words.length,2896);assert.equal(C.length,12956);assert.deepEqual(C,canon);
const flag=words.flatMap(w=>w.map((x,j)=>j>=5&&x===w[j-5]));
assert.equal(flag.filter(Boolean).length,104);
const lim=180000,sieve=new Uint8Array(lim).fill(1);
sieve[0]=sieve[1]=0;
for(let p=2;p*p<lim;p++)if(sieve[p])for(let j=p*p;j<lim;j+=p)sieve[j]=0;
const key=[];
for(let i=2;i<lim&&key.length<9000;i++)if(sieve[i])key.push((i-1)%29);
assert.equal(key.length,9000);
// Verify authentic solved LP2 p56 original F-transparent prime-totient control.
const p56=d.pages[56].indices;assert.equal(p56.length,85);assert.equal(p56[56],0);
let kp=0;
const clear56=p56.map((c,i)=>i===56?0:(c-key[kp++]+58)%29);
assert.equal(kp,84);
assert.equal(clear56.slice(0,22).map(x=>d.translit[x]).join(''),'ANENDWITHINTHEDEEPWEBTHER');
let back=0;
assert.deepEqual(clear56.map((p,i)=>i===56?0:(p+key[back++])%29),p56);
// Native-GP Shakespeare register, same normalizer as source-frozen #1348.
const alphabet=d.translit.map((name,i)=>({name:name.toLowerCase(),i})).sort((a,b)=>b.name.length-a.name.length);
const text=read('resources/control/shakespeare_first300k.txt').toLowerCase()
 .replace(/v/g,'u').replace(/[kq]/g,'c').replace(/z/g,'s');
const native=[];
for(const w of text.match(/[a-z]+/g)||[]){
 for(let j=0;j<w.length;){
  if(w.startsWith('ing',j)){native.push(21);j+=3;continue;}
  const t=alphabet.find(a=>w.startsWith(a.name,j));assert(t,w);
  native.push(t.i);j+=t.name.length;
 }
}
assert.equal(native.length,217644);
const freq=new Float64Array(29).fill(1);
for(const x of native)freq[x]++;
const weight=Array.from(freq,n=>Math.log(29*n/(native.length+29)));
/** @param {number[]} values @returns {{ioc:number,llr:number}} */
function score(values){
 const f=new Uint16Array(29);let llr=0;
 for(const v of values){f[v]++;llr+=weight[v];}
 return {ioc:f.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1)),llr:llr/values.length};
}
/** @param {number[]} plain @param {number[][]} form @param {-1|1} sign @param {-1|0|1} mode @param {number} start @param {number[]} [stream] @returns {number[]} */
function encrypt(plain,form,sign,mode,start,stream=key){
 const out=[];let i=0,k=start;
 for(const w of form){const local=[];
  for(let j=0;j<w.length;j++){
   const c=(plain[i++]-sign*stream[k%stream.length]+58)%29;out.push(c);local.push(c);
   k+=1+(j>=5&&c===local[j-5]?mode:0);
  }
 }
 assert.equal(i,plain.length);return out;
}
/** @param {number[]} cipher @param {number[][]} form @param {-1|1} sign @param {-1|0|1} mode @param {number} start @returns {number[]} */
function decrypt(cipher,form,sign,mode,start,stream=key){
 const out=[];let i=0,k=start;
 for(const w of form){const local=[];
  for(let j=0;j<w.length;j++){
   const c=cipher[i++];out.push((c+sign*stream[k%stream.length]+58)%29);local.push(c);
   k+=1+(j>=5&&c===local[j-5]?mode:0);
  }
 }
 assert.equal(i,cipher.length);return out;
}
const sourcePlant=native.slice(10000,22956);
assert.equal(sourcePlant.length,12956);
for(const mode of [-1,0,1])for(const sign of [-1,1]){
 const enc=encrypt(sourcePlant,words,sign,mode,373);
 const dec=decrypt(enc,words,sign,mode,373);
 assert.deepEqual(dec,sourcePlant);
 assert.deepEqual(encrypt(dec,words,sign,mode,373),enc);
}
const lengths=[729,1145,1729,9,1894,1021,1524,1589,3316];
let total=0,models=0;const results=[];
for(const n of lengths){
 const start=total,end=start+n;total=end;
 if(n===9)continue;let bestIoc={ioc:-1},bestLang={llr:-Infinity};
 for(const mode of [-1,0,1])for(const sign of [-1,1])for(let phase=0;phase<5000;phase++){
  let k=phase,llr=0;const f=new Uint16Array(29);
  for(let i=start;i<end;i++){
   const p=(C[i]+58+sign*key[k])%29;f[p]++;llr+=weight[p];
   k+=1+(flag[i]?mode:0);
  }
  let pair=0;for(const z of f)pair+=z*(z-1);
  const ioc=pair/(n*(n-1));llr/=n;models++;
  if(ioc>bestIoc.ioc)bestIoc={ioc,llr,mode,sign,phase};
  if(llr>bestLang.llr)bestLang={ioc,llr,mode,sign,phase};
 }
 results.push({start,n,bestIoc,bestLang});
}
assert.equal(total,12956);assert.equal(results.length,8);assert.equal(models,240000);
const maxIoc=Math.max(...results.map(s=>s.bestIoc.ioc));
const maxLLR=Math.max(...results.map(s=>s.bestLang.llr));
assert(Math.abs(maxIoc-0.03635870302536969)<1e-12);
assert(Math.abs(maxLLR+0.6339275059713757)<1e-12);
assert(score(sourcePlant.slice(0,729)).ioc>0.06);

// Separate explicit historical LP1 passwords, same source-visible next-clock
// predicate, all source-original section starts, phases and both signs.
// They are 8- and 13-rune known keys, never guessed from unknown text.
const historical=[
 {name:'DIVINITY',K:[23,10,1,10,9,10,16,26]},
 {name:'FIRFUMFERENFE',K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}
];
for(const {K} of historical)for(const mode of [-1,0,1])for(const sign of [-1,1]){
 const plant=encrypt(sourcePlant,words,sign,mode,373,K);
 const round=decrypt(plant,words,sign,mode,373,K);
 assert.deepEqual(round,sourcePlant);
 assert.deepEqual(encrypt(round,words,sign,mode,373,K),plant);
}
let historicalModels=0,keywordMaxIoc=-1,keywordMaxLLR=-Infinity;
let position=0;
for(const n of lengths){
 const start=position,end=start+n;position=end;
 if(n===9)continue;
 for(const {K} of historical)for(const mode of [-1,0,1])for(const sign of [-1,1])
  for(let phase=0;phase<K.length;phase++){
   let k=phase,llr=0;const histogram=new Uint16Array(29);
   for(let i=start;i<end;i++){
    const p=(C[i]+58+sign*K[k%K.length])%29;
    histogram[p]++;llr+=weight[p];
    k+=1+(flag[i]?mode:0);
   }
   let eq=0;for(const count of histogram)eq+=count*(count-1);
   keywordMaxIoc=Math.max(keywordMaxIoc,eq/(n*(n-1)));
   keywordMaxLLR=Math.max(keywordMaxLLR,llr/n);
   historicalModels++;
  }
}
assert.equal(position,12956);assert.equal(historicalModels,1008);
assert(Math.abs(keywordMaxIoc-0.0352884426958501)<1e-12);
assert(Math.abs(keywordMaxLLR+0.6689457172753868)<1e-12);
console.log('PASS 1008 original historical DIVINITY/FIRFUMFERENFE five-back clock inverses');
console.log(JSON.stringify({historicalModels,keywordMaxIoc,keywordMaxLLR}));
console.log(JSON.stringify({status:'PASS',originalRunes:C.length,originalWords:words.length,
 lag5:flag.filter(Boolean).length,solvedP56:p56.length,plantedBooks:18,models,
 maxIoc,maxLLR,results},null,2));

// Actual p56-style plaintext-F bypass, now WITHOUT assuming away encrypted C=F:
// a literal plaintext F emits C=F and consumes zero key symbols; any other
// plaintext symbol encrypts, consumes 1+mode*[C_j=C_(j-5) in the same word].
// Every legal original key-count and F-placement path is enumerated exactly.
const opening=C.slice(0,729),openingFlag=flag.slice(0,729),N=opening.length;
assert.equal(N,729);
assert.equal(opening.filter(x=>x===0).length,34);
assert.equal(openingFlag.filter(Boolean).length,7);

/** @param {number[]} cipher @param {boolean[]} echo @param {-1|0|1} mode @param {-1|1} sign @param {number} start @returns {number} */
function reachableF(cipher,echo,mode,sign,start){
 const maxLength=cipher.length+echo.filter(Boolean).length+2;
 let prev=new Uint8Array(maxLength),next=new Uint8Array(maxLength),active=[0];
 prev[0]=1;
 for(let i=0;i<cipher.length;i++){
  const c=cipher[i],delta=1+(echo[i]?mode:0),newKeys=[];
  for(const k of active){
   if(c===0&&!next[k]){next[k]=1;newKeys.push(k);}
   const p=(c+58+sign*key[start+k])%29,nk=k+delta;
   if(p!==0&&!next[nk]){next[nk]=1;newKeys.push(nk);}
  }
  if(!newKeys.length)return 0;
  [prev,next]=[next,prev];
  for(const k of active)next[k]=0;
  active=newKeys;
 }
 return active.length;
}
// Six additional original-shaped English plants: actual F-transparent stream.
const openingWords=[];let rest=N;
for(const word of words){if(!rest)break;const take=word.slice(0,rest);
 openingWords.push(take);rest-=take.length;}
assert.equal(rest,0);
/** @param {number[]} plain @param {-1|0|1} mode @param {-1|1} sign @param {number} start @returns {number[]} */
function encryptWithLiteralF(plain,mode,sign,start){
 const result=[];let k=start,i=0;
 for(const word of openingWords){
  const local=[];
  for(let j=0;j<word.length;j++){
   const p=plain[i++];
   const c=p===0?0:(p-sign*key[k]+58)%29;
   local.push(c);result.push(c);
   if(p!==0)k+=1+(j>=5&&c===local[j-5]?mode:0);
  }
 }
 assert.equal(i,N);
 return result;
}
const openingNative=sourcePlant.slice(0,N);
for(const mode of [-1,0,1])for(const sign of [-1,1]){
 const planted=encryptWithLiteralF(openingNative,mode,sign,393);
 const plantedEcho=[];let cursor=0;
 for(const word of openingWords){
  for(let j=0;j<word.length;j++)plantedEcho.push(j>=5&&planted[cursor+j]===planted[cursor+j-5]);
  cursor+=word.length;
 }
 const terminal=reachableF(planted,plantedEcho,mode,sign,393);
 assert(terminal>0,'native source plaintext-F branch excluded');
}
const expected=[[-1,1,393],[-1,1,394],[-1,1,396],[1,1,3342]];
const found=[];
for(const mode of [-1,0,1])for(const sign of [-1,1])for(let start=0;start<5000;start++){
 const count=reachableF(opening,openingFlag,mode,sign,start);
 if(count)found.push([mode,sign,start,count]);
}
assert.deepEqual(found,expected.map(([m,s,k])=>[m,s,k,2]));
/** @type {{mode:number,sign:number,start:number,paths:number,maxIoc:number,maxLLR:number}[]} */
const exact=[];
for(const [mode,sign,start] of expected){
 /** @type {Set<number>[]} */
 const fwd=Array.from({length:N+1},()=>new Set());
 fwd[0].add(0);
 for(let i=0;i<N;i++){
  const c=opening[i],step=1+(openingFlag[i]?mode:0);
  for(const k of fwd[i]){
   if(c===0)fwd[i+1].add(k);
   if((c+58+sign*key[start+k])%29!==0)fwd[i+1].add(k+step);
  }
 }
 const good=Array.from({length:N+1},()=>new Set());
 good[N]=fwd[N];
 for(let i=N-1;i>=0;i--){
  const c=opening[i],step=1+(openingFlag[i]?mode:0);
  for(const k of fwd[i]){
   if(c===0&&good[i+1].has(k)||
      (c+58+sign*key[start+k])%29!==0&&good[i+1].has(k+step))good[i].add(k);
  }
 }
 assert(good[0].has(0));
 const hist=new Uint16Array(29);let paths=0,maxIoc=-Infinity,maxLLR=-Infinity;
 /** @param {number} i @param {number} k @param {number} pairs @param {number} sum */
 function recurse(i,k,pairs,sum){
  if(i===N){
   paths++;
   maxIoc=Math.max(maxIoc,pairs/(N*(N-1)));
   maxLLR=Math.max(maxLLR,sum/N);
   return;
  }
  const c=opening[i],step=1+(openingFlag[i]?mode:0);
  if(c===0&&good[i+1].has(k)){
   const before=hist[0]++;
   recurse(i+1,k,pairs+2*before,sum+weight[0]);
   hist[0]--;
  }
  const p=(c+58+sign*key[start+k])%29;
  if(p!==0&&good[i+1].has(k+step)){
   const before=hist[p]++;
   recurse(i+1,k+step,pairs+2*before,sum+weight[p]);
   hist[p]--;
  }
 }
 recurse(0,0,0,0);
 exact.push({mode,sign,start,paths,maxIoc,maxLLR});
}
assert.deepEqual(exact.map(x=>x.paths),[64,64,192,120]);
assert.equal(exact.reduce((s,v)=>s+v.paths,0),440);
const fMaxIoc=Math.max(...exact.map(x=>x.maxIoc));
const fMaxLLR=Math.max(...exact.map(x=>x.maxLLR));
assert(Math.abs(fMaxIoc-0.03493420160086827)<1e-12);
assert(Math.abs(fMaxLLR+0.6307587662792099)<1e-12);
console.log(JSON.stringify({status:'PASS full original plaintext-F-transparent key-clock inverse',
 models:30000,survivingStarts:found.length,legalPaths:440,originalF:34,lag5OriginalOpening:7,
 nativeFPlants:6,fMaxIoc,fMaxLLR,exact},null,2));
console.log('NO GP29 prose: finite historical prime and ciphertext-lag5 key-clock mechanism negative.');
