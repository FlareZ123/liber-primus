'use strict';
const fs=require('node:fs');
function experiment(corpus,transcript,native){
 const A=29,N=29220,q=.81,logq=Math.log(q),logAccept=Math.log(1-q),CAP=16;
 const assert=(x,m)=>{if(!x)throw Error(m)}, map=new Map(corpus.runes.map((x,i)=>[x,i])), parse=s=>Array.from(s).filter(x=>map.has(x)).map(x=>map.get(x));
 const sections=native.sections.map(s=>parse(s.source_text)),train=sections.slice(0,4),donor=sections.slice(4,7).flat(),lines=transcript.split(/\n/).map(parse).filter(x=>x.length).slice(0,594);
 assert(lines.flat().join(",")===corpus.pages.slice(0,56).flatMap(p=>p.indices).join(","),"original alignment");
 const K=[],sieve=new Uint8Array(400001);
 for(let p=2;p<sieve.length&&K.length<N+256;p++)if(!sieve[p]){K.push((p-1)%A);for(let j=p*p;j<sieve.length;j+=p)sieve[j]=1}
 assert(K.length===N+256,"prime count");
 let maxRun=1;for(let j=0;j<K.length;){let t=j+1;while(t<K.length&&K[t]===K[j])t++;maxRun=Math.max(maxRun,t-j);j=t}
 let seed=0x81c3301;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function emit(P,start){let C=[],skips=[],j=start,w=0;for(const p of P){if(p===0){C.push(0);skips.push(0);continue}let c=(p+K[j++])%A,d=0;while(C.length&&c===C[C.length-1]&&rand()/4294967296<q){d++;c=(p+K[j++])%A;w+=logq}if(C.length&&c===C[C.length-1])w+=logAccept;C.push(c);skips.push(d)}return {C,skips,end:j,w}}
 function replay(P,start,skips){let C=[],j=start;for(let i=0;i<P.length;i++){let p=P[i];if(p===0){assert(skips[i]===0,"hold skip");C.push(0);continue}for(let d=0;d<skips[i];d++){assert(i>0&&(p+K[j++])%A===C[i-1],"collision witness")}C.push((p+K[j++])%A)}return {C,end:j}}
 function permute(C){let D=C.slice(),idx=D.map((x,i)=>x?i:-1).filter(i=>i>=0);for(let i=idx.length-1;i>0;i--){let j=rand()%(i+1);[D[idx[i]],D[idx[j]]]=[D[idx[j]],D[idx[i]]]}return D}
 const uni=new Float64Array(A),bi=new Float64Array(A*A),tri=new Float64Array(A*A*A),bn=new Float64Array(A),tn=new Float64Array(A*A);
 for(const P of train)for(let i=0;i<P.length;i++){let p=P[i];uni[p]++;if(i){bi[P[i-1]*A+p]++;bn[P[i-1]]++}if(i>=2){let z=P[i-2]*A+P[i-1];tri[z*A+p]++;tn[z]++}}
 const T=uni.reduce((a,b)=>a+b,0),u=Float64Array.from(uni,x=>(x+.5)/(T+.5*A)),b=new Float64Array(A*A),l=new Float64Array(A*A*A);
 for(let x=0;x<A;x++)for(let y=0;y<A;y++)b[x*A+y]=(bi[x*A+y]+5*u[y])/(bn[x]+5);
 for(let x=0;x<A*A;x++)for(let y=0;y<A;y++)l[x*A+y]=Math.log((tri[x*A+y]+8*b[(x%A)*A+y])/(tn[x]+8));
 const logu=Float64Array.from(u,Math.log),logb=Float64Array.from(b,Math.log);
 function scan(C,truth=null){
   let best=-Infinity,total=0,paths=0,start=0,ob=-Infinity,better=0,bestEdge=null;const top=[],P=new Uint8Array(C.length),D=new Uint8Array(C.length);
   const score=(i,x,y,p)=>i===0?logu[p]:i===1?logb[y*A+p]:l[(x*A+y)*A+p];
   const truthScore=truth?truth.w+truth.P.reduce((s,p,i)=>s+score(i,truth.P[i-2],truth.P[i-1],p),0):-Infinity;
   function walk(i,j,x,y,s){
     if(i===C.length){paths++;total+=Math.exp(s);if(s>ob)ob=s;
       if(s>best){best=s;bestEdge={start,end:j,score:s,P:Array.from(P),skips:Array.from(D)}}
       if(top.length<CAP||s>top[top.length-1].score){const k=top.findIndex(e=>e.start===start&&e.end===j);if(k<0||top[k].score<s){if(k>=0)top.splice(k,1);top.push({start,end:j,score:s,P:Array.from(P),skips:Array.from(D)});top.sort((a,b)=>b.score-a.score||a.start-b.start||a.end-b.end);if(top.length>CAP)top.pop()}}return
     }
     const c=C[i],prev=i?C[i-1]:-1,shift=K[j];
     if(c===0){P[i]=0;D[i]=0;walk(i+1,j,y,0,s+score(i,x,y,0))}
     const p=(c-shift+A)%A;
     if(p!==0){P[i]=p;D[i]=0;walk(i+1,j+1,y,p,s+score(i,x,y,p)+(c===prev?logAccept:0))}
     if(i){const r=(prev-shift+A)%A;if(r!==0){
       for(let d=1;;d++){let v=(r+K[j+d])%A;
         if(v===c){P[i]=r;D[i]=d;walk(i+1,j+d+1,y,r,s+score(i,x,y,r)+d*logq+(c===prev?logAccept:0))}
         if(v!==prev)break;
       }
     }}
   }
   for(start=0;start<N;start++){ob=-Infinity;walk(0,start,-1,-1,0);if(ob>truthScore+1e-9)better++}
   for(const e of top){let r=replay(e.P,e.start,e.skips);assert(r.C.join(",")===C.join(",")&&r.end===e.end,"edge replay")}
   return {best:best/C.length,logMarginal:(Math.log(total/N)+C.length*Math.log(A))/C.length,paths,truthRank:truth?better+1:null,exact:truth?bestEdge.start===truth.start&&bestEdge.P.join(",")===truth.P.join(","):null,truthIntervalInTop:truth?top.some(e=>e.start===truth.start&&e.end===truth.end):null,bestEdge,top};
 }
 const chosen=lines.map((C,i)=>({C,i})).sort((a,b)=>b.C.length-a.C.length||a.i-b.i).slice(0,22).sort((a,b)=>a.i-b.i),L=chosen.reduce((s,x)=>s+x.C.length,0);
 function pack(s){return {meanBest:s.reduce((a,x)=>a+x.best,0)/s.length,meanMarginal:s.reduce((a,x)=>a+x.logMarginal,0)/s.length,exact:s.filter(x=>x.exact).length,top5:s.filter(x=>x.truthRank!==null&&x.truthRank<=5).length,trueIntervals:s.filter(x=>x.truthIntervalInTop).length,rows:s.map(({top,bestEdge,...r})=>({...r,bestEdge,text:bestEdge.P.map(p=>corpus.translit[p]).join("")}))}}
 function tile(scans,truths){const byStart=new Map();for(let id=scans.length-1;id>=0;id--)for(const e of scans[id].top){if(!byStart.has(e.start))byStart.set(e.start,[]);byStart.get(e.start).push({...e,id})}let nodes=0,solutions=0,best=-Infinity,bestPath=null,all=(1<<scans.length)-1,path=[];
 function dfs(at,mask,s){nodes++;if(mask===all){solutions++;if(s>best){best=s;bestPath=path.slice()}return}for(const e of byStart.get(at)||[]){const bit=1<<e.id;if(mask&bit)continue;path.push(e);dfs(e.end,mask|bit,s+e.score);path.pop()}}
 for(const at of byStart.keys())if(at<=3301)dfs(at,0,0);return {nodes,solutions,exactOrder:bestPath?bestPath.every((e,i)=>e.id===i):null,exactIntervals:bestPath?bestPath.filter(e=>e.start===truths[e.id].start&&e.end===truths[e.id].end).length:null,correctRunes:bestPath?bestPath.reduce((s,e)=>s+e.P.filter((p,i)=>p===truths[e.id].P[i]).length,0):null}}
 const controls=[];for(let k=0;k<2;k++){let off=k*L,j=k===0?1033:3301,pos=[],neg=[],truths=[];for(const {C} of chosen){const P=donor.slice(off,off+C.length),e=emit(P,j),truth={P,start:j,...e};truths.push(truth);pos.push(scan(e.C,truth));neg.push(scan(permute(e.C)));j=e.end;off+=C.length}controls.push({origin:k===0?1033:3301,redraws:truths.flatMap(t=>t.skips).reduce((a,b)=>a+b,0),positive:pack(pos),negative:pack(neg),tiling:tile(pos,truths),nullTiling:tile(neg,truths)})}
 const original=chosen.map(({C})=>scan(C)),nulls=chosen.map(({C})=>scan(permute(C)));
 return {N,q,maxRun,L,trainRunes:T,lines:chosen.map(({C,i})=>({line:i,length:C.length})),controls,original:pack(original),originalNull:pack(nulls)};
}
const read=p=>fs.readFileSync(p,'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/transcriptions/lp2-image-corrected.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
