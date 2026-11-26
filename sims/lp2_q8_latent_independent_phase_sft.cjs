'use strict';
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function core(raw) {
 const corpus=JSON.parse(raw[0]), native=JSON.parse(raw[1]), alphabet=corpus.alphabet??["ᚠ","ᚢ","ᚦ","ᚩ","ᚱ","ᚳ","ᚷ","ᚹ","ᚻ","ᚾ","ᛁ","ᛄ","ᛇ","ᛈ","ᛉ","ᛋ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛝ","ᛟ","ᛞ","ᚪ","ᚫ","ᚣ","ᛡ","ᛠ"];
 const latin=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"], by=new Map(latin.map((s,i)=>[s,i]));
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const a=[];for(let i=0;i<s.length;){const t=s.slice(i,i+2);if(by.has(t)){a.push(by.get(t));i+=2;}else{if(!by.has(s[i]))return [];a.push(by.get(s[i++]));}}return a;}
 const dict=new Map();function add(a,w){if(a.length&&a.length<=24){const s=a.join(",");dict.set(s,(dict.get(s)||0)+w);}}
 const donors=raw.slice(3).map((s,i)=>{if(i===0){const k=s.toUpperCase().indexOf("ALMUSTAFA");if(k>=0)s=s.slice(k);}const end=s.indexOf("*** END OF");if(end>=0)s=s.slice(0,end);return (s.match(/[A-Za-z]+/g)||[]).map(gp).filter(a=>a.length);});
 for(const ds of donors){const train=ds.slice(0,Math.floor(ds.length*.8));const w=200000/train.length;for(const a of train)add(a,w);}
 for(const line of raw[2].split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)add(gp(m[1]),0.05*Number(m[2]));}
 for(const rec of native.sections){for(const w of rec.source_text.replace(/\/\s*/gu,"").match(/[\u16A0-\u16FF]+/gu)||[])add([...w].map(c=>alphabet.indexOf(c)).filter(x=>x>=0),1);}
 const total=[...dict.values()].reduce((a,b)=>a+b,0);const trie=[{next:new Map(),term:0,mass:0}];for(const [s,w] of dict){let q=0;const p=.95*w/total;trie[0].mass+=p;for(const k of s.split(",").map(Number)){let t=trie[q].next.get(k);if(t===undefined){t=trie.length;trie[q].next.set(k,t);trie.push({next:new Map(),term:0,mass:0});}q=t;trie[q].mass+=p;}trie[q].term+=p;}
 const keys=[["red8", [19,21,23,27,2,14,10,19]],["red8-prime",[13,21,2,20,5,18,2,13]],["WELCOME",[23,10,1,10,9,10,16,26]]].flatMap(([name,k])=>[[name+"+",k],[name+"-",k.map(x=>(29-x)%29)]]);
 const lse=(x,y)=>x===-Infinity?y:y===-Infinity?x:Math.max(x,y)+Math.log1p(Math.exp(-Math.abs(x-y)));
 function decode(c,key,cut){const n=c.length,m=key.length,fw=Array(n+1).fill(-Infinity),best=fw.slice(),prev=Array(n+1);fw[0]=best[0]=0;let partial=-Infinity;
  function edge(i,j,p,plain,start,fallback){if(!(p>0))return;const lp=Math.log(p/m);fw[j]=lse(fw[j],fw[i]+lp);const b=best[i]+lp;if(b>best[j]){best[j]=b;prev[j]={i,plain:plain.slice(),start,fallback};}}
  for(let i=0;i<n;i++){if(fw[i]===-Infinity)continue;for(let start=0;start<m;start++){
    function visit(j,q,phase,plain){if(j>i){const t=trie[q].term;if(t)edge(i,j,t,plain,start,false);if(j===cut&&i<cut){const rest=trie[q].mass-t;if(rest>1e-18)partial=lse(partial,fw[i]+Math.log(rest/m));}}
     if(j===n||plain.length===24)return;const x=c[j],p=(x-key[phase]+29)%29;const t=trie[q].next.get(p);if(p!==0&&t!==undefined)visit(j+1,t,(phase+1)%m,[...plain,p]);const z=trie[q].next.get(0);if(x===0&&z!==undefined)visit(j+1,z,phase,[...plain,0]);
    }visit(i,0,start,[]);
    const p=(c[i]-key[start]+29)%29;if(p!==0)edge(i,i+1,.05/29,[p],start,true);if(c[i]===0)edge(i,i+1,.05/29,[0],start,true);
  }}
  const prefix=lse(fw[cut],partial),full=fw[n],words=[];for(let j=n;j>0;){const e=prev[j];if(!e)throw Error("no MAP path");words.push(e);j=e.i;}words.reverse();const replay=words.flatMap(e=>encodeWord(e.plain,key,e.start));if(replay.some((x,i)=>x!==c[i])||replay.length!==n)throw Error("replay failed");return {prefix,full,held:(full-prefix)/(n-cut),fit:prefix/cut,map:best[n]/n,words,plain:words.flatMap(e=>e.plain),fallback:words.filter(e=>e.fallback).length};
 }
 function encodeWord(w,k,phase){return w.map(p=>{if(!p)return 0;const c=(p+k[phase])%29;phase=(phase+1)%k.length;return c;});}
 function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
 function assess(c,truth,actual,boundaries,tag){const cut=223;const variants=keys.map(([name,key])=>({name,...decode(c,key,cut)}));variants.sort((a,b)=>b.prefix-a.prefix);const w=variants[0];const ends=new Set(w.words.map(e=>e.i+e.plain.length));const right=boundaries?boundaries.filter(x=>x>cut):[];const pred=[...ends].filter(x=>x>cut);const hit=right.filter(x=>ends.has(x)).length;return {tag,actual,selected:w.name,fit:w.fit,held:w.held,heldAccuracy:truth?truth.slice(cut).filter((x,i)=>x===w.plain[cut+i]).length/(c.length-cut):null,heldBoundaryF1:truth?2*hit/(right.length+pred.length):null,fallback:w.fallback,decoded:w.words.map(e=>e.plain.map(x=>latin[x]).join("")).join(" "),phases:w.words.map(e=>e.start),scores:variants.map(v=>({name:v.name,fit:v.fit,held:v.held}))};}
 const controls=[];for(let d=0;d<donors.length;d++){const a=donors[d];let found;for(let i=Math.floor(a.length*.8);i<a.length;i++){let count=0,j=i;while(j<a.length&&count<299)count+=a[j++].length;if(count===299){found=a.slice(i,j);break;}}if(!found)throw Error("no held-out 299-rune span");const rnd=rng(0x29d800+d),truth=found.flat(),k=keys[2*d][1],bound=[];let n=0;for(const w of found){n+=w.length;bound.push(n);}const c=found.flatMap(w=>encodeWord(w,k,Math.floor(rnd()*8)));controls.push(assess(c,truth,keys[2*d][0],bound,"donor"+d));const pad=truth.map(p=>(p+Math.floor(rnd()*29))%29);controls.push(assess(pad,null,null,null,"pad"+d));}
 const positives=controls.filter(x=>x.actual),neg=controls.filter(x=>!x.actual);const gate=positives.every(x=>x.selected===x.actual&&x.heldAccuracy>=.85&&x.heldBoundaryF1>=.75&&x.held>Math.max(...neg.map(y=>y.held)));
 const p54=corpus.pages.find(p=>p.page===54).indices,p55=corpus.pages.find(p=>p.page===55).indices;if(p54.length!==232||p55.length!==76||p54.slice(1,9).join(",")!==keys[0][1].join(","))throw Error("source geometry/key mismatch");
 const original=gate?assess([...p54.slice(9),...p55],null,null,null,"p54-body+p55"):null;
 return {model:"independent uniform phase at every latent plaintext word; F bypass; canonical GP29; 95% word lexicon plus 5% singleton fallback; six fixed signed keys",dict:dict.size,trie:trie.length,controls,gate,original};
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
