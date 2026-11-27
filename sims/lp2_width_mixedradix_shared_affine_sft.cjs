'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const Q=29,N=12,CAP=30000000,wide=corpus.translit.map(x=>+(x.length>1)),mod=x=>(x%29+29)%29,bmod=(x,m)=>(x%m+m)%m;
 const pow=Array.from({length:N+1},(_,i)=>29n**BigInt(i)),big=x=>x.reduceRight((a,b)=>a*29n+BigInt(b),0n),digits=(x,n=N)=>Array.from({length:n},(_,i)=>Number(x/pow[i]%29n));
 function check(v,msg){if(!v)throw Error(msg)}
 check(wide.reduce((a,b)=>a+b)===7,"literal width chart");
 function inv(a,m){let [x,y,u,v]=[bmod(a,m),m,1n,0n];while(y){let q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit");return bmod(u,m)}
 const I=Array.from({length:29},(_,x)=>x?Number(inv(BigInt(x),29n)):0);
 // State 0: next symbol one digit; 1: next symbol two digits (prior-width only).
 // State 2/3: mandatory zero pad then state 0/1.
 function advance(s,p,mode){if(s>=2)return p===0?s-2:-1;if(mode==="current")return wide[p]?2:0;return s?2+wide[p]:wide[p]}
 function pack(seq,mode){const z=[];let prev=0;for(const x of seq){z.push(x);if(mode==="current"?wide[x]:prev)z.push(0);prev=wide[x]}return z}
 function unpack(z,mode,complete){let s=0,seq=[];for(const p of z){if(s<2)seq.push(p);s=advance(s,p,mode);if(s<0)return null}return complete&&s>=2?null:{seq,state:s}}
 function capacity(n,mode){let tab=Array.from({length:n+1},()=>[0n,0n,0n,0n]);tab[0]=[1n,1n,0n,0n];for(let j=1;j<=n;j++){for(let s=0;s<4;s++)for(let p=0;p<Q;p++){const t=advance(s,p,mode);if(t>=0)tab[j][s]+=tab[j-1][t]}}return tab[n][0]}
 const exhaustive=[];for(const mode of ["prior","current"])for(let n=0;n<=3;n++){let k=0;for(let x=0;x<Q**n;x++){const z=Array.from({length:n},(_,j)=>Math.floor(x/Q**j)%Q),u=unpack(z,mode,true);if(u){check(pack(u.seq,mode).join()===z.join(),"canonical roundtrip");k++}}check(BigInt(k)===capacity(n,mode),"capacity");exhaustive.push({mode,n,k})}
 const seqs=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
 const excluded=["0_koan_1","0_loss_of_divinity"];
 function model(rev){const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
 for(const s of seqs.filter(s=>!excluded.includes(s.name))){const x=rev?[...s.seq].reverse():s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++}}
 const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
 return {u:u.map(v=>Math.log(v/us)),b:b.map((v,i)=>Math.log(.8*v/bs[Math.floor(i/29)]+.2*u[i%29]/us)),t:t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,p=a%29;return Math.log(.6*v/ts[a]+.3*b[p*29+c]/bs[p]+.1*u[c]/us)})}}
 function score(P,l){let sum=0,n=0;for(const p of P)for(let j=0;j<p.length;j++){sum+=j===0?l.u[p[j]]:j===1?l.b[p[0]*29+p[1]]:l.t[(p[j-2]*29+p[j-1])*29+p[j]];n++}return sum/n}
 function frames(rev,mode){const s=seqs.find(x=>x.name===excluded[+rev]).seq,x=rev?[...s].reverse():s,rows=[];let i=0,skipped=0;while(i<x.length&&rows.length<55){let j=i,z=[];while(j<x.length&&z.length<N){j++;z=pack(x.slice(i,j),mode)}if(z.length===N){rows.push(x.slice(i,j));i=j}else{i++;skipped++}}check(rows.length===55,"not enough native frames "+mode+" "+rev);return {rows,skipped,source:excluded[+rev]}}
 function decode(C,A,B,mode,complete){return C.map(c=>unpack(digits(bmod(A*big(c)+B,pow[c.length]),c.length),mode,complete))}
 function recover(C,mode,kind,rev,complete,truth){
 const fit=C.filter((_,i)=>i%4!==3),held=C.filter((_,i)=>i%4===3),K=fit.length,l=model(rev),x=fit.map(c=>c[0]),A=new Int32Array(N),B=new Int32Array(N),s=Array.from({length:N+1},()=>new Int8Array(K)),carr=Array.from({length:N+1},()=>new Int32Array(K)),bases=Array.from({length:N},()=>new Int32Array(K)),count=Array(N+1).fill(0);
 let nodes=0,attempts=0,capped=false,leaf=0,truthSeen=false,best=null,firstKeys=[];
 count[0]=1;
 function rec(j){
 if(capped)return;if(j===N){
 leaf++;const a=big([...A]),b=big([...B]);if(truth&&a===truth.A&&b===truth.B)truthSeen=true;
 const P=decode(fit,a,b,mode,complete);check(P.every(Boolean),"key replay fit");
 const sc=score(P.map(p=>p.seq),l);if(firstKeys.length<5)firstKeys.push([a.toString(),b.toString()]);if(!best||sc>best.score)best={A:a,B:b,score:sc};return
 }
 const base=bases[j],cur=s[j],nxt=s[j+1],carry=carr[j],ncarry=carr[j+1];let x0=-1,r0=0,forcedA=-1;
 for(let i=0;i<K;i++){
 let v=carry[i];for(let k=0;k<j;k++)v+=A[k]*fit[i][j-k];base[i]=v;
 if(cur[i]<2)continue;const r=mod(-v);
 if(x0<0){x0=x[i];r0=r}
 else if(x[i]===x0){if(r!==r0)return}
 else{const a=mod((r-r0)*I[mod(x[i]-x0)]);if(forcedA<0)forcedA=a;else if(forcedA!==a)return}
 }
 const amin=kind==="shift"?(j===0?1:0):(j===0?1:0),amax=kind==="shift"?amin:28;
 const lo=forcedA<0?amin:Math.max(amin,forcedA),hi=forcedA<0?amax:Math.min(amax,forcedA);
 for(let a=lo;a<=hi;a++){
 const fb=x0<0?-1:mod(r0-a*x0);
 for(let b=fb<0?0:fb;b<=(fb<0?28:fb);b++){
 attempts++;if(attempts>CAP){capped=true;return}
 let ok=true;for(let i=0;i<K;i++){const v=base[i]+a*x[i]+b,p=v%29,t=advance(cur[i],p,mode);if(t<0||(complete&&j===N-1&&t>=2)){ok=false;break}nxt[i]=t;ncarry[i]=Math.floor(v/29)}
 if(!ok)continue;A[j]=a;B[j]=b;count[j+1]++;nodes++;rec(j+1);if(capped)return
 }
 }
 }
 rec(0);
 let chosen=null,all=null;
 if(best){const P=decode(C,best.A,best.B,mode,complete),H=P.filter((_,i)=>i%4===3),valid=H.filter(Boolean).length,ai=inv(best.A,pow[N]);
 const replay=P.every((p,i)=>{if(!p)return true;const q=pack(p.seq,mode),raw=digits(bmod(best.A*big(C[i])+best.B,pow[N]));return q.slice(0,N).join()===raw.join()&&bmod((big(raw)-best.B)*ai,pow[N])===big(C[i])});
 chosen={A:best.A.toString(),B:best.B.toString(),fit:best.score,heldValid:valid,held:valid===H.length?score(H.map(p=>p.seq),l):null,replay};all=P;
 }
 return {mode,kind,rev,complete,fitN:K,heldN:held.length,count,attempts,nodes,capped,leaf,truthSeen:truth?truthSeen:null,chosen,firstKeys,all}
 }
 const out={N,CAP,widths:corpus.translit.filter((_,i)=>wide[i]),exhaustive,capacity:[],plants:[],original:[]};
 for(const mode of ["prior","current"])for(const n of [1,2,3,12,76,262]){const v=capacity(n,mode),total=29n**BigInt(n);out.capacity.push({mode,n,legal:v.toString(),total:total.toString(),log2Density:Math.log2(Number(v.toString().slice(0,15)))+(v.toString().length-Math.min(15,v.toString().length))*Math.log2(10)-n*Math.log2(29)})}
 // A three-rune same-size frame cannot preserve a final nonzero after a wide first symbol.
 const w=wide.indexOf(1),v=wide.indexOf(0);
 out.truncation=["prior","current"].map(mode=>{const a=[w,v,0],b=[w,v,1],p=pack(a,mode),q=pack(b,mode);check(p.slice(0,3).join()===q.slice(0,3).join(),"truncated collision");return {mode,a,b,p,q,stored:p.slice(0,3)}});
 const pages=corpus.pages.slice(0,56).filter(p=>p.indices.length>=N);check(pages.length===55,"original page count");
 for(const mode of ["prior","current"])for(const kind of ["shift","affine"]){
 let passed=true;
 for(const rev of [false,true]){
 const F=frames(rev,mode),P=F.rows.map(p=>pack(p,mode)),ad=Array.from({length:N},(_,i)=>kind==="shift"?(i===0?1:0):(7*i*i+11*i+9+(rev?3:0)+(mode==="current"?2:0))%29),bd=Array.from({length:N},(_,i)=>(13*i*i+5*i+17+(rev?6:0)+(mode==="current"?4:0))%29),A=big(ad),B=big(bd),ai=inv(A,pow[N]);
 const C=P.map(p=>digits(bmod((big(p)-B)*ai,pow[N]))),r=recover(C,mode,kind,rev,true,{A,B}),{all,...rest}=r;
 const correct=all?all.reduce((n,p,i)=>n+(p&&p.seq.join()===F.rows[i].join()?1:0),0):0;
 const keyExact=!!r.chosen&&r.chosen.A===A.toString()&&r.chosen.B===B.toString();
 const total=F.rows.reduce((n,p)=>n+p.length,0),heldRunes=F.rows.filter((_,i)=>i%4===3).reduce((n,p)=>n+p.length,0);
 out.plants.push({...rest,source:F.source,skipped:F.skipped,truth:{A:A.toString(),B:B.toString()},keyExact,exactFrames:correct,totalRunes:total,heldRunes});
 if(r.capped||!keyExact||correct!==55||!r.chosen.replay)passed=false;
 }
 if(!passed){out.original.push({mode,kind,blocked:"native blind key recovery failed"});continue}
 for(const rev of [false,true]){
 const C=pages.map(p=>(rev?[...p.indices].reverse():p.indices).slice(0,N)),r=recover(C,mode,kind,rev,false,null),{all,...rest}=r;
 out.original.push({...rest,sample:all?all.slice(0,5).map((p,i)=>({page:pages[i].page,text:p?p.seq.map(x=>corpus.translit[x]).join(" "):null})):null});
 }
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
