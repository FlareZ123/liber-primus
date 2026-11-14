'use strict';
const assert=require('node:assert/strict');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
class MT {
 constructor(seed){this.s=new Uint32Array(624);this.s[0]=seed>>>0;this.i=624;
   for(let j=1;j<624;j++)this.s[j]=(Math.imul(1812433253,this.s[j-1]^(this.s[j-1]>>>30))+j)>>>0;}
 next(){if(this.i===624){for(let j=0;j<624;j++){const n=(this.s[j]&0x80000000)|(this.s[(j+1)%624]&0x7fffffff);
 this.s[j]=(this.s[(j+397)%624]^(n>>>1)^((n&1)?0x9908b0df:0))>>>0;}this.i=0;}
 let x=this.s[this.i++];x^=x>>>11;x^=(x<<7)&0x9d2c5680;x^=(x<<15)&0xefc60000;x^=x>>>18;return x>>>0;}
}
const generator=new MT(314159265);
const seeds=Array.from({length:4096},()=>generator.next());
assert.deepEqual(seeds.slice(0,8),[3721122731,618219707,807213306,3144837749,3447982176,3230631767,755972506,1398685501]);
const first=new MT(seeds[0]);
assert.deepEqual(Array.from({length:8},()=>first.next()),[505524582,4277517655,1702989131,912900261,1432505218,4108960502,2270003630,316039421]);
const field=[];
for(let y=0;y<293;y++){const row=new MT(seeds[(y-9+4096)%4096]);const nums=Array.from({length:271},()=>row.next());
 assert(!nums.includes(0xffffffff));field.push(...nums.slice(4).map(x=>x%255));}
assert.equal(field.length,78231);
assert.deepEqual(field.slice(0,16),[254,36,200,76,154,130,146,88,168,26,86,84,114,176,79,54]);
for(const [x,y] of [[53,250],[44,256],[41,265],[57,269]])assert.equal(field[y*267+x],0);
const raw=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(raw.length,12956);
const mod=x=>(x%29+29)%29;
const decipher=(input,key)=>input.map((x,i)=>mod(x-key[i]%29));
const encipher=(input,key)=>input.map((x,i)=>mod(x+key[i]%29));
const ioc=input=>{const c=Array(29).fill(0);input.forEach(x=>c[x]++);return c.reduce((a,x)=>a+x*(x-1),0)/input.length/(input.length-1);};
const key=field.slice(0,raw.length),plain=decipher(raw,key);
assert.deepEqual(encipher(plain,key),raw);
assert.ok(Math.abs(ioc(plain)-0.034475919387043925)<1e-15);
const show=a=>a.map(x=>corpus.translit[x]).join('');
const p55=corpus.pages[55].indices.slice(1);
assert.equal(p55.length,75);
const p55Plain=decipher(p55,field);
assert.deepEqual(encipher(p55Plain,field),p55);
assert.ok(Math.abs(ioc(p55Plain)-0.02810810810810811)<1e-15);
const known=corpus.pages[57].indices.slice(0,75);
assert.deepEqual(decipher(encipher(known,field),field),known);
console.log(JSON.stringify({status:'PASS',seed:314159265,fieldBytes:field.length,fullOriginalRunes:raw.length,
initialField:field.slice(0,16),originalIoC:ioc(raw),decodedIoC:ioc(plain),
originalFirst300Decoded:show(plain.slice(0,300)),p55LocalDecoded:show(p55Plain),p55LocalIoC:ioc(p55Plain),
exactReencryption:true,positiveSourcePlant:true,newPlaintextRecovered:false},null,2));
