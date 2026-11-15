#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8').replace(/\r\n/g,'\n');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),B=grid.pages.flatMap(p=>p.bytes),N=C.length;
assert.equal(N,12956);assert.equal(B.length,256);assert.equal(new Set(B).size,161);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encodeWord(w){const out=[];for(let i=0;i<w.length;){if(w.startsWith('ING',i)){out.push(21);i+=3;continue;}if(w.startsWith('IO',i)){out.push(27);i+=2;continue;}const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,'unmapped '+w.slice(i));out.push(t.i);i+=t.s.length;}return out;}
function encodeNativeWords(raw){const text=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');return (text.match(/[A-Z]+/g)||[]).map(encodeWord);}
const alpha='0123456789ABCDEFGHIJKLMNOPQRS';
const vulgateWords=read('resources/control/latin-vulgate-gp-wholewords.txt').split('\n').filter(x=>/^[0-9A-S]+$/.test(x)).map(w=>w.split('').map(c=>alpha.indexOf(c)));
const sources=[
 {name:'Shakespeare',words:encodeNativeWords(read('resources/control/shakespeare_first300k.txt'))},
 {name:'Gibran',words:encodeNativeWords(read('resources/control/gibran_prophet_58585.txt'))},
 {name:'Emerson',words:encodeNativeWords(read('resources/control/emerson_essays_2944.txt'))},
 {name:'Latin Vulgate',words:vulgateWords}
];
const flatSources=sources.map(s=>({name:s.name,runes:s.words.flat()}));
const ix=new Map(gp.runes.map((r,i)=>[r,i])),rx=new RegExp('['+gp.runes.join('')+']+','gu');
const originalWords=(read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%').replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'').match(rx)||[]).map(w=>Array.from(w,c=>ix.get(c)));
const lengths=originalWords.map(w=>w.length),NWORDS=originalWords.length,uniqueLengths=[...new Set(lengths)];
assert.equal(NWORDS,2896);assert.equal(originalWords.flat().length,N);assert.equal(Math.min(...lengths),1);assert.equal(Math.max(...lengths),14);
assert.deepEqual(sources.map(s=>s.words.length),[55407,15733,77932,39835]);
const pools=sources.map(s=>{const m=new Map();for(const w of s.words){if(!m.has(w.length))m.set(w.length,[]);m.get(w.length).push(w);}for(const n of uniqueLengths)assert(m.has(n),s.name+' missing word length '+n);return {name:s.name,pools:m,wordCount:s.words.length};});
function finish(g){let pairs=0,hits=0;const top=Array(12).fill(0),sizes=[];for(const row of g.values()){const a=Array.from(row).sort((x,y)=>y-x),n=a.reduce((s,x)=>s+x,0);sizes.push(n);pairs+=n*(n-1)/2;for(const x of a)hits+=x*(x-1)/2;let z=0;for(let k=0;k<12;k++){z+=a[k];top[k]+=z;}}return {groups:g.size,pairs,hits,rate:hits/pairs,top,minGroup:Math.min(...sizes),maxGroup:Math.max(...sizes)};}
function measureRunes(xs,key){const g=new Map();for(let i=0;i<N;i++){const v=key[i%key.length];let a=g.get(v);if(!a){a=new Uint32Array(29);g.set(v,a);}a[xs[i]]++;}return finish(g);}
function measureWords(words,key){const g=new Map();for(let wi=0;wi<words.length;wi++){const v=key[wi%key.length];let a=g.get(v);if(!a){a=new Uint32Array(29);g.set(v,a);}for(const x of words[wi])a[x]++;}return finish(g);}
function windows(xs){const starts=[],step=Math.floor(N/2);for(let s=0;s+N<=xs.length;s+=step)starts.push(s);if(starts.length&&starts[starts.length-1]+N<xs.length)starts.push(xs.length-N);return starts.map(s=>xs.slice(s,s+N));}
function rng(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function plantRunes(xs,key,seed){const rnd=rng(seed),p=new Map();for(const v of new Set(key)){const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rnd()%(j+1);[a[j],a[k]]=[a[k],a[j]];}p.set(v,a);}return xs.map((x,i)=>p.get(key[i%key.length])[x]);}
function plantWords(words,key,seed){const rnd=rng(seed),p=new Map();for(const v of new Set(key)){const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rnd()%(j+1);[a[j],a[k]]=[a[k],a[j]];}p.set(v,a);}return words.map((w,i)=>w.map(x=>p.get(key[i%key.length])[x]));}
function sampleWords(pool,seed){const rnd=rng(seed);return lengths.map(L=>{const a=pool.pools.get(L);return a[rnd()%a.length];});}
function summarizeContinuous(key){const orig=measureRunes(C,key),all=[],bySource=[];let minRate=Infinity;const minTop=Array(12).fill(Infinity);for(const s of flatSources){const ms=windows(s.runes).map(w=>measureRunes(w,key));all.push(...ms);const st=Array(12).fill(Infinity);for(const m of ms){minRate=Math.min(minRate,m.rate);for(let k=0;k<12;k++){minTop[k]=Math.min(minTop[k],m.top[k]);st[k]=Math.min(st[k],m.top[k]);}}bySource.push({name:s.name,windows:ms.length,minTop:st});}const plain=flatSources[0].runes.slice(0,N),a=measureRunes(plain,key),b=measureRunes(plantRunes(plain,key,0x17c0ffee),key);return {original:orig,controlWindows:all.length,minControlRate:minRate,minControlTop:minTop,all12TopBelowControls:minTop.every((x,k)=>orig.top[k]<x),bySource,positivePlantExact:a.pairs===b.pairs&&a.hits===b.hits&&a.rate===b.rate&&JSON.stringify(a.top)===JSON.stringify(b.top)};}
function summarizeWord(key){const orig=measureWords(originalWords,key),all=[],bySource=[];let minRate=Infinity;const minTop=Array(12).fill(Infinity);for(const p of pools){const samples=[];for(let s=1;s<=500;s++)samples.push(measureWords(sampleWords(p,0x33010000+s*7919),key));all.push(...samples);const st=Array(12).fill(Infinity);for(const m of samples){minRate=Math.min(minRate,m.rate);for(let k=0;k<12;k++){minTop[k]=Math.min(minTop[k],m.top[k]);st[k]=Math.min(st[k],m.top[k]);}}bySource.push({name:p.name,samples:samples.length,minRate:Math.min(...samples.map(m=>m.rate)),minTop:st});}const plain=sampleWords(pools[0],0x17c0ffee),a=measureWords(plain,key),b=measureWords(plantWords(plain,key,0x1badb002),key);return {original:orig,controlSamples:all.length,minControlRate:minRate,minControlTop:minTop,all12TopBelowControls:minTop.every((x,k)=>orig.top[k]<x),bySource,positivePlantExact:a.pairs===b.pairs&&a.hits===b.hits&&a.rate===b.rate&&JSON.stringify(a.top)===JSON.stringify(b.top)&&a.minGroup===b.minGroup&&a.maxGroup===b.maxGroup};}
const result={originalRunes:N,originalWords:NWORDS,wordLengthClasses:uniqueLengths.length,wordLengthRange:[Math.min(...lengths),Math.max(...lengths)],p50Bytes:B.length,p50DistinctBytes:new Set(B).size,controls:sources.map(s=>({name:s.name,words:s.words.length,runes:s.words.flat().length})),continuous:{raw:summarizeContinuous(B),mod29:summarizeContinuous(B.map(x=>x%29))},wordIndexed:{raw:summarizeWord(B),mod29:summarizeWord(B.map(x=>x%29))}};
const cr=result.continuous.raw,cm=result.continuous.mod29,wr=result.wordIndexed.raw,wm=result.wordIndexed.mod29;
assert.equal(cr.original.pairs,646599);assert.equal(cr.original.hits,22339);assert(Math.abs(cr.original.rate-0.034548460483236135)<1e-15);
assert.deepEqual(cr.original.top,[1039,1944,2773,3537,4248,4927,5570,6176,6737,7260,7769,8269]);
assert.equal(cr.controlWindows,122);assert(Math.abs(cr.minControlRate-0.056999778842837676)<1e-15);
assert.deepEqual(cr.minControlTop,[1634,2938,4052,5051,5952,6775,7531,8230,8870,9460,10000,10499]);
assert(cr.all12TopBelowControls&&cr.positivePlantExact);
assert.equal(cm.original.pairs,3429119);assert.equal(cm.original.hits,117679);assert(Math.abs(cm.original.rate-0.03431756086621666)<1e-15);
assert.deepEqual(cm.original.top,[664,1291,1883,2449,2999,3538,4067,4578,5083,5575,6060,6533]);
assert.equal(cm.controlWindows,122);assert(Math.abs(cm.minControlRate-0.0577673157449479)<1e-15);
assert.deepEqual(cm.minControlTop,[1472,2593,3575,4478,5314,6103,6844,7523,8170,8762,9310,9821]);
assert(cm.all12TopBelowControls&&cm.positivePlantExact);
assert.equal(wr.original.groups,161);assert.equal(wr.original.pairs,654139);assert.equal(wr.original.hits,22494);assert(Math.abs(wr.original.rate-0.034387186821149635)<1e-15);
assert.deepEqual(wr.original.top,[1044,1927,2748,3506,4215,4888,5507,6097,6664,7202,7718,8208]);
assert.equal(wr.controlSamples,2000);assert(Math.abs(wr.minControlRate-0.05734255257674592)<1e-15);
assert.deepEqual(wr.minControlTop,[1613,2901,4045,5065,5984,6820,7589,8297,8935,9533,10060,10530]);
assert(wr.all12TopBelowControls&&wr.positivePlantExact);
assert.equal(wm.original.groups,29);assert.equal(wm.original.pairs,3433607);assert.equal(wm.original.hits,118871);assert(Math.abs(wm.original.rate-0.03461986185372991)<1e-15);
assert.deepEqual(wm.original.top,[692,1335,1947,2532,3098,3641,4169,4686,5189,5680,6166,6641]);
assert.equal(wm.controlSamples,2000);assert(Math.abs(wm.minControlRate-0.05805207177175489)<1e-15);
assert.deepEqual(wm.minControlTop,[1428,2551,3532,4453,5325,6154,6931,7662,8319,8937,9493,9979]);
assert(wm.all12TopBelowControls&&wm.positivePlantExact);
console.log(JSON.stringify(result,null,2));
