// Read-only reproducer: node sims/lp2_p15_prime_weight_fib_autokey_sft.cjs
const fs=require("node:fs");const read=p=>fs.readFileSync(p,"utf8");
function experiment(corpus,tr,sh){
const mod=x=>((x%29)+29)%29, q=corpus.prime.map(x=>mod(x-1)), S=841;
function gp(t){const map=Object.fromEntries(corpus.translit.map((s,i)=>[s.toUpperCase(),i]));const out=[];for(let w of t.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S"); for(let i=0;i<w.length;){let s=w.slice(i,i+2); if(s==="ING")throw Error(); if(w.slice(i,i+3)==="ING"&&map.NG!==undefined){out.push(map.NG);i+=3;continue;}if(map[s]!==undefined){out.push(map[s]);i+=2;}else{if(map[w[i]]!==undefined)out.push(map[w[i]]);i++;}}}return out;}
const train=gp(tr), donor=gp(sh), counts=Array(29).fill(1);for(const p of train)counts[p]++;const log=counts.map(x=>Math.log(x/(train.length+29)));
function step(s,c,sign,hold,emit){const a=(s/29)|0,b=s%29,p=mod(c-sign*a); if(hold&&c===0)emit(s,0);if(!hold||p!==0)emit(29*b+mod(a+b+q[p]),p);}
function encode(P,s,sign,hold){const out=[];for(const p of P){const a=(s/29)|0,b=s%29; if(hold&&p===0){out.push(0);continue;}out.push(mod(p+sign*a));s=29*b+mod(a+b+q[p]);}return {out,s};}
function solve(C,sign,hold,init){let v=new Float64Array(S);v.fill(-Infinity);for(const s of init)v[s]=0;const prev=new Int16Array(C.length*S), sym=new Int8Array(C.length*S);let reach=[],dead=null;for(let i=0;i<C.length;i++){const w=new Float64Array(S);w.fill(-Infinity);let n=0;for(let s=0;s<S;s++){if(!Number.isFinite(v[s]))continue;step(s,C[i],sign,hold,(t,p)=>{const z=v[s]+log[p];if(z>w[t]){w[t]=z;prev[i*S+t]=s;sym[i*S+t]=p;}});}for(const z of w)if(Number.isFinite(z))n++;reach.push(n);v=w;if(!n){dead=i;break;}}
if(dead!==null)return {dead,reach,final:0};let end=0;for(let s=1;s<S;s++)if(v[s]>v[end])end=s;const P=Array(C.length);let s=end;for(let i=C.length-1;i>=0;i--){P[i]=sym[i*S+s];s=prev[i*S+s];}const chk=encode(P,s,sign,hold);if(chk.s!==end||chk.out.some((x,i)=>x!==C[i]))throw Error("replay");return {dead:null,reach,final:reach.at(-1),P,start:s,end,score:v[end]/C.length};}
function stats(x){const h=Array(29).fill(0);for(const p of x)h[p]++;return {n:x.length,ioc:h.reduce((a,b)=>a+b*(b-1),0)/(x.length*(x.length-1)),mean:x.reduce((a,p)=>a+log[p],0)/x.length};}
const all=Array.from({length:S},(_,i)=>i),seed=22*29+21;const first=corpus.pages.slice(16,17).flatMap(p=>p.indices),rest=corpus.pages.slice(17,23).flatMap(p=>p.indices), C=[...first,...rest], cut=first.length;
const results=[];
for(const sign of [1,-1])for(const hold of [false,true])for(const seeds of [[seed],all]){
 const fit=solve(first,sign,hold,seeds),full=solve(C,sign,hold,seeds);
 const next=fit.P?solve(rest,sign,hold,[fit.end]):null;
 results.push({sign,hold,seedMode:seeds.length===1?"spiral":"all",fitDead:fit.dead,fitFinal:fit.final,fitStart:fit.start,fitScore:fit.score,fullDead:full.dead,fullFinal:full.final,fullScore:full.score,fullFirstUnique:full.reach.indexOf(1),heldDead:next?.dead,heldFinal:next?.final,heldScore:next?.score,heldStats:next?.P?stats(next.P):null,heldPreview:next?.P?.slice(0,70).map(x=>corpus.translit[x]).join(" "),supportAt:[0,10,50,100,200,266,500,1000,1743].map(i=>[i,full.reach[i]??null])});}
const controls=[];
for(const sign of [1,-1])for(const hold of [false,true])for(const off of [500,5500,10500]){
 const P=donor.slice(off,off+C.length),s=mod(off)*29+mod(off+13),E=encode(P,s,sign,hold).out;
 const fit=solve(E.slice(0,cut),sign,hold,all),next=solve(E.slice(cut),sign,hold,[fit.end]),full=solve(E,sign,hold,all);
 controls.push({sign,hold,off,seed:s,selectedSeed:fit.start,fitCorrect:fit.P?.filter((p,i)=>p===P[i]).length,heldCorrect:next.P?.filter((p,i)=>p===P[i+cut]).length??0,heldDead:next.dead,heldScore:next.score,fullCorrect:full.P?.filter((p,i)=>p===P[i]).length??0,fullScore:full.score});}
return {q,trainLength:train.length,donorLength:donor.length,cut,n:C.length,results,controls};
}
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt")),null,2));
