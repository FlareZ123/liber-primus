'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/cicada2012-blake-marriage-gutenberg45315.txt"];
function run(inputs){
 const check=(b,m)=>{if(!b)throw Error(m)}; const corpus=JSON.parse(inputs[0]),source=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),N=source.length;check(N===12956,"length");
 const tokens=corpus.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
 function gp(s){s=s.toUpperCase().replaceAll("V","U").replaceAll("K","C");let o=[];for(let i=0;i<s.length;){let t=tokens.find(t=>s.startsWith(t[0],i));if(t){o.push(t[1]);i+=t[0].length}else i++}return o}
 const a=gp(inputs.slice(1,4).join("\n")),b=gp(inputs[4].slice(inputs[4].indexOf("THE ARGUMENT"),inputs[4].indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));check(a.length===21611&&b.length===18631,"donors");
 const donors=[a.slice(0,N),a.slice(4327,4327+N),a.slice(8655,8655+N),b.slice(0,N),b.slice(5675,5675+N)];
 function perms(x){return x.length?x.flatMap((v,i)=>perms(x.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]]}
 const orders=perms([0,1,2,3]),identity=orders[0];
 function packet(x,p){let out=x.slice();for(let i=0;i+3<x.length;i+=4)for(let j=0;j<4;j++)out[i+p[j]]=x[i+j];return out}
 function hist(x,spans){let h=Array.from({length:64},()=>new Int32Array(Math.ceil(x.length/4)+1));for(let [s,e] of spans){let n=e-s,by=Array.from({length:29},()=>[]);for(let i=0;i<n;i++)by[x[s+i]].push(i);for(let v of by){for(let j=0;j<v.length;j++){let y=v[j],yb=y>>2,yt=(y&3)+(y>=n-(n%4)?4:0);for(let k=0;k<j;k++){let z=v[k],zt=(z&3)+(z>=n-(n%4)?4:0);h[zt*8+yt][yb-(z>>2)]++}}}}return h}
 function counts(h,p,max){let d=new Int32Array(N+4),o=new Int32Array(max+1);let r=[...p,0,1,2,3];for(let a=0;a<8;a++)for(let b=0;b<8;b++){let row=h[a*8+b];for(let j=0;j<row.length;j++)if(row[j]){let lag=Math.abs(4*j+r[b]-r[a]);check(lag>0,"zero lag");d[lag]+=row[j]}}for(let q=1;q<=max;q++)for(let j=q;j<d.length;j+=q)o[q]+=d[j];return o}
 function direct(x,q,spans,p){let sum=0;for(let [s,e] of spans){let v=packet(x.slice(s,e),p),c=new Int32Array(29*q);for(let i=0;i<v.length;i++){let k=29*(i%q)+v[i];sum+=c[k]++}}return sum}
 const cuts=[0,729,1874,3603,5506,6761,7960,9640,12648,12956],chapter=cuts.slice(1).map((v,i)=>[cuts[i],v]);
 let results=[];
 for(let [name,spans,max] of [["global",[[0,N]],3301],["chapter",chapter,1033]]){
   let orig=counts(hist(source,spans),identity,max),checks=0,failures=0,min=Infinity,closest=null;
   for(let d=0;d<donors.length;d++){let h=hist(donors[d],spans);for(let p of orders){let v=counts(h,p,max);for(let q=1;q<=max;q++){let gap=v[q]-orig[q];checks++;if(gap<=0)failures++;if(gap<min){min=gap;closest={q,donor:d,p,original:orig[q],donorPairs:v[q]}}}for(let q of [1,7,Math.min(840,max),max])check(v[q]===direct(donors[d],q,spans,p),"lag/direct");}}
   check(orig[840]===(name==="global"?3277:267),"anchor");
   results.push({name,max,checks,failures,min,closest});
 }
 const truth=[2,0,3,1],key=[1,12,7,19,4,25,11],train=donors[0].slice(0,729),test=donors[1].slice(729,1874);
 const encrypt=(x)=>packet(x,truth).map((v,i)=>(v+key[i%key.length])%29),ct=encrypt(train),hold=encrypt(test);
 let matches=[];for(let p of orders){let v=packet(train,p);for(let q=1;q<=20;q++){let k=Array(q).fill(-1),ok=true;for(let i=0;i<v.length;i++){let shift=(ct[i]-v[i]+29)%29,j=i%q;if(k[j]===-1)k[j]=shift;else if(k[j]!==shift){ok=false;break}}if(ok)matches.push({p,q,k})}}
 let minq=Math.min(...matches.map(x=>x.q)),minimal=matches.filter(x=>x.q===minq);check(minimal.length===1,"plant minimal uniqueness");let m=minimal[0];check(JSON.stringify(m.p)===JSON.stringify(truth)&&JSON.stringify(m.k)===JSON.stringify(key),"plant parameters");let predicted=packet(test,m.p).map((v,i)=>(v+m.k[i%m.q])%29);check(predicted.every((v,i)=>v===hold[i]),"heldout");
 let inv=Array(4);m.p.forEach((v,i)=>inv[v]=i);let recovered=packet(hold.map((v,i)=>(v-m.k[i%m.q]+29)%29),inv);check(recovered.every((v,i)=>v===test[i]),"inverse");
 return {results,positive:{train:train.length,holdout:test.length,matched:matches.map(x=>({p:x.p,q:x.q})),order:m.p,period:m.q,exact:recovered.length}};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));
