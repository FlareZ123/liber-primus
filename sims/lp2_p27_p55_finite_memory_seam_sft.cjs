'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus){
 const mod=x=>((x%29)+29)%29, page=n=>corpus.pages.find(p=>p.page===n).indices, inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero inverse")};
 const p27=page(27),p55=page(55),c=page(56),p57=page(57),primes=[];
 for(let n=2;primes.length<85;n++)if(primes.every(p=>n%p))primes.push(n);
 let q=0;const p=c.map((x,i)=>i===56?0:mod(x-primes[q++]+1));
 const literal=p.map(x=>corpus.translit[x]).join("");
 if(literal!=="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE")throw Error("native control");
 if(JSON.stringify(p27.slice(28,35))!==JSON.stringify([...p55.slice(70),c[0]]))throw Error("seam");
 function features(h,degree){const a=[1,...h];if(degree===2)for(let i=0;i<h.length;i++)for(let j=i;j<h.length;j++)a.push(mod(h[i]*h[j]));return a}
 function rows(cipher,plain,history,m,degree,clock){const h=history.slice(-m),r=[];for(let i=0;i<cipher.length;i++){const hold=plain[i]===0;if(!hold)r.push({i,x:features(h,degree),y:mod(cipher[i]-plain[i])});if(clock==="printed"||!hold){h.shift();h.push(cipher[i])}}return r}
 function solve(r,k){const piv=Array(k).fill(null);let rank=0;for(const row of r){const a=[...row.x,row.y];for(let j=0;j<k;j++){if(!a[j])continue;if(piv[j]){const v=a[j];for(let l=j;l<=k;l++)a[l]=mod(a[l]-v*piv[j][l])}else{const s=inv(a[j]);for(let l=j;l<=k;l++)a[l]=mod(a[l]*s);piv[j]=a;rank++;break}}if(a.slice(0,k).every(x=>!x)&&a[k])return {consistent:false,rank,contradictionAt:row.i}}const key=Array(k).fill(0);for(let j=k-1;j>=0;j--)if(piv[j])key[j]=mod(piv[j][k]-piv[j].slice(j+1,k).reduce((s,x,i)=>s+x*key[j+1+i],0));return {consistent:true,rank,key}}
 const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 const results=[];for(let m=1;m<=6;m++)for(const degree of [1,2])for(const clock of ["printed","consumed"]){
 const k=features(Array(m).fill(0),degree).length,r=rows(c,p,p55,m,degree,clock),train=r.filter(x=>x.i<55),fit=solve(train,k),full=solve(r,k);
 const validation=fit.consistent&&fit.rank===k?r.filter(x=>x.i>=55).map(x=>({i:x.i,actual:x.y,pred:dot(x.x,fit.key)})):null;
 const plantedKey=Array.from({length:k},(_,i)=>mod(7*i*i+3*i+5)),h=p55.slice(-m),pc=[];
 for(const x of p57){const y=x===0?0:mod(x+dot(features(h,degree),plantedKey));pc.push(y);if(clock==="printed"||x!==0){h.shift();h.push(y)}}
 const pr=rows(pc,p57,p55,m,degree,clock),pf=solve(pr,k);if(!pf.consistent||pr.some(x=>dot(x.x,pf.key)!==x.y))throw Error("plant");
 const synTrain=solve(pr.filter(x=>x.i<60),k),synHold=pr.filter(x=>x.i>=60),synCorrect=synTrain.consistent?synHold.filter(x=>dot(x.x,synTrain.key)===x.y).length:0;
 results.push({m,degree,clock,k,train:fit,full,validation,plant:{rank:pf.rank,exactKey:pf.key.every((v,i)=>v===plantedKey[i]),trainRank:synTrain.rank,holdout:synCorrect,holdoutTotal:synHold.length}})
 }
 return {knownP56:literal,holdIndex:56,seam:p27.slice(28,35),results};
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
