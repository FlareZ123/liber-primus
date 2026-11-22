#!/usr/bin/env node
'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'), read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1=read('resources/liber-primus/lp1-plaintext-reference.txt');
const LETTER={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const DIGRAPH={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
function encode(s){s=s.toUpperCase().replace(/[^A-Z]/g,'');const out=[];for(let i=0;i<s.length;i++){const d=DIGRAPH[s.slice(i,i+2)];if(d!==undefined){out.push(d);i++;}else out.push(LETTER[s[i]]);}return out;}
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
function getSpan(spec){
 const p=ink.pages.find(x=>Number(x.page)===spec.page),s=p&&p.red_spans[spec.span];
 assert.ok(s);assert.equal(s.start,spec.start);assert.equal(s.length,spec.length);
 const runes=[...s.runes],indices=runes.map(r=>runeIndex.get(r));
 assert.equal(runes.length,spec.length);
 assert.ok(p.large_punctuation.some(m=>m[0]===spec.start+spec.length&&m[1]===13&&m[2]==='red'));
 const cp=corpus.pages.find(x=>Number(x.page)===spec.page);
 assert.deepEqual(cp.indices.slice(spec.start,spec.start+spec.length),indices);
 return {...spec,id:'p'+spec.page+'@'+spec.start,runes:s.runes,indices};
}
const unknownSpecs=[
 {page:0,span:0,start:0,length:13},{page:3,span:0,start:0,length:16},
 {page:6,span:0,start:71,length:11},{page:7,span:0,start:194,length:14},
 {page:15,span:0,start:0,length:9},{page:15,span:1,start:9,length:11},
 {page:23,span:0,start:0,length:16},{page:27,span:0,start:0,length:19},
 {page:33,span:0,start:0,length:10},{page:33,span:1,start:91,length:8},
 {page:54,span:0,start:0,length:9},{page:56,span:0,start:0,length:5}
];
const p57=getSpan({page:57,span:0,start:0,length:7});
const p53=getSpan({page:53,span:0,start:128,length:51});
const short=getSpan({page:3,span:1,start:119,length:3});
const short2=getSpan({page:39,span:0,start:119,length:3});
const unknown=unknownSpecs.map(getSpan);
assert.equal(p57.runes,'ᛈᚪᚱᚪᛒᛚᛖ');
assert.deepEqual(p57.indices,encode('PARABLE'));
const complete=[];
for(const p of ink.pages)for(let i=0;i<(p.red_spans||[]).length;i++){
 const s=p.red_spans[i],e=s.start+s.length;
 if((p.large_punctuation||[]).some(m=>m[0]===e&&m[1]===13&&m[2]==='red'))complete.push([Number(p.page),i,s.start,s.length].join(':'));
}
const expected=[...unknownSpecs,{page:57,span:0,start:0,length:7},{page:53,span:0,start:128,length:51},
 {page:3,span:1,start:119,length:3},{page:39,span:0,start:119,length:3}]
 .map(x=>[x.page,x.span,x.start,x.length].join(':')).sort();
assert.deepEqual(complete.sort(),expected);
function score(ts){
 let eq=0,total=0,max=-Infinity,top=null;const pairs=[];
 for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){
  const a=ts[i].indices,b=ts[j].indices,n=Math.min(a.length,b.length);if(n<5)continue;
  const h=Array(29).fill(0);for(let k=0;k<n;k++)h[(a[k]-b[k]+29)%29]++;
  eq+=h[0];total+=n;const e=n/29;let chi=(h[0]-e)**2/e;
  for(let d=1;d<=14;d++)chi+=(h[d]+h[29-d]-2*e)**2/(2*e);
  const row={left:ts[i].id||'control',right:ts[j].id||'control',n,equal:h[0],chi};
  pairs.push(row);if(chi>max){max=chi;top=row;}
 }
 return {titles:ts.length,pairs:pairs.length,equal:eq,positions:total,rate:eq/total,maxSym:max,top};
}
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
function rotate(a,k){return a.slice(k).concat(a.slice(0,k));}
function shuffle(a,r){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function quantile(a,p){const b=a.slice().sort((x,y)=>x-y);return b[Math.floor((b.length-1)*p)];}
function nullRun(ts,kind,seed,trials){
 const r=rng(seed),obs=score(ts);let rateTail=0,maxTail=0;const rates=[],maxes=[];
 for(let t=0;t<trials;t++){
  const sample=ts.map(x=>({...x,indices:kind==='rotation'?rotate(x.indices,Math.floor(r()*x.indices.length)):shuffle(x.indices,r)}));
  const s=score(sample);if(s.rate>=obs.rate)rateTail++;if(s.maxSym>=obs.maxSym)maxTail++;
  rates.push(s.rate);maxes.push(s.maxSym);
 }
 return {kind,trials,seed,rateUpperTailP:(rateTail+1)/(trials+1),familywiseMaxUpperTailP:(maxTail+1)/(trials+1),
  rateQ:[quantile(rates,0),quantile(rates,.05),quantile(rates,.5),quantile(rates,.95),quantile(rates,1)],
  maxQ:[quantile(maxes,0),quantile(maxes,.05),quantile(maxes,.5),quantile(maxes,.95),quantile(maxes,1)]};
}
const CONTROL=[
'A WARNING','WELCOME','WISDOM','SOME WISDOM','A KOAN','AN INSTRUCTION','THE LOSS OF DIVINITY',
'CONSUMPTION','PRESERVATION','ADHERENCE','AN END','THE PRIMES ARE SACRED','THE TOTIENT FUNCTION IS SACRED',
'ALL THINGS SHOULD BE ENCRYPTED','PROGRAM YOUR MIND','PROGRAM REALITY','KWESTION ALL THINGS',
'DISCOVER TRUTH INSIDE YOURSELF','FOLLOW YOUR TRUTH','IMPOSE NOTHING ON OTHERS',
'DO FOUR UNREASONABLE THINGS EACH DAY','WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO',
'IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE','WE MUST SHED OUR OWN CIRCUMFERENCES',
'FIND THE DIVINITY WITHIN AND EMERGE'
];
const norm=s=>s.toUpperCase().replace(/[^A-Z]/g,'');
const refNorm=norm(lp1.split(/\r?\n/).filter(x=>!x.startsWith('#')).join(' '));
const pool=CONTROL.map(s=>{assert.ok(refNorm.includes(norm(s)),s);return {text:s,indices:encode(s)};}).filter(x=>x.indices.length>=5);
function controls(shared,seed,trials,obsRate){
 const r=rng(seed),lengths=unknown.map(x=>x.length).concat([p57.indices.length]),rates=[],maxes=[];let le=0,ge=0;
 for(let t=0;t<trials;t++){
  const plain=lengths.map((L,i)=>{
   if(i===lengths.length-1)return p57.indices.slice();
   const options=pool.filter(x=>x.indices.length>=L),h=options[Math.floor(r()*options.length)],start=Math.floor(r()*(h.indices.length-L+1));
   return h.indices.slice(start,start+L);
  });
  const key=Array.from({length:Math.max(...lengths)},()=>Math.floor(r()*29));
  const cipher=plain.map(a=>{const k=shared?key:Array.from({length:a.length},()=>Math.floor(r()*29));return {indices:a.map((v,i)=>(v+k[i])%29)};});
  const s=score(cipher);rates.push(s.rate);maxes.push(s.maxSym);if(s.rate<=obsRate)le++;if(s.rate>=obsRate)ge++;
 }
 return {trials,seed,rateQ:[quantile(rates,0),quantile(rates,.05),quantile(rates,.5),quantile(rates,.95),quantile(rates,1)],
  maxQ:[quantile(maxes,0),quantile(maxes,.05),quantile(maxes,.5),quantile(maxes,.95),quantile(maxes,1)],
  rateLEObserved:le,rateLEObservedP:(le+1)/(trials+1),rateGEObserved:ge,rateGEObservedP:(ge+1)/(trials+1)};
}
const unknownOnly=score(unknown), observed=score([...unknown,p57]), p53Sensitivity=score([...unknown,p53,p57]);
const rotations=nullRun([...unknown,p57],'rotation',3552026,2000), permutations=nullRun([...unknown,p57],'permutation',3552026,2000);
const referenceBody=lp1.split(/\r?\n/).filter(x=>!x.startsWith('#')).join(' '), reference=encode(referenceBody);
assert.equal(reference.length,3473);
const counts=Array(29).fill(0);for(const x of reference)counts[x]++;
const collision=counts.reduce((s,n)=>s+(n/reference.length)**2,0);
const shared=controls(true,3555520,1000,observed.rate), independent=controls(false,3555521,1000,observed.rate);
const output={
 rule:'D_ij(k)=(C_i(k)-C_j(k)) mod 29 at zero phase; minimum overlap 5; no phase/offset scan.',
 unknownTitles:unknown.map(({page,start,length,runes})=>({page,start,length,runes})),
 p57Control:{runes:p57.runes,plaintext:'PARABLE',exact:true},
 excludedShortTags:[short,short2].map(({page,start,length,runes})=>({page,start,length,runes})),
 p53Sensitivity:{page:p53.page,start:p53.start,length:p53.length,result:p53Sensitivity},
 unknownOnly,includingP57:observed,
 englishReference:{symbols:reference.length,collision,uniform:1/29},
 nulls:{rotations,permutations},
 controls:{sharedPad:shared,independentPads:independent}
};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
