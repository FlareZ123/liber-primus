"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
function experiment(source,native,gibran,emerson,shakespeare){
 const Q=29,L=243,q=13,T=162,mod=x=>(x%29+29)%29;
 const token=Object.fromEntries(source.translit.map((s,i)=>[s,i]));
 function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Q/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let d=w.slice(i,i+2);if(d.length===2&&token[d]!==undefined){out.push(token[d]);i+=2;}else{out.push(token[w[i++]]);}}}return out}
 const uni=new Float64Array(Q).fill(1),bi=new Float64Array(Q*Q).fill(0);
 function learn(a){for(let i=0;i<a.length;i++){uni[a[i]]++;if(i)bi[a[i-1]*Q+a[i]]++}}
 for(const sec of native.sections)learn([...sec.source_text].map(c=>native.runes.indexOf(c)).filter(i=>i>=0));
 learn(gp(emerson).slice(1000));
 const total=uni.reduce((a,b)=>a+b,0);const p1=Array.from(uni,x=>x/total),log1=p1.map(Math.log),log2=new Float64Array(Q*Q);
 for(let a=0;a<Q;a++){let n=0;for(let b=0;b<Q;b++)n+=bi[a*Q+b];for(let b=0;b<Q;b++)log2[a*Q+b]=Math.log((bi[a*Q+b]+12*p1[b])/(n+12))}
 let rng=0x18c1c1e3;const next=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
 const rot=(a,k)=>a.slice(k).concat(a.slice(0,k));
 const det=a=>mod(a[0]**3+a[1]**3+a[2]**3-3*a[0]*a[1]*a[2]);
 const lex=a=>a[0]*Q*Q+a[1]*Q+a[2];
 const canonical=a=>lex(a)===Math.min(lex(a),lex(rot(a,1)),lex(rot(a,2)));
 function inverse(a){const d=det(a);if(!d)throw Error("singular");let inv=1;while(mod(d*inv)!==1)inv++;return [a[0]**2-a[1]*a[2],a[2]**2-a[0]*a[1],a[1]**2-a[0]*a[2]].map(x=>mod(x*inv))}
 function mix(a,row,shifts){let b=new Uint8Array(3*L);for(let j=0;j<3;j++)for(let i=0;i<L;i++)b[j*L+i]=mod(row[0]*a[j*L+i]+row[1]*a[((j+1)%3)*L+i]+row[2]*a[((j+2)%3)*L+i]+(shifts?shifts[i%q]:0));return b}
 function encrypt(p,row,k){return mix(p.map((v,i)=>mod(v-k[(i%L)%q])),inverse(row),null)}
 function objective(a,start,end){let sum=0,n=0;for(let j=0;j<3;j++)for(let i=start+1;i<end;i++){sum+=log2[a[j*L+i-1]*Q+a[j*L+i]];n++}return sum/n+Math.log(Q)}
 const shifted=Array.from({length:Q},(_,k)=>Array.from({length:Q},(_,v)=>log1[(v+k)%Q]));
 function refine(y){
   const edges=Array.from({length:q},()=>new Float64Array(Q*Q)); 
   for(let j=0;j<3;j++)for(let i=1;i<T;i++){let x=y[j*L+i-1],z=y[j*L+i],e=edges[(i-1)%q];for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)e[a*Q+b]+=log2[((x+a)%Q)*Q+(z+b)%Q]}
   let best=-Infinity,bk=null;
   for(let a=0;a<Q;a++){
     let dp=new Float64Array(Q).fill(-Infinity);dp[a]=0;const trace=[];
     for(let phase=0;phase<q-1;phase++){const v=new Float64Array(Q).fill(-Infinity),arg=new Int8Array(Q),e=edges[phase];for(let x=0;x<Q;x++)for(let z=0;z<Q;z++){let s=dp[x]+e[x*Q+z];if(s>v[z]){v[z]=s;arg[z]=x}}dp=v;trace.push(arg)}
     for(let z=0;z<Q;z++){let score=dp[z]+edges[q-1][z*Q+a];if(score>best){best=score;let k=new Array(q);k[q-1]=z;for(let t=q-2;t>=0;t--)k[t]=trace[t][k[t+1]];bk=k}}
   }
   return {score:best,key:bk};
 }
 function solve(c){let rows=[],n=0;const hist=new Int16Array(q*Q),y=new Uint8Array(3*L);for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let d=0;d<Q;d++){const row=[a,b,d];if(!det(row)||!canonical(row))continue;n++;hist.fill(0);for(let i=0;i<T;i++){const x=c[i],z=c[L+i],w=c[2*L+i],base=(i%q)*Q;hist[base+mod(a*x+b*z+d*w)]++;hist[base+mod(a*z+b*w+d*x)]++;hist[base+mod(a*w+b*x+d*z)]++}let s=0;for(let phase=0;phase<q;phase++){let best=-Infinity;for(let k=0;k<Q;k++){let v=0;const lk=shifted[k];for(let x=0;x<Q;x++)v+=hist[phase*Q+x]*lk[x];if(v>best)best=v}s+=best}if(rows.length<64||s>rows[rows.length-1].score){rows.push({row,score:s});rows.sort((a,b)=>b.score-a.score);if(rows.length>64)rows.pop()}}
 let best=null;for(const rr of rows){let z=mix(c,rr.row,null),res=refine(z);if(!best||res.score>best.score)best={...res,row:rr.row};}
 const p=mix(c,best.row,best.key);return {row:best.row,key:best.key,n,train:objective(p,0,T),hold:objective(p,T,L),plain:Array.from(p),roundtrip:Array.from(encrypt(p,best.row,best.key)).every((v,i)=>v===c[i])}
 }
 const donors=[gp(gibran),gp(shakespeare),gp(gibran)];const starts=[200,300,1400];const controls=[];
 for(let k=0;k<3;k++){const p=Uint8Array.from(donors[k].slice(starts[k],starts[k]+3*L));if(p.length!==3*L||p.some(x=>x>=29))throw Error("bad donor");let row;do{row=[next()%29,next()%29,next()%29]}while(!det(row)||!canonical(row));const key=Array.from({length:q},()=>next()%29);const c=encrypt(p,row,key),s=solve(c);const train=Array.from({length:3},(_,j)=>s.plain.slice(j*L,j*L+T)).flat(),truth=Array.from({length:3},(_,j)=>Array.from(p.slice(j*L,j*L+T))).flat();const held=Array.from({length:3},(_,j)=>s.plain.slice(j*L+T,(j+1)*L)).flat(),trueHeld=Array.from({length:3},(_,j)=>Array.from(p.slice(j*L+T,(j+1)*L))).flat();controls.push({row,key,foundRow:s.row,foundKey:s.key,train:s.train,hold:s.hold,trainExact:train.filter((x,i)=>x===truth[i]).length,holdExact:held.filter((x,i)=>x===trueHeld[i]).length,roundtrip:s.roundtrip,n:s.n})}
 if(!controls.every(x=>x.holdExact===243&&x.trainExact===486&&x.roundtrip))return {controls,original:null};
 const c=Uint8Array.from(source.pages.filter(p=>p.page>=0&&p.page<=2).flatMap(p=>p.indices));
 if(c.length!==729)throw Error("bad original count");
 const s=solve(c);return {controls,original:s};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const vals=files.map((p,i)=>{let s=fs.readFileSync(path.join(root,p),"utf8");return i<2?JSON.parse(s):s.split(/\r?\n/).slice(0,400).join("\n")});
console.log(JSON.stringify(experiment(...vals),null,2));
