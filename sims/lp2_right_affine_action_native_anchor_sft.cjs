"use strict";
/** Exact all-pair/IV right-action key reconstruction from the opening native 8+5 heading. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(g,trans,native,lex,sources){
 const mod=x=>((x%29)+29)%29, cls=Uint8Array.from({length:29},(_,i)=>[1,3,10,12,18,22,24,25,26,27,28].includes(i)?0:1);
 const alphabet=new Map(g.translit.map((s,i)=>[s,i])),ids=new Map(g.runes.map((s,i)=>[s,i])),tokens=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const normalize=w=>w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const sig=p=>String.fromCharCode(...p), compact=p=>p.map(x=>"0123456789abcdefghijklmnopqrs"[x]).join("");
 function encodeWord(w){w=normalize(w);const p=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){p.push(21);i+=3}else if(w.startsWith("IO",i)){p.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);p.push(t.i);i+=t.s.length}}return p}
 function parseWords(t){return (t.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>{if(!ids.has(x))throw Error("native unknown "+x);return ids.get(x)}))}
 const dictionary=new Map();
 function add(p,label,freq){const k=sig(p),prev=dictionary.get(k);if(!prev||freq>prev.freq)dictionary.set(k,{p,label,freq})}
 function addLatin(w,freq){const s=normalize(w);function walk(i,p){if(i===s.length){add(p,w,freq);return}for(const n of [1,2,3]){const part=s.slice(i,i+n);if(part.length!==n)continue;const v=n===3?(part==="ING"?alphabet.get("NG"):undefined):alphabet.get(part);if(v!==undefined)walk(i+n,p.concat(v))}}walk(0,[]);add(encodeWord(w),w,freq)}
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)addLatin(m[1],Number(m[2]))}
 for(const w of ["A","I","O"])addLatin(w,1);
 for(const section of native.sections)for(const p of parseWords(section.source_text))add(p,"[native]",1);
 const anchors=[...dictionary.values()].filter(w=>w.p.length===8), secondWords=[...dictionary.values()].filter(w=>w.p.length===5);
 const cipher=g.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),p0=g.pages[0].indices;
 const sourceWords=parseWords(trans.replace(/\r\n/g,"\n").split("%").slice(0,55).join("%"));
 if(cipher.length!==12956||sourceWords.length!==2896||sourceWords[0].length!==8||sourceWords[1].length!==5||sourceWords.flat().some((x,i)=>x!==cipher[i]))throw Error("source mismatch");
 const A=[],B=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++){A.push(a);B.push(b)}
 const M=A.length,ind=(a,b)=>(a-1)*29+b,inv=A.map(a=>{for(let i=1;i<29;i++)if(mod(i*a)===1)return i});
 const dec=new Uint8Array(M*29),enc=new Uint8Array(M*29),next=new Uint16Array(M*M),nc=new Uint8Array(M*M);
 for(let s=0;s<M;s++){for(let x=0;x<29;x++){dec[s*29+x]=mod(inv[s]*(x-B[s]));enc[s*29+x]=mod(A[s]*x+B[s])}for(let k=0;k<M;k++){next[s*M+k]=ind(mod(A[s]*A[k]),mod(A[s]*B[k]+B[s]));nc[s*M+k]=Number(mod(A[s]*B[k]+B[s])!==mod(A[k]*B[s]+B[k]))}}
 const coeff=k=>k.map(i=>[A[i],B[i]]);
 function transform(t,u,v,iv,encrypt){let s=iv;const out=[];for(const x of t){const p=encrypt?x:dec[s*29+x];out.push(encrypt?enc[s*29+x]:p);s=next[s*M+(cls[p]?v:u)]}return out}
 // Solve C0=A0*P0+B0, enumerate the 28 possible A0.
 // At first class occurrence, each nonzero a_j determines exactly one b_j
 // from G_i^-1(C_(i+1)) = a_j*P_(i+1)+b_j.
 function infer(c){
  const found=new Map();let nodes=0,knownTests=0,newTrials=0,completeLeaves=0,unseenClassLeaves=0,anchorWordsWithKey=0;
  function solveWord(w){const p=w.p,startSize=found.size;
    function addKey(u,v,iv){if(!nc[u*M+v])return;const k=(u*M+v)*M+iv;if(found.has(k))return;const q=transform(c.slice(0,13),u,v,iv,false);if(sig(q.slice(0,8))!==sig(p))throw Error("inference replay");const second=dictionary.get(sig(q.slice(8,13)));found.set(k,{key:[u,v,iv],first:w.label,firstRunes:p,second:second?.label??null,secondRunes:q.slice(8,13)})}
    function dfs(i,state,u,v,iv){nodes++;if(i===7){completeLeaves++;if(u>=0&&v>=0)addKey(u,v,iv);else{unseenClassLeaves++;for(let k=0;k<M;k++)if(u<0)addKey(k,v,iv);else addKey(u,k,iv)}return}
      const j=cls[p[i]],known=j?v:u,y=p[i+1];
      if(known>=0){knownTests++;const s=next[state*M+known];if(enc[s*29+y]===c[i+1])dfs(i+1,s,u,v,iv);return}
      const z=dec[state*29+c[i+1]];
      for(let a=1;a<29;a++){newTrials++;const k=ind(a,mod(z-a*y)),s=next[state*M+k];if(j){if(u>=0&&!nc[u*M+k])continue;dfs(i+1,s,u,k,iv)}else{if(v>=0&&!nc[k*M+v])continue;dfs(i+1,s,k,v,iv)}}
    }
    for(let a=1;a<29;a++){const iv=ind(a,mod(c[0]-a*p[0]));dfs(0,iv,-1,-1,iv)}
    if(found.size>startSize)anchorWordsWithKey++;
  }
  for(const w of anchors)solveWord(w);
  return {nodes,knownTests,newTrials,completeLeaves,unseenClassLeaves,anchorWordsWithKey,all:[...found.values()],both:[...found.values()].filter(x=>x.second!==null)}
 }
 const texts=sources.map(([name,source])=>({name,words:(source.match(/[A-Za-z]+/g)||[]).map(w=>({word:w,p:encodeWord(w)}))}));
 const ref=texts[1].words.flatMap(w=>w.p),uni=new Uint32Array(29),bi=new Uint32Array(841),tri=new Uint32Array(24389);
 for(let i=0;i<ref.length;i++){uni[ref[i]]++;if(i)bi[ref[i-1]*29+ref[i]]++;if(i>1)tri[(ref[i-2]*29+ref[i-1])*29+ref[i]]++}
 const score=new Float64Array(24389);
 for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){const pu=(uni[z]+1)/(ref.length+29),pb=(bi[y*29+z]+20*pu)/(uni[y]+20);score[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+20*pb)/(bi[x*29+y]+20))}
 function logp(p){let z=0;for(let i=2;i<p.length;i++)z+=score[(p[i-2]*29+p[i-1])*29+p[i]];return z/(p.length-2)}
 function summarize(c,includeDecoded){const x=infer(c);const candidates=x.all.map(y=>{const p=transform(c,...y.key,false);if(transform(p,...y.key,true).some((z,i)=>z!==c[i]))throw Error("full replay");return {coeff:coeff(y.key),first:y.first,second:y.second,firstCompact:compact(y.firstRunes),secondCompact:compact(y.secondRunes),bodyScore:logp(p.slice(13)),first40:p.slice(0,40).map(i=>g.translit[i]).join(" "),...(includeDecoded?{decodedCompact:compact(p)}:{})}});candidates.sort((a,b)=>b.bodyScore-a.bodyScore);return {nodes:x.nodes,knownTests:x.knownTests,newTrials:x.newTrials,completeLeaves:x.completeLeaves,unseenClassLeaves:x.unseenClassLeaves,anchorWordsWithKey:x.anchorWordsWithKey,firstWordKeys:x.all.length,bothWordsKeys:x.both.length,baseline:logp(c.slice(13)),candidates}}
 const plants=[];
 for(const [n,off,actual] of [[0,10000,[ind(3,5),ind(7,11),ind(13,8)]],[2,10000,[ind(2,8),ind(11,3),ind(23,14)]]]){
  const t=texts[n];let pos=-1;for(let i=off;i+1<t.words.length;i++){const a=t.words[i],b=t.words[i+1];if(a.p.length===8&&b.p.length===5&&dictionary.has(sig(a.p))&&dictionary.has(sig(b.p))){pos=i;break}}
  if(pos<0)throw Error("plant anchor missing");if(!nc[actual[0]*M+actual[1]])throw Error("plant commutes");
  const p=t.words.slice(pos).flatMap(x=>x.p).slice(0,cipher.length);if(p.length!==cipher.length)throw Error("short plant");
  const c=transform(p,...actual,true),res=summarize(c,false),actualDesc=coeff(actual),recovered=res.candidates.find(x=>JSON.stringify(x.coeff)===JSON.stringify(actualDesc));
  if(!recovered||recovered.second===null)throw Error("true key omitted");
  const decoded=transform(c,...actual,false);plants.push({source:t.name,wordOffset:pos,anchorWords:t.words.slice(pos,pos+2).map(x=>x.word),actual:actualDesc,trueKeyRetained:true,exactPlainRunes:decoded.filter((x,i)=>x===p[i]).length,...res,candidates:res.candidates.slice(0,12)});
 }
 const originalFit=summarize(cipher,true);
 return {dictionary:{forms:dictionary.size,anchors8:anchors.length,second5:secondWords.length},original:{runes:cipher.length,redWords:sourceWords.slice(0,2).map(compact)},plants,originalFit};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),trans=read("resources/liber-primus/lp2-transcription.txt"),native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),lex=read("resources/control/english_wordfreq_textblob.txt");
const sources=[["Shakespeare","resources/control/shakespeare_first300k.txt"],["Gibran","resources/control/gibran_prophet_58585.txt"],["Emerson","resources/control/emerson_essays_2944.txt"]].map(([n,f])=>[n,read(f)]);
console.log(JSON.stringify(study(g,trans,native,lex,sources),null,2));
