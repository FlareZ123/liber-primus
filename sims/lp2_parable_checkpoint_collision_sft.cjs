"use strict";
// #3145: power/ambiguity of independently delivered Parable checksum.
// This is a known-answer retrospective control, not a new LP2 cipher.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
function experiment(corpus,transcription){
  const index=new Map(corpus.runes.map((x,i)=>[x,i]));
  const groups=transcription.split("%").at(-1).replace(/[\/\s]/gu,"").split(".").slice(0,4)
    .map(s=>s.split("-").map(w=>[...w].map(x=>index.get(x))));
  assert.deepEqual(groups.flat(2),corpus.pages[57].indices);
  const sum=a=>a.reduce((n,i)=>n+corpus.prime[i],0);
  const clauses=groups.slice(1).map(x=>x.flat());
  const sums=clauses.map(sum);
  const target=1595277641; // Original 2013 761.MP3 TXXX label, not fitted.
  const check=s=>s.reduce((n,x)=>n*x,1)===target;
  assert.deepEqual(clauses.map(x=>x.length),[30,30,28]);
  assert.deepEqual(sums,[1259,1031,1229]);assert.equal(check(sums),true);
  let one={total:0,pass:0},two={total:0,pass:0,sameClause:0,crossClause:0};
  const positions=clauses.flatMap((a,c)=>a.map((v,i)=>({c,i,v})));
  for(let i=0;i<positions.length;i++){
    const p=positions[i];
    for(let x=0;x<29;x++)if(x!==p.v){
      const s=sums.slice();s[p.c]+=corpus.prime[x]-corpus.prime[p.v];
      one.total++;if(check(s))one.pass++;
      for(let j=i+1;j<positions.length;j++){
        const q=positions[j];
        for(let y=0;y<29;y++)if(y!==q.v){
          const ss=s.slice();ss[q.c]+=corpus.prime[y]-corpus.prime[q.v];
          two.total++;
          if(check(ss)){two.pass++;if(p.c===q.c)two.sameClause++;else two.crossClause++;}
        }
      }
    }
  }
  assert.deepEqual(one,{total:2464,pass:0});
  assert.deepEqual(two,{total:3001152,pass:10719,sameClause:10467,crossClause:252});
  const orig=groups[3][2],replace=[..."ᚪᚠᚠᛖᚳᛏᛡᚾ"].map(x=>index.get(x)); // AFFECTION
  assert.equal(orig.length,8);assert.equal(replace.length,8);
  assert.equal(sum(orig),376);assert.equal(sum(replace),376);
  assert.equal(orig.filter((x,i)=>x!==replace[i]).length,8);
  const alternate=clauses.map(x=>x.slice());
  const start=groups[3].slice(0,2).flat().length;
  alternate[2].splice(start,orig.length,...replace);
  assert.deepEqual(alternate.map(sum),sums);assert.equal(check(alternate.map(sum)),true);
  return {sourceTarget:target,sums,one,two,wrongLexical:{source:orig.map(i=>corpus.translit[i]),replacement:replace.map(i=>corpus.translit[i]),sameRuneLengths:true,hamming:8,primeSum:376,accepted:true}};
}
if(require.main===module){
  const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
  console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt")),null,2));
}
module.exports=experiment;
