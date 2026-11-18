"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m);
function physicalPart(p){assert.notEqual(p,50);return parts[p<=49?p:p-1]}
function lines(p){return physicalPart(p).trim().split("/").filter(x=>x.trim().length)}
function values(line){return [...line].map(ch=>ri.get(ch)).filter(v=>v!==undefined)}
function fragments(line){return line.match(/[\u16A0-\u16FF]+/gu)||[]}
function isPrime(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true}
function powMod(b,e,m){let r=1%m,x=b%m;while(e>0){if(e%2===1)r=r*x%m;x=x*x%m;e=Math.floor(e/2)}return r}
const rows=[];let total=0;
for(let page=0;page<=55;page++){if(page===50)continue;const ls=lines(page);for(let i=0;i<ls.length;i++){total++;const v=values(ls[i]);if(v.length<2)continue;const p=v.length,g=fragments(ls[i]).length,a=i+1;rows.push({page,line:a,p,g,a,first:v[0],second:v[1],first2:corpus.translit[v[0]]+corpus.translit[v[1]],prime:isPrime(p),firstEqualsP:v[0]===p,serverPublicMatches:isPrime(p)&&g>1&&g<p&&powMod(g,a,p)===v[1]})}}
assert.equal(total,604);assert.equal(rows.length,594);
assert.equal(rows.filter(r=>r.firstEqualsP).length,24);
assert.equal(rows.filter(r=>r.serverPublicMatches).length,6);
const self=rows.filter(r=>r.firstEqualsP&&r.serverPublicMatches);
assert.deepEqual(self,[{page:28,line:6,p:23,g:5,a:6,first:23,second:8,first2:"DH",prime:true,firstEqualsP:true,serverPublicMatches:true}]);
assert.deepEqual(rows.filter(r=>r.first===23&&r.second===8),self);
const p28Line=lines(28)[5],v=values(p28Line),fr=fragments(p28Line);
assert.equal(v.length,23);assert.equal(fr.length,5);assert.equal(corpus.translit[v[0]]+corpus.translit[v[1]],"DH");assert.deepEqual(v.slice(0,2),[23,8]);
assert.equal(powMod(5,6,23),8);
console.log(JSON.stringify({status:"PASS: p28 line6 uniquely self-encodes DH p=23,g=5,a=6,A=8",totalPhysicalLines:total,eligibleLines:rows.length,firstEqualsP:rows.filter(r=>r.firstEqualsP).length,serverPublicMatches:rows.filter(r=>r.serverPublicMatches).length,joint:self},null,2));
