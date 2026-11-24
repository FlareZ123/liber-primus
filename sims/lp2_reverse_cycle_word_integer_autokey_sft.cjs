"use strict";
const fs=require("node:fs");
const path=require("node:path");
function run(corpus,raw,native,donors){
  const assert=(c,m)=>{if(!c)throw Error(m)};
  const mod=(x,n)=>((x%n)+n)%n;
  const runeIndex=new Map(corpus.runes.map((x,i)=>[x,i]));
  const readRunes=s=>[...s].map(c=>runeIndex.get(c)).filter(x=>x!==undefined);
  const original=raw.split("%").slice(0,55).join("").replace(/[\/\s]/g,"").split(/[^\u16a0-\u16ff]+/u).filter(Boolean).map(readRunes);
  assert(original.length===2896&&String(original.flat())===String(corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices)),"original parse");
  const gpTokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  /** @param {string} s @returns {number[][]} */
  function latin(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const a=[];while(w.length){const t=gpTokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);a.push(t.i);w=w.slice(t.s.length)}out.push(a)}return out}
  const solved=native.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(readRunes)}));
  const donorWords=donors.flatMap(latin);
  const wordKey=w=>String.fromCharCode(...w.map(v=>65+v));
  function makeLex(exclude){const map=new Map();for(const w of [...donorWords,...solved.filter(s=>s.name!==exclude).flatMap(s=>s.words)]){let m=map.get(w.length);if(!m)map.set(w.length,m=new Map());m.set(wordKey(w),w)}return map}
  const base=29n,pow=Array.from({length:Math.max(...original.map(x=>x.length),...solved.flatMap(s=>s.words.map(x=>x.length)))+1},(_,i)=>base**BigInt(i));
  /** @param {number[]} w @returns {bigint} */
  const val=w=>w.reduce((s,x)=>s*base+BigInt(x),0n);
  function digits(v,n){const out=Array(n);for(let i=n-1;i>=0;i--){out[i]=Number(v%base);v/=base}return out}
  function repeated(p,n){let k=0n;for(let i=0;i<n;i++)k=k*base+BigInt(p[p.length-1-i%p.length]);return k}
  function egcd(a,b){let x=1n,y=0n;while(b){const q=a/b;[a,b]=[b,a-q*b];[x,y]=[y,x-q*y]}return x}
  const invs=Array.from({length:29},(_,a)=>a?pow.map(m=>mod(egcd(BigInt(a),m),m)):null);
  for(let a=1;a<29;a++)for(let n=1;n<pow.length;n++)assert(BigInt(a)*invs[a][n]%pow[n]===1n,"inverse");
  function encrypt(words,a,b,d,iv){let prev=iv;return words.map(w=>{const c=digits(mod(BigInt(a)*val(w)+BigInt(b)*repeated(prev,w.length)+BigInt(d),pow[w.length]),w.length);prev=w;return c})}
  /** All 23,548 residue-sized keys, with every lexical singleton state; freeze after 12 printed words. */
  function recover(words,lex,training=12,escapeBudget=0){
    const anchor=words.findIndex((w,i)=>w.length===1&&i+training<words.length);
    if(anchor<0)throw Error("no singleton");
    const slices=words.slice(anchor),vals=slices.map(val),result=[];
    const seeds=[...(lex.get(1)?.values()||[])];
    const counts=Array(training+1).fill(0);
    let furthest=0,best=null;
    for(let a=1;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){
      const B=BigInt(b),D=BigInt(d);
      for(const seed of seeds){let prev=seed,plaintext=[prev],i=1,escapes=0;counts[1]++;
        for(;i<training;i++){
          const n=slices[i].length,p=digits(mod((vals[i]-B*repeated(prev,n)-D)*invs[a][n],pow[n]),n);
          if(!lex.get(n)?.has(wordKey(p))&&++escapes>escapeBudget)break;
          plaintext.push(p);prev=p;counts[i+1]++;
        }
        if(i>furthest){furthest=i;best={a,b,d,seed,words:plaintext.slice(0,12),escapes}}
        if(i===training){
          // Prediction starts here: the frozen key and final training word
          // determine every remaining plaintext rune; no lexical rescoring.
          for(;i<slices.length;i++){const n=slices[i].length,p=digits(mod((vals[i]-B*repeated(prev,n)-D)*invs[a][n],pow[n]),n);plaintext.push(p);prev=p}
          const replay=encrypt(plaintext.slice(1),a,b,d,plaintext[0]);
          assert(String(replay.flat())===String(slices.slice(1).flat()),"replay");
          result.push({a,b,d,seed,plaintext,escapes,replay:true});
        }
      }
    }
    return {anchor,anchorRune:words.slice(0,anchor).flat().length,sourcePrefix:slices.slice(0,training),training,furthest,best,counts,candidates:result};
  }
  const lex=makeLex(null),result={model:"C_i=A P_i+B reverse-cycle(P_(i-1),len_i)+D mod29^len_i",lexiconTypes:[...lex.values()].reduce((n,v)=>n+v.size,0),singletons:[...lex.get(1).values()].map(x=>x[0]),originalWords:original.length,originalRunes:original.flat().length};
  result.originalExact=recover(original,lex);
  result.originalEscape1=recover(original,lex,12,1);
  result.controls=[];
  const controls=solved.filter(x=>x.words.findIndex((w,i)=>w.length===1&&i+12<x.words.length)>=0).sort((a,b)=>b.words.length-a.words.length).slice(0,3);
  for(let j=0;j<controls.length;j++){
    const {name,words:p}=controls[j],[a,b,d]=[[7,11,19],[17,5,2],[3,27,13]][j];
    const c=encrypt(p,a,b,d,[2,9,27]),l=makeLex(name);
    const rec=recover(c,l,12,1),anchor=rec.anchor;
    const missing=p.slice(anchor,anchor+12).map((w,i)=>l.get(w.length)?.has(wordKey(w))?null:[i,w]).filter(Boolean);
    const correct=rec.candidates.find(x=>x.a===a&&x.b===b&&x.d===d&&String(x.plaintext.flat())===String(p.slice(anchor).flat()));
    assert(rec.candidates.length===1&&correct,"unique native recovery");
    result.controls.push({name,planted:{a,b,d},missing,anchor,anchorRune:rec.anchorRune,train:rec.training,candidates:rec.candidates.length,recovered:{a:correct.a,b:correct.b,d:correct.d,seed:correct.seed},trainingRunes:correct.plaintext.slice(0,12).flat().length,heldoutRunes:p.slice(anchor+rec.training).flat().length,correct:true,replay:correct.replay,counts:rec.counts});
  }
  return result;
}
const root=path.resolve(__dirname,"..");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const [cj,trans,nj,...donors]=paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"));
console.log(JSON.stringify(run(JSON.parse(cj),trans,JSON.parse(nj),donors),null,2));
