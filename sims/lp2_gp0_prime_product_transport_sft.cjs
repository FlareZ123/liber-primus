'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const src=read('resources/transcriptions/lp2-image-corrected.txt');
const chart=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const A=chart.runes,P=chart.prime.map(BigInt),idx=new Map(A.map((x,i)=>[x,i]));
const groups=t=>t.match(new RegExp('['+A.join('')+']+','gu'))||[];
const digits=w=>[...w].map(c=>idx.get(c));
const value=w=>digits(w).reduce((n,x)=>n*29n+BigInt(x),0n);
const encode=n=>{let s='';do{s=A[Number(n%29n)]+s;n/=29n}while(n);return s};
const product=w=>digits(w).reduce((n,x)=>n*P[x],1n);
const factor=n=>{const f=[];if(n<=1n)return {f,rest:n};for(let i=0;i<P.length;i++)while(n%P[i]===0n){f.push(i);n/=P[i]}return {f,rest:n}};
const translit=w=>digits(w).map(i=>chart.translit[i]).join('');
const pg=src.trim().split('%');assert.equal(pg.length,57);
for(let i=0;i<pg.length;i++)assert.deepEqual(digits(groups(pg[i]).join('')),chart.pages[i+(i>=50?1:0)].indices);
const words=groups(pg.slice(0,55).join('').replace(/[\/\s]/gu,''));
assert.equal(words.length,2896);assert.equal(words.join('').length,12956);
const lex=new Map(),sections=native.sections.map(s=>({name:s.name,words:groups(s.source_text)}));
for(const s of sections)for(const w of s.words){const k=String(product(w));if(!lex.has(k))lex.set(k,new Set());lex.get(k).add(w)}
const perLength={},hits=[],failures=[];let smooth=0,nonSmooth=0,zero=0,one=0,leadingZero=0,canonicalSmooth=0,lexMatches=0,maxRun=0,run=0;
for(const [i,w] of words.entries()){
  const n=value(w),f=factor(n),leading=w.length>1&&w[0]===A[0];
  const row=perLength[w.length]??={n:0,smooth:0,nonSmooth:0,zero:0,one:0,leadingZero:0,canonicalSmooth:0};row.n++;
  if(leading){leadingZero++;row.leadingZero++}
  if(n===0n){zero++;row.zero++;run=0}
  else if(n===1n){one++;row.one++;run=0}
  else if(f.rest!==1n){nonSmooth++;row.nonSmooth++;run=0;if(failures.length<8)failures.push({i,w,value:String(n),remainder:String(f.rest)})}
  else{smooth++;row.smooth++;maxRun=Math.max(maxRun,++run);if(!leading){canonicalSmooth++;row.canonicalSmooth++}
    const candidates=[...(lex.get(String(n))||[])].map(translit);if(candidates.length)lexMatches++;
    hits.push({i,w,value:String(n),factors:f.f.map(j=>chart.translit[j]),leadingZero:leading,candidates});
  }
}
const nativeStats=sections.map(({name,words})=>{let unique=0,ambiguous=0;for(const w of words){
  const n=product(w),encoded=encode(n),f=factor(value(encoded));assert.equal(f.rest,1n);assert.deepEqual(f.f,digits(w).sort((a,b)=>a-b));assert.equal(value(encoded),n);
  if(lex.get(String(n)).size===1)unique++;else ambiguous++;
}return {name,n:words.length,unique,ambiguous}});
const collisionClasses=[...lex.entries()].filter(([k,v])=>v.size>1).map(([k,v])=>({product:k,spellings:[...v].map(translit)}));
const result={words:words.length,runes:words.join('').length,smooth,nonSmooth,zero,one,leadingZero,canonicalSmooth,lexMatches,maxRun,perLength,nativeStats,lexProducts:lex.size,lexSpellings:[...lex.values()].reduce((a,v)=>a+v.size,0),collisionClasses,failures,hits};
assert.deepEqual([smooth,nonSmooth,zero,one,leadingZero,canonicalSmooth,lexMatches,maxRun],[699,2192,1,4,116,649,20,4]);
assert.equal(nativeStats.reduce((a,b)=>a+b.n,0),740);
console.log(JSON.stringify(result,null,2));
