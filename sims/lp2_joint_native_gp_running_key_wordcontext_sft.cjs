'use strict';
// Joint native-GP running-key word-context beam and true-path score diagnostic.
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/english_wordfreq_textblob.txt"];
function study(data){
 const corpus=JSON.parse(data[0]),B=29,S=27000,mod=x=>(x+29)%29;
 const alpha=[["ING",21],...corpus.translit.map((t,i)=>[t,i])].sort((a,b)=>b[0].length-a[0].length);
 const gp=w=>{w=w.toUpperCase().replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");const a=[];while(w){let m=alpha.find(x=>w.startsWith(x[0]));if(!m)return [];a.push(m[1]);w=w.slice(m[0].length)}return a};
 const words=t=>(t.match(/[A-Za-z]+/g)||[]).map(gp).filter(w=>w.length);
 const texts=data.slice(1,4).map(words),splits=texts.map(t=>Math.floor(t.length*.7));
 const counts=[new Float64Array(30),new Float64Array(900),new Float64Array(27000),new Float64Array(810000)];
 const totals=[0,new Float64Array(30),new Float64Array(900),new Float64Array(27000)];
 const trie=[{child:[],mask:0,terminal:false,freq:0,contexts:0}];let lexWords=0,totalFreq=0;
 function insert(w,f){if(!w.length||w.length>30)return -1;let id=0;for(let i=0;i<w.length;i++){trie[id].mask|=1<<(w.length-i);let j=trie[id].child[w[i]];if(j===undefined){j=trie.length;trie[id].child[w[i]]=j;trie.push({child:[],mask:0,terminal:false,freq:0,contexts:0})}id=j}if(!trie[id].terminal)lexWords++;trie[id].terminal=true;trie[id].mask|=1;trie[id].freq+=f;totalFreq+=f;return id}
 // Generic inflections, generated uniformly without adding control words by hand.
 for(const line of data[5].split("\n")){const m=line.match(/^([a-z]+)\s+(\d+)$/);if(!m)continue;const w=m[1],f=Number(m[2]);insert(gp(w),f);if(w.length>=4&&f>=2){const variants=[w+"s",w+"ed",w+"ing"];if(/[^aeiou]y$/.test(w))variants.push(w.slice(0,-1)+"ies",w.slice(0,-1)+"ied");if(/(s|x|z|ch|sh)$/.test(w))variants.push(w+"es");if(w.endsWith("e"))variants.push(w+"d",w.slice(0,-1)+"ing");for(const v of variants)insert(gp(v),.2)}}
 const pairs=new Map(),mult=1048576;
 function train(t){let c=26999,prev=-1;for(const w of t){const id=insert(w,1);if(prev>=0&&id>=0){const key=prev*mult+id;pairs.set(key,(pairs.get(key)||0)+1);trie[prev].contexts++}prev=id;for(const x of [...w,B]){counts[0][x]++;totals[0]++;const contexts=[0,c%30,c%900,c];for(let n=1;n<=3;n++){counts[n][contexts[n]*30+x]++;totals[n][contexts[n]]++}c=(c%900)*30+x}}}
 texts.forEach((t,i)=>train(t.slice(0,splits[i])));
 if(trie.length>=mult)throw Error("word pair key overflow");
 const p1=Float64Array.from(counts[0],v=>(v+.1)/(totals[0]+3));
 const p2=new Float64Array(900),p3=new Float64Array(27000),logs=new Float64Array(810000);
 for(let c=0;c<30;c++)for(let x=0;x<30;x++)p2[c*30+x]=(counts[1][c*30+x]+4*p1[x])/(totals[1][c]+4);
 for(let c=0;c<900;c++)for(let x=0;x<30;x++)p3[c*30+x]=(counts[2][c*30+x]+10*p2[(c%30)*30+x])/(totals[2][c]+10);
 for(let c=0;c<S;c++)for(let x=0;x<30;x++)logs[c*30+x]=Math.log((counts[3][c*30+x]+20*p3[(c%900)*30+x])/(totals[3][c]+20));
 const next=(c,x)=>(c%900)*30+x;
 const follow=(id,x,rem)=>{if(id<0)return -1;const j=trie[id].child[x];return j!==undefined&&(rem<0||(rem<=30&&(trie[j].mask&(1<<rem))))?j:-1};
 const oov=3.0,ongoing=.12;
 const penalty=(a,b)=>b>=0?0:a>=0?-oov:-ongoing;
 const term=id=>id>=0&&trie[id].terminal?id:-1;
 const bonus=(prev,id)=>{if(prev<0||id<0)return 0;const n=trie[prev].contexts;if(!n)return 0;const w=Math.min(.75,n/(n+25)),q=(trie[id].freq+.1)/(totalFreq+.1*lexWords);return .65*Math.log(1-w+w*(pairs.get(prev*mult+id)||0)/(n*q))};
 const init=()=>({pc:26999,kc:26999,pn:0,kn:0,pp:-1,kp:-1,score:0,prev:null});
 function step(st,p,k,space,rem){
  let pc=next(st.pc,p),pn=follow(st.pn,p,rem),pp=st.pp,ps=st.score+logs[st.pc*30+p]+penalty(st.pn,pn);
  if(rem===0){ps+=logs[pc*30+B]+bonus(pp,term(pn));pp=term(pn);pc=next(pc,B);pn=0}
  let kc=st.kc,kn=st.kn,kp=st.kp;
  if(space){const id=term(kn);ps+=logs[kc*30+B]+(kn>=0&&id<0?-oov:0)+bonus(kp,id);kp=id;kc=next(kc,B);kn=0}
  const nn=follow(kn,k,-1);ps+=logs[kc*30+k]+penalty(kn,nn);
  return {pc,kc:next(kc,k),pn,kn:nn,pp,kp,score:ps,prev:st,p,k,space};
 }
 function decode(C,lengths,width,P,K,kSpaces){
  const remain=new Uint8Array(C.length);let t=0;for(const l of lengths)for(let j=l-1;j>=0;j--)remain[t++]=j;if(t!==C.length)throw Error("shape");
  let beam=[init()],oracle=init(),splitBest=null,firstPruned=-1;
  const cut=lengths.reduce((n,l)=>n+l<=C.length*.7?n+l:n,0);
  const key=st=>st.pc+","+st.kc+","+st.pn+","+st.kn+","+st.pp+","+st.kp;
  for(let i=0;i<C.length;i++){
   const candidates=new Map(),rem=remain[i];
   function offer(st){const id=key(st),old=candidates.get(id);if(!old||st.score>old.score)candidates.set(id,st)}
   for(const st of beam)for(let p=0;p<29;p++){const k=mod(C[i]-p);offer(step(st,p,k,false,rem));if(i>0)offer(step(st,p,k,true,rem))}
   beam=Array.from(candidates.values()).sort((a,b)=>b.score-a.score).slice(0,width);
   if(P){oracle=step(oracle,P[i],K[i],kSpaces.has(i),rem);if(firstPruned<0&&!beam.some(st=>key(st)===key(oracle)&&Math.abs(st.score-oracle.score)<1e-8))firstPruned=i}
   if(i+1===cut)splitBest=beam[0];
  }
  function unwind(st){let P=[],K=[],spaces=[];while(st.prev){P.push(st.p);K.push(st.k);spaces.push(st.space);st=st.prev}return {P:P.reverse(),K:K.reverse(),spaces:spaces.reverse()}}
  return {...unwind(beam[0]),score:beam[0].score,second:beam[1]?.score,split:splitBest?unwind(splitBest):null,cut,oracleScore:P?oracle.score:null,firstPruned};
 }
 const take=(w,start,min)=>{let a=[],n=0;for(let i=start;n<min&&i<w.length;i++){a.push(w[i]);n+=w[i].length}if(n<min)throw Error("short source");return a};
 const p57=words("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE");
 if(p57.flat().some((x,i)=>x!==corpus.pages[57].indices[i])||p57.flat().length!==95)throw Error("p57");
 const p56=words("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
 if(p56.flat().length!==85)throw Error("p56");
 const lp1start=data[4].indexOf("THE LOSS OF DIVINITY"),lp1=words(data[4].slice(lp1start,data[4].indexOf("### 11",lp1start)));
 const koanStart=data[4].indexOf("DURING A LESSON"),koan=words(data[4].slice(koanStart,data[4].indexOf("### 15",koanStart)));
 const plants=[
  {name:"development p57 / Gibran",P:p57,K:take(texts[0],splits[0]+117,95)},
  {name:"development LP1 / Shakespeare",P:take(lp1,0,141),K:take(texts[1],splits[1]+317,180)},
  {name:"development Gibran / Emerson",P:take(texts[0],splits[0]+527,141),K:take(texts[2],splits[2]+829,180)},
  {name:"fresh authentic p56 / Emerson",P:p56,K:take(texts[2],splits[2]+2027,85)},
  {name:"fresh LP1 koan / Shakespeare",P:take(koan,0,141),K:take(texts[1],splits[1]+1729,180)},
  {name:"fresh Emerson / Gibran",P:take(texts[2],splits[2]+4171,141),K:take(texts[0],splits[0]+2013,180)}
 ];
 const render=(a,lens)=>{let t=0;return lens.map(n=>{let w=a.slice(t,t+n).map(x=>corpus.translit[x]).join("");t+=n;return w}).join(" ")};
 const renderKey=(a,space)=>a.map((x,i)=>(space[i]?" ":"")+corpus.translit[x]).join("");
 const match=(a,b)=>a.reduce((n,v,i)=>n+Number(v===b[i]),0);
 let seed=0x33012459;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const out=[];
 for(const plant of plants){
  const P=plant.P.flat(),K=plant.K.flat().slice(0,P.length),L=plant.P.map(w=>w.length),spaces=new Set();let pos=0;for(const w of plant.K){if(pos>0&&pos<P.length)spaces.add(pos);pos+=w.length}
  if(K.length!==P.length)throw Error("length");
  const C=P.map((p,i)=>(p+K[i])%29),d=decode(C,L,512,P,K,spaces);
  if(d.P.some((p,i)=>(p+d.K[i])%29!==C[i]))throw Error("replay");
  out.push({plant:plant.name,n:P.length,width:512,correct:match(d.P,P),keyCorrect:match(d.K,K),prefixCorrect:match(d.split.P,P),prefixN:d.cut,score:d.score/P.length,oracle:d.oracleScore/P.length,oracleGap:d.oracleScore-d.score,firstPruned:d.firstPruned,P:render(d.P,L),K:renderKey(d.K,d.spaces)});
  if(plant.name.startsWith("fresh")){const pad=P.map(()=>rand()%29),C0=P.map((p,i)=>(p+pad[i])%29),d0=decode(C0,L,512);out.push({plant:plant.name+" / uniform key negative",n:P.length,correct:match(d0.P,P),score:d0.score/P.length,P:render(d0.P,L),K:renderKey(d0.K,d0.spaces)})}
 }
 return {trainWords:splits,trainTokens:totals[0],lexWords,trieNodes:trie.length,wordBigrams:pairs.size,oovPenalty:oov,results:out}
}
console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'))),null,2));
