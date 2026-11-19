"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=r=>fs.readFileSync(path.join(root,r),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const unknown=read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const full=read("resources/external/Liber Primus 57.txt");
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));

/** @param {number} b @param {number} e @param {number} m @returns {number} */
function pow(b,e,m){let o=1,x=b%m;while(e){if(e&1)o=o*x%m;x=x*x%m;e=Math.floor(e/2)}return o}
/** @param {string} s @returns {{runes:number[],words:Array<{number:number,start:number,end:number,values:number[]}>}} */
function parse(s){const runes=[],words=[];let cur=[],start=0;const flush=()=>{if(!cur.length)return;words.push({number:words.length+1,start,end:runes.length-1,values:cur.slice()});cur=[]};for(const ch of [...s]){const v=ri.get(ch);if(v!==undefined){if(!cur.length)start=runes.length;runes.push(v);cur.push(v)}else flush()}flush();return{runes,words}}
/** @param {number} p @returns {string} */
function unknownPage(p){assert.notEqual(p,50);return unknown[p<=49?p:p-1]}
/** @param {number} p @returns {string} */
function preservedPage(p){const tag=`%${String(p).padStart(2,"0")}\n`,i=full.indexOf(tag);assert.ok(i>=0);const rest=full.slice(i+tag.length),m=rest.match(/\n%\d\d\n/);return m?rest.slice(0,m.index):rest}
/** @param {string} n @returns {string} */
function plaintext(n){const s=solved.sections.find(x=>x.name===n);assert.ok(s);return s.source_text}
/** @param {number[]} v @returns {string} */
function tr(v){return v.map(x=>corpus.translit[x]).join("")}
/** @param {number[]} v @returns {number[]} */
function forward(v){assert.equal(v.length,6);return[pow(v[0],3,29),...v.slice(1).map(x=>pow(x,27,29))]}
/** @param {number[]} v @returns {number[]} */
function inverse(v){assert.equal(v.length,6);return[pow(v[0],19,29),...v.slice(1).map(x=>pow(x,27,29))]}

for(let x=0;x<29;x++){assert.equal(pow(pow(x,3,29),19,29),x);assert.equal(pow(pow(x,27,29),27,29),x)}

const p28=parse(unknownPage(28)),center=(p28.runes.length-1)/2,w28=p28.words[27];
assert.deepEqual([p28.runes.length,center,w28.number,w28.start,w28.values.length],[269,134,28,135,5]);
const p28src=[p28.runes[center],...w28.values],p28out=forward(p28src);
assert.equal(tr(p28src),"NEAAIUL");assert.equal(tr(p28out),"READOUT");assert.deepEqual(inverse(p28out),p28src);

const exactUnknown=[];let broadUnknown=0;
for(let page=0;page<=55;page++){if(page===50)continue;const p=parse(unknownPage(page));for(const w of p.words)if(w.values.length===5&&w.start>0)broadUnknown++;if(p.runes.length%2===0)continue;const c=(p.runes.length-1)/2,w=p.words.find(q=>q.start===c+1&&q.values.length===5);if(w)exactUnknown.push({page,runeCount:p.runes.length,center:c,word:w.number,start:w.start})}
assert.equal(broadUnknown,314);assert.deepEqual(exactUnknown,[{page:28,runeCount:269,center:134,word:28,start:135}]);

const exactSolved=[],cases=[];
for(const cfg of [{page:56,name:"p56_an_end"},{page:57,name:"p57_parable"}]){
 const cipher=parse(preservedPage(cfg.page)),plain=parse(plaintext(cfg.name));assert.equal(cipher.runes.length,plain.runes.length);
 if(cipher.runes.length%2===1){const c=(cipher.runes.length-1)/2,w=cipher.words.find(q=>q.start===c+1&&q.values.length===5);if(w)exactSolved.push({page:cfg.page,runeCount:cipher.runes.length,center:c,word:w.number})}
 for(const w of cipher.words){if(w.values.length!==5||w.start===0)continue;const src=[cipher.runes[w.start-1],...w.values],out=forward(src),truth=plain.runes.slice(w.start-1,w.end+1);assert.equal(truth.length,6);const matchCount=out.filter((v,i)=>v===truth[i]).length;cases.push({page:cfg.page,word:w.number,start:w.start,source:tr(src),output:tr(out),truth:tr(truth),matchCount,exact:matchCount===6})}
}
assert.deepEqual(exactSolved,[]);assert.equal(cases.length,4);assert.equal(cases.filter(x=>x.exact).length,0);
assert.deepEqual(cases.map(x=>[x.page,x.word,x.start,x.matchCount]),[[56,3,5,1],[56,21,57,1],[56,22,62,0],[57,21,81,0]]);

const p56plain=parse(plaintext("p56_an_end")),plantedTarget=p56plain.runes.slice(4,10),plantedSource=inverse(plantedTarget);
assert.equal(plantedTarget.length,6);assert.deepEqual(forward(plantedSource),plantedTarget);

console.log(JSON.stringify({status:"PASS",issue:1710,frozenTransform:{predecessorExponent:3,fiveRuneWordExponent:27,p28Source:tr(p28src),p28Decoded:tr(p28out)},exactGeometry:{unknown:exactUnknown,solved:exactSolved},broaderControls:{unknownFiveRuneWordsWithPredecessor:broadUnknown,solvedFiveRuneWordsWithPredecessor:cases.length,solvedCases:cases,exactKnownPlaintextRecoveries:cases.filter(x=>x.exact)},plantedPositive:{target:tr(plantedTarget),syntheticSource:tr(plantedSource),recovered:tr(forward(plantedSource))},decision:"NO SOLVED TRANSFER: exact p28 geometry has no solved counterpart and the frozen transform recovers none of four nearest solved five-rune controls. Implementation passes a planted positive; historical identification remains unresolved."},null,2));
