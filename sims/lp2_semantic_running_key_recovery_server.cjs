'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function study(data, indices=[0,1,2,3,4,5]){
const gp=JSON.parse(data[0]), native=JSON.parse(data[4]), B=29,M=30**5,mod=x=>(x+29)%29;
const alpha=[["ING",21],...gp.translit.map((t,i)=>[t,i])].sort((a,b)=>b[0].length-a[0].length);
function runeWord(w){w=w.toUpperCase().replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");const out=[];while(w){const a=alpha.find(x=>w.startsWith(x[0]));if(!a)return [];out.push(a[1]);w=w.slice(a[0].length)}return out}
function words(t){return (t.match(/[A-Za-z]+/g)||[]).map(runeWord).filter(w=>w.length)}
function trim(t,start){const s=t.indexOf(start),e=t.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);if(s<0||e<=s)throw Error("trim markers "+start+" "+s+" "+e);return t.slice(s,e)}
const text=[words(data[1]),words(trim(data[2],"There is no great and no small")),words(trim(data[3],"Almustafa,"))], splits=text.slice(0,2).map(x=>Math.floor(x.length*.65));
const runeMap=new Map(gp.runes.map((r,i)=>[r,i]));
function section(name){const s=native.sections.find(x=>x.name===name);if(!s)throw Error(name);let a=[],w=[];for(const c of s.source_text){if(runeMap.has(c))w.push(runeMap.get(c));else if(w.length){a.push(w);w=[]}}if(w.length)a.push(w);return a}
const powers=Array.from({length:6},(_,i)=>30**i), start=M-1, weights=[0,4,10,20,25,30];
function train(seqs){
 const tables=Array.from({length:6},()=>new Map());
 for(const ws of seqs){let c=start;for(const w of ws)for(const x of [...w,B]){for(let n=0;n<=5;n++){const k=c%powers[n];let row=tables[n].get(k);if(!row){row=new Float64Array(31);tables[n].set(k,row)}row[x]++;row[30]++}c=(c*30+x)%M}}
 const zero=tables[0].get(0);for(let x=0;x<30;x++)zero[x]=(zero[x]+.1)/(zero[30]+3);
 for(let n=1;n<=5;n++)for(const [k,row] of tables[n]){const prev=tables[n-1].get(k%powers[n-1]);if(!prev)throw Error("missing suffix");for(let x=0;x<30;x++)row[x]=(row[x]+weights[n]*prev[x])/(row[30]+weights[n])}
 return tables;
}
const g=train(text.slice(0,2).map((x,i)=>x.slice(0,splits[i]))),names=["0_welcome","0_warning","0_wisdom","jpg107-167","jpg229"],n=train(names.map(section));
function row(t,c,d){for(let i=d;i>=0;i--){const r=t[i].get(c%powers[i]);if(r)return r}throw Error("empty")}
function advance(c,x){return (c*30+x)%M}
function logp(c,x,mode,role){const p=row(g,c,mode?5:3)[x];return Math.log(mode&&role===0?.55*p+.45*row(n,c,5)[x]:p)}
function step(s,p,k,space,rem,mode){let pc=s.pc,kc=s.kc,score=s.score;
score+=logp(pc,p,mode,0);pc=advance(pc,p);if(rem===0){score+=logp(pc,B,mode,0);pc=advance(pc,B)}
if(space){score+=logp(kc,B,mode,1);kc=advance(kc,B)}
score+=logp(kc,k,mode,1);kc=advance(kc,k);
return {pc,kc,score,prev:s,p,k,space};}
function decode(C,L,mode,width=128){
const rem=L.flatMap(l=>Array.from({length:l},(_,i)=>l-i-1));
if(rem.length!==C.length)throw Error("shape");
const D=mode?M:30**3;
let beam=[{pc:start,kc:start,score:0,prev:null}];
for(let i=0;i<C.length;i++){
 const map=new Map();
 for(const st of beam){
  const pr=row(g,st.pc,mode?5:3),nr=mode?row(n,st.pc,5):null;
  const kr=row(g,st.kc,mode?5:3),kb=advance(st.kc,B),ks=row(g,kb,mode?5:3),kscore=Math.log(kr[B]);
  for(let p=0;p<29;p++){
   const k=mod(C[i]-p);let pc=advance(st.pc,p),ps=st.score+Math.log(mode?.55*pr[p]+.45*nr[p]:pr[p]);
   if(rem[i]===0){ps+=logp(pc,B,mode,0);pc=advance(pc,B)}
   for(let j=0;j<(i?2:1);j++){
    const kc=advance(j?kb:st.kc,k),score=ps+(j?kscore+Math.log(ks[k]):Math.log(kr[k])),id=(pc%D)*D+kc%D;
    const old=map.get(id);if(!old||score>old.score)map.set(id,{pc,kc,score,prev:st,p,k,space:!!j});
   }
  }
 }
 beam=[...map.values()].sort((a,b)=>b.score-a.score).slice(0,width);
}
let s=beam[0];const out={score:s.score,P:[],K:[],space:[]};while(s.prev){out.P.push(s.p);out.K.push(s.k);out.space.push(s.space);s=s.prev}for(const k of ["P","K","space"])out[k].reverse();return out;
}
function score(P,K,spaces,L,mode){let s={pc:start,kc:start,score:0};const rem=L.flatMap(l=>Array.from({length:l},(_,i)=>l-i-1));for(let i=0;i<P.length;i++)s=step(s,P[i],K[i],spaces[i],rem[i],mode);return s.score}
function take(ws,i,min){const a=[];let len=0;while(len<min){const w=ws[i++];if(!w)throw Error("source exhausted");a.push(w);len+=w.length}return a}
const loss=section("0_loss_of_divinity");
const plants=[
["LOSS-D",take(loss,109,96),take(text[0],splits[0]+4600,160)],
["LOSS-E",take(loss,145,96),take(text[1],splits[1]+4600,160)],
["GIBRAN-F",take(text[2],6000,96),take(text[0],splits[0]+5400,160)],
["GIBRAN-G",take(text[2],7000,96),take(text[1],splits[1]+5400,160)],
["GIBRAN-H",take(text[2],8000,96),take(text[0],splits[0]+6200,160)],
["GIBRAN-I",take(text[2],9000,96),take(text[1],splits[1]+6200,160)]
];
function render(pair,L){
 let pos=0;const p=L.map(n=>{const w=pair.P.slice(pos,pos+n);pos+=n;return w.map(x=>gp.translit[x]).join("").toLowerCase()});
 const k=[];let w="";for(let i=0;i<pair.K.length;i++){if(pair.space[i]&&w){k.push(w);w=""}w+=gp.translit[pair.K[i]].toLowerCase()}if(w)k.push(w);
 return {...pair,render:{P:p.join(" "),K:k.join(" ")}};
}
function check(pair,C,L){
 if(L.reduce((a,b)=>a+b,0)!==C.length||pair.P.length!==C.length||pair.K.length!==C.length||pair.space.length!==C.length||pair.space[0]||pair.P.some((p,i)=>(p+pair.K[i])%29!==C[i]))throw Error("replay or shape");
 return render(pair,L);
}
function control(idx){
 const [name,pw,kw]=plants[idx],P=pw.flat(),K=kw.flat().slice(0,P.length),L=pw.map(w=>w.length),space=Array(P.length).fill(false);let pos=0;
 for(const w of kw){if(pos>0&&pos<P.length)space[pos]=true;pos+=w.length}
 const C=P.map((p,i)=>(p+K[i])%29),truth=check({P,K,space},C,L);
 let seed=(0x2656c7a9+idx)>>>0;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const uniformC=P.map(p=>(p+rand()%29)%29);
 return {name,n:C.length,C,L,truth,uniformC};
}
function proposal(C,L,pair,lo,hi){
 check(pair,C,L);
 if(lo<0||hi>C.length||lo>=hi)throw Error("window");
 const rem=L.flatMap(l=>Array.from({length:l},(_,i)=>l-i-1));
 let st={pc:start,kc:start,score:0,prev:null};
 for(let i=0;i<lo;i++)st=step(st,pair.P[i],pair.K[i],pair.space[i],rem[i],1);
 let beam=[{pc:st.pc,kc:st.kc,score:0,prev:null}];
 const WIDTH=384;
 for(let i=lo;i<hi;i++){
  const map=new Map();
  for(const q of beam){
   const pr=row(g,q.pc,5),nr=row(n,q.pc,5),kr=row(g,q.kc,5),kb=advance(q.kc,B),ks=row(g,kb,5),kscore=Math.log(kr[B]);
   for(let p=0;p<29;p++){
    const k=mod(C[i]-p);let pc=advance(q.pc,p),ps=q.score+Math.log(.55*pr[p]+.45*nr[p]);
    if(rem[i]===0){ps+=logp(pc,B,1,0);pc=advance(pc,B)}
    for(let j=0;j<(i?2:1);j++){
     const kc=advance(j?kb:q.kc,k),score=ps+(j?kscore+Math.log(ks[k]):Math.log(kr[k])),id=pc*M+kc;
     const old=map.get(id);if(!old||score>old.score)map.set(id,{pc,kc,score,prev:q,p,k,space:!!j});
    }
   }
  }
  beam=[...map.values()].sort((a,b)=>b.score-a.score).slice(0,WIDTH);
 }
 const ranked=beam.map(q=>{let st=q;for(let i=hi;i<Math.min(C.length,hi+6);i++)st=step(st,pair.P[i],pair.K[i],pair.space[i],rem[i],1);return {q,rank:st.score}}).sort((a,b)=>b.rank-a.rank);
 function path(q){const P=[],K=[],space=[];while(q.prev){P.push(q.p);K.push(q.k);space.push(q.space);q=q.prev}P.reverse();K.reverse();space.reverse();return {P,K,space}}
 const selected=[],seen=new Set(),used=new Set();
 for(const [i,v] of ranked.entries()){
  if(i>=12)break;const p=path(v.q);selected.push(p);used.add(i);seen.add(p.P.slice(0,5).join(",")+"|"+p.space.slice(0,5).map(Number).join(""));
 }
 for(const [i,v] of ranked.entries()){
  if(selected.length>=24)break;if(used.has(i))continue;const p=path(v.q),id=p.P.slice(0,5).join(",")+"|"+p.space.slice(0,5).map(Number).join("");if(seen.has(id))continue;
  selected.push(p);seen.add(id);used.add(i);
 }
 return selected.map(p=>check({P:[...pair.P.slice(0,lo),...p.P,...pair.P.slice(hi)],K:[...pair.K.slice(0,lo),...p.K,...pair.K.slice(hi)],space:[...pair.space.slice(0,lo),...p.space,...pair.space.slice(hi)]},C,L));
}
const rl=require("node:readline").createInterface({input:process.stdin,crlfDelay:Infinity});
rl.on("line",line=>{try{const q=JSON.parse(line);let result;
 if(q.op==="control")result=control(q.idx);
 else if(q.op==="baseline")result=check(decode(q.C,q.L,1,128),q.C,q.L);
 else if(q.op==="proposal")result=proposal(q.C,q.L,q.pair,q.lo,q.hi);
 else throw Error("unknown op");
 console.log(JSON.stringify({result}));}catch(e){console.log(JSON.stringify({error:String(e.stack||e)}))}});
}
study(files.map(f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8")));
