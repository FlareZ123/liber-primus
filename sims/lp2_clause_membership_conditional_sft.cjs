"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
function run(raw){
 const gp=JSON.parse(raw[1]),runes=new Set(gp.runes),labels=["ING","IO",...gp.translit].sort((a,b)=>b.length-a.length),bounds=[0,3,8,15,23,27,33,40,54,56];
 const originalText=raw[0].split("%").slice(0,55).join("%"),groups=[];
 let page=0,start=0,len=0,runeCount=0;
 function finish(p=""){if(len){groups.push({len,page:start,stop:p==="."});len=0}}
 for(const c of originalText){if(runes.has(c)){if(!len)start=page;len++;runeCount++}else if(c==="%")page++;else if("-.$&§0123456789".includes(c))finish(c)}
 finish();if(runeCount!==12956||groups.length!==2896||groups.filter(x=>x.stop).length!==173)throw Error("source parity");
 const original=Array.from({length:9},()=>[]);
 for(let ch=0;ch<9;ch++){let open=false,cl=[];for(const g of groups.filter(x=>{const p=x.page>=50?x.page+1:x.page;return p>=bounds[ch]&&p<bounds[ch+1]})){if(open)cl.push(g.len);if(g.stop){if(open&&cl.length)original[ch].push(cl);open=true;cl=[]}}}
 const counts=original.map(x=>x.length),N=counts.reduce((s,x)=>s+x,0),sum=a=>a.reduce((s,x)=>s+x,0);
 function gpLength(w){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let n=0;while(w){const t=labels.find(x=>w.startsWith(x));if(!t)throw Error(w);w=w.slice(t.length);n++}return n}
 function english(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().split(/[.!?]+/).slice(1,-1).map(s=>(s.match(/[A-Z]+/g)||[]).map(gpLength)).filter(x=>x.length)}
 const donors=raw.slice(3).map(english),names=["Gibran","Shakespeare","Emerson"];
 const exact=JSON.parse(raw[2]).sections.map(s=>s.source_text.split("⁘").slice(1,-1).map(x=>(x.match(/\p{Script=Runic}+/gu)||[]).map(w=>w.length)).filter(x=>x.length)).filter(x=>x.length);
 const categories=[l=>l===1,l=>l<=2,l=>l>=3&&l<=4,l=>l>=7];
 const catNames=["singleton","short <=2","medium 3–4","long >=7"];
 let seed=0x27293301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296}
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function prepare(ch){
  const all=ch.flat(),m=Math.max(...all),maxn=Math.max(...ch.map(x=>x.length)),p=new Float64Array(m+1);
  for(let l of all)p[l]++;for(let l=1;l<=m;l++)p[l]/=all.length;const support=Array.from({length:m},(_,i)=>i+1).filter(l=>p[l]>0);
  const Z=[Float64Array.of(1)];
  for(let n=1;n<=maxn;n++){const old=Z[n-1],z=new Float64Array(n*m+1);for(let l of support)for(let r=0;r<old.length;r++)if(old[r])z[r+l]+=old[r]*p[l];Z.push(z)}
  const q=categories.map(cat=>support.filter(cat)),q2=q.map(a=>{const h=new Float64Array(2*m+1);for(let l of a)for(let k of a)h[l+k]+=p[l]*p[k];return [...h].flatMap((x,i)=>x?[[i,x]]:[])});
  const cache=new Map(),get=(n,r)=>n>=0&&r>=0&&r<Z[n].length?Z[n][r]:0;
  function moments(n,r){const key=n*(maxn*m+1)+r;if(cache.has(key))return cache.get(key);const den=get(n,r);if(!(den>0))throw Error("zero conditional probability "+n+","+r);const out=q.map((a,j)=>{let mean=n*a.reduce((s,l)=>s+p[l]*get(n-1,r-l),0)/den;let fact=n>=2?n*(n-1)*q2[j].reduce((s,[l,w])=>s+w*get(n-2,r-l),0)/den:0;return [mean,Math.max(0,mean+fact-mean*mean)]});cache.set(key,out);return out}
  function draw(n,r){const a=[];while(n){let total=get(n,r),u=rng()*total,chosen=0,last=0;for(let l of support){const w=p[l]*get(n-1,r-l);if(w>0){last=l;u-=w;if(u<=0){chosen=l;break}}}if(!chosen)chosen=last;if(!chosen)throw Error("conditional draw dead");a.push(chosen);r-=chosen;n--}if(r)throw Error("conditional sum");return a}
  function permute(){const a=shuffle(all);let j=0;return ch.map(x=>{const b=a.slice(j,j+x.length);j+=x.length;return b})}
  return {ch,all,moments,draw,permute}
 }
 function setup(panel){return panel.filter(ch=>ch.length).map(prepare)}
 function features(prep,mode){const acc=new Float64Array(8),ct=new Float64Array(4);let words=0,clauses=0,runes=0;for(const c of prep){const data=mode==="shuffle"?c.permute():mode==="decoy"?c.ch.map(x=>c.draw(x.length,sum(x))):mode==="within"?c.ch.map(shuffle):c.ch;for(const a of data){const n=a.length,r=sum(a),ms=c.moments(n,r);words+=n;clauses++;runes+=r;for(let j=0;j<4;j++){const [mean,v]=ms[j];if(v<1e-8)continue;const z=Math.max(-5,Math.min(5,(a.filter(categories[j]).length-mean)/Math.sqrt(v)));acc[j]+=z;acc[j+4]+=z*z;ct[j]++}}}return {v:Array.from(acc,(x,i)=>ct[i%4]?x/ct[i%4]:0),words,clauses,runes}}
 function panel(a,start){let j=start;return counts.map(n=>{const x=a.slice(j,j+n);j+=n;return x})}
 const training=[],heldout=[],trainingRows=[],nativeRows=[],nullRows=[];
 for(let d=0;d<donors.length;d++){const a=donors[d],cut=Math.floor(a.length*.65);for(let i=0;i+N<=cut&&training.filter(x=>x.d===d).length<3;i+=N)training.push({d,i,panel:panel(a,i)});for(let i=cut;i+N<=a.length&&heldout.filter(x=>x.d===d).length<4;i+=N)heldout.push({d,i,panel:panel(a,i)})}
 if(training.length<4||heldout.length<4)throw Error("insufficient distinct donor panels "+training.length+"/"+heldout.length);
 for(const t of training){const p=setup(t.panel),native=features(p,"native"),within=features(p,"within");if(native.v.some((x,i)=>Math.abs(x-within.v[i])>1e-10))throw Error("order invariance");nativeRows.push(native.v);for(let k=0;k<8;k++){nullRows.push(features(p,"shuffle").v,features(p,"decoy").v)}trainingRows.push({source:names[t.d],start:t.i,words:native.words,runes:native.runes,clauses:native.clauses})}
 const mean=(a,i)=>a.reduce((s,x)=>s+x[i],0)/a.length,mu=Array.from({length:8},(_,i)=>mean(nativeRows,i)),nu=Array.from({length:8},(_,i)=>mean(nullRows,i));
 const weight=mu.map((x,i)=>{const v=nullRows.reduce((s,a)=>s+(a[i]-nu[i])**2,0)/nullRows.length;return(x-nu[i])/(v+.02)});const norm=Math.sqrt(sum(weight.map(x=>x*x)));for(let i=0;i<weight.length;i++)weight[i]/=norm;
 const score=x=>sum(x.v.map((v,i)=>v*weight[i]));
 function evaluate(panel,T=99){const p=setup(panel),f=features(p,"native"),g=features(p,"within"),obs=score(f);if(Math.abs(obs-score(g))>1e-10)throw Error("within clause not invariant");const shuffled=[],decoy=[];for(let k=0;k<T;k++){shuffled.push(score(features(p,"shuffle")));decoy.push(score(features(p,"decoy")))}const pvalue=(a,s)=>(1+a.filter(x=>x>=s-1e-12).length)/(a.length+1),ps=pvalue(shuffled,obs),pd=pvalue(decoy,obs);const s1=score(features(p,"shuffle")),s2=score(features(p,"decoy"));return {observed:obs,pShuffle:ps,pDecoy:pd,pass:ps<=.05&&pd<=.05,words:f.words,runes:f.runes,clauses:f.clauses,features:f.v,shuffleMean:sum(shuffled)/T,decoyMean:sum(decoy)/T,wrongShufflePass:pvalue(shuffled,s1)<=.05&&pvalue(decoy,s1)<=.05,wrongDecoyPass:pvalue(shuffled,s2)<=.05&&pvalue(decoy,s2)<=.05}}
 const controls=heldout.map(t=>({source:names[t.d],start:t.i,...evaluate(t.panel)})),passed=controls.filter(x=>x.pass).length,fp=controls.filter(x=>x.wrongShufflePass).length+controls.filter(x=>x.wrongDecoyPass).length;
 const powered=passed>=Math.ceil(.8*controls.length)&&fp<=Math.floor(.1*2*controls.length);
 const nativeCheck=evaluate(exact);
 const originalResult=evaluate(original,199);
 return {source:{runeCount,groups:groups.length,periods:173,completeClauses:N,chapters:counts},categories:catNames,features:"mean signed standardized conditional count residual and mean squared residual for each category, clipped +/-5; moments exact iid chapter inventory conditioned on clause group count and rune sum",weights:weight,trainingMeans:mu,nullTrainingMeans:nu,training:trainingRows,controls,power:{passed,total:controls.length,falsePositive:fp,nullControls:2*controls.length,requiredFraction:.8,maximumFalsePositive:.1,powered},nativeCheck,original:originalResult,gate:"80% held-out panels pass both nulls p<=.05 with <=10% false positives. Original only inferential if powered. Complete clauses between two printed full stops within same chapter; no heading/tail fragments.",notes:"Chapter shuffle preserves inventory and per-clause group count but may alter per-clause rune sum; every scored residual conditions on realized sum. Conditional iid decoy preserves each clause's group count and total exactly, not chapter multiset. Both use empirical chapter length probabilities. Literary panels are nonoverlapping across train/heldout, not matched exactly to original clause length distribution."}
}
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(run(paths.map(read)),null,2));
