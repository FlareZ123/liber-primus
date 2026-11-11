#!/usr/bin/env node
'use strict';
// Locked test: use the 2016/2017 route's prime ordinals as starts for the
// solved p56 prime-totient clock. This is not a free start-offset search.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const shakespeare=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
const MOD=29,mod=x=>((x%MOD)+MOD)%MOD;
function firstPrimes(count){const out=[];for(let n=2;out.length<count;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}if(ok)out.push(n);}return out;}
function mobius(n){if(n===0)return 0;let x=n,sign=1;for(let p=2;p*p<=x;p++)if(x%p===0){x/=p;sign=-sign;if(x%p===0)return 0;while(x%p===0)x/=p;}if(x>1)sign=-sign;return sign;}
function mobiusFSkips(cipher){return cipher.map((c,i)=>c===0&&mobius(i)===0?i:null).filter(x=>x!==null);}
const primes=firstPrimes(800);
const route=[{page:13,ordinal:431,prime:3001},{page:21,ordinal:410,prime:2819},{page:34,ordinal:376,prime:2579},{page:55,ordinal:321,prime:2131}];
for(const x of route)if(primes[x.ordinal-1]!==x.prime)throw new Error('route-prime mismatch');
function decrypt(cipher,startOrdinal,skips=[]){let j=startOrdinal-1;const skip=new Set(skips);return cipher.map((c,i)=>skip.has(i)?c:mod(c-(primes[j++]-1)));}
const DIGRAPHS={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const LETTERS={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
function encodeGP(s){s=s.toUpperCase().replace(/[^A-Z]/g,'');const out=[];for(let i=0;i<s.length;i++){const d=DIGRAPHS[s.slice(i,i+2)];if(d!==undefined){out.push(d);i++;}else out.push(LETTERS[s[i]]);}return out;}
function gpEncodeWords(s){const tokens=corpus.translit.map((glyph,index)=>({glyph,index})).sort((a,b)=>b.glyph.length-a.glyph.length);const out=[];for(const word of s.split(' '))for(let i=0;i<word.length;){const t=tokens.find(x=>word.startsWith(x.glyph,i));if(!t)throw new Error('GP token not found: '+word.slice(i));out.push(t.index);i+=t.glyph.length;}return out;}
const training=encodeGP(shakespeare.slice(0,240000));
const uni=new Uint32Array(MOD),bi=new Uint32Array(MOD*MOD),tri=new Uint32Array(MOD*MOD*MOD);
for(let i=0;i<training.length;i++){uni[training[i]]++;if(i>0)bi[training[i-1]*MOD+training[i]]++;if(i>1)tri[(training[i-2]*MOD+training[i-1])*MOD+training[i]]++;}
const logU=Array.from({length:MOD},(_,i)=>Math.log((uni[i]+1)/(training.length+MOD)));
const logB=Array.from({length:MOD*MOD},(_,i)=>{const a=Math.floor(i/MOD),b=i%MOD;return Math.log((bi[i]+12*Math.exp(logU[b]))/(uni[a]+12));});
const logT=Array.from({length:MOD*MOD*MOD},(_,i)=>{const a=Math.floor(i/(MOD*MOD)),b=Math.floor(i/MOD)%MOD,c=i%MOD;return Math.log((tri[i]+9*Math.exp(logB[b*MOD+c]))/(bi[a*MOD+b]+9));});
function score(xs){if(xs.length<3)return null;let sum=0;for(let i=2;i<xs.length;i++)sum+=logT[(xs[i-2]*MOD+xs[i-1])*MOD+xs[i]];return sum/(xs.length-2);}
function controls(length,count=800){let state=(0x321+length)>>>0;function next(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}const a=[];for(let i=0;i<count;i++){const start=next()%(training.length-length);a.push(score(training.slice(start,start+length)));}a.sort((x,y)=>x-y);return{n:count,q05:a[Math.floor(.05*(count-1))],median:a[Math.floor(.5*(count-1))],q95:a[Math.floor(.95*(count-1))],q99:a[Math.floor(.99*(count-1))]};}
const textOf=xs=>xs.map(i=>corpus.translit[i]).join('');
const physical=transcription.split('%'),words=physical[54].replace(/\/\s*/g,'').match(/[\u16A0-\u16FF]+/gu)||[];
const wordLengths=words.map(w=>[...w].length),full55=corpus.pages.find(p=>p.page===55).indices;
let cursor=0;const interiorPositions=[];for(const w of words){const n=[...w].length;for(let i=1;i<n-1;i++)interiorPositions.push(cursor+i);cursor+=n;}
const interior55=interiorPositions.map(i=>full55[i]);
if(full55.length!==76||interior55.length!==43||JSON.stringify(wordLengths)!=='[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]')throw new Error('p55 source segmentation mismatch');
const candidates=[];
for(const {page,ordinal} of route){const cipher=corpus.pages.find(p=>p.page===page).indices;for(const mode of ['none','mobiusF']){const skips=mode==='none'?[]:mobiusFSkips(cipher),plain=decrypt(cipher,ordinal,skips);candidates.push({target:'p'+page+'-full',primeOrdinal:ordinal,firstPrime:primes[ordinal-1],mode,skipPositions:skips,score:score(plain),native:controls(plain.length),decoded:textOf(plain)});}}
for(const mode of ['none','mobiusF']){const skips=mode==='none'?[]:mobiusFSkips(interior55),plain=decrypt(interior55,321,skips);candidates.push({target:'p55-interior-first',primeOrdinal:321,firstPrime:primes[320],mode,skipPositions:skips,score:score(plain),native:controls(plain.length),decoded:textOf(plain)});}
for(const mode of ['none','mobiusF']){const skips=mode==='none'?[]:mobiusFSkips(full55),fullPlain=decrypt(full55,321,skips),plain=interiorPositions.map(i=>fullPlain[i]);candidates.push({target:'p55-full-then-strip',primeOrdinal:321,firstPrime:primes[320],mode,skipPositions:skips,score:score(plain),native:controls(plain.length),decoded:textOf(plain)});}
const known='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56=corpus.pages.find(p=>p.page===56).indices,p56Positive=JSON.stringify(decrypt(p56,1,[56]))===JSON.stringify(gpEncodeWords(known));
const planted=training.slice(0,43),plantedCipher=planted.map((v,i)=>mod(v+(primes[320+i]-1)));
const p321SyntheticPositive=JSON.stringify(decrypt(plantedCipher,321,[]))===JSON.stringify(planted);
console.log(JSON.stringify({routePrimeOrdinals:route.map(x=>({page:x.page,ordinal:x.ordinal,prime:primes[x.ordinal-1]})),p55:{fullLength:full55.length,wordLengths,interiorLength:interior55.length,interiorPositions},positiveControls:{solvedP56:p56Positive,syntheticP321:p321SyntheticPositive},candidates},null,2));
if(!p56Positive||!p321SyntheticPositive)process.exitCode=1;
