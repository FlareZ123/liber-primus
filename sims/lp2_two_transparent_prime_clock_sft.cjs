// Agent 3: exact two-transparent-symbol prime clock and predictive inverse.
const fs=require('node:fs');
const path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function experiment(corpus,native,originCount=5000){
 const chapters=[[0,2,13],[3,7,16],[8,14,12],[15,22,9],[23,26,16],[27,32,19],[33,39,10],[40,53,8],[54,55,9]];
 const shifts=[];for(let p=2;shifts.length<originCount+3010;p++){let ok=true;for(let q=2;q*q<=p;q++)if(p%q===0){ok=false;break;}if(ok)shifts.push((p-1)%29);}
 const masks=Array(29).fill(0n);for(let j=0;j<shifts.length;j++)masks[shifts[j]]|=1n<<BigInt(j);
 const initial=(1n<<BigInt(originCount))-1n,full=(1n<<BigInt(shifts.length))-1n,mod=x=>(x+29)%29,idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const sources=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c))}));
 const pairs=[];for(const sign of [1,-1])for(let a=0;a<29;a++)for(let b=a+1;b<29;b++)pairs.push({a,b,sign});
 const forbidden=(c,a,b,s)=>masks[mod(s*(c-a))]|masks[mod(s*(c-b))];
 function gate(C,a,b,sign,starts=initial){let s=starts;for(let i=0;i<C.length;i++){const c=C[i];s=((s&~forbidden(c,a,b,sign))<<1n)|((c===a||c===b)?s:0n);if(!s)return {len:i,end:0n};}return {len:C.length,end:s};}
 function encode(P,a,b,sign,k){return P.map(p=>p===a||p===b?p:mod(p+sign*shifts[k++]));}
 function indices(b){const str=b.toString(2),r=[];for(let i=str.length-1;i>=0;i--)if(str[i]==="1")r.push(str.length-1-i);return r;}
 function model(excluded){const u=new Float64Array(29).fill(.5),b=new Float64Array(29*29),t=new Float64Array(29*29*29),bt=new Float64Array(29),tt=new Float64Array(29*29);let total=14.5;
 for(const s of sources)if(s.name!==excluded){const P=s.P;for(let i=0;i<P.length;i++){const p=P[i];u[p]++;total++;if(i){b[P[i-1]*29+p]++;bt[P[i-1]]++;}if(i>1){const h=P[i-2]*29+P[i-1];t[h*29+p]++;tt[h]++;}}}
 for(let p=0;p<29;p++)u[p]/=total;for(let q=0;q<29;q++)for(let p=0;p<29;p++)b[q*29+p]=(b[q*29+p]+20*u[p])/(bt[q]+20);
 for(let h=0;h<841;h++)for(let p=0;p<29;p++)t[h*29+p]=(t[h*29+p]+12*b[(h%29)*29+p])/(tt[h]+12);
 const lu=Array.from(u,Math.log),lb=Array.from(b,Math.log),lt=Array.from(t,Math.log);
 return (pp,q,p)=>q===29?lu[p]:pp===29?lb[q*29+p]:lt[(pp*29+q)*29+p];}
 function backward(C,a,b,sign){const B=Array(C.length+1);B[C.length]=full;for(let i=C.length-1;i>=0;i--){const c=C[i],s=B[i+1];B[i]=((s>>1n)&~forbidden(c,a,b,sign))|((c===a||c===b)?s:0n);}return B;}
 function solve(C,{a,b,sign},score,frozen=null){
 const viable=backward(C,a,b,sign),s=viable[0]&(frozen?1n<<BigInt(frozen.k):initial);if(!s)return null;
 let states=new Map();for(const k of indices(s)){const pp=frozen?.pp??29,q=frozen?.q??29;states.set(k*900+pp*30+q,{k,pp,q,origin:frozen?.origin??k,value:0,prev:null});}
 const origins=states.size;for(let i=0;i<C.length;i++){const c=C[i],next=new Map(),v=viable[i+1];function add(node,k,p){if(!(v&(1n<<BigInt(k))))return;const key=k*900+node.q*30+p,value=node.value+score(node.pp,node.q,p);if(!next.has(key)||value>next.get(key).value)next.set(key,{k,pp:node.q,q:p,origin:node.origin,value,prev:node});}
 for(const node of states.values()){if(c===a||c===b)add(node,node.k,c);const p=mod(c-sign*shifts[node.k]);if(p!==a&&p!==b)add(node,node.k+1,p);}states=next;if(!states.size)throw Error("backward/forward mismatch");}
 let best=null;for(const n of states.values())if(!best||n.value>best.value)best=n;
 const P=[];for(let node=best;node.prev;node=node.prev)P.push(node.q);P.reverse();
 const start=frozen?.k??best.origin;if(JSON.stringify(encode(P,a,b,sign,start))!==JSON.stringify(C))throw Error("replay");
 return {a,b,sign,origin:best.origin,k:best.k,pp:best.pp,q:best.q,value:best.value,P,origins};}
 function fit(C,score){let best=null,bestEndpoint=null,feasiblePairs=0,origins=0;for(const pair of pairs){const v=solve(C,pair,score);if(v){feasiblePairs++;origins+=v.origins;if(!best||v.value>best.value)best=v;if(pair.a===0&&pair.b===28&&(!bestEndpoint||v.value>bestEndpoint.value))bestEndpoint=v;}}return {best,bestEndpoint,feasiblePairs,origins};}
 const pack=r=>r&&({...r,P:r.P.map(p=>corpus.translit[p]).join(" "),ioc:r.P.reduce((sum,p)=>sum+r.P.filter(q=>q===p).length-1,0)/(r.P.length*(r.P.length-1))});
 const auth=sources.find(s=>s.name==="p56_an_end").P;if(auth.length!==85||JSON.stringify(encode(auth,0,0,1,0))!==JSON.stringify(corpus.pages[56].indices))throw Error("p56 authentic replay");
 const P=corpus.pages[57].indices;for(const pair of [{a:0,b:28},{a:0,b:2},{a:10,b:28},{a:7,b:23}])for(const sign of [1,-1]){const {a,b}=pair,k=137,C=encode(P,a,b,sign,k),g=gate(C,a,b,sign,1n<<BigInt(k));if(!(g.end&(1n<<BigInt(k+P.filter(p=>p!==a&&p!==b).length))))throw Error("gate control");}
 const summaries=[];for(const [first,last,red] of chapters)for(const skip of [0,red]){const C=corpus.pages.slice(first,last+1).flatMap(p=>p.indices).slice(skip),survivors=[],best=[];for(const {a,b,sign} of pairs){const g=gate(C,a,b,sign),row={a,b,sign,len:g.len};if(g.end)survivors.push({...row,endCount:indices(g.end).length});best.push(row);}best.sort((a,b)=>b.len-a.len);summaries.push({first,last,skip,length:C.length,full:survivors.length,sourceEndpoints:best.filter(x=>x.a===0&&x.b===28),top:best.slice(0,6),survivors});}
 const controls=[];for(const [name,a,b,sign,origin] of [["0_welcome",0,28,1,137],["0_loss_of_divinity",10,18,-1,911],["0_koan_1",0,2,1,3301]]){const P=sources.find(s=>s.name===name).P.slice(0,308),C=encode(P,a,b,sign,origin),sc=model(name),F=fit(C.slice(0,232),sc),W=solve(C.slice(232),F.best,sc,F.best);controls.push({name,truth:{a,b,sign,origin},fit:pack(F.best),fitExact:F.best.P.filter((p,i)=>p===P[i]).length,held:pack(W),heldExact:W?.P.filter((p,i)=>p===P[232+i]).length??0,feasiblePairs:F.feasiblePairs});}
 const original=[];for(const skip of [0,9]){const C=corpus.pages.slice(54,56).flatMap(p=>p.indices).slice(skip),cut=232-skip,sc=model(),F=fit(C.slice(0,cut),sc),W=solve(C.slice(cut),F.best,sc,F.best),E=solve(C.slice(cut),F.bestEndpoint,sc,F.bestEndpoint),R=fit(C,sc);original.push({skip,cut,fit:pack(F.best),held:pack(W),endpointFit:pack(F.bestEndpoint),endpointHeld:pack(E),full:pack(R.best),fullEndpoint:pack(R.bestEndpoint),feasiblePairs:F.feasiblePairs,fullFeasiblePairs:R.feasiblePairs,fullOriginPairCount:R.origins});}
 return {originCount,authenticReplay:85,gatePositiveControls:8,summaries,controls,original};
}
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
