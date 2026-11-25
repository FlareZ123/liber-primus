"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const CORPUS=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const INK=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const NATIVE=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const SHAKESPEARE=read("resources/control/shakespeare_first300k.txt");
const MOD=29,MAX_START=3301,TRIALS=100,SEED=0x27c10c;
const mod=x=>(x%MOD+MOD)%MOD;
const runeMap=new Map(CORPUS.runes.map((r,i)=>[r,i]));
const pages=CORPUS.pages.filter(p=>p.page>=15&&p.page<=22);
assert.deepEqual(pages.map(p=>p.page),[15,16,17,18,19,20,21,22]);
const redSpans=INK.pages.find(p=>p.page===15).red_spans;
assert.deepEqual(redSpans.map(x=>[x.start,x.length]),[[0,9],[9,11]]);
const redIdx=new Set(redSpans.flatMap(s=>Array.from({length:s.length},(_,i)=>s.start+i)));
const originalCipher=pages.flatMap(p=>p.page===15?p.indices.filter((_,i)=>!redIdx.has(i)):p.indices);
const split=originalCipher.length-pages.find(p=>p.page===22).indices.length;
assert.equal(originalCipher.length,1883);
assert.equal(split,1752);
const nativeSections=NATIVE.sections.map(s=>({name:s.name,plain:[...s.source_text].filter(ch=>runeMap.has(ch)).map(ch=>runeMap.get(ch))}));
const controlDefs=[
 {name:"0_welcome",plain:nativeSections.find(s=>s.name==="0_welcome").plain,start:73},
 {name:"0_koan_1",plain:nativeSections.find(s=>s.name==="0_koan_1").plain,start:168},
 {name:"0_loss_of_divinity",plain:nativeSections.find(s=>s.name==="0_loss_of_divinity").plain,start:3301},
 {name:"jpg107-167",plain:nativeSections.find(s=>s.name==="jpg107-167").plain,start:22},
 {name:"all-solved-native-concatenated (synthetic continuous plant)",plain:nativeSections.flatMap(s=>s.plain),start:2401}
];
const maxLen=Math.max(originalCipher.length,...controlDefs.map(x=>x.plain.length));
const maxIndex=MAX_START+maxLen*Math.max(...CORPUS.prime)+1;
const upper=Math.ceil(maxIndex*(Math.log(maxIndex)+Math.log(Math.log(maxIndex)))+1000);
const composite=new Uint8Array(upper+1);
for(let p=2;p*p<=upper;p++)if(!composite[p])for(let q=p*p;q<=upper;q+=p)composite[q]=1;
const primes=new Uint32Array(maxIndex+1);let primeCount=0;
for(let p=2;p<=upper&&primeCount<primes.length;p++)if(!composite[p])primes[primeCount++]=p;
assert.equal(primeCount,primes.length);
const letters={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const digraphs={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
function encodeLatin(text){const s=text.toUpperCase().replace(/[^A-Z]/g,""),out=[];for(let i=0;i<s.length;i++){const v=digraphs[s.slice(i,i+2)];if(v!==undefined){out.push(v);i++;}else out.push(letters[s[i]]);}return out;}
function trainModel(text){
 const symbols=encodeLatin(text),u=new Uint32Array(MOD),b=new Uint32Array(MOD*MOD),t=new Uint32Array(MOD**3);
 for(let i=0;i<symbols.length;i++){u[symbols[i]]++;if(i)b[symbols[i-1]*MOD+symbols[i]]++;if(i>1)t[(symbols[i-2]*MOD+symbols[i-1])*MOD+symbols[i]]++;}
 const unigram=new Float64Array(MOD),bigram=new Float64Array(MOD*MOD),trigram=new Float64Array(MOD**3);
 for(let x=0;x<MOD;x++)unigram[x]=Math.log((u[x]+1)/(symbols.length+MOD));
 for(let x=0;x<MOD;x++)for(let y=0;y<MOD;y++)bigram[x*MOD+y]=Math.log((b[x*MOD+y]+12*Math.exp(unigram[y]))/(u[x]+12));
 for(let x=0;x<MOD;x++)for(let y=0;y<MOD;y++)for(let z=0;z<MOD;z++){const k=(x*MOD+y)*MOD+z;trigram[k]=Math.log((t[k]+9*Math.exp(bigram[y*MOD+z]))/(b[x*MOD+y]+9));}
 return {symbols:symbols.length,unigram,bigram,trigram};
}
const model=trainModel(SHAKESPEARE.slice(0,200000));
const gpPrime=CORPUS.prime;
function offsetsForCipher(cipher,incrementsOverride=null){const offsets=new Int32Array(cipher.length);let s=0;for(let i=0;i<cipher.length;i++){offsets[i]=s;s+=incrementsOverride?incrementsOverride[i]:gpPrime[cipher[i]];}return {offsets,total:s};}
function scoreAt(cipher,splitN,offsets,start,wantPlain=false){
 let a=-1,b=-1,fit=0,hold=0;const plain=wantPlain?new Array(cipher.length):null;
 for(let i=0;i<cipher.length;i++){const p=mod(cipher[i]-(primes[start+offsets[i]]-1)%MOD);if(i===0)fit+=model.unigram[p];else if(i===1)fit+=model.bigram[b*MOD+p];else if(i<splitN)fit+=model.trigram[(a*MOD+b)*MOD+p];else hold+=model.trigram[(a*MOD+b)*MOD+p];if(plain)plain[i]=p;a=b;b=p;}
 const out={start,trainMean:fit/splitN,holdMean:hold/(cipher.length-splitN),fullMean:(fit+hold)/cipher.length};if(plain)out.plain=plain;return out;
}
function analyzeAll(cipher,splitN){const {offsets,total}=offsetsForCipher(cipher),rows=[];for(let start=0;start<=MAX_START;start++)rows.push(scoreAt(cipher,splitN,offsets,start,false));rows.sort((a,b)=>b.trainMean-a.trainMean);return {rows,offsetSum:total};}
function encrypt(plain,start){const cipher=[];let j=start;for(const p of plain){const c=mod(p+(primes[j]-1)%MOD);cipher.push(c);j+=gpPrime[c];}return cipher;}
function decode(cipher,start){const {offsets}=offsetsForCipher(cipher);return scoreAt(cipher,cipher.length,offsets,start,true).plain;}
function replay(cipher,plain,start){let j=start;for(let i=0;i<cipher.length;i++){if(mod(plain[i]+(primes[j]-1)%MOD)!==cipher[i])return false;j+=gpPrime[cipher[i]];}return true;}
function scorePlaintext(plain,splitN){let a=-1,b=-1,fit=0,hold=0;for(let i=0;i<plain.length;i++){const p=plain[i];if(i===0)fit+=model.unigram[p];else if(i===1)fit+=model.bigram[b*MOD+p];else if(i<splitN)fit+=model.trigram[(a*MOD+b)*MOD+p];else hold+=model.trigram[(a*MOD+b)*MOD+p];a=b;b=p;}return {trainMean:fit/splitN,holdMean:hold/(plain.length-splitN)};}
function xorshift(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function bestOnly(cipher,splitN,offsets){let best=null;for(let start=0;start<=MAX_START;start++){const x=scoreAt(cipher,splitN,offsets,start,false);if(!best||x.trainMean>best.trainMean)best=x;}return best;}
function run(){
 const original=analyzeAll(originalCipher,split),top=original.rows[0],plain=decode(originalCipher,top.start);
 const priorStarts=[0,14,21,52,77,78].map(start=>{const rank=original.rows.findIndex(x=>x.start===start)+1;return {start,rank,...original.rows[rank-1]};});
 const controls=controlDefs.map(def=>{const cipher=encrypt(def.plain,def.start),n=Math.floor(cipher.length*0.7),r=analyzeAll(cipher,n),truthRank=r.rows.findIndex(x=>x.start===def.start)+1,topPlain=decode(cipher,r.rows[0].start);return {name:def.name,runes:def.plain.length,split:n,trueStart:def.start,trueRank:truthRank,selectedStart:r.rows[0].start,trainMean:r.rows[0].trainMean,holdMean:r.rows[0].holdMean,exactSymbolsIfSelected:topPlain.reduce((v,x,i)=>v+(x===def.plain[i]),0),forwardReplay:replay(cipher,topPlain,r.rows[0].start)};});
 const increments=Array.from(originalCipher,x=>gpPrime[x]),rng=xorshift(SEED),nulls=[];
 for(let trial=0;trial<TRIALS;trial++){const sh=increments.slice();for(let i=sh.length-1;i>0;i--){const j=rng()%(i+1);[sh[i],sh[j]]=[sh[j],sh[i]];}const {offsets}=offsetsForCipher(originalCipher,sh);nulls.push(bestOnly(originalCipher,split,offsets));}
 const trainScores=nulls.map(x=>x.trainMean).sort((a,b)=>a-b),holdScores=nulls.map(x=>x.holdMean).sort((a,b)=>a-b);
 const trainExceed=nulls.filter(x=>x.trainMean>=top.trainMean).length,holdExceed=nulls.filter(x=>x.holdMean>=top.holdMean).length;
 const transliterate=a=>a.map(x=>CORPUS.translit[x]).join("");
 const raw=scorePlaintext(originalCipher,split);
 return {model:"Target-excluded GP29 trigram trained on Shakespeare first 200,000 characters",equation:"C=P+(prime[j]-1) mod29; j_next=j+GPprime(C); zero-based j0=0..3301; all-consuming",source:{pages:"p15-p22",allRunes:1903,redSpansExcluded:redSpans,blackBodyRunes:originalCipher.length,split:[split,originalCipher.length-split]},original:{best:top,rawCipher:raw,top10:original.rows.slice(0,10),priorStarts,plaintextPreview:transliterate(plain.slice(0,250)),holdoutPreview:transliterate(plain.slice(split)),exactForwardReplay:replay(originalCipher,plain,top.start)},controls,null:{trials:TRIALS,seed:"0x27c10c",trainExceed,trainPUpper:(trainExceed+1)/(TRIALS+1),holdoutExceed:holdExceed,holdoutPUpper:(holdExceed+1)/(TRIALS+1),trainMin:trainScores[0],trainMedian:trainScores[Math.floor(TRIALS/2)],trainMax:trainScores[TRIALS-1],holdoutMin:holdScores[0],holdoutMedian:holdScores[Math.floor(TRIALS/2)],holdoutMax:holdScores[TRIALS-1]}};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+"\n");
module.exports={run};
