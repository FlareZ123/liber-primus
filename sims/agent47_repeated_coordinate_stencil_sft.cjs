"use strict";
const fs=require("node:fs");
function experiment(v){const code=v[0].split(/\r?\n/).filter(s=>/^(?:I|II|III):\d+:\d+$|^[05]$/.test(s)),chapters=v.slice(1).map(t=>t.split(/\d+\. /).filter(Boolean).map(s=>s.replace(/[ \n]/g,'')));const groups=new Map();let output="";for(let i=0;i<code.length;i++){const s=code[i];if(s.length===1){output+=s;continue}const [c,l,k]=s.split(":"),x=chapters[c.length-1][+l-1]?.[+k-1];if(x===undefined)throw Error("coordinate");output+=x;if(!groups.has(s))groups.set(s,[]);groups.get(s).push(i)}
 const repeats=[...groups].filter(([s,p])=>p.length>1).map(([coordinate,positions])=>({coordinate,positions,characters:positions.map(i=>output[i])}));
 return {records:code.length,coordinates:code.length-2,distinctCoordinates:groups.size,repeats,output};
}
if(require.main===module){const paths=process.argv.slice(2);if(paths.length!==4)throw Error("Supply archived ASC and three source chapters");console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));}
module.exports=experiment;
