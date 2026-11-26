'use strict';
const fs=require('node:fs'),path=require('node:path');
function allKeys(corpus,raw,freq){
 const mod=x=>(x%29+29)%29,assert=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const all=127,rot=x=>((x<<1)&127)|(x>>6),h=k=>mod(2*k.slice(0,Math.floor(k.length/2)).reduce((a,b)=>a+b,0)+(k.length%2?k[(k.length-1)/2]:0));
 const sig=k=>[h(k),h(k.slice(0,2)),h(k.slice(2))],legal=k=>eq(sig(k).sort((a,b)=>a-b),[9,11,12]);
 const keyOf=(f,p,s,b,c)=>{const a=mod(15*p),d=mod(f-2*(a+b+c)),e=mod(s-2*(c+d));return [a,b,c,d,e,-1,-1]};
 // Unknown key coordinates allow every consuming transition. This is a
 // monotone overapproximation of the exact historical F-transparent inverse.
 function reachable(tape,k,start){const bad=new Uint8Array(29);for(let j=0;j<7;j++)if(k[j]>=0)bad[k[j]]|=1<<j;let state=start;for(const x of tape){const v=rot(state&~bad[x]);state=x===0?(state|v):v;if(!state)return false}return true}
 const perms=[[9,11,12],[9,12,11],[11,9,12],[11,12,9],[12,9,11],[12,11,9]];
 function exactF(tape,start){let totals=[0,0,0],orders=[];const survivors=[];for(const [f,p,s] of perms){let n=[0,0,0],visited=[0,0,0];
 for(let b=0;b<29;b++)for(let c=0;c<29;c++){const k=keyOf(f,p,s,b,c);assert(eq(sig(k.map(x=>x<0?0:x)),[f,p,s]),"field equations");visited[0]++;if(!reachable(tape,k,start))continue;n[0]++;
 for(let x=0;x<29;x++){k[5]=x;visited[1]++;if(!reachable(tape,k,start))continue;n[1]++;for(let y=0;y<29;y++){k[6]=y;visited[2]++;if(reachable(tape,k,start)){n[2]++;survivors.push(k.slice())}}k[6]=-1}k[5]=-1}
 totals=totals.map((v,i)=>v+n[i]);orders.push({fields:[f,p,s],visited,surviving:n})}return {totals,orders,survivors}}
 const tape=corpus.pages.slice(35,40).flatMap(p=>p.indices.slice(p.page===35?117:0,p.page===39?119:undefined));
 assert(tape.length===967,"original target length");const f0=exactF(tape,1),fa=exactF(tape,all);
 const body=corpus.pages.slice(33,40).flatMap(p=>p.indices.slice(p.page===33?99:0,p.page===39?119:undefined));
 assert(body.length===1460,"cuneiform body length");const fbody=exactF(body,all);
 const plantKey=[6,11,26,10,26,5,12],plant=corpus.pages[57].indices;
 assert(legal(plantKey),"plant signature");let phase=4;
 const enc=plant.map(p=>{if(!p)return 0;const c=mod(p+plantKey[phase]);phase=(phase+1)%7;return c});
 assert(reachable(enc,plantKey,1<<4),"plant exact path");
 for(let n=5;n<=7;n++)assert(reachable(enc,plantKey.map((x,i)=>i<n?x:-1),all),"plant pruned at "+n);
 const ri=new Map(corpus.runes.map((x,i)=>[x,i])),tokens=corpus.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function gp(w){let s=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');const a=[];while(s){const t=s.startsWith('ING')?['ING',21]:s.startsWith('IO')?['IO',27]:tokens.find(([t])=>s.startsWith(t));if(!t)return null;a.push(t[1]);s=s.slice(t[0].length)}return a}
 const by=new Map();for(const line of freq.split(/\r?\n/)){const m=/^([a-zA-Z]+)\s+\d+$/.exec(line.trim());if(!m)continue;const p=gp(m[1]);if(!p||p.length<7)continue;if(!by.has(p.length))by.set(p.length,new Map());by.get(p.length).set(p.join(','),p)}
 const g=[],segments=raw.split(/^\s*%\s*$/m),offsets=new Map();let t=0;for(const p of corpus.pages){offsets.set(p.page,t);t+=p.indices.length}
 const start=offsets.get(35)+117,end=offsets.get(39)+119;
 for(let page=35;page<=39;page++){let p=[],tape=[],first=0;const flush=()=>{const a=offsets.get(page)+first,b=a+p.length;if(p.length>=7&&a>=start&&b<=end&&first>0&&first+p.length<corpus.pages[page].indices.length)g.push({page,offset:first,absolute:a,values:p});p=[]};for(const ch of segments[page]){if(ri.has(ch)){if(!p.length)first=tape.length;p.push(ri.get(ch));tape.push(ri.get(ch))}else if(ch!=='/'&&!/\s/u.test(ch))flush()}flush();assert(eq(tape,corpus.pages[page].indices),"page tape")}
 function supports(groups,anyPhase){const counts=new Map(),perGroup=[];for(const x of groups){const set=new Set();for(const w of (by.get(x.values.length)||new Map()).values()){const v=x.values.map((c,i)=>mod(c-w[i]));if(v.some((z,i)=>i>=7&&z!==v[i%7]))continue;const phases=anyPhase?[0,1,2,3,4,5,6]:[(x.absolute-start)%7];
 for(const p of phases){const k=Array(7);for(let i=0;i<7;i++)k[(p+i)%7]=v[i];if(legal(k))set.add(k.join(','))}}
 for(const k of set)counts.set(k,(counts.get(k)||0)+1);perGroup.push({page:x.page,offset:x.offset,length:x.values.length,keys:set.size})}
 let max=0,best=[];for(const [k,n] of counts){if(n>max){max=n;best=[]}if(n===max&&best.length<10)best.push(k.split(',').map(Number))}
 return {groups:groups.length,candidateKeys:counts.size,maxSupport:max,minLongOOV:groups.length-max,plantKeySupport:counts.get(plantKey.join(','))||0,best,perGroup}}
 const fixed=supports(g,false),free=supports(g,true);
 const pg=[];let at=start;for(const [len,words] of by){if(len>10)continue;for(const w of [...words.values()].slice(0,3)){const p=(at-start)%7;pg.push({page:0,offset:at-start,absolute:at,values:w.map((x,i)=>mod(x+plantKey[(p+i)%7]))});at+=w.length}}
 const positive=supports(pg,false);assert(positive.plantKeySupport===pg.length,"ordinary key plant not retained");
 return {n:tape.length,bodyN:body.length,fixedFieldFamily:29**4,sortedFieldFamily:6*29**4,phaseZeroF:f0,anyPhaseF:fa,wholeCuneiformBodyAnyPhaseF:fbody,ordinaryFixedPhase:fixed,ordinaryAnyWordPhase:free,plant:{FLength:plant.length,FHolds:plant.filter(x=>x===0).length,ordinaryGroups:pg.length,ordinaryPlantKeySupport:positive.plantKeySupport}};
}
const root=path.resolve(__dirname,'..');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt"];
const input=files.map((p,i)=>{const s=fs.readFileSync(path.join(root,p),'utf8');return i===0?JSON.parse(s):s});
console.log(JSON.stringify(allKeys(...input),null,2));
