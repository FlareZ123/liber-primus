'use strict';
const fs=require('node:fs');const path=require('node:path');
function experiment(c,raw,reference){
 const q=29,mod=x=>(x%q+q)%q;const cipher=[...raw.split("%").slice(1,3).join("%")].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x));
 const eng=reference.split("### 3")[1].split("### 4")[0].replaceAll("ILLUSIONS","ILLUSIANS").replaceAll("WISDOM","WIDSOM").replaceAll("INSTRUCTION","INSTRUCTIAN");
 const words=eng.replace(/[^A-Z]+/g," ").trim().split(/\s+/).map(w=>w.replaceAll("V","U").replaceAll("K","C").replaceAll("ING","NG"));
 const spell=c.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);const plain=[];
 for(const w of words)for(let o=0;o<w.length;){const m=spell.find(x=>w.startsWith(x.token,o));if(!m)throw Error(w);plain.push(m.index);o+=m.token.length}
 const K=[23,10,1,10,9,10,16,26];if(cipher.length!==515||plain.length!==515)throw Error("length");
 const rows=[];let phase=0;for(let i=0;i<515;i++){if(plain[i]===0){if(cipher[i]!==0)throw Error("F");continue}const k=K[phase++%8];const row=Array(q+1).fill(0);row[cipher[i]]++;row[plain[i]]--;row[k]--;rows.push({i,k,row})}
 function solve(input){
  const m=input.map(row=>row.map(mod));let n=0;const piv=[];
  for(let col=0;col<q;col++){const j=m.findIndex((x,i)=>i>=n&&x[col]);if(j<0)continue;[m[n],m[j]]=[m[j],m[n]];
   const inv=Array.from({length:q-1},(_,i)=>i+1).find(i=>mod(i*m[n][col])===1);m[n]=m[n].map(x=>mod(x*inv));
   for(let i=0;i<m.length;i++)if(i!==n&&m[i][col]){const f=m[i][col];m[i]=m[i].map((x,k)=>mod(x-f*m[n][k]))}piv.push(col);n++}
  const inconsistent=m.slice(n).some(x=>x[q]!==0);
  const free=Array.from({length:q},(_,i)=>i).filter(i=>!piv.includes(i)),valid=[];
  if(!inconsistent){if(free.length>3)throw Error("too many free values");
   const x=Array(q).fill(0);
   function visit(j){if(j<free.length){for(let k=0;k<q;k++){x[free[j]]=k;visit(j+1)}return}
    for(let i=n-1;i>=0;i--)x[piv[i]]=mod(m[i][q]-free.reduce((v,k)=>v+m[i][k]*x[k],0));
    if(new Set(x).size===q)valid.push(x.slice());
   }visit(0);
  }return {rank:n,free,valid,inconsistent}
 }
 const train=rows.filter(x=>x.i<100).map(x=>x.row),unit=Array(q+1).fill(0);unit[1]=1;unit[q]=1;
 const unanchored=solve(train),anchored=solve([...train,unit]),whole=solve(rows.map(x=>x.row));
 const check=(x,z)=>z.every(({row})=>mod(x.reduce((n,v,i)=>n+v*row[i],0))===0);
 const pred=unanchored.valid.filter(x=>check(x,rows.filter(x=>x.i>=100)));
 const wrong=train.map(x=>x.slice());wrong[0][plain[rows[0].i]]++;wrong[0][(plain[rows[0].i]+1)%q]--;
 const mutated=solve([...wrong,unit]);if(anchored.valid.length!==1||anchored.valid[0].some((v,i)=>v!==i)||unanchored.valid.length!==28||pred.length!==28)throw Error("identification");
 return {runes:515,trainRunes:100,heldRunes:415,trainConsuming:train.length,rank:unanchored.rank,free:unanchored.free.map(i=>c.translit[i]),unanchoredPermutations:unanchored.valid.length,unanchoredScales:unanchored.valid.map(x=>x[1]).sort((a,b)=>a-b),allMultiplicative:unanchored.valid.every(x=>x.every((v,i)=>v===mod(x[1]*i))),anchoredRank:anchored.rank,anchoredOrder:anchored.valid[0],heldPassing:pred.length,wholeRank:whole.rank,wholePermutations:whole.valid.length,wrongCribPermutations:mutated.valid.length}
}
if(require.main===module){const root=path.join(__dirname,'..','resources');const read=p=>fs.readFileSync(path.join(root,p),'utf8');console.log(JSON.stringify(experiment(JSON.parse(read('liber-primus/lp2-corpus.json')),read('transcriptions/lp1_wulfic_canonical.txt'),read('liber-primus/lp1-plaintext-reference.txt')),null,2));}
module.exports=experiment;
