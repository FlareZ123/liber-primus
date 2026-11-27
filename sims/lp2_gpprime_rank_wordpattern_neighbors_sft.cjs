'use strict';
const fs=require('node:fs');
function run(g,lex,source){
const a=new Map(g.translit.map((v,i)=>[v,i]));a.set("ING",21);a.set("IO",27);
const R=g.prime.map(p=>(p-1)%29),truth=[2,4,0,8,12,21,6,9,10,23,5,27,18,1,26,20,13,17,14,15,22,7,25,24,3,11,16,19,28];
function norm(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");let p=[];while(w.length){let found=false;for(const n of [3,2,1])if(w.length>=n&&a.has(w.slice(0,n))){p.push(a.get(w.slice(0,n)));w=w.slice(n);found=true;break}if(!found)throw Error(w)}return p}
const enc=w=>String.fromCharCode(...w.map(x=>65+x)),dict=new Map();
for(const line of lex.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+(\d+)$/);if(!m)continue;const w=enc(norm(m[1]));dict.set(w,(dict.get(w)||0)+Number(m[2]))}
const entries=[...dict].filter(([w])=>w.length>=7&&w.length<=14).map(([w,n])=>[Array.from(w,c=>c.charCodeAt(0)-65),n]);
const donor=(source.slice(source.indexOf("|Almustafa"),source.indexOf("*** END OF THIS PROJECT")).match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).map(norm);
// length 14 makes 60-bit codes; use a string key to prevent Number rounding.
function pat(P,S){const A=Array.from({length:29},(_,i)=>i),last=new Int8Array(29).fill(-1);let k=P.length.toString(16);for(let i=0;i<P.length;i++){const p=P[i],c=A[S[p]];A.splice(S[p],1);A.splice(R[p],0,c);k+=(last[c]<0?0:i-last[c]).toString(16);last[c]=i}return k}
const hist=[new Map(),new Map()],selected=[[],[]];let oov=0;for(let i=0;i<donor.length;i++){let w=donor[i];if(w.length<7||w.length>14)continue;if(!dict.has(enc(w))){oov++;continue}const k=+(i>=Math.floor(donor.length*2/3)),p=pat(w,truth);hist[k].set(p,(hist[k].get(p)||0)+1);selected[k].push(w)}
function evalKey(S){const mass=new Map();for(const [w,n] of entries){const p=pat(w,S);let v=mass.get(p);if(v){v[0]++;v[1]+=Math.sqrt(n)}else mass.set(p,[1,Math.sqrt(n)])}return hist.map(h=>{let support=0,uniform=0,weighted=0;for(const [p,n] of h){let v=mass.get(p)||[0,0];if(v[0])support+=n;uniform+=Math.log(.02+v[0]);weighted+=Math.sqrt(n)*Math.log(.05+v[1])}return{support,uniform,weighted}})}
const base=evalKey(truth),rows=[];for(let i=0;i<29;i++)for(let j=i+1;j<29;j++){let S=truth.slice();[S[i],S[j]]=[S[j],S[i]];rows.push({swap:[i,j],scores:evalKey(S)})}
const total=selected.map(x=>x.length),full=rows.filter(r=>r.scores.every((s,i)=>s.support===total[i])),better=key=>rows.filter(r=>r.scores[0][key]>base[0][key]+1e-8).length,best=key=>rows.reduce((x,y)=>x.scores[0][key]>y.scores[0][key]?x:y);
function witness(i,j){let S=truth.slice();[S[i],S[j]]=[S[j],S[i]];return{swap:[i,j],scores:rows.find(r=>r.swap[0]===i&&r.swap[1]===j).scores,changed:selected.map(ws=>ws.filter(w=>pat(w,S)!==pat(w,truth)).length),changedRunes:selected.map(ws=>ws.filter(w=>pat(w,S)!==pat(w,truth)).reduce((n,w)=>n+w.length,0))}}
return{lexicon:dict.size,eligible:entries.length,donorWords:donor.length,oov,total,unique:hist.map(h=>h.size),truth,base,neighbors:rows.length,fullFit:rows.filter(r=>r.scores[0].support===total[0]).length,fullBoth:full.length,betterUniform:better("uniform"),betterWeighted:better("weighted"),bestUniform:best("uniform"),bestWeighted:best("weighted"),witnesses:[witness(6,7),witness(25,26)]}
}
const [g,lex,source]=["resources/liber-primus/lp2-corpus.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt"].map(p=>fs.readFileSync(p,'utf8'));console.log(JSON.stringify(run(JSON.parse(g),lex,source),null,2));
