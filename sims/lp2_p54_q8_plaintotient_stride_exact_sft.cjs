// Exact q8 plaintext-totient advance decomposes into two independent q4 rings.
const fs=require('node:fs');
function experiment(g,f,raw){
 const sym="0123456789abcdefghijklmnopqrs",names=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],prime=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];const rune=new Map(names.map((n,i)=>[n,sym[i]]));rune.set("ING","l");const lex=new Set(f.added.split(" "));
 function spell(s,i,w){if(i===s.length){lex.add(w);return;}for(let n=1;n<=3&&i+n<=s.length;n++){let z=rune.get(s.slice(i,i+n));if(z!==undefined)spell(s,i+n,w+z);}}
 for(let l of raw.split("\n")){let m=l.match(/^([a-z]+)\s+(\d+)$/);if(m)spell(m[1].toUpperCase().replace(/QU/g,"CW").replace(/[VKQZ]/g,c=>({V:"U",K:"C",Q:"C",Z:"S"}[c])),0,"");}
 if(lex.size!==38938)throw Error("lex size");
 const by=Array.from({length:40},()=>[]);for(let w of lex)if(w.length<40)by[w.length].push(w);
 const C=g.p54.body_groups.slice(0,-1),H=[g.p54.body_groups.at(-1)+g.p55.groups[0],...g.p55.groups.slice(1)];if(C.length!==47||H.length!==17||C.join("").length!==213||H.join("").length!==86)throw Error("profile");
 const ids=C.map((w,i)=>w.length>=8&&!w.includes("0")?i:-1).filter(i=>i>=0);if(ids.join(",")!=="0,13,16,34,37,45")throw Error("anchors");
 const norm=s=>Array.from({length:4},(_,i)=>s.slice(i)+s.slice(0,i)).sort()[0],pairnorm=(a,b)=>[norm(a),norm(b)].sort().join(":");
 const step=p=>(prime[p]-1)/2;
 function enc(w,k,j){let c="";for(let ch of w){let p=sym.indexOf(ch);if(!p){c+="0";continue;}c+=sym[(p+sym.indexOf(k[j]))%29];j=(j+step(p))%4;}return c;}
 function dec(c,k){let out=new Set();function go(i,j,p){if(i===c.length){out.add(p);return;}let x=sym.indexOf(c[i]);if(x===0)go(i+1,j,p+"0");let y=(x-sym.indexOf(k[j])+29)%29;if(y!==0)go(i+1,(j+step(y))%4,p+sym[y]);}for(let j=0;j<4;j++)go(0,j,"");return [...out];}
 function anchorKeySet(c){let opts=new Set();for(let w of by[c.length]){if(w.includes("0"))continue;let k=Array(4).fill(-1),j=0,ok=true;for(let h=0;h<c.length;h++){let p=sym.indexOf(w[h]),x=sym.indexOf(c[h]),v=(x-p+29)%29;if(k[j]!==-1&&k[j]!==v){ok=false;break;}k[j]=v;j=(j+step(p))%4;}if(ok)opts.add(k.map(x=>x<0?"_":sym[x]).join(""));}let keys=new Set();function fill(k){let j=k.indexOf("_");if(j===-1){keys.add(norm(k));return;}for(let ch of sym)fill(k.slice(0,j)+ch+k.slice(j+1));}for(let k of opts)fill(k);return {opts:[...opts].sort(),keys};}
 const pop=x=>x.toString(2).replace(/0/g,"").length;
 function recover(c,h,truth=null,heldTruth=null,truthKeys=null){
  let masks=new Map(),anchors=[];
  for(let [i,id] of ids.entries()){let r=anchorKeySet(c[id]);for(let k of r.keys)masks.set(k,(masks.get(k)||0)|(1<<i));anchors.push({id,partialKeys:r.opts,completeKeyCount:r.keys.size});}
  let mset=[0,...new Set(masks.values())],maxOne=Math.max(...mset.map(pop)),maxTwo=0;for(let x of mset)for(let y of mset)maxTwo=Math.max(maxTwo,pop(x|y));
  let pairs=[],fit=[],candidateCap=false,unanchoredPartner=false;const list=[...masks.entries()];
  if(maxTwo>=3){
    if(maxOne>=3)unanchoredPartner=true; // exact necessary bound still valid; full two-key enumeration not claimed here
    for(let i=0;i<list.length;i++)for(let j=i;j<list.length;j++){let [k,m]=list[i],[l,n]=list[j];if(pop(m|n)<3)continue;if(pairs.length>=100000){candidateCap=true;break;}pairs.push([k,l]);}
  }
  if(!candidateCap)for(let [k,l] of pairs){let d=c.map(w=>[...new Set([...dec(w,k),...dec(w,l)])]),cnt=d.filter(w=>w.some(x=>lex.has(x))).length;if(cnt<44)continue;let hd=h.map(w=>[...new Set([...dec(w,k),...dec(w,l)])]);fit.push({key:pairnorm(k,l),support:cnt,held:hd.filter(w=>w.some(x=>lex.has(x))).length,trainTruth:truth?d.filter((w,i)=>w.includes(truth[i])).length:null,heldTruth:heldTruth?hd.filter((w,i)=>w.includes(heldTruth[i])).length:null,trainWords:d.map(w=>w.filter(x=>lex.has(x))),heldWords:hd.map(w=>w.filter(x=>lex.has(x)))});}
  return {anchors,anchorSupportedKeys:masks.size,maxOne,maxTwo,pairCount:pairs.length,unanchoredPartner,candidateCap,fitCount:fit.length,fits:fit,truthKeys:truthKeys?pairnorm(...truthKeys):null,truePairRecovered:truthKeys?fit.some(x=>x.key===pairnorm(...truthKeys)&&x.trainTruth===47&&x.heldTruth===17):null};
 }
 const rng=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};let controls=[];
 for(let t=0;t<2;t++){let rand=rng(0x781a12c0+t),truth=f.plants[t].truth.split(" ").slice(0,47),ht=[by[11][rand()%by[11].length],...f.plants[t].truth.split(" ").slice(49)],keys=Array.from({length:2},()=>Array.from({length:4},()=>sym[rand()%29]).join(""));if(norm(keys[0])===norm(keys[1]))throw Error("duplicate key");
  let omitted=ids.slice(t===0?0:3,t===0?3:6),good=ids.filter(i=>!omitted.includes(i)),cc=[];
  for(let j=0;j<47;j++){let w=truth[j],anchor=ids.includes(j),bad=omitted.includes(j),which=good.includes(j)?(good.indexOf(j)<2?0:1):rand()%2;if(w.length!==C[j].length)throw Error("control width");let done=false;for(let n=0;n<100000&&!done;n++){if(bad)w=Array.from({length:C[j].length},()=>sym[1+rand()%28]).join("");else if(n>0||!lex.has(w)||(anchor&&w.includes("0")))w=by[C[j].length][rand()%by[C[j].length].length];if(anchor&&w.includes("0"))continue;let x=enc(w,keys[which],rand()%4);if(anchor&&x.includes("0"))continue;if(bad&&keys.some(k=>dec(x,k).some(y=>lex.has(y))))continue;truth[j]=w;cc.push(x);done=true;}if(!done)throw Error("plant");}
  let hh=ht.map(w=>enc(w,keys[rand()%2],rand()%4));let r=recover(cc,hh,truth,ht,keys);r.omitted=omitted;r.exactForwardReplay=cc.every((x,i)=>keys.some(k=>Array.from({length:4},(_,j)=>enc(truth[i],k,j)).includes(x)))&&hh.every((x,i)=>keys.some(k=>Array.from({length:4},(_,j)=>enc(ht[i],k,j)).includes(x)));controls.push(r);}
 let controlPass=controls.every(r=>r.truePairRecovered&&r.exactForwardReplay&&!r.candidateCap);
 return {schema:"lp2-p54-q8-plaintext-totient-stride-20261127",lexicon:lex.size,anchorIds:ids,controlPass,controls,original:controlPass?recover(C,H):null};
}
const read=p=>fs.readFileSync(p,'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-page-groups-54-55-derived.json")),JSON.parse(read("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json")),read("resources/control/english_wordfreq_textblob.txt")),null,2));
