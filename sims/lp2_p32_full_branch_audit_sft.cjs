"use strict";

const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const trans=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const cells=grid.pages.flatMap(p=>p.tokens),a60=grid.alphabet,a59=a60.replace("f","");
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));

/** @param {string} word @returns {number[]} */
function gp(word){const n=word.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const o=[];for(let i=0;i<n.length;){if(n.startsWith("ING",i)){o.push(21);i+=3;continue;}if(n.startsWith("IO",i)){o.push(27);i+=2;continue;}const t=gpTokens.find(x=>n.startsWith(x.symbol,i));assert.ok(t,"unmapped "+word);o.push(t.value);i+=t.symbol.length;}return o;}
const gp0=word=>gp(word).reduce((a,b)=>a+b,0);
const decode=(token,alphabet)=>alphabet.indexOf(token[0])*alphabet.length+alphabet.indexOf(token[1]);
/** @param {number} radix */
function walk(radix){const a=radix===60?a60:a59,route=[gp0("SEEKS")];let s=route[0];for(let i=0;i<23;i++){assert.ok(s>=0&&s<256);s=decode(cells[s],a);route.push(s);}return route;}
const route59=walk(59),route60=walk(60);
assert.equal(route59.at(-1),144);assert.equal(route59.indexOf(gp0("EMPTY")),-1);
assert.equal(route60.at(-1),32);assert.equal(route60.indexOf(gp0("EMPTY")),7);
assert.deepEqual(route60,[71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,70,169,228,144,125,20,102,32]);

/** @param {string} raw */
function parseFragments(raw){const out=[];let cur=[],start=0,off=0;const flush=()=>{if(cur.length){out.push({index:out.length,start,end:off-1,values:[...cur]});cur=[];}};for(const ch of [...raw]){const v=ri.get(ch);if(v!==undefined){if(!cur.length)start=off;cur.push(v);off++;}else if(ch==="/"||/\s/u.test(ch)){}else flush();}flush();return out;}
const parts=trans.split(/^\s*%\s*$/m),fragments=parseFragments(parts[32]);
assert.equal(fragments.length,22);

const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n");
const words=clear.split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/u.test(x)).map(x=>x.toUpperCase());
assert.equal(words.length,43);
const thePairs=[];for(let i=0;i+1<words.length;i++)if(words[i]==="THE")thePairs.push([i,i+1,words[i+1]]);
assert.deepEqual(thePairs,[[1,2,"PATH"],[7,8,"DEVOTED"],[12,13,"WAY"],[17,18,"MAP"],[22,23,"ROAD"],[28,29,"DIRECTION"]]);

/** @param {number} x @param {number} y */
function H(x,y){return[((x-y)%29+29)%29,(x+y)%29];}
const orientations=[
 ["id",(r,c)=>[r,c],(r,c)=>[r,c]],
 ["rot90",(r,c)=>[c,10-r],(r,c)=>[10-c,r]],
 ["rot180",(r,c)=>[10-r,10-c],(r,c)=>[10-r,10-c]],
 ["rot270",(r,c)=>[10-c,r],(r,c)=>[c,10-r]],
 ["flipH",(r,c)=>[r,10-c],(r,c)=>[r,10-c]],
 ["flipV",(r,c)=>[10-r,c],(r,c)=>[10-r,c]],
 ["diag",(r,c)=>[c,r],(r,c)=>[c,r]],
 ["anti",(r,c)=>[10-c,10-r],(r,c)=>[10-c,10-r]],
];
const dirs=[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
const state=[["p",23],["g",5],["a",6],["b",15],["A",8],["B",19],["K",2],["e",3],["q",4],["-K",27],["g+K",7]];
const fragmentConventions=[
 {name:"zero/include-carry",origin:0,includeCarry:true},
 {name:"one/include-carry",origin:1,includeCarry:true},
 {name:"zero/exclude-carry",origin:0,includeCarry:false},
 {name:"one/exclude-carry",origin:1,includeCarry:false},
];
const routes=[{radix:59,route:route59},{radix:60,route:route60}];
const sides=["left","right"];
const nominalConfigurations=routes.length*fragmentConventions.length*2*sides.length*orientations.length*dirs.length*state.length*thePairs.length;
assert.equal(nominalConfigurations,135168);
const successes=[];
for(const r of routes){
 const emptyStep=r.route.indexOf(gp0("EMPTY"));
 if(r.route.at(-1)!==32||emptyStep<0)continue;
 for(const fc of fragmentConventions){
  const fragmentIndex=emptyStep-fc.origin+(fc.includeCarry?0:1),fragment=fragments[fragmentIndex];
  if(!fragment)continue;
  for(const xOrigin of [0,1]){
   const pos=((gp0("EMPTY")%fragment.values.length)-xOrigin+fragment.values.length)%fragment.values.length;
   if(corpus.translit[fragment.values[pos]]!=="X")continue;
   const xOffset=fragment.start+pos;
   for(const side of sides){
    if(side==="left"&&pos<4)continue;
    if(side==="right"&&pos+4>=fragment.values.length)continue;
    const sourceBlock=side==="left"
      ? [xOffset-4,xOffset-3,xOffset-2,xOffset-1]
      : [xOffset+1,xOffset+2,xOffset+3,xOffset+4];
    for(const [orientation,to,from] of orientations)for(const [dr,dc] of dirs)for(const [field,value] of state){
     const step=((value%11)+11)%11;if(step===0)continue;
     const moved=[];let ok=true;
     for(const offset of [...sourceBlock,xOffset]){
       const row=Math.floor(offset/11),col=offset%11,[or,oc]=to(row,col),nr=or+dr*step,nc=oc+dc*step;
       if(nr<0||nr>=11||nc<0||nc>=11){ok=false;break;}
       const [pr,pc]=from(nr,nc);moved.push(pr*11+pc);
     }
     if(!ok)continue;
     const dest=moved.slice(0,4),destX=moved[4];
     if(!dest.every((v,k)=>v===dest[0]+k))continue;

     let enclosing=null;
     let structuralBoundary=false;
     if(side==="left"){
       if(destX!==dest[0]+4)continue;
       enclosing=fragments.find(f=>dest[0]>=f.start&&dest[3]<=f.end);
       structuralBoundary=fragments.some(f=>f.start===destX);
     }else{
       if(destX!==dest[0]-1)continue;
       enclosing=fragments.find(f=>dest[0]>=f.start&&dest[3]<=f.end);
       structuralBoundary=
         fragments.some(f=>f.end===destX)&&
         fragments.some(f=>f.start===dest[0]);
     }
     if(!enclosing||!structuralBoundary)continue;
     const readout=H(enclosing.values[0],enclosing.values.at(-1));
     for(const pair of thePairs)if(readout[0]===pair[0]&&readout[1]===pair[1]){
       successes.push({radix:r.radix,fragmentConvention:fc.name,fragmentIndex,pos,xOrigin,side,orientation,dr,dc,field,value,step,destStart:dest[0],destX,enclosing:enclosing.index,enclosingLength:enclosing.values.length,readout,thePair:pair});
     }
    }
   }
  }
 }
}
const leftSuccesses=successes.filter(row=>row.side==="left");
const rightSuccesses=successes.filter(row=>row.side==="right");
assert.equal(rightSuccesses.length,0);
assert.equal(leftSuccesses.length,32);
assert.equal(successes.length,32);
const physical=new Map();
for(const row of successes){
 const key=[row.radix,row.fragmentIndex,row.pos,row.side,row.destStart,row.destX,row.enclosing,row.enclosingLength,...row.readout,...row.thePair.slice(0,2)].join("|");
 physical.set(key,row);
}
assert.equal(physical.size,1);
const survivor=[...physical.values()][0];
assert.equal(survivor.radix,60);assert.equal(survivor.fragmentIndex,7);assert.equal(survivor.pos,4);assert.equal(survivor.side,"left");
assert.deepEqual([survivor.destStart,survivor.destX,survivor.enclosing,survivor.enclosingLength],[93,97,15,8]);
assert.deepEqual(survivor.readout,[7,8]);assert.deepEqual(survivor.thePair,[7,8,"DEVOTED"]);
assert.deepEqual([...new Set(successes.map(r=>r.field))].sort(),["-K","g"]);
assert.deepEqual([...new Set(successes.map(r=>r.fragmentConvention))].sort(),["one/exclude-carry","zero/include-carry"]);
assert.equal(new Set(successes.map(r=>r.orientation)).size,8);

// Retained physical branch, inspected only after the full source-to-source gate.
const destValues=corpus.pages.find(p=>p.page===32).indices.slice(93,97);
assert.equal(destValues.map(v=>corpus.translit[v]).join("").toUpperCase(),"BUDS");
assert.equal(gp0("BUDS"),56);assert.equal(gp0("HOME"),48);

// Frozen p50 composite lands at HOME=48.
function literalMove(index,token){const m=token.match(/^([1-9])([NSEWnsew])$/u);if(!m)return null;const delta={N:[-1,0],S:[1,0],E:[0,1],W:[0,-1]}[m[2].toUpperCase()],row=Math.floor(index/8),col=index%8,nr=row+delta[0]*Number(m[1]),nc=col+delta[1]*Number(m[1]);return nr>=0&&nr<32&&nc>=0&&nc<8?nr*8+nc:null;}
function hexCardinalMove(index,token){if(!/^[0-9A-Fa-f]{2}$/u.test(token))return null;const d=String.fromCharCode(parseInt(token,16)).toUpperCase(),delta={N:[-1,0],S:[1,0],E:[0,1],W:[0,-1]}[d];if(!delta)return null;const row=Math.floor(index/8),col=index%8,nr=row+delta[0],nc=col+delta[1];return nr>=0&&nr<32&&nc>=0&&nc<8?nr*8+nc:null;}
assert.equal(literalMove(57,cells[57]),56);assert.equal(cells[57],"1w");assert.equal(cells[56],"4E");assert.equal(hexCardinalMove(56,cells[56]),48);
assert.equal(cells[48],"4D");

// Held-out terminal consequence frozen before source collision lookup:
// retain the same hexadecimal interpretation and compare its numeric value only
// against the authenticated source's distinct lexical same-GP0 collision register.
const terminalHex=parseInt(cells[48],16);assert.equal(terminalHex,77);
const distinct=[...new Set(words)],rows=distinct.map(word=>({word,gp0:gp0(word)}));
const groups=new Map();for(const row of rows){if(!groups.has(row.gp0))groups.set(row.gp0,[]);groups.get(row.gp0).push(row.word);}
const collisionGroups=[...groups].filter(([,ws])=>ws.length>1).map(([address,ws])=>({address,words:ws}));
const terminalGroups=collisionGroups.filter(row=>row.address===terminalHex);
assert.deepEqual(terminalGroups,[{address:77,words:["MEANING","FALSE"]}]);
assert.equal(collisionGroups.length,6);
const meaning=words.indexOf("MEANING"),falseIndex=words.indexOf("FALSE");
assert.deepEqual([meaning,falseIndex],[20,39]);
assert.deepEqual(H(meaning,falseIndex),[10,1]);
const dh={K:2,g:5,a:6};
assert.deepEqual(H(meaning,falseIndex),[dh.K*dh.g,dh.a-dh.g]);

console.log(JSON.stringify({
 status:"PASS",
 classification:"Director #1780 positive familywise audit: the full radix/carry/X-origin/left-right-span/dihedral/eight-direction/DH-distance/THE-occurrence family has 32 representational successes but exactly one physical source-to-source branch. The equally natural four-rune span on the right of X has zero successes. The duplicates are coordinate gauges, two equivalent carry/count descriptions of fragment7, and the genuine modulo11 alias g=5=-K. No destination dictionary label is used for selection. The frozen HOME terminal 4D -> hex77 then selects exactly one of six authenticated distinct-word GP0 collision groups, MEANING/FALSE, whose positions H to [K*g,a-g].",
 family:{nominalConfigurations,representationalSuccesses:successes.length,leftSuccesses:leftSuccesses.length,rightSuccesses:rightSuccesses.length,physicalSuccesses:physical.size,
  radices:{base59:{end:route59.at(-1),emptyStep:route59.indexOf(92)},base60:{end:route60.at(-1),emptyStep:route60.indexOf(92)}},
  survivingFragmentConventions:[...new Set(successes.map(r=>r.fragmentConvention))],
  survivingDistanceLabels:[...new Set(successes.map(r=>r.field))],
  coordinateOrientations:[...new Set(successes.map(r=>r.orientation))],
 },
 physicalSurvivor:{fragment:7,xPosition:4,side:"left",destinationStart:93,destinationX:97,enclosingFragment:15,enclosingLength:8,readout:[7,8],sourceWords:["THE","DEVOTED"]},
 heldOut:{home:48,token:cells[48],hex:terminalHex,collisionGroups:collisionGroups.length,match:terminalGroups[0],positions:[meaning,falseIndex],H:H(meaning,falseIndex),state:["K*g","a-g"]},
},null,2));
