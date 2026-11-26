'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(g,ink){
const A="ABCDEFGHIJKLMNOPQRSTUVWXYZ",W=["EKMFLGDQVZNTOWYHXUSPAIBRCJ","AJDKSIRUXBLHWTMCQGZNPYFVOE","BDFHJLCPRTXVZNYEIWGAKMUSQO"],N=["Q","E","V"],R="YRUHQSLDPXNGOKMIEBFZCWVJAT",m=x=>(x%26+26)%26;
function enigma(text,ground){let order=[2,0,1],p=[...ground].map(x=>A.indexOf(x)),plug=[...A];for(const pair of ["CD","GI","HZ","OX","PT","RY"]){plug[A.indexOf(pair[0])]=pair[1];plug[A.indexOf(pair[1])]=pair[0]}return [...text].map(ch=>{let mid=p[1]===A.indexOf(N[order[1]]),fast=p[2]===A.indexOf(N[order[2]]);if(mid)p[0]=m(p[0]+1);if(mid||fast)p[1]=m(p[1]+1);p[2]=m(p[2]+1);let x=A.indexOf(plug[A.indexOf(ch)]);for(let j=2;j>=0;j--)x=m(A.indexOf(W[order[j]][m(x+p[j])])-p[j]);x=A.indexOf(R[x]);for(let j=0;j<3;j++)x=m(W[order[j]].indexOf(A[m(x+p[j])])-p[j]);return plug[x]}).join("")}
const indicator=enigma("QQQQQQ","YRK"),body=enigma("HELLOTHERE","QQQ"),unwrapped=enigma(indicator,"YRK"),recovered=enigma(body,unwrapped.slice(0,3));if(indicator!=="MFKFXT"||body!=="UPGFSMERGZ"||unwrapped!=="QQQQQQ"||recovered!=="HELLOTHERE")throw Error("published example");
const spans=ink.pages.flatMap(x=>(x.red_spans??[]).map(s=>({page:x.page,start:s.start,len:s.length,seq:g.pages.find(p=>p.page===x.page).indices.slice(s.start,s.start+s.length)})));
const u=spans.filter(x=>x.page<56),starts=u.filter(x=>x.start===0),pairRows=u.filter(x=>x.len%2===0).map(x=>({...x,delta:x.seq.slice(x.len/2).map((v,i)=>(v-x.seq[i]+29)%29)}));
const collisions=[];for(let a=0;a<pairRows.length;a++)for(let b=a+1;b<pairRows.length;b++){const x=pairRows[a],y=pairRows[b];if(x.len!==y.len)continue;const h=x.len/2;let bad=[];for(let i=0;i<h;i++){if((x.seq[i]===y.seq[i])!==(x.seq[i+h]===y.seq[i+h]))bad.push(i)}collisions.push({a:[x.page,x.start],b:[y.page,y.start],len:x.len,deltaEqual:String(x.delta)===String(y.delta),bijectionContradiction:bad})}
const nine=u.filter(x=>x.len===9).map(x=>({...x,ground:x.seq.slice(0,3),wrapped:x.seq.slice(3)}));
return{historical:{indicator,body,unwrapped,recovered},spans:u.map(({seq,...x})=>x),starts:starts.map(({seq,...x})=>x),literalSix:u.filter(x=>x.len===6),nine,pairRows,collisions,solved:spans.filter(x=>x.page>=56)}
}
const r=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(r('resources/liber-primus/lp2-corpus.json'),r('resources/liber-primus/lp2-ink-annotations.json')),null,2));
