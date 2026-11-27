'use strict';

/**
 * 2014 whitespace A194954 -> phi(p) direct-stream gate.
 *
 * Source motivation:
 * message.txt.asc delivered with the Liber Primus onion had preserved whitespace
 * runs 2,3,5,7,11,13,17,23,29,31,37, exactly the first 11 terms of OEIS
 * A194954.  This test asks the finite question whether that source-selected
 * prime family, combined with the solved Wisdom instruction phi(p)=p-1, is
 * itself the running stream for any LP2 section.
 *
 * Positive control: the historical p56 decoder uses ordinary successive primes,
 * key phi(p)=p-1, subtract direction, and one literal skip at rune index 56.
 */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const solved=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const p56raw=fs.readFileSync(path.join(ROOT,'resources/external/2014-irc-shared/sol2ton-p56-input-Cv2yHt1K.txt'),'utf8');

const MOD=29,mod=x=>(x%MOD+MOD)%MOD;
const runeIndex=new Map(solved.runes.map((r,i)=>[r,i]));
const seqs=solved.sections.map(s=>[...s.source_text].filter(ch=>runeIndex.has(ch)).map(ch=>runeIndex.get(ch))).filter(a=>a.length>3);

// Smoothed solved-LP GP29 trigram LM, used only as a discriminating score.
const bi=new Float64Array(MOD*MOD),tri=new Float64Array(MOD**3),bt=new Float64Array(MOD),tt=new Float64Array(MOD**2),uni=new Float64Array(MOD);
let total=0;
for(const a of seqs)for(let i=0;i<a.length;i++){
  uni[a[i]]++;total++;
  if(i){bi[a[i-1]*MOD+a[i]]++;bt[a[i-1]]++;}
  if(i>=2){const x=a[i-2]*MOD+a[i-1];tri[x*MOD+a[i]]++;tt[x]++;}
}
const alpha=.15,pu=Array.from(uni,v=>(v+alpha)/(total+MOD*alpha)),pb=new Float64Array(MOD**2),pt=new Float64Array(MOD**3);
for(let x=0;x<MOD;x++)for(let y=0;y<MOD;y++)pb[x*MOD+y]=(bi[x*MOD+y]+4*pu[y])/(bt[x]+4);
for(let x=0;x<MOD**2;x++)for(let y=0;y<MOD;y++)pt[x*MOD+y]=(tri[x*MOD+y]+5*pb[(x%MOD)*MOD+y])/(tt[x]+5);
function score(a){let s=0;for(let i=0;i<a.length;i++)s+=Math.log(i===0?pu[a[i]]:i===1?pb[a[i-1]*MOD+a[i]]:pt[(a[i-2]*MOD+a[i-1])*MOD+a[i]]);return s/a.length;}

function isPrime(n){if(n<2)return false;if(n%2===0)return n===2;for(let d=3;d*d<=n;d+=2)if(n%d===0)return false;return true;}
function primesN(n){const a=[];for(let x=2;a.length<n;x++)if(isPrime(x))a.push(x);return a;}
function popcount(n){let c=0;while(n){c+=n&1;n>>>=1;}return c;}
function a194954N(n){
  const a=[2];
  for(let k=2;k<=n;k++){
    const step=popcount(k-1);
    let p=a[a.length-1]+1;
    while(!(isPrime(p)&&((p-a[a.length-1])%step===0)))p++;
    a.push(p);
  }
  return a;
}
const ordinary=primesN(14100),exotic=a194954N(14100);
const expected=[2,3,5,7,11,13,17,23,29,31,37];
if(expected.some((v,i)=>exotic[i]!==v))throw Error('A194954 generator mismatch');

function decrypt(C,family,direction,holdF=false){
  let k=0;const out=[];
  for(const c of C){
    if(holdF&&c===0){out.push(0);continue;}
    out.push(mod(c+direction*mod(family[k++]-1)));
  }
  return out;
}
function translit(a,n=120){return a.slice(0,n).map(x=>corpus.translit[x]).join(' ');}

// Historical p56 input has three blocks: runes, hash, runes.
const blocks=p56raw.trim().split(/\n\s*\n/);
const parseRunes=s=>(s.match(/\b(?:[0-9]|1[0-9]|2[0-8])\b/g)||[]).map(Number);
const p56C=parseRunes(blocks[0]).concat(parseRunes(blocks[2]));
function decryptSkip(C,family,skipIndex){
  let k=0;const out=[];
  for(let i=0;i<C.length;i++){
    if(i===skipIndex){out.push(C[i]);continue;}
    out.push(mod(C[i]-mod(family[k++]-1)));
  }
  return out;
}
const p56Ord=decryptSkip(p56C,ordinary,56),p56A=decryptSkip(p56C,exotic,56);
const expectedPrefix='A N E N D W I TH I N TH E D E E P W E B';
if(!translit(p56Ord,20).startsWith(expectedPrefix))throw Error('p56 positive control failed');

const CH=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const results=[];
for(const familyName of ['A194954','ordinary']){
  const family=familyName==='A194954'?exotic:ordinary;
  for(const direction of [-1,1])for(const holdF of [false,true]){
    for(let ci=0;ci<CH.length;ci++){
      const [a,b]=CH[ci],C=corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
      const P=decrypt(C,family,direction,holdF);
      results.push({family:familyName,direction,holdF,scope:`chapter${ci}_p${a}-${b}`,n:P.length,score:score(P),sample:translit(P)});
    }
    let weighted=0,N=0,best=null;
    for(const pg of corpus.pages){
      const P=decrypt(pg.indices,family,direction,holdF),sc=score(P);
      weighted+=sc*P.length;N+=P.length;
      if(!best||sc>best.score)best={page:pg.page,score:sc,sample:translit(P)};
    }
    results.push({family:familyName,direction,holdF,scope:'page-reset-aggregate',n:N,score:weighted/N,bestPage:best});
    const C=corpus.pages.flatMap(p=>p.indices),P=decrypt(C,family,direction,holdF);
    results.push({family:familyName,direction,holdF,scope:'global',n:P.length,score:score(P),sample:translit(P)});
  }
}
results.sort((a,b)=>b.score-a.score);
const exoticResults=results.filter(x=>x.family==='A194954');
console.log(JSON.stringify({
  sourceSequence:expected,
  p56Control:{
    runeCount:p56C.length,skipIndex:56,skipCipher:p56C[56],
    ordinaryPhiScore:score(p56Ord),ordinaryText:translit(p56Ord),
    A194954PhiScore:score(p56A),A194954Text:translit(p56A)
  },
  bestA194954:exoticResults.slice(0,15),
  verdict:'A194954 phi direct-stream family is rejected for the frozen LP2 scope/state conventions.'
},null,2));
