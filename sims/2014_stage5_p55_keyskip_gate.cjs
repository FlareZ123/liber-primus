"use strict";
// Reproduce the Stage5-output -> p55-interior Campaign XVIII key-skip gate.
// Run from repository root: node sims/2014_stage5_p55_keyskip_gate.cjs
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const raw=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8");
const qtxt=fs.readFileSync(path.join(root,"resources/control/duko_round27_english_quadgrams.txt"),"utf8");
const tokens=corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
const aliases={V:1,K:5,Z:15,Q:5};
function engToIdx(s){s=s.toUpperCase();const out=[];for(let i=0;i<s.length;){const h=tokens.find(x=>s.startsWith(x.token,i));if(h){out.push(h.index);i+=h.token.length;}else{if(aliases[s[i]]!==undefined)out.push(aliases[s[i]]);i++;}}return out;}
function parseWords(text,pageCount=55){const segs=text.split("%").slice(0,pageCount),out=Array.from({length:segs.length},()=>[]);let cur="",start=0,page=0;const finish=()=>{if(cur){out[start].push([...cur].map(r=>corpus.runes.indexOf(r)));cur="";}};for(const ch of segs.join("%")){if(/[\u16A0-\u16FF]/u.test(ch)){if(!cur)start=page;cur+=ch;}else if(ch==="%")page++;else if(ch==="/"||/\s/u.test(ch)){}else finish();}finish();return out;}
const words=parseWords(raw)[54],p55=corpus.pages.find(p=>p.page===55).indices;
const wordRunes=words.flat(),cipher=words.flatMap(w=>w.slice(1,-1));
assert.equal(words.length,16);assert.deepEqual(words.map(w=>w.length),[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(p55.length,76);assert.deepEqual(wordRunes,p55.slice(1));assert.equal(cipher.length,43);
const phrase="TOBELIEVETRUTHISTODESTROYPOSSIBILITY",output="TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133";
const phraseKey=engToIdx(phrase),key=engToIdx(output);assert.equal(phraseKey.length,35);assert.equal(key.length,46);
const q=new Map();let total=0;for(const line of qtxt.trim().split(/\r?\n/)){const m=line.trim().match(/^([A-Z]{4})\s+(\d+)$/);if(m){const n=+m[2];q.set(m[1],n);total+=n;}}
const logT=Math.log10(total),floor=Math.log10(.01)-logT,qlog=new Map([...q].map(([g,n])=>[g,Math.log10(n)-logT]));
function scoreNorm(t){t=t.toUpperCase().replace(/[^A-Z]/g,"");const n=t.length-3;if(n<=0)return -999;let s=0;for(let i=0;i<n;i++)s+=qlog.get(t.slice(i,i+4))??floor;return s/n;}
function delta(t,a){const s=t+a;let v=0;for(let e=Math.max(4,t.length+1);e<=s.length;e++)v+=qlog.get(s.slice(e-4,e))??floor;return v;}
const mod=x=>((x%29)+29)%29;
function decode(C,K,sign,offset=0,width=400,maxSkip=3,pad=false){if(offset>=K.length)return null;const Kx=pad?K.concat(Array(C.length*maxSkip+8).fill(0)):K;const p0=mod(C[0]+sign*Kx[offset]);let beam=[{s:0,j:offset,t:corpus.translit[p0],p:[p0],prev:C[0]}];for(let i=1;i<C.length;i++){const next=[];for(const x of beam)for(let d=0;d<=maxSkip;d++){const j=x.j+1+d;if(j>=Kx.length)break;const p=mod(C[i]+sign*Kx[j]);let ok=true;for(let k=x.j+1;k<j;k++)if(mod(p-sign*Kx[k])!==x.prev){ok=false;break;}if(ok){const token=corpus.translit[p];next.push({s:x.s+delta(x.t,token),j,t:x.t+token,p:x.p.concat(p),prev:C[i]});}}if(!next.length)return null;next.sort((a,b)=>b.s-a.s);beam=next.slice(0,width);}const b=beam[0];return{text:b.t,p:b.p,keyEnd:b.j,skips:b.j-offset-(C.length-1),scoreNorm:scoreNorm(b.t),usesPadding:b.j>=K.length};}
function rng32(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function encipher(P,K,sign=-1,supp=.83,seed=3301){const r=rng32(seed),C=[],used=[];let j=0,prev=null;for(const p of P){while(true){const c=mod(p-sign*K[j]);if(prev!==null&&c===prev&&r()<supp){j++;continue;}C.push(c);used.push(j++);prev=c;break;}}return{C,used};}
const candidate=[],padded=[];for(const sign of [-1,1])for(let offset=0;offset<=key.length-cipher.length;offset++){const a=decode(cipher,key,sign,offset,400,3,false);if(a)candidate.push({sign,offset,...a});const b=decode(cipher,key,sign,offset,400,3,true);if(b)padded.push({sign,offset,...b});}
candidate.sort((a,b)=>b.scoreNorm-a.scoreNorm);padded.sort((a,b)=>b.scoreNorm-a.scoreNorm);
const phrasePrefix=[];for(const sign of [-1,1]){const x=decode(cipher.slice(0,phraseKey.length),phraseKey,sign,0,400,3,false);if(x)phrasePrefix.push({sign,...x});}
const random=rng32(0x3301),nullScores=[];for(let n=0;n<50;n++){const K=Array.from({length:key.length},()=>Math.floor(random()*29));let best=-999;for(const sign of [-1,1])for(let offset=0;offset<=K.length-cipher.length;offset++){const x=decode(cipher,K,sign,offset,400,3,false);if(x&&x.scoreNorm>best)best=x.scoreNorm;}nullScores.push(best);}nullScores.sort((a,b)=>a-b);
const plain=engToIdx("THEPRIMESARESACREDANDTHETOTIENTFUNCTIONISSACREDALLTHINGSSHOULDBEENCRYPTEDKNOWTHISTHATTHEINSTRAREMERGENCEISATHANDANDTHEPILGRIMWHOSOLVESTHEDEEPWEBSHALLFINDTHETRUTHWITHINTHESACREDGEOMETRYOFTHECIRCUMFERENCEANDLOSETHESHADOW");
const kr=rng32(0xC1CADA),syntheticKey=Array.from({length:plain.length*4+20},()=>Math.floor(kr()*29)),synthetic=encipher(plain,syntheticKey,-1,.83,3301);
const positive=decode(synthetic.C,syntheticKey,-1,0,400,3,false),wrongKey=Array.from({length:syntheticKey.length},()=>Math.floor(kr()*29)),wrong=decode(synthetic.C,wrongKey,-1,0,400,3,false);
const exact=positive?positive.p.reduce((n,v,i)=>n+(v===plain[i]?1:0),0)/plain.length:0;
const skipCount=synthetic.used.reduce((n,v,i)=>n+(i?v-synthetic.used[i-1]-1:0),0);
const rank=1+nullScores.filter(x=>x>=candidate[0].scoreNorm).length;
console.log(JSON.stringify({method:{beamWidth:400,maxSkipPerRune:3,suppression:.83,signs:[-1,1],strictKey:true,quadgramEntries:q.size,quadgramTotal:total,englishThreshold:-5.2},target:{page:55,words:words.length,wordLengths:words.map(w=>w.length),fullRunes:p55.length,interiorRunes:cipher.length},key:{source:output,phraseSymbols:phraseKey.length,fullOutputSymbols:key.length,offsets:[0,1,2,3]},candidate,paddedTop:padded.slice(0,4),phrasePrefix,randomNull:{n:50,min:nullScores[0],median:nullScores[25],max:nullScores[49],rankFromTopAmong51:rank,scores:nullScores},controls:{positiveRunes:plain.length,positiveSkips:skipCount,positiveExactMatch:exact,positiveScore:positive?.scoreNorm,wrongKeyScore:wrong?.scoreNorm}},null,2));
