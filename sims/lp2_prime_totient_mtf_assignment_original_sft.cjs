'use strict';
// Source-constrained prime-totient / MTF assignment inversion. Node 22 CJS.
// SFT: node sims/lp2_prime_totient_mtf_assignment_original_sft.cjs
const fs=require('node:fs'), path=require('node:path');
function experiment(g, donor, lp) {
  const gp=JSON.parse(g), pages=gp.pages.slice(0,56), c=pages.flatMap(p=>p.indices), n=c.length;
  const mod=x=>(x%29+29)%29, id=Array.from({length:29},(_,i)=>i);
  const requireCheck=(value,message)=>{if(!value)throw Error(message)};
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const tr=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  /** @param {string} s @returns {number[]} */
  function encode(s){
    const arr=[];
    for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
      for(let i=0;i<w.length;){
        const t=w.startsWith("ING",i)?{i:21,s:"ING"}:w.startsWith("IO",i)?{i:27,s:"IO"}:tr.find(t=>w.startsWith(t.s,i));
        requireCheck(t,"unmapped "+w); arr.push(t.i); i+=t.s.length;
      }
    }
    return arr;
  }
  const native=encode(donor.slice(donor.indexOf("Almustafa"),donor.indexOf("*** END OF")));
  const lp1=encode(lp.split("### 56\n")[0].replace(/^\[[^\n]*\]$/gm,""));
  requireCheck(eq(encode(lp.split("### 57\n")[1]),gp.pages[57].indices),"p57 source-native control");
  requireCheck(n===12956&&native.length===46834,"source counts");
  const pri=[];
  for(let x=2;pri.length<n;x++){
    let yes=true;
    for(let y=2;y*y<=x;y++)if(x%y===0){yes=false;break}
    if(yes)pri.push(mod(x-1));
  }
  // Authenticate the known p56 primitive, including its actual clear-F branch.
  const p56=encode("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE");
  let j=0;
  const replay56=p56.map(x=>x===0?0:mod(x+pri[j++]));
  requireCheck(eq(replay56,gp.pages[56].indices),"p56 authentic encryption");
  /** @param {number[]} a */
  const hist=a=>{const h=Array(29).fill(0);for(const x of a)h[x]++;return h};
  const ioc=a=>hist(a).reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
  const metrics=a=>({n:a.length,max:Math.max(...hist(a)),ioc:ioc(a),E:hist(a)[18]});
  const offsets=[0];for(const p of pages)offsets.push(offsets.at(-1)+p.indices.length);
  const train=offsets[40],end=offsets[54];
  const chapter=[0,3,8,15,23,28,33,40,54,56].map(x=>offsets[x]);
  const regimes=[["book",[0,n]],["chapter",chapter],["page",offsets]];
  const spans=b=>b.slice(1).map((hi,i)=>[b[i],hi]).filter(([lo,hi])=>hi>lo);
  /** @param {number[]} bounds */
  function clocks(bounds){
    return {k:spans(bounds).flatMap(([lo,hi])=>pri.slice(0,hi-lo)),reset:new Set(bounds)};
  }
  /** @param {number[]} a @param {boolean} decode @param {number[]} pi @param {Set<number>} reset */
  function mtf(a,decode,pi,reset){
    let L=pi.slice();const out=[];
    for(let i=0;i<a.length;i++){
      if(reset.has(i))L=pi.slice();
      const j=decode?a[i]:L.indexOf(a[i]);
      requireCheck(j>=0&&j<29,"rank");
      const v=L[j];out.push(decode?v:j);L.splice(j,1);L.unshift(v);
    }
    return out;
  }
  /** Maximum weight perfect assignment, Hungarian algorithm. @param {number[][]} w */
  function hung(w){
    const n=w.length,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();
    for(let i=1;i<=n;i++){
      p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
      do{
        used[j0]=true;const i0=p[j0];let d=Infinity,j1=0;
        for(let j=1;j<=n;j++)if(!used[j]){
          const cur=-w[i0-1][j-1]-u[i0]-v[j];
          if(cur<minv[j]){minv[j]=cur;way[j]=j0}
          if(minv[j]<d){d=minv[j];j1=j}
        }
        for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=d;v[j]-=d}else minv[j]-=d}
        j0=j1;
      }while(p[j0]!==0);
      do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0);
    }
    const a=Array(n);for(let j=1;j<=n;j++)a[p[j]-1]=j-1;return a;
  }
  const tiny=[[2,3,1],[5,0,2],[3,4,1]];
  const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  const value=(w,pi)=>pi.reduce((s,x,j)=>s+w[j][x],0);
  requireCheck(value(tiny,hung(tiny))===Math.max(...perms.map(p=>value(tiny,p))),"assignment brute control");
  const prior=hist(lp1).map(x=>Math.log((x+1)/(lp1.length+29)));
  const indicator=id.map(x=>+(x===18));
  /** @param {number[]} a @param {number[]} k @param {number} l @param {number} h @param {number[]} score */
  function solve(a,k,l,h,score){
    const w=id.map(()=>id.map(()=>0));
    for(let i=l;i<h;i++)for(const x of id)w[a[i]][x]+=score[mod(x-k[i])];
    const pi=hung(w);
    return {pi,value:value(w,pi)};
  }
  /** @param {number} n @param {number} m */
  function iocCeiling(n,m){
    const q=Math.floor(n/m),r=n-q*m;
    return (q*m*(m-1)+r*(r-1))/(n*(n-1));
  }
  const known=native.slice(10000,10000+n),secret=id.map(i=>mod(7*i+3));
  [secret[0],secret[9]]=[secret[9],secret[0]]; // explicitly non-affine secret
  const controls=[0,10000,25000].map(start=>({start,full:metrics(native.slice(start,start+n)),holdout:metrics(native.slice(start+train,start+end))}));
  /** @param {number[]} cipher @param {number[]} bounds @param {boolean} plant */
  function analyze(cipher,bounds,plant){
    const {k,reset}=clocks(bounds),a=mtf(cipher,true,id,reset);
    const fit=solve(a,k,0,train,prior),p=a.map((x,i)=>mod(fit.pi[x]-k[i]));
    requireCheck(eq(mtf(p.map((x,i)=>mod(x+k[i])),false,fit.pi,reset),cipher),"A full reencryption");
    if(plant)requireCheck(eq(fit.pi,secret)&&eq(p,known),"blind true alphabet and full native recovery");
    const ranges=[[0,n],[0,train],[train,end]];
    const shared=ranges.map(([lo,hi])=>{
      const m=solve(a,k,lo,hi,indicator).value;
      return {n:hi-lo,maxAnyRune:m,iocCeiling:iocCeiling(hi-lo,m)};
    });
    // B: MTF before the prime shift. An arbitrary starting list only relabels
    // the abstract MTF output. Its within-reset histograms are fixed.
    const d=cipher.map((x,i)=>mod(x-k[i])),other=mtf(d,true,id,reset);
    requireCheck(eq(mtf(other,false,id,reset).map((x,i)=>mod(x+k[i])),cipher),"B full reencryption");
    const privateA=spans(bounds).map(([lo,hi])=>{
      const m=solve(a,k,lo,hi,indicator).value;
      return {lo,hi,m,iocCeiling:iocCeiling(hi-lo,m)};
    });
    const privateB=spans(bounds).map(([lo,hi])=>Math.max(...hist(other.slice(lo,hi))));
    const mA=privateA.reduce((s,x)=>s+x.m,0),mB=privateB.reduce((s,x)=>s+x,0);
    return {fit:fit.pi,full:metrics(p),train:metrics(p.slice(0,train)),holdout:metrics(p.slice(train,end)),shared,
      alternateFull:metrics(other),alternateHoldout:metrics(other.slice(train,end)),
      privateA:{maxAnyRune:mA,iocCeiling:iocCeiling(n,mA),segments:privateA},
      privateB:{maxAnyRune:mB,iocCeiling:iocCeiling(n,mB)},
      prefix:p.slice(0,80).map(i=>gp.translit[i]).join(""),plantRecovered:plant||undefined};
  }
  const results=regimes.map(([name,bounds])=>{
    const {k,reset}=clocks(bounds);
    const plant=mtf(known.map((x,i)=>mod(x+k[i])),false,secret,reset);
    const original=analyze(c,bounds,false),positive=analyze(plant,bounds,true);
    const otherPlant=mtf(known,false,secret,reset).map((x,i)=>mod(x+k[i]));
    const abstract=mtf(otherPlant.map((x,i)=>mod(x-k[i])),true,id,reset);
    requireCheck(eq(abstract.map(x=>secret[x]),known),"B unknown-alphabet relabel positive");
    return {name,original,positive};
  });
  return {n,train,end,authenticP56Replay:true,authenticP57Encoding:true,controls,results};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
const data=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));
console.log(JSON.stringify(experiment(...data),null,2));
