"use strict";
/**
 * Known-key alignment decoder for two nonstandard no-doublet constructions.
 *
 * Recoverable plaintext is a subsequence of the underlying GP29 text.
 *  - V-DELETE: strict 29-symbol reject-on-repeat cipher, then independent
 *    deletion of an encrypted source rune with probability ~0.187.
 *  - V-SILENT: 36-symbol strict cipher; seven ciphertext values (29..35)
 *    are invisible, while the 29th possible plaintext value is a word space.
 *
 * A printed C and known but variably advanced key K impose
 *       P[i] = (C[i] - K[j_i]) mod m,
 * with nondecreasing j_i and unknown gaps for erased symbols or rejected
 * key draws. Beam search jointly solves the alignment and decoded GP syntax;
 * no plaintext is supplied to the decoder.
 *
 * This is a decoder-validation experiment, NOT a source-selected LP2 key.
 * It does not assert that LP2 uses either encoder.
 */
const A29 = "FUÞORCGWHNIJƎPXS TBEMLŊŒDÆYİA".replaceAll(" ", ""); // display only
const GP_NATIVE = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const GP_RUNES = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const byRune = new Map(GP_RUNES.map((r,i) => [r,i]));
const LATIN = new Map(GP_NATIVE.filter(x => x.length===1).map(x => [x.toLowerCase(), GP_NATIVE.indexOf(x)]));
const DIGRAPHS = [["th",2],["ng",21],["eo",12],["oe",22],["ia",27],["ae",25],["ea",28]];
const mod = (x,n) => (x % n + n) % n;
const lcg = seed => {let s=seed>>>0;return () => ((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)};
function tokenizeLatin(s, withSpaces=true) {
  s=s.toLowerCase().replaceAll("qu","cu").replaceAll("q","c").replaceAll("k","c").replaceAll("v","u").replaceAll("z","s");
  let out=[];
  for(let i=0;i<s.length;) {
    const d=DIGRAPHS.find(([k])=>s.startsWith(k,i));
    if(d){out.push(d[1]);i+=d[0].length;}
    else if(LATIN.has(s[i]))out.push(LATIN.get(s[i++]));
    else{if(withSpaces&&/[\s.!?;,:"()\-\[\]]/.test(s[i])&&out.length&&out[out.length-1]!==29)out.push(29);i++;}
  }
  return out;
}
function tokenizeNative(s,withSpaces=true) {
  const out=[];
  for(const c of s){
    if(byRune.has(c))out.push(byRune.get(c));
    else if(withSpaces&&c==="•"&&out.length&&out[out.length-1]!==29)out.push(29);
  }
  return out;
}
function trainLanguage(streams, variant, opts={}) {
  const spaced=variant==="V-SILENT";
  const rounds=opts.rounds??20, drop=opts.drop??0.19, rng=lcg(opts.seed??125516);
  const maxOrder=opts.order??4;
  if(maxOrder<1||maxOrder>7)throw new Error("order 1..7");
  const count=Array.from({length:maxOrder+1},()=>new Map());
  for(const original of streams){
    let src=spaced?original:original.filter(x=>x!==29);
    for(let rep=0;rep<rounds;rep++){
      const sample=src.filter(()=>rng()>drop);
      for(let i=0;i<sample.length;i++)for(let n=1;n<=maxOrder&&n<=i+1;n++){
        let code=sample.slice(i-n+1,i+1).join(",");
        const tab=count[n];tab.set(code,(tab.get(code)||0)+1);
      }
    }
  }
  let unigram=Array(30).fill(0),mass=0;
  for(const [k,v] of count[1]){unigram[+k]=v;mass+=v;}
  const tau=opts.tau??5;
  return {
    counts:count,
    score(prefix,x) {
      let history=prefix.concat(x);
      let p=(unigram[x]+15)/(mass+15*30);
      for(let n=2;n<=maxOrder&&n<=history.length;n++){
        const k=history.slice(-n).join(","), pref=history.slice(-n,-1).join(",");
        const a=count[n].get(k)||0, b=count[n-1].get(pref)||0;
        p=(a+tau*p)/(b+tau);
      }
      return Math.log(p);
    },
    sourceTokens:streams.reduce((n,s)=>n+s.length,0), maxOrder,
  };
}
function beamDecode(C,K,variant,model,opts={}) {
  if(!["V-DELETE","V-SILENT"].includes(variant))throw new Error("Unsupported variant "+variant);
  const M=variant==="V-SILENT"?36:29;
  const B=opts.beam??1600, maxGap=opts.maxGap??5, gapP=opts.gapP??0.22;
  const stats=opts.stats??false, t0=Date.now();
  let beam=[{j:0,score:0,h:[],tail:null,gap:0,outlength:0}];
  let minSurvivors=Infinity;
  for(let i=0;i<C.length;i++){
    const cand=[];
    for(const st of beam){
      for(let g=0;g<=maxGap;g++){
        const j=st.j+g;if(j>=K.length)break;
        const plain=mod(C[i]-K[j],M);
        if(variant==="V-SILENT"&&plain>29)continue;
        // Without intervening erased cipher events the strict filter forbids
        // an identical consecutive printed ciphertext value.
        if(g===0&&i>0&&C[i]===C[i-1])continue;
        const history=st.h.concat(plain);
        const h=history.slice(-Math.max(1,model.maxOrder-1));
        const score=st.score+model.score(history.slice(0,-1),plain)+
          g*Math.log(gapP)+Math.log(1-gapP);
        const node=plain===29?st.tail:{plain,prior:st.tail};
        cand.push({j:j+1,score,h,tail:node,gap:st.gap+g,
          outlength:st.outlength+(plain!==29?1:0)});
      }
    }
    cand.sort((a,b)=>b.score-a.score);
    const next=[],seen=new Set();
    for(const x of cand) {
      const sig=x.j+"|"+x.h.join(",");
      if(seen.has(sig))continue;
      seen.add(sig);next.push(x);
      if(next.length>=B)break;
    }
    beam=next;
    minSurvivors=Math.min(minSurvivors,beam.length);
    if(!beam.length)return {plain_idx:[],score:-Infinity,error:"No admissible path at "+i};
  }
  let winner=beam[0],out=Array(winner.outlength),cur=winner.tail;
  for(let i=out.length-1;i>=0;i--){out[i]=cur.plain;cur=cur.prior;}
  const alternatives=(opts.topN??0)>0 ? beam.slice(0,opts.topN).map(st=>{
    const o=Array(st.outlength);let node=st.tail;
    for(let i=o.length-1;i>=0;i--){o[i]=node.plain;node=node.prior;}
    return {score:st.score,alignmentKeyConsumed:st.j,plain_idx:o};
  }):undefined;
  return {plain_idx:out,score:winner.score,alignmentKeyConsumed:winner.j,
    gapSymbols:winner.gap,elapsedMs:Date.now()-t0,minSurvivors:stats?minSurvivors:undefined,
    alternatives};
}
function encodePlant(P,K,variant,rng=lcg(17)) {
  const M=variant==="V-SILENT"?36:29;
  if(!["V-DELETE","V-SILENT"].includes(variant))throw new Error("variant");
  const A=[];let j=0,previous=-1;
  for(const p of P) {
    let c;
    do {c=mod(p+K[j],M);j++;}while(c===previous);
    A.push(c);previous=c;
  }
  const C=[],truth=[];
  A.forEach((c,i)=>{
    if(variant==="V-DELETE"){
      if(rng()<0.187)return;
      C.push(c);truth.push(P[i]);
    }else if(c<29) {
      C.push(c);if(P[i]<29)truth.push(P[i]);
    }
  });
  return {C,K,truth,sourceLength:P.length,keyConsumed:j};
}
function lcs(a,b) {
  let old=new Uint16Array(b.length+1);
  for(let i=0;i<a.length;i++){
    let next=new Uint16Array(b.length+1);
    for(let j=0;j<b.length;j++)next[j+1]=a[i]===b[j]?old[j]+1:Math.max(next[j],old[j+1]);
    old=next;
  }
  return old[b.length];
}
module.exports={GP_RUNES,GP_NATIVE,tokenizeLatin,tokenizeNative,trainLanguage,beamDecode,encodePlant,lcs,lcg};
