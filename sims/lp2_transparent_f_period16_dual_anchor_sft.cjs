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

 const period=16,maskAll=(1<<period)-1,rot=m=>((m<<1)&maskAll)|(m>>>(period-1)),rev=m=>(m>>>1)|((m&1)<<(period-1));
 const dict=Array.from({length:25},()=>[]);for(const k of lex.keys()){const w=k.split(",").map(Number);if(w.length<dict.length)dict[w.length].push(w);}
 const encode=(W,key)=>{let s=0;return W.map(w=>w.map(p=>p===0?0:mod(p+key[s++%period])))};
 const makeMasks=k=>{const a=new Int32Array(29);for(let i=0;i<period;i++)a[k[i]]|=1<<i;return a;};
 function feasible(C,m,km,back=false){for(let z=0;z<C.length;z++){const c=C[back?C.length-1-z:z];if(back){const n=rev(m)&~km[c];m=c===0?(m|n):n;}else{const n=rot(m&~km[c]);m=c===0?(m|n):n;}if(!m)return 0;}return m;}
 function wordDecode(w,key,s,back){let a=[{p:[],s}];for(let i=0;i<w.length;i++){const c=w[back?w.length-1-i:i],b=[];for(const t of a){if(c===0)b.push({p:[...t.p,0],s:t.s});const k=back?(t.s+period-1)%period:t.s,p=mod(c-key[k]);if(p!==0)b.push({p:[...t.p,p],s:back?k:(k+1)%period});}a=b;if(!a.length)break;}return a.map(t=>({p:back?t.p.reverse():t.p,s:t.s}));}
 function solveSide(ws,key,s,back,required=null){let a=new Map([[s,{s,score:0,prev:null}]]);for(const w of ws){const b=new Map();for(const t of a.values())for(const d of wordDecode(w,key,t.s,back)){const v=t.score+score(d.p),old=b.get(d.s);if(!old||v>old.score)b.set(d.s,{s:d.s,score:v,prev:t,w:d.p});}if(!b.size)return null;a=b;}if(required!==null&&!a.has(required))return null;let t=(required!==null?[a.get(required)]:[...a.values()]).sort((x,y)=>y.score-x.score)[0],v=t.score,end=t.s,ans=[];while(t.prev){ans.push(t.w);t=t.prev;}return {score:v,words:ans.reverse(),end};}

 function search(C,truth=null){const eligible=C.map((w,i)=>({w,i,lo:w.filter(c=>c!==0).length})).filter(x=>dict[x.w.length]?.length&&x.lo>=10).sort((a,b)=>b.lo-a.lo||b.w.length-a.w.length||a.i-b.i);if(eligible.length<2)return {skipped:"fewer than two long anchors"};const aa=eligible.slice(0,2).sort((a,b)=>a.i-b.i);const [A,B]=aa;const pre=C.slice(0,A.i),mid=C.slice(A.i+1,B.i),post=C.slice(B.i+1);const flatPre=pre.flat(),flatMid=mid.flat(),flatPost=post.flat(),n=C.flat().length,dist=C.slice(A.i,B.i).flat(),minDist=dist.filter(c=>c!==0).length;const phases=[...new Set(Array.from({length:dist.length-minDist+1},(_,i)=>(minDist+i)%period))];
 function partial(a){const out=[];for(const w of dict[a.w.length]){let k=[],valid=true;for(let i=0;i<w.length;i++){if(w[i]===0){if(a.w[i]!==0){valid=false;break;}}else{const d=mod(a.w[i]-w[i]);if(k.length>=period&&k[k.length%period]!==d){valid=false;break;}k.push(d);}}if(valid)out.push({w,k:k.slice(0,period),count:k.length});}return out;}
 const aList=partial(A),bList=partial(B);let pairs=0,joins=0,tries=0,survivors=0,deferred=0,oracleSeen=false,best=null,second=null;
 const oraclePhase=truth?truth.w.slice(0,A.i).flat().filter(x=>x!==0).length%period:null,oracleKey=truth?Array.from({length:period},(_,k)=>truth.key[(oraclePhase+k)%period]):null;
 function evaluate(key,a,b,q){tries++;const km=makeMasks(key);if(!feasible(flatPre,1,km,true)||!(feasible(flatMid,1<<(a.count%period),km)&(1<<q))||!feasible(flatPost,1<<((q+b.count)%period),km))return;survivors++;if(oracleKey&&key.join()===oracleKey.join())oracleSeen=true;
 const l=solveSide(pre.slice().reverse(),key,0,true),m=solveSide(mid,key,a.count%period,false,q),r=solveSide(post,key,(q+b.count)%period,false);assert(l&&m&&r,"feasible/Viterbi");const p=[...l.words.reverse(),a.w,...m.words,b.w,...r.words],k0=Array.from({length:period},(_,i)=>key[(l.end+i)%period]);assert(encode(p,k0).flat().join()===C.flat().join(),"replay");const v={key:k0,score:(l.score+m.score+r.score+score(a.w)+score(b.w))/n,lex:p.filter(w=>lex.has(w.join(","))).length,words:p.length,output:p.map(w=>w.map(x=>j.translit[x]).join("")).join(" "),plain:p.flat()};if(!best||v.score>best.score){second=best;best=v;}else if(!second||v.score>second.score)second=v;}
 for(const a of aList)for(const b of bList)for(const q of phases){pairs++;const key=Array(period).fill(-1);for(let i=0;i<a.k.length;i++)key[i]=a.k[i];let ok=true;for(let i=0;i<b.k.length;i++){const p=(q+i)%period;if(key[p]!==-1&&key[p]!==b.k[i]){ok=false;break;}key[p]=b.k[i];}if(!ok)continue;joins++;const rem=key.filter(x=>x===-1).length;if(rem>3){deferred++;continue;}function fill(k){while(k<period&&key[k]!==-1)k++;if(k===period){evaluate(key,a,b,q);return;}for(let d=0;d<29;d++){key[k]=d;fill(k+1);}key[k]=-1;}fill(0);}
 return {n,anchors:aa.map(x=>({i:x.i,len:x.w.length,nonF:x.lo})),phases,aList:aList.length,bList:bList.length,pairs,joins,tries,survivors,deferred,oracleSeen,oracleCovered:truth?aa.every(x=>dict[x.w.length].some(w=>w.join()===truth.w[x.i].join())):null,best:best?{key:best.key,score:best.score,margin:second?best.score-second.score:null,lex:best.lex,words:best.words,output:best.output,correct:truth?best.plain.filter((p,i)=>p===truth.w.flat()[i]).length:null,keyCorrect:truth?best.key.join()===truth.key.join():null}:null};}
 const plantKeys=[Array.from({length:period},(_,i)=>(i*i*7+3*i+19)%29),Array.from({length:period},(_,i)=>(i*11+7)%29),Array.from({length:period},(_,i)=>(i*i*3+5*i+13)%29)];
 const plantWords=[take(textWords[0],Math.floor(textWords[0].length*.7)+10,1100),take(textWords[1],Math.floor(textWords[1].length*.7)+10,1100),take(native(data[5].slice(data[5].indexOf('### 1\n')).replace(/^#.*$/gm,'').replace(/\[[^\]]*\]/g,'').replace(/\([^)]*\)/g,'')),0,1500)];
 const controls=plantWords.map((w,i)=>({name:["Gibran heldout","Emerson heldout","LP1 reference"][i],...search(encode(w,plantKeys[i]),{w,key:plantKeys[i]})}));
 const originals=sections.map(ch=>({name:ch.name,...search(ch.w)}));return {period,controls,originals};
}

console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'))),null,2));
