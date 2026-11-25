'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw){
 const q=29,N=160,S=80,stop=41,mod=x=>(x%q+q)%q,check=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),inv=x=>{for(let i=1;i<q;i++)if(mod(x*i)===1)return i;throw Error("inverse")},dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 const idx=new Map(gp.translit.map((s,i)=>[s,i])),names=["Shakespeare","Emerson","Gibran"];
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 function chunks(s){let out=[],words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]),rem=Array(L+1).fill(0);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return {L,f,b,rem}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[];
 for(let j=0;j<3;j++){const c=chunks(texts[j]);for(let i=0;i+1<c.length;i++)if(c[i].replace(/ /g,"").length>=stop&&c[i+1].replace(/ /g,"").length>=N-stop)pairs.push({source:names[j],stop:i+1,left:graph(c[i]),right:graph(c[i+1])})}
 check(pairs.length===1161,"frozen pairs");
 function rank(a){a=a.map(x=>x.slice());let k=0;for(let j=0;j<a[0].length&&k<a.length;j++){let t=k;while(t<a.length&&!a[t][j])t++;if(t===a.length)continue;[a[t],a[k]]=[a[k],a[t]];const z=inv(a[k][j]);a[k]=a[k].map(x=>mod(x*z));for(let i=k+1;i<a.length;i++)if(a[i][j]){const v=a[i][j];a[i]=a[i].map((x,h)=>mod(x-v*a[k][h]))}k++}return k}
 function inverse(a){const n=a.length;let b=a.map((x,i)=>x.concat(Array.from({length:n},(_,j)=>+(i===j))));for(let j=0;j<n;j++){let t=j;while(t<n&&!b[t][j])t++;if(t===n)return null;[b[t],b[j]]=[b[j],b[t]];let z=inv(b[j][j]);b[j]=b[j].map(x=>mod(x*z));for(let i=0;i<n;i++)if(i!==j&&b[i][j]){let v=b[i][j];b[i]=b[i].map((x,h)=>mod(x-v*b[j][h]))}}return b.map(x=>x.slice(n))}
 function features(C,iv){let F=[];for(let i=0;i<C.length;i+=4)F.push(C.slice(i,i+4).concat(i?C.slice(i-4,i):iv,1));return F}
 function decrypt(F,K){return F.flatMap(f=>K.map(k=>dot(k,f)))}
 function encrypt(P,K,iv){let U=K.map(k=>k.slice(0,4)),R=inverse(U);check(R,"invertible plaintext map");let C=[];for(let i=0;i<P.length;i+=4){let prev=i?C.slice(i-4,i):iv, rhs=K.map((k,j)=>mod(P[i+j]-dot(k.slice(4),prev.concat(1))));C.push(...R.map(r=>dot(r,rhs)))}return C}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function spelling(g,r){let o=[],p=0;while(g.rem[p]){let t=g.f[p];if(!t.length)return [];const [v,n]=t[Math.floor(r()*t.length)];o.push(v);p=n}return o}
 // Known ciphertext features are independent of the hypothesized plaintext. 9 independent rows determine each output coordinate.
 function fit(C,iv,truth=null){
  let F=features(C,iv),basis=[],bi=[];
  for(let i=0;i<10;i++)if(rank(basis.concat([F[i]]))>basis.length){basis.push(F[i]);bi.push(i)}
  if(basis.length!==9)return {rank:basis.length,blocked:true};
  const R=inverse(basis),extra=Array.from({length:10},(_,i)=>i).find(i=>!bi.includes(i));
  const coef=bi.map((_,j)=>dot(F[extra],R.map(x=>x[j])));
  let rel=Array(10).fill(0);rel[extra]=1;bi.forEach((i,j)=>rel[i]=mod(-coef[j]));
  check(Array.from({length:9},(_,j)=>mod(rel.reduce((s,x,i)=>s+x*F[i][j],0))).every(x=>x===0),"left relation");
  let nodes=0,leftPaths=0,relationPass=0,invertiblePass=0,prefix=[],full=[],L=Array(stop);
  function forward(g,values,positions){for(let v of values){let next=new Set();for(let p of positions)for(let [x,n] of g.f[p])if(x===v)next.add(n);positions=next;if(!positions.size)break}return positions}
  for(const pair of pairs){
   function left(i,pos,acc){
    nodes++;
    if(i<0){
     leftPaths++;
     if(acc.some(Boolean))return;
     relationPass++;
     const K=Array.from({length:4},(_,j)=>R.map(row=>dot(row,bi.map(i=>L[4*i+j]))));
     if(rank(K.map(k=>k.slice(0,4)))!==4)return;
     invertiblePass++;
     // Prefix-only decoder uses the same frozen key, including the 41st source rune.
     const P=decrypt(F.slice(0,S/4),K);
     if(!eq(P.slice(0,stop),L))return;
     let pos80=forward(pair.right,P.slice(stop),new Set([0]));
     if(!pos80.size)return;
     let candidate={source:pair.source,stop:pair.stop,K,plainPrefix:P,positions:[...pos80]};
     prefix.push(candidate);
     const suffix=decrypt(F.slice(S/4),K),end=forward(pair.right,suffix,pos80);
     if(!end.size)return;
     let plain=P.concat(suffix);
     check(eq(encrypt(plain,K,iv),C),"original replay");
     full.push({...candidate,plain,end:[...end]});
     return;
    }
    for(let [v,np] of pair.left.b[pos]){
     const a=acc.slice();
     if(i<40)a[i%4]=mod(a[i%4]+rel[Math.floor(i/4)]*v);
     L[i]=v;left(i-1,np,a);
    }
   }
   left(stop-1,pair.left.L,[0,0,0,0]);
  }
  const unique=(xs,key)=>new Set(xs.map(key)).size;
  return {rank:9,rows:bi,extra,relation:rel,nodes,leftPaths,relationPass,invertiblePass,prefixPaths:prefix.length,prefixClasses:unique(prefix,x=>JSON.stringify([x.source,x.stop,x.K,x.plainPrefix])),fullPaths:full.length,fullClasses:unique(full,x=>JSON.stringify([x.source,x.stop,x.K,x.plain])),correct:truth?full.some(x=>x.source===truth.source&&x.stop===truth.stop&&eq(x.plain,truth.plain)&&JSON.stringify(x.K)===JSON.stringify(truth.K)):null,forced:truth&&prefix.some(x=>x.source===truth.source&&x.stop===truth.stop&&JSON.stringify(x.K)===JSON.stringify(truth.K))?80:0,full:full.slice(0,5)}
 }
 const controls=[],nulls=[];
 for(let j=0;j<3;j++)for(let n=0;n<2;n++){
  const r=rng((0x25110611^Math.imul(j*2+n+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]),half=Math.floor(pool.length/2),subpool=n?pool.slice(half):pool.slice(0,half);
  let pair,L,R;do{pair=subpool[Math.floor(r()*subpool.length)];L=spelling(pair.left,r);R=spelling(pair.right,r)}while(L.length<stop||R.length<N-stop);
  const plain=L.slice(-stop).concat(R.slice(0,N-stop));let K;do{K=Array.from({length:4},()=>Array.from({length:9},()=>Math.floor(r()*q)))}while(rank(K.map(k=>k.slice(0,4)))!==4);
  const iv=Array.from({length:4},()=>Math.floor(r()*q)),C=encrypt(plain,K,iv),truth={source:pair.source,stop:pair.stop,plain,K};
  check(eq(decrypt(features(C,iv),K),plain),"plant inverse");
  controls.push(fit(C,iv,truth));nulls.push(fit(Array.from({length:N},()=>Math.floor(r()*q)),iv))
 }
 const gate=controls.every(x=>!x.blocked&&x.correct&&x.prefixClasses===1&&x.fullClasses===1&&x.forced===80)&&nulls.every(x=>!x.blocked&&x.prefixClasses===0);
 let original=null;
 if(gate){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"source length");original=fit(U.slice(10279,10439),U.slice(10275,10279))}
 return {pairs:pairs.length,model:"P_b=U*C_b+V*C_(b-1)+w over GF29, U invertible; phase0, all consuming",controls,nulls,gate,original}
}
module.exports=attack;
if(require.main===module){const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1)),null,2));}
