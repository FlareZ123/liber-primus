'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(data){
 const [raw,...books]=data,Q=29,rho=.81,starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],N=starts.at(-1);
 const assert=(x,s)=>{if(!x)throw Error(s)};
 const R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'],ri=new Map(R.map((r,i)=>[r,i]));
 function gp(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){let x=w.slice(i,i+2);if(!ri.has(x))x=w[i];assert(ri.has(x),'normalization');out.push(ri.get(x));i+=x.length}}return out}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 const K=[];for(let x=2;K.length<10000;x++)if(!K.some(p=>p*p<=x&&x%p===0))K.push(x);
 for(let i=0;i<K.length;i++)K[i]=(K[i]-1)%Q;
 const tape=JSON.parse(raw).pages.slice(0,56).flatMap(p=>p.indices);assert(tape.length===N,'original length');
 function counts(C,b){let f=0,repeats=0,ff=0;for(let s=0;s<9;s++)for(let i=starts[s];i<starts[s+1];i++){if(C[i]===b)f++;if(i>starts[s]&&C[i]===C[i-1]){repeats++;if(C[i]===b)ff++}}return{f,repeats,ff}}
 const original=counts(tape,0),sources=books.map(gp),records=[];
 function draw(P,A,b,origin,coins,hold,retry){
  let f=0,repeats=0,ff=0,holds=0,skips=0;for(let s=0;s<9;s++){let j=origin,prev=-1;for(let i=starts[s];i<starts[s+1];i++){const p=P[i];let c;if(hold&&p===0){c=b;holds++}else{c=(A[p]+K[j++])%Q;if(retry&&c===prev&&coins[i]<rho){c=(A[p]+K[j++])%Q;skips++}}if(c===b)f++;if(c===prev){repeats++;if(c===b)ff++}prev=c}}
  return{b,f,repeats,ff,holds,skips}
 }
 // Independent plaintext segments, inner maps, origins and collision coins.
 // Enumerate all 29 outer F ranks, rather than sample a favorable or unfavorable beta.
 for(let t=0;t<192;t++){
  const donor=t%3,source=sources[donor],rand=rng(0x5a112700+t),origin=rand()%3302,offset=rand()%(source.length-N+1),P=source.slice(offset,offset+N);
  const A=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){const j=rand()%(i+1);[A[i],A[j]]=[A[j],A[i]]}
  const coins=Float64Array.from(P,()=>rand()/4294967296);
  const rows={};for(const [name,hold,retry] of [['combined',true,true],['retryOnly',false,true],['holdOnly',true,false]]){
   rows[name]=Array.from({length:Q},(_,b)=>draw(P,A,b,origin,coins,hold,retry));
  }
  records.push({t,donor,origin,offset,plainF:P.filter(x=>x===0).length,A,rows});
 }
 const summary={};
 for(const name of ['combined','retryOnly','holdOnly']){
  const all=records.flatMap(r=>r.rows[name]),near=all.filter(r=>Math.abs(r.repeats-original.repeats)<=20),mins=records.map(r=>Math.min(...r.rows[name].map(x=>x.f))).sort((a,b)=>a-b);
  summary[name]={n:all.length,allRankMinimum:Math.min(...all.map(r=>r.f)),medianTrialMinimum:mins[Math.floor(mins.length/2)],maxTrialMinimum:mins.at(-1),atOrBelowOriginal:all.filter(r=>r.f<=original.f).length,trialAtOrBelowOriginal:mins.filter(v=>v<=original.f).length,nearOriginalRepeats:near.length,nearAndAtOrBelowOriginal:near.filter(r=>r.f<=original.f).length,nearMinF:near.length?Math.min(...near.map(x=>x.f)):null,plainFRange:[Math.min(...records.map(x=>x.plainF)),Math.max(...records.map(x=>x.plainF))]};
 }
 return{original,summary,records,model:'Common arbitrary GP29 inner alphabet; every possible outer rank of literal F; common chapter reset prime-minus-one origin 0..3301; hold bypasses collision; optional one collision-only retry .81; 192 independent donor/inner-key/origin/coin trials; count gate conditional on these controls, not exhaustive'};
}
const paths=['resources/liber-primus/lp2-corpus.json','resources/control/emerson_essays_2944.txt','resources/control/shakespeare_first300k.txt','resources/control/gibran_prophet_58585.txt'];
if(require.main===module){console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2))}
module.exports={study,paths};
