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


 const period=13,dict=Array.from({length:25},()=>[]);for(const k of lex.keys()){const w=k.split(",").map(Number);if(w.length<dict.length)dict[w.length].push(w);}
 function encode(W,key){const s=key.slice();let q=0;return W.map(w=>w.map(p=>{if(p===0)return 0;const c=mod(p+s[q]);s[q]=p;q=(q+1)%period;return c;}));}
 function feasible(C,state,back){let visits=0;const stack=[{i:0,s:state.slice(),q:0}];while(stack.length){const a=stack.pop();let {i,s,q}=a;for(;i<C.length;i++){if(++visits>20000)return -1;const c=C[back?C.length-1-i:i];if(back){const k=(q+period-1)%period,p=s[k];if(c===0){if(p!==0){const alt=s.slice();alt[k]=mod(c-p);stack.push({i:i+1,s:alt,q:k});}continue;}if(p===0)break;s[k]=mod(c-p);q=k;}else{const p=mod(c-s[q]);if(c===0){if(p!==0){const alt=s.slice();alt[q]=p;stack.push({i:i+1,s:alt,q:(q+1)%period});}continue;}if(p===0)break;s[q]=p;q=(q+1)%period;}}if(i===C.length)return 1;}return 0;}
 function wordDecode(w,state,back){let a=[{p:[],s:state}];for(let i=0;i<w.length;i++){const c=w[back?w.length-1-i:i],b=[];for(const t of a){if(c===0)b.push({p:[...t.p,0],s:t.s});const p=back?t.s[period-1]:mod(c-t.s[0]);if(p!==0)b.push({p:[...t.p,p],s:back?[mod(c-p),...t.s.slice(0,-1)]:[...t.s.slice(1),p]});}a=b;if(!a.length)break;}return a.map(t=>({p:back?t.p.reverse():t.p,s:t.s}));}
 function solveSide(ws,state,back){let a=new Map([[state.join(),{s:state,score:0,prev:null}]]),trunc=0;for(const w of ws){const b=new Map();for(const t of a.values())for(const d of wordDecode(w,t.s,back)){const v=t.score+score(d.p),k=d.s.join(),old=b.get(k);if(!old||v>old.score)b.set(k,{s:d.s,score:v,prev:t,w:d.p});}if(!b.size)return null;if(b.size>128){trunc++;a=new Map([...b.entries()].sort((x,y)=>y[1].score-x[1].score).slice(0,128));}else a=b;}let t=[...a.values()].sort((x,y)=>y.score-x.score)[0],v=t.score,end=t.s,ans=[];while(t.prev){ans.push(t.w);t=t.prev;}return {score:v,words:ans.reverse(),end,trunc};}
 function search(C,truth=null){const eligible=C.map((w,i)=>({w,i,lo:w.filter(c=>c!==0).length})).filter(x=>dict[x.w.length]?.length&&x.lo>=period).sort((a,b)=>b.lo-a.lo||b.w.length-a.w.length||a.i-b.i);if(!eligible.length)return {skipped:"no full-state anchor"};const {w:anchor,i}=eligible[0],L=anchor.length,pre=C.slice(0,i),post=C.slice(i+1),before=pre.flat(),after=post.flat(),n=C.flat().length;let tries=0,survivors=0,unresolved=0,scoreDead=0,best=null,second=null,oracleSeen=false;
 const oracleState=truth?(()=>{let s=truth.key.slice();for(const p of truth.w.slice(0,i).flat())if(p!==0)s=[...s.slice(1),p];return s;})():null;
 const mustNonzero=before.filter(c=>c!==0).length>=period;
 function evaluate(key,word){tries++;let state=key.slice();for(const p of word)if(p!==0)state=[...state.slice(1),p];const x=feasible(after,state,false);if(x<0){unresolved++;return;}if(!x)return;const y=feasible(before,key,true);if(y<0){unresolved++;return;}if(!y)return;survivors++;if(oracleState&&key.join()===oracleState.join()&&word.join()===truth.w[i].join())oracleSeen=true;
 const right=solveSide(post,state,false),left=solveSide(pre.slice().reverse(),key,true);if(!right||!left){scoreDead++;return;}const total=right.score+left.score+score(word),p=[...left.words.reverse(),word,...right.words],k0=left.end;assert(encode(p,k0).flat().join()===C.flat().join(),"replay");const v={key:k0,score:total/n,lex:p.filter(w=>lex.has(w.join(","))).length,words:p.length,output:p.map(w=>w.map(x=>j.translit[x]).join("")).join(" "),plain:p.flat(),trunc:left.trunc+right.trunc};if(!best||v.score>best.score){second=best;best=v;}else if(!second||v.score>second.score)second=v;}
 for(const w of dict[L]){const key=Array(period).fill(-1),consumed=[];let ok=true;for(let k=0;k<L;k++){if(w[k]===0){if(anchor[k]!==0){ok=false;break;}continue;}const d=mod(anchor[k]-w[k]),q=consumed.length;if(q<period){if(mustNonzero&&d===0){ok=false;break;}key[q]=d;}else if(consumed[q-period]!==d){ok=false;break;}consumed.push(w[k]);}if(!ok)continue;assert(key.every(x=>x>=0),"full state");evaluate(key,w);}
 return {anchor:i,length:L,anchorNonF:anchor.filter(c=>c!==0).length,anchorRune:before.length,dict:dict[L].length,tries,survivors,unresolved,scoreDead,n,oracleSeen,oracleCovered:truth?dict[L].some(w=>w.join()===truth.w[i].join()):null,best:best?{key:best.key,score:best.score,margin:second?best.score-second.score:null,lex:best.lex,words:best.words,output:best.output,trunc:best.trunc,correct:truth?best.plain.filter((p,i)=>p===truth.w.flat()[i]).length:null,keyCorrect:truth?best.key.join()===truth.key.join():null}:null};}
 const plantKeys=[gp("FIRFUMFERENFE"),Array.from({length:period},(_,i)=>(i*i*7+3*i+19)%29),Array.from({length:period},(_,i)=>(i*11+7)%29)];
 const plantWords=[take(textWords[0],Math.floor(textWords[0].length*.7)+10,1800),take(textWords[1],Math.floor(textWords[1].length*.7)+10,1800),take(native(data[5].slice(data[5].indexOf('### 1\n')).replace(/^#.*$/gm,'').replace(/\[[^\]]*\]/g,'').replace(/\([^)]*\)/g,'')),0,1500)];
 const controls=plantWords.map((w,i)=>({name:["Gibran heldout","Emerson heldout","LP1 reference"][i],...search(encode(w,plantKeys[i]),{w,key:plantKeys[i]})}));
 const originals=sections.map(ch=>({name:ch.name,...search(ch.w)}));return {period,controls,originals};
}

console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'))),null,2));
