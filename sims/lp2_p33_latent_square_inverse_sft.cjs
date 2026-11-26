'use strict';
// Exact latent square receiver. Node 22, no dependencies.
const fs=require('node:fs'),path=require('node:path');
const inputs=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/cicada2014-openpuff-magic-squares.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/blake_song_of_liberty_train.txt",
  "resources/transcriptions/lp1_wulfic_canonical.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
function run(contents){
 const check=(x,m)=>{if(!x)throw Error(m)},gp=JSON.parse(contents[0]),prime=gp.prime,sum=a=>a.reduce((s,v)=>s+v,0),mod=x=>(x%29+29)%29,ix=r=>gp.runes.indexOf(r);
 const pages=contents[1].replace(/\r/g,"").split("\n%\n"),groups=pages[33].replace(/[\s/]/g,"").split("&").map(s=>s.slice(s.indexOf(".")+1).split(/[-.]/).filter(Boolean)),words=groups.flat();
 check(groups.map(g=>g.length).join(",")==="21,28"&&words[48]==="ᛒ"&&pages[34].replace(/[\s/]/g,"").startsWith("ᛗᛒ-"),"source");words[48]+="ᛗᛒ";
 const W=words.map(w=>[...w].map(ix)),tape=W.flat(),N=tape.length,split=W.slice(0,21).flat().length,square=contents[2].trim().split(/\n\s*\n/)[1].trim().split(/\s+/).map(Number);
 check(N===198&&split===81&&tape.every(x=>x>=0)&&sum(square)===7231,"source totals");
 const O=new Map();for(let t=0;t<8;t++){const v=Array.from({length:49},(_,i)=>{let a=Math.floor(i/7),b=i%7;if(t&4)[a,b]=[b,a];if(t&1)a=6-a;if(t&2)b=6-b;return square[a*7+b]});const k=v.join(",");if(O.has(k))O.get(k).d4.push(t);else O.set(k,{d4:[t],v})}const orientations=[...O.values()];
 /** Exact arbitrary-string and lexical segmentation capacity. */
 function capacity(){
  const M=Math.max(...square),bound=(1n<<BigInt(M+1))-1n,B=[[1n]];
  for(let n=1;n<=N;n++){const row=[];for(let f=0;f<=n;f++){let z=f?B[n-1][f-1]<<2n:0n;if(f<n)for(const v of prime.slice(1))z|=B[n-1][f]<<BigInt(v);row.push(z&bound)}B.push(row)}
  const targets=[...new Set(square)],minF=new Map(targets.map(v=>[v,B.map(row=>row.findIndex(b=>(b>>BigInt(v))&1n))]));
  const toks=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),vocab=new Set(contents.slice(3,9).flatMap(x=>x.toUpperCase().match(/[A-Z]+/g)||[])),lex=new Map();
  for(const word of vocab){const x=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),enc=[];for(let j=0;j<x.length;){const t=x.startsWith("ING",j)?{s:"ING",i:21}:x.startsWith("IO",j)?{s:"IO",i:27}:toks.find(t=>x.startsWith(t.s,j));check(t,"GP encode");enc.push(t.i);j+=t.s.length}const v=sum(enc.map(i=>prime[i]));if(!minF.has(v))continue;const key=v+":"+enc.length,mask=enc.reduce((s,x,j)=>s|(x===0?1n<<BigInt(j):0n),0n);if(!lex.has(key))lex.set(key,new Map());const d=lex.get(key);if(!d.has(mask))d.set(mask,new Map());d.get(mask).set(enc.join(","),word)}
  check(vocab.size===32256,"vocab");const ends=new Set();let offset=0;for(const w of W){offset+=w.length;ends.add(offset)}
  const edges=new Map();for(const v of targets){const E=Array.from({length:N},()=>[]);for(let a=0;a<N;a++){let mask=0n,f=0;for(let b=a+1;b<=N;b++){if(tape[b-1]===0){mask|=1n<<BigInt(b-a-1);f++}const n=minF.get(v)[b-a];if(n<0||n>f)continue;let count=0,example=null;for(const [m,forms] of lex.get(v+":"+(b-a))||[])if((m&mask)===m){count+=forms.size;if(!example)example=forms.values().next().value}E[a].push({b,count,example})}}edges.set(v,E)}
  function dp(vals,mode,fixed){let states=new Map([[0,{cost:0,count:1n,path:[]}]]);for(let k=1;k<=49;k++){const next=new Map();for(const [a,s] of states)for(const e of edges.get(vals[k-1])[a]||[]){if(e.b>N-(49-k)||fixed&&((k===21&&e.b!==split)||(k<21&&e.b>=split)||(k>21&&e.b<=split)))continue;if(mode==="lexical"&&!e.count)continue;const cost=s.cost+(mode==="nearest"&&!ends.has(e.b)?1:0),weight=mode==="lexical"?BigInt(e.count):1n,old=next.get(e.b);if(!old||cost<old.cost)next.set(e.b,{cost,count:s.count*weight,path:[...s.path,{end:e.b,example:e.example}]});else if(cost===old.cost)old.count+=s.count*weight}states=next}const s=states.get(N);return s?{cost:s.cost,count:s.count.toString(),path:s.path}:null}
  const result=orientations.map(o=>({d4:o.d4,all:dp(o.v,"all",false),split:dp(o.v,"all",true),nearest:dp(o.v,"nearest",true),lexical:dp(o.v,"lexical",true)}));check(Math.min(...result.map(x=>x.nearest.cost))===16&&result.every(x=>x.lexical),"capacity");return result;
 }
 /** Exact two-dimensional sum DP with anchored prefix pruning. All possible keys, no dictionary.
  * @param {number[]} C
  * @param {number} breakAt
  * @param {number} breakCell
  * @param {number[][]} targets
  * @param {number} q
  * @param {boolean} pause
  * @param {number} sign
  * @param {number} cap
  */
 function inverse(C,breakAt,breakCell,targets,q,pause,sign,cap=1000000){
  const n=C.length,T=sum(targets[0]),U=sum(targets[0].slice(0,breakCell)),lower=T-U,F=C.flatMap((x,i)=>x===0?[i]:[]),seqs=[Array.from({length:breakAt},(_,i)=>i),Array.from({length:breakAt},(_,i)=>breakAt-i-1),Array.from({length:n-breakAt},(_,i)=>breakAt+i),Array.from({length:n-breakAt},(_,i)=>n-i-1)];
  check(F.length<20&&targets.every(a=>sum(a)===T&&sum(a.slice(0,breakCell))===U),"target setup");
  const vals=targets.map(o=>[o.slice(0,breakCell),o.slice(0,breakCell).reverse(),o.slice(breakCell),o.slice(breakCell).reverse()]),weight=C.map(c=>Array.from({length:29},(_,k)=>prime[mod(sign*c-k)]));
  let minimum=Infinity,admissible=0,joint=0,nodes=0,prefixPrunes=0,complete=true,parityMasks=0,leaves=0;const solutions=[];
  for(let m=0;m<2**F.length;m++){
   const hold=new Uint8Array(n);let fu=0,fl=0;for(let j=0;j<F.length;j++)if(m&(1<<j)){hold[F[j]]=1;if(F[j]<breakAt)fu++;else fl++}
   if((breakAt-fu)%2!==U%2||(n-breakAt-fl)%2!==lower%2)continue;parityMasks++;
   const upper=U-2*fu,total=T-2*(fu+fl);let ph=0;const phases=[],idx=Array.from({length:q},()=>[]);
   for(let i=0;i<n;i++){phases.push(ph);if(!hold[i])idx[ph].push(i);if(!pause||!hold[i])ph=(ph+1)%q}
   const opt=idx.map(pos=>Array.from({length:29},(_,k)=>k).filter(k=>pos.every(i=>weight[i][k]!==2)).map(k=>({k,u:sum(pos.filter(i=>i<breakAt).map(i=>weight[i][k])),t:sum(pos.map(i=>weight[i][k]))})));
   if(opt.some(a=>!a.length))continue;
   const base=opt.map(a=>Math.min(...a.map(x=>x.t))),slack=total-sum(base);minimum=Math.min(minimum,sum(base)+2*(fu+fl));if(slack<0)continue;admissible++;
   const order=[],unlocked=[],assigned=new Uint8Array(q);let ptr=[0,0,0,0];
   for(let h=0;h<q;h++){let best=null;for(let k=0;k<q;k++){if(assigned[k])continue;const end=seqs.map((s,j)=>{let a=ptr[j];while(a<s.length&&(hold[s[a]]||assigned[phases[s[a]]]||phases[s[a]]===k))a++;return a});const score=sum(end.map((b,j)=>(b-ptr[j])*(ptr[j]<4?2:1)));if(!best||score>best.score||score===best.score&&opt[k].length<opt[best.k].length)best={k,end,score}}
    assigned[best.k]=1;order.push(best.k);unlocked.push(seqs.map((s,j)=>s.slice(ptr[j],best.end[j])));ptr=best.end}
   const reach=Array.from({length:q+1},()=>Array(slack+1).fill(0n));reach[q][0]=1n;const mask=(1n<<BigInt(upper+1))-1n;
   for(let i=q-1;i>=0;i--){const h=order[i];for(const o of opt[h]){const d=o.t-base[h];if(d>slack||o.u>upper)continue;const shift=BigInt(o.u);for(let e=0;e+d<=slack;e++){const b=reach[i+1][e];if(b)reach[i][e+d]|=(b<<shift)&mask}}}
   if(!((reach[0][slack]>>BigInt(upper))&1n))continue;joint++;
   const key=new Int8Array(q).fill(-1);
   function dfs(i,e,u,active){if(nodes>=cap){complete=false;return}nodes++;if(i===q){leaves++;const plain=C.map((c,j)=>hold[j]?0:mod(sign*c-key[phases[j]])),acc=[];let s=0;for(const x of plain){s+=prime[x];acc.push(s)}check(acc[breakAt-1]===U&&s===T,"full sums");for(const a of active){let x=0;const ends=targets[a.j].map(v=>{x+=v;return acc.indexOf(x)+1});check(ends.every(z=>z>0)&&ends[breakCell-1]===breakAt,"exact full prefix");let clock=0;const replay=plain.map(x=>{const y=x===0?0:mod(sign*(x+key[clock]));if(!pause||x!==0)clock=(clock+1)%q;return y});check(replay.every((x,j)=>x===C[j]),"reencryption");solutions.push({orientation:a.j,mask:m,key:[...key],plain,ends})}return}
    const h=order[i];for(const o of opt[h]){const d=o.t-base[h];if(d>e||o.u>u||!((reach[i+1][e-d]>>BigInt(u-o.u))&1n))continue;key[h]=o.k;const w=unlocked[i].map(s=>s.map(pos=>hold[pos]?2:weight[pos][key[phases[pos]]]));const next=[];for(const a of active){const st=[];let ok=true;for(let j=0;j<4&&ok;j++){let [cell,acc]=a.st[j];for(const x of w[j]){if(cell>=vals[a.j][j].length){ok=false;break}acc+=x;if(acc>vals[a.j][j][cell]){ok=false;break}if(acc===vals[a.j][j][cell]){cell++;acc=0}}st.push([cell,acc])}if(ok)next.push({j:a.j,st})}if(!next.length){prefixPrunes++;continue}dfs(i+1,e-d,u-o.u,next);if(!complete)return}key[h]=-1}
   dfs(0,slack,upper,targets.map((_,j)=>({j,st:Array.from({length:4},()=>[0,0])})));if(!complete)break;
  }
  return {q,pause,sign,minimumObserved:Number.isFinite(minimum)?minimum:null,admissible,joint,nodes,prefixPrunes,parityMasks,leaves,complete,solutions};
 }
 const caps=capacity(),result=[];for(let q=1;q<=16;q++)for(const pause of [false,true])for(const sign of [1,-1])result.push(inverse(tape,split,21,orientations.map(x=>x.v),q,pause,sign));
 check(result.every(x=>x.complete&&!x.solutions.length),"q1..16");
 const native=JSON.parse(contents[10]).sections.find(x=>x.name==="0_welcome"),plainWords=native.source_text.split(/[^ᚠ-ᛠ]+/u).filter(Boolean).slice(0,35).map(w=>[...w].map(ix)),plain=plainWords.flat(),C=[...contents[9].split("$")[1].split("&")[0]].filter(r=>gp.runes.includes(r)).slice(0,plain.length).map(ix),U=plainWords.slice(0,14).flat().length,targets=plainWords.map(w=>sum(w.map(x=>prime[x])));
 const control=inverse(C,U,14,[targets],8,true,1,2000000),truth=[23,10,1,10,9,10,16,26],recovered=control.solutions.find(x=>x.key.join(",")===truth.join(",")&&x.plain.join(",")===plain.join(","));
 check(recovered&&control.complete,"authentic WELCOME key and plaintext");return {capacity:caps,original:result,control:{n:plain.length,split:U,wordCount:35,expectedKey:truth,recovered:!!recovered,...control}};
}
console.log(JSON.stringify(run(inputs.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
