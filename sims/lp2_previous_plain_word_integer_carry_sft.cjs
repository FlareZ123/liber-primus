"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(A,T,G,L){
 const idx=new Map(A.runes.map((r,i)=>[r,i])), trans=A.translit, mod=(x,m)=>(x%m+m)%m, pow=n=>29n**BigInt(n), val=d=>d.reduce((a,b)=>29n*a+BigInt(b),0n), digits=(x,n)=>{let a=Array(n);for(let i=n-1;i>=0;i--){a[i]=Number(x%29n);x/=29n}return a}, key=d=>d.join(",");
 const pages=T.split("%");pages.splice(50,0,"");let words=[],p=[],s,e,off=0;
 function finish(){if(p.length){words.push({p,s,e,off});off+=p.length;p=[]}}
 for(let i=0;i<56;i++)for(let c of pages[i]){if(idx.has(c)){if(!p.length)s=i;p.push(idx.get(c));e=i}else if(c!=="/"&&!/\s/u.test(c))finish()}finish();
 if(words.length!==2896||off!==12956||key(words.flatMap(x=>x.p))!==key(A.pages.slice(0,56).flatMap(p=>p.indices)))throw Error("original");
 const native=G.sections.map(s=>({name:s.name,words:s.source_text.split(/[^\u16a0-\u16ff]+/u).filter(Boolean).map(x=>Array.from(x).map(c=>idx.get(c)))}));
 // All segmentation using canonical literal GP tokens plus common documented spelling aliases.
 let tokens=trans.map((t,i)=>[t,i]);for(const [t,v] of [["K","C"],["Q","C"],["V","U"],["Z","S"],["ING","NG"],["IO","IA"]]){let i=trans.indexOf(v);if(i>=0)tokens.push([t,i])}
 const base=new Map();for(let line of L.split(/\r?\n/)){let m=/^([a-z]+)\s+(\d+)$/.exec(line);if(!m)continue;let w=m[1].toUpperCase().replace(/QU/g,"CW"),f=Number(m[2]);function walk(i,p){if(i===w.length){let k=key(p);base.set(k,Math.max(base.get(k)||0,f));return}for(const [t,j] of tokens)if(w.startsWith(t,i))walk(i+t.length,p.concat(j))}walk(0,[])}
 function lex(ex){let d=new Map(base);for(const s of native)if(s.name!==ex)for(const p of s.words){let k=key(p);d.set(k,(d.get(k)||0)+10)}return d}
 function decode(C,seed){let out=[seed],v=val(seed);for(let i=1;i<C.length;i++){v=mod(val(C[i])-v,pow(C[i].length));out.push(digits(v,C[i].length))}return out}
 function encode(P,iv=3301n){return P.map(p=>{let v=val(p),c=digits(mod(v+iv,pow(p.length)),p.length);iv=v;return c})}
 function rank(C,cut,D){let n=C[0].length,seeds=[...D.keys()].map(k=>k.split(",").map(Number)).filter(p=>p.length===n);let best=null,valid=0,strict=0,maxPrefix=0;for(const seed of seeds){let P=decode(C.slice(0,cut),seed),score=0,good=0,run=0;for(let i=0;i<P.length;i++){let f=D.get(key(P[i]));if(f){good++;score+=Math.log1p(f);if(run===i)run++}else score-=12}if(good===cut)strict++;maxPrefix=Math.max(maxPrefix,run);if(run>=2)valid++;if(!best||score>best.score)best={seed,P,score,good}}if(!best)return {seeds:0};let P=decode(C,best.seed);return {seeds:seeds.length,firstTwoLexical:valid,strict,maxPrefix,bestSeed:best.seed,prefixKnown:best.good,prefixLength:cut,heldKnown:P.slice(cut).filter(p=>D.has(key(p))).length,heldLength:P.length-cut,readout:P.map(p=>p.map(i=>trans[i]).join("")).join(" "),P}}
 const D=lex(null), ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],titles=[13,16,12,20,16,19,10,8,9];let results=[];
 for(let z=0;z<ranges.length;z++){let [lo,hi]=ranges[z],start=A.pages.slice(0,lo).reduce((n,p)=>n+p.indices.length,0)+titles[z];let w=words.filter(x=>x.off>=start&&x.s<=hi),C=w.map(x=>x.p),cut=z===8?w.filter(x=>x.e===54).length:Math.floor(C.length/2);if(w[0].off!==start)throw Error("title cut");let rr=rank(C,cut,D);delete rr.P;results.push({lo,hi,widths:C.slice(0,4).map(x=>x.length),...rr})}
 const term=words.filter(x=>x.s>=54&&x.off>=A.pages.slice(0,54).reduce((n,p)=>n+p.indices.length,0)+9).map(x=>x.p);
 let n=Math.min(term[0].length,term[1].length),N=Number(pow(n)),allSecondThird=0,second=0,third=0,allPrefix=0,thirdStarts=new Set();
 if(N>1e6)throw Error("congruence count");
 for(let j=0;j<N;j++){let seed=digits(BigInt(j),term[0].length),P=decode(term.slice(0,47),seed),ok2=D.has(key(P[1])),ok3=D.has(key(P[2]));if(ok2)second++;if(ok3)third++;if(ok2&&ok3)allSecondThird++;if(P.slice(1).every(p=>D.has(key(p))))allPrefix++;thirdStarts.add(key(P[2].slice(0,3)))}
 const controls=[];for(const name of ["0_welcome","0_loss_of_divinity"]){let P=native.find(x=>x.name===name).words.slice(0,63),C=encode(P),cut=47,x=rank(C,cut,lex(name));let recovered=x.P;controls.push({name,firstWidth:P[0].length,seedExact:key(x.bestSeed)===key(P[0]),prefixCorrect:recovered.slice(0,cut).filter((p,i)=>key(p)===key(P[i])).length,heldCorrect:recovered.slice(cut).filter((p,i)=>key(p)===key(P[cut+i])).length,heldLength:P.length-cut,seeds:x.seeds,firstTwoLexical:x.firstTwoLexical,replay:key(encode(recovered,mod(val(C[0])-val(recovered[0]),pow(C[0].length))).flat())===key(C.flat())})}
 return {lexicon:D.size,results,exactTerminal:{seedResidueWidth:n,classes:N,second,third,allSecondThird,allPrefix,thirdStarts:[...thirdStarts].map(s=>s.split(",").map(x=>trans[Number(x)]).join(""))},controls}
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt")),null,2));
