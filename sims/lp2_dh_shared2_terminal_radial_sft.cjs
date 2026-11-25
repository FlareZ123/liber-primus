"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
/** @param {any} grid @param {any} corpus */
function run(grid, corpus) {
  const check=(x,msg)=>{if(!x)throw Error(msg)};
  const mod=x=>(x%29+29)%29;
  const tokens=grid.pages.flatMap(p=>p.tokens);
  check(tokens.length===256,"grid");
  const rings=[];
  for(let d=0;d<4;d++){
    const cells=[];
    for(let c=d;c<=7-d;c++)cells.push(d*8+c);
    for(let row=d+1;row<=31-d;row++)cells.push(row*8+7-d);
    for(let c=6-d;c>=d;c--)cells.push((31-d)*8+c);
    for(let row=30-d;row>d;row--)cells.push(row*8+d);
    const root=23*8+7-d, j=cells.indexOf(root);
    check(j>=0,"radial origin");
    const ring=cells.slice(j).concat(cells.slice(0,j));
    check(ring[1]===root+8,"clockwise down");
    rings.push(ring);
  }
  const cells=rings.flat(), seq=cells.map(i=>tokens[i]);
  check(rings.map(x=>x.length).join(",")==="76,68,60,52","shell lengths");
  check(new Set(cells).size===256,"permutation");
  check(rings[2][0]===189&&rings[2][15]===186,"DH path");
  check(rings[2][5]===229&&tokens[229]==="00","DH g exit");
  const primes=[];
  for(let n=2;primes.length<84;n++){let prime=true;for(let i=2;i*i<=n;i++)if(n%i===0){prime=false;break}if(prime)primes.push(n)}
  const p56=corpus.pages.find(p=>p.page===56).indices, p57=corpus.pages.find(p=>p.page===57).indices;
  check(p56.length===85&&p57.length===95&&p56[56]===0,"source lengths");
  let j=0;
  const clear56=p56.map((x,i)=>i===56?0:mod(x-primes[j++]+1));
  check(j===84&&clear56.filter(x=>x===0).length===1,"native hold");
  const knownString=clear56.map(x=>corpus.translit[x]).join("");
  check(knownString==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","known p56: "+knownString);
  j=0;check(clear56.every((x,i)=>(x===0?0:mod(x+primes[j++]-1))===p56[i]),"exact p56 replay");
  const plain=clear56.concat(p57), cipher=p56.concat(p57), codes=seq.slice(76);
  const labels=plain.map((x,i)=>mod(cipher[i]-x));
  /**
   * @param {string[]} code
   * @param {number[]} y
   * @param {number} [start]
   */
  function histogram(code, y, start=0) {
    const map=new Map(), witnesses=[];
    for(let i=0;i<code.length;i++){
      const k=code[i], v=y[i];
      if(!map.has(k))map.set(k,new Map());
      const h=map.get(k);
      if(!h.has(v)&&h.size&&witnesses.length<4){
        const [v0,d0]=h.entries().next().value;
        witnesses.push({token:k,first:{index:d0.index,cell:cells[76+d0.index],label:v0},second:{index:i+start,cell:cells[76+i+start],label:v}});
      }
      const prior=h.get(v);h.set(v,{n:(prior?.n??0)+1,index:prior?.index??i+start});
    }
    const max=[...map.values()].reduce((a,h)=>a+Math.max(...[...h.values()].map(v=>v.n)),0);
    return {map, summary:{distinct:map.size,ceiling:max,contradictions:code.length-max,conflicted:[...map.values()].filter(h=>h.size>1).length,witnesses}};
  }
  /** @param {number[]} y */
  function evaluate(y){
    const train=histogram(codes.slice(0,85),y.slice(0,85));
    const all=histogram(codes,y);
    let ambiguous=0, unseen=0, hit=0, miss=0;
    for(let i=85;i<180;i++){
      const h=train.map.get(codes[i]);
      if(!h){unseen++;continue}
      if(h.size!==1){ambiguous++;continue}
      if(h.has(y[i]))hit++;else miss++;
    }
    const eligibleRim=seq.slice(0,76).filter(k=>all.map.get(k)?.size===1).length;
    return {train:train.summary,heldout:{hit,miss,ambiguous,unseen},all:all.summary,eligibleRim};
  }
  const table=new Map([...new Set(tokens)].map((k,i)=>[k,mod(7*i+3)]));
  const plantCipher=plain.map((x,i)=>mod(x+table.get(codes[i])));
  const plant=evaluate(plantCipher.map((x,i)=>mod(x-plain[i])));
  const recovered=plantCipher.map((x,i)=>mod(x-table.get(codes[i])));
  check(recovered.every((v,i)=>v===plain[i])&&plant.all.contradictions===0&&plant.heldout.miss===0,"plant");
  return {roots:rings.map(x=>x[0]),lengths:rings.map(x=>x.length),dhPath:rings[2].slice(0,16),knownString,direct:evaluate(plain),additive:evaluate(labels),plant:{...plant,recovered:recovered.length}};
}
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-grid-256.json"),read("resources/liber-primus/lp2-corpus.json")),null,2));
