"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
function experiment(raw,tex){
const gp=JSON.parse(raw[1]),runes=new Set(gp.runes),label=gp.translit;
const labels=[...label.map((t,i)=>({t,i})),{t:"ING",i:21},{t:"IO",i:27}].sort((a,b)=>b.t.length-a.t.length);
const strip=tex.replace(/%[^\n]*/g,""),patternText=strip.match(/\\patterns\s*\{([^}]+)\}/s)[1],exceptionText=strip.match(/\\hyphenation\s*\{([^}]+)\}/s)[1];
const trie={},ex=new Map();
for(const pat of patternText.trim().split(/\s+/)){let n=trie,weights=[0];for(const c of pat){if(/\d/.test(c))weights[weights.length-1]=+c;else{n=n[c]??={};weights.push(0)}}n.w=weights}
for(const e of exceptionText.trim().split(/\s+/)){let at=0,a=[];for(const c of e){if(c==="-")a.push(at);else at++}ex.set(e.replace(/-/g,""),a)}
function points(word){const w=word.toLowerCase();let pos;if(ex.has(w))pos=ex.get(w);else{const t="."+w+".",v=new Uint8Array(t.length+1);for(let j=0;j<t.length;j++){let n=trie;for(let k=j;k<t.length;k++){n=n[t[k]];if(!n)break;if(n.w)for(let x=0;x<n.w.length;x++)v[j+x]=Math.max(v[j+x],n.w[x])}}pos=Array.from({length:w.length+1},(_,i)=>i).filter(i=>v[i+1]%2===1)}return pos.filter(i=>i>=2&&w.length-i>=3)}
function tokens(w){let n=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),a=[],off=0;while(n){const t=labels.find(x=>n.startsWith(x.t));if(!t)throw Error(n);off+=t.t.length;a.push({i:t.i,end:off});n=n.slice(t.t.length)}return a}
function splitWord(w,ts){const set=new Set(points(w)),a=[];let len=0,blocked=0;for(const t of ts){len++;if(set.has(t.end)){a.push(len);len=0;set.delete(t.end)}}if(len)a.push(len);blocked=set.size;if(a.reduce((s,x)=>s+x,0)!==ts.length)throw Error("rune conservation");return {a,blocked}}
function english(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]}
function aggregate(words){const base=[],split=[];let blocked=0,sw=0;for(const {word,ts} of words){base.push(ts.length);const x=splitWord(word,ts);split.push(...x.a);blocked+=x.blocked;if(x.a.length>1)sw++}return {base,split,blocked,sw}}
function stats(a){const sum=a.reduce((s,x)=>s+x,0),h={};for(const x of a)h[x]=(h[x]||0)+1;return {groups:a.length,runes:sum,mean:sum/a.length,singletons:h[1]||0,short:(h[1]||0)+(h[2]||0),long:a.filter(x=>x>=7).length,max:Math.max(...a),hist:h}}
function capacity(a,R){const total=a.reduce((s,x)=>s+x,0);if(total<R)return null;const starts=new Int32Array(total+1),ones=new Int32Array(total+1),short=new Int32Array(total+1);let p=0;for(const l of a){starts[p+1]++;if(l===1)ones[p+1]++;if(l<=2)short[p+1]++;p+=l}for(let i=1;i<=total;i++){starts[i]+=starts[i-1];ones[i]+=ones[i-1];short[i]+=short[i-1]}let min=Infinity,max=-Infinity,oneMin=Infinity,oneMax=-Infinity,shortMin=Infinity,shortMax=-Infinity,at=0;for(let s=0;s+R<=total;s++){const g=starts[s+R]-starts[s],o=ones[s+R]-ones[s],h=short[s+R]-short[s];if(g<min){min=g;at=s}max=Math.max(max,g);oneMin=Math.min(oneMin,o);oneMax=Math.max(oneMax,o);shortMin=Math.min(shortMin,h);shortMax=Math.max(shortMax,h)}return {windows:total-R+1,min,max,oneMin,oneMax,shortMin,shortMax,at,conservativeMinGroups:Math.max(0,min-1),conservativeMinSingleton:Math.max(0,oneMin-1),conservativeMinShort:Math.max(0,shortMin-1)}}
const source=raw[0].split("%").slice(0,55).join("%"),groups=[];let page=0,start=0,len=0,part=0,clause=[];
function finish(c=""){if(len){groups.push({len,page:start,stop:c==="."});len=0}}
for(const c of source){if(runes.has(c)){if(!len)start=page;len++}else if(c==="%")page++;else if("-.$&§0123456789".includes(c))finish(c)}finish();
const original=stats(groups.map(x=>x.len));if(original.runes!==12956||original.groups!==2896)throw Error("source parity");
const terminal=stats(groups.filter(x=>x.page>=53).map(x=>x.len));
const exact=JSON.parse(raw[2]),ref=raw[3].split("\n").filter(x=>!x.startsWith("#")&&!x.startsWith("[")&&!x.startsWith("(")).join(" ").match(/[A-Z]+/g)||[];
const lex=[...new Set(ref)],freq=new Map();for(const w of ref)freq.set(w,(freq.get(w)||0)+1);
const variants=i=>i===21?["ING","NG"]:i===27?["IO","IA"]:i===5?["C","K","Q"]:i===1?["U","V"]:i===15?["S","Z"]:[label[i]];
function nativeSpell(seq){
const ids=Array.from(seq,c=>gp.runes.indexOf(c)),rx=new RegExp("^"+ids.map(i=>"(?:"+variants(i).join("|")+")").join("")+"$");
let choices=lex.filter(w=>rx.test(w)).sort((a,b)=>(freq.get(b)||0)-(freq.get(a)||0)||a.localeCompare(b));
if(!choices.length)return {word:ids.map(i=>label[i]).join(""),ts:ids.map((i,k)=>({i,end:ids.slice(0,k+1).reduce((s,j)=>s+label[j].length,0)})),matched:false};
const word=choices[0];let pos=0,ts=[];function align(k,p){if(k===ids.length)return p===word.length;for(const v of variants(ids[k]))if(word.startsWith(v,p)){ts.push({i:ids[k],end:p+v.length});if(align(k+1,p+v.length))return true;ts.pop()}return false}if(!align(0,0))throw Error("align");return {word,ts,matched:true,ambiguous:choices.length>1}}
const cache=new Map();const native=exact.sections.flatMap(s=>(s.source_text.match(/\p{Script=Runic}+/gu)||[]).map(seq=>{if(!cache.has(seq))cache.set(seq,nativeSpell(seq));return cache.get(seq)}));
const control=aggregate(native),names=["Gibran","Shakespeare","Emerson"],donors=[];
for(let i=4;i<raw.length;i++){const words=english(raw[i]),a=aggregate(words.map(word=>({word,ts:tokens(word)})));donors.push({name:names[i-4],words:words.length,splitWords:a.sw,blocked:a.blocked,base:stats(a.base),split:stats(a.split),capacityWhole:capacity(a.split,original.runes),capacityTerminal:capacity(a.split,terminal.runes)})}
const nativeStats={words:native.length,matched:native.filter(x=>x.matched).length,ambiguous:native.filter(x=>x.ambiguous).length,splitWords:control.sw,blocked:control.blocked,base:stats(control.base),split:stats(control.split),capacityTerminal:capacity(control.split,terminal.runes)};
const gate=donors.every(x=>original.groups<x.capacityWhole.conservativeMinGroups)&&donors.every(x=>original.singletons<x.capacityWhole.conservativeMinSingleton);
return {patternCount:patternText.trim().split(/\s+/).length,exceptions:ex.size,checks:["associate","table","present","hyphenation","deterministic"].map(w=>({w,breaks:points(w)})),original,terminal,native:nativeStats,donors,capacityGateFails:gate,method:"2-left/3-right Latin positions, retain only exact GP rune-boundary points, all permitted points, no inserted runes; native words matched to normalized solved Latin reference by rune-spelling alternatives, fixed frequency tie-break, unmatched canonical transliteration; conservative window counts deduct one right-edge partial group."};
}
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(paths.map(read),read("resources/external/tex-hyph-en-us-2011.tex")),null,2));
