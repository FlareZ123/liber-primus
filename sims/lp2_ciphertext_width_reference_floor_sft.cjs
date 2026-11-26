'use strict';
const fs=require('node:fs');
const paths=['resources/liber-primus/lp2-corpus.json','resources/external/relikd-solved-gp29-native-v1.json','resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt','resources/control/emerson_essays_2944.txt'];
function floor(raw){
 const gp=JSON.parse(raw[0]),native=JSON.parse(raw[1]),rmap=new Map(gp.runes.map((x,i)=>[x,i])),by=new Map(gp.translit.map((x,i)=>[x,i]));
 let u=new Float64Array(29).fill(.5),b=new Float64Array(841);
 for(const s of native.sections){let p=[...s.source_text].filter(x=>rmap.has(x)).map(x=>rmap.get(x));for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*29+p[i]]++;}}
 let sum=u.reduce((s,v)=>s+v,0);u=u.map(x=>x/sum);
 for(let i=0;i<29;i++){let n=10;for(let j=0;j<29;j++)n+=b[i*29+j];for(let j=0;j<29;j++)b[i*29+j]=Math.log((b[i*29+j]+10*u[j])/n);}u=u.map(Math.log);
 function gpWord(s){s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');let p=[];while(s.length){const x=by.has(s.slice(0,2))?s.slice(0,2):s[0];if(!by.has(x))return [];p.push(by.get(x));s=s.slice(x.length);}return p;}
 return raw.slice(2).map((s,d)=>{if(d===0){let k=s.toUpperCase().indexOf('ALMUSTAFA');if(k>=0)s=s.slice(k);}let e=s.indexOf('*** END OF');if(e>=0)s=s.slice(0,e);const p=(s.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);let pre=new Float64Array(p.length);for(let i=1;i<p.length;i++)pre[i]=pre[i-1]+b[p[i-1]*29+p[i]];let floor=Infinity,at=-1,pass8=0,pass13=0;for(let i=0;i+223<=p.length;i++){let x=u[p[i]]+pre[i+222]-pre[i];if(x<floor){floor=x;at=i;}if(x<=-919.4862382176467)pass8++;if(x<=-877.0544605993189)pass13++;}return {path:paths[d+2],length:p.length,windows:p.length-222,floor,at,pass8,pass13};});
}
module.exports={floor,paths};
if(require.main===module)console.log(JSON.stringify(floor(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
