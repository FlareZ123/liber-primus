"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/blake_song_of_liberty_train.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
function experiment(inputs){
 const check=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero inverse")};
 const corpus=JSON.parse(inputs[0]),rmap=new Map(corpus.runes.map((x,i)=>[x,i])),gp=new Map(corpus.translit.map((x,i)=>[x,i]));for(const [a,b] of [["K","C"],["Q","C"],["V","U"],["Z","S"],["ING","NG"],["IO","IA"]])gp.set(a,gp.get(b));
 const encode=(word,contract)=>{let s=word.toUpperCase().replace(/QU/g,"CW"),out=[];while(s.length){let tok=(contract?["ING","TH","NG","EO","OE","AE","IA","EA","IO"]:["TH","NG","EO","OE","AE","IA","EA"]).find(t=>s.startsWith(t))||s[0];out.push(gp.get(tok));s=s.slice(tok.length)}return out};
 const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[];for(const c of inputs[1].split("%").slice(0,55).join("%")){if(rmap.has(c))w.push(rmap.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);check(tape.length===12956&&words.length===2896&&words.flat().every((x,i)=>x===tape[i]),"source alignment");
 const dict=new Map(),add=p=>{if(p.length>=9&&p.length<=14&&p.every(x=>Number.isInteger(x)))dict.set(p.join(","),p)};for(const s of inputs.slice(2,7))for(const t of s.match(/[a-zA-Z]+/g)||[]){add(encode(t,true));add(encode(t,false))}const native=JSON.parse(inputs[7]).sections.flatMap(s=>(s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(c=>rmap.get(c))));for(const p of native)add(p);
 const diff=(p,k)=>{let x=p.slice();for(let j=0;j<k;j++)x=x.slice(1).map((v,i)=>mod(v-x[i]));return x};
 const sig=p=>{const x=diff(p,4),a=x.find(v=>v!==0);return (a===undefined?x:x.map(t=>mod(t*inv(a)))).join(",")};
 const fmask=p=>p.reduce((m,v,j)=>v===0?m|(1<<j):m,0),filter=(p,m)=>p.filter((_,j)=>!(m&(1<<j))),key=(p,m)=>p.length+":"+m+":"+sig(filter(p,m));
 const ordinary=new Map(),hold=new Map();function ins(map,k,p){if(!map.has(k))map.set(k,[]);map.get(k).push(p)}for(const p of dict.values()){ins(ordinary,key(p,0),p);ins(hold,key(p,fmask(p)),p)}
 function candidates(c){
  const out=new Map();
  function run(p,m){const x=filter(p,m),y=filter(c,m),xd=diff(x,4),yd=diff(y,4);
   for(let a=1;a<29;a++){if(!yd.every((v,i)=>v===mod(a*xd[i])))continue;const z=y.map((v,i)=>mod(v-a*x[i]));const third=diff(z,3);const coeffs=third.length?[third[0]]:Array.from({length:29},(_,j)=>j);
    for(const q3 of coeffs){if(out.has(q3))continue;const coeff=[z[0]||0,diff(z,1)[0]||0,diff(z,2)[0]||0,q3];let k=0;const replay=p.map((v,j)=>{if(m&(1<<j))return 0;const i=k++;return mod(a*v+coeff[0]+coeff[1]*i+coeff[2]*i*(i-1)/2+coeff[3]*i*(i-1)*(i-2)/6)});check(replay.every((v,i)=>v===c[i]),"local replay");out.set(q3,{p,a,coeff,m})}
   }
  }
  for(const p of ordinary.get(key(c,0))||[])run(p,0);const z=fmask(c);for(let m=z;;m=(m-1)&z){for(const p of hold.get(key(c,m))||[])run(p,m);if(!m)break}return out
 }
 const entries=[];for(let L=9;L<=14;L++)for(let i=0;i+L<=tape.length;i++){const m=candidates(tape.slice(i,i+L));if(m.size)entries.push({i,L,keys:[...m.keys()].sort((a,b)=>a-b),witness:[...m.values()][0]})}
 check(entries.filter(x=>x.L===9).length===82&&entries.filter(x=>x.L===10).length===3&&entries.length===85,"all previous long windows");
 // Positive controls: same q3 across distinct genuine words, other coefficients and scales vary.
 let plants=0;for(const [n,p] of native.entries()){if(p.length<9||p.length>14)continue;const a=1+n%28,coeff=[n%29,(n*3+1)%29,(n*7+2)%29,15],m=n%2?fmask(p):0;let k=0;const c=p.map((v,j)=>{if(m&(1<<j))return 0;const i=k++;return mod(a*v+coeff[0]+coeff[1]*i+coeff[2]*i*(i-1)/2+coeff[3]*i*(i-1)*(i-2)/6)});check(candidates(c).has(15),"planted shared coefficient");plants++}
 const mask=Array.from({length:29},(_,q)=>entries.reduce((s,e,i)=>e.keys.includes(q)?s|(1n<<BigInt(i)):s,0n));
 const pop=x=>{let n=0;while(x){x&=x-1n;n++}return n};
 const cardinal=mask.map(pop),order=Array.from({length:29},(_,i)=>i).sort((a,b)=>cardinal[b]-cardinal[a]||a-b);
 const demand=words.filter(p=>p.length>=9).length,required=demand-Math.floor(.05*words.length);
 let minK=0,upper=0;while(upper<required)upper+=cardinal[order[minK++]];
 const search=[];let selected=null;
 // Exact distinct-window union decision, relaxing all interval conflicts and length-specific caps.
 for(let k=minK;k<=29;k++){
  let nodes=0,best=0,witness=null;
  function dfs(start,left,cover,picked){
   nodes++;const n=pop(cover);best=Math.max(best,n);if(n>=required){witness=picked.slice();return true}
   if(!left||order.length-start<left)return false;
   let optimistic=n;const gains=order.slice(start).map(q=>pop(mask[q]&~cover)).sort((a,b)=>b-a);for(let j=0;j<left;j++)optimistic+=gains[j]||0;if(optimistic<required)return false;
   for(let j=start;j<=order.length-left;j++){const q=order[j];if((mask[q]&~cover)===0n)continue;if(dfs(j+1,left-1,cover|mask[q],[...picked,q]))return true}return false
  }
  const feasible=dfs(0,k,0n,[]);search.push({k,nodes,feasible,maxVisited:best,witness});if(feasible){selected=witness;break}
 }
 check(selected,"union witness");
 const constant=cardinal.map((n,q)=>({q,windows:n,minOOV:demand-n}));
 return {longDictionary:dict.size,plants,demand,required,entries,constant,maxSharedWindows:Math.max(...cardinal),minimumDistinctCoeffUnion:minK,exactUnionSearch:search,firstUnionWitness:selected,sourceSelected15:constant[15]};
}
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
