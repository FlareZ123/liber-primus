#!/usr/bin/env node
'use strict';
// Distribution-level smearing bound for independent additive GP29 streams.
// Not a deterministic impossibility theorem for a fixed key/text pair.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const sha256=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
const corpusText=read('resources/liber-primus/lp2-corpus.json');
const controlText=read('resources/control/shakespeare_first300k.txt');
const corpus=JSON.parse(corpusText);
const DIGRAPHS={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const LETTERS={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
function encodeEnglish(text){const s=text.toUpperCase().replace(/[^A-Z]/g,'');const out=[];for(let i=0;i<s.length;i++){const pair=DIGRAPHS[s.slice(i,i+2)];if(pair!==undefined){out.push(pair);i++;}else out.push(LETTERS[s[i]]);}return out;}
const pages=corpus.pages.filter(p=>p.page<=55);assert.equal(pages.length,56);
let runes=0,transitions=0,repeats=0;const cipherDeltaCounts=Array(29).fill(0);
for(const page of pages){runes+=page.indices.length;for(let i=1;i<page.indices.length;i++){const d=(page.indices[i]-page.indices[i-1]+29)%29;cipherDeltaCounts[d]++;transitions++;if(d===0)repeats++;}}
assert.equal(runes,12956);assert.equal(transitions,12901);assert.equal(repeats,86);
const symbols=encodeEnglish(controlText),deltas=new Uint8Array(symbols.length-1);
for(let i=1;i<symbols.length;i++)deltas[i-1]=(symbols[i]-symbols[i-1]+29)%29;
const deltaCounts=Array(29).fill(0);for(const d of deltas)deltaCounts[d]++;
let rareDelta=0;for(let d=1;d<29;d++)if(deltaCounts[d]<deltaCounts[rareDelta])rareDelta=d;
const N=transitions,windowCount=deltas.length-N+1;assert.ok(windowCount>0);
const counts=Array(29).fill(0);for(let i=0;i<N;i++)counts[deltas[i]]++;
const mins=new Uint16Array(windowCount);let windowsAtOrBelowCipherRate=0;
for(let start=0;start<windowCount;start++){let m=counts[0];for(let d=1;d<29;d++)if(counts[d]<m)m=counts[d];mins[start]=m;if(m/N<=repeats/transitions)windowsAtOrBelowCipherRate++;if(start+1<windowCount){counts[deltas[start]]--;counts[deltas[start+N]]++;}}
const sorted=Array.from(mins).sort((a,b)=>a-b),q=p=>sorted[Math.floor(p*(sorted.length-1))];
const minWindow=sorted[0],minFull=deltaCounts[rareDelta];
assert.equal(symbols.length,216874);assert.equal(deltas.length,216873);assert.equal(minFull,3778);assert.equal(rareDelta,18);assert.equal(windowCount,203973);assert.equal(minWindow,168);assert.equal(windowsAtOrBelowCipherRate,0);
const pmin=minFull/deltas.length;
const output={
 inputs:{corpus:'resources/liber-primus/lp2-corpus.json',corpusSha256:sha256(corpusText),control:'resources/control/shakespeare_first300k.txt',controlSha256:sha256(controlText)},
 ciphertext:{pages:pages.length,runes,withinPageTransitions:transitions,adjacentRepeats:repeats,repeatRate:repeats/transitions,deltaCounts:cipherDeltaCounts},
 englishControl:{gp29Symbols:symbols.length,deltaTransitions:deltas.length,deltaCounts,minimumDeltaResidue:rareDelta,minimumDeltaCount:minFull,minimumDeltaRate:pmin},
 exhaustiveMatchedWindows:{transitionsPerWindow:N,contiguousWindows:windowCount,minimumBucketCount:minWindow,minimumBucketRate:minWindow/N,quantileMinimumBucketCounts:{p01:q(.01),p05:q(.05),median:q(.5),p95:q(.95),maximum:sorted.at(-1)},windowsAtOrBelowCipherRepeatRate},
 bound:{formula:'Pr(DeltaC=0)=sum_d Pr(DeltaP=d)Pr(DeltaK=-d) >= min_d Pr(DeltaP=d)',minimumExpectedRepeatsFromFullControl:N*pmin,worstWindowRateOverObserved:(minWindow/N)/(repeats/transitions),caveat:'Distribution-level bound for a common stationary DeltaK law independent of DeltaP; not deterministic for every fixed key/text pair.'}
};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
