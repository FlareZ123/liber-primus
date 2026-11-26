/** Two-alphabet Quagmire oracle identifiability, q8, literal F holds. */
const fs=require("node:fs");
function experiment(raw,profile){
 const S="0123456789abcdefghijklmnopqrs",L="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),D=new Set(),by=Array.from({length:30},()=>[]);
 for(const l of raw.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+([0-9]+)$/);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function go(i,w){if(i===s.length){D.add(w);return}for(let j=0;j<29;j++)if(s.startsWith(L[j],i))go(i+L[j].length,w+S[j]);if(s.startsWith("ING",i))go(i+3,w+S[21])}go(0,"")}
 for(const w of D)by[w.length].push(w);by.forEach(a=>a.sort());
 const lengths=profile.p54.body_groups.slice(0,47).map(w=>w.length),heldLengths=profile.p55.groups.slice(1).map(w=>w.length),carry=profile.p54.body_groups[47].length;
 const orig=profile.p54.body_groups.join("");function stats(s){let f=0,r=0;for(let i=0;i<s.length;i++){if(s[i]==="0")f++;if(i&&s[i]===s[i-1])r++}return {f,r}}
 const target=stats(orig);if(lengths.reduce((a,b)=>a+b,0)!==213||carry!==10||target.f!==3||target.r!==2||D.size!==38910)throw Error("profile");
 function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n}}
 function perm(r,fix=false){const p=Array.from({length:29},(_,i)=>i),lo=fix?1:0;for(let i=28;i>lo;i--){const j=lo+r(i-lo+1);[p[i],p[j]]=[p[j],p[i]]}return p}
 function inv(p){const a=[];p.forEach((v,i)=>a[v]=i);return a}
 function maps(A,B,k){const I=inv(B);return k.map(t=>A.map(v=>I[(v+t)%29]))}
 function cycle(p){let x=0,n=0;do{x=p[x];n++;if(n>29)throw Error("cycle")}while(x!==0);return n===29}
 function relative(M){const I=inv(M[0]),R=M.map(m=>I.map(x=>m[x])),identity=p=>p.every((x,i)=>x===i),G=R.find(p=>!identity(p));if(!G)return false;if(!cycle(G))return false;return R.every(p=>p.every((x,i)=>G[x]===p[G[i]]))}
 function enc(w,M,j){let s="";for(const x of w){const p=S.indexOf(x);if(!p)s+="0";else{s+=S[M[j][p]];j=(j+1)%8}}return s}
 function oracleDecode(w,c,M,j){const I=M.map(inv);let s="";for(let i=0;i<w.length;i++){if(w[i]==="0"){if(c[i]!=="0")return null;s+="0"}else{const x=I[j][S.indexOf(c[i])];if(!x)return null;s+=S[x];j=(j+1)%8}}return s}
 const factorial=n=>{let f=1;while(n>1)f*=n--;return f};
 function gen(r,mode){
  const P=lengths.map(n=>by[n][r(by[n].length)]),ord=lengths.map((_,i)=>i).sort((a,b)=>lengths[b]-lengths[a]||a-b);
  for(const i of [ord[0],ord[ord.length-8]]){do{P[i]=Array.from({length:lengths[i]},()=>S[r(29)]).join("")}while(D.has(P[i]))}
  let cw;do{cw=Array.from({length:11},()=>S[r(29)]).join("")}while(D.has(cw)||by[11].some(w=>w.startsWith(cw.slice(0,10))));
  P.push(cw);const H=heldLengths.map(n=>by[n][r(by[n].length)]),A=perm(r,mode==="common"),B=mode==="common"?A:perm(r);let k;
  do{k=Array.from({length:8},()=>r(29))}while([1,2,4].some(d=>k.every((v,i)=>v===k[i%d])));
  const M=mode==="null"?Array.from({length:8},()=>perm(r)):maps(A,B,k),j=P.map(()=>r(8)),h=H.map(()=>r(8)),C=P.map((w,i)=>enc(w,M,j[i])),HC=H.map((w,i)=>enc(w,M,h[i]));
  const train=P.slice(0,-1).join("")+cw.slice(0,10),ct=C.slice(0,-1).join("")+C.at(-1).slice(0,10),s=stats(ct);
  return {P,H,A,B,k,M,j,h,C,HC,train,ct,match:s.f===target.f&&s.r===target.r}
 }
 const out=[];
 for(const [mi,mode] of ["two","common","null"].entries()){
  for(let t=0;t<8;t++){
   const seed=0x30470001+mi*4096+t,r=rng(seed);let z,tries=0;do{z=gen(r,mode);tries++}while(!z.match&&tries<250000);
   if(!z.match){out.push({mode,seed,tries,matched:false});continue}
   const {P,H,A,B,k,M,j,h,C,HC,train,ct}=z,seenA=new Set(),seenB=new Set();
   for(let i=0;i<train.length;i++)if(train[i]!=="0"){seenA.add(S.indexOf(train[i]));seenB.add(S.indexOf(ct[i]))}
   const missingA=Array.from({length:29},(_,i)=>i).filter(i=>!seenA.has(i)),missingB=Array.from({length:29},(_,i)=>i).filter(i=>!seenB.has(i)),nonF=missingA.filter(x=>x);
   let swaps=0,differing=0,lexical=0,actionOnly=0,witness=null;
   if(mode!=="null"){
    for(let ai=0;ai<missingA.length;ai++)for(let bi=ai+1;bi<missingA.length;bi++){
     const a=missingA[ai],b=missingA[bi],AA=A.slice();[AA[a],AA[b]]=[AA[b],AA[a]];
     const MM=maps(AA,B,k);
     if(!relative(MM)||P.slice(0,-1).some((w,i)=>enc(w,MM,j[i])!==C[i])||enc(P.at(-1).slice(0,10),MM,j.at(-1))!==C.at(-1).slice(0,10))throw Error("rival training");
     actionOnly++;const W=H.map((w,i)=>oracleDecode(w,HC[i],MM,h[i])),CW=oracleDecode(P.at(-1),C.at(-1),MM,j.at(-1));
     if(!CW||W.some(x=>x===null))continue;swaps++;
     if(W.some((w,i)=>enc(w,MM,h[i])!==HC[i])||enc(CW,MM,j.at(-1))!==C.at(-1))throw Error("rival held replay");
     if(CW!==P.at(-1)||W.some((w,i)=>w!==H[i])){differing++;const lex=W.every(w=>D.has(w));if(lex)lexical++;if(!witness)witness={swap:[a,b],changed:H.map((w,i)=>w!==W[i]?[i,w,W[i]]:null).filter(Boolean),carry:[P.at(-1),CW],lexical:lex}}
    }
   }
   out.push({mode,seed,tries,matched:true,relative:relative(M),missingA,missingB,nonF,actionOnly,swaps,differing,lexical,lowerBoundTraining:factorial(missingA.length),witness,truth:{A,B,k,j,h,P,H,C,HC}})
  }
 }
 return {schema:1,target,dict:D.size,geometry:{lengths,heldLengths,carry},out};
}
if(require.main===module)console.log(JSON.stringify(experiment(fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8"))),null,2));
module.exports={experiment};
