'use strict';
const fs=require('node:fs');
const path=require('node:path');
/** Exact finite-state inverse with source-native calibration. */
function experiment(corpus,native){
 const mod=(x,m)=>((x%m)+m)%m,M=3301,phi=Array.from({length:M+1},(_,i)=>i);
 for(let i=2;i<=M;i++)if(phi[i]===i)for(let j=i;j<=M;j+=i)phi[j]-=phi[j]/i;
 const q=corpus.prime,shift=Array.from({length:M},(_,s)=>phi[s||M]%29),next=(s,p)=>(s+q[p])%M;
 const arr=corpus.pages.map(p=>p.indices),starts=[0,3,8,15,23,27,33,40,54,56],offs=[13,16,12,20,16,19,10,8,9];
 const chapters=starts.slice(0,-1).map((p,i)=>({page:p,c:arr.slice(p,starts[i+1]).flat().slice(offs[i]),cut:arr[p].length-offs[i]}));
 const nat=native.sections.map(x=>({name:x.name,p:[...x.source_text].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0)}));
 if(arr.slice(0,56).flat().length!==12956||chapters.map(x=>x.c.length).join()!=="716,1129,1717,1883,1005,1414,1670,3000,299")throw Error("source dimensions");
 // Genuine solved controls, separate from the proposed receiver.
 const primes=[];for(let i=2;primes.length<100;i++)if(primes.every(p=>i%p))primes.push(i);
 let j=0;const p56=nat.find(x=>x.name==="p56_an_end").p;
 const real=p56.map(p=>p===0?0:(p+primes[j++]-1)%29);
 if(j!==84||real.join()!==arr[56].join()||nat.find(x=>x.name==="p57_parable").p.join()!==arr[57].join())throw Error("known source controls");
 function encode(p,s,hold){let out=[];for(const v of p){if(hold&&v===0){out.push(0);continue}out.push((v+shift[s])%29);s=next(s,v)}return out}
 function reach(c,hold){let a=new Uint8Array(M).fill(1),b=new Uint8Array(M),n=M,i=0;for(;i<c.length;i++){b.fill(0);const v=c[i];for(let s=0;s<M;s++)if(a[s]){const p=mod(v-shift[s],29);if(hold&&v===0)b[s]=1;if(!hold||p!==0)b[next(s,p)]=1}n=b.reduce((z,x)=>z+x,0);if(!n)break;[a,b]=[b,a]}return {prefix:i,endStates:n}}
 function model(exclude){const cnt=Array(29).fill(1);for(const n of nat)if(n.name!==exclude)for(const p of n.p)cnt[p]++;const sum=cnt.reduce((a,b)=>a+b);return cnt.map(x=>Math.log(x/sum))}
 function fit(c,hold,w,initial=null){let a=new Float64Array(M).fill(initial===null?0:-Infinity),b=new Float64Array(M),parents=[],choices=[];if(initial!==null)a[initial]=0;for(const v of c){b.fill(-Infinity);let par=new Int16Array(M).fill(-1),pc=new Int8Array(M);for(let s=0;s<M;s++)if(Number.isFinite(a[s])){let p=mod(v-shift[s],29);if(hold&&v===0&&a[s]+w[0]>b[s]){b[s]=a[s]+w[0];par[s]=s;pc[s]=0}if(!hold||p!==0){let t=next(s,p),z=a[s]+w[p];if(z>b[t]){b[t]=z;par[t]=s;pc[t]=p}}}if(!b.some(Number.isFinite))return null;parents.push(par);choices.push(pc);[a,b]=[b,a]}let end=0;for(let s=1;s<M;s++)if(a[s]>a[end])end=s;let p=[],s=end;for(let i=c.length-1;i>=0;i--){p.push(choices[i][s]);s=parents[i][s]}p.reverse();if(encode(p,s,hold).join()!==c.join())throw Error("replay");return {start:s,end,score:a[end]/c.length,p}}
 const summarize=a=>a?{start:a.start,end:a.end,score:a.score,preview:a.p.slice(0,100).map(v=>corpus.translit[v]).join("")}:null;
 const result={knownControl:{p56:real.length,consumed:j,p57:arr[57].length},chapters:[],controls:[],original:[]};
 for(const hold of [true,false]){
  for(const {page,c,cut} of chapters){result.chapters.push({hold,page,n:c.length,...reach(c,hold)});const w=model(null),a=fit(c.slice(0,cut),hold,w),b=a?fit(c.slice(cut),hold,w,a.end):null,full=fit(c,hold,w),oracle=fit(c.slice(cut),hold,w);result.original.push({hold,page,cut,fit:summarize(a),held:summarize(b),full:summarize(full),oracleHoldScore:oracle?.score??null})}
  for(let j=0;j<nat.length;j++){const n=nat[j],s=(1033+137*j)%M,c=encode(n.p,s,hold),cut=Math.floor(c.length/2),w=model(n.name),a=fit(c.slice(0,cut),hold,w),b=fit(c.slice(cut),hold,w,a.end);result.controls.push({hold,name:n.name,n:c.length,seed:s,selected:a.start,fitCorrect:a.p.filter((v,i)=>v===n.p[i]).length,fitLength:cut,heldCorrect:b?.p.filter((v,i)=>v===n.p[i+cut]).length??0,heldLength:c.length-cut,heldScore:b?.score??null})}
 }
 return result;
}
const load=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(load('resources/liber-primus/lp2-corpus.json'),load('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
