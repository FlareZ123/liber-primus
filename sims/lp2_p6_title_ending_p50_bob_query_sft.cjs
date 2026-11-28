"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),M=x=>((x%29)+29)%29,read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens=grid.pages.flatMap(p=>p.tokens),A59=grid.alphabet.replace("f",""),b59=t=>59*A59.indexOf(t[0])+A59.indexOf(t[1]);
function P(v){assert.equal(v.length,4);const o=[v[0],v[3]],i=[v[1],v[2]],z=[];for(const of of[true,false]){const ps=of?[o,i]:[i,o];for(const lr of[true,false]){const d=ps.map(([a,b])=>M(lr?a-b:b-a)),s=ps.map(([a,b])=>M(a+b));for(const df of[true,false]){const f=df?d:s,t=df?s:d;for(const bounce of[true,false])z.push({outerFirst:of,leftMinusRight:lr,differenceFirst:df,bounce,vector:f.concat(bounce?t.slice().reverse():t)});}}}return z;}
assert.equal(tokens[41],"1O");assert.equal(b59(tokens[41]),83);assert.equal(grid.bytes[41],84);
const p6=corpus.pages[6].indices,w=[p6.slice(71,75),p6.slice(75,76),p6.slice(76,80),p6.slice(80,82)];
const d={lengths:w.map(x=>x.length),first:w.map(x=>x[0]),last:w.map(x=>x.at(-1)),sum:w.map(x=>x.reduce((a,b)=>M(a+b),0)),product:w.map(x=>x.reduce((a,b)=>M(a*b),1))};
const canonical=P(d.last)[0];assert.deepEqual(canonical.vector,[5,2,7,0]);
const K=2,b=15,B=19,a=6,A=8,q=canonical.vector.map(row=>{const index=8*row+K,token=tokens[index];return{row,col:K,index,token,value59:b59(token),mod29:M(b59(token))};});
assert.deepEqual(q,[{row:5,col:2,index:42,token:"0S",value59:28,mod29:28},{row:2,col:2,index:18,token:"0F",value59:15,mod29:15},{row:7,col:2,index:58,token:"2Q",value59:144,mod29:28},{row:0,col:2,index:2,token:"2l",value59:164,mod29:19}]);
const bob=[],alice=[];let tests=0;for(const [descriptor,values] of Object.entries(d))for(const [pi,tr] of P(values).entries())for(let col=0;col<8;col++){tests++;const out=tr.vector.map(row=>M(b59(tokens[8*row+col])));if(out[0]===out[2]&&out[1]===b&&out[3]===B)bob.push({descriptor,pi,col,rows:tr.vector,out});if(out[0]===out[2]&&out[1]===a&&out[3]===A)alice.push({descriptor,pi,col,rows:tr.vector,out});}
assert.equal(tests,640);assert.deepEqual(bob,[{descriptor:"last",pi:0,col:2,rows:[5,2,7,0],out:[28,15,28,19]}]);assert.equal(alice.length,0);
console.log(JSON.stringify({status:"PASS",base59Selector:{cell:41,token:tokens[41],base59:83,base60:grid.bytes[41]},p6LastRuneRows:canonical.vector,kColumnQuery:q,stateReadout:"[-1,b,-1,B]",finiteFamily:{tests,bobHits:bob,aliceHits:alice}},null,2));
