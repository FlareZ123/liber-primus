#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
function gate(g,c,s){
 const words=s.sections.find(x=>x.name==="p57_parable").source_text.match(/[\u16A0-\u16FF]+/gu).map(w=>({w:[...w].map(x=>c.translit[c.runes.indexOf(x)]).join(""),a:[...w].reduce((z,x)=>z+c.runes.indexOf(x),0)}));const tokens=g.pages.flatMap(x=>x.tokens),configurations=[];
 for(let depth=0;depth<4;depth++){const top=depth,bottom=31-depth,left=depth,right=7-depth;
 for(const [start,rr,cc,cwDir,ccwDir] of [["TL",top,left,0,1],["TR",top,right,1,2],["BR",bottom,right,2,3],["BL",bottom,left,3,0]])for(const [hand,dir] of [[1,cwDir],[-1,ccwDir]]){
 const dirs=[[0,1],[1,0],[0,-1],[-1,0]],seen=new Set(),order=[];let y=rr,x=cc,d=dir;
 const legal=(y,x)=>y>=top&&y<=bottom&&x>=left&&x<=right&&!seen.has(y*8+x);
 for(let i=0;i<(bottom-top+1)*(right-left+1);i++){if(!legal(y,x))throw Error("bad walk");order.push(y*8+x);seen.add(y*8+x);let [dy,dx]=dirs[d];if(!legal(y+dy,x+dx)){d=(d+hand+4)%4;[dy,dx]=dirs[d];}y+=dy;x+=dx;}
 for(const reversed of [false,true])for(const radix of [59,60]){const a=radix===59?g.alphabet.replace("f",""):g.alphabet;const o=reversed?order.slice().reverse():order;const vals=o.map(i=>a.indexOf(tokens[i][0])*radix+a.indexOf(tokens[i][1]));configurations.push({depth,start,hand,reversed,radix,vals,order:o});}
 }}
 const pairs=words.slice(0,-1).map((w,i)=>{const b=words[i+1];const hits=configurations.filter(q=>q.vals[w.a]===b.a).map(({vals,order,...q})=>({...q,cell:order[w.a]}));return {from:w.w,a:w.a,to:b.w,b:b.a,hits}});
 if(configurations.length!==128||pairs.filter(p=>p.hits.length).length!==2||pairs.find(p=>p.from==="MUST").hits.length!==0)throw Error("original result changed");
 return {configurations:configurations.length,pairs};
}
console.log(JSON.stringify(gate(...["resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"].map(read)),null,2));
