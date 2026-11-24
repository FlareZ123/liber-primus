'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
function study(data,joins){
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

 function run(row){const period=row.period,pm=x=>(x%period+period)%period;
 function enc(W,key,coef,seed){let s=seed;return W.map(w=>{let q=pm(s),d=s%2?1:-1;const c=w.map(p=>{if(p===0)return 0;const y=mod(coef*p+key[q]);q=pm(q+d);return y;});s=sum(w)%(2*period);return c;});}
 function dec(w,key,coef,q,d){let a=[{p:[],q}];for(const c of w){const b=[];for(const t of a){if(c===0)b.push({p:[...t.p,0],q:t.q});const p=mod(inv[coef]*(c-key[t.q]));if(p!==0)b.push({p:[...t.p,p],q:pm(t.q+d)});}a=b;if(!a.length)break;}return a.map(x=>x.p);}
 function stateSolve(C,key,coef){let a=new Map(Array.from({length:2*period},(_,s)=>[s,{s,score:0,prev:null,seed:s}]));for(const w of C){const b=new Map();for(const t of a.values())for(const p of dec(w,key,coef,pm(t.s),t.s%2?1:-1)){const s=sum(p)%(2*period),v=t.score+score(p),old=b.get(s);if(!old||v>old.score)b.set(s,{s,score:v,prev:t,w:p,seed:t.seed});}if(!b.size)return null;a=b;}let t=[...a.values()].sort((x,y)=>y.score-x.score)[0],v=t.score,seed=t.seed,p=[];while(t.prev){p.push(t.w);t=t.prev;}p.reverse();assert(enc(p,key,coef,seed).flat().join()===C.flat().join(),"replay");return {score:v/C.flat().length,seed,p};}
 function extend(keys,w){let out=new Map();for(const {coef,key} of keys)for(const p of dict[w.length]){const shifts=[];let ok=true;for(let i=0;i<w.length;i++){if(p[i]===0){if(w[i]!==0){ok=false;break;}}else shifts.push(mod(w[i]-coef*p[i]));}if(!ok)continue;for(let q=0;q<period;q++)for(const d of [1,-1]){const k=key.slice();let good=true;for(let i=0;i<shifts.length;i++){const at=pm(q+d*i);if(k[at]!==-1&&k[at]!==shifts[i]){good=false;break;}k[at]=shifts[i];}if(good)out.set(coef+":"+k.join(),{coef,key:k});}}return [...out.values()];}
 const plantWords=[take(textWords[1],Math.floor(textWords[1].length*.7)+10,1100),take(native(data[5].slice(data[5].indexOf('### 1\n')).replace(/^#.*$/gm,'').replace(/\[[^\]]*\]/g,'').replace(/\([^)]*\)/g,'')),0,1500)];
 const plantKeys=[Array.from({length:period},(_,i)=>(i*11+7)%29),Array.from({length:period},(_,i)=>(i*i*3+5*i+13)%29)];
 function recover(C,prior,truth){let keys=prior.stored;const counts=[keys.length];for(const x of prior.anchors.slice(2)){keys=extend(keys,C[x.i]);counts.push(keys.length);}let best=null,deferred=0,tries=0,legal=0,seen=new Set();
 for(const {coef,key} of keys){const rem=key.filter(x=>x===-1).length;if(rem>2){deferred++;continue;}function evaluate(){for(let q=0;q<period;q++)for(const d of [1,-1]){const k=Array.from({length:period},(_,i)=>key[pm(q+d*i)]),ks=coef+":"+k.join();if(seen.has(ks))continue;seen.add(ks);tries++;const r=stateSolve(C,k,coef);if(!r)continue;legal++;if(!best||r.score>best.score)best={...r,key:k,coef};}}function fill(k){while(k<period&&key[k]!==-1)k++;if(k===period){evaluate();return;}for(let v=0;v<29;v++){key[k]=v;fill(k+1);}key[k]=-1;}fill(0);}
 return {counts,deferred,tries,legal,n:C.flat().length,best:best?{key:best.key,coef:best.coef,seed:best.seed,score:best.score,output:best.p.map(w=>w.map(x=>j.translit[x]).join("")).join(" "),correct:best.p.flat().filter((p,i)=>p===truth.w.flat()[i]).length,keyCorrect:best.key.join()===truth.key.join()&&best.coef===truth.coef&&best.seed===truth.seed}:null};}
 const controls=plantWords.map((w,i)=>{const key=plantKeys[i],coef=[7,28][i],seed=[9,14][i];return {name:["Emerson heldout","LP1 reference"][i],...recover(enc(w,key,coef,seed),row.controls[i],{w,key,coef,seed})};});return {period,controls};}
 return joins.map(run);
}

console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8')),JSON.parse(fs.readFileSync(path.join(__dirname,'..','im-results/lp2-wordrephase-affine-anchor-join.json'),'utf8'))),null,2));
