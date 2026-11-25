'use strict';
const fs = require('node:fs');
const path = require('node:path');
function experiment(grid,corp){
 const check=(ok,msg)=>{if(!ok)throw Error(msg)};
 const alphabet=grid.alphabet.replace("f","");
 const t=grid.pages.flatMap(x=>x.tokens).map(x=>59*alphabet.indexOf(x[0])+alphabet.indexOf(x[1]));
 const roots=t.map((v,i)=>v===i?i:-1).filter(x=>x>=0);check(t.length===256&&roots.length===1,"tree dimensions");
 const root=roots[0],children=Array.from({length:256},()=>[]);
 t.forEach((p,i)=>{if(i!==root)children[p].push(i)});
 const leaves=children.map((x,i)=>x.length?null:i).filter(x=>x!==null);
 const p57=corp.pages[57].indices;check(leaves.length===p57.length,"leaf count");
 const labels=new Map(leaves.map((v,i)=>[v,p57[i]])),codes=[],seen=new Set();
 /** @param {number} v @param {string} bits */
 function visit(v,bits){
  check(!seen.has(v),"cycle");seen.add(v);
  const d=children[v].length;
  if(!d){codes.push({node:v,label:labels.get(v),bits});return}
  const k=Math.floor(Math.log2(d)),short=2**(k+1)-d;
  children[v].forEach((w,i)=>visit(w,bits+(d===1?"":i<short?i.toString(2).padStart(k,"0"):(i+short).toString(2).padStart(k+1,"0"))));
 }
 visit(root,"");check(seen.size===256,"connected graph");
 const byCode=new Map(codes.map(x=>[x.bits,x])),byNode=new Map(codes.map(x=>[x.node,x]));
 check(byCode.size===codes.length&&codes.every(x=>codes.every(y=>x===y||!y.bits.startsWith(x.bits))),"prefix free");
 const byLabel=Array.from({length:29},(_,l)=>codes.filter(x=>x.label===l).sort((a,b)=>a.bits.length-b.bits.length||a.node-b.node));
 const encode=p=>p.map(l=>byLabel[l][0]?.bits??null);
 /** @param {string} bits */
 function decode(bits){let buf="",out=[],nodes=[];for(const b of bits){buf+=b;const x=byCode.get(buf);if(x){out.push(x.label);nodes.push(x.node);buf=""}}check(nodes.map(v=>byNode.get(v).bits).join("")+buf===bits,"bit replay");return {out,nodes,trailing:buf}}
 const primes=[];for(let i=2;primes.length<85;i++)if(primes.every(p=>p*p>i||i%p))primes.push(i);
 const c56=corp.pages[56].indices;let k=0;
 const p56=c56.map((v,i)=>i===56?v:(v-primes[k++]+29001)%29);
 check(k===84&&p56[56]===0&&p56.filter(x=>x===0).length===1,"p56 F clock");
 k=0;check(p56.every((x,i)=>(x===0?0:(x+primes[k++]-1)%29)===c56[i]),"p56 forward replay");
 const render=p=>p.map(x=>corp.translit[x]).join("");
 check(render(p56)==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","p56 reference");
 const control=encode(p57);check(control.every(x=>x!==null),"control representable");
 const controlBits=control.join(""),decodedCtrl=decode(controlBits);
 check(decodedCtrl.trailing===""&&JSON.stringify(decodedCtrl.out)===JSON.stringify(p57),"p57 positive");
 const lengths=codes.map(x=>x.bits.length).sort((a,b)=>a-b);
 const freq=Array(29).fill(0);p56.forEach(x=>freq[x]++);
 const minArbitraryLabels=freq.sort((a,b)=>b-a).reduce((s,f,i)=>s+f*lengths[i],0);
 const tests=[];
 for(const page of [55,56]){
  const p=corp.pages[page].indices;
  for(const [transport,bits] of [["fixed-five-bit",p.map(x=>x.toString(2).padStart(5,"0")).join("")],["base29-integer",p.reduce((s,x)=>29n*s+BigInt(x),0n).toString(2)]]){
   const d=decode(bits);tests.push({page,transport,bits:bits.length,decoded:d.out.length,trailing:d.trailing,render:render(d.out),distinct: new Set(d.out).size,exactBitReplay:true});
  }
 }
 return {root,leaves:leaves.length,codeLengths:lengths.reduce((m,l)=>(m[l]=(m[l]||0)+1,m),{}),kraft:lengths.reduce((s,l)=>s+2**(-l),0),meanLength:lengths.reduce((s,l)=>s+l,0)/lengths.length,missingLabels:byLabel.map((x,i)=>x.length?null:corp.translit[i]).filter(x=>x!==null),p56Missing:p56.filter(x=>!byLabel[x].length).map(x=>corp.translit[x]),p56MinBitsRepresentableSubset:p56.reduce((s,x)=>s+(byLabel[x][0]?.bits.length??0),0),p56MinArbitraryLabels:minArbitraryLabels,p56Native:render(p56),p57ControlBits:controlBits.length,p57Exact:true,tests};
}
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus',name),'utf8'));
console.log(JSON.stringify(experiment(read('lp2-grid-256.json'),read('lp2-corpus.json')),null,2));
