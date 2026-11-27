"use strict";
/*
 * p15 printed 4x4 matrix, all GF29 characteristic-recurrence seeds.
 * Exploratory operator: a hidden linear state/readout, not an authenticated
 * interpretation of the artwork.  F-hold receiver uses an exact backwards
 * bitset over key-state permutation cycles. Ordinary receiver evaluates the
 * entire 29^4 seed likelihood surface by a separable finite-group DFT.
 * Source p15:20 through p22; fit through p19, freeze p20-p22.
 * node sims/agent46_lp2_p15_characteristic_recurrence_sft.cjs [source|control0|control1|control2|negative|all]
 */
const Q=29, Q2=Q*Q, Q3=Q2*Q, STATES=Q3*Q;
const MATRIX=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const mod=x=>(x%Q+Q)%Q;
const check=(x,msg)=>{if(!x)throw Error(msg)};
const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
function charpoly(){
 const A=MATRIX.map(row=>row.map(BigInt));
 let B=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>BigInt(i===j)));
 const tr=[0n],c=[1n];
 for(let n=1;n<=4;n++){
  B=B.map((row,i)=>A[0].map((_,j)=>row.reduce((s,x,k)=>s+x*A[k][j],0n)));
  tr.push(B.reduce((s,row,i)=>s+row[i],0n));
  let z=0n;for(let j=1;j<=n;j++)z+=c[n-j]*tr[j];
  check(z%BigInt(n)===0n,"Newton divisibility");
  c.push(-z/BigInt(n));
 }
 check(equal(c.map(String),["1","-11673","-389042","11330665608","227518563520"]),"source characteristic polynomial");
 return c;
}
const COEFF=charpoly(),TAPS=COEFF.slice(1).map(x=>mod(-Number(x%29n)));
check(equal(TAPS,[15,7,24,12]),"GF29 taps");
function digits(code){let a=[];for(let i=0;i<4;i++){a.push(code%Q);code=Math.floor(code/Q)}return a}
function codeOf(a){return a[0]+Q*a[1]+Q2*a[2]+Q3*a[3]}
function step(code){
 const k0=code%Q,k1=Math.floor(code/Q)%Q,k2=Math.floor(code/Q2)%Q,k3=Math.floor(code/Q3);
 return Math.floor(code/Q)+Q3*((12*k0+24*k1+7*k2+15*k3)%Q);
}
function key(code,n){
 const out=new Uint8Array(n),seed=digits(code);for(let i=0;i<Math.min(4,n);i++)out[i]=seed[i];
 for(let i=4;i<n;i++)out[i]=(15*out[i-1]+7*out[i-2]+24*out[i-3]+12*out[i-4])%Q;
 return out;
}
function matrixControl(){
 let s=[3,7,11,19],w=[5,1,9,2],k=[];
 for(let t=0;t<32;t++){
  k.push(mod(w.reduce((a,x,i)=>a+x*s[i],0)));
  s=MATRIX.map(row=>mod(row.reduce((a,x,i)=>a+x*s[i],0)));
 }
 check(equal(k,key(codeOf(k.slice(0,4)),k.length)),"Cayley-Hamilton state/readout");
}
function makeOrbits(){
 const visited=new Uint8Array(STATES),orbits=[];
 for(let start=0;start<STATES;start++){
  if(visited[start])continue;
  const codes=[];let s=start;
  do{check(!visited[s],"nonpermutation orbit");visited[s]=1;codes.push(s);s=step(s)}while(s!==start);
  const n=codes.length,words=Math.ceil(n/32),tail=n%32,valid=tail?(2**tail-1)>>>0:0xffffffff;
  const masks=Array.from({length:Q},()=>new Uint32Array(words));
  for(let i=0;i<n;i++)masks[codes[i]%Q][i>>>5]|=1<<(i&31);
  orbits.push({codes,words,valid,masks,n});
 }
 check(equal(orbits.map(x=>x.n),[1,101040,101040,101040,101040,101040,101040,101040]),"orbit lengths");
 return orbits;
}
function popcnt(x){x>>>=0;x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24}
/** Exact inverse-image propagation. No language score, path pruning, or seed sampling. */
function scan(cipher,orbits,{collect=true,nonzeroOnly=false,firstOnly=false}={}){
 let count=0,codes=[];
 for(const o of orbits){
  if(nonzeroOnly&&o.n===1)continue;
  const {words,valid,masks,n}=o;
  let a=new Uint32Array(words).fill(0xffffffff),b=new Uint32Array(words);
  a[words-1]=valid;let live=true;
  for(let i=cipher.length-1;i>=0;i--){
   const c=cipher[i],m=masks[c],hold=c===0;live=false;
   for(let j=0;j<words;j++){
    const high=j+1<words?(a[j+1]<<31):((a[0]&1)<<((n-1)&31));
    const rot=(a[j]>>>1)|high;
    let v=(rot&~m[j])|(hold?a[j]:0);
    if(j===words-1)v&=valid;
    b[j]=v;if(v)live=true;
   }
   if(!live)break;
   const t=a;a=b;b=t;
  }
  if(!live)continue;
  if(firstOnly)return {count:1,codes:[]};
  for(let j=0;j<words;j++){
   let x=a[j];count+=popcnt(x);
   if(collect)while(x){const bit=31-Math.clz32(x&-x);codes.push(o.codes[32*j+bit]);x=(x&(x-1))>>>0}
  }
 }
 if(collect)codes.sort((a,b)=>a-b);
 return {count,codes};
}
function directLegal(cipher,seed){
 const k=key(seed,cipher.length),h=new Set([0]);let states=h;
 for(let i=0;i<cipher.length;i++){
  const next=new Set();
  for(const a of states){if(k[i-a]!==cipher[i])next.add(a);if(cipher[i]===0)next.add(a+1)}
  if(!next.size)return false;states=next;
 }return true;
}
function longestNonzero(cipher,orbits){
 let lo=0,hi=cipher.length+1;
 while(lo+1<hi){const mid=(lo+hi)>>>1;if(scan(cipher.slice(0,mid),orbits,{collect:false,nonzeroOnly:true,firstOnly:true}).count)lo=mid;else hi=mid}
 const witnesses=scan(cipher.slice(0,lo),orbits,{nonzeroOnly:true});
 check(witnesses.count>0&&witnesses.codes.every(s=>directLegal(cipher.slice(0,lo),s)),"prefix witness");
 if(lo<cipher.length)check(!scan(cipher.slice(0,lo+1),orbits,{collect:false,nonzeroOnly:true}).count,"prefix exclusion");
 return {length:lo,count:witnesses.count,seeds:witnesses.codes.slice(0,20).map(digits)};
}
function encode(corpus,text){
 const terms=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),out=[];
 for(const raw of text.toUpperCase().match(/[A-Z]+/g)||[]){
  const w=raw.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(let i=0;i<w.length;){
   if(w.startsWith("ING",i)){out.push(21);i+=3;continue}
   if(w.startsWith("IO",i)){out.push(27);i+=2;continue}
   const m=terms.find(t=>w.startsWith(t.s,i));check(m,"native token "+w);out.push(m.i);i+=m.s.length;
  }
 }return out;
}
function model(tape){
 const count=new Float64Array(Q2);
 for(let i=1;i<tape.length;i++)count[tape[i-1]*Q+tape[i]]++;
 const out=new Float64Array(Q2);
 for(let a=0;a<Q;a++){let sum=0;for(let b=0;b<Q;b++)sum+=count[a*Q+b];for(let b=0;b<Q;b++)out[a*Q+b]=Math.log((count[a*Q+b]+0.5)/(sum+0.5*Q))}
 return out;
}
function send(p,k,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+k[j++]))}
function dec(c,k){return c.map((x,i)=>mod(x-k[i]))}
function score(p,L){let s=0;for(let i=1;i<p.length;i++)s+=L[p[i-1]*Q+p[i]];return s}
function ioc(p){const c=Array(Q).fill(0);for(const x of p)c[x]++;return c.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1))}
function matches(a,b){return a.reduce((s,x,i)=>s+Number(x===b[i]),0)}
function viterbi(cipher,k,L,start,end,h0=0,last0=-1){
 let layer=new Map([[h0*Q+Math.max(last0,0),{h:h0,last:last0,s:0,prev:null,p:-1}]]);
 for(let i=start;i<end;i++){
  const next=new Map(),c=cipher[i];
  function add(old,h,p){
   const s=old.s+(old.last<0?0:L[old.last*Q+p]),id=h*Q+p,prior=next.get(id);
   if(!prior||s>prior.s)next.set(id,{h,last:p,s,prev:old,p});
  }
  for(const old of layer.values()){
   const p=mod(c-k[i-old.h]);if(p!==0)add(old,old.h,p);
   if(c===0)add(old,old.h+1,0);
  }
  if(!next.size)return null;layer=next;
 }
 let best=null;for(const z of layer.values())if(!best||z.s>best.s)best=z;
 const p=[];for(let z=best;z.prev;z=z.prev)p.push(z.p);p.reverse();
 return {p,s:best.s,h:best.h,last:best.last,endStates:layer.size};
}
function fCase(cipher,split,L,orbits,truth,expected,alphabet){
 const train=cipher.slice(0,split),fit=scan(train,orbits),full=scan(cipher,orbits);
 check(fit.count===fit.codes.length&&full.count===full.codes.length,"collected seeds");
 check(fit.codes.includes(0)&&full.codes.includes(0),"identity always valid");
 const ranked=fit.codes.map(s=>({seed:s,fit:viterbi(cipher,key(s,cipher.length),L,0,split)}));
 check(ranked.every(x=>x.fit),"bitset and Viterbi disagree");
 ranked.sort((a,b)=>b.fit.s-a.fit.s||a.seed-b.seed);
 const best=ranked[0],k=key(best.seed,cipher.length),held=viterbi(cipher,k,L,split,cipher.length,best.fit.h,best.fit.last);
 if(held)check(equal(send(best.fit.p.concat(held.p),k,true),cipher),"F replay");
 return {fitSeeds:fit.count,fullSeeds:full.count,fitSeedList:fit.codes.slice(0,30).map(digits),fullSeedList:full.codes.slice(0,30).map(digits),best:digits(best.seed),bestTrain:best.fit.s/(split-1),runnerGap:ranked.length>1?best.fit.s-ranked[1].fit.s:null,held:held?held.s/(cipher.length-split):null,heldIoC:held?ioc(held.p):null,heldPrefix:held?held.p.slice(0,80).map(x=>alphabet[x]).join(" "):null,fitHolds:best.fit.h,fullHolds:held?held.h:null,truth:truth?{seed:digits(expected),rank:ranked.findIndex(x=>x.seed===expected)+1,fullFeasible:full.codes.includes(expected),trainMatches:matches(best.fit.p,truth.slice(0,split)),heldMatches:held?matches(held.p,truth.slice(split)):0,heldLength:cipher.length-split}:null};
}
const COS=new Float64Array(Q2),SIN=new Float64Array(Q2);
for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){const theta=2*Math.PI*a*b/Q;COS[a*Q+b]=Math.cos(theta);SIN[a*Q+b]=Math.sin(theta)}
function fourierModel(L){
 const re=new Float64Array(Q2),im=new Float64Array(Q2);
 for(let u=0;u<Q;u++)for(let v=0;v<Q;v++){
  let x=0,y=0;
  for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){
   const z=L[a*Q+b],c1=COS[u*Q+a],s1=SIN[u*Q+a],c2=COS[v*Q+b],s2=SIN[v*Q+b];
   x+=z*(c1*c2-s1*s2);y-=z*(s1*c2+c1*s2);
  }
  re[u*Q+v]=x/Q2;im[u*Q+v]=y/Q2;
 }
 return {re,im};
}
function forms(n){
 const a=Array.from({length:Math.min(4,n)},(_,i)=>Array.from({length:4},(_,j)=>Number(i===j)));
 for(let i=4;i<n;i++)a.push(a[i-1].map((x,j)=>(15*x+7*a[i-2][j]+24*a[i-3][j]+12*a[i-4][j])%Q));
 return a;
}
/** Evaluate every seed's ordinary-consuming bigram score in O(n q^2 + 4 q^5). */
function ordinarySurface(cipher,L){
 const n=cipher.length,f=forms(n),hat=fourierModel(L);
 let re=new Float64Array(STATES),im=new Float64Array(STATES);
 for(let i=1;i<n;i++){
  const a=f[i-1],b=f[i],ca=cipher[i-1],cb=cipher[i];
  for(let u=0;u<Q;u++)for(let v=0;v<Q;v++){
   const w=(u*a[0]+v*b[0])%Q+Q*((u*a[1]+v*b[1])%Q)+Q2*((u*a[2]+v*b[2])%Q)+Q3*((u*a[3]+v*b[3])%Q);
   const h=u*Q+v,c1=COS[u*Q+ca],s1=SIN[u*Q+ca],c2=COS[v*Q+cb],s2=SIN[v*Q+cb],c=c1*c2-s1*s2,s=s1*c2+c1*s2;
   re[w]+=hat.re[h]*c-hat.im[h]*s;im[w]+=hat.re[h]*s+hat.im[h]*c;
  }
 }
 for(let axis=0,stride=1;axis<4;axis++,stride*=Q){
  const nr=new Float64Array(STATES),ni=new Float64Array(STATES),block=stride*Q;
  for(let base=0;base<STATES;base+=block)for(let off=0;off<stride;off++)for(let k=0;k<Q;k++){
   let x=0,y=0;
   for(let j=0;j<Q;j++){
    const at=base+off+j*stride,c=COS[k*Q+j],s=SIN[k*Q+j];
    x+=re[at]*c+im[at]*s;y+=im[at]*c-re[at]*s;
   }
   nr[base+off+k*stride]=x;ni[base+off+k*stride]=y;
  }
  re=nr;im=ni;
 }
 let imag=0;for(const z of im)imag=Math.max(imag,Math.abs(z));
 check(imag<1e-6,"nonreal likelihood "+imag);
 return {re,imag};
}
function ordinaryCase(cipher,split,L,truth,expected,alphabet){
 const train=cipher.slice(0,split),surface=ordinarySurface(train,L),a=surface.re;
 let best=0,second=-1;
 for(let i=1;i<a.length;i++)if(a[i]>a[best]){second=best;best=i}else if(second<0||a[i]>a[second])second=i;
 const tested=[0,best,second,...Array.from({length:32},(_,i)=>(i*27431+17)%STATES)];
 if(expected!==undefined)tested.push(expected);
 let maxError=0;
 for(const s of tested)maxError=Math.max(maxError,Math.abs(a[s]-score(dec(train,key(s,split)),L)));
 check(maxError<1e-6,"DFT direct-score mismatch "+maxError);
 const k=key(best,cipher.length),p=dec(cipher,k);
 check(equal(send(p,k,false),cipher),"ordinary replay");
 const held=p.slice(split),fit=p.slice(0,split);
 let rank=null;if(expected!==undefined){rank=1;for(const z of a)if(z>a[expected]+1e-8)rank++}
 return {states:a.length,best:digits(best),bestTrain:score(fit,L)/(split-1),runnerGap:a[best]-a[second],held:score(p.slice(split-1),L)/(cipher.length-split),heldIoC:ioc(held),heldPrefix:held.slice(0,80).map(x=>alphabet[x]).join(" "),maxDirectError:maxError,maxImaginary:surface.imag,truth:truth?{seed:expected===undefined?null:digits(expected),rank,trainMatches:matches(fit,truth.slice(0,split)),heldMatches:matches(held,truth.slice(split)),heldLength:held.length}:null};
}
function sourceControls(corpus){
 matrixControl();
 const p=encode(corpus,"AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE");
 const primes=[];for(let x=2;primes.length<p.length;x++){let ok=true;for(const y of primes){if(y*y>x)break;if(x%y===0){ok=false;break}}if(ok)primes.push(x)}
 check(p.length===85&&equal(send(p,primes.map(x=>(x-1)%Q),true),corpus.pages[56].indices),"authentic p56 regression");
 return {p56:p.length,matrixReadout:32};
}
function build(corpus,texts){
 const source=corpus.pages[15].indices.slice(20).concat(...corpus.pages.slice(16,23).map(p=>p.indices));
 const split=corpus.pages[15].indices.length-20+corpus.pages.slice(16,20).reduce((s,p)=>s+p.indices.length,0);
 check(source.length===1883&&split===1210,"source coordinates");
 const native=texts.map(x=>encode(corpus,x)),L=model(native[0].slice(0,10000));
 const controls=native.map((p,i)=>p.slice(i===0?11000:500,(i===0?11000:500)+source.length));
 check(controls.every(p=>p.length===source.length),"native length");
 return {source,split,L,controls,alphabet:corpus.translit};
}
function run(corpus,texts,which="source"){
 const begin=Date.now(),regression=sourceControls(corpus),{source,split,L,controls,alphabet}=build(corpus,texts),orbits=makeOrbits();
 const base={which,source:{start:[15,20],fitEndsAt:19,holdPages:[20,21,22],runes:source.length,fit:split,held:source.length-split,visibleF:source.filter(x=>x===0).length},characteristic:COEFF.map(String),taps:TAPS,orbitLengths:orbits.map(o=>o.n),regression};
 if(which==="source"){
  const f=fCase(source,split,L,orbits,null,undefined,alphabet);
  const longest=longestNonzero(source,orbits);
  const ordinary=ordinaryCase(source,split,L,null,undefined,alphabet);
  return {...base,f,longest,ordinary,elapsedMs:Date.now()-begin};
 }
 if(/^control[012]$/.test(which)){
  const i=Number(which.at(-1)),truth=controls[i],expected=codeOf([[7,13,2,19],[11,3,17,23],[24,5,8,16]][i]),k=key(expected,truth.length);
  const fCipher=send(truth,k,true),oCipher=send(truth,k,false);
  const f=fCase(fCipher,split,L,orbits,truth,expected,alphabet),ordinary=ordinaryCase(oCipher,split,L,truth,expected,alphabet);
  check(f.truth.fullFeasible,"hidden seed absent from exact receiver");
  return {...base,controlSource:["Gibran offset11000","Emerson offset500","Shakespeare offset500"][i],f,ordinary,elapsedMs:Date.now()-begin};
 }
 if(which==="negative"){
  let x=0x3301a17;const next=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)%Q};
  const truth=controls[1],cipher=truth.map(p=>mod(p+next()));
  return {...base,ordinary:ordinaryCase(cipher,split,L,truth,undefined,alphabet),elapsedMs:Date.now()-begin};
 }
 throw Error("unknown case "+which);
}
module.exports={run,scan,makeOrbits,directLegal,ordinarySurface,key,step,sourceControls,build};
if(typeof require!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");
 const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
 const texts=["gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt"].map(f=>fs.readFileSync(path.join(root,"resources/control",f),"utf8").split(/\r?\n/).slice(0,1600).join("\n"));
 const which=process.argv[2]||"all",cases=which==="all"?["source","control0","control1","control2","negative"]:[which];
 console.log(JSON.stringify(cases.map(c=>run(corpus,texts,c)),null,2));
}
