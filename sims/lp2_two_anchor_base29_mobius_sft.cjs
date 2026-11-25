'use strict';
const fs=require('node:fs'),path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(corpus,training,donors){
 const N=85,B=29n,Q=B**BigInt(N),W=256,mod=(x,m)=>((x%m)+m)%m;
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const powers=Array.from({length:N+1},(_,i)=>B**BigInt(i));
 const alphabet=new Map(corpus.translit.map((x,i)=>[x,i]));
 function native(text){let out=[];for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/IO/g,"IA");for(const t of w.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[])out.push(alphabet.get(t==="ING"?"NG":t))}assert(out.every(Number.isInteger),"native");return out}
 const train=native(training), uni=new Float64Array(29).fill(.5), bi=new Float64Array(841).fill(.5), tri=new Float64Array(24389).fill(.25);
 for(let i=0;i<train.length;i++){uni[train[i]]++;if(i)bi[29*train[i-1]+train[i]]++;if(i>=2)tri[841*train[i-2]+29*train[i-1]+train[i]]++}
 const lp1=Array.from(uni,v=>Math.log(v/(train.length+14.5)));
 const lp2=Array.from(bi,(v,i)=>{let j=Math.floor(i/29);return Math.log(.9*v/bi.slice(j*29,j*29+29).reduce((a,b)=>a+b,0)+.1*Math.exp(lp1[i%29]))});
 const lp3=Array.from(tri,(v,i)=>{let j=Math.floor(i/29);return Math.log(.8*v/tri.slice(j*29,j*29+29).reduce((a,b)=>a+b,0)+.2*Math.exp(lp2[i%841]))});
 function score(p){let s=lp1[p[0]];if(p.length>1)s+=lp2[29*p[0]+p[1]];for(let i=2;i<p.length;i++)s+=lp3[841*p[i-2]+29*p[i-1]+p[i]];return s/p.length}
 function toInt(a){return a.reduceRight((v,x)=>v*B+BigInt(x),0n)}
 function digits(v){v=mod(v,Q);return Array.from({length:N},()=>{const x=Number(v%B);v/=B;return x})}
 function inv(v){let a=Q,b=mod(v,Q),u=0n,w=1n;while(b){let q=a/b;[a,b]=[b,a-q*b];[u,w]=[w,u-q*w]}assert(a===1n,"nonunit");return mod(u,Q)}
 function setup(x0,y0,x1,y1){
   assert(mod(x1-x0,B)!==0n&&mod(y1-y0,B)!==0n,"distinct unit anchors");
   const slope=mod((y1-y0)*inv(x1-x0),Q);
   function coeff(c){let a=mod(slope+c*(slope*x1+y0),Q),b=mod(y0*(1n+c*x0)-a*x0,Q);return {a,b}}
   function forward(x,c){const {a,b}=coeff(c);return mod((a*x+b)*inv(1n+c*x),Q)}
   function backward(y,c){const {a,b}=coeff(c);return mod((y-b)*inv(a-c*y),Q)}
   return {x0,y0,x1,y1,slope,coeff,forward,backward}
 }
 function infer(s,tracks,truth){
   const t=tracks.map(x=>mod((x-s.x0)*s.slope,Q)), der=t.map((v,j)=>Number(mod(v*(s.x1-tracks[j]),B)));
   assert(der.some(x=>x!==0),"unidentifiable digit");
   let beam=[{c:0n,p:tracks.map(()=>0n),l:tracks.map(()=>0),ll:tracks.map(()=>0),score:0}],firstMissing=null;
   for(let d=0;d<N;d++){
     const h=powers[d],h1=powers[d+1],children=[];
     for(let state of beam){
       const r=tracks.map((x,j)=>{
         let num=t[j]*(1n+state.c*s.x1)-(1n+state.c*x)*(state.p[j]-s.y0);
         assert(num%h===0n,"lift residual");
         return Number(mod(num/h,B));
       });
       for(let k=0;k<(d?29:1);k++){
         const z=r.map((v,j)=>(v+k*der[j])%29);
         let sum=state.score;for(let j=0;j<z.length;j++)sum+=d===0?lp1[z[j]]:d===1?lp2[29*state.l[j]+z[j]]:lp3[841*state.ll[j]+29*state.l[j]+z[j]];
         children.push({state,k,z,score:sum});
       }
     }
     children.sort((a,b)=>b.score-a.score);beam=children.slice(0,W).map(({state,k,z,score})=>({c:state.c+BigInt(k)*h,p:state.p.map((v,j)=>v+BigInt(z[j])*h),l:z,ll:state.l,score}));
     if(truth!==null&&firstMissing===null&&!beam.some(v=>v.c===truth%h1))firstMissing=d;
   }
   const winner=beam[0];for(let j=0;j<tracks.length;j++)assert(winner.p[j]===s.forward(tracks[j],winner.c),"full modular verification");
   return {key:winner.c,firstMissing,trainScore:winner.score/(N*tracks.length),derivatives:der,rank:truth===null?null:beam.findIndex(x=>x.c===truth)};
 }
 function seeded(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}}
 function plant(text,seed){
   const p=native(text);assert(p.length>3000,"donor size");let q=seeded(seed);
   const parts=Array.from({length:11},(_,i)=>p.slice(600+i*200,600+i*200+N));let off=0;while(parts[0][0]===parts[1][0]){off++;parts[1]=p.slice(800+off,800+off+N)}
   const ys=parts.map(toInt),c=toInt(Array.from({length:N},(_,i)=>i? q()%29:0)),a=toInt(Array.from({length:N},(_,i)=>i?q()%29:1+q()%28)),b=toInt(Array.from({length:N},()=>q()%29));
   const xs=ys.map(y=>mod((y-b)*inv(a-c*y),Q)),s=setup(xs[0],ys[0],xs[1],ys[1]);
   assert(s.coeff(c).a===a&&s.coeff(c).b===b,"plant anchors");
   const fit=infer(s,xs.slice(2,9),c);
   const held=xs.slice(9).map((x,i)=>{let p=digits(s.forward(x,fit.key));assert(s.backward(toInt(p),fit.key)===x,"plant replay");return {correct:p.filter((v,j)=>v===parts[9+i][j]).length,score:score(p)}});
   return {seed,key:c.toString(),recovered:fit.key.toString(),exact:fit.key===c,firstMissing:fit.firstMissing,rank:fit.rank,trainScore:fit.trainScore,held};
 }
 const plants=donors.map((p,i)=>plant(p,[0x3301,0x1033][i]));
 const c56=corpus.pages.find(p=>p.page===56).indices,c57=corpus.pages.find(p=>p.page===57).indices;
 assert(c56.length===85&&c57.length===95,"source geometry");
 let primes=[];for(let x=2;primes.length<84;x++){let prime=true;for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break}if(prime)primes.push(x)}
 let k=0;const p56=c56.map((v,i)=>i===56?0:Number(mod(BigInt(v-primes[k++]+1),B)));
 k=0;assert(p56.every((v,i)=>c56[i]===(i===56?0:(v+primes[k++]-1)%29))&&k===84&&primes.at(-1)===433,"authentic control");
 let original=null;
 if(plants.every(x=>x.exact&&x.held.every(y=>y.correct===N))){
   const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
   const s=setup(toInt(c56),toInt(p56),toInt(c57.slice(0,N)),toInt(c57.slice(0,N)));
   const xs=ranges.map(([lo,hi])=>toInt(corpus.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices).slice(0,N)));
   const fit=infer(s,xs.slice(1,8),null),c=fit.key,{a,b}=s.coeff(c);
   const tapes=xs.map((x,i)=>{const p=s.forward(x,c);assert(s.backward(p,c)===x,"original replay");const d=digits(p);return {range:ranges[i],held:i===0||i===8,score:score(d),plain:d,text:d.map(v=>corpus.translit[v]).join("")}});
   assert(s.forward(s.x0,c)===s.y0&&s.forward(s.x1,c)===s.y1,"authentic anchor replay");
   original={c:c.toString(),a:a.toString(),b:b.toString(),trainScore:fit.trainScore,derivatives:fit.derivatives,tapes};
 }
 return {N,W,plants,original,source56:p56};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const data=paths.map((p,i)=>i<2?read(p):read(p).split('\n').slice(0,300).join('\n'));console.log(JSON.stringify(experiment(JSON.parse(data[0]),data[1],data.slice(2)),null,2));
