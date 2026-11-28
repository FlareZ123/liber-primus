"use strict";
/** Full-plaintext reconstruction and exact oracle-alignment multiplicity audit. */
const expected="07ed9f331cff07655b775def9ec3e18ee7916cff";
const edits=[
  [
    "path: flag?{p,prev:z.path}:z.path",
    "path:{p,c:newC,j,visible:flag,prev:z.path}"
  ],
  [
    "const z=states[0],P=[];\n    for(let q=z.path;q;q=q.prev)P.push(q.p);\n    P.reverse();",
    "const z=states[0],P=[],full=[],events=[];\n    for(let q=z.path;q;q=q.prev){if(q.visible)P.push(q.p);full.push(q.p);events.push({p:q.p,c:q.c,j:q.j});}\n    P.reverse();full.reverse();events.reverse();"
  ],
  [
    "return {P,score:z.score/C.length,keyLast:z.j,explored,",
    "return {P,full,events,score:z.score/C.length,keyLast:z.j,explored,"
  ],
  [
    "printed:C.length,truth,K,WK,C,actualLastKeyIndex:printed.at(-1).j,",
    "printed:C.length,truth,K,WK,C,A,P,actualLastKeyIndex:printed.at(-1).j,"
  ],
  [
    "rows.push({source:s.source,seed:s.seed,printed:s.printed,",
    "const A=s.A.slice(0,s.A.findIndex(x=>x.j===s.actualLastKeyIndex)+1), truthFull=A.map(x=>x.p);\n    let ways=new Map([[-1,1n]]), priorJ=-1;\n    for(const x of A){\n      const nxt=new Map(), cs=x.c<29?[x.c]:[29,30,31,32,33,34,35];\n      for(const c of cs){\n        const p=mod(c-s.K[x.j]);if(p>29)continue;\n        for(const [prev,num] of ways){\n          if(c===prev)continue;\n          let ok=true;for(let j=priorJ+1;j<x.j;j++)if(mod(p+s.K[j])!==prev){ok=false;break;}\n          if(ok)nxt.set(c,(nxt.get(c)||0n)+num);\n        }\n      }\n      ways=nxt;priorJ=x.j;\n    }\n    const total=[...ways.values()].reduce((a,b)=>a+b,0n);\n    if(total<1n)throw Error(\"truth alignment impossible\");\n    const log2Big=n=>{const bits=n.toString(2).length,shift=Math.max(0,bits-52);return Math.log2(Number(n>>BigInt(shift)))+shift;};\n    const replay=right.full?strict(right.full,s.K):[];\n    rows.push({source:s.source,seed:s.seed,printed:s.printed,fullTruthLength:truthFull.length,fullDecodedLength:right.full?.length,fullRecovery:right.full?lcs(right.full,truthFull)/Math.max(right.full.length,truthFull.length):0,wrongFullRecovery:wrong.full?lcs(wrong.full,truthFull)/Math.max(wrong.full.length,truthFull.length):0,fullExact:JSON.stringify(right.full)===JSON.stringify(truthFull),oracleExactMultiplicity:total.toString(),oracleExactLog2:log2Big(total),fullReplay:JSON.stringify(replay.map(x=>[x.p,x.c,x.j]))===JSON.stringify((right.events||[]).map(x=>[x.p,x.c,x.j]))&&JSON.stringify(replay.filter(x=>x.c<29).map(x=>x.c))===JSON.stringify(s.C),fullDecoded:right.full,fullTruth:truthFull,fullText:right.full?.map(p=>p===SPACE?' ':gp.translit[p]).join(''),fullTruthText:truthFull.map(p=>p===SPACE?' ':gp.translit[p]).join(''),"
  ]
];
/** @param {string} source @returns {Function} */
function instrument(source){for(const [a,b] of edits){if(source.split(a).length!==2)throw Error("edit anchor failed: "+a.slice(0,100));source=source.replace(a,b);}return new Function(source+"\nreturn experiment;")();}
if(typeof module!=="undefined")module.exports={instrument};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");const src=read("sims/lp2_alt36_silent_exact_latent_viterbi_sft.cjs");const digest=crypto.createHash("sha1").update("blob "+Buffer.byteLength(src)+"\0").update(src).digest("hex");if(digest!==expected)throw Error("upstream source drift: "+digest);const raw={gp:read("resources/liber-primus/lp2-corpus.json"),shakespeare:read("resources/control/shakespeare_first300k.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt")};console.log(JSON.stringify(instrument(src)(raw,{beam:400,plants:6,crossAuthor:true}),null,2));}
