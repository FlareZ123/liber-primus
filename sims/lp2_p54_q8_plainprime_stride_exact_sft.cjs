// Exact lexical recovery for q8 with plaintext-prime stride; independent initial phases; literal F holds.
const fs=require('node:fs');
function experiment(g,f,raw) {
 const sym="0123456789abcdefghijklmnopqrs",names=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],prime=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
 const rune=new Map(names.map((n,i)=>[n,sym[i]]));rune.set("ING","l");
 const lex=new Set(f.added.split(" "));
 function spell(s,i,w){if(i===s.length){lex.add(w);return;}for(let n=1;n<=3&&i+n<=s.length;n++){let z=rune.get(s.slice(i,i+n));if(z!==undefined)spell(s,i+n,w+z);}}
 for(let l of raw.split("\n")){let m=l.match(/^([a-z]+)\s+(\d+)$/);if(m)spell(m[1].toUpperCase().replace(/QU/g,"CW").replace(/[VKQZ]/g,c=>({V:"U",K:"C",Q:"C",Z:"S"}[c])),0,"");}
 if(lex.size!==38938)throw Error("lex size "+lex.size);
 const by=Array.from({length:40},()=>[]);for(let w of lex)if(w.length<40)by[w.length].push(w);
 const C=g.p54.body_groups.slice(0,-1),H=[g.p54.body_groups.at(-1)+g.p55.groups[0],...g.p55.groups.slice(1)];
 if(C.length!==47||H.length!==17||C.join("").length!==213||H.join("").length!==86)throw Error("profile");
 const ids=C.map((w,i)=>w.length>=8&&!w.includes("0")?i:-1).filter(i=>i>=0);
 if(ids.join(",")!=="0,13,16,34,37,45")throw Error("anchors");
 const rot=(s,i)=>s.slice(i)+s.slice(0,i);
 const norm=s=>Array.from({length:8},(_,i)=>rot(s,i)).sort()[0];
 const primitive=s=>[1,2,4].every(i=>rot(s,i)!==s);
 function optionSet(c){let st=new Set();for(let w of by[c.length]){let k=Array(8).fill(-1),j=0,ok=true;for(let i=0;i<c.length;i++){let p=sym.indexOf(w[i]),x=sym.indexOf(c[i]);if(p===0){if(x!==0){ok=false;break;}}else{let v=(x-p+29)%29;if(k[j]!==-1&&k[j]!==v){ok=false;break;}k[j]=v;j=(j+prime[p])%8;}}if(ok)st.add(k.map(x=>x<0?"_":sym[x]).join(""));}return [...st];}
 function merge(a,b){let s="";for(let i=0;i<8;i++){if(a[i]!=="_"&&b[i]!=="_"&&a[i]!==b[i])return null;s+=a[i]==="_"?b[i]:a[i];}return s;}
 function compatible(a,b){for(let i=0;i<8;i++)if(a[i]!=="_"&&b[i]!=="_"&&a[i]!==b[i])return false;return true;}
 function enc(p,k,j){let c="";for(let ch of p){let x=sym.indexOf(ch);if(x===0){c+="0";continue;}c+=sym[(x+sym.indexOf(k[j]))%29];j=(j+prime[x])%8;}return c;}
 function dec(c,k){let out=new Set();function go(i,j,p){if(i===c.length){out.add(p);return;}let x=sym.indexOf(c[i]);if(x===0)go(i+1,j,p+"0");let y=(x-sym.indexOf(k[j])+29)%29;if(y!==0)go(i+1,(j+prime[y])%8,p+sym[y]);}for(let j=0;j<8;j++)go(0,j,"");return [...out].sort();}
 const rng=(seed)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 function recover(c,h,truth=null,heldTruth=null,trueKey=null) {
  let anchor=ids.map(i=>optionSet(c[i])),all=anchor.map(a=>[...new Set(a.flatMap(k=>Array.from({length:8},(_,i)=>rot(k,i))))]);
  let seen=new Set(),partial=new Set(),keys=new Set(),fits=[],hist={},trials=0,joins=0,nodes=0,cap=false,maxNodes=1000000;
  function passAnchors(k){let n=0;for(let a of all)if(a.some(b=>compatible(k,b)))n++;return n>=3;}
  function check(k){if(!primitive(k))return;k=norm(k);if(keys.has(k))return;keys.add(k);let support=0,words=[];for(let w of c){let d=dec(w,k).filter(x=>lex.has(x));words.push(d);if(d.length)support++;}hist[support]=(hist[support]||0)+1;if(support>=44){let hold=h.map(w=>dec(w,k).filter(x=>lex.has(x)));fits.push({key:k,support,held:hold.filter(w=>w.length).length,trainWords:words,heldWords:hold,trainTruth:truth?c.filter((w,i)=>dec(w,k).includes(truth[i])).length:null,heldTruth:heldTruth?h.filter((w,i)=>dec(w,k).includes(heldTruth[i])).length:null});}}
  function fill(k){if(cap)return;k=norm(k);if(seen.has(k))return;seen.add(k);if(++nodes>maxNodes){cap=true;return;}if(!passAnchors(k))return;if(!k.includes("_")){check(k);return;}let j=k.indexOf("_");for(let ch of sym)fill(k.slice(0,j)+ch+k.slice(j+1));}
  for(let i=0;i<6&&!cap;i++)for(let j=i+1;j<6&&!cap;j++)for(let a of anchor[i])for(let b of all[j]){trials++;let k=merge(a,b);if(k===null)continue;joins++;k=norm(k);if(partial.has(k))continue;partial.add(k);fill(k);}
  return {anchorOptions:anchor.map(a=>a.length),pairTrials:trials,consistentPairJoins:joins,distinctPartial:partial.size,completionNodes:nodes,cap,distinctCompleteKeys:keys.size,supportHistogram:hist,fitCount:fits.length,trueKey:trueKey?norm(trueKey):null,trueKeyRetained:trueKey?fits.some(x=>x.key===norm(trueKey)):null,fits};
 }
 let controls=[];
 for(let t=0;t<2;t++){
  let rand=rng(0xb81a12c0+t),truth=f.plants[t].truth.split(" ").slice(0,47),ht=[by[11][rand()%by[11].length],...f.plants[t].truth.split(" ").slice(49)];
  if(truth.length!==47||ht.length!==17)throw Error("control profile");
  let key=Array.from({length:8},()=>sym[rand()%29]).join("");if(!primitive(key))throw Error("key primitive");
  let omitted=ids.slice(t===0?0:3,t===0?3:6),cc=[];
  for(let j=0;j<47;j++){let w=truth[j],anchor=ids.includes(j),bad=omitted.includes(j);if(w.length!==C[j].length)throw Error("control width "+j);let done=false;for(let n=0;n<100000&&!done;n++){if(bad)w=Array.from({length:C[j].length},()=>sym[1+rand()%28]).join("");else if(n>0||!lex.has(w)||(anchor&&w.includes("0")))w=by[C[j].length][rand()%by[C[j].length].length];if(anchor&&w.includes("0"))continue;let x=enc(w,key,rand()%8);if(anchor&&x.includes("0"))continue;if(bad&&dec(x,key).some(y=>lex.has(y)))continue;truth[j]=w;cc.push(x);done=true;}if(!done)throw Error("plant generation");}
  let hh=ht.map(w=>enc(w,key,rand()%8));let r=recover(cc,hh,truth,ht,key);r.omitted=omitted;r.heldLengths=ht.map(x=>x.length);r.exactForwardReplay=cc.every((x,i)=>Array.from({length:8},(_,j)=>enc(truth[i],key,j)).includes(x))&&hh.every((x,i)=>Array.from({length:8},(_,j)=>enc(ht[i],key,j)).includes(x));controls.push(r);
 }
 let controlPass=controls.every(r=>!r.cap&&r.trueKeyRetained&&r.exactForwardReplay&&r.fits.some(x=>x.key===r.trueKey&&x.trainTruth===47&&x.heldTruth===17));
 let original=controlPass?recover(C,H):null;
 return {schema:"lp2-p54-q8-plaintext-prime-stride-20261127",profile:{training:47,trainRunes:213,held:17,heldRunes:86,anchorIds:ids,lexicon:lex.size,OOV:3},controlPass,controls,original};
}
const read=p=>fs.readFileSync(p,'utf8');
const r=experiment(JSON.parse(read("resources/liber-primus/lp2-page-groups-54-55-derived.json")),JSON.parse(read("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json")),read("resources/control/english_wordfreq_textblob.txt"));
console.log(JSON.stringify(r,null,2));
