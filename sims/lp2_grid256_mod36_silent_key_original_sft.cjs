"use strict";
/**
 * A source-fixed 256-byte table as mod36 repeating key to the independently
 * calibrated Round48 mod36 hidden-symbol decoder. Intermediate negative gate.
 * No first-party claim that the table encodes this key/channel.
 *
 * node sims/lp2_grid256_mod36_silent_key_original_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path");
const {experiment}=require("./lp2_alt36_silent_exact_latent_viterbi_sft.cjs");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gpRaw=read("resources/liber-primus/lp2-corpus.json"),gp=JSON.parse(gpRaw);
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const raw={
  gp:gpRaw,
  shakespeare:read("resources/control/shakespeare_first300k.txt"),
  gibran:read("resources/control/gibran_prophet_58585.txt"),
  emerson:read("resources/control/emerson_essays_2944.txt")
};
assert.equal(grid.bytes.length,256);
assert(grid.bytes.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
assert.equal(grid.shape,"32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.deepEqual(grid.bytes.slice(0,16),
  [203,231,167,186,97,237,126,183,92,249,156,222,247,4,183,212]);
assert.equal(gp.pages.length,58);
const K=Array.from({length:10000},(_,i)=>grid.bytes[i%256]%36);
const WK=Array.from({length:10000},(_,i)=>grid.bytes[(i+53)%256]%36);
function decode(C,key,beam=400) {
  const x=experiment(raw,{beam,maxHidden:3,decodeInput:{cipher:C,key}});
  assert.equal(x.status,"candidate decoder output (not an authenticated original plaintext)");
  assert(Number.isFinite(x.score));
  return {score:x.score,lastClock:x.lastConsumedKeyIndex,
    pathLength:x.indices.length,
    preview:x.transliteration.slice(0,200),
    indices:x.indices};
}
function tokens(text) {
  const label=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),
    words=text.toUpperCase().match(/[A-Z]+/g)||[],out=[];
  for(const word of words) {
    const str=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/[KQ]/g,"C").replace(/Z/g,"S"),P=[];
    for(let at=0;at<str.length;) {
      const tok=str.startsWith("ING",at)?{s:"ING",i:21}:
        str.startsWith("IO",at)?{s:"IO",i:27}:
        label.find(t=>str.startsWith(t.s,at));
      if(!tok)throw Error("unsupported GP token at "+at+" in "+str);
      P.push(tok.i);at+=tok.s.length;
    }
    out.push(P);
  }
  return out;
}
const donor=tokens(raw.gibran),start=Math.floor(donor.length*.57);
const whole=donor.slice(start).flatMap(w=>[...w,29]);
const P=whole.slice(1400,1850);
assert.equal(P.length,450);
let clock=0,prev=-1;
const E=[];
for(const p of P) {
  assert(p>=0&&p<=29);
  while((p+K[clock])%36===prev)clock++;
  const c=(p+K[clock])%36;
  E.push({p,c,j:clock});clock++;prev=c;
}
const visible=E.filter(x=>x.c<29),Cpos=visible.map(x=>x.c);
const recoverable=visible.map(x=>x.p);
function lcs(A,B) {
  let p=new Uint16Array(B.length+1),q=new Uint16Array(B.length+1);
  for(const a of A) {
    q.fill(0);
    for(let i=0;i<B.length;i++)q[i+1]=a===B[i]?p[i]+1:Math.max(q[i],p[i+1]);
    [p,q]=[q,p];
  }
  return p[B.length];
}
const positive=decode(Cpos,K),negative=decode(Cpos,WK);
const posRecovery=lcs(positive.indices,recoverable)/Math.max(positive.indices.length,recoverable.length),
  negRecovery=lcs(negative.indices,recoverable)/Math.max(negative.indices.length,recoverable.length);
assert(posRecovery>.75,"native positive with exact grid key must recover visible text");
assert(positive.score-negative.score>2,"true grid key should separate from wrong phase");
const pages=(a,b)=>gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
const original0=pages(0,2),terminal=pages(54,55);
assert.equal(original0.length,729);assert.equal(terminal.length,308);
const outputs=[];
for(const [name,C] of [["p0-p2",original0],["p54-p55",terminal]]) {
  const right=decode(C,K),wrong=decode(C,WK);
  outputs.push({name,inputRunes:C.length,
    grid:{score:right.score,lastClock:right.lastClock,
      pathLength:right.pathLength,preview:right.preview},
    wrongPhase53:{score:wrong.score,lastClock:wrong.lastClock,
      pathLength:wrong.pathLength,preview:wrong.preview}});
}
const report={
  hypothesis:"p49-51 physical 32x8 byte table as exact period256 K_t=grid[t%256] mod36, strict nonrepeat 36-state hidden silent-symbol receiver, key clock counts invisible/rejected events",
  sourceSelectedKey:"literal original grid row-major bytes, modulo36 projection; no key phase search",
  declaredWeakAssumption:"no original author instruction selects mod36 or this receiver",
  decoder:"sims/lp2_alt36_silent_exact_latent_viterbi_sft.cjs known-key Viterbi, beam400, maxHidden3, same donor",
  positive:{source:"genuine held-out Gibran native-GP register",sourceRunesIncludingSpace:450,
    printedRunes:Cpos.length,hiddenSymbols:E.length-Cpos.length,
    actualLastKeyIndex:clock-1,
    trueKeyScore:positive.score,wrongPhase53Score:negative.score,
    trueKeyLCS:posRecovery,wrongPhase53LCS:negRecovery,
    exactKeyClockRecovered:positive.lastClock===clock-1,
    visiblePreview:positive.preview},
  original:outputs,
  conclusion:"No original coherent GP-native plaintext under the frozen grid/mod36 silent-output receiver."
};
process.stdout.write(JSON.stringify(report,null,2)+"\n");
