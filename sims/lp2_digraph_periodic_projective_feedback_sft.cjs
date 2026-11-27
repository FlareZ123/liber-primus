"use strict";
function periodicExperiment(corpus,texts,q){
 const Q=841,M=29,mod=x=>(x%29+29)%29,assert=(v,m)=>{if(!v)throw Error(m)};
 const project=Array.from({length:Q},(_,r)=>Uint8Array.from({length:30},(_,t)=>t===29?r%29:(Math.floor(r/29)+(r%29)*t)%29));
 const diff=Array.from({length:29},(_,x)=>Uint8Array.from({length:29},(_,y)=>mod(x-y)));
 const scale=Array.from({length:29},(_,x)=>{let inv=0;for(let i=1;i<29;i++)if(x*i%29===1)inv=i;return Uint8Array.from({length:29},(_,y)=>inv*y%29)});
 /** @param {number[]} tape @param {number} phase */
 function blocks(tape,phase){let b=[];for(let i=phase;i+1<tape.length;i+=2)b.push(29*tape[i]+tape[i+1]);return b}
 /** @param {number[]} b @param {number} lo @param {number} hi */
 function lanes(b,lo=1,hi=b.length){const lane=Array.from({length:q},()=>[]);for(let i=lo;i<hi;i++)lane[i%q].push([b[i-1],b[i]]);return lane}
 /** @param {number[][]} t @param {number} a @param {number} c */
 function direct(t,a,c){const hist=new Uint32Array(Q);let score=0;for(const [p,z] of t){let x=Math.floor(p/29),y=p%29,r=29*mod(Math.floor(z/29)-Math.floor(a/29)*x-(a%29)*y)+mod(z%29-Math.floor(c/29)*x-(c%29)*y);score+=hist[r]++}return {score,n:t.length,support:hist.filter(x=>x).length}}
 /** @param {number[][]} t */
 function search(t){const n=t.length,x=Uint8Array.from(t,p=>Math.floor(p[0]/29)),y=Uint8Array.from(t,p=>p[0]%29),u=Uint8Array.from(t,p=>Math.floor(p[1]/29)),v=Uint8Array.from(t,p=>p[1]%29);
 const w=Array.from({length:30},()=>new Uint32Array(Q));let constant=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const dx=diff[x[i]][x[j]],dy=diff[y[i]][y[j]],ex=diff[u[i]][u[j]],ey=diff[v[i]][v[j]];if(!dx&&!dy){if(!ex&&!ey)constant++;continue}const s=scale[dx||dy],dir=dx?s[dy]:29;w[dir][29*s[ex]+s[ey]]++}
 let best=-1,key=null,ties=0;for(let a=0;a<Q;a++){const p=project[a];for(let b=0;b<Q;b++){const z=project[b];let score=constant;for(let d=0;d<30;d++)score+=w[d][29*p[d]+z[d]];if(score>best){best=score;key=[a,b];ties=1}else if(score===best)ties++}}
 const check=direct(t,...key);assert(check.score===best,"exact residual collision");return {n,score:best,key,ties,rate:2*best/(n*(n-1)),supportAtBest:check.support,minSupportBound:Math.ceil(n*n/(n+2*best))}}
 function pooled(rows){return 2*rows.reduce((s,x)=>s+x.score,0)/rows.reduce((s,x)=>s+x.n*(x.n-1),0)}
 const gp=corpus.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
 function encode(source){let a=[];for(let word of source.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");for(let i=0;i<word.length;){let t=gp.find(o=>word.startsWith(o.token,i));assert(t,"GP");a.push(t.i);i+=t.token.length}}return a}
 const original=corpus.pages.slice(0,56).flatMap(p=>p.indices),donors=texts.map(encode);
 assert(original.length===12956,"original geometry");
 const result=[0,1].map(phase=>{const ls=lanes(blocks(original,phase)).map(search);return {phase,pooled:pooled(ls),maxIndividual:Math.max(...ls.map(x=>x.rate)),minSupport:Math.min(...ls.map(x=>x.minSupportBound)),ls}});
 const native=donors.map((d,k)=>{let mins=[1,1],minIndividual=1,windows=0;for(let s=0;s+12956<=d.length;s+=6400){windows++;let tape=d.slice(s,s+12956);for(let p=0;p<2;p++){const ls=lanes(blocks(tape,p)).map(t=>direct(t,0,0));mins[p]=Math.min(mins[p],pooled(ls));minIndividual=Math.min(minIndividual,...ls.map(x=>2*x.score/(x.n*(x.n-1))))}}return {name:k?"Gibran":"Shakespeare",windows,mins,minIndividual}});
 let seed=0x361127+q;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const plain=blocks(donors[q===4?0:1].slice(6400,6400+12956),0), keys=Array.from({length:q},()=>[rnd()%Q,rnd()%Q]);
 const pi=Array.from({length:q},()=>{let p=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){let j=rnd()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p});
 const inverse=pi.map(p=>{let inv=new Uint16Array(Q);p.forEach((x,i)=>inv[x]=i);return inv});
 const c=[pi[0][plain[0]]];for(let i=1;i<plain.length;i++){const p=pi[i%q][plain[i]],x=Math.floor(c[i-1]/29),y=c[i-1]%29,[a,b]=keys[i%q];c.push(29*mod(Math.floor(p/29)+Math.floor(a/29)*x+(a%29)*y)+mod(p%29+Math.floor(b/29)*x+(b%29)*y))}
 const split=4860,train=lanes(c,1,split).map(search),truth=lanes(plain,1,split);
 for(let i=0;i<q;i++)assert(direct(lanes(c,1,split)[i],...keys[i]).score===direct(truth[i],0,0).score,"plant collision invariant");
 let heldCorrect=0;for(let i=split;i<c.length;i++){const [a,b]=train[i%q].key,x=Math.floor(c[i-1]/29),y=c[i-1]%29,r=29*mod(Math.floor(c[i]/29)-Math.floor(a/29)*x-(a%29)*y)+mod(c[i]%29-Math.floor(b/29)*x-(b%29)*y);heldCorrect+=Number(inverse[i%q][r]===plain[i])}
 const plant={keys,train,exactUnique:keys.filter((k,i)=>k[0]===train[i].key[0]&&k[1]===train[i].key[1]&&train[i].ties===1).length,heldCorrect,heldCount:c.length-split,heldPooled:pooled(lanes(c,split).map((t,i)=>direct(t,...train[i].key)))};
 return {q,result,native,plant};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));const texts=[read("resources/control/shakespeare_first300k.txt"),read("resources/control/gibran_prophet_58585.txt")];const q=Number(process.argv[2]||4);if(![4,13].includes(q))throw Error("Expected pair-clock 4 or 13");console.log(JSON.stringify(periodicExperiment(corpus,texts,q),null,2));}
module.exports=periodicExperiment;
