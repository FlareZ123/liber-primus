"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function run(raw,original=false){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29,m28=x=>(x%28+28)%28,L=6;
 const orig=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices),split=gp.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0),N=orig.length;
 assert(N===12956&&split===9640,"scope");
 const page=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices.map(()=>p.page));
 const primes=[];for(let x=2;primes.length<N+30;x++){let yes=true;for(let d=2;d*d<=x;d++)if(x%d===0){yes=false;break}if(yes)primes.push(x)}
 const pow=Array.from({length:28},(_,z)=>{let p=1;for(let i=0;i<z;i++)p=p*15%29;return p}),log=Array(29).fill(-1);pow.forEach((x,z)=>log[x]=z);assert(new Set(pow).size===28,"root");
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function shuffled(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){let j=R()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function native(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));assert(q,"spelling");o.push(q.i);j+=q.t.length}return o}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length)}
 const donors=[gold.sections.flatMap(s=>Array.from(s.source_text).filter(c=>ix.has(c)).map(c=>ix.get(c))),...raw.slice(2).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).flatMap(native))];
 function enc(P,S){const inv=Array(28);S.forEach((r,z)=>inv[r]=z);let prev=0,t=0;return P.map(p=>{let E=primes[t]%29,K=(primes[t]-1)%28;if(p===E){t=prev;return prev}let rank=p-Number(p>E),c=mod(prev+pow[m28(inv[rank]+K)]);prev=c;t++;return c})}
 function dec(C,S){let prev=0,t=0;return C.map(c=>{let D=mod(c-prev),E=primes[t]%29,K=(primes[t]-1)%28;prev=c;if(!D){t=c;return E}let r=S[m28(log[D]-K)];t++;return r+Number(r>=E)})}
 function events(C){const out=[[],[]];for(let e=L+1;e+L<C.length;e++){if(C[e]!==C[e-1]||page[e-L-1]!==page[e+L])continue;let ok=true;for(let j=1;j<=L;j++)if(C[e+j]===C[e+j-1]||C[e-1-j]===C[e-j]){ok=false;break}if(ok)out[e<split?0:1].push(e)}return out}
 const E0=events(orig),counts=E0.map(x=>x.length),eq=orig.slice(1).filter((v,i)=>v===orig[i]).length;assert(eq===86,"equality count");
 function score(C,ev){const a=Array(28).fill(0),b=Array(28).fill(0);for(const e of ev)for(let j=1;j<=L;j++){let t=C[e]+j-1,K=(primes[t]-1)%28;let z=log[mod(C[e+j]-C[e+j-1])],w=log[mod(C[e-1-j]-C[e-j])];assert(z>=0&&w>=0,"event eligibility");a[m28(z-K)]++;b[m28(w-K)]++}
 const n=ev.length*L,collision=a=>a.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));return {forward:collision(a),reverse:collision(b),delta:collision(a)-collision(b),observations:n}}
 // Symmetric non-repeat Markov kernel; exact original repeat mask and physical page mask.
 // Uniform kernel is time-reversible; conditional event mask is kept fixed.
 function nullTape(R){const C=[R()%29];for(let i=1;i<N;i++)C.push(orig[i]===orig[i-1]?C[i-1]:mod(C[i-1]+1+R()%28));return C}
 const trials=1000,nulls=[[],[]],R0=rng(0x28190001);
 for(let b=0;b<trials;b++){const C=nullTape(R0);for(let j=0;j<2;j++)nulls[j].push(Math.abs(score(C,E0[j]).delta))}
 const thresh=nulls.map(a=>a.slice().sort((a,b)=>a-b)[Math.ceil(.99*a.length)-1]);
 // A second independent null batch checks that a frozen threshold abstains >=95% of the time.
 let falsePositive=[0,0];const R1=rng(0x28190002);for(let b=0;b<400;b++){const C=nullTape(R1);for(let j=0;j<2;j++)if(Math.abs(score(C,E0[j]).delta)>thresh[j])falsePositive[j]++}
 const plants=[];for(let d=0;d<donors.length;d++){const R=rng(0x28191000+d),pool=donors[d],truePos=[0,0],wrong=[0,0],insufficient=0,eventTotals=[0,0],sample=80;for(let b=0;b<sample;b++){
  const start=R()%pool.length,P=Array.from({length:N},(_,i)=>pool[(start+i)%pool.length]),S=shuffled(Array.from({length:28},(_,i)=>i),R),C=enc(P,S),E=events(C);
  assert(dec(C,S).every((v,i)=>v===P[i]),"replay");if(E.some((v,j)=>v.length<counts[j])){insufficient++;continue}
  for(let j=0;j<2;j++){eventTotals[j]+=E[j].length;const selected=shuffled(E[j],R).slice(0,counts[j]),s=score(C,selected),decision=s.delta>thresh[j]?1:s.delta< -thresh[j]?-1:0;if(decision===1)truePos[j]++;if(decision===-1)wrong[j]++}
 }plants.push({donor:d,replicates:sample,insufficient,truePos,wrong,eventTotals})}
 // Predeclared joint calibration: >=90% correct with <=5% wrong for each donor/region; >=95% independent-null abstention.
 const passed=plants.every(x=>x.insufficient===0&&x.truePos.every(v=>v>=.9*x.replicates)&&x.wrong.every(v=>v<=.05*x.replicates))&&falsePositive.every(v=>v<=20);
 const result={law:"shift-then-map rank28, repeat-rune prime reseed, arbitrary private shared rank permutation",L,scope:[0,39,40,55],counts,threshold:thresh,nullCalibration:trials,nullIndependent:400,falsePositive,plants,passed};
 if(original&&passed){result.original=E0.map((e,j)=>{const s=score(orig,e);return {...s,decision:s.delta>thresh[j]?"forward":s.delta< -thresh[j]?"reverse":"abstain",p:(1+nulls[j].filter(v=>v>=Math.abs(s.delta)).length)/(1+trials)}})}
 return result
}
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8")),process.argv.includes("--original")),null,2));
module.exports={run};
