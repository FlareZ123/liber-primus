'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(corpus,native){
 const Q=29,D=7,mod=(x,m)=>(x%m+m)%m,range=n=>Array.from({length:n},(_,i)=>i),same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),swap=(a,i,j)=>{[a[i],a[j]]=[a[j],a[i]];return a},check=(p,msg)=>{if(!p)throw Error(msg)},counts=a=>Object.fromEntries([...new Set(a)].map(v=>[v,a.filter(x=>x===v).length]));
 const gp=s=>[...s.source_text].filter(x=>native.runes.includes(x)).map(x=>native.runes.indexOf(x));
 const src=Object.fromEntries(native.sections.map(s=>[s.name,gp(s)]));
 const primes=[];for(let x=2;primes.length<13000;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
 const primeCore=p=>{let k=0;return p.map(x=>x===0?0:mod(x+primes[k++]-1,Q))};
 const terminal56=primeCore(src.p56_an_end),terminal57=src.p57_parable;
 check(same(terminal56,corpus.pages[56].indices),"authentic p56");check(same(terminal57,corpus.pages[57].indices),"authentic p57");
 const ctx=(c,i)=>`${i%8}:${i?c[i-1]:29}`;
 function pair(c,seam){let best=null;for(let i=1;i<seam;i++)for(let j=seam;j<c.length;j++)if(ctx(c,i)===ctx(c,j)&&(!best||j-i<best[1]-best[0]||j-i===best[1]-best[0]&&i<best[0]))best=[i,j];return best}
 function A(c,obs){let f=new Map,b=new Map;for(const [i,x] of obs){let k=ctx(c,i),u=k+":"+x,v=k+":"+c[i];if(f.has(u)&&f.get(u)!==c[i]||b.has(v)&&b.get(v)!==x)return false;f.set(u,c[i]);b.set(v,x)}return true}
 function B(c,obs,d){let used=new Set,ans=null;const srcUsed=new Set(obs.map(o=>o[0]));let remSrc=range(c.length).filter(i=>!srcUsed.has(i));
 function rec(k,choices){if(k===obs.length){let remDst=range(c.length).filter(i=>!used.has(i));if(remSrc.every((x,j)=>Math.abs(x-remDst[j])<=d)){let pi=[];for(let j=0;j<obs.length;j++)pi[obs[j][0]]=choices[j];for(let j=0;j<remSrc.length;j++)pi[remSrc[j]]=remDst[j];ans=pi;return true}return false}
 let [i,x]=obs[k];for(let j=Math.max(0,i-d);j<=Math.min(c.length-1,i+d);j++)if(c[j]===x&&!used.has(j)){used.add(j);if(rec(k+1,[...choices,j]))return true;used.delete(j)}return false}
 return rec(0,[])?ans:null}
 function Bfull(c,x,d){for(let v=0;v<Q;v++){let a=range(x.length).filter(i=>x[i]===v),b=range(c.length).filter(i=>c[i]===v);if(a.length!==b.length||a.some((z,i)=>Math.abs(z-b[i])>d))return false}return true}
 const c=corpus.pages.slice(54,56).flatMap(p=>p.indices),seam=corpus.pages[54].indices.length;
 check(seam===232&&c.length===308,"geometry");const probes=pair(c,seam);check(same(probes,[219,235]),"locked cross seam pair");
 const domains=[];for(let d=0;d<=14;d++){let n={Aonly:0,Bonly:0,both:0,neither:0},example={};for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){let obs=[[probes[0],x],[probes[1],y]],a=A(c,obs),b=B(c,obs,d),k=a?b?"both":"Aonly":b?"Bonly":"neither";n[k]++;if(!example[k])example[k]={values:[x,y],...(b?{moved:b.map((j,i)=>i===j?null:[i,j]).filter(Boolean)}:{})}}domains.push({d,...n,example})}
 const x=swap(c.slice(),seam-1,seam),gates=new Set([ctx(c,seam-1),ctx(c,seam)]),v1=c[seam-1],v2=c[seam],f=(z,i,prev)=>gates.has(`${i%8}:${prev}`)&&(z===v1||z===v2)?v1+v2-z:z;
 function encodeA(x){let prev=29;return x.map((z,i)=>prev=f(z,i,prev))}
 function decodeA(c){return c.map((z,i)=>f(z,i,i?c[i-1]:29))}
 check(A(c,range(x.length).map(i=>[i,x[i]]))&&same(encodeA(x),c)&&same(decodeA(c),x),"shared two-gate witness");
 const hx=[...x,...terminal56,...terminal57],hc=[...c,...terminal56,...terminal57],ac=encodeA(hx),bx=swap(hx.slice(),seam-1,seam);check(same(ac,hc)&&same(bx,hc)&&same(decodeA(hc),hx),"authentic terminal holdout");
 const gateRows=hc.map((z,i)=>gates.has(ctx(hc,i))?[i,ctx(hc,i),hx[i],z]:null).filter(Boolean);
 const tape=corpus.pages.flatMap(p=>p.indices),start=corpus.pages.slice(0,54).reduce((s,p)=>s+p.indices.length,0);check(start%8===0,"phase align");
 const predictions=[];let off=0;for(const page of corpus.pages){for(let j=0;j<page.indices.length;j++){const i=off+j,z=tape[i],p=i?tape[i-1]:29,a=f(z,i,p),b=i===start+seam-1?v2:i===start+seam?v1:z;if(a!==b)predictions.push({page:page.page,offset:j,absolute:i,phase:i%8,previous:p,cipher:z,A_core:a,B_core:b});}off+=page.indices.length}
 function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n}}
 const shuffle=(a,r)=>{for(let i=a.length-1;i>0;i--)swap(a,i,r(i+1));return a};
 function randomA(x,seed){const r=rng(seed),rows=new Map;let prev=29;return x.map((z,i)=>{let k=`${i%8}:${prev}`;if(!rows.has(k))rows.set(k,shuffle(range(Q),r));return prev=rows.get(k)[z]})}
 function randomB(x,seed){const r=rng(seed),out=[];for(let i=0;i<x.length;i+=8)out.push(...shuffle(x.slice(i,i+8),r));return out}
 const controls=[];let index=0;for(const name of ["0_welcome","0_koan_1","0_loss_of_divinity","jpg107-167"])for(let off=0;off+308<=src[name].length;off+=308){const donor=src[name].slice(off,off+308);for(const core of ["native","prime"]){const x=core==="prime"?primeCore(donor):donor;for(const kind of ["A","Bblock","Bseam"]){let seed=0x31370000+index++;let c=kind==="A"?randomA(x,seed):kind==="Bblock"?randomB(x,seed):swap(x.slice(),231,232);const p=pair(c,seam),obs=p?p.map(i=>[i,x[i]]):[];const a=A(c,obs),b=!!B(c,obs,D),af=A(c,range(x.length).map(i=>[i,x[i]])),bf=Bfull(c,x,D);check(kind==="A"?a&&af:b&&bf,"true class failed");controls.push({name,off,core,kind,seed,pair:p,observed:obs,A:a,B:b,Afull:af,Bfull:bf})}}}
 const summary=Object.fromEntries(["A","Bblock","Bseam"].map(k=>{let a=controls.filter(t=>t.kind===k);return [k,{n:a.length,pairFound:a.filter(t=>t.pair).length,pairA:a.filter(t=>t.A).length,pairB:a.filter(t=>t.B).length,fullA:a.filter(t=>t.Afull).length,fullB:a.filter(t=>t.Bfull).length}]}));
 // Exhaustive small matching check: every 6-position permutation and all distinct two-point assignments.
 let nchecks=0;const small=[0,1,0,2,1,2];function perms(a){if(!a.length)return [[]];return a.flatMap((v,i)=>perms(a.filter((_,j)=>i!==j)).map(p=>[v,...p]))}const all=perms(range(6));
 for(let d=0;d<=3;d++){const legal=all.filter(p=>p.every((j,i)=>Math.abs(j-i)<=d));for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)for(let a=0;a<3;a++)for(let b=0;b<3;b++){const expected=legal.some(p=>small[p[i]]===a&&small[p[j]]===b),actual=!!B(small,[[i,a],[j,b]],d);check(expected===actual,"small matching oracle");nchecks++}}
 return {geometry:{seam,length:c.length,carry:c.slice(222,233),probes,probeContexts:probes.map(i=>ctx(c,i)),probeCipher:probes.map(i=>c[i]),start},domains,witness:{swap:[seam-1,seam],values:[v1,v2],gates:[...gates],gateRows,fitLength:c.length,held56:terminal56.length,held57:terminal57.length,identicalCore:hx,exactReplay:hc.length},predictions,controls,summary,nchecks}
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(study(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
