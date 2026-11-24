#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd();
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const dictionaryText=fs.readFileSync(path.join(root,'resources/control/english_wordfreq_textblob.txt'),'utf8');
const quadgramText=fs.readFileSync(path.join(root,'resources/control/dukotah_english_quadgrams.txt'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i])),runeSet=new Set(corpus.runes);
function parseWords(segment){const words=[];let cur=[];for(const ch of Array.from(segment)){if(runeSet.has(ch))cur.push(runeIndex.get(ch));else if(ch==='-'||ch==='.'){if(cur.length){words.push(cur);cur=[];}}}if(cur.length)words.push(cur);return words;}
function base29Integer(a){return a.reduce((n,v)=>n*29n+BigInt(v),0n);}
function modPow(a,e,m){let x=1n;a%=m;while(e>0n){if(e&1n)x=x*a%m;a=a*a%m;e>>=1n;}return x;}
function inverse29(a){for(let i=1;i<29;i++)if(a*i%29===1)return i;throw new Error('noninvertible multiplier '+a);}
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function ioc(a){const c=Array(29).fill(0);for(const v of a)c[v]++;return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function scoreWords(decoded,words,freq){let pos=0,matched=0,matched3=0,n3=0;for(const w of words){const latin=w.map(()=>decoded[pos++]).map(v=>corpus.translit[v]).join('').toLowerCase();if(latin.length>=3)n3++;if(freq.has(latin)){matched++;if(latin.length>=3)matched3++;}}assert.equal(pos,decoded.length);return {matched,total:words.length,rate:matched/words.length,matched3Plus:matched3,words3Plus:n3,rate3Plus:matched3/n3};}
function startState(seed,phase,inc,Q,P){return phase==='seed'?seed:(Q*seed+inc)%P;}
function multDecode(ciphertext,seed,map,phase,inc,Q,P){let x=startState(seed,phase,inc,Q,P),out=[];for(const c of ciphertext){if(c===0){out.push(0);continue;}const raw=map==='one-plus-mod28'?Number(x%28n):Number(x%29n),k=map==='one-plus-mod28'?raw+1:(raw===0?1:raw);out.push(c*inverse29(k)%29);x=(Q*x+inc)%P;}return out;}
function additiveFHold(ciphertext,seed,phase,inc,Q,P){let x=startState(seed,phase,inc,Q,P),consumed=0;for(let i=0;i<ciphertext.length;i++){const c=ciphertext[i];if(c===0)continue;const k=Number(x%29n),p=(c-k+29)%29;if(p===0)return {invalid:{runeIndex:i,ciphertext:c,key:k,consumed}};consumed++;x=(Q*x+inc)%P;}return {invalid:null,consumed};}
function outputText(words,seed,map,phase,inc,Q,P){let x=startState(seed,phase,inc,Q,P);const out=[];for(const w of words){let s='';for(const c of w){let v=c;if(c!==0){const raw=map==='one-plus-mod28'?Number(x%28n):Number(x%29n),k=map==='one-plus-mod28'?raw+1:(raw===0?1:raw);v=c*inverse29(k)%29;x=(Q*x+inc)%P;}s+=corpus.translit[v];}out.push(s);}return out.join(' ');}
function quadScore(text,quad){const s=text.toUpperCase().replace(/[^A-Z]/g,'');let total=0,n=0;for(let i=0;i<s.length-3;i++){total+=Math.log(quad.get(s.slice(i,i+4))||1);n++;}return {meanLog:total/n,totalLog:total,grams:n};}
function makeRng(){let state=0x3301;function next32(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}return ()=>((BigInt(next32())<<31n)|(BigInt(next32())>>1n))&((1n<<63n)-1n);}
const segments=transcription.split('%');
assert.equal(segments.length,57);
const words=segments.slice(0,54).flatMap(parseWords),ciphertext=words.flat();
const canonical=corpus.pages.filter(p=>p.page<=54).flatMap(p=>p.indices);
assert.deepEqual(ciphertext,canonical,'word-preserving transcription must match canonical p0-p54');
assert.equal(ciphertext.length,12880);assert.equal(words.length,2911);
const p55Words=parseWords(segments[54]);
assert.deepEqual(p55Words.map(w=>w.length),[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const complete=p55Words.slice(1),interior=complete.flatMap(w=>w.slice(1,-1)),shell=complete.flatMap(w=>[w[0],w[w.length-1]]);
assert.equal(interior.length,43);assert.equal(shell.length,32);
const N=base29Integer(interior),E=base29Integer(shell),P=N/8n,Q=E/43n;
assert.equal(N%8n,0n);assert.equal(E%43n,0n);
assert.equal(P.toString(),'63755441409934721069036418908763882578170591536653256311514221');
assert.equal(Q.toString(),'1268532719737981052966698570711268391040527137');
const p28Seed=modPow(Q,90n,P);
const readout='LCBPNGPARRTHBPC',tokens=[...corpus.translit].sort((a,b)=>b.length-a.length);
let at=0,readoutRunes=[];while(at<readout.length){const token=tokens.find(t=>readout.startsWith(t,at));assert(token);readoutRunes.push(corpus.translit.indexOf(token));at+=token.length;}
assert.equal(readoutRunes.length,13);
const signed2016Seed=base29Integer(readoutRunes);
assert.equal(signed2016Seed.toString(),'7144649572585460758');
const seeds=[{name:'p28-DH-Q90',value:p28Seed},{name:'signed-2016-13-rune-base29',value:signed2016Seed}];
const freq=new Map();for(const line of dictionaryText.split(/\r?\n/)){const m=line.trim().match(/^([a-z]+)\s+(\d+)$/);if(m)freq.set(m[1],Number(m[2]));}
const quad=new Map();for(const line of quadgramText.split(/\r?\n/)){const m=line.trim().match(/^([A-Z]{4})\s+(\d+)$/);if(m)quad.set(m[1],Number(m[2]));}
assert(freq.size>10000&&quad.size>10000);
const baselineWords=scoreWords(ciphertext,words,freq);
const mCGResults=[],mCGAdditive=[];
for(const seed of seeds){for(const map of ['one-plus-mod28','mod29-zero-to-identity'])for(const phase of ['seed','next']){const out=multDecode(ciphertext,seed.value,map,phase,0n,Q,P);mCGResults.push({seed:seed.name,map,phase,ioc:ioc(out),wordScore:scoreWords(out,words,freq)});}for(const phase of ['seed','next'])mCGAdditive.push({seed:seed.name,phase,...additiveFHold(ciphertext,seed.value,phase,0n,Q,P)});}
const lcgK=2n,lcgResults=[],lcgAdditive=[];
for(const map of ['one-plus-mod28','mod29-zero-to-identity'])for(const phase of ['seed','next']){const out=multDecode(ciphertext,signed2016Seed,map,phase,lcgK,Q,P);lcgResults.push({map,phase,ioc:ioc(out),wordScore:scoreWords(out,words,freq),preview:out.slice(0,120).map(v=>corpus.translit[v]).join('')});}
for(const phase of ['seed','next'])lcgAdditive.push({phase,...additiveFHold(ciphertext,signed2016Seed,phase,lcgK,Q,P)});
const observedMax={total:Math.max(...lcgResults.map(r=>r.wordScore.matched)),long:Math.max(...lcgResults.map(r=>r.wordScore.matched3Plus))};
const familyRng=makeRng(),family=[];
for(let t=0;t<500;t++){let s=familyRng();if(s===0n)s=1n;const rs=[];for(const map of ['one-plus-mod28','mod29-zero-to-identity'])for(const phase of ['seed','next']){const out=multDecode(ciphertext,s,map,phase,lcgK,Q,P);rs.push(scoreWords(out,words,freq));}family.push({total:Math.max(...rs.map(x=>x.matched)),long:Math.max(...rs.map(x=>x.matched3Plus))});}
function stats(key,observed){const a=family.map(x=>x[key]),mean=a.reduce((x,y)=>x+y,0)/a.length,sd=Math.sqrt(a.reduce((x,y)=>x+(y-mean)**2,0)/(a.length-1)),z=[...a].sort((x,y)=>x-y);return {mean,sd,p025:z[Math.floor(.025*z.length)],median:z[Math.floor(.5*z.length)],p975:z[Math.floor(.975*z.length)],upperTail:(a.filter(x=>x>=observed).length+1)/(a.length+1)};}
const familyNull={trials:family.length,variants:4,long:stats('long',observedMax.long),total:stats('total',observedMax.total)};
const candidateText=outputText(words,signed2016Seed,'one-plus-mod28','seed',lcgK,Q,P);
const baselineText=words.map(w=>w.map(v=>corpus.translit[v]).join('')).join(' ');
const p56Text=parseWords(segments[55]).map(w=>w.map(v=>corpus.translit[v]).join('')).join(' ');
const p57Text=parseWords(segments[56]).map(w=>w.map(v=>corpus.translit[v]).join(' ')).join(' ');
const candidateQuad=quadScore(candidateText,quad),baselineQuad=quadScore(baselineText,quad),p56Quad=quadScore(p56Text,quad),p57Quad=quadScore(p57Text,quad);
const quadRng=makeRng(),quadNull=[];
for(let t=0;t<1000;t++){let s=quadRng();if(s===0n)s=1n;quadNull.push(quadScore(outputText(words,s,'one-plus-mod28','seed',lcgK,Q,P),quad).meanLog);}
const qMean=quadNull.reduce((a,b)=>a+b,0)/quadNull.length,qSd=Math.sqrt(quadNull.reduce((a,b)=>a+(b-qMean)**2,0)/(quadNull.length-1)),qSorted=[...quadNull].sort((a,b)=>a-b);
const quadNullSummary={trials:quadNull.length,mean:qMean,sd:qSd,p025:qSorted[Math.floor(.025*qSorted.length)],median:qSorted[Math.floor(.5*qSorted.length)],p975:qSorted[Math.floor(.975*qSorted.length)],upperTail:(quadNull.filter(x=>x>=candidateQuad.meanLog).length+1)/(quadNull.length+1)};
console.log(JSON.stringify({
 input:{target:'p0-p54; p55 is key source and excluded',runes:ciphertext.length,wordGroups:words.length,p55CompleteWords:complete.length},
 sourceDerived:{P:P.toString(),Q:Q.toString(),p28DHSeed:p28Seed.toString(),p28SeedMod29:Number(p28Seed%29n),signed2016Readout:readout,signed2016Runes:readoutRunes,signed2016Seed:signed2016Seed.toString(),signed2016SeedMod29:Number(signed2016Seed%29n),p28DHSharedIncrement:lcgK.toString()},
 baseline:{ioc:ioc(ciphertext),wordScore:baselineWords,quadgram:baselineQuad},
 mCG:{results:mCGResults,additiveFHold:mCGAdditive},
 lCG_K2:{results:lcgResults,additiveFHold:lcgAdditive,familyWiseRandomSeedNull:familyNull,quadgram:{candidate:candidateQuad,randomSeedNull:quadNullSummary,knownP56:p56Quad,knownP57:p57Quad}},
},null,2));
