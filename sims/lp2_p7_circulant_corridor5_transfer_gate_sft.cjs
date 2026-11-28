'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),MOD=29,mod=x=>((x%MOD)+MOD)%MOD;
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const signed=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const product=v=>v.reduce((a,b)=>mod(a*b),1);
const inv=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw Error('inverse');};
const circulant=row=>Array.from({length:5},(_,i)=>Array.from({length:5},(_,k)=>row[(k-i+5)%5]));
function inverse(M){const n=M.length,a=M.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));for(let c=0;c<n;c++){let p=-1;for(let r=c;r<n;r++)if(a[r][c]){p=r;break;}assert(p>=0);[a[c],a[p]]=[a[p],a[c]];const s=inv(a[c][c]);a[c]=a[c].map(x=>mod(x*s));for(let r=0;r<n;r++)if(r!==c){const f=a[r][c];a[r]=a[r].map((x,j)=>mod(x-f*a[c][j]));}}return a.map(r=>r.slice(n));}
const mv=(M,v)=>M.map(row=>row.reduce((s,x,i)=>mod(s+x*v[i]),0));
const transpose=M=>M[0].map((_,j)=>M.map(r=>r[j]));
const redWords=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const products=redWords.map(product);assert.deepEqual(products,[11,26,8,15,2]);
const M=circulant(products),Mi=inverse(M);assert.deepEqual(Mi[0],[23,2,5,2,19]);
const ops={forward:M,forwardTranspose:transpose(M),inverse:Mi,inverseTranspose:transpose(Mi)};
const specs={35:{start:25,length:5,keySum:25},39:{start:132,length:5,keySum:28}};
const receivers={};for(const pageNo of [35,39]){const p=corpus.pages.find(x=>x.page===pageNo),s=specs[pageNo];receivers[pageNo]=p.indices.slice(s.start,s.start+s.length);}
assert.deepEqual(receivers[35],[19,17,19,24,11]);assert.deepEqual(receivers[39],[19,7,10,17,23]);
const rows=[];for(const pageNo of [35,39]){const C=receivers[pageNo],cSum=C.reduce((a,b)=>mod(a+b),0),want=specs[pageNo].keySum;for(const [op,Mx] of Object.entries(ops))for(const sign of [1,-1])for(const action of ['key','plaintext']){const y=mv(Mx,C).map(x=>mod(sign*x));const predictedKeySum=action==='key'?y.reduce((a,b)=>mod(a+b),0):mod(cSum-y.reduce((a,b)=>mod(a+b),0));rows.push({page:pageNo,op,sign,action,predictedKeySum,checksumPass:predictedKeySum===want,predictedPlaintext:action==='plaintext'?y:null});}}
const p35=rows.filter(r=>r.page===35&&r.checksumPass),p39=rows.filter(r=>r.page===39&&r.checksumPass);assert.equal(p35.length,0);assert.equal(p39.length,2);assert.deepEqual(p39.map(r=>[r.op,r.sign,r.action]),[['inverse',1,'plaintext'],['inverseTranspose',1,'plaintext']]);
const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(word){const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');const out=[];for(let i=0;i<s.length;){if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}const t=tokens.find(x=>s.startsWith(x.symbol,i));assert.ok(t);out.push(t.value);i+=t.symbol.length;}return out;}
const clear=signed.split('-----BEGIN PGP SIGNATURE-----')[0];const words=clear.slice(clear.indexOf('Hello.')).split(/[^A-Za-z0-9]+/u).filter(w=>/^[A-Za-z]+$/u.test(w));const target=gp(words[39]);assert.deepEqual(target,[0,24,20,15,18]);
for(const r of p39){r.target=target;r.coordinateHits=r.predictedPlaintext.filter((x,i)=>x===target[i]).length;r.exact=r.coordinateHits===target.length;}assert.deepEqual(p39.map(r=>r.coordinateHits),[0,0]);
console.log(JSON.stringify({status:'PASS',classification:'p7/p15 cross-held-out five-lane circulant transfer rejection',p7Products:products,p7InverseFirstRow:Mi[0],receivers,checksum:{p35Survivors:p35.length,p39Survivors:p39.length,p39Conventions:p39.map(r=>({op:r.op,sign:r.sign,action:r.action,predictedKeySum:r.predictedKeySum}))},postChecksumGrade:p39.map(r=>({op:r.op,predicted:r.predictedPlaintext,target:r.target,coordinateHits:r.coordinateHits,exact:r.exact})),decision:'The independently cross-held-out p7 five-lane circulant is not a shared p35/p39 corridor decoder: p35 fails before target grading and both p39 checksum survivors miss all 5 target coordinates.'},null,2));
