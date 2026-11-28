// Agent49: phase65 exact finite candidate-rank calibration. Node CommonJS.
// Usage: node sims/lp2_phase65_clause_identification_sft.cjs [transcription]
const fs = require("node:fs");
const path = require("node:path");
function test(raw){
  const G=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"], P=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
  const mod=(a,n=29)=>((a%n)+n)%n, sum=a=>a.reduce((s,x)=>s+P[x],0), prime=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;};
  const assert=(x,m)=>{if(!x)throw Error(m);};
  const segments=raw.replace(/\r\n/g,"\n").split("\n\n")[1].split("§")[0].split("$").map(s=>s.split(/[.&]/).map(u=>[...u].map(c=>G.indexOf(c)).filter(x=>x>=0)).filter(u=>u.length)).filter(u=>u.length);
  const ids=[0,1,2,3,4,5,6,16,17],out=[];
  const score=(a,lens)=>{let j=0, ss=lens.map(l=>{const s=sum(a.slice(j,j+l));j+=l;return s;});return {prime:ss.filter(prime).length,odd:ss.filter(s=>s%2).length,sums:ss};};
  const nprime=[];for(let i=2;nprime.length<2000;i++)if(prime(i))nprime.push(i);
  for(const id of ids){
    const us=segments[id],lens=us.map(u=>u.length),c=us.flat();let j=0;
    const lit=new Set(id===1?[48,74,84,132,159,160,250,421,443,465,514]:id===5?[49,58]:id===16?[56]:[]);
    const key=id===1?[23,10,1,10,9,10,16,26]:[0,10,4,0,1,19,0,18,4,18,9,0,18];
    const a=c.map((x,i)=>id===0?28-x:id===3?mod(31-x):[1,5,16].includes(id)?lit.has(i)?x:mod(x-(id===16?nprime[j++]-1:key[j++%key.length])):x);
    const obs=score(a,lens), shift=Array.from({length:29},(_,k)=>score(a.map(x=>mod(x+k)),lens).prime), fshift=Array.from({length:28},(_,k)=>{const z=score(a.map(x=>x===0?0:1+mod(x-1+k,28)),lens);assert(z.sums.every((s,i)=>s%2===obs.sums[i]%2),"parity");return z.prime;});
    const rots=Array.from({length:a.length},(_,k)=>score(a.slice(k).concat(a.slice(0,k)),lens).prime);
    let start=0;const rev=lens.flatMap(n=>{const v=a.slice(start,start+n).reverse();start+=n;return v;});assert(JSON.stringify(score(rev,lens).sums)===JSON.stringify(obs.sums),"reverse");
    const rank=s=>({higher:s.filter(x=>x>obs.prime).length,ties:s.filter(x=>x===obs.prime).length,max:Math.max(...s),total:s.length});
    out.push({id,n:a.length,units:lens.length,obs,shift:rank(shift),fshift:rank(fshift),rotation:rank(rots),raw:score(c,lens).prime,short:lens.filter(x=>x<=40).length,reverseChangesRunes:rev.filter((x,i)=>x!==a[i]).length});
  }
  assert(out.slice(0,7).reduce((s,x)=>s+x.units,0)===88,"unit count");
  assert(JSON.stringify(out[8].obs.sums)===JSON.stringify([449,1259,1031,1229]),"Parable");return out;
}
const filename = process.argv[2] || path.join(__dirname, "../resources/transcriptions/liber_primus_master.txt");
console.log(JSON.stringify(test(fs.readFileSync(filename,"utf8")),null,2));
