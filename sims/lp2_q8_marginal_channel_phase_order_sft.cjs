"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,raw,g,s,e,control1,control2,original){
 const N=29,F=0,mod=x=>(x+N)%N,alphabet=corpus.translit;
 const idx=new Map(corpus.runes.map((v,i)=>[v,i])),words=[];let cur=[];
 const flush=()=>{if(cur.length){words.push(cur);cur=[]}};
 for(const c of raw.split("%").slice(0,55).join("%")){if(idx.has(c))cur.push(idx.get(c));else if(c!=="/"&&c!=="%"&&!/\s/u.test(c))flush()}flush();
 if(words.length!==2896||words.reduce((n,w)=>n+w.length,0)!==12956)throw Error("source grouping");
 const profile=Array(40).fill(0);for(const w of words)profile[w.length]++;
 function pool(text){
 let by=Array.from({length:40},()=>[]);
 for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
 w=w.replaceAll("QU","CW").replaceAll("Q","C").replaceAll("K","C").replaceAll("V","U").replaceAll("Z","S");let a=[];
 while(w.length){const t=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t))||w[0];const q=alphabet.indexOf(t==="ING"?"NG":t==="IO"?"IA":t);if(q>=0)a.push(q);w=w.slice(t.length)}
 if(a.length&&a.length<40)by[a.length].push(a);
 }return by}
 const native=pool(s),train=pool(g+"\n"+e);
 const dict=train.map(row=>{const m=new Map;for(let p of row){let k=p.join(",");let x=m.get(k);if(x)x.n++;else m.set(k,{p,n:1})}return [...m.values()].map(x=>({...x,prob:x.n/row.length}))});
 function plant(result){
 let st=result.seed;const rng=()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return st>>>0};
 let ord=Array.from({length:N},(_,i)=>i);for(let i=N-1;i>1;i--){let j=1+rng()%i;[ord[i],ord[j]]=[ord[j],ord[i]]}
 let key=[];while(key.length<8){const d=rng()%29;if(!key.includes(d))key.push(d)}
 if(ord.join(",")!==result.ord.join(",")||key.join(",")!==result.key.join(","))throw Error("plant mismatch");
 const pi=[];ord.forEach((v,i)=>pi[v]=i);
 let obs=[],plain=[];
 for(let l=1;l<40;l++)if(profile[l]&&native[l].length&&train[l].length)for(let j=0;j<profile[l];j++){let w=native[l][rng()%native[l].length],phase=rng()%8;plain.push(w);obs.push(w.map(p=>{if(p===F)return F;const c=ord[mod(pi[p]+key[phase])];phase=(phase+1)%8;return c}))}
 return {obs,plain,ord,key};
 }
 function orderSolve(obs,candidate,truth){
 const ord=candidate.bestOrd,shifts=candidate.bestShift.slice().sort((a,b)=>a-b),pi=[];ord.forEach((v,i)=>pi[v]=i);const ids=new Map(shifts.map((x,i)=>[x,i]));
 const permutations=[];function gen(a,rem){if(!rem.length){permutations.push(a);return}for(let x of rem)gen([...a,x],rem.filter(y=>y!==x))}gen([0],[1,2,3,4,5,6,7]);
 if(permutations.length!==5040)throw Error("permutation count");
 const index=new Map;
 for(let j=0;j<permutations.length;j++){let p=permutations[j];for(let phase=0;phase<8;phase++){let code=1;for(let t=0;t<8;t++){code=code*8+p[(phase+t)%8];let row=index.get(code);if(!row){row=[];index.set(code,row)}row.push(j)}}}
 const logScore=new Float64Array(5040),matchCounts=new Uint32Array(5040),cache=new Map;
 function compatible(c,p){
 let seq=[];for(let i=0;i<c.length;i++){if(p[i]===F){if(c[i]!==F)return null;continue}let d=ids.get(mod(pi[c[i]]-pi[p[i]]));if(d===undefined)return null;seq.push(d)}
 for(let i=0;i<seq.length;i++)if(i>=8?seq[i]!==seq[i%8]:seq.slice(0,i).includes(seq[i]))return null;
 let code=1;for(let j=0;j<Math.min(8,seq.length);j++)code=8*code+seq[j];return code;
 }
 for(let c of obs){let ck=c.join(","),row=cache.get(ck);if(!row){let list=[];for(const p of dict[c.length]){let code=compatible(c,p.p);if(code!==null)list.push({code,p:p.p,prob:p.prob})}row=list;cache.set(ck,row)}
 let sum=new Float64Array(5040),all=0;for(const x of row){if(x.code===1){all+=x.prob;continue}for(const j of index.get(x.code)||[])sum[j]+=x.prob/8}
 const floor=0.1*Math.pow(29,-c.length);for(let j=0;j<5040;j++){let v=sum[j]+all;logScore[j]+=Math.log(floor+0.9*v);if(v>0)matchCounts[j]++}
 }
 let rank=Array.from({length:5040},(_,i)=>i).sort((a,b)=>logScore[b]-logScore[a]);let winner=rank[0],order=permutations[winner].map(i=>shifts[i]);
 const canonical=k=>{let i=k.indexOf(Math.min(...k));return k.slice(i).concat(k.slice(0,i)).join(",")};
 let trueOrderRank=null,exactPlainWords=null,exactPlainRunes=null,totalTruthRunes=null;if(truth){let factor=truth.ord.indexOf(ord[1]);let trueOrder=truth.key.map(d=>{for(let x=0;x<N;x++)if(x*factor%N===d)return x;throw Error("gauge")});let canon=canonical(trueOrder);trueOrderRank=rank.findIndex(j=>canonical(permutations[j].map(i=>shifts[i]))===canon)+1;exactPlainWords=0;exactPlainRunes=0;totalTruthRunes=0}
 const found=[],labels=[];
 let matches=0,matchedRunes=0,matchLen3=0,matchLen5=0,totalLen3=0,totalLen5=0;
 for(let wi=0;wi<obs.length;wi++){let c=obs[wi],list=cache.get(c.join(",")).filter(x=>x.code===1||(index.get(x.code)||[]).includes(winner)).sort((a,b)=>b.prob-a.prob);
 if(c.length>=3)totalLen3++;if(c.length>=5)totalLen5++;
 let p=list[0]?.p;if(p){matches++;matchedRunes+=c.length;if(c.length>=3)matchLen3++;if(c.length>=5)matchLen5++}
 if(truth){const q=truth.plain[wi];if(p&&p.join(",")===q.join(","))exactPlainWords++;if(p)for(let i=0;i<p.length;i++)if(p[i]===q[i])exactPlainRunes++;totalTruthRunes+=q.length}
 labels.push(p?p.map(x=>alphabet[x]).join(""):"?");
 if(p&&c.length>=5&&found.length<80)found.push({word:wi,len:c.length,p:p.map(x=>alphabet[x]).join(""),choices:list.length});
 }
 return {order,topScores:rank.slice(0,5).map(j=>({score:logScore[j],matches:matchCounts[j],key:permutations[j].map(i=>shifts[i])})),trueOrderRank,exactPlainWords,exactPlainRunes,totalTruthRunes,matches,matchedRunes,matchLen3,matchLen5,totalLen3,totalLen5,groups:obs.length,firstWords:labels.slice(0,100),longMatches:found};
 }
 const out={};for(const [name,v] of [["control1",control1],["control2",control2]]){const truth=plant(v);out[name]=orderSolve(truth.obs,v.candidates[v.selected],truth)}
 for(const [name,v] of Object.entries(original.candidates))out["original:"+name]=orderSolve(words,v,null);
 return out;
}
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),json=p=>JSON.parse(read(p));
console.log(JSON.stringify(experiment(json("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/emerson_essays_2944.txt"),json("im-results/lp2-q8-marginal-channel-frozen-blind-control1.json"),json("im-results/lp2-q8-marginal-channel-frozen-blind-control2.json"),json("im-results/lp2-q8-marginal-channel-original-frozen-output.json")),null,2));
