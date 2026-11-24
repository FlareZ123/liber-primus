/* Agent 9: exact previous-ciphertext-context singleton obstruction. */
const fs=require('node:fs');
const ct=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const tx=fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const rm=new Map(ct.runes.map((r,i)=>[r,i])), pages=tx.split('%');
const source=Array.from({length:58},(_,p)=>p===50?[]:pages[p<50?p:p-1].replace(/[/\s]/g,'').match(/[\u16a0-\u16ff]+/g).map(w=>Array.from(w,r=>rm.get(r))));
for(let p=0;p<58;p++)if(source[p].flat().join()!==ct.pages[p].indices.join())throw Error('page mismatch '+p);
function count(groups){
 const rows=Array.from({length:29},()=>Array(29).fill(0));let n=0;
 for(const words of groups)for(let j=1;j<words.length-1;j++)if(words[j].length===1){rows[words[j-1].at(-1)][words[j][0]]++;n++}
 const sum=r=>r.reduce((a,b)=>a+b,0);
 const errors=Array.from({length:10},(_,i)=>rows.reduce((s,r)=>s+sum(r)-sum(r.slice().sort((a,b)=>b-a).slice(0,i+1)),0));
 const shiftErrors=rows.reduce((s,r)=>s+sum(r)-Math.max(...Array.from({length:29},(_,k)=>[3,10,24].reduce((a,p)=>a+r[(p+k)%29],0))),0);
 return {n,errors,shiftErrors,rows:rows.map((r,s)=>({state:ct.translit[s],distinct:r.filter(Boolean).length,nonzero:r.flatMap((c,i)=>c?[[ct.translit[i],c]]:[])}))};
}
const original=count(source.slice(0,56));
if(original.n!==81||original.errors.slice(0,6).join()!=='49,30,15,6,2,0'||original.shiftErrors!==38)throw Error('original obstruction changed');
console.log(JSON.stringify({original,train:count(source.slice(0,40)),holdout:count(source.slice(40,56))},null,2));
