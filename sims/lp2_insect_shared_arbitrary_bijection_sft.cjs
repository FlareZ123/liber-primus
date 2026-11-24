'use strict';
const fs=require('node:fs');
const path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/transcriptions/lp1_wulfic_canonical.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(cs,ts,ls,ds){
 const c=JSON.parse(cs), segments=ts.split("%"), pages=[24,25,26], offsets=[3,2,1], runeMap=new Map(c.runes.map((x,i)=>[x,i]));const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);const check=(v,m)=>{if(!v)throw Error(m)};
 const words=pages.map((p,j)=>{let w=[...segments[p].replace(/\/\s*/g,"").matchAll(/[\u16a0-\u16ff]+/g)].map(m=>[...m[0]].map(x=>runeMap.get(x)));check(eq(w.flat(),c.pages[p].indices),"canonical mismatch");check(w[0].length===offsets[j],"carry mismatch");return w.slice(1)});
 const tape=words.map(x=>x.flat()),len=tape.map(x=>x.length);
 const partition=a=>{let counts=[0,0,0,0,0],pairs=[0,0,0],den=[0,0,0],sites=[[],[],[]];let p=[[0,1],[0,2],[1,2]];for(let j=0;j<3;j++){let [u,v]=p[j];den[j]=Math.min(a[u].length,a[v].length);for(let t=0;t<den[j];t++)if(a[u][t]===a[v][t]){pairs[j]++;sites[j].push(t)}}for(let t=0;t<Math.min(...a.map(x=>x.length));t++){let [x,y,z]=a.map(s=>s[t]);counts[x===y?(y===z?4:1):x===z?2:y===z?3:0]++}return {counts,pairs,den,sites,total:pairs.reduce((a,b)=>a+b,0)}};
 const original=partition(tape);check(eq(original.pairs,[8,10,9]),"original frozen signature");
 let state=0x33012426;const rnd=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
 const lp=ls.split("%").map(s=>[...s].filter(x=>runeMap.has(x)).map(x=>runeMap.get(x)));
 const koan=lp.slice(4,8).flat().map(x=>(31-x)%29),div=lp.slice(8,12).flat();check(koan.length===778&&div.length===755,"native length");check(koan.slice(0,6).map(x=>c.translit[x]).join("")==="ACOANA","native koan");
 const summarize=(xs,k)=>{const sorted=xs.slice().sort((a,b)=>a-b);return {min:sorted[0],p05:sorted[Math.floor(xs.length*.05)],median:sorted[Math.floor(xs.length*.5)],p95:sorted[Math.floor(xs.length*.95)],max:sorted.at(-1),atMostOriginal:xs.filter(v=>v<=k).length}};
 const samples=2000, native=[], independent=[], pairNative=[],tripleNative=[];
 function randomPermutation(){let a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function shared(a){const maps=Array.from({length:Math.max(...a.map(x=>x.length))},randomPermutation);return a.map(s=>s.map((x,i)=>maps[i][x]))}
 for(let s=0;s<samples;s++){let source=s%2?koan:div,other=s%2?div:koan;let starts=[rnd(source.length-len[0]-len[1]+1),0];starts[1]=starts[0]+len[0]+rnd(source.length-starts[0]-len[0]-len[1]+1);let a=[source.slice(starts[0],starts[0]+len[0]),source.slice(starts[1],starts[1]+len[1]),other.slice(0,0)];let b=rnd(other.length-len[2]+1);a[2]=other.slice(b,b+len[2]);if(s%4>=2)[a[0],a[1]]=[a[1].slice(0,len[0]),source.slice(starts[0],starts[0]+len[1])]; // second arrangement may overlap by a few runes: remove below
 if(s%4>=2){a[0]=source.slice(starts[1],starts[1]+len[0]);a[1]=source.slice(starts[0],starts[0]+len[1]);if(starts[1]<starts[0]+len[1]){a[1]=source.slice(starts[1]-len[1],starts[1])}}
 let p=partition(a);if(s===0)check(eq(partition(shared(a)),p),"nonlinear shared key invariant");native.push(p.total);pairNative.push(p.pairs[1]);tripleNative.push(p.counts[4]);independent.push(partition(len.map(n=>Array.from({length:n},()=>rnd(29)))).total)}
 // Find the repeated exact printed question directly in the solved native koan.
 let best={n:0,i:0,j:0};for(let i=0;i<koan.length;i++)for(let j=i+1;j<koan.length;j++){let n=0;while(j+n<koan.length&&i+n<j&&koan[i+n]===koan[j+n])n++;if(n>best.n)best={n,i,j}}
 const repeat=koan.slice(best.i,best.i+best.n);const repeated=[repeat,koan.slice(best.j,best.j+best.n),div.slice(0,best.n)];check(partition(shared(repeated)).pairs[0]===best.n,"repeated native positive");
 // Lexical witnesses: enforce the entire original equality partition, without prose scoring.
 const gp=w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let i=0;i<w.length;){let s=["TH","NG","EO","OE","AE","IA","EA"].find(x=>w.startsWith(x,i))||w[i];let n=c.translit.indexOf(s);if(n<0)return null;a.push(n);i+=s.length}return a};
 const domains=new Map(),seen=new Set();for(const line of ds.split(/\r?\n/)){let m=/^([a-z]+)\s+(\d+)$/.exec(line);if(!m)continue;let a=gp(m[1]);if(!a||!a.length||a.length>15)continue;let k=a.join(",");if(seen.has(k))continue;seen.add(k);if(!domains.has(a.length))domains.set(a.length,[]);domains.get(a.length).push({w:m[1],a,count:+m[2]})}
 for(const d of domains.values())d.sort((a,b)=>b.count-a.count);
 let vars=[],slots=words.map((ws,j)=>ws.flatMap(w=>{let id=vars.length;vars.push({j,n:w.length,edges:[],domain:domains.get(w.length)});return w.map((_,k)=>({id,k}))}));
 for(let j=0;j<3;j++)for(let k=j+1;k<3;k++)for(let t=0;t<Math.min(len[j],len[k]);t++){let a=slots[j][t],b=slots[k][t],same=tape[j][t]===tape[k][t];vars[a.id].edges.push({at:a.k,to:b.id,bt:b.k,same});vars[b.id].edges.push({at:b.k,to:a.id,bt:a.k,same})}
 function witness(){let val=vars.map(v=>v.domain[rnd(Math.min(80,v.domain.length))]);const cost=(i,d)=>vars[i].edges.reduce((n,e)=>n+(((d.a[e.at]===val[e.to].a[e.bt])===e.same)?0:e.same?5:1),0);for(let step=0;step<12000;step++){let bad=[];for(let i=0;i<vars.length;i++)if(cost(i,val[i]))bad.push(i);if(!bad.length){let out=words.map((_,j)=>vars.map((v,i)=>v.j===j?val[i]:null).filter(Boolean));let a=out.map(s=>s.flatMap(v=>v.a));check(eq(partition(a),original),"witness partition mismatch");let maps=[];for(let t=0;t<Math.max(...len);t++){let map=new Array(29).fill(-1),used=new Set();for(let j=0;j<3;j++)if(t<len[j]){map[a[j][t]]=tape[j][t];used.add(tape[j][t])}let free=Array.from({length:29},(_,i)=>i).filter(i=>!used.has(i));for(let i=0;i<29;i++)if(map[i]===-1)map[i]=free.shift();check(new Set(map).size===29,"not bijection");maps.push(map)}check(eq(a.map(s=>s.map((x,t)=>maps[t][x])),tape),"witness exact replay");return {step,words:out.map(s=>s.map(v=>v.w).join(" ")),runes:a}}
 let i=bad[rnd(bad.length)],d=vars[i].domain,best=Infinity,choices=[];for(const x of d){let q=cost(i,x);if(q<best){best=q;choices=[x]}else if(q===best)choices.push(x)}val[i]=rnd(100)<4?d[rnd(Math.min(200,d.length))]:choices[rnd(choices.length)];}return null}
 const w1=witness(),w2=witness();let diff=w1&&w2?w1.runes.reduce((n,a,j)=>n+a.filter((v,t)=>v!==w2.runes[j][t]).length,0):null;
 return {len,original,samples,nativeTotal:summarize(native,original.total),nativePair24_26:summarize(pairNative,10),nativeTriple:summarize(tripleNative,0),independentTotal:summarize(independent,original.total),repeat:{...best,text:repeat.map(x=>c.translit[x]).join(""),equal:partition(repeated).pairs[0]},witnesses:[w1&&{step:w1.step,words:w1.words},w2&&{step:w2.step,words:w2.words}],diff};
}
console.log(JSON.stringify(experiment(...paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
