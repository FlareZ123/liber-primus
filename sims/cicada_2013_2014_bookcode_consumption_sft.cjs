'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const pin='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3',base='https://raw.githubusercontent.com/neuroretransmit/cicada/'+pin+'/';
const files=[
 ['2013/001-232.jpg/232.jpg.asc','a62a45bec4752ab49bd0d9f344d429df0cf9dc68'],
 ['2013/001-232.jpg/book-of-the-law-I.txt','64876892683fab1467481fe87d85743a8ea17982'],
 ['2013/001-232.jpg/book-of-the-law-II.txt','cb4353b080d7584441f85502aeccb60796e6fe0f'],
 ['2013/001-232.jpg/book-of-the-law-III.txt','36e716252a271d31f5c4ba25b3cb78199ccc1114'],
 ['2014/001-twitter/zN4h51m.jpg.asc','1f9a61b97d5de9c4ca57402c064365a503d956a9'],
 ['2014/001-twitter/self-reliance.txt','12a6bc018047a1276e77f2b7f633d5905732fff9']
];
async function main(){
 const raw=await Promise.all(files.map(async ([p,h])=>{const res=await fetch(base+p);assert(res.ok,p);const b=Buffer.from(await res.arrayBuffer());assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),h);return b.toString('utf8')}));
 function run13(mode){const chapters=raw.slice(1,4).map(x=>x.split(/\d+\. /).filter(Boolean).map(s=>mode==='original'?s.replace(/[ \n]/g,''):mode==='letters'?s.replace(/[^A-Za-z]/g,''):mode==='raw'?s:s.replace(/\n/g,'')));const lines=raw[0].split(/\r?\n/).filter(s=>/^(?:I|II|III):\d+:\d+$|^[05]$/.test(s));let out='',bad=0;for(const s of lines){if(/^[05]$/.test(s)){out+=s;continue}const [c,l,k]=s.split(':');const v=chapters[c.length-1][+l-1]?.[+k-1];if(v===undefined)bad++;out+=v??'?'}return {mode,out,bad,records:lines.length}}
 const a=['original','letters','raw','linebreaksOnly'].map(run13);assert.equal(a[0].out,'https:--www.dropbox.com-s-r7sgeb5dtmzj14s-3301');assert.deepEqual(a.map(v=>v.bad),[0,3,0,0]);assert(a.every(v=>v.records===46));assert(a.slice(1).every(v=>v.out!==a[0].out));
 function run14(mode){const lines=raw[4].split(/\r?\n/).filter(s=>/^(\d+:){3}\d+$|^[.on3i]$/.test(s));const p=raw[5].split('\n\n').map(p=>p.split(/(?<=[.!?])\s+/).map(s=>{s=s.replace(/\n/g,' ');if(mode==='rawsplit')return s.split(' ');if(mode==='stripPunct')return s.replace(/[^A-Za-z\s]/g,'').split(' ');return s.trim().split(/\s+/)}));let out='',bad=0;for(const s of lines){if(s.length===1){out+=s;continue}let [i,j,k,l]=s.split(':').map(x=>+x-1);if(i>=44&&mode!=='noExcerptSkip')i++;const v=p[i]?.[j]?.[k]?.[l];if(v===undefined)bad++;out+=v??'?'}return {mode,out,bad,records:lines.length}}
 const b=['rawsplit','trim','stripPunct','noExcerptSkip'].map(run14);assert(b.slice(0,3).every(v=>v.out==='auqgnxjtvdbll3pv.onion'&&v.bad===0));assert.equal(b[3].bad,3);assert(b.every(v=>v.records===22));console.log({source2013:a,source2014:b});
}
main().catch(e=>{console.error(e);process.exitCode=1});
