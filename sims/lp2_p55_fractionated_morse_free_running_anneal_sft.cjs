"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(gp,gibran,emerson,shakespeare){
 const letters=[".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-","-.--","--.."];
 const book=[];for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)if(a+b+c!==6)book.push([a,b,c]);
 const ix=new Map(book.map((v,i)=>[v.join(""),i]));
 const lmap=new Int8Array(32).fill(-1);
 for(let i=0;i<26;i++){let x=1;for(let c of letters[i])x=2*x+Number(c==="-");lmap[x]=i}
 const A=27,B=A*A,C=B*A,D=C*A;
 const norm=t=>t.toUpperCase().replace(/[^A-Z]+/g," ").trim();
 const ch=c=>c===" "?26:c.charCodeAt(0)-65;
 const c1=new Float64Array(A).fill(.25),c2=new Float64Array(B),c3=new Float64Array(C),c4=new Float64Array(D),z2=new Float64Array(A),z3=new Float64Array(B),z4=new Float64Array(C);
 for(const t0 of [emerson,shakespeare]){
  const t=norm(t0);
  let a=26,b=26,c=26;
  for(let i=0;i<t.length;i++){
   let d=ch(t[i]);c1[d]++;
   if(i){c2[c*A+d]++;z2[c]++}
   if(i>1){let k=b*A+c;c3[k*A+d]++;z3[k]++}
   if(i>2){let k=(a*A+b)*A+c;c4[k*A+d]++;z4[k]++}
   a=b;b=c;c=d;
  }
 }
 const sum=c1.reduce((a,b)=>a+b,0);
 for(let i=0;i<A;i++)c1[i]/=sum;
 for(let i=0;i<B;i++)c2[i]=(c2[i]+5*c1[i%A])/(z2[Math.floor(i/A)]+5);
 for(let i=0;i<C;i++)c3[i]=(c3[i]+5*c2[i%B])/(z3[Math.floor(i/A)]+5);
 for(let i=0;i<D;i++)c4[i]=Math.log((c4[i]+5*c3[i%C])/(z4[Math.floor(i/A)]+5));
 let rng=3301;
 function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296}
 function ri(n){return Math.floor(rand()*n)}
 function shuffle(){let a=Array.from({length:26},(_,i)=>i);for(let i=25;i;i--){let j=ri(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const ASCII="ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
 function evaluate(t,key,details=false){
  let state=C-1,score=0,bits=1,len=0,xs=0,valid=0,invalid=0,preview="",first=true;
  for(let i=0;i<=3*t.length;i++){
   const last=i===3*t.length;
   const c=last?2:book[key[t[Math.floor(i/3)]]][i%3];
   if(c!==2){xs=0;len++;if(len<=4)bits=bits*2+c;continue}
   if(len){
    let p=len<=4?lmap[bits]:-1;
    if(p>=0){score+=c4[state*A+p];state=(state%B)*A+p;valid++;if(details)preview+=ASCII[p]}
    else{if((!first&&!last)||len>4){score-=12+2*Math.max(0,len-4);invalid++}state=C-1;if(details)preview+="?"}
    first=false;bits=1;len=0;xs=1;
   }else if(!last){
    xs++;
    if(xs===2&&!first){score+=c4[state*A+26];state=(state%B)*A+26;if(details)preview+=" "}
    if(xs>=3){score-=12;invalid++}
   }
  }
  return details?{score,valid,invalid,preview}:score
 }
 function hunt(t,runs,steps,seed=null){
  let best=null;
  for(let r=0;r<runs;r++){
   let k=r===0&&seed?seed.slice():r%4===0&&best?best.key.slice():shuffle();
   if(r&&r%4===0)for(let j=0;j<5;j++){let a=ri(26),b=ri(26);[k[a],k[b]]=[k[b],k[a]]}
   let sc=evaluate(t,k);
   for(let i=0;i<steps;i++){
    let a=ri(26),b=ri(25);if(b>=a)b++;
    [k[a],k[b]]=[k[b],k[a]];let v=evaluate(t,k),temp=7*Math.pow(.025/7,i/(steps-1));
    if(v>=sc||rand()<Math.exp((v-sc)/temp))sc=v;else [k[a],k[b]]=[k[b],k[a]];
    if(!best||sc>best.score)best={score:sc,key:k.slice()};
   }
  }
  return {...evaluate(t,best.key,true),key:best.key}
 }
 const raw=gp.pages.find(p=>p.page===55).indices,types=[...new Set(raw)].sort((a,b)=>a-b),t=raw.map(v=>types.indexOf(v));
 const grammarStrings=["xx.","x.x","-x.",".-.","x-x","xx-",".x.","-xx","-x-","-..","...",".--","x..",".-x","x--",".x-","x-.","--x",".xx","---","-.x","..-","--.","..x","x.-"];
 const grammar=grammarStrings.map(s=>ix.get(s.replace(/\./g,"0").replace(/-/g,"1").replace(/x/g,"2")));
 grammar.push(Array.from({length:26},(_,i)=>i).find(i=>!grammar.includes(i)));
 const trits=norm(gibran).split(" ").map(w=>Array.from(w,c=>letters[c.charCodeAt(0)-65]).join("x")).join("xx").replace(/\./g,"0").replace(/-/g,"1").replace(/x/g,"2");
 const controls=[];
 const runs=40,steps=45000;
 for(let start of [25000,65000,115000]){
  let cs=null,at=-1;
  for(let i=start;i+228<=trits.length;i++){
   let a=Array.from({length:76},(_,j)=>ix.get(trits.slice(i+3*j,i+3*j+3)));
   if(new Set(a).size===25){cs=a;at=i;break}
  }
  if(!cs)throw Error("control");
  const k=shuffle(),inv=Array(26);for(let j=0;j<26;j++)inv[k[j]]=j;
  const ct=cs.map(x=>inv[x]),truth=evaluate(ct,k,true),found=hunt(ct,runs,steps);
  controls.push({at,truth,found,correct:[...new Set(ct)].filter(x=>found.key[x]===k[x]).length,trueKey:k});
 }
 return {runs,steps,types,controls,originalGrammarSeed:evaluate(t,grammar,true),original:hunt(t,runs,steps,grammar)}
}
const f=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"].map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));console.log(JSON.stringify(run(JSON.parse(f[0]),f[1],f[2],f[3]),null,2));
