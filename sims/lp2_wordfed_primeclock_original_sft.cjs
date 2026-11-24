// Exact original-source word-fed prime clock; node sims/lp2_wordfed_primeclock_original_sft.cjs
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","resources","liber-primus");
const read=n=>fs.readFileSync(path.join(root,n),"utf8");
function experiment(j,s,reference){
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const mod=x=>(x%29+29)%29;
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const parse=s=>(s.replace(/[\/\r\n]/g,"").match(new RegExp("["+j.runes.join("")+"]+","gu"))||[]).map(w=>[...w].map(r=>j.runes.indexOf(r)));
 const parts=s.split("%"),unknown=parse(parts.slice(0,55).join("")),clear=parse(parts[56]);
 assert(unknown.length===2896&&unknown.flat().length===12956&&clear.flat().length===95&&eq(unknown.flat(),j.pages.slice(0,56).flatMap(p=>p.indices))&&eq(clear.flat(),j.pages[57].indices),"canonical source mismatch");
 const primes=[];for(let n=2;primes.length<2000;n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
 const configs=[];for(const weight of ["prime","ordinal"])for(const offset of [0,1])for(const direction of [1,-1])configs.push({weight,offset,direction});
 const render=w=>w.map(x=>j.translit[x]).join("");
 const dict=new Set(reference.match(/[A-Z]+/g));for(const w of clear)dict.add(render(w));
 const out=[];
 for(const c of configs){
 const weights=c.weight==="prime"?j.prime:j.prime.map((_,i)=>i);
 const sum=p=>p.reduce((a,x)=>a+weights[x],0);
 const key=(seed,i)=>mod(primes[Math.max(0,seed-c.offset)+i]-1);
 function encode(w,seed,hold){let i=0;return w.map(x=>hold&&x===0?0:mod(x+key(seed,i++)));}
 function decode(w,seed,hold){let a=[{p:[],i:0}];for(const x of w){let b=[];for(const z of a){if(hold&&x===0)b.push({p:[...z.p,0],i:z.i});const y=mod(x-key(seed,z.i));if(!hold||y!==0)b.push({p:[...z.p,y],i:z.i+1});}a=b;if(!a.length)break;}return a.map(z=>z.p);}
 const words=c.direction===1?unknown:[...unknown].reverse(),ctrl=c.direction===1?clear:[...clear].reverse();
 for(const hold of [true,false])for(let i=0;i<ctrl.length;i++){const seed=i?sum(ctrl[i-1]):2;const enc=encode(ctrl[i],seed,hold);const d=decode(enc,seed,hold);assert(d.some(x=>eq(x,ctrl[i])),"positive lost");assert(d.every(x=>eq(encode(x,seed,hold),enc)),"spurious inverse");}
 function reach(idx){let states=new Set(weights);let steps=0,runes=0,peak=states.size;for(let i=idx+1;i<words.length;i++){let next=new Set;for(const seed of states)for(const p of decode(words[i],seed,true))next.add(sum(p));steps++;runes+=words[i].length;peak=Math.max(peak,next.size);if(!next.size)return {dead:true,steps,runes,peak};states=next;}return {dead:false,steps,runes,peak,states:states.size};}
 const starts=words.map((w,i)=>w.length===1?i:-1).filter(i=>i>=0);
 assert(starts.length===83,"singleton count");
 const rows=starts.map(i=>({i,...reach(i)})),dead=rows.filter(x=>x.dead);
 // Start just after the first genuine singleton, permitting every possible plaintext rune, regardless of the earlier key.
 let states=new Set(weights),forced=[],merge=-1;
 for(let i=starts[0]+1;i<words.length;i++){let next=new Set,poss=new Map;for(const seed of states){const w=decode(words[i],seed,false)[0];assert(eq(encode(w,seed,false),words[i]),"original replay");next.add(sum(w));poss.set(w.join(","),w);}if(poss.size===1){if(merge===-1)merge=i;forced.push({i,w:[...poss.values()][0]});}states=next;}
 const hist=Array(29).fill(0);for(const {w} of forced)for(const x of w)hist[x]++;const n=hist.reduce((a,b)=>a+b,0);const long=forced.filter(({w})=>w.length>=4),matches=long.filter(({w})=>dict.has(render(w)));
 out.push({...c,controls:95,dead:dead.length,total:rows.length,shortest:dead.reduce((a,b)=>a.runes<b.runes?a:b),longestDead:Math.max(...dead.map(x=>x.runes)),firstSingleton:starts[0],firstForced:merge,forced:forced.length,long:long.length,matches:matches.length,ic:hist.reduce((a,b)=>a+b*(b-1),0)/(n*(n-1)),excerpt:forced.slice(0,16).map(({w})=>render(w)).join(" ")});
 }return out;
}
const result=experiment(JSON.parse(read("lp2-corpus.json")),read("lp2-transcription.txt"),read("lp1-plaintext-reference.txt"));
console.log(JSON.stringify(result,null,2));

function localWordExperiment(j,s,reference){
 const parts=s.split("%"),parse=s=>(s.replace(/[\/\r\n]/g,"").match(new RegExp("["+j.runes.join("")+"]+","gu"))||[]).map(w=>[...w].map(r=>j.runes.indexOf(r)));
 const words=parse(parts.slice(0,55).join("")),ctrl=parse(parts[56]);const mod=x=>(x%29+29)%29;
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)},eq=(a,b)=>a.join()===b.join();
 assert(words.length===2896&&eq(words.flat(),j.pages.slice(0,56).flatMap(p=>p.indices))&&eq(ctrl.flat(),j.pages[57].indices),"canonical source mismatch");
 const primes=[];for(let n=2;primes.length<2000;n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
 const render=w=>w.map(x=>j.translit[x]).join(""),dict=new Set(reference.match(/[A-Z]+/g));for(const w of ctrl)dict.add(render(w));
 const out=[];
 for(const type of ["prime","ordinal"])for(const offset of [0,1])for(const hold of [true,false]){
 const wt=type==="prime"?j.prime:j.prime.map((_,i)=>i),sum=w=>w.reduce((a,x)=>a+wt[x],0);
 const key=(seed,i)=>mod(primes[Math.max(0,seed-offset)+i]-1);
 function encode(w,seed){let i=0;return w.map(x=>hold&&x===0?0:mod(x+key(seed,i++)));}
 function decode(w,seed){let a=[{p:[],i:0}];for(const x of w){let b=[];for(const z of a){if(hold&&x===0)b.push({p:[...z.p,0],i:z.i});const y=mod(x-key(seed,z.i));if(!hold||y!==0)b.push({p:[...z.p,y],i:z.i+1});}a=b;if(!a.length)break;}return a.map(z=>z.p);}
 const possible=[];let v=new Set([0]);for(let n=1;n<=14;n++){v=new Set([...v].flatMap(s=>wt.map(x=>s+x)));possible[n]=[...v];}
 function solve(w){let a=[];for(const seed of possible[w.length])for(const p of decode(w,seed))if(sum(p)===seed)a.push(p);return a;}
 const hist={};let empty=0,unique=0,withWord=0,long=0;const empties=[];
 let test=0;for(const w of ctrl){const e=encode(w,sum(w)),a=solve(e);assert(a.some(z=>eq(z,w))&&a.every(z=>eq(encode(z,sum(z)),e)),"self-key positive or replay failed");test+=w.length;}
 for(let i=0;i<words.length;i++){const w=words[i],a=solve(w);hist[a.length]=(hist[a.length]||0)+1;if(!a.length){empty++;if(empties.length<5)empties.push(i);}if(a.length===1)unique++;if(w.length>=4){long++;if(a.some(x=>dict.has(render(x))))withWord++;}}
 let visible=[];for(const source of ["same","previous","next"]){const delta=source==="same"?0:source==="previous"?-1:1;
 const seedAt=(w,i)=>sum(w[i+delta]);
 // For the ciphertext-fed plant, process in dependency order. Same-word C seed is implicit; pick any exact encoding witness if it exists.
 // Previous and next ciphertext word clocks can be generated explicitly using an external boundary seed.
 let positiveWords=0;
 if(delta!==0){let a=Array(ctrl.length),order=Array.from({length:ctrl.length},(_,i)=>delta===-1?i:ctrl.length-1-i);for(const i of order){const at=i+delta;const seed=at>=0&&at<ctrl.length?sum(a[at]):2;a[i]=encode(ctrl[i],seed);assert(decode(a[i],seed).some(z=>eq(z,ctrl[i])),"visible neighbor positive");positiveWords++;}}
 let dead=0,longmatches=0,n=0,h=Array(29).fill(0);for(let i=0;i<words.length;i++){const at=i+delta;if(at<0||at>=words.length)continue;const a=decode(words[i],seedAt(words,i));if(!a.length)dead++;if(a.length===1)for(const x of a[0]){h[x]++;n++;}if(words[i].length>=4&&a.some(x=>dict.has(render(x))))longmatches++;}
 visible.push({source,dead,longmatches,ic:h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)),uniqueRunes:n,positiveWords});
 }
 out.push({type,offset,hold,positive:test,empty,unique,withWord,long,empties,hist,visible});
 }return out;
}
console.log(JSON.stringify(localWordExperiment(JSON.parse(read("lp2-corpus.json")),read("lp2-transcription.txt"),read("lp1-plaintext-reference.txt")),null,2));
