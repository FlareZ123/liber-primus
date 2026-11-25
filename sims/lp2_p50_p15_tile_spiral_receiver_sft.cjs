'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function experiment(grid,corpus,solved){
 const tokens=grid.pages.flatMap(p=>p.tokens), alpha=grid.alphabet.replace('f',''), val=t=>alpha.indexOf(t[0])*59+alpha.indexOf(t[1]), vals=tokens.map(val);
 const tile=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
 const core=Array.from({length:28},(_,i)=>Array.from({length:4},(_,j)=>(i+2)*8+j+2));
 const tiled=Array.from({length:7},(_,b)=>tile.map(k=>core[4*b+(k>>2)][k%4])).flat();
 function spiral(a){let t=0,b=a.length-1,l=0,r=a[0].length-1,o=[];while(t<=b&&l<=r){for(let j=l;j<=r;j++)o.push(a[t][j]);t++;for(let i=t;i<=b;i++)o.push(a[i][r]);r--;if(t<=b){for(let j=r;j>=l;j--)o.push(a[b][j]);b--}if(l<=r){for(let i=b;i>=t;i--)o.push(a[i][l]);l++}}return o}
 // bottom-left, first right, counterclockwise: exact reverse of p15 outer shell.
 const reversedShell=spiral(core.slice().reverse());
 // top-right, first down, clockwise (Agent39).
 const selected=spiral(core[0].map((_,j)=>core.map(row=>row[core[0].length-1-j])));
 const p57=solved.sections.find(x=>x.name==="p57_parable");
 const words=(p57.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>{let x=[...w].map(r=>corpus.runes.indexOf(r));return {word:x.map(i=>corpus.translit[i]).join(''),addr:x.reduce((a,b)=>a+b,0)}});
 const mod=x=>(x%29+29)%29;
 function orbit(order,x){let out=[],seen=new Map();while(x>=0&&x<order.length&&!seen.has(x)){seen.set(x,out.length);out.push(x);x=vals[order[x]]}return {path:out,end:x,cycle:x<order.length?out.slice(seen.get(x)):[],exit:x>=order.length}}
 function legal(c,k,phases){let states=new Set(phases),consumed=0;for(let i=0;i<c.length;i++){const next=new Set();for(const j of states){if(c[i]===0)next.add(j);if(mod(c[i]-k[j])!==0)next.add((j+1)%k.length)}if(!next.size)return {prefix:i,terminal:0};states=next;consumed=i+1}return {prefix:consumed,terminal:states.size}}
 function ioc(x){const h=Array(29).fill(0);x.forEach(v=>h[v]++);return h.reduce((a,v)=>a+v*(v-1),0)/(x.length*(x.length-1))}
 const whole=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 const native=[...p57.source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x));
 const controls=native.concat(native,native,native);
 const details=[];
 for(const [name,order] of Object.entries({tiled,reversedShell,selected})){
  if(new Set(order).size!==112)throw Error("bad permutation");
  const pointer=x=>x<112?vals[order[x]]:null;
  const edges=words.slice(0,-1).flatMap((w,i)=>pointer(w.addr)===words[i+1].addr?[`${w.word}->${words[i+1].word}`]:[]);
  const paths=words.map(w=>({word:w.word,addr:w.addr,...orbit(order,w.addr)}));
  const allOrbits=Array.from({length:112},(_,i)=>orbit(order,i));
  const key=order.map(i=>vals[i]%29);
  let j=0;const plant=controls.map(p=>p===0?0:mod(p+key[j++%112]));
  const positive=legal(plant,key,[0]);if(positive.prefix!==controls.length)throw Error('control failed');
  const raw=whole.map((v,i)=>mod(v-key[i%112]));
  const physicalStarts=[0,3,8,15,23,27,33,40,54];
  const physicalRanges=physicalStarts.map((p,i)=>{const cc=corpus.pages.filter(x=>x.page>=p&&x.page<(physicalStarts[i+1]??56)).flatMap(x=>x.indices);return {start:p,n:cc.length,allphase:legal(cc,key,Array.from({length:112},(_,i)=>i))}});
  details.push({name,first16:order.slice(0,16),edges,WE:paths.find(x=>x.word==='WE'),MUST:paths.find(x=>x.word==='MUST'),paths,exitCount:allOrbits.filter(x=>x.exit).length,cycles:[...new Set(allOrbits.filter(x=>!x.exit).map(x=>x.cycle.slice().sort((a,b)=>a-b).join(',')))],key,positive,wholeFixed:legal(whole,key,[0]),wholeAllPhase:legal(whole,key,Array.from({length:112},(_,i)=>i)),ordinaryIoc:ioc(raw),ordinaryPrefix:raw.slice(0,50).map(x=>corpus.translit[x]).join(' '),physicalRanges})
 }
 return {words,details}
}
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-grid-256.json'),read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));

function terminal(grid,corpus,solved){
 const tokens=grid.pages.flatMap(p=>p.tokens),alpha=grid.alphabet.replace("f",""),tile=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
 const order=Array.from({length:7},(_,b)=>tile.map(i=>(2+4*b+(i>>2))*8+2+i%4)).flat();
 const key=order.map(i=>(alpha.indexOf(tokens[i][0])*59+alpha.indexOf(tokens[i][1]))%29);
 const seq=x=>[...x.source_text].map(r=>corpus.runes.indexOf(r)).filter(v=>v>=0);
 const native=solved.sections.filter(x=>x.name!=="p57_parable").map(seq);
 const unigram=Array(29).fill(1),bigram=Array.from({length:29},()=>Array(29).fill(0.5));
 for(const p of native){p.forEach(x=>unigram[x]++);for(let i=1;i<p.length;i++)bigram[p[i-1]][p[i]]++}
 const sum=a=>a.reduce((x,y)=>x+y,0);const u=unigram.map(x=>Math.log(x/sum(unigram))),b=bigram.map(a=>a.map(x=>Math.log(x/sum(a))));
 const mod=x=>(x%29+29)%29;
 function encrypt(p,start){let j=start;return p.map(x=>{if(x===0)return 0;const z=mod(x+key[j]);j=(j+1)%112;return z})}
 function solve(cipher,starts){const best=[];let total=0n;for(const start of starts){let states=new Map([[start*30+29,{j:start,last:29,n:1n,score:0,p:[]}]]);
 for(const v of cipher){const next=new Map();for(const st of states.values()){
 const put=(p,j)=>{const id=j*30+p,score=st.score+(st.last===29?u[p]:b[st.last][p]),old=next.get(id);if(!old)next.set(id,{j,last:p,n:st.n,score,p:[...st.p,p]});else{old.n+=st.n;if(score>old.score){old.score=score;old.p=[...st.p,p]}}};
 if(v===0)put(0,st.j);const p=mod(v-key[st.j]);if(p!==0)put(p,(st.j+1)%112);
 }states=next;if(!states.size)break}
 if(states.size){const n=[...states.values()].reduce((x,y)=>x+y.n,0n);total+=n;const top=[...states.values()].sort((x,y)=>y.score-x.score)[0];if(encrypt(top.p,start).some((v,i)=>v!==cipher[i])||top.p.length!==cipher.length)throw Error("replay");best.push({start,n:n.toString(),score:top.score/cipher.length,p:top.p})}}
 best.sort((a,b)=>b.score-a.score);return {total:total.toString(),survivingStarts:best.map(x=>({start:x.start,n:x.n,score:x.score})),best:best[0]??null}}
 const target=corpus.pages.filter(x=>x.page>=54&&x.page<56).flatMap(x=>x.indices);const p57=seq(solved.sections.find(x=>x.name==="p57_parable"));const control=Array.from({length:4},()=>p57).flat().slice(0,target.length);const ctl=solve(encrypt(control,37),Array.from({length:112},(_,i)=>i));const out=solve(target,Array.from({length:112},(_,i)=>i));const plain=out.best?.p.map(x=>corpus.translit[x]).join(" ");const correctness=ctl.best?.p.filter((x,i)=>x===control[i]).length;
 return {targetLength:target.length,control:{total:ctl.total,survivingStarts:ctl.survivingStarts,bestCorrect:correctness,score:ctl.best?.score},target:{total:out.total,survivingStarts:out.survivingStarts,best:out.best&&{start:out.best.start,score:out.best.score,plain},fixedOriginLegal:out.survivingStarts.some(x=>x.start===0)},nativeScore:control.reduce((acc,p,i)=>acc+(i?b[control[i-1]][p]:u[p]),0)/control.length}
}
console.log(JSON.stringify(terminal(read('resources/liber-primus/lp2-grid-256.json'),read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));

function directional(grid,corpus,solved){
 const alpha=grid.alphabet.replace('f',''), tokens=grid.pages.flatMap(p=>p.tokens), tile=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
 const order=Array.from({length:7},(_,b)=>tile.map(i=>(2+4*b+(i>>2))*8+2+i%4)).flat();
 const v=order.map(i=>alpha.indexOf(tokens[i][0])*59+alpha.indexOf(tokens[i][1]));
 const w=solved.sections.find(x=>x.name==='p57_parable').source_text.match(/[\u16a0-\u16ff]+/gu).map(word=>{const x=[...word].map(r=>corpus.runes.indexOf(r));return {name:x.map(i=>corpus.translit[i]).join(''),addr:x.reduce((a,b)=>a+b,0)}});
 const pairs=new Map();for(const [from,to] of [[1,8],[8,14],[14,20]])for(let i=from;i<to;i++)for(let j=i+1;j<to;j++)if(w[i].addr<112&&w[j].addr<112){const k=`${w[i].addr}:${w[j].addr}`;if(!pairs.has(k))pairs.set(k,{a:w[i].addr,b:w[j].addr,labels:[]});pairs.get(k).labels.push(`${w[i].name}->${w[j].name}`)}
 const edges=[...pairs.values()].filter(p=>v[p.a]===p.b).map(p=>({...p,cell:order[p.a],token:tokens[order[p.a]]}));
 let state=3301;function rng(n){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n}
 const iterations=100000;let atLeast=0,both=0;let h={};
 for(let k=0;k<iterations;k++){const a=v.slice();for(let i=a.length-1;i>0;i--){const j=rng(i+1);[a[i],a[j]]=[a[j],a[i]]}const n=[...pairs.values()].filter(p=>a[p.a]===p.b).length;h[n]=(h[n]??0)+1;if(n>=edges.length)atLeast++;if(a[94]===67&&a[42]===83)both++}
 const exactSpecific=v.filter(x=>x===67).length*v.filter(x=>x===83).length/(112*111);
 const traces=[94,42,67,83,81,38,88].map(a=>({a,cell:order[a],token:tokens[order[a]],out:v[a]}));
 return {pairs:pairs.size,edges,traces,iterations,atLeast,both,exactSpecific,h}
}
console.log(JSON.stringify(directional(read('resources/liber-primus/lp2-grid-256.json'),read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));

function emergence(grid,corpus,solved){
const tile=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12],tokens=grid.pages.flatMap(p=>p.tokens),alpha=grid.alphabet.replace('f',''),val=t=>alpha.indexOf(t[0])*59+alpha.indexOf(t[1]);
const core=Array.from({length:7},(_,b)=>tile.map(i=>(2+4*b+(i>>2))*8+2+i%4)).flat();
const order=core.slice();
// Extend by one leftward step from the prior endpoint, then up, right,
// down and left, as in p15's center-out spiral.
for(const d of [1,0]){
 const left=d,right=7-d,top=d,bottom=31-d;
 for(let i=bottom-1;i>=top;i--)order.push(i*8+left);
 for(let j=left+1;j<=right;j++)order.push(top*8+j);
 for(let i=top+1;i<=bottom;i++)order.push(i*8+right);
 for(let j=right-1;j>=left;j--)order.push(bottom*8+j);
}
if(order.length!==256||new Set(order).size!==256)throw Error("not a permutation");
const f=order.map(i=>val(tokens[i]));
const w=solved.sections.find(x=>x.name==='p57_parable').source_text.match(/[\u16a0-\u16ff]+/gu).map(word=>{const x=[...word].map(r=>corpus.runes.indexOf(r));return {name:x.map(i=>corpus.translit[i]).join(''),addr:x.reduce((a,b)=>a+b,0)}});
function orbit(start){const seen=new Map(),path=[];let x=start;while(!seen.has(x)){seen.set(x,path.length);path.push(x);x=f[x]}return {path,cycle:path.slice(seen.get(x)),end:x}}
const runs=w.map(x=>({...x,...orbit(x.addr)}));
const basins=new Map();for(let i=0;i<256;i++){const o=orbit(i);const k=o.cycle.slice().sort((a,b)=>a-b).join(',');basins.set(k,(basins.get(k)||0)+1)}
const wordEdges=[];for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++)if(f[w[i].addr]===w[j].addr)wordEdges.push([w[i].name,w[j].name]);
return {orderLength:order.length,boundaries:[order[111],order[112],order[179],order[180],order[255]],runs,basins:[...basins],wordEdges};
}
console.log(JSON.stringify(emergence(read('resources/liber-primus/lp2-grid-256.json'),read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));

function emergenceNull(grid,corpus,solved){
 const tokens=grid.pages.flatMap(p=>p.tokens),alpha=grid.alphabet.replace('f',''),tile=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
 const order=Array.from({length:7},(_,b)=>tile.map(i=>(2+4*b+(i>>2))*8+2+i%4)).flat();
 for(const d of [1,0]){let l=d,r=7-d,t=d,b=31-d;for(let i=b-1;i>=t;i--)order.push(i*8+l);for(let j=l+1;j<=r;j++)order.push(t*8+j);for(let i=t+1;i<=b;i++)order.push(i*8+r);for(let j=r-1;j>=l;j--)order.push(b*8+j)}
 const f=order.map(i=>alpha.indexOf(tokens[i][0])*59+alpha.indexOf(tokens[i][1]));
 const starts=[...new Set(solved.sections.find(x=>x.name==='p57_parable').source_text.match(/[\u16a0-\u16ff]+/gu).map(w=>[...w].reduce((a,x)=>a+corpus.runes.indexOf(x),0)))];
 function basinStats(f){const root=new Int16Array(256).fill(-1),mark=new Int16Array(256).fill(-1),cycleSize=new Int16Array(256);for(let i=0;i<256;i++){if(root[i]>=0)continue;let x=i;const path=[];while(root[x]<0&&mark[x]!==i){mark[x]=i;path.push(x);x=f[x]}let id=root[x];if(id<0){const cyc=path.slice(path.indexOf(x));id=Math.min(...cyc);cycleSize[id]=cyc.length}for(const v of path)root[v]=id}const n=new Int16Array(256);for(const x of root)n[x]++;const same=starts.every(x=>root[x]===root[starts[0]]);return {same,basin:n[root[starts[0]]],cycle:cycleSize[root[starts[0]]],max:Math.max(...n)}}
 const orig=basinStats(f);let seed=3301;function rng(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const N=30000;const out={same:0,sameLarge:0,sameLarge4:0,maxLarge:0};
 for(let i=0;i<N;i++){const v=f.slice();for(const [lo,hi] of [[112,180],[180,256]])for(let j=hi-1;j>lo;j--){const k=lo+rng(j-lo+1);[v[j],v[k]]=[v[k],v[j]]}const z=basinStats(v);if(z.same)out.same++;if(z.same&&z.basin>=orig.basin)out.sameLarge++;if(z.same&&z.basin>=orig.basin&&z.cycle===4)out.sameLarge4++;if(z.max>=orig.max)out.maxLarge++}
 return {uniqueWordAddresses:starts.length,orig,N,out}
}
console.log(JSON.stringify(emergenceNull(read('resources/liber-primus/lp2-grid-256.json'),read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
