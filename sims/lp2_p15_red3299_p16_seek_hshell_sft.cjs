"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,tr,signed,solved,donor,gridReport){
 const M=x=>(x%29+29)%29,sum=a=>a.reduce((s,x)=>s+x,0),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),check=(x,m)=>{if(!x)throw Error(m)},H=k=>[M(k[0]-k[3]),M(k[1]-k[2]),M(k[1]+k[2]),M(k[0]+k[3])],I=s=>[M(15*(s[0]+s[3])),M(15*(s[1]+s[2])),M(15*(s[2]-s[1])),M(15*(s[3]-s[0]))];
 const grid=[...gridReport.matchAll(/^\|\s*(\d+)\s*\|\s*\d+\s*\|\s*\d+\s*\|\s*\d+\s*\|\s*(?:\*\*)?(\d+)/gm)].map(x=>[+x[1],+x[2]]);check(grid.length===16&&grid.every((x,i)=>x[0]===i),"established grid");
 const numbers=grid.map(x=>x[1]);check(eq(numbers,[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]),"source cell values");
 const ri=new Map(corpus.runes.map((r,i)=>[r,i])),tokens=corpus.translit.map((v,i)=>[v,i]).sort((a,b)=>b[0].length-a[0].length);
 function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w){if(w.startsWith("ING")){out.push(21);w=w.slice(3);continue}if(w.startsWith("IO")){out.push(27);w=w.slice(2);continue}const t=tokens.find(t=>w.startsWith(t[0]));check(t,"unmapped "+w);out.push(t[1]);w=w.slice(t[0].length)}}return out}
 const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0],source=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/).filter(x=>/^[A-Za-z]+$/.test(x)).map((word,index)=>({word:word.toUpperCase(),index,p:gp(word)}));check(source.length===43,"source");
 let words=[],w=[],sp=-1,ep=-1,st=0;function flush(){if(w.length)words.push({page:sp,endPage:ep,start:st,c:w});w=[]}
 const parts=tr.replace(/\r/g,"").split(/^\s*%\s*$/m).slice(0,55);for(let s=0;s<parts.length;s++){const p=s>=50?s+1:s;let o=0;for(const ch of parts[s]){if(ri.has(ch)){if(!w.length){sp=p;st=o}ep=p;w.push(ri.get(ch));o++}else if(!/[\s/]/u.test(ch))flush()}check(o===corpus.pages[p].indices.length,"offset")}flush();
 const four=words.filter(w=>w.page===w.endPage&&w.c.length===4),vocab=[...new Map(source.filter(s=>s.p.length===4).map(s=>[s.p.join(),s])).values()];check(four.length===509,"word count");
 const keys=numbers.map(n=>{const shell=[Math.floor(n/29)%29,n%29,15,14],key=I(shell);check(eq(H(key),shell),"H");return {n,shell,key}});
 check(eq(keys[0].shell,[26,22,15,14])&&eq(keys[0].key,[20,4,11,23]),"red seed");
 const hits=[];for(let step=0;step<keys.length;step++)for(const w of four)for(const sign of [1,-1]){const p=w.c.map((x,i)=>M(x-sign*keys[step].key[i]));for(const s of vocab)if(eq(p,s.p))hits.push({step,n:keys[step].n,page:w.page,start:w.start,sign,word:s.word,index:s.index,c:w.c,p})}
 const red16=hits.filter(h=>h.step===0&&h.page===16&&h.sign===1);check(red16.some(h=>h.start===99&&h.word==="SEEK"),"known alternative");
 const d=gp(donor.split("*** START OF")[1]?.split("*** END OF")[0]||donor),counts=Array.from({length:29},()=>Array(29).fill(.5));for(let i=1;i<d.length;i++)counts[d[i-1]][d[i]]++;const log=counts.map(row=>row.map(x=>Math.log(x/sum(row))));
 const native=solved.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>ri.has(x)).map(x=>ri.get(x))}));
 const target=corpus.pages[16].indices.slice(103),seek=source[30].p;check(eq(seek,[15,18,18,5]),"seek");
 function score(p,prev){let s=0;for(const x of p){s+=log[prev][x];prev=x}return s/p.length}
 let nativeScores=[];for(const s of native)for(let i=1;i+target.length<=s.p.length;i++)nativeScores.push(score(s.p.slice(i,i+target.length),s.p[i-1]));
 function encode(p,k,hold){let j=0;return p.map(x=>hold&&x===0?0:M(x+k[j++]))}
 function decode(c,k,hold,prev){let states=new Map([[`0,${prev}`,{j:0,last:prev,s:0,p:[]}]]);for(let i=0;i<c.length;i++){let next=new Map;for(const z of states.values()){const offer=(p,j)=>{const s=z.s+log[z.last][p],id=`${j},${p}`;if(!next.has(id)||next.get(id).s<s)next.set(id,{j,last:p,s,p:[...z.p,p]})};if(hold&&c[i]===0)offer(0,z.j);const p=M(c[i]-k[z.j]);if(!hold||p!==0)offer(p,z.j+1)}states=next;if(!states.size)return {failAt:i,score:null,p:null}}const best=[...states.values()].sort((a,b)=>b.s-a.s)[0];check(eq(encode(best.p,k,hold),c),"replay");return {failAt:null,score:best.s/c.length,p:best.p,finalStates:states.size}}
 const rows=[],controls=[];for(const [name,bank] of [["red-constant",[keys[0].key]],["source-spiral",keys.map(x=>x.key)]]){const ks=Array.from({length:target.length},(_,i)=>bank[Math.floor((i+4)/4)%bank.length][(i+4)%4]);for(const hold of [false,true]){const z=decode(target,ks,hold,seek[3]);rows.push({name,hold,...z,render:z.p?.slice(0,50).map(x=>corpus.translit[x]).join(" ")||null});for(const s of native.filter(x=>x.p.length>=target.length+1).slice(0,3)){const p=s.p.slice(1,target.length+1),ct=encode(p,ks,hold),q=decode(ct,ks,hold,s.p[0]);check(q.p&&q.score+1e-10>=score(p,s.p[0]),"control");controls.push({name,hold,source:s.name,n:p.length,correct:q.p.filter((x,i)=>x===p[i]).length,score:q.score,trueScore:score(p,s.p[0])})}}}
 return {numbers,keys,fourCount:four.length,p16FourCount:four.filter(w=>w.page===16).length,vocabCount:vocab.length,hits,trainRunes:d.length,suffixLength:target.length,nativeWindows:nativeScores.length,nativeFloor:Math.min(...nativeScores),rows,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/historical/cicada2016-4gq25-outguess.asc","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","results/lp2-p15-fibonacci-prime-spiral.md"];
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const v=paths.map(read);
console.log(JSON.stringify(experiment(JSON.parse(v[0]),v[1],v[2],JSON.parse(v[3]),v[4],v[5]),null,2));
