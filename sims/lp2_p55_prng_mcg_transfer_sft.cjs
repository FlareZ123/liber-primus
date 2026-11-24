#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd();
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const dictionaryText=fs.readFileSync(path.join(root,'resources/control/english_wordfreq_textblob.txt'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i])),runeSet=new Set(corpus.runes);
function parseWords(segment){const words=[];let cur=[];for(const ch of Array.from(segment)){if(runeSet.has(ch))cur.push(runeIndex.get(ch));else if(ch==='-'||ch==='.'){if(cur.length){words.push(cur);cur=[];}}}if(cur.length)words.push(cur);return words;}
function base29Integer(a){return a.reduce((n,v)=>n*29n+BigInt(v),0n);}
function modPow(a,e,m){let x=1n;a%=m;while(e>0n){if(e&1n)x=x*a%m;a=a*a%m;e>>=1n;}return x;}
function inverse29(a){for(let i=1;i<29;i++)if(a*i%29===1)return i;throw new Error('noninvertible multiplier '+a);}
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function ioc(a){const c=Array(29).fill(0);for(const v of a)c[v]++;return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function scoreWords(decoded,words,freq){let pos=0,matched=0,matched3=0,n3=0;const common=[];for(const w of words){const latin=w.map(()=>decoded[pos++]).map(v=>corpus.translit[v]).join('').toLowerCase();if(latin.length>=3)n3++;if(freq.has(latin)){matched++;if(latin.length>=3)matched3++;if(freq.get(latin)>100)common.push(latin);}}assert.equal(pos,decoded.length);return {matched,total:words.length,rate:matched/words.length,matched3Plus:matched3,words3Plus:n3,rate3Plus:matched3/n3,common:common.slice(0,80)};}
const segments=transcription.split('%');
assert.equal(segments.length,57,'expected 57 transcription segments; p50 numeric table has no rune transcription');
const words=segments.slice(0,54).flatMap(parseWords),ciphertext=words.flat();
const canonical=corpus.pages.filter(p=>p.page<=54).flatMap(p=>p.indices);
assert.deepEqual(ciphertext,canonical,'word-preserving transcription must match canonical p0-p54');
assert.equal(ciphertext.length,12880);assert.equal(words.length,2911);
const p55Words=parseWords(segments[54]);
assert.deepEqual(p55Words.map(w=>w.length),[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const complete=p55Words.slice(1),interior=complete.flatMap(w=>w.slice(1,-1)),shell=complete.flatMap(w=>[w[0],w[w.length-1]]);
assert.equal(interior.length,43);assert.equal(shell.length,32);
const N=base29Integer(interior),E=base29Integer(shell);
assert.equal(N%8n,0n);assert.equal(E%43n,0n);
const P=N/8n,Q=E/43n;
assert.equal(P.toString(),'63755441409934721069036418908763882578170591536653256311514221');
assert.equal(Q.toString(),'1268532719737981052966698570711268391040527137');
const p28Seed=modPow(Q,90n,P);
const readout='LCBPNGPARRTHBPC',tokens=[...corpus.translit].sort((a,b)=>b.length-a.length);
let at=0,readoutRunes=[];
while(at<readout.length){const token=tokens.find(t=>readout.startsWith(t,at));assert(token,'cannot parse signed-2016 readout at '+at);readoutRunes.push(corpus.translit.indexOf(token));at+=token.length;}
assert.equal(readoutRunes.length,13);
const signed2016Seed=base29Integer(readoutRunes);
assert.equal(signed2016Seed.toString(),'7144649572585460758');
const seeds=[{name:'p28-DH-Q90',value:p28Seed},{name:'signed-2016-13-rune-base29',value:signed2016Seed}];
const freq=new Map();
for(const line of dictionaryText.split(/\r?\n/)){const m=line.trim().match(/^([a-z]+)\s+(\d+)$/);if(m)freq.set(m[1],Number(m[2]));}
assert(freq.size>10000,'English word-frequency control did not load');
const baseline=scoreWords(ciphertext,words,freq);
function startState(seed,phase){return phase==='seed'?seed:(Q*seed)%P;}
function multiplicative(seed,map,phase){let state=startState(seed,phase),out=[];for(const c of ciphertext){if(c===0){out.push(0);continue;}const raw=map==='one-plus-mod28'?Number(state%28n):Number(state%29n);const k=map==='one-plus-mod28'?raw+1:(raw===0?1:raw);out.push(c*inverse29(k)%29);state=Q*state%P;}return out;}
function additiveFHold(seed,phase){let state=startState(seed,phase),consumed=0;for(let i=0;i<ciphertext.length;i++){const c=ciphertext[i];if(c===0)continue;const k=Number(state%29n),p=(c-k+29)%29;if(p===0)return {invalid:{runeIndex:i,ciphertext:c,key:k,consumed}};consumed++;state=Q*state%P;}return {invalid:null,consumed};}
const multiplicativeResults=[],additiveResults=[];
for(const seed of seeds){
 for(const map of ['one-plus-mod28','mod29-zero-to-identity'])for(const phase of ['seed','next']){
  const out=multiplicative(seed.value,map,phase);
  multiplicativeResults.push({seed:seed.name,map,phase,ioc:ioc(out),wordScore:scoreWords(out,words,freq),preview:out.slice(0,120).map(v=>corpus.translit[v]).join('')});
 }
 for(const phase of ['seed','next'])additiveResults.push({seed:seed.name,phase,...additiveFHold(seed.value,phase)});
}
const bestLong=Math.max(...multiplicativeResults.map(r=>r.wordScore.matched3Plus));
let randomState=0x3301;
function rand29(){randomState^=randomState<<13;randomState^=randomState>>>17;randomState^=randomState<<5;return (randomState>>>0)%29;}
const nullHits=[];
for(let trial=0;trial<2000;trial++){
 let hits=0;
 for(const w of words){let s='';for(let i=0;i<w.length;i++)s+=corpus.translit[rand29()];s=s.toLowerCase();if(s.length>=3&&freq.has(s))hits++;}
 nullHits.push(hits);
}
const sorted=[...nullHits].sort((a,b)=>a-b),mean=nullHits.reduce((a,b)=>a+b,0)/nullHits.length;
const sd=Math.sqrt(nullHits.reduce((a,b)=>a+(b-mean)**2,0)/(nullHits.length-1));
console.log(JSON.stringify({
 input:{target:'p0-p54; p55 is key source and excluded',runes:ciphertext.length,wordGroups:words.length,p55CompleteWords:complete.length},
 sourceDerived:{P:P.toString(),Q:Q.toString(),p28DHSeed:p28Seed.toString(),p28SeedMod29:Number(p28Seed%29n),signed2016Readout:readout,signed2016Runes:readoutRunes,signed2016Seed:signed2016Seed.toString(),signed2016SeedMod29:Number(signed2016Seed%29n),signed2016SeedGcdP:gcd(signed2016Seed,P).toString()},
 baseline:{ioc:ioc(ciphertext),wordScore:baseline},
 multiplicativeResults,
 additiveFHoldResults:additiveResults,
 deterministicUniformGP29Null:{trials:nullHits.length,mean,sd,p025:sorted[Math.floor(.025*sorted.length)],median:sorted[Math.floor(.5*sorted.length)],p975:sorted[Math.floor(.975*sorted.length)],bestObservedLongWordHits:bestLong,upperTail:(nullHits.filter(x=>x>=bestLong).length+1)/(nullHits.length+1),rngSeed:'0x3301'}
},null,2));
