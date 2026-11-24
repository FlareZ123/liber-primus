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
const seed=modPow(Q,90n,P),freq=new Map();
for(const line of dictionaryText.split(/\r?\n/)){const m=line.trim().match(/^([a-z]+)\s+(\d+)$/);if(m)freq.set(m[1],Number(m[2]));}
assert(freq.size>10000,'English word-frequency control did not load');
const baseline=scoreWords(ciphertext,words,freq);
function startState(phase){return phase==='seed'?seed:(Q*seed)%P;}
function multiplicative(map,phase){let state=startState(phase),out=[];for(const c of ciphertext){if(c===0){out.push(0);continue;}const raw=map==='one-plus-mod28'?Number(state%28n):Number(state%29n);const k=map==='one-plus-mod28'?raw+1:(raw===0?1:raw);out.push(c*inverse29(k)%29);state=Q*state%P;}return out;}
function additiveFHold(phase){let state=startState(phase),consumed=0;for(let i=0;i<ciphertext.length;i++){const c=ciphertext[i];if(c===0)continue;const k=Number(state%29n),p=(c-k+29)%29;if(p===0)return {invalid:{runeIndex:i,ciphertext:c,key:k,consumed}};consumed++;state=Q*state%P;}return {invalid:null,consumed};}
const multiplicativeResults=[];
for(const map of ['one-plus-mod28','mod29-zero-to-identity'])for(const phase of ['seed','next']){const out=multiplicative(map,phase);multiplicativeResults.push({map,phase,ioc:ioc(out),wordScore:scoreWords(out,words,freq),preview:out.slice(0,120).map(v=>corpus.translit[v]).join('')});}
const additiveResults=['seed','next'].map(phase=>({phase,...additiveFHold(phase)}));
console.log(JSON.stringify({runes:ciphertext.length,wordGroups:words.length,P:P.toString(),Q:Q.toString(),seed:seed.toString(),seedMod29:Number(seed%29n),baseline:{ioc:ioc(ciphertext),wordScore:baseline},multiplicativeResults,additiveFHoldResults:additiveResults},null,2));
