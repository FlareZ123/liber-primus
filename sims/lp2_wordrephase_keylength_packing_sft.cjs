'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
function study(data,selected=null){
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


 const dict=Array.from({length:25},()=>[]);for(const k of lex.keys()){const w=k.split(",").map(Number);if(w.length<dict.length)dict[w.length].push(w);}
 const inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
 const sum=w=>w.reduce((a,x)=>a+j.prime[x],0);

 const width=7,limit=24,base=29,pow=base**(width-1);
 const pop=x=>{let n=0;while(x){x&=x-1;n++;}return n;};
 function mwis(adj,wt,allowed){let best=0,witness=0,nodes=0;const weight=m=>{let s=0;while(m){const v=31-Math.clz32(m&-m);s+=wt[v];m&=m-1;}return s;};function solve(m,s,chosen){nodes++;if(s+weight(m)<=best)return;if(!m){best=s;witness=chosen;return;}let v=-1,deg=-1;for(let q=m;q;q&=q-1){const i=31-Math.clz32(q&-q),d=pop(adj[i]&m);if(d>deg){deg=d;v=i;}}if(deg===0){best=s+weight(m);witness=chosen|m;return;}const b=1<<v;solve(m&~b&~adj[v],s+wt[v],chosen|b);solve(m&~b,s,chosen);}solve(allowed,0,0);return {weight:best,indices:wt.map((_,i)=>i).filter(i=>witness&(1<<i)),nodes};}
 function candidates(w){const out=[];for(const p of dict[w.length]){const cs=[],ps=[];let ok=true;for(let i=0;i<p.length;i++){if(p[i]===0){if(w[i]!==0){ok=false;break;}}else{cs.push(w[i]);ps.push(p[i]);}}if(ok&&ps.length>=width)out.push({cs,ps});}return out;}
 function bound(C,truth=null){const aa=C.map((w,i)=>({w,i,lo:w.filter(x=>x!==0).length})).filter(x=>x.lo>=width&&dict[x.w.length]?.length).sort((a,b)=>b.lo-a.lo||b.w.length-a.w.length||a.i-b.i).slice(0,limit);
 const cand=aa.map(x=>candidates(x.w)),wt=aa.map(x=>x.lo-width+1),n=aa.length,all=(1<<n)-1,covered=truth?aa.reduce((m,x,i)=>m|(lex.has(truth.w[x.i].join())?(1<<i):0),0):all,union=Array(n).fill(0),rows=[];let signatures=0;
 for(let coef=1;coef<29;coef++){const adj=Array(n).fill(0),index=new Map();for(let i=0;i<n;i++){const bit=1<<i;for(const {cs,ps} of cand[i]){const k=cs.map((c,j)=>mod(c-coef*ps[j]));for(let p=0;p+width<=k.length;p++){let f=0,r=0;for(let d=0;d<width;d++){f=f*base+k[p+d];r=r*base+k[p+width-1-d];}const sig=Math.min(f,r),old=index.get(sig)||0,other=old&~bit;if(other){adj[i]|=other;for(let q=other;q;q&=q-1)adj[31-Math.clz32(q&-q)]|=bit;}if(!(old&bit))index.set(sig,old|bit);}}}
 signatures+=index.size;for(let i=0;i<n;i++)union[i]|=adj[i];const full=mwis(adj,wt,all),known=truth?mwis(adj,wt,covered):null;rows.push({coef,bound:full.weight,witness:full.indices.map(i=>aa[i].i),edges:adj.reduce((s,x)=>s+pop(x),0)/2,coveredBound:known?.weight??null});}
 const common=mwis(union,wt,all),min=Math.min(...rows.map(r=>r.bound)),minCovered=truth?Math.min(...rows.map(r=>r.coveredBound)):null;
 return {n:C.flat().length,anchors:aa.map((x,i)=>({i:x.i,len:x.w.length,nonF:x.lo,weight:wt[i],candidates:cand[i].length,covered:truth?!!(covered&(1<<i)):null})),minBound:min,minCovered,commonBound:common.weight,commonWitness:common.indices.map(i=>aa[i].i),signatures,rows,truthPeriod:truth?.period??null,truthCoef:truth?.coef??null,truthBound:truth?rows[truth.coef-1].coveredBound:null};}
 function plant(W,period,coef){const key=Array.from({length:period},(_,i)=>(i*i*7+3*i+19)%29);let s=9;const C=W.map(w=>{let q=s%period,d=s%2?1:-1;const c=w.map(p=>{if(p===0)return 0;const y=mod(coef*p+key[q]);q=(q+d+period)%period;return y;});s=sum(w)%(2*period);return c;});return {C,truth:{w:W,period,coef}};}
 const cases=sections.map(ch=>({name:ch.name,C:ch.w,truth:null}));
 const W=take(textWords[1],Math.floor(textWords[1].length*.7)+10,1100);const L=take(native(data[5].slice(data[5].indexOf('### 1\n')).replace(/^#.*$/gm,'').replace(/\[[^\]]*\]/g,'').replace(/\([^)]*\)/g,'')),0,1500);
 for(const [label,w] of [["Emerson",W],["LP1",L]])for(const [period,coef] of [[13,7],[29,28]])cases.push({name:label+" control m"+period,...plant(w,period,coef)});
 return {width,limit,cases:cases.filter(x=>!selected||selected.includes(x.name)).map(x=>({name:x.name,...bound(x.C,x.truth)}))};
}

console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8')),process.argv.length>2?process.argv.slice(2):null),null,2));
