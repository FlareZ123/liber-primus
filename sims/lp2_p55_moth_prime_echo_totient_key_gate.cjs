#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const mod29=(x)=>((x%29)+29)%29;
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const reference=read('resources/liber-primus/lp1-plaintext-reference.txt');
const source=read('resources/historical/cicada2013-os-original-prime-echo.sh');
const primes=[...source.matchAll(/echo\s*(?:-n\s*)?"(\d+)\t";\s*sleep/g)].map(m=>+m[1]);
assert.equal(primes.length,464);assert.equal(primes[173],1033);assert.equal(primes[174],1039);assert.equal(primes[463],3301);
assert.match(reference,/THE PRIMES ARE SACRED/);
assert.match(reference,/THE TOTIENT FUNCTION IS SACRED\s+ALL THINGS SHOULD BE ENCRYPTED/);
const tokens=corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
function encode(word){const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');const out=[];for(let i=0;i<s.length;){const t=tokens.find(x=>s.startsWith(x.token,i));assert.ok(t);out.push(t.index);i+=t.token.length;}return out;}
const phrase='THE TOTIENT FUNCTION IS SACRED ALL THINGS',words=phrase.split(' '),plain=words.flatMap(encode);
const p55=corpus.pages.find(p=>p.page===55).indices;assert.equal(p55.length,76);
const cipher=p55.slice(46);assert.equal(cipher.length,30);assert.equal(plain.length,30);
assert.deepEqual(words.map(w=>encode(w).length),[2,7,7,2,6,3,3]);
const plainF=plain.flatMap((r,i)=>r===0?[i]:[]),cipherF=cipher.flatMap((r,i)=>r===0?[i]:[]);
assert.deepEqual(plainF,[9]);assert.deepEqual(cipherF,[]);
const required=cipher.map((c,i)=>mod29(c-plain[i]));
function scan(block,keyFn){let best=-1,starts=[],exact=[];for(let s=0;s<block.length;s++){let n=0;for(let i=0;i<30;i++)if(mod29(keyFn(block[(s+i)%block.length]))===required[i])n++;if(n>best){best=n;starts=[s];}else if(n===best)starts.push(s);if(n===30)exact.push(s);}return {period:block.length,phasesTested:block.length,exactMatches:exact,bestMatches:best,bestStarts:starts.map(s=>({start:s,firstPrime:block[s],lastPrime:block[(s+29)%block.length],matches:best}))};}
const blocks={full464:primes,first174:primes.slice(0,174),tail290:primes.slice(174)};
const totient=Object.fromEntries(Object.entries(blocks).map(([n,b])=>[n,scan(b,p=>p-1)]));
const primeValue=Object.fromEntries(Object.entries(blocks).map(([n,b])=>[n,scan(b,p=>p)]));
assert.deepEqual(totient,{
 full464:{period:464,phasesTested:464,exactMatches:[],bestMatches:5,bestStarts:[{start:44,firstPrime:197,lastPrime:373,matches:5},{start:71,firstPrime:359,lastPrime:547,matches:5},{start:264,firstPrime:1697,lastPrime:1931,matches:5}]},
 first174:{period:174,phasesTested:174,exactMatches:[],bestMatches:5,bestStarts:[{start:44,firstPrime:197,lastPrime:373,matches:5},{start:71,firstPrime:359,lastPrime:547,matches:5}]},
 tail290:{period:290,phasesTested:290,exactMatches:[],bestMatches:5,bestStarts:[{start:90,firstPrime:1697,lastPrime:1931,matches:5}]}
});
assert.deepEqual(primeValue,{
 full464:{period:464,phasesTested:464,exactMatches:[],bestMatches:5,bestStarts:[{start:60,firstPrime:283,lastPrime:463,matches:5},{start:122,firstPrime:677,lastPrime:881,matches:5}]},
 first174:{period:174,phasesTested:174,exactMatches:[],bestMatches:5,bestStarts:[{start:60,firstPrime:283,lastPrime:463,matches:5},{start:122,firstPrime:677,lastPrime:881,matches:5}]},
 tail290:{period:290,phasesTested:290,exactMatches:[],bestMatches:4,bestStarts:[{start:53,firstPrime:1439,lastPrime:1621,matches:4},{start:110,firstPrime:1867,lastPrime:2083,matches:4},{start:133,firstPrime:2029,lastPrime:2269,matches:4},{start:159,firstPrime:2243,lastPrime:2447,matches:4},{start:261,firstPrime:3041,lastPrime:1039,matches:4}]}
});
console.log(JSON.stringify({source:{count:primes.length,firstBlock:[primes[0],primes[173]],tailBlock:[primes[174],primes[463]]},crib:{phrase,gp:plain.map(i=>corpus.translit[i]).join(''),wordLengths:words.map(w=>encode(w).length),plainF,cipherF},cipherSuffix:cipher.map(i=>corpus.translit[i]).join(''),requiredPad:required,phasesTestedPerKeyFunction:928,primeValue,totient},null,2));
