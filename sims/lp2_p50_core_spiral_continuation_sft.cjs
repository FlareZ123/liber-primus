#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
function analyze(g,c,s){
 const tokens=g.pages.flatMap(p=>p.tokens),alpha=g.alphabet.replace("f",""),value=t=>alpha.indexOf(t[0])*59+alpha.indexOf(t[1]);
 const words=name=>s.sections.find(x=>x.name===name).source_text.match(/[\u16A0-\u16FF]+/gu).map(w=>({word:[...w].map(x=>c.translit[c.runes.indexOf(x)]).join(""),addr:[...w].reduce((a,x)=>a+c.runes.indexOf(x),0)}));
 const p57=words("p57_parable"),p56=words("p56_an_end");
 function spiral(row,col,dir,hand){
 const dirs=[[0,1],[1,0],[0,-1],[-1,0]],seen=new Set(),order=[];
 const legal=(r,c)=>r>=2&&r<=29&&c>=2&&c<=5&&!seen.has(r*8+c);
 for(let i=0;i<112;i++){if(!legal(row,col))throw Error("bad walk");order.push(row*8+col);seen.add(row*8+col);let [dr,dc]=dirs[dir];if(!legal(row+dr,col+dc)){dir=(dir+hand+4)%4;[dr,dc]=dirs[dir];}row+=dr;col+=dc;}return order;
 }
 const order=spiral(2,5,1,1),rev=spiral(29,2,0,-1),map=order.map(i=>value(tokens[i]));
 function orbit(a){const path=[];while(a<112&&!path.includes(a)){path.push(a);a=map[a];}return {path,end:a,cycle:path.includes(a)?path.slice(path.indexOf(a)):null};}
 const cycles=[...new Set(map.map((_,i)=>{const c=orbit(i).cycle;if(!c)return null;const j=c.indexOf(Math.min(...c));return c.slice(j).concat(c.slice(0,j)).join(",");}).filter(Boolean))];
 const constraints=new Map();for(let i=0;i<p57.length-1;i++){const a=p57[i],b=p57[i+1];if(!constraints.has(a.addr))constraints.set(a.addr,[]);constraints.get(a.addr).push({from:a.word,to:b.word,toAddr:b.addr});}
 const conflicts=[...constraints].filter(([a,edges])=>new Set(edges.map(x=>x.toAddr)).size>1);
 const inventory=[55,64].map(v=>({value:v,locations:tokens.flatMap((t,i)=>value(t)===v?[{cell:i,token:t,row:Math.floor(i/8),col:i%8,depth:Math.min(Math.floor(i/8),31-Math.floor(i/8),i%8,7-i%8)}]:[])}));
 const pm=rev.map(i=>value(tokens[i]));const result={trace:[25,51].map(a=>({addr:a,cell:order[a],token:tokens[order[a]],next:map[a]})),p57:p57.map(w=>({...w,...orbit(w.addr)})),p56:p56.map(w=>({...w,...orbit(w.addr)})),cycles,cycleBasin:map.flatMap((_,i)=>orbit(i).cycle?.includes(25)?[i]:[]),conflicts,inventory,transferredP15:{WE:pm[25],MUST:pm[51],adjacent:p57.slice(0,-1).filter((w,i)=>pm[w.addr]===p57[i+1].addr).length}};
 if(result.trace[0].cell!==221||result.trace[1].cell!==66||map[25]!==51||map[51]!==25||inventory.some(x=>x.locations.some(y=>y.depth>=2))||result.cycleBasin.join()!=="25,51,76,111"||result.transferredP15.adjacent!==0||conflicts.length!==2)throw Error("source assertions failed");return result;
}
console.log(JSON.stringify(analyze(...["resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"].map(read)),null,2));
