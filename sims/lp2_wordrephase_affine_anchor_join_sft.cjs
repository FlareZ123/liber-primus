'use strict';
const fs=require('node:fs'),path=require('node:path');
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


 const dict=Array.from({length:25},()=>[]);for(const k of lex.keys()){const w=k.split(",").map(Number);if(w.length<dict.length)dict[w.length].push(w);}
 const inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
 const sum=w=>w.reduce((a,x)=>a+j.prime[x],0);
 function run(period){
 const pm=x=>(x%period+period)%period;
 function partial(a){const out=[];for(const w of dict[a.w.length]){const cs=[],ps=[];let valid=true;for(let i=0;i<w.length;i++){if(w[i]===0){if(a.w[i]!==0){valid=false;break;}}else{cs.push(a.w[i]);ps.push(w[i]);}}if(!valid)continue;let coef=0;for(let i=period;i<ps.length;i++){const dp=mod(ps[i]-ps[i%period]),dc=mod(cs[i]-cs[i%period]);if(dp===0){if(dc!==0){valid=false;break;}}else{const k=mod(dc*inv[dp]);if(k===0||(coef&&coef!==k)){valid=false;break;}coef=k;}}if(valid)out.push({w,cs:cs.slice(0,period),ps:ps.slice(0,period),count:ps.length,coef});}return out;}
 function enc(W,key,coef,seed){let s=seed;return W.map(w=>{let q=pm(s),d=s%2?1:-1;const c=w.map(p=>{if(p===0)return 0;const y=mod(coef*p+key[q]);q=pm(q+d);return y;});s=sum(w)%(2*period);return c;});}
 function search(C,truth=null){const eligible=C.map((w,i)=>({w,i,lo:w.filter(c=>c!==0).length})).filter(x=>dict[x.w.length]?.length&&x.lo>=10).sort((a,b)=>b.lo-a.lo||b.w.length-a.w.length||a.i-b.i);if(eligible.length<2)return {skipped:"fewer than two long anchors"};const aa=eligible.slice(0,4),[A,B]=aa,aList=partial(A),bList=partial(B),n=C.flat().length;let pairs=0,joins=0,oracleSeen=false,stored=[],hist=Array(period+1).fill(0);
 const phases=Array.from({length:period},(_,q)=>[1,-1].map(d=>Array.from({length:period},(_,i)=>pm(q+d*i)))).flat();
 for(const a of aList)for(const b of bList){if(a.coef&&b.coef&&a.coef!==b.coef)continue;for(const phase of phases){pairs++;let coef=a.coef||b.coef,ok=true;for(let i=0;i<b.ps.length;i++){const p=phase[i];if(p>=a.ps.length)continue;const dp=mod(a.ps[p]-b.ps[i]),dc=mod(a.cs[p]-b.cs[i]);if(dp===0){if(dc!==0){ok=false;break;}}else{const k=mod(dc*inv[dp]);if(k===0||(coef&&coef!==k)){ok=false;break;}coef=k;}}if(!ok)continue;const coefficients=coef?[coef]:Array.from({length:28},(_,i)=>i+1);for(const co of coefficients){joins++;const key=Array(period).fill(-1);for(let i=0;i<a.ps.length;i++)key[i]=mod(a.cs[i]-co*a.ps[i]);for(let i=0;i<b.ps.length;i++)key[phase[i]]=mod(b.cs[i]-co*b.ps[i]);const rem=key.filter(x=>x===-1).length;hist[rem]++;if(truth&&co===truth.coef&&Array.from({length:period},(_,q)=>[1,-1].some(d=>key.every((x,i)=>x<0||x===truth.key[pm(q+d*i)]))).some(Boolean))oracleSeen=true;if(stored.length<50000)stored.push({coef:co,key});}}}
 return {n,anchors:aa.map(x=>({i:x.i,len:x.w.length,nonF:x.lo})),aList:aList.length,bList:bList.length,pairs,joins,missingHistogram:hist,oracleSeen,oracleCovered:truth?aa.map(x=>dict[x.w.length].some(w=>w.join()===truth.w[x.i].join())):null,stored,truncated:joins>stored.length};}
 const plantWords=[take(textWords[1],Math.floor(textWords[1].length*.7)+10,1100),take(native(data[5].slice(data[5].indexOf('### 1\n')).replace(/^#.*$/gm,'').replace(/\[[^\]]*\]/g,'').replace(/\([^)]*\)/g,'')),0,1500)];
 const plantKeys=[Array.from({length:period},(_,i)=>(i*11+7)%29),Array.from({length:period},(_,i)=>(i*i*3+5*i+13)%29)];
 const controls=plantWords.map((w,i)=>{const key=plantKeys[i],coef=[7,28][i],seed=[9,14][i];return {name:["Emerson heldout","LP1 reference"][i],...search(enc(w,key,coef,seed),{w,key,coef,seed})};});
 const originals=sections.map(ch=>({name:ch.name,...search(ch.w)}));return {period,controls,originals};
 }
 return [run(13),run(16)];
}

console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'))),null,2));
