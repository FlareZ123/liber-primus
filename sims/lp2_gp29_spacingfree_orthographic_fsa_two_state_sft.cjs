"use strict";
/**
 * Exact finite-state source-native GP29 spelling admissibility without printed spaces.
 * An exploratory receiver, NOT evidence that the unknown text uses this cipher.
 *   node sims/lp2_gp29_spacingfree_orthographic_fsa_two_state_sft.cjs
 *   node sims/lp2_gp29_spacingfree_orthographic_fsa_two_state_sft.cjs --all-readouts
 * Node 20+; source-local, no network or third-party libraries.
 */
function experiment(raw, options={}) {
  const gp=JSON.parse(raw.corpus), solved=JSON.parse(raw.solved);
  const M=29, mod=n=>(n%M+M)%M;
  const vowel=new Uint8Array(M);
  [1,3,10,12,18,21,22,24,25,26,27,28].forEach(i=>vowel[i]=1);
  // Rune 21 may be ING or NG; treating it as a vowel is deliberately permissive.
  const spell=gp.translit.slice(); spell[21]="ING"; spell[27]="IO";
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function native(s) {
    const out=[];
    for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]) {
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
      for(let j=0;j<w.length;) {
        const z=w.startsWith("ING",j)?{s:"ING",i:21}:
          w.startsWith("IO",j)?{s:"IO",i:27}:tokens.find(t=>w.startsWith(t.s,j));
        if(!z) throw Error("unmapped native spelling: "+w);
        out.push(z.i); j+=z.s.length;
      }
    }
    return out;
  }
  const bad=new Uint8Array(M*M), forbidden=[];
  for(let a=0;a<M;a++) for(let b=0;b<M;b++) {
    const x=native(spell[a]+spell[b]);
    if(x.length!==2||x[0]!==a||x[1]!==b) {
      bad[a*M+b]=1;forbidden.push(spell[a]+"+"+spell[b]);
    }
  }
  if(forbidden.length!==16) throw Error("canonical forbidden-pair count changed");
  const runeToIndex=new Map(gp.runes.map((r,i)=>[r,i]));
  const sourceWords=raw.lp1Source.slice(
    raw.lp1Source.indexOf("ᚦᛖ-ᛚᚩᛋᛋ"),
    raw.lp1Source.indexOf("\n$\n%\n",raw.lp1Source.indexOf("ᚦᛖ-ᛚᚩᛋᛋ"))
  ).replace(/\/\n%\n/g,"").replace(/\/\n/g,"").replace(/\n/g,"")
   .match(new RegExp("["+gp.runes.join("")+"]+","gu"));
  const nativeSections=raw.lp1Reference.split(/### (\d+)\n/);
  const refWords=[];
  for(let i=1;i<nativeSections.length;i+=2) {
    if(+nativeSections[i]<10||+nativeSections[i]>13) continue;
    refWords.push(...(nativeSections[i+1].replace(/^\[[^\n]*\]$/gm,"").match(/[A-Z]+/g)||[]));
  }
  if(sourceWords.length!==181||refWords.length!==181)throw Error("181 source words changed");
  const exactWords=sourceWords.filter((s,i)=>
    native(refWords[i]).map(j=>gp.runes[j]).join("")===s).length;
  if(exactWords!==181)throw Error("native LP1 spelling replay failed");
  const p57=native(raw.lp1Reference.split("### 57\n")[1]);
  if(p57.length!==95||p57.some((x,i)=>x!==gp.pages[57].indices[i]))
    throw Error("independent p57 source-native replay failed");
  const actualCorpusWords=sourceWords.map(w=>[...w].map(x=>runeToIndex.get(x)));
  const sourceSection=actualCorpusWords.flat();
  function minWords(P,maxLen=24) {
    const n=P.length, inf=32767, d=new Int16Array(n+1);
    d.fill(inf);d[0]=0;
    for(let i=0;i<n;i++) {
      if(d[i]===inf) continue;
      let vowels=0,cr=0,vr=0;
      for(let j=i;j<n&&j<i+maxLen;j++) {
        const x=P[j];
        // Any token that would be merged by greedy spelling must be separated.
        if(j>i&&bad[P[j-1]*M+x])break;
        if(vowel[x]) {vowels++;vr++;cr=0;} else {cr++;vr=0;}
        if(cr>6||vr>8)break;
        const len=j-i+1;
        if((len===1&&(x===10||x===24))||(len>1&&vowels>0))
          d[j+1]=Math.min(d[j+1],d[i]+1);
      }
    }
    return d[n]===inf?null:d[n];
  }
  function encode(P,k0,k1) {
    let prevVowel=0;
    return P.map(p=>{const c=mod(p+(prevVowel?k1:k0));prevVowel=vowel[p];return c;});
  }
  function decode(C,k0,k1) {
    let prevVowel=0;
    return C.map(c=>{const p=mod(c-(prevVowel?k1:k0));prevVowel=vowel[p];return p;});
  }
  function scan(C,fit,truth=null,allReadouts=false) {
    const prefix=[],full=[],readouts=[];
    for(let a=0;a<M;a++)for(let b=0;b<M;b++) {
      const P=decode(C,a,b),s=minWords(P.slice(0,fit));
      if(s===null)continue;
      prefix.push([a,b]);
      const t=minWords(P);
      if(t===null)continue;
      full.push([a,b,t]);
      if(!C.every((x,i)=>x===encode(P,a,b)[i]))throw Error("non-bijective replay");
      if(allReadouts)readouts.push({key:[a,b],minWords:t,runes:P.map(v=>gp.runes[v]).join("")});
    }
    const inKeys=(list,ks)=>ks?list.some(k=>k[0]===ks[0]&&k[1]===ks[1]):null;
    return {runes:C.length,fit,fitKeys:prefix.length,fullKeys:full.length,
      trueInFit:inKeys(prefix,truth),trueInFull:inKeys(full,truth),
      survivors:full,readouts:allReadouts?readouts:undefined};
  }
  const nativeSolved=solved.sections.map(s=>
    [...s.source_text].filter(x=>runeToIndex.has(x)).map(x=>runeToIndex.get(x)));
  const solvedFeasible=nativeSolved.map((a,i)=>
    ({name:solved.sections[i].name,n:a.length,minWords:minWords(a)}));
  const donor=[
    {name:"Shakespeare_A",text:raw.shakespeare,start:6000,key:[5,17]},
    {name:"Gibran_A",text:raw.gibran,start:4000,key:[11,2]},
    {name:"Emerson_A",text:raw.emerson,start:20000,key:[20,24]},
    {name:"Shakespeare_B",text:raw.shakespeare,start:20000,key:[1,14]},
    {name:"Gibran_B",text:raw.gibran,start:30000,key:[22,7]},
    {name:"Emerson_B",text:raw.emerson,start:70000,key:[13,9]}
  ];
  const encoded=new Map();
  function donorSeq(x){if(!encoded.has(x.name.split("_")[0]))encoded.set(
    x.name.split("_")[0],native(x.text));
    const P=encoded.get(x.name.split("_")[0]).slice(x.start,x.start+3008);
    if(P.length!==3008)throw Error("donor window short: "+x.name);
    return P;
  }
  const controls=donor.map(d=>{
    const P=donorSeq(d),C=encode(P,...d.key);
    if(decode(C,...d.key).some((x,i)=>x!==P[i]))throw Error("native plant mismatch");
    return {name:d.name,start:d.start,key:d.key,sourceMinWords:minWords(P),
      ...scan(C,1400,d.key)};
  });
  const wrongFamily=donor.slice(0,3).map(d=>{
    const P=donorSeq(d),C=P.map((p,i)=>mod(p+(i%2?13:7)));
    return {name:d.name+"_alternating_shifts",...scan(C,1400)};
  });
  const original=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
  if(original.length!==3008)throw Error("original section length changed");
  const target=scan(original,1400,null,!!options.allReadouts);
  return {status:"exact FSA/CSP test; no recovered unknown LP2 plaintext",
    grammar:{maxWordLen:24,maxConsonantRunInWord:6,maxVowelRunInWord:8,
      singletonWords:["I","A"],requiresVowelForLongerWords:true,
      forbiddenPairs:forbidden,printingAssumed:false,lexiconAssumed:false,
      ambiguousRune21AllowedAsVowel:true},
    solved:{lp1ExactWords:exactWords,p57ExactRunes:p57.length,
      lp1P10to13Runes:sourceSection.length,lp1MinWords:minWords(sourceSection),
      sections:solvedFeasible},controls,wrongFamily,original:target};
}
if(typeof module!=="undefined")module.exports={experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module) {
  const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
  const read=f=>fs.readFileSync(path.join(root,f),"utf8");
  const raw={corpus:read("resources/liber-primus/lp2-corpus.json"),
    solved:read("resources/external/relikd-solved-gp29-native-v1.json"),
    lp1Source:read("resources/transcriptions/lp1_wulfic_canonical.txt"),
    lp1Reference:read("resources/liber-primus/lp1-plaintext-reference.txt"),
    shakespeare:read("resources/control/shakespeare_first300k.txt"),
    gibran:read("resources/control/gibran_prophet_58585.txt"),
    emerson:read("resources/control/emerson_essays_2944.txt")};
  console.log(JSON.stringify(experiment(raw,
    {allReadouts:process.argv.includes("--all-readouts")}),null,2));
}
