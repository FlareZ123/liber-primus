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
const koan=section("0_koan_1");const plants=[
["KOAN1-A",take(koan,5,96),take(text[0],splits[0]+100,160)],
["KOAN1-B",take(koan,90,96),take(text[1],splits[1]+100,160)],
["p56",section("p56_an_end"),take(text[2],500,160)],
["p57",section("p57_parable"),take(text[2],900,160)],
["Gibran-A",take(text[2],1500,96),take(text[0],splits[0]+800,160)],
["Gibran-B",take(text[2],2000,96),take(text[1],splits[1]+800,160)]
];
const match=(a,b)=>a.reduce((v,x,i)=>v+Number(x===b[i]),0);
let results=[];
for(const idx of indices){
 const [name,pw,kw]=plants[idx],P=pw.flat(),K=kw.flat().slice(0,P.length),L=pw.map(w=>w.length),space=Array(P.length).fill(false);let pos=0;for(const w of kw){if(pos>0&&pos<P.length)space[pos]=true;pos+=w.length}
 if(K.length!==P.length)throw Error("key length");
 const C=P.map((p,i)=>(p+K[i])%29),a=decode(C,L,0),b=decode(C,L,1);
 for(const v of [a,b])if(v.P.some((x,i)=>(x+v.K[i])%29!==C[i]))throw Error("replay");
 if(Math.abs(score(a.P,a.K,a.space,L,0)-a.score)>1e-8||Math.abs(score(b.P,b.K,b.space,L,1)-b.score)>1e-8)throw Error("scoring mismatch");
 let seed=(0x2598ad45+idx)>>>0;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const pad=P.map(()=>rand()%29),negative=decode(P.map((p,i)=>(p+pad[i])%29),L,1);
 results.push({idx,name,n:P.length,baselineCorrect:match(P,a.P),newCorrect:match(P,b.P),baselineTruthGap:score(P,K,space,L,0)-a.score,newTruthGapVsBaseline:score(P,K,space,L,1)-score(a.P,a.K,a.space,L,1),newTruthGapVsNew:score(P,K,space,L,1)-b.score,truthNormalized:score(P,K,space,L,1)/P.length,uniformNormalized:negative.score/P.length,negativeCorrect:match(P,negative.P)});
}
const total=results.reduce((a,r)=>a+r.n,0),old=results.reduce((a,r)=>a+r.baselineCorrect,0),neu=results.reduce((a,r)=>a+r.newCorrect,0),min=Math.min(...results.map(r=>r.truthNormalized));
const gate={truthOutranks:results.filter(r=>r.newTruthGapVsBaseline>0).length,exact:results.filter(r=>r.newCorrect===r.n).length,improvement:(neu-old)/total,falsePos:results.filter(r=>r.uniformNormalized>=min).length};
gate.pass=results.length===6&&gate.truthOutranks>=5&&gate.exact>=2&&gate.improvement>=.1&&gate.falsePos===0;
return {nativeTraining:names,genericTrainingWords:splits,holdoutGibranWords:text[2].length,results,total,old,neu,gate}
}
console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8')),process.argv.length>2?process.argv.slice(2).map(Number):undefined),null,2));
