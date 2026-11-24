'use strict';
const fs=require('node:fs');
function repeatGate(corpus,native){
 const B=29n,chunk=29n**10n,p0=native.sections.flatMap(s=>[...s.source_text].map(c=>corpus.runes.indexOf(c)).filter(i=>i>=0)),orig=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 const count=p=>p.reduce((n,x,i)=>n+ +(i>0&&p[i-1]===x),0);
 function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
 function repeats(z,n){let prev=-1,d=0;for(let i=0;i<n;){let v=Number(z%chunk);z/=chunk;for(let j=0;j<10&&i<n;j++,i++){let y=v%29;v=Math.floor(v/29);if(y===prev)d++;prev=y;}}return d;}
 const rate=count(orig)/(orig.length-1),threshold=Math.floor(rate*(p0.length-1));
 const result=[];for(const rev of [false,true]){let p=rev?[...p0].reverse():p0,M=B**BigInt(p.length)-1n,P=p.reduce((n,v)=>n*B+BigInt(v),0n),vals=[];for(let a=1;a<=3301;a++){let x=BigInt(a);if(gcd(x,M)!==1n)continue;let z=x*P%M;vals.push({a,repeats:repeats(z,p.length)});}vals.sort((x,y)=>x.repeats-y.repeats||x.a-y.a);result.push({rev,units:vals.length,min:vals[0],top10:vals.slice(0,10),median:vals[vals.length>>1],max:vals.at(-1),matchingRate:vals.filter(x=>x.repeats<=threshold).length});}
 return {originalRunes:orig.length,originalRepeats:count(orig),rate,nativeRunes:p0.length,nativeRepeats:count(p0),threshold,result};
}
console.log(JSON.stringify(repeatGate(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'))),null,2));
