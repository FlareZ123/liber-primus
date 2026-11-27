'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const mod=(x,m)=>((x%m)+m)%m;
 const floor=(a,b)=>{if(b<0n){a=-a;b=-b}const q=a/b;return a<0n&&a%b!==0n?q-1n:q};
 const ceil=(a,b)=>-floor(-a,b),abs=x=>x<0n?-x:x;
 const inv=(a,m)=>{let [x,y,u,v]=[mod(a,m),m,1n,0n];while(y){const q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit");return mod(u,m)};
 const big=x=>x.reduceRight((a,b)=>a*29n+BigInt(b),0n);
 function digits(x,n){const a=[];for(let j=0;j<n;j++){a.push(Number(x%29n));x/=29n}return a}
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)})),train=sections.filter(s=>!["0_koan_1","0_loss_of_divinity"].includes(s.name));
 const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
 for(const s of train){const x=s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++}}
 const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
 const logs=t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,p=a%29;return Math.log(.6*v/ts[a]+.3*b[p*29+c]/bs[p]+.1*u[c]/us)});
 function score(P,start,end){let s=0;for(let i=start+2;i<end;i++)s+=logs[(P[i-2]*29+P[i-1])*29+P[i]];return s/(end-start-2)}
 const title=[19,13,10,13,8,25,9,27,15,19,19,5,15],N=729,H=13,L=29n**3n,M=29n**13n,Q=29n**BigInt(N);

 const gcd=(a,b)=>{a=abs(a);b=abs(b);while(b)[a,b]=[b,a%b];return a};
 function frac(a,b=1n){if(b===0n)throw Error("zero fraction");if(b<0n){a=-a;b=-b}const g=gcd(a,b);return [a/g,b/g]}
 const add=(x,y)=>frac(x[0]*y[1]+x[1]*y[0],x[1]*y[1]),sub=(x,y)=>frac(x[0]*y[1]-y[0]*x[1],x[1]*y[1]),mul=(x,y)=>frac(x[0]*y[0],x[1]*y[1]),div=(x,y)=>frac(x[0]*y[1],x[1]*y[0]),lt=(x,y)=>x[0]*y[1]<y[0]*x[1],dot=(x,y)=>x.reduce((s,v,i)=>add(s,mul(v,y[i])),[0n,1n]);
 function lll(input){const B=input.map(x=>x.slice()),n=B.length;let k=1,rounds=0;
 function gs(){const U=[],mu=[],D=[];for(let i=0;i<n;i++){let v=B[i].map(x=>frac(x));mu[i]=[];for(let j=0;j<i;j++){const a=div(dot(B[i].map(x=>frac(x)),U[j]),D[j]);mu[i][j]=a;v=v.map((x,s)=>sub(x,mul(a,U[j][s])))}U.push(v);D.push(dot(v,v))}return {mu,D}}
 let g=gs();while(k<n){if(++rounds>10000)throw Error("LLL iterations");for(let j=k-1;j>=0;j--){const [a,b]=g.mu[k][j],q=floor(2n*a+b,2n*b);if(q!==0n){B[k]=B[k].map((x,i)=>x-q*B[j][i]);g=gs()}}
 if(!lt(g.D[k],mul(sub([3n,4n],mul(g.mu[k][k-1],g.mu[k][k-1])),g.D[k-1])))k++;else{[B[k],B[k-1]]=[B[k-1],B[k]];g=gs();k=Math.max(1,k-1)}}
 return {B,rounds};}
 function det(A){if(A.length===1)return A[0][0];let d=0n;for(let i=0;i<A.length;i++)d+=(i%2?-1n:1n)*A[0][i]*det(A.slice(1).map(r=>r.filter((_,j)=>j!==i)));return d}
 function searchLattice(x,y,m,lim){
 const basis=[[1n,-x,0n,0n],[0n,m,0n,0n],[0n,mod(x*y,m),1n,0n],[0n,y,0n,1n]],red=lll(basis),B=red.B;
 if(lim===null){let min=null;for(let a=-1n;a<=1n;a++)for(let b=-1n;b<=1n;b++)for(let c=-1n;c<=1n;c++)for(let d=-1n;d<=1n;d++){const k=B[0].map((_,i)=>a*B[0][i]+b*B[1][i]+c*B[2][i]+d*B[3][i]);if(!valid(k,x,m))continue;const s=k.map(abs).reduce((a,b)=>a>b?a:b);if(min===null||s<min)min=s}if(min===null)throw Error('no valid upper bound');lim=min+1n;}const d=det(B);if(abs(d)!==m)throw Error("det changed");const adj=B.map((_,i)=>B.map((_,j)=>( (i+j)%2?-1n:1n)*det(B.filter((_,k)=>k!==j).map(row=>row.filter((_,k)=>k!==i)))));
 const U=adj.map((_,j)=>floor((lim-1n)*adj.reduce((s,row)=>s+abs(row[j]),0n),abs(d))),points=[];let visited=0;
 for(let i=-U[0];i<=U[0];i++)for(let j=-U[1];j<=U[1];j++)for(let k=-U[2];k<=U[2];k++)for(let h=-U[3];h<=U[3];h++){
 visited++;const p=B[0].map((_,a)=>i*B[0][a]+j*B[1][a]+k*B[2][a]+h*B[3][a]);if(p.some(z=>abs(z)>=lim))continue;points.push(p);
 }
 return {points,visited,rounds:red.rounds,U:U.map(String),lim};
 }
 function valid(K,x,m){const [a,b,c,d]=K;return mod(a*d-b*c,29n)!==0n&&mod(c*x+d,29n)!==0n}
 function apply(x,K,m){const [a,b,c,d]=K;return mod((a*x+b)*inv(c*x+d,m),m)}
 const inverse=([a,b,c,d])=>[d,-b,-c,a];
 function canonical(K){const gg=K.reduce((g,x)=>gcd(g,x),0n);if(gg===0n)return null;const s=K.find(x=>x!==0n)>0n?gg:-gg;return K.map(x=>x/s)}
 function search(C,Ptitle){
 const X=big(C.slice(0,H)),Y=big(Ptitle),r=searchLattice(X,Y,M,null),set=new Map();
 for(const K of r.points){if(mod(K[0]*X+K[1]-Y*(K[2]*X+K[3]),M)!==0n)throw Error("bad lattice");const k=canonical(K);if(!k||!valid(k,X,M))continue;set.set(k.join(","),k)}
 const norm=K=>K.map(abs).reduce((a,b)=>a>b?a:b),minimum=[...set.values()].map(norm).reduce((a,b)=>a<b?a:b);const ranked=[...set.values()].filter(K=>norm(K)===minimum).map(K=>{const P=digits(apply(big(C),K,Q),N);if(P.slice(0,H).join()!==Ptitle.join()||apply(big(P),inverse(K),Q)!==big(C))throw Error("replay");return {K:K.map(String),fit:score(P,H,262),P}}).sort((a,b)=>b.fit-a.fit);
 const best=ranked[0],base={visited:r.visited,rounds:r.rounds,coordinateBounds:r.U,rawLatticePoints:r.points.length,primitiveMatrices:set.size,upperBound:String(r.lim-1n),minimum:String(minimum),keys:ranked.map(({K,fit})=>({K,fit}))};
 return best?{...base,winner:{K:best.K,fit:best.fit,held:score(best.P,262,N),replay:true},P:best.P}:base;
 }
 function toys(){let checked=0;for(const [m,lim] of [[11n,3n],[29n,4n],[49n,4n]])for(let x=0n;x<m;x+=3n)for(let y=0n;y<m;y+=5n){
 const r=searchLattice(x,y,m,lim).points.map(p=>p.join(",")).sort(),truth=[];
 for(let a=1n-lim;a<lim;a++)for(let b=1n-lim;b<lim;b++)for(let c=1n-lim;c<lim;c++)for(let d=1n-lim;d<lim;d++)if(mod(a*x+b-y*(c*x+d),m)===0n)truth.push([a,b,c,d].join(","));
 if(r.join(";")!==truth.sort().join(";"))throw Error("toy completeness");checked++}
 return checked;}
 const C=corpus.pages.slice(0,3).flatMap(p=>p.indices),r=search(C,title),{P,...rest}=r,out={title,cipherTitle:C.slice(0,H),domain:"exact globally smallest primitive projective matrices by coefficient max absolute value, determinant and denominator units",toyChecks:toys(),original:{...rest,sample:P?P.slice(H,H+140).map(v=>corpus.translit[v]).join(" "):null},plants:[]};
 for(const [name,K0] of [["0_koan_1",[18293n,-14517n,9311n,21417n]],["0_loss_of_divinity",[19331n,15441n,-11017n,15007n]]]){
 const D=sections.find(s=>s.name===name).seq.slice(0,N),K=K0.slice();while(!valid(inverse(K),big(D),Q))K[3]++;const C=digits(apply(big(D),inverse(K),Q),N),z=search(C,D.slice(0,H)),{P:PP,...rr}=z;
 out.plants.push({name,expectedK:canonical(K).map(String),...rr,fitCorrect:PP?PP.slice(H,262).filter((v,i)=>v===D[i+H]).length:0,heldCorrect:PP?PP.slice(262).filter((v,i)=>v===D[i+262]).length:0});
 }
 return out;
}


console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
