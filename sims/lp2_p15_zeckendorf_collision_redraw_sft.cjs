'use strict';
// Agent28: exact fixed Fibonacci collision-redraw receivers.
const fs=require('node:fs'),path=require('node:path');
function experiment(data){
 const co=JSON.parse(data[0]),nat=JSON.parse(data[1]),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=s=>{let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(t=>w.startsWith(t.s,i));assert(t,"unknown token");out.push(t.i);i+=t.s.length}}return out};
 const native=nat.sections.map(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x))),train=[...native,encode(data[2]),encode(data[3])],em=encode(data[4]);
 const N=1883,cut=1752,F=[1,2];while(F.at(-1)+F.at(-2)<4*N)F.push(F.at(-1)+F.at(-2));const primes=[];for(let n=2;primes.length<=F.at(-1);n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 const K=[1,...F.map(f=>mod(primes[f]-2))];
 const key=Array.from({length:4*N},(_,j)=>{let v=K[0];for(let k=F.length-1;k>=0;k--)if(F[k]<=j){j-=F[k];v+=K[k+1]}return v%29});
 let maxRun=1,run=1;for(let j=1;j<key.length;j++){run=key[j]===key[j-1]?run+1:1;maxRun=Math.max(maxRun,run)}
 assert((maxRun+1)*N<=key.length,"key bound");
 const U=new Float64Array(29).fill(1),B=new Float64Array(841),T=new Float64Array(29**3),BS=new Float64Array(29),TS=new Float64Array(841);
 for(const p of train)for(let i=0;i<p.length;i++){U[p[i]]++;if(i){B[p[i-1]*29+p[i]]++;BS[p[i-1]]++}if(i>1){let j=p[i-2]*29+p[i-1];T[j*29+p[i]]++;TS[j]++}}
 let total=U.reduce((a,b)=>a+b,0),lm=new Float64Array(29**3),bi=new Float64Array(841),uni=U.map(x=>Math.log(29*x/total));
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){bi[a*29+b]=Math.log(29*(B[a*29+b]+20*U[b]/total)/(BS[a]+20));for(let c=0;c<29;c++){let h=a*29+b;lm[h*29+c]=Math.log(29*(T[h*29+c]+12*Math.exp(bi[b*29+c])/29)/(TS[h]+12))}}
 const score=(a,b,p)=>b===29?uni[p]:a===29?bi[b*29+p]:lm[(a*29+b)*29+p];
 function forward(P,seed,prob,limit){
 let j=0,prev=-1,skips=0,holds=0,choices=[];const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/2**32};
 const C=P.map(p=>{if(!p){prev=0;holds++;choices.push(0);return 0}let m=1,c=mod(p+key[j++]);while(c===prev&&m<=limit&&rnd()<prob){c=mod(p+key[j++]);m++;skips++}prev=c;choices.push(m);return c});return {C,holds,skips,choices};
 }
 function decode(C,start,end,initial,prob,limit){
 let base=initial??{j:0,a:29,b:29,v:0},states=new Map([[base.j*900+base.a*30+base.b,{...base,prev:null}]]),max=1,counts=[];
 for(let i=start;i<end;i++){
 let next=new Map(),prev=i?C[i-1]:-1,c=C[i];
 function add(s,j,p,w,m){let v=s.v+score(s.a,s.b,p)+w,q=j*900+s.b*30+p,old=next.get(q);if(!old||v>old.v)next.set(q,{j,a:s.b,b:p,v,p,m,prev:s})}
 for(let s of states.values()){
 if(c===0)add(s,s.j,0,0,0);
 let p=mod(c-key[s.j]);if(p&&(c!==prev||prob<1))add(s,s.j+1,p,c===prev&&limit>0?Math.log1p(-prob):0,1);
 if(prev>=0&&prob>0&&limit>0){p=mod(prev-key[s.j]);if(p){for(let d=1;d<=limit;d++){
 let z=mod(p+key[s.j+d]);
 if(z===c&&(z!==prev||d===limit||prob<1))add(s,s.j+d+1,p,d*Math.log(prob)+(z===prev&&d<limit?Math.log1p(-prob):0),d+1);
 if(z!==prev)break;
 }}}
 }
 if(!next.size)return {dead:i,max,counts};
 states=next;max=Math.max(max,states.size);if(i===end-1||i%100===99)counts.push([i,states.size,Math.max(...[...states.values()].map(s=>s.v))]);
 }
 let best=[...states.values()].reduce((a,b)=>a.v>b.v?a:b),s=best,P=[],ms=[];
 for(let i=start;i<end;i++){P.push(s.p);ms.push(s.m);s=s.prev}P.reverse();ms.reverse();
 let j=base.j,prev=start?C[start-1]:-1,skips=0,holds=0;
 for(let i=start;i<end;i++){let p=P[i-start],m=ms[i-start];if(!p){assert(!m&&C[i]===0,"hold replay");holds++}else{for(let d=0;d<m-1;d++){assert(mod(p+key[j++])===prev,"collision replay");skips++}assert(mod(p+key[j++])===C[i],"cipher replay")}prev=C[i]}
 return {P,ms,score:best.v-base.v,state:{j:best.j,a:best.a,b:best.b,v:best.v},skips,holds,max,counts};
 }
 const C=co.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(20);
 const preview=p=>p?.slice(0,100).map(x=>co.translit[x]).join("")??null;
 const results=[];
 for(const [prob,limit] of [[1,1],[.8,1],[1,maxRun],[.8,maxRun]]){
 let row={prob,limit,controls:[]};
 for(let t=0;t<3;t++){let P=em.slice(50000+t*N,50000+(t+1)*N),f=forward(P,0x7de92134+t,prob,limit),fit=decode(f.C,0,cut,null,prob,limit),hold=fit.P?decode(f.C,cut,N,fit.state,prob,limit):null;
 row.controls.push({trueHolds:f.holds,trueSkips:f.skips,fitCorrect:fit.P?.filter((x,i)=>x===P[i]).length??null,holdCorrect:hold?.P?.filter((x,i)=>x===P[cut+i]).length??null,fit:fit.score===undefined?fit:fit.score/cut,hold:hold?.score===undefined?hold:hold.score/(N-cut),decodedSkips:fit.P&&hold?.P?fit.skips+hold.skips:null});}
 let fit=decode(C,0,cut,null,prob,limit),hold=fit.P?decode(C,cut,N,fit.state,prob,limit):null;
 row.original=fit.P?{fit:fit.score/cut,hold:hold?.P?hold.score/(N-cut):hold,preview:preview(fit.P),holdPreview:preview(hold?.P),fitHolds:fit.holds,fitSkips:fit.skips,holdSkips:hold?.skips,max:fit.max}:fit;results.push(row)
 }
 return {K,F,N,cut,maxRun,results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={experiment,paths};
