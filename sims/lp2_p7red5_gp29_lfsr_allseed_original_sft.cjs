"use strict";
// Exhaust the 29^5 secret initial states of one source-constrained 5-word GP29
// running-key recurrence. Native prefix gates are locked independently of LP2.
// Run node sims/lp2_p7red5_gp29_lfsr_allseed_original_sft.cjs
const fs=require("node:fs"), path=require("node:path"), assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const t=read("resources/control/gibran_prophet_58585.txt");
const toks=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const norm=t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
const native=[];
for(let i=0;i<norm.length;){
 if(!/[A-Z]/.test(norm[i])){i++;continue;}
 const z=toks.find(x=>norm.startsWith(x.s,i));if(!z){i++;continue;}
 native.push(z.i);i+=z.s.length;
}
assert(native.length>53000);
const training=native.slice(0,50000);
const numer=Array.from({length:29},()=>Array(29).fill(.3));
const denom=Array(29).fill(29*.3);
for(let i=1;i<training.length;i++){numer[training[i-1]][training[i]]++;denom[training[i-1]]++;}
const ll=numer.map((row,i)=>row.map(v=>Math.log(v/denom[i])));
const avg=(a,k=a.length)=>{let sum=0;for(let i=1;i<k;i++)sum+=ll[a[i-1]][a[i]];return sum/(k-1);};
const Ks=[16,48,128,243], limits=[];
for(const k of Ks){
 const s=[];
 for(let i=50000;i+243<native.length;i+=5)s.push(avg(native.slice(i,i+k)));
 s.sort((a,b)=>a-b);
 limits.push(s[Math.floor(.01*s.length)]);
}
assert.deepEqual(gp.translit.length,29);
const C=gp.pages[8].indices.slice(12); // exact p8 red12 => black243
assert.equal(C.length,243);
const hold=gp.pages.slice(9,13).flatMap(p=>p.indices).slice(0,300);
assert.equal(hold.length,300);
const tap=[11,26,8,15,2]; // original p7 five red-word GP0 products, printed order
const mod=x=>{x%=29;return x<0?x+29:x;};
const decoded=(cipher,init,extent=cipher.length)=>{
 const key=init.slice(),out=[];
 for(let i=0;i<extent;i++){
  if(i>=5)key.push(mod(tap[0]*key[i-5]+tap[1]*key[i-4]+tap[2]*key[i-3]+tap[3]*key[i-2]+tap[4]*key[i-1]));
  out.push(mod(cipher[i]-key[i]));
 }
 return out;
};
const encoded=(plain,init)=>{
 const out=[],key=init.slice();
 for(let i=0;i<plain.length;i++){
  if(i>=5)key.push(mod(tap[0]*key[i-5]+tap[1]*key[i-4]+tap[2]*key[i-3]+tap[3]*key[i-2]+tap[4]*key[i-1]));
  out.push(mod(plain[i]+key[i]));
 }
 return out;
};
const positive=native.slice(51000,51243), pkey=tap.slice(), planted=encoded(positive,pkey);
assert.deepEqual(decoded(planted,pkey),positive);
const nativeScores=Ks.map(k=>avg(positive,k));
assert(nativeScores.every((x,j)=>x>=limits[j]),"positive native-GP branch fails predeclared native calibration");
const scan=(cipher,base=0,stop=29**5)=>{
 const tally=[0,0,0,0],bestStage=[null,null,null,null];
 const process=(seed,model)=>{
  let k0=seed%29,k1=Math.floor(seed/29)%29,k2=Math.floor(seed/841)%29,
      k3=Math.floor(seed/24389)%29,k4=Math.floor(seed/707281)%29;
  let prev=mod(cipher[0]-k0),sum=0;
  for(let i=1;i<243;i++){
   let key;
   if(i===1)key=k1;else if(i===2)key=k2;else if(i===3)key=k3;else if(i===4)key=k4;
   else{
    key=mod(tap[0]*k0+tap[1]*k1+tap[2]*k2+tap[3]*k3+tap[4]*k4);
    k0=k1;k1=k2;k2=k3;k3=k4;k4=key;
   }
   const plain=mod(cipher[i]-key);sum+=ll[prev][plain];prev=plain;
   if(i===15||i===47||i===127||i===242){
    const idx=i===15?0:i===47?1:i===127?2:3;
    const av=sum/i;
    if(!bestStage[idx]||av>bestStage[idx].score)bestStage[idx]={seed,score:av};
    if(av<limits[idx])return;
    tally[idx]++;
   }
  }
 };
 for(let z=base;z<stop;z++)process(z);
 return {tally,bestStage};
};
const started=Date.now();
const exhaustive=scan(C);
const elapsedMs=Date.now()-started;
const total=29**5;
assert.equal(total,20511149);
// Second, strictly exhaustive whole-passage *rank*: NO language-prefix
// pruning, every one of 20,511,149 source-seeded states receives the
// complete 243-rune GP bigram likelihood. Simultaneously score a disjoint
// ciphertext-native plant under the SAME running keystream (one recurrence).
function fullScoreBoth(cipher1,cipher2,trueSeed){
 let bestO={seed:-1,score:-Infinity},bestP={seed:-1,score:-Infinity};
 let topO=[],trueScore=avg(positive),nativeBetter=0,originalAboveNativeFloor=0;
 for(let s=0;s<total;s++){
  let k0=s%29,k1=Math.floor(s/29)%29,k2=Math.floor(s/841)%29,
      k3=Math.floor(s/24389)%29,k4=Math.floor(s/707281)%29;
  let prev1=mod(cipher1[0]-k0),prev2=mod(cipher2[0]-k0),sc1=0,sc2=0;
  for(let i=1;i<243;i++){
   let key;
   if(i===1)key=k1;else if(i===2)key=k2;else if(i===3)key=k3;else if(i===4)key=k4;
   else{
    key=mod(tap[0]*k0+tap[1]*k1+tap[2]*k2+tap[3]*k3+tap[4]*k4);
    k0=k1;k1=k2;k2=k3;k3=k4;k4=key;
   }
   const p1=mod(cipher1[i]-key),p2=mod(cipher2[i]-key);
   sc1+=ll[prev1][p1];sc2+=ll[prev2][p2];
   prev1=p1;prev2=p2;
  }
  const so=sc1/242,sp=sc2/242;
  if(so>limits[3])originalAboveNativeFloor++;
  if(so>bestO.score)bestO={seed:s,score:so};
  if(sp>bestP.score)bestP={seed:s,score:sp};
  if(sp>=trueScore-1e-12)nativeBetter++;
  if(topO.length<10||so>topO.at(-1).score){
    topO.push({seed:s,score:so});
    topO.sort((a,b)=>b.score-a.score);
    if(topO.length>10)topO.pop();
  }
 }
 return {bestOriginal:bestO,bestNativePlant:bestP,originalAboveNativeOnePercent:originalAboveNativeFloor,
   nativeTrueScore:trueScore,nativeSeedsAtLeastTrueScore:nativeBetter,topOriginal:topO};
}
const fullStarted=Date.now();
const full=fullScoreBoth(C,planted,pkey);
const fullElapsedMs=Date.now()-fullStarted;
assert.equal(full.nativeSeedsAtLeastTrueScore,1,"native plant exponent not recovered uniquely over full 29^5");
assert.equal(full.bestNativePlant.seed,pkey.reduce((sum,v,j)=>sum+v*29**j,0),"true native key not full-space best");

const chosen=exhaustive.bestStage[3]||exhaustive.bestStage[2]||exhaustive.bestStage[1]||exhaustive.bestStage[0];
const keyFromSeed=z=>[z%29,Math.floor(z/29)%29,Math.floor(z/841)%29,Math.floor(z/24389)%29,Math.floor(z/707281)%29];
const outChosen=chosen?decoded(C,keyFromSeed(chosen.seed)):null;
const outHold=chosen?decoded(C.concat(hold),keyFromSeed(chosen.seed)).slice(243):null;
const positives=Ks.map((k,j)=>({length:k,threshold:limits[j],nativeScore:nativeScores[j]}));
const result={
 schema:1,sourceP7Taps:tap,model:"F29 additive keystream, k[i+5]=sum_j tap[j]k[i+j], pair offset and original p8 black243 fixed",
 trainPositions:"first 50000 GP symbols Gibran donor",calibration:"each fifth position 50000 .. native.length-243, lowest one percentile GP bigram score",
 universe:total,originalP8BlackRunes:C.length,originalP9HoldRunes:hold.length,
 control:{nativeExactRoundtrip:true,seed:pkey,thresholdsPass:true,nativeScores,limits:positives},
 original:{fullExhaustive:full, fullSearchSeconds:fullElapsedMs/1000,survivors:exhaustive.tally,bestStage:exhaustive.bestStage,
  bestRemainingSeed:chosen?.seed,bestRemainingInitialState:chosen?keyFromSeed(chosen.seed):null,
  bestWholeP8Seed:full.bestOriginal.seed,bestWholeP8InitialState:keyFromSeed(full.bestOriginal.seed),
  bestWholeP8Translit:decoded(C,keyFromSeed(full.bestOriginal.seed)).map(i=>gp.translit[i]).join(" "),
  bestWholeP9MeanScore:avg(decoded(C.concat(hold),keyFromSeed(full.bestOriginal.seed)).slice(243)),
  bestRemainingP8MeanScore:outChosen?avg(outChosen):null,
  bestRemainingP9MeanScore:outHold?avg(outHold):null,
  bestRemainingP8CompleteTranslit:outChosen?outChosen.map(i=>gp.translit[i]).join(" "):null,
  bestRemainingP9CompleteTranslit:outHold?outHold.map(i=>gp.translit[i]).join(" "):null
 },runSeconds:elapsedMs/1000
};
console.log(JSON.stringify(result,null,2));
assert(result.original.survivors[0]>=result.original.survivors[1]);
assert(result.original.survivors[1]>=result.original.survivors[2]);
assert(result.original.survivors[2]>=result.original.survivors[3]);
// The fullScoreBoth loop tests every seed against the entire 243-rune body.
// Prefix gates are also separately reported for native-calibrated interpretability.
// Rejecting by early gates is explicit; this is NOT a global unrestricted English
// exclusion if a genuine passage falls outside calibrated native thresholds.
