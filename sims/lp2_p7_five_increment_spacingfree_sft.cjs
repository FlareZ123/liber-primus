"use strict";
// Agent 3: spacing-free GP29 five-increment random-walk inverse.
// node sims/lp2_p7_five_increment_spacingfree_sft.cjs
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(corpus,solved,literary,config={shortlist:48,trigrams:8,controls:true,original:true}) {
 const N=29,mod=x=>(x%N+N)%N,check=(ok,msg)=>{if(!ok)throw Error(msg)},runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g," ");const a=[];for(const w of s.split(/ +/))for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));check(t,"encode "+w);a.push(t.i);i+=t.s.length}}return a}
 const native=solved.sections.map(s=>({name:s.name,tape:[...s.source_text].filter(c=>runeIndex.has(c)).map(c=>runeIndex.get(c))}));
 const lit=literary.map((text,i)=>({name:["Gibran","Shakespeare","Emerson"][i],tape:encode(text).slice(4000,44000)}));check(lit.every(x=>x.tape.length===40000),"literary length");
 const target=corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices).slice(12);check(target.length===1717,"target length");
 const source=[2,8,11,15,26],inverse=source.map(k=>mod(-k)).sort((a,b)=>a-b),mask=B=>B.reduce((m,r)=>m|(1<<r),0);
 const banks=[],bankIds=new Map();
 function enumerate(B,next){if(B.length===5){bankIds.set(mask(B),banks.length);banks.push(B);return}for(let r=next;r<=N-(5-B.length);r++)enumerate([...B,r],r+1)}
 enumerate([],0);check(banks.length===118755,"bank count");const sourceIds=[bankIds.get(mask(source)),bankIds.get(mask(inverse))];
 function language(exclude){const u=new Float64Array(N).fill(.5),b=new Float64Array(N*N),t=new Float64Array(N*N*N),bc=new Float64Array(N),tc=new Float64Array(N*N),d=new Float64Array(N).fill(.5),df=new Float64Array(N).fill(.5);
 for(const s of [...native,...lit]){if(s.name===exclude)continue;for(let i=0;i<s.tape.length;i++){const p=s.tape[i];u[p]++;if(i){const a=s.tape[i-1];b[a*N+p]++;bc[a]++;d[mod(p-a)]++;if(p&&a)df[mod(p-a)]++}if(i>=2){const ab=s.tape[i-2]*N+s.tape[i-1];t[ab*N+p]++;tc[ab]++}}}
 for(const arr of [u,d,df]){const z=arr.reduce((a,b)=>a+b,0);for(let i=0;i<N;i++)arr[i]/=z}
 for(let a=0;a<N;a++)for(let p=0;p<N;p++)b[a*N+p]=(b[a*N+p]+20*u[p])/(bc[a]+20);
 for(let ab=0;ab<N*N;ab++)for(let p=0;p<N;p++)t[ab*N+p]=(t[ab*N+p]+12*b[(ab%N)*N+p])/(tc[ab]+12);
 return {u,b,t,d,df}}
 /** Rank increment sets by a marginal difference likelihood. Ranking for hold mode conditions on pairs of visible nonzero outputs and is heuristic. */
 function rank(c,cut,hold,M){const h=new Uint32Array(N),d=hold?M.df:M.d;
 for(let i=1;i<cut;i++)if(!hold||c[i]&&c[i-1])h[mod(c[i]-c[i-1])]++;
 const scores=new Float64Array(banks.length);for(let id=0;id<banks.length;id++){const B=banks[id],m=mask(B);let s=0;for(let delta=0;delta<N;delta++){let v=0;for(const r of B){const p=d[mod(delta-r)];v+=p*(delta===0?.04:(m&(1<<mod(r-delta)))?.24:.2)}s+=h[delta]*Math.log(v)}scores[id]=s}
 const order=Array.from({length:banks.length},(_,i)=>i).sort((a,b)=>scores[b]-scores[a]||a-b);return {order,scores}}
 /** Exact observation likelihood and MAP inverse for the finite random-walk model. */
 function forward(c,cut,B,hold,M,tri=false,wantPath=false){const stride=tri?N*N:N,size=N*stride,n=c.length,m=mask(B),enc=(k,a,b)=>k*stride+(tri?a*N+b:b);
 let curr=new Float64Array(size),next=new Float64Array(size),active=[],v=wantPath?new Float64Array(size).fill(-Infinity):null,vn=wantPath?new Float64Array(size).fill(-Infinity):null,backs=wantPath?[]:null;
 const first=c[0];let total=0;
 function init(k,p){const id=enc(k,0,p),prob=M.u[p]/N;curr[id]=prob;active.push(id);total+=prob;if(wantPath)v[id]=Math.log(prob)}
 for(let k=0;k<N;k++){let p=mod(first-k);if(!hold||p!==0)init(k,p);if(hold&&first===0)init(k,0)}
 check(total>0,"initial likelihood");let log=Math.log(total),prefix=cut===1?log:null;for(const id of active)curr[id]/=total;
 for(let i=1;i<n;i++){const obs=c[i],delta=mod(obs-c[i-1]),weight=B.map(r=>delta===0?.04:(m&(1<<mod(r-delta)))?.24:.2),newActive=[],bp=wantPath?new Map():null;let z=0;
 for(const id of active){const k=Math.floor(id/stride),b=id%N,ab=id%stride,base=tri&&i>=2?ab*N:b*N,probs=tri&&i>=2?M.t:M.b;
 const add=(k2,p,w)=>{const j=enc(k2,b,p),q=probs[base+p]*w,x=curr[id]*q;if(!next[j])newActive.push(j);next[j]+=x;z+=x;if(wantPath){const s=v[id]+Math.log(q);if(s>vn[j]){vn[j]=s;bp.set(j,id)}}};
 if(hold&&obs===0)add(k,0,1);
 for(let j=0;j<B.length;j++){const k2=mod(k+B[j]),p=mod(obs-k2);if(!hold||p!==0)add(k2,p,weight[j])}
 }
 check(z>0,"empty state at "+i);log+=Math.log(z);for(const id of newActive)next[id]/=z;for(const id of active){curr[id]=0;if(wantPath)v[id]=-Infinity}
 [curr,next]=[next,curr];active=newActive;if(wantPath){[v,vn]=[vn,v];backs.push(bp)}if(i+1===cut)prefix=log;
 }
 if(!wantPath)return {prefix,log};
 let id=active.reduce((a,b)=>v[a]>=v[b]?a:b),p=Array(n),k=Array(n);for(let i=n-1;i>=0;i--){p[i]=id%N;k[i]=Math.floor(id/stride);if(i)id=backs[i-1].get(id)}
 let replay=0;for(let i=0;i<n;i++){if(hold&&p[i]===0){check(c[i]===0&&(!i||k[i]===k[i-1]),"F replay")}else{check(mod(p[i]+k[i])===c[i]&&(!i||m&(1<<mod(k[i]-k[i-1]))),"consuming replay")}replay++}
 return {prefix,log,p,k,replay}}
 function nullLog(c,cut){let log=-Math.log(N),prefix=null;const rate=86/12901;for(let i=1;i<c.length;i++){log+=Math.log(c[i]===c[i-1]?rate:(1-rate)/28);if(i+1===cut)prefix=log}return {prefix,log}}
 function plant(p,B,hold,seed){let s=seed>>>0;const rng=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0};let k=rng()%N,c=[],states=[],attempts=0,leaks=0;for(const x of p){if(hold&&x===0){c.push(0);states.push(k);continue}let r=B[rng()%5],next=mod(k+r),v=mod(x+next);if(v===c.at(-1)){attempts++;r=B[rng()%5];next=mod(k+r);v=mod(x+next);if(v===c.at(-1))leaks++}k=next;c.push(v);states.push(k)}
 for(let i=0;i<p.length;i++)check(hold&&p[i]===0?c[i]===0&&(!i||states[i]===states[i-1]):c[i]===mod(p[i]+states[i])&&(!i||B.includes(mod(states[i]-states[i-1]))),"plant exact replay");return {c,states,attempts,leaks}}
 const cut=1024;
 function fit(c,hold,M,truth=null,p=null){const start=Date.now(),r=rank(c,cut,hold,M),truthId=truth===null?null:bankIds.get(mask(truth)),prefix=c.slice(0,cut),ids=[...new Set([...r.order.slice(0,config.shortlist),...sourceIds])],big=ids.map(id=>({id,score:forward(prefix,cut,banks[id],hold,M).log})).sort((a,b)=>b.score-a.score||a.id-b.id),triIds=[...new Set([...big.slice(0,config.trigrams).map(x=>x.id),...sourceIds])],tri=triIds.map(id=>({id,score:forward(prefix,cut,banks[id],hold,M,true).log})).sort((a,b)=>b.score-a.score||a.id-b.id);
 const chosen=tri[0].id,nulls=nullLog(c,cut);
 function evaluate(id,withPath=false){const z=forward(c,cut,banks[id],hold,M,true,withPath);return {bank:banks[id],trainGain:(z.prefix-nulls.prefix)/cut,heldoutGain:((z.log-z.prefix)-(nulls.log-nulls.prefix))/(c.length-cut),trainLog:z.prefix,totalLog:z.log,accuracy:p&&z.p?z.p.filter((x,i)=>x===p[i]).length:null,withheldAccuracy:p&&z.p?z.p.slice(cut).filter((x,i)=>x===p[cut+i]).length:null,replay:z.replay??null,candidate:p===null&&z.p?z.p.map(x=>corpus.translit[x]).join("").slice(0,250):null}}
 return {hold,cut,length:c.length,elapsedMs:Date.now()-start,truth,truthMarginalRank:truthId===null?null:r.order.indexOf(truthId)+1,truthBigramRank:truthId===null?null:(big.findIndex(x=>x.id===truthId)+1||null),truthTrigramRank:truthId===null?null:(tri.findIndex(x=>x.id===truthId)+1||null),exactBank:truthId===null?null:chosen===truthId,chosen:evaluate(chosen,true),source:sourceIds.map(id=>({...evaluate(id),marginalRank:r.order.indexOf(id)+1})),oracle:truthId===null?null:evaluate(truthId,true),ranked:tri.map(x=>({bank:banks[x.id],score:x.score})),repeatCount:c.slice(1).filter((v,i)=>v===c[i]).length}}
 const result={config,controls:[],original:[]};if(config.controls){const B=[[2,8,11,15,26],[1,4,10,17,23],[3,7,12,18,27]];for(let j=0;j<3;j++){const s=lit[j],p=s.tape.slice(0,1717),hold=j!==1,z=plant(p,B[j],hold,330100+j);result.controls.push({name:s.name,attempts:z.attempts,leaks:z.leaks,...fit(z.c,hold,language(s.name),B[j],p)})}}
 if(config.original)for(const hold of [false,true])result.original.push(fit(target,hold,language(null)));
 return result
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),JSON.parse(data[1]),data.slice(2)),null,2));
