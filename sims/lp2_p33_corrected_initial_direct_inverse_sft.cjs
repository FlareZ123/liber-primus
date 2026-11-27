"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(c,g,ref){
 const t=g.rows.flat().map(v=>[...v].reduce((n,ch)=>n*60+g.alphabet.indexOf(ch),0));
 const mod=x=>(x%29+29)%29;
 const native=ref.split(/^### /m).slice(1).filter(s=>!/^(56|57|73|74)\b/.test(s)).map(s=>s.split("\n").slice(1).filter(l=>!/^\s*\[|^\s*#|^\s*\(continued/i.test(l)).join("\n")).join("\n");
 const dict=Object.fromEntries(c.translit.map((s,i)=>[s.toUpperCase(),i]));dict.ING=dict.NG;dict.IO=dict.IA;const tokens=Object.keys(dict).sort((a,b)=>b.length-a.length);
 function tokenize(t){const out=[];for(let word of t.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<word.length;){const s=tokens.find(k=>word.startsWith(k,i));if(!s){i++;continue}out.push(dict[s]);i+=s.length}}return out}
 const train=tokenize(native),one=new Float64Array(29),two=new Float64Array(29**2),three=new Float64Array(29**3);for(let i=0;i<train.length;i++){one[train[i]]++;if(i>0)two[train[i-1]*29+train[i]]++;if(i>1)three[(train[i-2]*29+train[i-1])*29+train[i]]++}
 function score(seq){let s=0;for(let i=2;i<seq.length;i++){const a=seq[i-2],b=seq[i-1],d=seq[i],u=(one[d]+.5)/(train.length+14.5),p=(two[b*29+d]+8*u)/(one[b]+8),q=(three[(a*29+b)*29+d]+8*p)/(two[a*29+b]+8);s+=Math.log(q)}return s/(seq.length-2)}
 const p=c.pages[33].indices,bodies=[p.slice(10,91),p.slice(99)];
 if(p[0]!==23||p[91]!==21||bodies[0].length!==81||bodies[1].length!==115)throw Error("source");
 const keys=bodies.map((body,i)=>{let x=c.prime[p[i===0?0:91]];return Array.from({length:body.length},()=>{const k=x%29;x=t[x];return k})});
 const dh=[];let x=19;for(let i=0;i<22;i++){dh.push(x);x=x*5%23}dh.push(0);
 const dhkey=Array.from({length:115},(_,i)=>dh[i%23]),render=a=>a.map(i=>c.translit[i]).join(" ");
 function encode(plain,key,sign,hold){let j=0;return plain.map(v=>hold&&v===0?0:mod(v+sign*key[j++]))}
 function trial(cipher,key,sign,hold){let states=[{j:0,p:[]}];for(const v of cipher){const next=[];for(const s of states){if(hold&&v===0)next.push({j:s.j,p:[...s.p,0]});const a=mod(v-sign*key[s.j]);if(!hold||a!==0)next.push({j:s.j+1,p:[...s.p,a]})}states=next;if(!states.length)break}for(const s of states){const re=encode(s.p,key,sign,hold);if(re.some((v,i)=>v!==cipher[i]))throw Error("replay")}return states.map(s=>({score:score(s.p),p:s.p,text:render(s.p)})).sort((a,b)=>b.score-a.score)}
 const specs=[["D-seed p50",bodies[0],keys[0]],["NG-seed p50",bodies[1],keys[1]],["corrected DH19",bodies[1],dhkey]];
 const rows=[];for(const [name,body,key] of specs)for(const sign of [-1,1])for(const hold of [false,true]){const a=trial(body,key,sign,hold);rows.push({name,sign,hold,paths:a.length,best:a[0]??null,raw:score(body)})}
 let primes=[];for(let n=2;primes.length<100;n++){if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n)}
 let k=0;const p56=c.pages[56].indices.map((v,i)=>i===56?0:mod(v-primes[k++]+1)),p57=c.pages[57].indices;
 const plants=[];for(const [name,body,key] of specs)for(const [page,control] of [[56,p56],[57,p57]])for(const sign of [-1,1])for(const hold of [false,true]){
  const plain=control.slice(0,Math.min(key.length,control.length)),enc=encode(plain,key,sign,hold),a=trial(enc,key,sign,hold);
  const truth=a.findIndex(v=>v.p.every((z,i)=>z===plain[i]));if(truth<0)throw Error("native plant lost");
  plants.push({name,page,sign,hold,length:plain.length,paths:a.length,accuracy:a[0].p.filter((v,i)=>v===plain[i]).length,bestScore:a[0].score,native:score(plain),truthRank:truth+1});
 }
 return {training:train.length,dh,keys:specs.map(([name,body,key])=>({name,key})),rows,plants};
}
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/liber-primus/base60-grid.json")),read("resources/liber-primus/lp1-plaintext-reference.txt")),null,2));
