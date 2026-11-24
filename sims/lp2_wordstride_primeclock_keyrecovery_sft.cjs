'use strict';
// Cumulative word-sum prime clock: calibrated unknown-start key recovery.
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
function study(data){
 const j=JSON.parse(data[0]),mod=x=>(x%29+29)%29,assert=(v,m)=>{if(!v)throw Error(m)};
 const alpha=[["ING",21],...j.translit.map((t,i)=>[t,i])].sort((a,b)=>b[0].length-a[0].length);
 const gp=w=>{w=w.toUpperCase().replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");const a=[];while(w){const m=alpha.find(x=>w.startsWith(x[0]));if(!m)return [];a.push(m[1]);w=w.slice(m[0].length)}return a};
 const native=t=>(t.match(/[A-Za-z]+/g)||[]).map(gp).filter(w=>w.length);
 const textWords=data.slice(3,5).map(native),train=textWords.map(w=>w.slice(0,Math.floor(w.length*.7)));
 const lex=new Map;let lexTotal=0;const add=(w,f)=>{if(w.length){let k=w.join(",");lex.set(k,(lex.get(k)||0)+f);lexTotal+=f;}};
 for(const line of data[2].split("\n")){const m=line.match(/^([a-z]+)\s+(\d+)$/);if(m)add(gp(m[1]),Number(m[2]));}
 const uni=new Float64Array(30),bi=new Float64Array(900),tri=new Float64Array(27000),nb=new Float64Array(30),nt=new Float64Array(900);let all=0;
 for(const ws of train)for(const w of ws){add(w,1);let p=29,q=29;for(const x of [...w,29]){uni[x]++;bi[q*30+x]++;tri[(p*30+q)*30+x]++;nb[q]++;nt[p*30+q]++;all++;p=q;q=x;}}
 const logs=new Float64Array(27000);for(let p=0;p<30;p++)for(let q=0;q<30;q++)for(let x=0;x<30;x++){let a=(uni[x]+.1)/(all+3),b=(bi[q*30+x]+5*a)/(nb[q]+5),c=(tri[(p*30+q)*30+x]+10*b)/(nt[p*30+q]+10);logs[(p*30+q)*30+x]=Math.log(c);}
 const cache=new Map;function score(w){const k=w.join(",");if(cache.has(k))return cache.get(k);let a=29,b=29,z=0;for(const x of [...w,29]){z+=logs[(a*30+b)*30+x];a=b;b=x;}const v=Math.log(.85*(lex.get(k)||0)/lexTotal+.15*Math.exp(z));if(cache.size<400000)cache.set(k,v);return v;}
 const parse=s=>(s.replace(/[\/\r\n]/g,"").match(new RegExp("["+j.runes.join("")+"]+","gu"))||[]).map(w=>[...w].map(r=>j.runes.indexOf(r)));
 const parts=data[1].split("%"),chapter=parse(parts.slice(0,3).join("")),p57=parse(parts[56]);
 assert(chapter.flat().length===729&&chapter.flat().join()===j.pages.slice(0,3).flatMap(p=>p.indices).join(),"chapter source");
 assert(p57.flat().join()===j.pages[57].indices.join(),"p57 source");
 const original=parts.slice(0,55).join("");
 const sections=original.split("$").map(parse).filter(ws=>ws.length).map((w,i)=>({name:"section"+(i+1),w}));
 assert(sections.flatMap(x=>x.w).length===2896&&sections.flatMap(x=>x.w.flat()).join()===j.pages.slice(0,56).flatMap(p=>p.indices).join(),"section corpus");
 const terminal=parse(parts.slice(53,55).join(""));assert(terminal.flat().length===308,"terminal");
 sections.push({name:"supplemental p54–55",w:terminal});
 const take=(ws,start,min)=>{let a=[],n=0;for(let i=start;n<min;i++){a.push(ws[i]);n+=ws[i].length;}return a;};
 const lp1=take(native(data[5].slice(data[5].indexOf("A MAN DECIDED TO GO"))),0,180);
 const gibran=take(textWords[0],Math.floor(textWords[0].length*.7)+100,180);
 const plants=[{name:"p57",w:p57,seed:3301},{name:"LP1 koan",w:lp1,seed:12345},{name:"heldout Gibran",w:gibran,seed:1033}];
 const needed=12956+Math.max(...sections.map(x=>x.w.flat().length))*109+14,limit=Math.ceil(needed*(Math.log(needed)+Math.log(Math.log(needed)))+1000),composite=new Uint8Array(limit+1),primes=[];for(let n=2;n<=limit;n++){if(composite[n])continue;primes.push(n);if(n*n<=limit)for(let k=n*n;k<=limit;k+=n)composite[k]=1;}
 assert(primes.length>needed,"prime range");
 const width=1024;
 const out=[];
 for(const weight of ["prime","ordinal"])for(const hold of [true,false]){
 const wt=weight==="prime"?j.prime:j.prime.map((_,i)=>i),sum=w=>w.reduce((a,x)=>a+wt[x],0);
 const key=(s,i)=>mod(primes[s+i]-1);
 function enc(w,s){let i=0;return w.map(x=>hold&&x===0?0:mod(x+key(s,i++)));}
 function dec(w,s){let a=[{p:[],i:0}];for(const x of w){let b=[];for(const z of a){if(hold&&x===0)b.push({p:[...z.p,0],i:z.i});const y=mod(x-key(s,z.i));if(!hold||y!==0)b.push({p:[...z.p,y],i:z.i+1});}a=b;if(!a.length)break;}return a.map(z=>z.p);}
 function encode(ws,start){let s=start;return ws.map(w=>{let c=enc(w,s);s+=sum(w);return c;});}
 function unwind(st){let w=[];const score=st.score,end=st.s;while(st.prev){w.push(st.w);st=st.prev;}return {w:w.reverse(),seed:st.s,score,end};}
 function search(C,initial,oracle=null){let beam=initial.map(s=>({s,score:0,prev:null})),oracleS=oracle?.seed,oracleScore=0,pruned=-1,peak=0,truncations=0;for(let i=0;i<C.length;i++){const next=new Map();for(const st of beam)for(const w of dec(C[i],st.s)){const s=st.s+sum(w),v=st.score+score(w),prev=next.get(s);if(!prev||prev.score<v)next.set(s,{s,score:v,prev:st,w});}
 peak=Math.max(peak,next.size);if(next.size>width)truncations++;
 beam=[...next.values()].sort((a,b)=>b.score-a.score).slice(0,width);
 if(oracle){oracleScore+=score(oracle.w[i]);oracleS+=sum(oracle.w[i]);if(pruned<0&&!beam.some(z=>z.s===oracleS&&Math.abs(z.score-oracleScore)<1e-8))pruned=i;}
 if(!beam.length)return {best:null,firstDead:i,pruned,peak,truncations};}
 return {best:unwind(beam[0]),second:beam[1]?.score??null,pruned,oracleScore,peak,truncations};}
 function report(r,C,truth){if(!r.best)return {dead:r.firstDead,pruned:r.pruned,peak:r.peak,truncations:r.truncations};let b=r.best;assert(encode(b.w,b.seed).flat().join()===C.flat().join(),"original replay");let n=C.flat().length;return {seed:b.seed,end:b.end,n,score:b.score/n,margin:r.second===null?null:b.score-r.second,pruned:r.pruned,peak:r.peak,truncations:r.truncations,correct:truth?b.w.flat().reduce((s,x,i)=>s+Number(x===truth.w.flat()[i]),0):null,seedCorrect:truth?b.seed===truth.seed:null,oracleGap:truth?r.oracleScore-b.score:null,lex:b.w.filter(w=>lex.has(w.join(","))).length,words:b.w.length,output:b.w.map(w=>w.map(x=>j.translit[x]).join("")).join(" ")};}
 const seeds=Array.from({length:12957},(_,i)=>i),controls=[];
 for(const plant of plants){const C=encode(plant.w,plant.seed),r=search(C,seeds,plant);controls.push({name:plant.name,...report(r,C,plant)});}
 const pass=controls.every(r=>r.seedCorrect&&r.correct/r.n>=.95);
 const originals=[];
 if(pass)for(const ch of sections){const cut=Math.min(45,Math.floor(ch.w.length/2)),C=ch.w.slice(0,cut),d=search(C,seeds),dev=report(d,C);if(d.best){const held=ch.w.slice(cut),dh=search(held,[d.best.end]);originals.push({name:ch.name,totalRunes:ch.w.flat().length,totalWords:ch.w.length,dev,holdout:report(dh,held)});}else originals.push({name:ch.name,totalRunes:ch.w.flat().length,totalWords:ch.w.length,dev});}
 out.push({weight,hold,width,controls,pass,originals});
 }return {lex:lex.size,train:train.map(x=>x.length),sections:sections.map(x=>[x.name,x.w.length,x.w.flat().length]),out};
}
console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8"))),null,2));
