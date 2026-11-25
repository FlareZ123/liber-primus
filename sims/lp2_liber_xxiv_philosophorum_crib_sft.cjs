// Exact source crib and p55 fixed-key gate. Run from repository root with Node.
const fs=require("node:fs");
function attack(source){
const alphabet=Array.from("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"),names=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],mod=x=>(x%29+29)%29;
const decode=s=>Array.from(s).map(c=>alphabet.indexOf(c)).filter(x=>x>=0);
const pages=source.trim().split(/\n%\n/).map(decode),target=pages.slice(0,-2).flat();
if(pages.length!==57||target.length!==12956||pages[54].length!==76) throw Error("Unexpected source geometry");
const definitions=[
["II Latin","Deus est sphaera infinita cuius centrum est ubique circumferentia nusquam"],
["XVIII Latin quot","Deus est sphaera cuius tot sunt circumferentiae quot puncta"],
["XVIII Latin quod","Deus est sphaera cuius tot sunt circumferentiae quod puncta"],
["II English literal rendering","God is an infinite sphere whose centre is everywhere and circumference nowhere"],
["XVIII English literal rendering","God is a sphere with as many circumferences as points"]
];
function wordVariants(word){
const s=word.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
const out=[];function go(i,p){if(i===s.length){out.push(p);return;}for(let n=1;n<=2;n++){const x=names.indexOf(s.slice(i,i+n));if(x>=0&&i+n<=s.length)go(i+n,p.concat(x));}}go(0,[]);return out;
}
function variants(str){let a=[[]];for(const w of str.split(" "))a=a.flatMap(p=>wordVariants(w).map(x=>p.concat(x)));return [...new Map(a.map(x=>[x.join(","),x])).values()];}
function encode(p,k,hold,sign){let j=0;return p.map(x=>hold&&x===0?0:mod(x+sign*k[j++%k.length]));}
function infer(c,p,o,q,hold,sign){let j=0;const k=Array(q).fill(-1);for(let i=0;i<p.length;i++){const x=p[i],y=c[o+i];if(hold&&x===0){if(y!==0)return null;continue;}const v=mod(sign*(y-x)),ix=j++%q;if(k[ix]!==-1&&k[ix]!==v)return null;k[ix]=v;}return j>=2*q+10?k:null;}
const rows=[],hits=[],controls=[];
for(const [label,plain] of definitions){
const vv=variants(plain);if(!vv.length)throw Error(label);
for(const q of [8,13])for(const hold of [false,true]){
let n=0,eligible=0;for(let vi=0;vi<vv.length;vi++){const p=vv[vi];if(p.filter(x=>!hold||x!==0).length<2*q+10)continue;eligible++;for(let o=0;o+p.length<=target.length;o++){// The negative sign is the same unknown-key family, via k -> -k.
const k=infer(target,p,o,q,hold,1);if(k){n++;hits.push({label,variant:vi,q,hold,o,k,p});}}}
rows.push({label,q,hold,spellings:vv.length,eligible,cribMin:Math.min(...vv.map(p=>p.length)),cribMax:Math.max(...vv.map(p=>p.length)),hits:n});
if(eligible){const p=vv.find(x=>x.filter(y=>!hold||y!==0).length>=2*q+10),k=Array.from({length:q},(_,i)=>(3+7*i+i*i)%29),c=encode(p,k,hold,1),got=infer(c,p,0,q,hold,1);if(!got||got.join()!=k.join())throw Error("crib control");controls.push({label,q,hold,exact:true});}
}
}
function inverse(c,k,hold,sign){let out=[{p:[],j:0}];for(const y of c){let next=[];for(const {p,j} of out){if(hold&&y===0)next.push({p:p.concat(0),j});const x=mod(y-sign*k[j%k.length]);if(!hold||x!==0)next.push({p:p.concat(x),j:j+1});}out=next;}return out.map(x=>x.p);}
function ioc(p){const n=Array(29).fill(0);for(const x of p)n[x]++;return n.reduce((a,x)=>a+x*(x-1),0)/(p.length*(p.length-1));}
const keytests=[];for(const [label,plain] of definitions){const vv=variants(plain);let total=0,best=null;for(let v=0;v<vv.length;v++)for(const hold of [true,false])for(const sign of [1,-1]){const k=vv[v];const ctl=pages[56];const c=encode(ctl,k,hold,sign);if(!inverse(c,k,hold,sign).some(p=>p.join()===ctl.join()))throw Error("inverse control");const sols=inverse(pages[54],k,hold,sign);for(const p of sols){if(encode(p,k,hold,sign).join()!==pages[54].join())throw Error("replay");total++;const score=ioc(p);if(!best||score>best.ioc)best={ioc:score,variant:v,hold,sign,plaintext:p.map(x=>names[x]).join(" ")};}}keytests.push({label,spellings:vv.length,total,best});}
return {definitions,rows,hits,controls,keytests};
}
console.log(JSON.stringify(attack(fs.readFileSync("resources/transcriptions/lp2-image-corrected.txt","utf8")),null,2));
