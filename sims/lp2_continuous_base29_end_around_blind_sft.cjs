'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const B=29n,L=144,H=144,BOUND=3301;
 const texts=native.sections.map(s=>[...s.source_text].map(c=>corpus.runes.indexOf(c)).filter(i=>i>=0));
 const pack=p=>p.reduce((x,y)=>x*B+BigInt(y),0n);
 function digits(x,n){const p=new Array(n);for(let i=n-1;i>=0;i--){p[i]=Number(x%B);x/=B;}if(x)throw Error("overflow");return p;}
 const mod=(x,m)=>(x%m+m)%m;
 function inv(a,m){let x=0n,y=1n,u=m,v=mod(a,m);while(v){let q=u/v;[u,v]=[v,u-q*v];[x,y]=[y,x-q*y];}return u===1n?mod(x,m):null;}
 function model(ex,rev){const u=new Float64Array(29).fill(.5),b=new Float64Array(841).fill(.1),t=new Float64Array(24389).fill(.05);for(let k=0;k<texts.length;k++)if(k!==ex){let p=rev?[...texts[k]].reverse():texts[k];for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*29+p[i]]++;if(i>1)t[(p[i-2]*29+p[i-1])*29+p[i]]++;}}let z=u.reduce((a,b)=>a+b);for(let i=0;i<29;i++)u[i]/=z;for(let i=0;i<29;i++){let s=0;for(let j=0;j<29;j++)s+=b[29*i+j];for(let j=0;j<29;j++)b[29*i+j]=.8*b[29*i+j]/s+.2*u[j];}for(let i=0;i<841;i++){let s=0;for(let j=0;j<29;j++)s+=t[29*i+j];for(let j=0;j<29;j++)t[29*i+j]=Math.log(.7*t[29*i+j]/s+.3*b[(i%29)*29+j]);}return t;}
 const score=(p,t,start=2,end=p.length)=>{let s=0;for(let i=start;i<end;i++)s+=t[(p[i-2]*29+p[i-1])*29+p[i]];return s/(end-start);};
 function search(c,t){
   const n=c.length,M=B**BigInt(n)-1n,C=pack(c),cut=B**BigInt(n-L),rank=[];
   if(C===M)throw Error("reserved sentinel");
   for(let a=1;a<=BOUND;a++){const A=BigInt(a),mi=inv(M,A);if(mi===null)continue;
      for(let sign of [1,-1]){const Z=sign===1?C:mod(-C,M),k=mod(-Z*mi,A),P=(Z+k*M)/A;const p=digits(P/cut,L);rank.push({a,sign,fit:score(p,t),P});}}
   rank.sort((x,y)=>y.fit-x.fit||x.a-y.a||y.sign-x.sign);
   const w=rank[0],p=digits(w.P,n),replay=mod(BigInt(w.sign*w.a)*pack(p),M)===C;
   return {count:rank.length,key:[w.sign,w.a],runner:[rank[1].sign,rank[1].a,rank[1].fit],fit:w.fit,hold:score(p,t,L,L+H),rawHold:score(c,t,L,L+H),full:score(p,t),replay,p,preview:p.slice(0,60).map(i=>corpus.translit[i]).join(" "),holdPreview:p.slice(L,L+60).map(i=>corpus.translit[i]).join(" ")};
 }
 const controls=[];
 for(const [section,target,sign,rev] of [[1,1033,1,false],[3,3299,-1,true],[4,463,-1,false],[5,3301,1,true]]){const p=rev?[...texts[section]].reverse():texts[section],M=B**BigInt(p.length)-1n;let a=target;while(inv(M,BigInt(a))===null)a--;const c=digits(mod(BigInt(sign*a)*pack(p),M),p.length),t=model(section,rev),res=search(c,t);let {p:dec,...summary}=res;controls.push({name:native.sections[section].name,rev,planted:[sign,a],...summary,exact:dec.filter((x,i)=>x===p[i]).length,total:p.length,holdExact:dec.slice(L,L+H).filter((x,i)=>x===p[L+i]).length});}
 const orig=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),original=[];
 for(const rev of [false,true]){const c=rev?[...orig].reverse():orig,t=model(-1,rev),res=search(c,t);const {p,...summary}=res;original.push({rev,...summary,total:p.length,adjacent:p.filter((x,i)=>i&&x===p[i-1]).length});}
 return {bound:BOUND,fit:L,holdout:H,controls,original};
}
const c=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const n=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
console.log(JSON.stringify(experiment(c,n),null,2));
