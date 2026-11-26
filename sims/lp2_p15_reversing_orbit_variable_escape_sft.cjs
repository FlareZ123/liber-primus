'use strict';
// Both operation orders, variable escape with arbitrary selector, Agent6.
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const core=function(data){
 const s=JSON.parse(data[0]),A=29,M=28,mod=(v,n)=>(v%n+n)%n,assert=(x,m)=>{if(!x)throw Error(m)};
 const source=s.pages.slice(16,56).flatMap(p=>p.indices),cut=s.pages.slice(16,40).reduce((a,p)=>a+p.indices.length,0);
 assert(source.length===9194&&cut===5878,"source geometry");
 const primes=[];for(let x=2;primes.length<3301;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
 const F=[];let u=0,v=1;do{F.push(u);[u,v]=[v,(u+v)%3301]}while(u!==0||v!==1);const q=F.length;
 assert(q===1650,"orbit");
 assert([0,1,...F.slice(3,17)].map(x=>Math.abs(3301-primes[x])).join(",")==="3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516","grid");
 const K=[F.map(x=>3301-primes[x]),F.map(x=>Math.abs(3301-primes[x]))].map(a=>Int8Array.from([...a,...a],x=>mod(x,M)));
 const tokens=s.translit.map((x,i)=>({x,i})).sort((a,b)=>b.x.length-a.x.length);
 function native(t){let a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const z=w[0].replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<z.length;){const r=tokens.find(t=>z.startsWith(t.x,i));if(r){a.push(r.i);i+=r.x.length}else i++}}return a}
 const donors=data.slice(1).map(native);
 function upper(t,n){let h=Array(A).fill(0),max=-1,topTwoFloor=Infinity,windows=0,example=-1;for(let i=0;i<t.length;i++){h[t[i]]++;if(i>=n)h[t[i-n]]--;if(i<n-1)continue;let a=0,b=0,minPair=Infinity;for(let j=0;j<A;j++){const c=h[j];if(c>=a){b=a;a=c}else if(c>b)b=c;if(j<M)minPair=Math.min(minPair,c+h[j+1])}if(minPair>max){max=minPair;example=i-n+1}topTwoFloor=Math.min(topTwoFloor,a+b);windows++}return {max,topTwoFloor,windows,example}}
 function raw(x,read){return Int8Array.from(x,(_,i)=>{if(!i)return -1;const d=mod(x[i]-x[i-1],A);return !d?-1:read===0?d-1:x[i]-Number(x[i]>x[i-1])})}
 function offset(R,dir,hold){let t=0,d=dir;return Int16Array.from(R,(r,i)=>{if(!i)return 0;const before=mod(t,q);if(r<0)d=-d;if(r>=0||!hold)t+=d;return before})}
 function hist(R,T,key,phase){let h=new Uint16Array(M*M);for(let i=1;i<cut;i++)if(R[i]>=0)h[R[i]*M+key[T[i]+phase]]++;return h}
 function bound(h){let mins=[];for(let r=0;r<M;r++){let m=Infinity;for(let k=0;k<M;k+=2)m=Math.min(m,h[r*M+k]);mins.push(m)}mins.sort((a,b)=>a-b);return mins.slice(0,14).reduce((a,b)=>a+b,0)}
 // Exact one-rank minimum over all S: assignment objective H[r][S[r]-y].
 // Since translating S by y is bijective, this same bound applies to every y.
 function exact(h){const u=Array(M+1).fill(0),v=Array(M+1).fill(0),p=Array(M+1).fill(0),way=Array(M+1).fill(0);for(let i=1;i<=M;i++){p[0]=i;let j0=0,minv=Array(M+1).fill(Infinity),used=Array(M+1).fill(false);do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=M;j++)if(!used[j]){const cur=h[(i0-1)*M+j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=M;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}return -v[0]}
 const nativeMax=donors.map(t=>upper(t,cut-1)),floor=Math.max(...nativeMax.map(x=>x.max));
 let evaluated=0,minBound=Infinity,minBoundConfig=null,minExact=Infinity,minExactConfig=null,needExact=0,survivors=0,samples=[],maxTop4PlusRepeat=0,maxTop4Config=null;const topTwoFloor=Math.min(...nativeMax.map(x=>x.topTwoFloor));
 for(let read=0;read<2;read++){const R=raw(source,read);for(const hold of [false,true])for(const dir of [-1,1]){const T=offset(R,dir,hold);for(let kind=0;kind<2;kind++){let localMin=Infinity;for(let phase=0;phase<q;phase++){const h=hist(R,T,K[kind],phase),b=bound(h),config={read,hold,dir,kind,phase};evaluated++;if(b<minBound){minBound=b;minBoundConfig=config}if(b<localMin)localMin=b;if(b<=floor){needExact++;const e=exact(h);assert(e>=b,"assignment dominance");if(e<minExact){minExact=e;minExactConfig=config}if(e<=floor){survivors++;if(samples.length<10)samples.push({config,b,e})}}}}}}
 const pow=[],log=Array(A).fill(-1);for(let x=1,i=0;i<M;i++,x=x*15%A){pow.push(x);log[x]=i}assert(new Set(pow).size===28,'root');
 let fullShiftEvals=0;maxTop4PlusRepeat=0;maxTop4Config=null;
 for(let read=0;read<3;read++){const R=read===2?Int8Array.from(source,(x,i)=>i&&x!==source[i-1]?log[mod(x-source[i-1],A)]:-1):raw(source,read);for(const hold of [false,true])for(const dir of [-1,1]){const T=offset(R,dir,hold),pos=[],val=[];for(let i=1;i<cut;i++)if(R[i]>=0){pos.push(T[i]);val.push(R[i])}const reps=cut-1-pos.length;for(let kind=0;kind<2;kind++)for(const sign of [-1,1]){const key=K[kind],h=new Uint16Array(M);for(let phase=0;phase<q;phase++){h.fill(0);for(let i=0;i<pos.length;i++)h[(val[i]-sign*key[pos[i]+phase]+M)%M]++;h.sort();const top4=h[M-1]+h[M-2]+h[M-3]+h[M-4]+reps;fullShiftEvals++;if(top4>maxTop4PlusRepeat){maxTop4PlusRepeat=top4;maxTop4Config={read,hold,dir,kind,sign,phase}}}}}}
 function perm(seed){const p=Array.from({length:M},(_,i)=>i);for(let i=M-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=(seed>>>0)%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
 function encrypt(p,k,map,escape){const inv=Array(M);map.forEach((r,i)=>inv[r]=i);const x=[p[0]];let t=k.phase,d=k.dir;for(let i=1;i<p.length;i++){const prev=x[i-1],z=p[i];if(z===escape){x.push(prev);d=-d;if(!k.hold)t=mod(t+d,q)}else{const r=inv[mod(z-Number(z>escape)+K[k.kind][t],M)];x.push(k.read===0?mod(prev+r+1,A):r+Number(r>=prev));t=mod(t+d,q)}}return x}
 const controls=[];
 for(const [j,o,k,seed,escape] of [[1,1400,{read:0,hold:true,dir:-1,kind:1,phase:763},0x3301,27],[2,12400,{read:1,hold:false,dir:1,kind:0,phase:1481},0x1542,25]]){const p=donors[j].slice(o,o+source.length),map=perm(seed),x=encrypt(p,k,map,escape),R=raw(x,k.read),T=offset(R,k.dir,k.hold),decoded=[x[0]];for(let i=1;i<x.length;i++){const z=R[i]<0?M:mod(map[R[i]]-K[k.kind][T[i]+k.phase],M);decoded.push(z===M?escape:z+Number(z>=escape))}assert(decoded.every((z,i)=>z===p[i]),"plant");const h=hist(R,T,K[k.kind],k.phase),b=bound(h),e=exact(h),counts=Array(A).fill(0);for(let i=1;i<cut;i++)counts[p[i]]++;const minPair=Math.min(...counts.slice(0,-1).map((x,i)=>x+counts[i+1]));assert(b<=e&&e<=minPair,"control bound");controls.push({donor:j,config:k,escape,knownKeyFitHits:cut-1,knownKeyHeldHits:p.length-cut,parityBound:b,assignmentBound:e,minAdjacentPair:minPair})}
 return {n:source.length,cut,orbit:q,nativeMax,globalNativeMinAdjacentPairMax:floor,topTwoFloor,maxTop4PlusRepeat,maxTop4Config,fullShiftEvals,evaluated,equivalentFullConfigurations:evaluated*3,minBound,minBoundConfig,needExact,minExact:Number.isFinite(minExact)?minExact:null,minExactConfig,survivors,samples,controls};
};
if(require.main===module)console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={core};
