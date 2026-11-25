'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,original=false){
 const A=41,N=160,S=80,q=29,mod=x=>((x%29)+29)%29,check=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a[0]===b[0]&&a[1]===b[1],sub=(a,b)=>[mod(a[0]-b[0]),mod(a[1]-b[1])],det=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]),inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("inverse")};
 const idx=new Map(gp.translit.map((s,i)=>[s,i])),names=["Shakespeare","Emerson","Gibran"];
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 function chunks(s){let out=[],words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]),rem=Array(L+1).fill(0);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return {L,f,b,rem}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[];
 for(let j=0;j<3;j++){const c=chunks(texts[j]);for(let i=0;i+1<c.length;i++){if(c[i].replace(/ /g,"").length>=A&&c[i+1].replace(/ /g,"").length>=N-A)pairs.push({source:names[j],stop:i+1,left:graph(c[i]),right:graph(c[i+1])})}}
 check(pairs.length===1161,"frozen pair count");
 // State holds affine-independent input/output point pairs, or the determined matrix.
 function apply(k,p){return [mod(k[0]*p[0]+k[1]*p[1]+k[4]),mod(k[2]*p[0]+k[3]*p[1]+k[5])]}
 function add(s,p,c){
   if(s.k)return eq(apply(s.k,p),c)?s:null;
   if(!s.pts.length)return {pts:[[p,c]]};
   const [p0,c0]=s.pts[0],u=sub(p,p0),v=sub(c,c0);
   if(eq(u,[0,0]))return eq(v,[0,0])?s:null;
   if(eq(v,[0,0]))return null;
   if(s.pts.length===1)return {pts:[...s.pts,[p,c]]};
   const [p1,c1]=s.pts[1],d=sub(p1,p0),e=sub(c1,c0),D=det(d,u);
   if(!D){const i=d[0]!==0?0:1,t=mod(u[i]*inv(d[i]));return eq(v,[mod(e[0]*t),mod(e[1]*t)])?s:null}
   if(!det(e,v))return null;
   const z=inv(D),a=mod((e[0]*u[1]-v[0]*d[1])*z),b=mod((v[0]*d[0]-e[0]*u[0])*z),c2=mod((e[1]*u[1]-v[1]*d[1])*z),d2=mod((v[1]*d[0]-e[1]*u[0])*z),k=[a,b,c2,d2,mod(c0[0]-a*p0[0]-b*p0[1]),mod(c0[1]-c2*p0[0]-d2*p0[1])];
   check(det([a,c2],[b,d2])!==0,"matrix singular");return {k};
 }
 const count=s=>s.k?1:s.pts.length===2?812:s.pts.length===1?840*812:841*840*812;
 function enc(P,k){let C=[];for(let i=0;i<P.length;i+=2)C.push(...apply(k,P.slice(i,i+2)));return C}
 function dec(C,k){let P=[],z=inv(mod(k[0]*k[3]-k[1]*k[2]));for(let i=0;i<C.length;i+=2){let x=mod(C[i]-k[4]),y=mod(C[i+1]-k[5]);P.push(mod(z*(k[3]*x-k[1]*y)),mod(z*(-k[2]*x+k[0]*y)))}return P}
 function scan(C){let out=[],leftPass=0,nodes=0;
  for(const pair of pairs){
   const R=[];
   function left(i,pos,s,pending){nodes++;
    if(i<0){leftPass++;const L=R.slice().reverse();right(A,0,s,L[A-1],[],L);return}
    for(const [v,np] of pair.left.b[pos]){
     let t=s,pend=pending;
     if(i!==A-1){if(i%2===1)pend=v;else{t=add(s,[v,pending],C.slice(i,i+2));if(!t)continue;pend=null}}
     R.push(v);left(i-1,np,t,pend);R.pop();
    }
   }
   function right(i,pos,s,pending,P,L){nodes++;
    if(pair.right.rem[pos]<N-i)return;
    if(i===S){out.push({pair,pos,s,plain:L.concat(P)});return}
    for(const [v,np] of pair.right.f[pos]){
     let t=s,pend=v;
     if(i%2){t=add(s,[pending,v],C.slice(i-1,i+1));if(!t)continue;pend=null}
     P.push(v);right(i+1,np,t,pend,P,L);P.pop();
    }
   }
   left(A-1,pair.left.L,{pts:[]},null);
  }
  return {out,leftPass,nodes}
 }
 function run(C,truth=null){
  const {out,leftPass,nodes}=scan(C.slice(0,S)),full=[];
  let forced=0,exact=false,correct=false;
  for(const o of out){
   if(truth&&o.pair.source===truth.source&&o.pair.stop===truth.stop&&o.plain.join()===truth.plain.slice(0,S).join()&&o.s.k?.join()===truth.k.join()){
    forced=80;exact=enc(truth.plain,o.s.k).slice(S).join()===C.slice(S).join();
   }
   const P=[];
   function right(i,pos,s,pending){if(o.pair.right.rem[pos]<N-i)return;if(i===N){let plain=o.plain.concat(P);if(s.k){check(enc(plain,s.k).join()===C.join(),"replay");check(dec(C,s.k).join()===plain.join(),"inverse")}
    if(truth&&o.pair.source===truth.source&&o.pair.stop===truth.stop&&plain.join()===truth.plain.join()&&s.k?.join()===truth.k.join())correct=true;
    full.push({source:o.pair.source,stop:o.pair.stop,plain,k:s.k??null,count:count(s)});return}
    for(const [v,np] of o.pair.right.f[pos]){let t=s,pend=v;if(i%2){t=add(s,[pending,v],C.slice(i-1,i+1));if(!t)continue;pend=null}P.push(v);right(i+1,np,t,pend);P.pop()}}
   right(S,o.pos,o.s,null);
  }
  return {leftPass,nodes,prefixPaths:out.length,prefixSources:new Set(out.map(o=>o.pair.source+":"+o.pair.stop)).size,prefixKeyCounts:out.map(o=>count(o.s)),prefixKeys:out.map(o=>o.s.k??null),fullPaths:full.length,forced,exact,correct,full}
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function spelling(g,r){let o=[],p=0;while(g.rem[p]){let t=g.f[p];if(!t.length)return [];const [v,n]=t[Math.floor(r()*t.length)];o.push(v);p=n}return o}
 const controls=[],nulls=[];
 for(let j=0;j<3;j++)for(let n=0;n<2;n++){
   const r=rng((0x270018^Math.imul(j*2+n+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]),half=Math.floor(pool.length/2),subpool=n?pool.slice(half):pool.slice(0,half);
   let pair,L,R;do{pair=subpool[Math.floor(r()*subpool.length)];L=spelling(pair.left,r);R=spelling(pair.right,r)}while(L.length<A||R.length<N-A);
   const plain=L.slice(-A).concat(R.slice(0,N-A));let k;do{k=Array.from({length:6},()=>Math.floor(r()*29))}while(!mod(k[0]*k[3]-k[1]*k[2]));
   const truth={source:pair.source,stop:pair.stop,plain,k},C=enc(plain,k);check(dec(C,k).join()===plain.join(),"control inverse");
   controls.push({truth,...run(C,truth)});nulls.push(run(Array.from({length:N},()=>Math.floor(r()*29))));
 }
 // Rank-deficient classes: all possibilities represented by the independent point constraints.
 const t1=add({pts:[]},[0,0],[3,4]),t2=add(t1,[1,0],[5,4]);check(count(t1)===682080&&count(t2)===812&&add(t2,[2,0],[7,4])===t2&&!add(t2,[2,0],[8,4])&&!add(t2,[0,1],[7,4]),"rank checks");
 const gate=controls.every(c=>c.correct&&c.exact&&c.prefixSources===1&&c.forced===80)&&nulls.every(c=>c.prefixPaths===0);
 let result=null;if(original&&gate){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"source length");result=run(U.slice(10279,10439))}
 return {pairs:pairs.length,gate,controls,nulls,original:result};
}
module.exports=attack;
if(require.main===module){const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));}
