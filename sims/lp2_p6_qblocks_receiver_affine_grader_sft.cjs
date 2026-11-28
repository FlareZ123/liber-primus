'use strict';

// Agent11 post-freeze grader for the 29^2 and 29^3 receiver-affine families.
// Both source-only family definitions were committed before this file.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const pages=corpus.pages;
const M=x=>((x%29)+29)%29;
const inv=Array(29).fill(0);
for(let x=1;x<29;x++)for(let y=1;y<29;y++)if(M(x*y)===1){inv[x]=y;break;}

const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(word){
 let n=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');
 const out=[];
 for(let i=0;i<n.length;){
  if(n.startsWith('ING',i)){out.push(21);i+=3;continue;}
  if(n.startsWith('IO',i)){out.push(27);i+=2;continue;}
  const t=tokens.find(x=>n.startsWith(x.symbol,i));assert.ok(t,'unmapped '+n.slice(i));out.push(t.value);i+=t.symbol.length;
 }
 return out;
}

const clear=signed.split('-----BEGIN PGP SIGNATURE-----')[0].slice(signed.indexOf('Hello.'));
const words=clear.split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/u.test(x));
assert.equal(words.length,43);
const specs=[
 {sigma:4,page:32,start:30,length:3,target:words[32],block:'q1'},
 {sigma:0,page:33,start:132,length:4,target:words[33],block:'q1'},
 {sigma:0,page:34,start:4,length:2,target:words[34],block:'q1'},
 {sigma:25,page:35,start:25,length:5,target:words[35],block:'q1'},
 {sigma:7,page:37,start:146,length:4,target:words[37],block:'q3'},
 {sigma:0,page:38,start:57,length:6,target:words[38],block:'q3'},
 {sigma:28,page:39,start:132,length:5,target:words[39],block:'q3'},
 {sigma:0,page:40,start:71,length:4,target:words[40],block:'q3'},
].map(s=>({...s,C:pages[s.page].indices.slice(s.start,s.start+s.length),P:gp(s.target)}));

function decode(a,b,d,s){
 const raw=s.C.map((x,j)=>M(a*x+b*s.C[s.length-1-j]+d*j));
 const targetSum=M(s.C.reduce((u,v)=>M(u+v),0)-s.sigma);
 const rawSum=raw.reduce((u,v)=>M(u+v),0);
 const correction=M((targetSum-rawSum)*inv[s.length]);
 const P=raw.map(x=>M(x+correction));
 assert.equal(P.reduce((u,v)=>M(u+v),0),targetSum);
 return P;
}

function grade(includePosition){
 const rows=[];
 const dValues=includePosition?Array.from({length:29},(_,i)=>i):[0];
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(const d of dValues){
  let runeHits=0,wordHits=0,q1Hits=0,q3Hits=0;
  const details=[];
  for(const s of specs){
   const got=decode(a,b,d,s);
   let hits=0;for(let j=0;j<s.length;j++)hits+=Number(got[j]===s.P[j]);
   runeHits+=hits;wordHits+=Number(hits===s.length);
   if(s.block==='q1')q1Hits+=hits;else q3Hits+=hits;
   details.push({page:s.page,target:s.target.toUpperCase(),hits,total:s.length,decoded:got});
  }
  rows.push({a,b,d,runeHits,wordHits,q1Hits,q3Hits,details});
 }
 rows.sort((x,y)=>y.runeHits-x.runeHits||y.wordHits-x.wordHits||x.a-y.a||x.b-y.b||x.d-y.d);
 const hist={};for(const row of rows)hist[row.runeHits]=(hist[row.runeHits]||0)+1;
 return {
  rows,hist,
  exactQ1:rows.filter(r=>r.q1Hits===14),
  exactQ3:rows.filter(r=>r.q3Hits===19),
  exactAll:rows.filter(r=>r.runeHits===33),
  anyWord:rows.filter(r=>r.wordHits>0),
  twoPlusWords:rows.filter(r=>r.wordHits>=2),
 };
}

const mirror=grade(false);
assert.equal(mirror.rows.length,29**2);
assert.equal(mirror.exactQ1.length,0);assert.equal(mirror.exactQ3.length,0);assert.equal(mirror.exactAll.length,0);
assert.deepEqual({a:mirror.rows[0].a,b:mirror.rows[0].b,d:mirror.rows[0].d,runeHits:mirror.rows[0].runeHits,wordHits:mirror.rows[0].wordHits},{a:24,b:23,d:0,runeHits:8,wordHits:0});
assert.equal(mirror.anyWord.length,30);

const position=grade(true);
assert.equal(position.rows.length,29**3);
assert.equal(position.exactQ1.length,0);assert.equal(position.exactQ3.length,0);assert.equal(position.exactAll.length,0);
assert.deepEqual({a:position.rows[0].a,b:position.rows[0].b,d:position.rows[0].d,runeHits:position.rows[0].runeHits,wordHits:position.rows[0].wordHits},{a:24,b:23,d:0,runeHits:8,wordHits:0});
assert.equal(position.twoPlusWords.length,1);
assert.deepEqual({a:position.twoPlusWords[0].a,b:position.twoPlusWords[0].b,d:position.twoPlusWords[0].d,runeHits:position.twoPlusWords[0].runeHits,wordHits:position.twoPlusWords[0].wordHits},{a:14,b:17,d:5,runeHits:5,wordHits:2});
assert.deepEqual(position.twoPlusWords[0].details.filter(x=>x.hits===x.total).map(x=>[x.page,x.target]),[[32,'YOU'],[34,'BE']]);

console.log(JSON.stringify({
 status:'PASS',
 mirror29Squared:{count:mirror.rows.length,max:mirror.rows[0],exactQ1:0,exactQ3:0,exactAll:0,anyWord:mirror.anyWord.length,hist:mirror.hist},
 mirrorPosition29Cubed:{count:position.rows.length,max:position.rows[0],exactQ1:0,exactQ3:0,exactAll:0,anyWord:position.anyWord.length,twoPlusWords:position.twoPlusWords, hist:position.hist},
 decision:'Neither complete q block is representable by the exhaustive direct/mirror affine family, even after one global linear position term and exact p6-companion sum correction.'
},null,2));
