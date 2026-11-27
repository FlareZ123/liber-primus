// Agent22 #3214. Historical dual-label transport and p0 exact finite gate.
// node sims/lp2_2012_dual_label_transport_sft.cjs
const fs=require('node:fs'), assert=require('node:assert/strict');
const gp=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const src=fs.readFileSync('resources/transcriptions/lp2-image-corrected.txt','utf8').split(/\r?\n/).slice(0,12);
const title='a2e7j6ic78h0j7eiejd0120', key=[...title].map(x=>parseInt(x,20));
const prefix=[10,2,14,7,19,6,18,12,7,8,17,0,19];
assert.deepEqual(key.slice(0,13),prefix);
// First three preserved challenge lines and decoded public-domain Mabinogion,
// as recorded in https://clevcode.org/cicada-3301/ (2012 participant).
const cs=["Ukbn Txltbz nal hh Uoxelmgox wdvg Akw; hvu ogl rsm ar sbv ix jwz","mjotukj; mul nimo vaa prrf Qwkkb aak kau ww Ukpsf, ogq Kzpox vvl luf","yh Qsrjfa, hvu Ktp hzs lbn ph Kipsy; ttv Sdmehpfjsf tad igr"];
const ps=["King Arthur was at Caerlleon upon Usk; and one day he sat in his","chamber; and with him were Owain the son of Urien, and Kynon the son","of Clydno, and Kai the son of Kyner; and Gwenhwyvar and her"];
function hist(key,reset=true,skip=true,sign=-1){let i=0;return cs.map(line=>{if(reset)i=0;return [...line].map(x=>{if(!/[a-zA-Z]/.test(x)){if(!skip)i++;return x}const a=x===x.toUpperCase()?65:97;return String.fromCharCode(a+(x.charCodeAt(0)-a+sign*key[i++%key.length]+26)%26)}).join("")})}
const matches=out=>out.map((line,j)=>[...line].reduce((n,x,i)=>n+Number(x===ps[j][i]&&/[a-zA-Z]/.test(x)),0));
assert.deepEqual(hist(key),ps);
const head=gp.pages[0].indices.slice(0,13);
assert.deepEqual(head,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const sameMap=(a,b)=>a.every((x,i)=>a.every((y,j)=>x!==y||b[i]===b[j]));
const inject=(a,b)=>sameMap(a,b)&&sameMap(b,a);
const phaseTest=seq=>{let count=0,func=0,bijection=0;for(const direction of [1,-1])for(let phase=0;phase<seq.length;phase++){const b=head.map((_,i)=>seq[(phase+direction*i+seq.length*13)%seq.length]);count++;func+=Number(sameMap(head,b));bijection+=Number(inject(head,b));}return {count,func,bijection}};
assert.equal(phaseTest(prefix).func,0);assert.equal(phaseTest(key).func,0);
const all=src.flatMap(line=>[...line].filter(x=>gp.runes.includes(x)).map(x=>gp.runes.indexOf(x)));
assert.deepEqual(all,gp.pages[0].indices);
let decoded=[],replayed=0,ct=0;for(let l=0;l<src.length;l++){let j=0,seen=0;let out="";for(const rune of src[l]){const v=gp.runes.indexOf(rune);if(v<0){if(l!==0||seen>=13)out+=rune;continue}seen++;if(l===0&&seen<=13)continue;let shift=key[j++%key.length],p=(v-shift+29)%29;out+=gp.translit[p]+" ";replayed+=Number((p+shift)%29===v);ct++;}decoded.push(out)}
assert.equal(ct,249);assert.equal(replayed,ct);
console.log(JSON.stringify({key,history:{exact:matches(hist(key)),totals:ps.map(l=>l.replace(/[^a-zA-Z]/g,"").length),truncated13:matches(hist(prefix)),continuous:matches(hist(key,false)),punctuationConsumes:matches(hist(key,true,false)),wrongSign:matches(hist(key,true,true,1)),GP0title:head,phasePrefix:phaseTest(prefix),phaseFull:phaseTest(key)},original:{replayed,ct,decoded}},null,2));
