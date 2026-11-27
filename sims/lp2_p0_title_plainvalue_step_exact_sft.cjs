// Exact fixed p0-title keys with plaintext-value-dependent phase advance.
const fs=require('node:fs');
function experiment(corpus,trans,native,raw,fixture){
 const sym="0123456789abcdefghijklmnopqrs",runes=corpus.runes,prime=corpus.prime,names=corpus.translit,rm=new Map(runes.map((r,i)=>[r,sym[i]]));
 const title=corpus.pages[0].indices.slice(0,13);if(title.join(",")!=="15,8,18,3,6,19,27,0,15,26,18,21,5")throw Error("title");
 const cs=corpus.pages.slice(0,3).flatMap(x=>x.indices).slice(13).map(i=>sym[i]).join("");if(cs.length!==716)throw Error("cipher profile "+cs.length);
 let segment=trans.split("%").slice(0,3).join("").replace(/[\/\r\n\t ]/g,""),groups=[],w="";for(let x of segment){if(rm.has(x))w+=rm.get(x);else if(w){groups.push(w);w="";}}if(w)groups.push(w);groups=groups.slice(2);if(groups.join("")!==cs)throw Error("groups");
 const lex=new Set(fixture.added.split(" ")),nm=new Map(names.map((n,i)=>[n,sym[i]]));nm.set("ING","l");function spell(s,i,w){if(i===s.length){lex.add(w);return;}for(let n=1;n<=3&&i+n<=s.length;n++){let z=nm.get(s.slice(i,i+n));if(z!==undefined)spell(s,i+n,w+z);}}
 for(let l of raw.split("\n")){let m=l.match(/^([a-z]+)\s+(\d+)$/);if(m)spell(m[1].toUpperCase().replace(/QU/g,"CW").replace(/[VKQZ]/g,c=>({V:"U",K:"C",Q:"C",Z:"S"}[c])),0,"");}
 if(lex.size!==38938)throw Error("lex size");
 function parseWords(s){let g=[],w="";for(let x of s){if(rm.has(x))w+=rm.get(x);else if(w){g.push(w);w="";}}if(w)g.push(w);return g;}
 const records=native.sections.map(s=>({name:s.name,words:parseWords(s.source_text)}));
 const donor=records.find(r=>r.name==="0_welcome");if(!donor)throw Error("donor");
 const ctl=records.find(r=>r.name==="0_warning");if(!ctl)throw Error("control");
 const tri=new Map(),bi=new Map(),alpha=.3;
 for(let r of records.filter(x=>x!==donor&&x!==ctl)){let s="^^"+r.words.join("");for(let i=2;i<s.length;i++){let t=s.slice(i-2,i+1),b=t.slice(0,2);tri.set(t,(tri.get(t)||0)+1);bi.set(b,(bi.get(b)||0)+1);}}
 function score(last,p){return Math.log(((tri.get(last+p)||0)+alpha)/((bi.get(last)||0)+29*alpha));}
 const mod=(n,m)=>((n%m)+m)%m;
 function transitions(c,j,key,offset){let x=sym.indexOf(c),v=[];if(x===0)v.push({p:"0",j});let p=mod(x-key[j],29);if(p!==0)v.push({p:sym[p],j:mod(j+prime[p]-offset,13)});return v;}
 function encrypt(p,key,off,j){let s="";for(let c of p){let x=sym.indexOf(c);if(x===0){s+="0";continue;}s+=sym[mod(x+key[j],29)];j=mod(j+prime[x]-off,13);}return s;}
 function exact(c,key,off,starts){let d=new Map(starts.map(j=>[j,1n]));for(let i=0;i<c.length;i++){let n=new Map();for(let [j,count] of d)for(let z of transitions(c[i],j,key,off))n.set(z.j,(n.get(z.j)||0n)+count);if(n.size===0)return {firstImpossible:i,paths:"0"};d=n;}return {firstImpossible:null,paths:[...d.values()].reduce((a,b)=>a+b,0n).toString()};}
 function best(c,key,off,starts){let d=new Map(starts.map(j=>[j+":^^",{j,last:"^^",score:0,p:"",start:j}]));for(let i=0;i<c.length;i++){let n=new Map();for(let st of d.values())for(let z of transitions(c[i],st.j,key,off)){let last=st.last[1]+z.p,sc=st.score+score(st.last,z.p),id=z.j+":"+last;let prior=n.get(id);if(!prior||sc>prior.score)n.set(id,{j:z.j,last,score:sc,p:st.p+z.p,start:st.start});}if(!n.size)return null;d=n;}let r=[...d.values()].sort((a,b)=>b.score-a.score)[0];return {scorePerRune:r.score/c.length,start:r.start,plaintext:r.p,latin:[...r.p].map(c=>names[sym.indexOf(c)]).join(""),replay:encrypt(r.p,key,off,r.start)===c};}
 function words(c,key,off){let all=new Set();function rec(i,j,w){if(i===c.length){all.add(w);return;}for(let z of transitions(c[i],j,key,off))rec(i+1,z.j,w+z.p);}for(let j=0;j<13;j++)rec(0,j,"");return [...all];}
 const starts=Array.from({length:13},(_,i)=>i),out=[],p0=249;
 for(let weight of ["ordinal","prime","totient"])for(let sign of [1,-1])for(let off of [0,1]){
  const key=title.map(x=>mod(sign*(weight==="ordinal"?x:prime[x]-(weight==="totient"?1:0)),29));
  const result={weight,sign,advance:off?"totient":"prime",key,phase0:exact(cs,key,off,[0]),allPhases:exact(cs,key,off,starts),p0AllPhases:exact(cs.slice(0,p0),key,off,starts)};
  if(result.allPhases.firstImpossible===null)result.best=best(cs,key,off,starts);
  let g=groups.map(w=>words(w,key,off).filter(x=>lex.has(x))),long=groups.map((w,i)=>w.length>=8?i:-1).filter(i=>i>=0);
  result.wordIndependent={groups:groups.length,lexical:g.filter(x=>x.length).length,long:long.length,longLexical:long.filter(i=>g[i].length).length,longCandidates:long.map(i=>({i,cipher:groups[i],words:g[i]}))};
  const controls=[];
  for(let r of [ctl,donor]){
   let p=r.words.join(""),start=3,c=encrypt(p,key,off,start),d=exact(c,key,off,[start]),b=best(c,key,off,[start]);let j=start,truthOK=true;for(let i=0;i<c.length;i++){let choices=transitions(c[i],j,key,off),z=choices.find(x=>x.p===p[i]);if(!z){truthOK=false;break;}j=z.j;}
   let cc=r.words.map((w,i)=>encrypt(w,key,off,i%13));controls.push({name:r.name,n:p.length,truthRetained:truthOK,completePaths:d.paths,bestAccuracy:b?[...p].filter((x,i)=>x===b.plaintext[i]).length/p.length:0,bestReplay:b?.replay,wordTruth:r.words.filter((w,i)=>words(cc[i],key,off).includes(w)).length,wordCount:r.words.length,lexicalControl:cc.filter(w=>words(w,key,off).some(x=>lex.has(x))).length});
  }
  result.controls=controls;out.push(result);
 }
 return {schema:"lp2-p0-fixed-title-plainvalue-step-20261127",title,profile:{runes:cs.length,groups:groups.length,p0:p0,long:groups.filter(w=>w.length>=8).length,lexicon:lex.size},controlPass:out.every(x=>x.controls.every(y=>y.truthRetained&&y.bestReplay&&y.wordTruth===y.wordCount)),cases:out};
}
const read=p=>fs.readFileSync(p,'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json"))),null,2));
