'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/base60-grid.json'),'utf8'));
const signed=fs.readFileSync(path.join(ROOT,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const bytes=grid.byte_rows.flat();
const mod=x=>((x%MOD)+MOD)%MOD;
const inv=x=>{for(let i=1;i<MOD;i++)if(mod(x*i)===1)return i;throw new Error('no inverse');};
const mul=(x,y,r=3,t=8)=>[mod(x[0]*y[0]+t*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+r*x[1]*y[1])];
const evaluate=(coeff,r=3,t=8)=>{
  let a=[0,0],p=[1,0];
  for(const c of coeff){a=[mod(a[0]+c*p[0]),mod(a[1]+c*p[1])];p=mul(p,[0,1],r,t);}
  return a;
};
const divide=(num,den)=>{
  const w=num.map(mod),q=Array(w.length-den.length+1).fill(0),li=inv(den.at(-1));
  for(let i=w.length-1;i>=den.length-1;i--){const v=mod(w[i]*li),o=i-den.length+1;q[o]=v;for(let j=0;j<den.length;j++)w[o+j]=mod(w[o+j]-v*den[j]);}
  return {q,r:w.slice(0,den.length-1)};
};
const span=(page,start,length)=>{
  const pr=ink.pages.find(p=>p.page===page);assert(pr);
  const s=(pr.red_spans||[]).find(x=>x.start===start&&x.length===length);assert(s);
  return [...s.runes].map(r=>{const v=runeIndex.get(r);assert.notEqual(v,undefined);return v;});
};
const words=signed.split('-----BEGIN PGP SIGNATURE-----')[0].match(/\b[A-Za-z]+\b/g)
  .filter(w=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(w)).map(w=>w.toUpperCase());
assert.equal(words.length,43);

const p3=span(3,119,3),p15b=span(15,9,11),p57=span(57,0,7);
const p57p=p57.concat(Array(p15b.length-p57.length).fill(0));
const diff=p15b.map((v,i)=>mod(v-p57p[i]));
const d=divide(diff,p3);assert.deepEqual(d.r,[0,0]);
const EQ=evaluate(d.q);assert.deepEqual(EQ,[17,24]);

const primitiveState=new Map([[0,'F'],[2,'K'],[5,'g'],[6,'a'],[8,'A'],[15,'b'],[19,'B'],[23,'p']]);
const label=v=>primitiveState.get(v)||null;
const downstream=(pair)=>pair.map(i=>mod(bytes[i]));

const printed=[];
for(const pr of ink.pages){
  for(const s of pr.red_spans||[]){
    const raw=[...s.runes].map(r=>runeIndex.get(r));
    const E=evaluate(raw),qout=mul(EQ,E),p50=downstream(qout);
    printed.push({
      page:pr.page,start:s.start,length:s.length,
      residue:E,qOutput:qout,qWords:qout.map(i=>words[i]),
      p50Bytes:qout.map(i=>bytes[i]),p50Mod29:p50,p50PrimitiveLabels:p50.map(label),
    });
  }
}
assert.equal(printed.length,18);

const exactFG=printed.filter(x=>x.p50Mod29[0]===0&&x.p50Mod29[1]===5);
const exactFb=printed.filter(x=>x.p50Mod29[0]===0&&x.p50Mod29[1]===15);
const primitivePairs=printed.filter(x=>x.p50PrimitiveLabels.every(Boolean));

const presentations=[];
let presentationCount=0;
for(const pr of ink.pages){
  for(const s of pr.red_spans||[]){
    const source=[...s.runes].map(r=>runeIndex.get(r));
    for(const reversed of [false,true]){
      const oriented=reversed?source.slice().reverse():source;
      for(let rotation=0;rotation<oriented.length;rotation++){
        presentationCount++;
        const raw=oriented.slice(rotation).concat(oriented.slice(0,rotation));
        const qout=mul(EQ,evaluate(raw)),p50=downstream(qout);
        if((p50[0]===0&&p50[1]===5)||(p50[0]===0&&p50[1]===15)){
          presentations.push({page:pr.page,start:s.start,length:s.length,reversed,rotation,qout,qWords:qout.map(i=>words[i]),p50Mod29:p50});
        }
      }
    }
  }
}
assert.equal(presentationCount,450);

const typedNames=[
  ['p15-first',15,0,9],
  ['p54',54,0,9],
  ['p56',56,0,5],
];
const typed=typedNames.map(([name,page,start,length])=>{
  const raw=span(page,start,length),qout=mul(EQ,evaluate(raw)),p50=downstream(qout);
  return {name,page,start,length,qout,qWords:qout.map(i=>words[i]),p50Bytes:qout.map(i=>bytes[i]),p50Mod29:p50,p50PrimitiveLabels:p50.map(label)};
});
assert.deepEqual(typed.map(x=>[x.name,x.qout,x.p50Mod29]),[
  ['p15-first',[23,8],[0,5]],
  ['p54',[0,20],[0,15]],
  ['p56',[1,2],[28,22]],
]);

const result={
  schema:'lp2-p3-q-p50-downstream-census-v1',
  classification:'complete original-red-span census of frozen Q output consumed as canonical p50 addresses; no plaintext scoring',
  Q:EQ,
  typed,
  printed,
  controls:{
    printedSpanCount:printed.length,
    exactFG:exactFG.map(x=>({page:x.page,start:x.start,length:x.length,qOutput:x.qOutput,qWords:x.qWords})),
    exactFb:exactFb.map(x=>({page:x.page,start:x.start,length:x.length,qOutput:x.qOutput,qWords:x.qWords})),
    primitivePairHits:primitivePairs.map(x=>({page:x.page,start:x.start,length:x.length,p50Mod29:x.p50Mod29,labels:x.p50PrimitiveLabels,qWords:x.qWords})),
    chargedPresentations:presentationCount,
    fgOrFbPresentationHits:presentations,
  },
  interpretation:'The previously typed p15-first and p54 Q outputs become [F,g] and [F,b] after canonical p50 lookup and reduction mod29. The census reports every printed red span and every orientation/rotation hit so these state labels are not treated as free evidence. P56 is recorded separately as [-1,p-1], outside the primitive-field predicate.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
