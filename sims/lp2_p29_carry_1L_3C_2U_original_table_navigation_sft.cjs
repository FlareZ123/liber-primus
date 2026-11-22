"use strict";
/**
 * Original-input source-navigation hypothesis: p29/G carry -> p50 cell187 1L
 * -> independently selected p27 table cell186 -> base59 root189 3C
 * -> three clockwise on 2-shed perimeter -> original cell213 2U
 * -> two up to cell197 1t, which FAILS fixed uppercase direction grammar.
 *
 * Important: prior p27's TRUE base59 186-root path does NOT contain197.
 * 197 is on its distinct base60 path, which instead ends at cell0.
 * All direction semantics are conjectural; this is a bounded original
 * source-text readout and one failed continuation, no LP2 plaintext.
 * Node22 CommonJS, no external dependencies, read only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=path.resolve(__dirname,"..");
const json=p=>JSON.parse(fs.readFileSync(path.join(base,p),"utf8"));
const gp=json("resources/liber-primus/lp2-corpus.json");
const canonical=json("resources/liber-primus/base60-grid.json");
const derived=json("resources/liber-primus/lp2-grid-256.json");
const tokens=canonical.rows.flat();
const alpha60=canonical.alphabet,alpha59=alpha60.replace("f","");
const mod=(x,n)=>((x%n)+n)%n;
const decode=(token,alphabet)=>alphabet.indexOf(token[0])*alphabet.length+alphabet.indexOf(token[1]);
const cell=(r,c)=>r*8+c;
const coords=i=>[Math.floor(i/8),i%8];
assert.equal(tokens.length,256);
assert.equal(canonical.rows.length,32);
assert.equal(alpha60.length,60);assert.equal(alpha59.length,59);
assert(tokens.every(t=>t.length===2&&[...t].every(c=>alpha59.includes(c))));
assert.deepEqual(tokens.map(t=>decode(t,alpha60)),derived.bytes);
const P=gp.pages.find(p=>p.page===29).indices;
const G=[15,5,27],work=P.slice(),quotient=[];
for(let i=0;i<P.length-2;i++){
 // Inverse of source G's leading coefficient 15 mod841 is 785.
 const v=mod(work[i]*785,841);quotient.push(v);
 for(let j=0;j<3;j++)work[i+j]=mod(work[i+j]-v*G[j],841);
}
const rem841=work.slice(-2);
assert.deepEqual(rem841,[377,551]);
const raw=rem841.map(v=>v/29);
assert.deepEqual(raw,[13,19]);
const dh=[mod(raw[0]-raw[1],29),mod(raw[0]+raw[1],29)];
assert.deepEqual(dh,[23,3]);
const start=cell(dh[0],dh[1]);
assert.equal(start,187);
assert.equal(tokens[start],"1L");
const oneLeft=cell(23,2);
assert.equal(oneLeft,start-1);
assert.equal(tokens[oneLeft],"0J");
assert.equal(decode(tokens[oneLeft],alpha59),19);
assert.equal(decode(tokens[oneLeft],alpha60),19);
/** @param {string} alphabet @param {number} start @param {number} hops */
function traverse(alphabet,start,hops){
 const out=[start];let i=start;
 for(let hop=0;hop<hops;hop++){i=decode(tokens[i],alphabet);out.push(i);}
 return out;
}
// Independently established, pre-existing 2014? original p27-derived paths.
const p27Base59=traverse(alpha59,186,8);
const p27Base60=traverse(alpha60,186,8);
assert.deepEqual(p27Base59,[186,19,33,112,72,161,214,247,189]);
assert.deepEqual(p27Base60,[186,19,33,114,197,115,247,192,0]);
assert.equal(tokens[189],"3C");
assert.equal(decode(tokens[189],alpha59),189);
assert.deepEqual(coords(189),[23,5]);
const bottom=29,right=5;
assert(23+3<=bottom);
const clockwise3=cell(23+3,right);
assert.equal(clockwise3,213);
assert.deepEqual(coords(clockwise3),[26,5]);
assert.equal(tokens[clockwise3],"2U");
const twoUp=cell(26-2,right);
assert.equal(twoUp,197);
assert.equal(tokens[twoUp],"1t");
const syntax=/^[0-4][LRUDC]$/;
assert(syntax.test(tokens[187]));
assert(syntax.test(tokens[189]));
assert(syntax.test(tokens[213]));
assert(!syntax.test(tokens[197]));
const candidates=tokens.flatMap((v,i)=>syntax.test(v)?[i]:[]);
const ring=i=>{
 const [r,c]=coords(i);
 return ((r===2||r===29)&&c>=2&&c<=5)||((c===2||c===5)&&r>=2&&r<=29);
};
const ringCandidates=candidates.filter(ring);
assert.equal(candidates.length,30);
assert.equal(ringCandidates.length,8);
assert.equal(tokens.filter(t=>t==="2U").length,3);
assert.equal(ringCandidates.filter(i=>tokens[i]==="2U").length,1);
assert.equal(tokens.filter(t=>t==="1L").length,2);
assert.equal(tokens.filter(t=>t==="3C").length,4);
// Positive control: directions are applied as fixed geometry, never discovered
// from neighboring values. The original chosen last token stops the route.
console.log(JSON.stringify({
 status:"PASS",
 classification:"Original-source candidate navigation: exact 1L->0J link and prospective 3C->2U hit; fixed 2U continuation stops at 1t; no plaintext.",
 p29:{sourceRunes:277,G,rem841,rawCarry:raw,H2:dh},
 table:{sourceRows:32,cols:8,firstCell:187,firstToken:tokens[187],oneLeft:186,leftToken:tokens[186],
  p27Base59,p27Base60,ringRoot189:tokens[189],
  clockwise3:213,token213:tokens[213],twoUp:197,token197:tokens[197],grammarPass197:false},
 conditionalContext:{directionSyntaxCount:candidates.length,ringDirectionSyntaxCount:ringCandidates.length,
   twoUWholeTable:3,twoUOnRing:1,
   warning:"The direction grammar was recognized after 1L and 3C, the p29 coordinate was postselected, and the prior p27 base59 path excludes197; do not quote 1/60 as global authorial probability."}
},null,2));
