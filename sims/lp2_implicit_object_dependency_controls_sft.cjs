'use strict';
/** Retrospective source-object dependency controls. No unknown-page score. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const g=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),tokens=g.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){const out=[];for(const w of (s.toUpperCase().replaceAll("QU","CW").replaceAll("V","U").replaceAll("K","C").replaceAll("Q","C").replaceAll("Z","S").match(/[A-Z]+/g)||[]))for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;}else if(w.startsWith("IO",i)){out.push(27);i+=2;}else{const [tok,k]=tokens.find(([t])=>w.startsWith(t,i));out.push(k);i+=tok.length;}}return out;}
function phi(n){let a=n;for(let p=2;p<=n;p++)if(n%p===0){a-=a/p;while(n%p===0)n/=p;}return a;}
const fns={length:a=>a.length,ordinal:a=>a.reduce((s,x)=>s+x,0),prime:a=>a.reduce((s,x)=>s+g.prime[x],0),totient:a=>a.reduce((s,x)=>s+g.prime[x]-1,0),phiSum:a=>phi(a.reduce((s,x)=>s+g.prime[x],0))};
const anchors=["MOBIUS","OBSCURA"].map(encode),checks=Object.entries(fns).map(([name,fn])=>[name,...anchors.map(fn)]);
assert.deepEqual(checks.filter(x=>x[1]===226&&x[2]===245).map(x=>x[0]),['prime']);
const mixed=[[272,138,"SHADOWS",131,151],["AETHEREAL","BUFFERS","VOID","CARNAL",18],[226,"OBSCURA","FORM",245,"MOBIUS"],[18,"ANALOG","VOID","MOURNFUL","AETHEREAL"],[151,131,"CABAL",138,272]];
const M=mixed.map(row=>row.map(x=>typeof x==="number"?x:fns.prime(encode(x))));
const target=read('resources/cicada2014-openpuff-magic-squares.txt').trim().split(/\s+/).map(Number).slice(-25);
assert.deepEqual(M.flat(),target);
assert(M.every(row=>row.reduce((a,b)=>a+b,0)===1033));
assert(M[0].every((_,i)=>M.reduce((a,row)=>a+row[i],0)===1033));
assert.equal(M.reduce((a,row,i)=>a+row[i],0),1033);assert.equal(M.reduce((a,row,i)=>a+row[4-i],0),1033);
const lines=read('resources/liber-primus/lp2-transcription.txt').split("%").at(-2).trim().split("\n"),pre=lines.slice(0,3).join(""),idx=new Map(g.runes.map((r,i)=>[r,i])),preN=[...pre].filter(x=>idx.has(x)).length;
const p=g.pages.find(x=>x.page===56).indices,first=pre.replaceAll("/","").replaceAll("\n","").split(/[.-]/).filter(Boolean).map(w=>[...w].map(x=>idx.get(x))),lens=first.slice(-2).map(x=>x.length);
assert.deepEqual([preN,...lens],[45,6,2]);assert.deepEqual(first.flat(),p.slice(0,preN));
let ps=[];for(let n=2;ps.length<p.length;n++)if(ps.every(x=>x*x>n||n%x))ps.push(n);
const cand=[];for(const x of ["HASHES","HASHED","DIGEST","CIPHER"])for(const y of ["TO","AS","IS","OF"]){const a=encode(x),b=encode(y);if(a.length===lens[0]&&b.length===lens[1])cand.push({phrase:x+" "+y,indices:[...a,...b]});}
let out=[],pref=[],tested=0;const z=p.map((x,i)=>x===0?i:-1).filter(i=>i>=0);
for(const op of ["prime","phi"])for(const sign of [1,-1])for(let mask=0;mask<1<<z.length;mask++){
 let j=0,P=[];for(let i=0;i<p.length;i++){let x=p[i];if(x===0&&((mask>>z.indexOf(i))&1)){P.push(0);continue;}let v=((x+sign*(ps[j++]-(op==="phi"?1:0)))%29+29)%29;if(v===0)break;P.push(v);}
 if(P.length>=preN){const phrase=cand.find(x=>x.indices.every((v,k)=>P[preN-x.indices.length+k]===v));if(phrase){pref.push({op,sign,mask,phrase:phrase.phrase,n:P.length,prefix:P.slice(0,preN).map(x=>g.translit[x]).join('')});if(P.length===p.length)out.push({op,sign,mask,phrase:phrase.phrase,decoded:P.map(x=>g.translit[x]).join(""),holds:z.filter((x,i)=>(mask>>i)&1)});}}
 tested++;
}
assert.equal(tested,128);assert.equal(pref.length,16);assert.equal(out.length,12);
assert(pref.every(x=>x.op==='phi'&&x.sign===-1&&x.phrase==='HASHES TO'&&x.mask%2===0&&x.prefix==='ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO'));
assert(out.some(x=>x.mask===8&&x.decoded==='ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE'));
console.log(JSON.stringify({checks,M,tested,preN,lens,anchors:cand.length,prehashPaths:pref.length,legalFull:out.length,out}));
