"use strict";
/** Agent9: cyclic sparse filter exact periodic recurrence; read-only SFT. */
const fs=require("node:fs"),path=require("node:path");
function experiment(input){
 const [cj,nj]=input,c=JSON.parse(cj),native=JSON.parse(nj),idx=new Map(c.runes.map((v,i)=>[v,i]));
 const mod=x=>(x%29+29)%29,check=(v,m)=>{if(!v)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),inv=x=>{x=mod(x);for(let j=1;j<29;j++)if(x*j%29===1)return j;throw Error("singular")};
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 /** @param {number[]} c @param {{k:number,a:number,b:number}} key */
 const decode=(c,{k,a,b})=>c.map((v,i)=>mod(v+a*c[(i-k+c.length)%c.length]+b*c[(i+k)%c.length]));
 // Along each k-cycle, solve the periodic recurrence for the unknown ciphertext.
 function transition(n,{k,a,b}){
  const d=gcd(n,k),m=n/d;
  if(!b){let q=1;for(let i=0;i<m;i++)q=mod(-a*q);return {d,m,b,det:mod(1-q)};}
  const bi=inv(b);
  function propagate(x,y){for(let i=0;i<m;i++)[x,y]=[y,mod((-y-a*x)*bi)];return [x,y]}
  const [u,w]=propagate(1,0),[v,z]=propagate(0,1),mat=[mod(1-u),mod(-v),mod(-w),mod(1-z)];
  return {d,m,b,bi,mat,det:mod(mat[0]*mat[3]-mat[1]*mat[2])};
 }
 function encode(p,key){const n=p.length,{k,a,b}=key,tr=transition(n,key);if(!tr.det)return null;const out=Array(n);
  for(let s=0;s<tr.d;s++){
   const pos=Array.from({length:tr.m},(_,j)=>(s+j*k)%n),q=pos.map(i=>p[i]);
   if(!b){let f=0;for(const v of q)f=mod(v-a*f);let x=mod(f*inv(tr.det));for(let j=0;j<q.length;j++){x=mod(q[j]-a*x);out[pos[j]]=x;}}
   else {let x=0,y=0;for(const v of q)[x,y]=[y,mod((v-y-a*x)*tr.bi)];const [A,B,C,D]=tr.mat,id=inv(tr.det);[x,y]=[mod(id*(D*x-B*y)),mod(id*(A*y-C*x))];for(let j=0;j<q.length;j++){out[pos[j]]=y;[x,y]=[y,mod((q[j]-y-a*x)*tr.bi)];}}
  }
  check(same(decode(out,key),p),"exact inverse replay");return out;
 }
 const groups=native.sections.map(s=>({name:s.name,values:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 const train=groups.filter(s=>!["0_koan_1","0_loss_of_divinity","p56_an_end","p57_parable"].includes(s.name));
 const two=new Map(),three=new Map();for(const {values:a} of train)for(let i=2;i<a.length;i++){const b=29*a[i-2]+a[i-1],t=29*b+a[i];two.set(b,(two.get(b)||0)+1);three.set(t,(three.get(t)||0)+1);}
 function score(p){let s=0;for(let i=2;i<p.length;i++){const b=29*p[i-2]+p[i-1],t=29*b+p[i];s+=Math.log(((three.get(t)||0)+1)/((two.get(b)||0)+29));}return s/(p.length-2);}
 const a=c.pages.filter(p=>p.page<=2).flatMap(p=>p.indices),b=c.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices);
 check(a.length===729&&b.length===308,"frozen chapter lengths");
 const keys=[];for(const k of [8,13])for(let a=0;a<29;a++)for(let b=0;b<29;b++){if(k===13&&!a&&!b)continue;keys.push({k,a,b});}
 const legal=keys.filter(key=>transition(a.length,key).det&&transition(b.length,key).det);
 function search(ct){return legal.map(key=>({key,score:score(decode(ct,key))})).sort((a,b)=>b.score-a.score);}
 const keyeq=(x,y)=>x.k===y.k&&x.a===y.a&&x.b===y.b;
 const donors=groups.filter(s=>["0_koan_1","0_loss_of_divinity"].includes(s.name));check(donors.length===2,"two held-out donors");
 let seed=3301;function next(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
 const controls=[];for(const [i,{name,values}] of donors.entries())for(const n of [729,308]){
  const p=values.slice(i*5,i*5+n);check(p.length===n,"length-matched donor");const trueKey=legal[next()%legal.length],ct=encode(p,trueKey),fit=search(ct),best=fit[0],decoded=decode(ct,best.key);
  check(same(encode(decoded,best.key),ct),"fitted replay");
  const random=p.map(()=>next()%29),nullFit=search(random);
  controls.push({name,n,trueKey,best,rank:fit.findIndex(x=>keyeq(x.key,trueKey))+1,correct:decoded.filter((x,i)=>x===p[i]).length,nativeScore:score(p),runnerUp:fit[1],nullBest:nullFit[0]});
 }
 const calibration=controls.every(x=>x.rank===1&&x.correct===x.n&&x.best.score>x.nullBest.score);
 const orig=calibration?(()=>{const fit=search(a),best=fit[0],p=decode(a,best.key),q=decode(b,best.key);check(same(encode(p,best.key),a)&&same(encode(q,best.key),b),"both original exact replay");const spell=v=>v.map(i=>c.translit[i]).join(" ");return {best,fitTop10:fit.slice(0,10),heldoutScore:score(q),trainIdentityScore:score(a),holdoutIdentityScore:score(b),fitPlain:p,heldoutPlain:q,fitPrefix:spell(p.slice(0,80)),heldoutPrefix:spell(q.slice(0,80)),allScores:fit};})():null;
 return {trainingRunes:train.reduce((s,x)=>s+x.values.length,0),trainingSections:train.map(x=>x.name),family:{unique:keys.length,legalBothLengths:legal.length,legal729:keys.filter(k=>transition(729,k).det).length,legal308:keys.filter(k=>transition(308,k).det).length},controls,calibration,original:orig};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
