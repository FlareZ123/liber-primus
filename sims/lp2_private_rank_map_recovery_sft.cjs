'use strict';
const fs=require('node:fs');
const experiment=function(corpus,gibran,shakespeare,emerson,batch=0){
const n=29,ALL=(1<<n)-1,lo=d=>31-Math.clz32(d&-d),hi=d=>31-Math.clz32(d),pop=x=>{x-=x>>>1&0x55555555;x=(x&0x33333333)+(x>>>2&0x33333333);return ((x+(x>>>4)&0x0f0f0f0f)*0x01010101)>>>24;},single=d=>d!==0&&(d&(d-1))===0,bit=k=>1<<k,low=k=>bit(k)-1,high=k=>ALL^low(k);
const map=new Map(corpus.translit.map((v,i)=>[v,i]));
function norm(lit){let D=[];for(let w of lit.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let q=w.slice(i,i+2);if(map.has(q)){D.push(map.get(q));i+=2}else D.push(map.get(w[i++]));}}return D;}
gibran=gibran.toUpperCase();let a=gibran.indexOf("ALMUSTAFA, THE CHOSEN");if(a>=0)gibran=gibran.slice(a);a=gibran.indexOf("END OF THE PROJECT GUTENBERG");if(a>=0)gibran=gibran.slice(0,a);
const D=norm(gibran),train=[norm(shakespeare),norm(emerson)];
if(D.length!==48084)throw Error("donor");
let un=new Float64Array(n).fill(1),B=new Float64Array(n*n),T=new Float64Array(n*n*n);for(let P of train)for(let i=0;i<P.length;i++){un[P[i]]++;if(i)B[n*P[i-1]+P[i]]++;if(i>1)T[n*n*P[i-2]+n*P[i-1]+P[i]]++;}let U=un.reduce((a,b)=>a+b);for(let i=0;i<n;i++)un[i]/=U;for(let i=0;i<n;i++){let s=0;for(let j=0;j<n;j++)s+=B[n*i+j];for(let j=0;j<n;j++)B[n*i+j]=(B[n*i+j]+10*un[j])/(s+10)}for(let i=0;i<n*n;i++){let s=0;for(let j=0;j<n;j++)s+=T[n*i+j];for(let j=0;j<n;j++)T[n*i+j]=Math.log((T[n*i+j]+10*B[n*(i%n)+j])/(s+10))}
let seed=batch===0?0x07e4132:0x4b173a00+batch;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};const perm=()=>{let x=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){let j=Math.floor(rand()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x};
function encode(P,S,R,A,role,hold){let a=A.slice(),C=[];for(let p of P){if(hold&&p===0){C.push(0);continue;}let j=S[p],c=a[j];C.push(c);a.splice(j,1);a.splice(R[role==="plain"?p:c],0,c);}return {C,A:a};}
function recover(P0,C0,role,hold,limit=2000){
 let P=[],C=[];for(let i=0;i<P0.length;i++){if(hold&&P0[i]===0){if(C0[i]!==0)return {status:"UNSAT",reason:"F"};continue;}P.push(P0[i]);C.push(C0[i]);}
 const X=role==="plain"?P:C,par=Array.from({length:2*n},(_,i)=>i),root=x=>{while(par[x]!==x)x=par[x];return x;};
 for(let i=1;i<P.length;i++)if(C[i]===C[i-1]){let a=root(P[i]),b=root(n+X[i-1]);par[b]=a;}
 let roots=[...new Set(par.map((_,i)=>root(i)))],v=par.map((_,i)=>roots.indexOf(root(i))),m=roots.length,sv=v.slice(0,n),rv=v.slice(n),used=new Set([...P.map(p=>sv[p]),...X.map(x=>rv[x])]);
 if(new Set(sv).size!==n)return {status:"UNSAT",reason:"S equality"};
 let pairs=new Map(),quads=new Map(),last=Array(n).fill(-1),degree=new Int32Array(m);
 const pair=(a,b,max,min)=>{if(a===b){if(min>0)throw Error("constraint conflict");return;}if(a>b)[a,b]=[b,a];let k=a*m+b,q=pairs.get(k)||{a,b,min:0,max:28};q.max=Math.min(q.max,max);q.min=Math.max(q.min,min);pairs.set(k,q)};
 try{for(let i=0;i<P.length;i++){let s=sv[P[i]],c=C[i],j=last[c];if(i>0&&c!==C[i-1])pair(s,rv[X[i-1]],28,1);
 if(j>=0){if(i-j<29)pair(s,rv[X[j]],i-j-1,0);if(i-j===2){let q=[rv[X[j]],sv[P[j+1]],rv[X[j+1]],s];quads.set(q.join(","),q);}}
 last[c]=i;
 }}catch(e){return {status:"UNSAT",reason:"repeat conflict"};}
 const ps=[...pairs.values()];for(let q of ps){if(q.min>q.max)return {status:"UNSAT",reason:"distance"};degree[q.a]++;degree[q.b]++;q.support=Array.from({length:n},(_,k)=>{let mask=0;for(let j=0;j<n;j++)if(Math.abs(k-j)>=q.min&&Math.abs(k-j)<=q.max)mask|=bit(j);return mask});}
 const qs=[...quads.values()];for(let q of qs)for(let x of q)degree[x]++;
 const support=(d,s)=>{let mask=0;while(d){let b=d&-d;mask|=s[lo(b)];d^=b;}return mask;};
 function matching(d){
 let mt=new Int32Array(n).fill(-1),seen=0;
 function aug(p){let b=d[sv[p]]&~seen;while(b){let e=b&-b,r=lo(e);b^=e;if(seen&e)continue;seen|=e;if(mt[r]<0||aug(mt[r])){mt[r]=p;return true;}}return false;}
 const order=Array.from({length:n},(_,i)=>i).sort((a,b)=>pop(d[sv[a]])-pop(d[sv[b]]));for(let p of order){seen=0;if(!aug(p))return null;}
 return mt;
 }
 let nodes=0,propagations=0,rootSizes=null,bestUsed=0,pruned=0,scanCount=0;
 function propagate(d,scan=true){
 let changed=true,iterations=0;const narrow=(i,mask)=>{let x=d[i]&mask;if(x!==d[i]){d[i]=x;changed=true;}return x!==0;};
 while(changed){changed=false;propagations++;iterations++;
 let mt=matching(d);if(!mt)return false;
 // Every supported edge in a balanced perfect matching is in an alternating cycle.
 let reach=new Int32Array(n);for(let p=0;p<n;p++){let mask=d[sv[p]];while(mask){let b=mask&-mask;mask^=b;reach[p]|=bit(mt[lo(b)]);}reach[p]|=bit(p);}
 for(let k=0;k<n;k++)for(let p=0;p<n;p++)if(reach[p]&bit(k))reach[p]|=reach[k];
 for(let p=0;p<n;p++){let mask=d[sv[p]],allowed=0;while(mask){let b=mask&-mask;mask^=b;if(reach[mt[lo(b)]]&bit(p))allowed|=b;}if(!narrow(sv[p],allowed))return false;}
 for(let {a,b,support:s} of ps){if(!narrow(a,support(d[b],s))||!narrow(b,support(d[a],s)))return false;}
 for(let [x,a,b,z] of qs){
 let sx=0,sa=0,sb=0,sz=0,dx=d[x];while(dx){let v=lo(dx),bv=bit(v);dx^=bv;for(let dec=0;dec<=1;dec++){let ma=d[a]&(dec?low(v):high(v+1));if(!ma)continue;let y=v-dec;for(let inc=0;inc<=1;inc++){let u=y+inc;if(u<0||u>=n||!(d[z]&bit(u)))continue;let mb=d[b]&(inc?low(y+1):high(y+1));if(!mb)continue;sx|=bv;sa|=ma;sb|=mb;sz|=bit(u);}}}
 if(!narrow(x,sx)||!narrow(a,sa)||!narrow(b,sb)||!narrow(z,sz))return false;
 }
 if(!narrow(sv[0],low(hi(d[sv[1]])))||!narrow(sv[1],high(lo(d[sv[0]])+1)))return false;
 if(scan&&(!changed||iterations%3===0)){
  scanCount++;
  for(let rev of [false,true]){
   let pos=Array(n).fill(ALL);
   for(let t=0;t<P.length;t++){
    let i=rev?P.length-1-t:t,c=C[i],a=rev?rv[X[i]]:sv[P[i]],b=rev?sv[P[i]]:rv[X[i]];
    if(!narrow(a,pos[c]))return false;
    let u=d[a],w=d[b],umin=lo(u),umax=hi(u),wmin=lo(w),wmax=hi(w);
    for(let g=0;g<n;g++)if(g!==c){let q=pos[g],rm=(q&low(umax))|((q&high(umin+1))>>>1);pos[g]=((rm&low(wmax))|((rm&high(wmin))<<1))&ALL;if(!pos[g])return false;}
    pos[c]=w;
    // Position domains are also all-different; singleton closure is sound.
    for(;;){let taken=0;for(let g=0;g<n;g++)if(single(pos[g])){if(taken&pos[g])return false;taken|=pos[g];}
     let ch=false;for(let g=0;g<n;g++)if(!single(pos[g])){let q=pos[g]&~taken;if(!q)return false;if(q!==pos[g]){pos[g]=q;ch=true;}}if(!ch)break;}
   }
  }
 }
 }
 return true;
 }
 function replay(d){
 let S=sv.map(s=>lo(d[s])),R=rv.map(r=>lo(d[r])),slots=Array.from({length:n},(_,i)=>i),A=Array(n).fill(-1),owner=Array(n).fill(-1);
 for(let i=0;i<P.length;i++){let j=S[P[i]],c=C[i],slot=slots[j];if((A[slot]!==-1&&A[slot]!==c)||(owner[c]!==-1&&owner[c]!==slot))return null;A[slot]=c;owner[c]=slot;slots.splice(j,1);slots.splice(R[X[i]],0,slot);}
 let free=[];for(let i=0;i<n;i++)if(owner[i]===-1)free.push(i);for(let i=0;i<n;i++)if(A[i]===-1)A[i]=free.shift();return {S,R,A};
 }
 function dfs(d){
 if(++nodes>limit)return null;
 if(!propagate(d,true)){pruned++;return null;}
 if(!rootSizes)rootSizes=Array.from(d,pop);
 let j=-1,sz=30,deg=-1,known=0;
 for(let i of used){let k=pop(d[i]);if(k===1){known++;continue;}if(k<sz||k===sz&&degree[i]>deg){j=i;sz=k;deg=degree[i];}}
 bestUsed=Math.max(bestUsed,known);
 if(j===-1){let q=Int32Array.from(d),mt=matching(q);if(!mt)return null;for(let r=0;r<n;r++)q[sv[mt[r]]]=bit(r);for(let i=0;i<m;i++)if(!single(q[i]))q[i]&=-q[i];return replay(q);}
 let mask=d[j];while(mask&&nodes<=limit){let b=mask&-mask;mask^=b;let q=Int32Array.from(d);q[j]=b;let k=dfs(q);if(k)return k;}return null;
 }
 const key=dfs(new Int32Array(m).fill(ALL));return {status:key?"SAT":nodes>limit?"UNKNOWN":"UNSAT",nodes,pruned,propagations,scanCount,variables:m,used:used.size,pairs:ps.length,quads:qs.length,rootSizes,bestUsed,key};
}
const str=A=>String.fromCharCode(...A.map(x=>65+x)),arr=s=>Array.from(s,x=>x.charCodeAt(0)-65);
function decrypt(C,key,role,hold,prev,cap=200000,beam=0){
 let S=key.S,R=key.R,inv=Array(n);S.forEach((s,p)=>inv[s]=p);
 let clipped=false,states=new Map([[str(key.A)+"|"+str(prev),{A:key.A,last:prev[1],prev:prev[0],score:0,out:"",count:1n}]]),maxStates=1;
 for(let i=0;i<C.length;i++){let c=C[i],next=new Map();for(let q of states.values()){
  const emit=(p,A)=>{let key=str(A)+"|"+str([q.last,p]),score=q.score+T[n*n*q.prev+n*q.last+p],old=next.get(key),count=q.count+(old?old.count:0n);if(!old||score>old.score)next.set(key,{A,last:p,prev:q.last,score,out:q.out+str([p]),count});else old.count=count;};
  if(hold&&c===0)emit(0,q.A);
  let j=q.A.indexOf(c),p=inv[j];if(!hold||p!==0){let A=q.A.slice();A.splice(j,1);A.splice(R[role==="plain"?p:c],0,c);emit(p,A);}
 }maxStates=Math.max(maxStates,next.size);if(!next.size)return {status:"UNSAT",dead:i,maxStates};if(beam&&next.size>beam){clipped=true;states=new Map([...next.entries()].sort((a,b)=>b[1].score-a[1].score).slice(0,beam));}else{if(next.size>cap)return {status:"UNKNOWN",dead:i,maxStates};states=next;}}
 let best=null,count=0n;for(let q of states.values()){count+=q.count;if(!best||q.score>best.score)best=q;}return {status:"SAT",P:arr(best.out),score:best.score/C.length,maxStates,paths:count.toString(),clipped};
}
let controls=[],start=batch===0?2001:18001;for(let role of ["plain","cipher"])for(let hold of [false,true]){if(batch!==0&&batch!==1+2*(role==="cipher")+(hold?1:0))continue;let P=D.slice(start,start+12956),S=perm(),R=Array.from({length:n},()=>Math.floor(rand()*n)),A=perm(),C=encode(P,S,R,A,role,hold).C,fit=8000,r=recover(P.slice(0,fit),C.slice(0,fit),role,hold,batch===0?2000:500);let matches=null,decoded=null,keyMatches=null;if(r.key){
 let enc=encode(P,r.key.S,r.key.R,r.key.A,role,hold),prefix=encode(P.slice(0,fit),r.key.S,r.key.R,r.key.A,role,hold);if(prefix.C.some((c,i)=>c!==C[i]))throw Error("fit replay");matches=enc.C.slice(fit).reduce((a,v,i)=>a+(v===C[fit+i]),0);
 let dec=decrypt(C.slice(fit),{...r.key,A:prefix.A},role,hold,P.slice(fit-2,fit),200000,batch!==0&&hold?4096:0);let exactStatus=batch!==0&&hold?"NOT_RUN":dec.status;if(dec.status==="UNKNOWN")dec=decrypt(C.slice(fit),{...r.key,A:prefix.A},role,hold,P.slice(fit-2,fit),200000,4096);dec.exactStatus=exactStatus;if(dec.P){let pp=dec.P;decoded={...dec,P:undefined,accuracy:pp.reduce((a,v,i)=>a+(v===P[fit+i]),0),replay:encode(pp,r.key.S,r.key.R,prefix.A,role,hold).C.every((c,i)=>c===C[fit+i])};}else decoded=dec;
 let ref=S[0]>S[1],flip=x=>ref?28-x:x;keyMatches={S:r.key.S.filter((x,i)=>x===flip(S[i])).length,R:r.key.R.filter((x,i)=>x===flip(R[i])).length,A:r.key.A.filter((x,i)=>x===A[ref?28-i:i]).length};
 }controls.push({start,batch,role,hold,fit,held:P.length-fit,matches,decoded,keyMatches,...r});}
return {controls};
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(paths[0],'utf8')),...paths.slice(1).map(p=>fs.readFileSync(p,'utf8')),Number(process.argv[2]||0)),null,2));
