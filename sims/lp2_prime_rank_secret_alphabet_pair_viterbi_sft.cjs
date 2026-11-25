'use strict';
const fs=require('node:fs');
function decodeRankExperiment(c,n,gs,es,ss,pilot,which,settings){
const check=(x,m)=>{if(!x)throw Error(m)},mod=(x,m)=>(x%m+m)%m;
const C=c.pages.slice(0,56).flatMap(p=>p.indices),N=C.length,cut=pilot.cut;
const prime=[];for(let x=2;prime.length<=N;x++){let ok=true;for(const p of prime){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)prime.push(x)}
const log=Array(29).fill(-1),pow=[];let a=1;for(let i=0;i<28;i++){log[a]=i;pow.push(a);a=a*15%29}
const map=Object.fromEntries(c.translit.map((x,i)=>[x,i]));Object.assign(map,{ING:21,IO:27,V:1,K:5,Q:5,Z:15});const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW");while(w){const k=keys.find(x=>w.startsWith(x));check(k,"token "+w);out.push(map[k]);w=w.slice(k.length)}}return out}
const g=encode(gs.slice(gs.indexOf("|Almustafa"),gs.indexOf("*** END OF"))),e=encode(es.slice(es.indexOf("THERE is one mind"),es.indexOf("*** END OF"))),s=encode(ss);
const src=[g.slice(0,1000),g.slice(1000+N),e.slice(0,3000),e.slice(3000+N),s,...n.sections.map(x=>Array.from(x.source_text).map(y=>c.runes.indexOf(y)).filter(x=>x>=0))];
const J=new Float64Array(29*29).fill(.5),tri=new Float64Array(29*29*29),uni=new Float64Array(29).fill(.5);
for(let h=0;h<src.length;h++){const P=src[h],w=h>=5?10:1;for(let i=0;i<P.length;i++){uni[P[i]]+=w;if(i)J[P[i-1]*29+P[i]]+=w;if(i>=2)tri[(P[i-2]*29+P[i-1])*29+P[i]]+=w}}
let z=J.reduce((a,b)=>a+b,0);const joint=Float64Array.from(J,x=>x/z);z=uni.reduce((a,b)=>a+b,0);const pi=Float64Array.from(uni,x=>x/z),big=new Float64Array(29*29),trig=new Float64Array(tri.length);
for(let p=0;p<29;p++){let sum=0;for(let q=0;q<29;q++)sum+=J[p*29+q];for(let q=0;q<29;q++)big[p*29+q]=J[p*29+q]/sum}
for(let a=0;a<29*29;a++){let sum=0;for(let p=0;p<29;p++)sum+=tri[a*29+p];for(let p=0;p<29;p++)trig[a*29+p]=(tri[a*29+p]+8*big[(a%29)*29+p])/(sum+8)}
const logPi=Float64Array.from(pi,Math.log),logBig=Float64Array.from(big,Math.log),logTri=Float64Array.from(trig,Math.log);
const left=Float64Array.from({length:28},(_,r)=>(28-r)/28),right=Float64Array.from({length:28},(_,r)=>(r+1)/28);
let rng=0x5ca1ab1e;const rnd=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0},rand=()=>rnd()/4294967296,perm=n=>{let p=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=rnd()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p};
function trace(A,q,hold,K){let t=0,last=0;const O=[];for(let i=0;i<A.length;i++){let d=mod(A[i]-last,29),k=mod(prime[t]-1,28);last=A[i];O.push(d?{r:mod(K[t%q][log[d]]-k,28),s:K[t%q][log[d]],k,v:(t%q)*28+log[d]}:null);if(d||!hold)t++}return O}
function gauge(a,b,swap){return Array.from({length:28},(_,r)=>mod(r+2*(r%2?b:a)+swap,28))}
function inverse(A){let out=Array(A.length);A.forEach((x,i)=>out[x]=i);return out}
function logJoint(A,r,s){const i=A[r],j=A[r+1],k=A[s],l=A[s+1];return Math.log(left[r]*(left[s]*joint[i*29+k]+right[s]*joint[i*29+l])+right[r]*(left[s]*joint[j*29+k]+right[s]*joint[j*29+l]))}
function pairLL(A,H,B){let out=0;for(let r=0;r<28;r++)for(let s=0;s<28;s++){const count=B[H[r]*28+H[s]];if(count)out+=count*logJoint(A,r,s)}return out}
function partial(A,H,B,edges){let out=0;const marked=new Uint8Array(28);for(const r of edges)marked[r]=1;for(const r of edges)for(let s=0;s<28;s++){const c=B[H[r]*28+H[s]];if(c)out+=c*logJoint(A,r,s)}for(let r=0;r<28;r++)if(!marked[r])for(const s of edges){const c=B[H[r]*28+H[s]];if(c)out+=c*logJoint(A,r,s)}return out}
function anneal(B,restarts,steps){let best=null;const starts=[];for(let run=0;run<restarts;run++){let A=perm(29),a=rnd()%14,b=rnd()%14,swap=rnd()%2,H=gauge(a,b,swap),score=pairLL(A,H,B),record={score,A:A.slice(),H:H.slice(),a,b,swap};for(let t=0;t<steps;t++){const temp=35*Math.pow(.025/35,t/(steps-1));if(rnd()%20===0){let x=a,y=b,z=swap;switch(rnd()%3){case 0:x=mod(a+(rnd()%13)+1,14);break;case 1:y=mod(b+(rnd()%13)+1,14);break;case 2:z^=1;break}const h=gauge(x,y,z),s=pairLL(A,h,B),d=s-score;if(d>=0||rand()<Math.exp(d/temp)){a=x;b=y;swap=z;H=h;score=s}}
else{const x=rnd()%29,y=rnd()%29;if(x===y)continue;const E=[...new Set([x-1,x,y-1,y].filter(z=>z>=0&&z<28))],before=partial(A,H,B,E);[A[x],A[y]]=[A[y],A[x]];const d=partial(A,H,B,E)-before;if(d>=0||rand()<Math.exp(d/temp))score+=d;else [A[x],A[y]]=[A[y],A[x]]}
if(score>record.score+1e-7)record={score,A:A.slice(),H:H.slice(),a,b,swap};
}const exact=pairLL(record.A,record.H,B);check(Math.abs(exact-record.score)<1e-4,"anneal objective drift");record.score=exact;starts.push({run,score:record.score,a:record.a,b:record.b,swap:record.swap});if(!best||record.score>best.score)best=record}return {best,starts}}
function rankTape(O,H){const inv=inverse(H);return O.map(o=>o?mod(inv[o.s]-o.k,28):-1)}
function viterbi(R,A){const opts=r=>r<0?Array.from({length:29},(_,p)=>[p,0]):[[A[r],Math.log(left[r])],[A[r+1],Math.log(right[r])]];
const O=R.map(opts),B=[],first=O[0].map(([p,e])=>logPi[p]+e);if(R.length===1)return{P:[O[0][first.indexOf(Math.max(...first))][0]],score:Math.max(...first)};
let last=new Float64Array(O[0].length*O[1].length);for(let x=0;x<O[0].length;x++)for(let y=0;y<O[1].length;y++)last[x*O[1].length+y]=first[x]+logBig[O[0][x][0]*29+O[1][y][0]]+O[1][y][1];
for(let i=2;i<R.length;i++){const a=O[i-2],b=O[i-1],c=O[i],next=new Float64Array(b.length*c.length).fill(-Infinity),back=new Uint8Array(next.length);for(let y=0;y<b.length;y++)for(let z=0;z<c.length;z++){let best=-Infinity,bi=0;for(let x=0;x<a.length;x++){let v=last[x*b.length+y]+logTri[(a[x][0]*29+b[y][0])*29+c[z][0]]+c[z][1];if(v>best){best=v;bi=x}}next[y*c.length+z]=best;back[y*c.length+z]=bi}B.push(back);last=next}
let j=0;for(let i=1;i<last.length;i++)if(last[i]>last[j])j=i;const ix=Array(R.length);ix[R.length-1]=j%O[R.length-1].length;ix[R.length-2]=Math.floor(j/O[R.length-1].length);for(let i=R.length-1;i>=2;i--)ix[i-2]=B[i-2][ix[i-1]*O[i].length+ix[i]];return {P:ix.map((x,i)=>O[i][x][0]),score:last[j]}}
function likelihood(R,A){let p=Float64Array.from(pi);let ll=0;for(let i=0;i<R.length;i++){let r=R[i],next=new Float64Array(29);if(i===0)next.set(p);else for(let a=0;a<29;a++)if(p[a])for(let b=0;b<29;b++)next[b]+=p[a]*big[a*29+b];if(r>=0){for(let a=0;a<29;a++)if(a!==A[r]&&a!==A[r+1])next[a]=0;next[A[r]]*=left[r];next[A[r+1]]*=right[r]}const sum=next.reduce((a,b)=>a+b,0);check(sum>0,"likelihood");ll+=Math.log(sum);for(let a=0;a<29;a++)next[a]/=sum;p=next}return ll}
function replay(P,A,K,O,hold){const pos=inverse(A);let t=0,last=0;const out=[];for(let i=0;i<P.length;i++){const p=pos[P[i]],o=O[i];if(!o){out.push(last);if(!hold)t++;continue}const s=K[t%K.length][o.v%28],r=mod(s-o.k,28);check(p===r||p===r+1,"escape witness");const e=p===r?r+1:r,rank=p-Number(p>e);check(rank===r,"escape rank");const zz=K[t%K.length].indexOf(mod(rank+o.k,28));last=mod(last+pow[zz],29);out.push(last);t++}return out}
const results=[];
for(const index of which){const x=pilot.results[index],truth=x.hidden,ct=truth?truth.cipher:C,K0=x.best.K,O=trace(ct,x.q,x.hold,K0),B=new Float64Array(784);for(let i=1;i<cut;i++)if(O[i]&&O[i-1]&&O[i].k%2===0&&O[i-1].k%2===0)B[O[i-1].r*28+O[i].r]++;
const start=Date.now(),fit=anneal(B,settings.restarts,settings.steps),A=fit.best.A,H=fit.best.H,R=rankTape(O,H),inv=inverse(H),K=K0.map(row=>row.map(s=>inv[s]));
const train=viterbi(R.slice(0,cut),A),test=viterbi(R.slice(cut),A),P=train.P.concat(test.P);check(replay(P,A,K,O,x.hold).every((p,i)=>p===ct[i]),"original/plant replay");
const report={index,kind:x.kind,q:x.q,hold:x.hold,ms:Date.now()-start,fit,train:{viterbi:train.score/cut,likelihood:likelihood(R.slice(0,cut),A)/cut},test:{viterbi:test.score/(N-cut),likelihood:likelihood(R.slice(cut),A)/(N-cut)},uniform:-Math.log(28)*R.slice(cut).filter(r=>r>=0).length/(N-cut),plaintext:P,ranks:R,key:K,output:P.map(p=>c.translit[p]).join(""),oracle:null};
if(truth){const correct=(lo,hi)=>P.slice(lo,hi).filter((p,i)=>p===truth.P[lo+i]).length,tR=truth.ranks,oracleV=viterbi(tR.slice(cut),truth.A),oracleCorrect=oracleV.P.filter((p,i)=>p===truth.P[cut+i]).length;let trueH=null,score=-1;const tK=truth.K.flat(),fK=K0.flat();for(let aa=0;aa<14;aa++)for(let bb=0;bb<14;bb++)for(let sw=0;sw<2;sw++){const hh=gauge(aa,bb,sw),v=tK.filter((p,i)=>hh[p]===fK[i]).length;if(v>score){score=v;trueH=hh}}report.oracle={correctTrain:correct(0,cut),correctTest:correct(cut,N),alphabetCorrect:A.filter((a,i)=>a===truth.A[i]).length,keyCorrect:K.flat().filter((p,i)=>p===tK[i]).length,oracleViterbiTestCorrect:oracleCorrect,trueGauge:trueH,trueAlphabetPairScore:pairLL(truth.A,trueH,B),trueLikelihood:likelihood(tR.slice(cut),truth.A)/(N-cut),trueOutput:truth.P.slice(cut,cut+300).map(p=>c.translit[p]).join("")};}
results.push(report)
}
return {cut,N,settings,results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","im-results/lp2-prime-rank-marginal-em-pilot-output.json"];
const d=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(decodeRankExperiment(JSON.parse(d[0]),JSON.parse(d[1]),d[2],d[3],d[4],JSON.parse(d[5]),process.argv.slice(2).length?process.argv.slice(2).map(Number):[0,2],{"restarts":12,"steps":16000}),null,2));
