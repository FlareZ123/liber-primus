'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,allowOriginal=true){
 const A=41,S=80,N=160,K=5,Q=29,T=gp.translit,idx=new Map(T.map((s,i)=>[s,i]));
 const check=(x,m)=>{if(!x)throw Error(m)};
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 const names=["Shakespeare","Emerson","Gibran"],texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")];
 function chunks(s){const out=[];let words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}const rem=Array(L+1).fill(0);for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return{s,L,f,b,rem}}
 const pairs=[];for(let j=0;j<3;j++){const cs=chunks(texts[j]);for(let i=0;i+1<cs.length;i++){const l=cs[i],r=cs[i+1];if(l.replace(/ /g,"").length>=A&&r.replace(/ /g,"").length>=N-A)pairs.push({source:names[j],stop:i+1,left:graph(l),right:graph(r)})}}
 function witness(P,C,k){
  const E=Array.from({length:Q},()=>Array(Q).fill(0)),rd=Array(Q).fill(k),cd=Array(Q).fill(k);
  for(let i=0;i<P.length;i++){const p=P[i],c=C[i];if(!p){check(!c,"F");continue}if(!E[p][c]){E[p][c]=1;rd[p]--;cd[c]--}}
  check(rd.every(x=>x>=0)&&cd.every(x=>x>=0),"degree");
  let j=0;for(let p=0;p<Q;p++)while(rd[p]){while(!cd[j])j++;const d=Math.min(rd[p],cd[j]);E[p][j]+=d;rd[p]-=d;cd[j]-=d}
  const bank=[];for(let h=0;h<k;h++){const mt=Array(Q).fill(-1);function augment(p,seen){for(let c=0;c<Q;c++)if(E[p][c]&&!seen[c]){seen[c]=1;if(mt[c]<0||augment(mt[c],seen)){mt[c]=p;return true}}return false}
   for(let p=0;p<Q;p++)check(augment(p,new Uint8Array(Q)),"regular matching");
   const pi=Array(Q);for(let c=0;c<Q;c++){pi[mt[c]]=c;E[mt[c]][c]--}bank.push(pi)}
  const schedule=P.map((p,i)=>p?bank.findIndex(pi=>pi[p]===C[i]):-1);
  check(P.every((p,i)=>p?bank[schedule[i]][p]===C[i]&&bank[schedule[i]].indexOf(C[i])===p:C[i]===0),"exact inverse");
  return {bank,schedule};
 }
 function scan(C,k,truth=null){
  const E=new Uint8Array(Q*Q),rd=new Uint8Array(Q),cd=new Uint8Array(Q),P=new Uint8Array(N);
  const counts={leftPaths:0,prefixPaths:0,fullPaths:0,degreePrunes:0,FPrunes:0,nodes:0};
  const prefixSources=new Set(),fullSources=new Set(),samples=[];let recovered=false;
  function add(p,c){if(!p)return c===0?0:-1;const id=p*Q+c;if(E[id])return 0;if(rd[p]===k||cd[c]===k)return -2;E[id]=1;rd[p]++;cd[c]++;return 1}
  function undo(p,c,added){if(added===1){E[p*Q+c]=0;rd[p]--;cd[c]--}}
  function options(opts,i,rec){counts.nodes++;for(const [p,np] of opts){const z=add(p,C[i]);if(z<0){if(z===-1)counts.FPrunes++;else counts.degreePrunes++;continue}P[i]=p;rec(np);undo(p,C[i],z)}}
  for(const pair of pairs){
   const id=pair.source+":"+pair.stop;
   function right(i,pos){if(i===N){counts.fullPaths++;fullSources.add(id);const plain=Array.from(P);if(truth&&id===truth.id&&plain.join()===truth.plain.join())recovered=true;if(samples.length<4)samples.push({id,plain,render:plain.map(v=>T[v]).join(""),end:pos,...witness(plain,C,k)});return}
    if(pair.right.rem[pos]<N-i)return;
    if(i===S){counts.prefixPaths++;prefixSources.add(id)}
    options(pair.right.f[pos],i,np=>right(i+1,np));
   }
   function left(i,pos){if(i<0){counts.leftPaths++;right(A,0);return}options(pair.left.b[pos],i,np=>left(i-1,np))}
   left(A-1,pair.left.L);
  }
  check(rd.every(x=>!x)&&cd.every(x=>!x)&&E.every(x=>!x),"backtrack cleanup");
  return {...counts,prefixSources:prefixSources.size,fullSources:fullSources.size,fullSourceIds:[...fullSources].slice(0,30),samples,recovered:truth?recovered:null};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function spell(g,r){let p=0;const out=[],splits=[];while(g.rem[p]){const a=g.f[p];check(a.length,"spell");const [v,np]=a[Math.floor(r()*a.length)];if(a.length>1&&T[v].length===1)splits.push(out.length);out.push(v);p=np}return {out,splits}}
 const controls=[],nulls=[];
 for(let j=0;j<3;j++)for(let n=0;n<2;n++){
  const r=rng((0x7a5b2c12^Math.imul(2*j+n+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]);let pair,L,R;
  for(let tries=0;tries<10000;tries++){pair=pool[Math.floor(r()*pool.length)];L=spell(pair.left,r);R=spell(pair.right,r);if(L.out.length>=A&&R.out.length>=N-A&&(L.splits.some(i=>i>=L.out.length-A)||R.splits.some(i=>i<N-A)))break}
  check(L.out.length>=A&&R.out.length>=N-A,"control");
  const plain=L.out.slice(-A).concat(R.out.slice(0,N-A)),id=pair.source+":"+pair.stop;
  const bank=Array.from({length:K},()=>shuffle(Array.from({length:Q},(_,i)=>i),r));let prev=-1;
  const C=plain.map(p=>{let c=p?bank[Math.floor(r()*K)][p]:0;if(p&&c===prev)c=bank[Math.floor(r()*K)][p];prev=c;return c});
  const result=scan(C,K,{id,plain});controls.push({id,...result,samples:result.samples.map(({id,render})=>({id,render}))});
  const pad=plain.map(p=>p?Math.floor(r()*Q):0);const nr=scan(pad,K);nulls.push({id,...nr,samples:nr.samples.map(({id,render})=>({id,render}))});
 }
 const gate={recovered:controls.filter(x=>x.recovered).length,uniqueSource:controls.filter(x=>x.fullSources===1).length,falseFull:nulls.filter(x=>x.fullPaths).length};gate.pass=gate.recovered===6&&gate.falseFull===0;
 let original=null;if(allowOriginal&&gate.pass){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"source size");const C=U.slice(10279,10439);original=scan(C,K)}
 return {method:{target:"p42–43 [10279,10439)",split:S,stop:A,length:N,k:K,sources:names,pairs:pairs.length},gate,controls,nulls,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));
