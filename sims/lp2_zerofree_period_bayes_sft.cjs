'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
function study(gp,lp1,gold,raw,original=false){
 const assert=(x,m)=>{if(!x)throw Error(m)},ix=new Map(gp.runes.map((v,i)=>[v,i])),extract=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x)),mod=x=>(x+29)%29;
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){let w=m[0].toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);assert(a>=0&&b>a,"body");return s.slice(a,b)}
 const sources=[native(raw[0]),native(body(raw[1],"There is no great and no small")),native(body(raw[2],"Almustafa,"))];
 const train=gold.sections.filter(x=>!["0_welcome","jpg107-167","0_koan_1","0_loss_of_divinity"].includes(x.name)).flatMap(x=>extract(x.source_text));
 const counts=new Float64Array(29).fill(.5);for(const x of train)counts[x]++;
 const total=counts.reduce((a,b)=>a+b),p=Array.from(counts,x=>x/total);
 // For a nonzero ciphertext, condition on ordinary consuming output and C!=0.
 const logEmission=Array.from({length:29},(_,c)=>Array.from({length:29},(_,k)=>{
 const x=mod(c-k),den=1-p[0]-(k===0?0:p[mod(-k)]);return c!==0&&x!==0?Math.log(28*p[x]/den):-Infinity;
 }));
 function logmean(v){const m=Math.max(...v);if(m===-Infinity)return m;return m+Math.log(v.reduce((a,b)=>a+Math.exp(b-m),0)/v.length)}
 function spans(C){const a=[];let s=[];for(const c of C){if(c===0){if(s.length)a.push(s);s=[]}else s.push(c)}if(s.length)a.push(s);return a}
 function periodScores(C){
  const ss=spans(C),scores=[];
  for(let q=2;q<=24;q++){
   let score=0;for(const s of ss)for(let j=0;j<Math.min(q,s.length);j++){
    const likelihood=new Float64Array(29);
    for(let k=0;k<29;k++)for(let i=j;i<s.length;i+=q)likelihood[k]+=logEmission[s[i]][k];
    score+=logmean(likelihood);
   }
   scores.push({q,score});
  }
  return scores.sort((a,b)=>b.score-a.score||a.q-b.q);
 }
 const threshold=Math.log(23/.01),margin=Math.log(10);
 function select(C,truth){const scores=periodScores(C),gap=scores[0].score-scores[1].score,selected=scores[0].score>=threshold&&gap>=margin?scores[0].q:null;return{n:C.length,truth,selected,rank:truth===null?null:scores.findIndex(x=>x.q===truth)+1,top:scores.slice(0,5),gap,maxSpan:Math.max(...spans(C).map(x=>x.length))}}
 function encrypt(P,K){let j=0;return P.map(v=>v===0?0:mod(v+K[j++%K.length]))}
 const hist=[{name:"WELCOME",C:extract(lp1.split("%").slice(1,3).join("%")),P:extract(gold.sections.find(s=>s.name==="0_welcome").source_text),K:[23,10,1,10,9,10,16,26]},{name:"KOAN",C:extract(lp1.split("$")[5]),P:extract(gold.sections.find(s=>s.name==="jpg107-167").source_text),K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
 const authentic=hist.map(x=>{assert(encrypt(x.P,x.K).join()===x.C.join(),x.name);return{name:x.name,...select(x.C,x.K.length)}});
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 const periods=[3,5,7,9,11,12,15,17,19,21,23,24],lengths=[319,515,840],plants=[],nulls=[];
 for(let id=0;id<12;id++){
  const q=periods[id],n=lengths[id%3],s=sources[Math.floor(id/4)],qtr=id%4;
  const random=rng((0x2fa9b7c1^Math.imul(id+1,0x9e3779b9))>>>0);
  const lo=Math.floor(qtr*s.length/4)+n,hi=Math.floor((qtr+1)*s.length/4)-n,at=lo+Math.floor(random()*(hi-lo));assert(hi>lo,"donor");
  const P=s.slice(at,at+n);let K;do{K=Array.from({length:q},(_,j)=>j%3===1?10:Math.floor(random()*29))}while(Array.from({length:q-1},(_,j)=>j+1).some(k=>q%k===0&&K.every((x,i)=>x===K[i%k])));
  const pad=Array.from({length:n},()=>Math.floor(random()*29));
  plants.push({id,at,key:K,...select(encrypt(P,K),q)});nulls.push({id,...select(encrypt(P,pad),null)})
 }
 const gate={authentic:authentic.filter(x=>x.selected===x.truth).length,correct:plants.filter(x=>x.selected===x.truth).length,wrong:plants.filter(x=>x.selected!==null&&x.selected!==x.truth).length,falseSelections:nulls.filter(x=>x.selected!==null).length};
 gate.pass=gate.authentic===2&&gate.correct>=9&&gate.wrong===0&&gate.falseSelections<=1;
 let target=null;if(gate.pass&&original){const C=gp.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);assert(C.length===1680,"target length");target=select(C.slice(0,840),null)}
 return {method:{periods:[2,24],threshold,margin,trainRunes:train.length,likelihood:"conditional iid uniform nonzero baseline; independent uniform phase shift within each zero-free span",target:"p33–39 first840; last840 not accessed"},authentic,plants,nulls,gate,target}
}
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(study(JSON.parse(d[0]),d[1],JSON.parse(d[2]),d.slice(3),process.argv.includes('--original')),null,2));
