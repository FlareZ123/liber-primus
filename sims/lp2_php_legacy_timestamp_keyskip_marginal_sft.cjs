"use strict";
const fs=require("node:fs"),path=require("node:path");
const {LegacyPhpMt}=require("./php_legacy_mt.cjs");
const {marginal,plant}=require("./lp2_keyskip1_rejection_marginal_sft.cjs");
const paths=["resources/liber-primus/lp2-corpus.json","im-results/lp2-r18-skipcount-feasibility-output.json","resources/control/shakespeare_first300k.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw,group="control",start=0,end=Infinity){
 const gp=JSON.parse(raw[0]),prior=JSON.parse(raw[1]),solved=JSON.parse(raw[3]),C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),N=C.length;
 if(N!==12956||C.slice(1).filter((x,i)=>x===C[i]).length!==86)throw Error("corpus");
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let j=0;j<w.length;){let q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native");a.push(q.i);j+=q.t.length;}}return a}
 const p57=solved.sections.find(x=>x.name==="p57_parable").source_text;
 const p57r=[...p57].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0);
 if(native("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE").join(",")!==p57r.join(","))throw Error("p57 spelling control");
 const P=native(raw[2]);if(P.length!==217106)throw Error("donor size");
 function key(seed){const g=new LegacyPhpMt(seed);return Uint8Array.from({length:N+801},()=>g.bounded(0,28))}
 const a=new LegacyPhpMt(3301);const vector=Array.from({length:12},()=>a.next31());
 if(vector.join(",")!=="1405942902,1597094570,984984073,940074847,1460650220,1544539323,1037946300,1178146517,1755252058,1247128299,881740015,2146658823")throw Error("legacy vector");
 const candidates=[...new Map(prior.rows.map(x=>[x.seed>>>0,{rank:x.rank,seed:x.seed,seed32:x.seed>>>0}])).values()];
 const threshold=Math.log(candidates.length/.05),nulls=prior.nulls.filter(x=>!candidates.some(y=>y.seed32===(x.seed>>>0))).map(x=>x.seed>>>0);
 function uniform(seed){let x=seed>>>0;return Array.from({length:N},()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return Math.floor((x>>>0)*29/4294967296)})}
 function control(i,kind){const seed=0x50485000+i,K=key(seed),plain=kind==="native"?P.slice(i*N,(i+1)*N):uniform(seed^0xabcdef01);if(plain.length!==N)throw Error("plant size");const E=plant(plain,K,seed^0x12345678);return {seed,kind,skips:E.skips,maxSkips:E.maxSkips,repeats:E.C.slice(1).filter((x,i)=>x===E.C[i]).length,...marginal(E.C,K)}}
 let rows;
 if(group==="control")rows=Array.from({length:16},(_,i)=>i).slice(start,end).flatMap(i=>["native","uniform"].map(k=>control(i,k)));
 else if(group==="candidate")rows=candidates.slice(start,end).map(x=>({...x,...marginal(C,key(x.seed32))}));
 else if(group==="null"){const E=plant(P.slice(0,N),key(0x50485000),0x50485000^0x12345678);rows=nulls.slice(start,end).map(seed=>({seed,original:marginal(C,key(seed)),plant:marginal(E.C,key(seed))}));}
 else throw Error("group");
 return {group,start,end,candidates:candidates.length,nulls:nulls.length,threshold,N,rows};
}
if(require.main===module){const [group="control",start="0",end="500"]=process.argv.slice(2);console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),group,+start,+end),null,2));}
module.exports={experiment};
