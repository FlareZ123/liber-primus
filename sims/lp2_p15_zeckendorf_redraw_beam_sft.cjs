'use strict';
// Agent28: joint Fibonacci digit introduction with collision-redraw and transparent F.
const fs=require('node:fs'),path=require('node:path');
function experiment(data,hmm,width=8192){
 const co=JSON.parse(data[0]),nat=JSON.parse(data[1]),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=s=>{let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(t=>w.startsWith(t.s,i));assert(t,"unknown token");out.push(t.i);i+=t.s.length}}return out};
 const native=nat.sections.map(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x))),train=[...native,encode(data[2]),encode(data[3])],em=encode(data[4]);
 const {N,cut,r,F,C}=hmm,M=F.length,ds=hmm.top[0].ds;
 const bits=Array.from({length:2*N+1},(_,n)=>{let a=[];for(let k=M-1;k>=0;k--)if(F[k]<=n){a.push(k+1);n-=F[k]}assert(n===0,"Zeckendorf");return a});
 const U=new Float64Array(29).fill(1),B=new Float64Array(841),T=new Float64Array(29**3),BS=new Float64Array(29),TS=new Float64Array(841);
 for(const p of train)for(let i=0;i<p.length;i++){U[p[i]]++;if(i){B[p[i-1]*29+p[i]]++;BS[p[i-1]]++}if(i>1){let j=p[i-2]*29+p[i-1];T[j*29+p[i]]++;TS[j]++}}
 let total=U.reduce((a,b)=>a+b,0),lm=new Float64Array(29**3),bi=new Float64Array(841),uni=U.map(x=>Math.log(29*x/total));
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){bi[a*29+b]=Math.log(29*(B[a*29+b]+20*U[b]/total)/(BS[a]+20));for(let c=0;c<29;c++){let h=a*29+b;lm[h*29+c]=Math.log(29*(T[h*29+c]+12*Math.exp(bi[b*29+c])/29)/(TS[h]+12))}}
 const score=(a,b,p)=>b===29?uni[p]:a===29?bi[b*29+p]:lm[(a*29+b)*29+p],lr=Math.log(r),ln=Math.log1p(-r);
 const unknown=(K,j)=>bits[j].length>0&&bits[j][0]>=K.length;
 function shift(K,j){if(unknown(K,j))return null;let s=K[0];for(let k of bits[j])s+=K[k];return s%29}
 function beam(){
 let nextId=0,states=[],counts=[],stride=(2*N+1)*900,maxRaw=0,totalRaw=0;
 for(let b=0;b<29;b++)states.push({key:{id:nextId++,K:[b,ds[0],mod(ds[0]+ds[1])],child:new Map()},j:0,a:29,b:29,v:0});
 for(let i=0;i<cut;i++){
 const c=C[i],prev=i?C[i-1]:-1,next=new Map(),temps=new Map();let tempId=-1;
 function child(key,w){let t=key.child.get(w);if(t)return t;let arr=temps.get(key.id);if(!arr){arr=[];temps.set(key.id,arr)}t=arr[w];if(!t){t={id:tempId--,K:[...key.K,w],parent:key,w,child:new Map()};arr[w]=t}return t}
 function add(s,key,j,p,extra){let v=s.v+score(s.a,s.b,p)+extra,q=key.id*stride+j*900+s.b*30+p,old=next.get(q);if(!old||v>old.v)next.set(q,{key,j,a:s.b,b:p,v})}
 function knownFirst(s,key,k0){
 let j=s.j,p=mod(c-k0);
 if(p)add(s,key,j+1,p,c===prev?ln:0);
 if(prev<0)return;
 p=mod(prev-k0);if(!p)return;
 let k1=shift(key.K,j+1);
 if(k1===null){assert(F[key.K.length-1]===j+1,"redraw introduces next coefficient at singleton place");let t=child(key,mod(c-p-key.K[0]));add(s,t,j+2,p,lr)}
 else if(mod(p+k1)===c)add(s,key,j+2,p,lr);
 }
 for(let s of states){
 if(c===0)add(s,s.key,s.j,0,0);
 let k0=shift(s.key.K,s.j);
 if(k0!==null)knownFirst(s,s.key,k0);
 else{
 assert(F[s.key.K.length-1]===s.j,"first coefficient at singleton place");
 for(let w=0;w<29;w++){let t=child(s.key,w);knownFirst(s,t,mod(s.key.K[0]+w))}
 }
 }
 totalRaw+=next.size;maxRaw=Math.max(maxRaw,next.size);
 if(!next.size)return {dead:i,counts,maxRaw,totalRaw};
 states=[...next.values()];if(states.length>width){states.sort((a,b)=>b.v-a.v);states.length=width}
 for(let s of states)if(s.key.id<0){let k=s.key,par=k.parent,t=par.child.get(k.w);assert(par.id>=0,"at most one unknown place per event");if(!t){t={id:nextId++,K:k.K,child:new Map()};par.child.set(k.w,t)}s.key=t}
 if(i===cut-1||F.includes(i)||i%200===199)counts.push([i,states.length,Math.max(...states.map(s=>s.v))]);
 }
 states.sort((a,b)=>b.v-a.v);let top=[],seen=new Set();
 for(let s of states){let k=s.key.K.join(",");if(!seen.has(k)&&s.key.K.length>=17){seen.add(k);top.push({K:s.key.K,beamScore:s.v,j:s.j});if(top.length===8)break}}
 return {top,counts,maxRaw,totalRaw,keys:nextId};
 }
 function exact(K,start,end,initial=null){
 let base=initial??{j:0,a:29,b:29,v:0},states=new Map([[base.j*900+base.a*30+base.b,{...base,prev:null}]]),max=1;
 for(let i=start;i<end;i++){
 let next=new Map(),c=C[i],prev=i?C[i-1]:-1;
 function add(s,j,p,extra,m){let v=s.v+score(s.a,s.b,p)+extra,q=j*900+s.b*30+p,old=next.get(q);if(!old||v>old.v)next.set(q,{j,a:s.b,b:p,v,p,m,prev:s})}
 for(let s of states.values()){
 if(c===0)add(s,s.j,0,0,0);
 let k0=shift(K,s.j);if(k0===null)continue;
 let p=mod(c-k0);if(p)add(s,s.j+1,p,c===prev?ln:0,1);
 if(prev>=0){p=mod(prev-k0);let k1=shift(K,s.j+1);if(p&&k1!==null&&mod(p+k1)===c)add(s,s.j+2,p,lr,2)}
 }
 if(!next.size)return {dead:i,max};
 states=next;max=Math.max(max,states.size);
 }
 let best=[...states.values()].reduce((a,b)=>a.v>b.v?a:b),s=best,P=[],ms=[];
 for(let i=start;i<end;i++){P.push(s.p);ms.push(s.m);s=s.prev}P.reverse();ms.reverse();
 let j=base.j,prev=start?C[start-1]:-1,holds=0,skips=0;
 for(let i=start;i<end;i++){let p=P[i-start],m=ms[i-start];if(!p){assert(m===0&&C[i]===0,"hold replay");holds++}else{if(m===2){assert(mod(p+shift(K,j++))===prev,"redraw replay");skips++}assert(mod(p+shift(K,j++))===C[i],"cipher replay")}prev=C[i]}
 return {P,ms,score:best.v-base.v,state:{j:best.j,a:best.a,b:best.b,v:best.v},holds,skips,max};
 }
 const preview=p=>p?.slice(0,100).map(x=>co.translit[x]).join("")??null;
 const b=beam(),P=hmm.key?em.slice(100000+Number(hmm.name.at(-1))*N,100000+(Number(hmm.name.at(-1))+1)*N):null;
 const info={name:hmm.name,width,N,cut,r,ds,truth:hmm.key,beam:b};
 if(!b.top?.length)return info;
 let cand=b.top.map(x=>({...x,fit:exact(x.K,0,cut)})).filter(x=>x.fit.P).sort((a,b)=>b.fit.score-a.fit.score);
 if(!cand.length)return info;
 let win=cand[0],hold=exact(win.K,cut,N,win.fit.state);
 return {...info,key:win.K,observedKeyCorrect:hmm.key?win.K.filter((v,i)=>v===hmm.key[i]).length:null,observedKeyCount:win.K.length,fit:win.fit.score/cut,hold:hold.P?hold.score/(N-cut):hold,fitCorrect:P?win.fit.P.filter((v,i)=>v===P[i]).length:null,holdCorrect:P&&hold.P?hold.P.filter((v,i)=>v===P[cut+i]).length:null,fitHolds:win.fit.holds,fitSkips:win.fit.skips,holdHolds:hold.holds,holdSkips:hold.skips,fitCursor:win.fit.state.j,preview:preview(win.fit.P),holdPreview:preview(hold.P)};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module){const index=Number(process.argv[2]??0),hmm=JSON.parse(fs.readFileSync(path.join(__dirname,'..','im-results',`lp2-p15-zeckendorf-redraw-hmm-${index}.json`),'utf8'));console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),hmm),null,2));}
module.exports={experiment,paths};
