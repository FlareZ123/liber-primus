'use strict';
// #3135: format-constrained source-only retrospective benchmark, not a blind human trial.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'), read=p=>fs.readFileSync(path.join(root,p)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const historical='resources/historical/';
const hostRE=/\b[a-z2-7]{16}\.onion\b/g;
const input1=read(historical+'cicada2013-gematria-jpeg-outguess.asc'),input2=read(historical+'cicada2013-second-onion-icmp-echo.hex.txt');
const signedHint=read(historical+'cicada2013-second-onion-everything-you-need.asc');
const clearBody=b=>b.toString('utf8').split('-----BEGIN PGP SIGNATURE-----')[0].split(/\r?\n\r?\n/).slice(1).join('\n\n');
const whitespaceLines=clearBody(input1).split(/\r?\n/).filter(x=>/^[ \t]+$/.test(x));
assert.deepEqual(whitespaceLines.map(x=>x.length),[240,200,80,32]);
const dev1=[];
for(const tab of [0,1])for(const reverse of [false,true]){
 const raw=Buffer.from(whitespaceLines.flatMap(line=>Array.from({length:line.length/8},(_,i)=>{let bits=[...line.slice(8*i,8*i+8)].map(x=>x==='\t'?tab:1-tab);if(reverse)bits.reverse();return parseInt(bits.join(''),2)})));
 const s=raw.toString('latin1');
 if(/^[\x20-\x7e]+$/.test(s)&&[...s.matchAll(hostRE)].length===1)dev1.push({operation:'binary whitespace to octets',tab,reverse,serializedHex:raw.toString('hex'),text:s,hosts:[...s.matchAll(hostRE)].map(x=>x[0])});
}
const packed=Buffer.from(input2.toString().replace(/\s/g,''),'hex');
const dev2=[];
for(const reverse of [false,true]){
 const b=reverse?Buffer.from(packed).reverse():packed;
 for(const codec of ['gzip','zlib','raw-deflate']){
  if(codec==='gzip'&&!(b[0]===31&&b[1]===139&&b[2]===8))continue;
  try{const raw=({gzip:zlib.gunzipSync,zlib:zlib.inflateSync,'raw-deflate':zlib.inflateRawSync})[codec](b);const s=raw.toString('utf8');
   if(s.startsWith('-----BEGIN PGP SIGNED MESSAGE-----')&&s.includes('-----END PGP SIGNATURE-----')&&[...s.matchAll(hostRE)].length===1)dev2.push({operation:'hex to '+codec,reverse,inputSHA:sha(b),serializedSHA:sha(raw),bytes:raw.length,hosts:[...s.matchAll(hostRE)].map(x=>x[0])});
  }catch(e){if(!(e instanceof Error))throw e;}
 }
}
// Held-out stage source packet: signed local hint + independently transcribed mixed-rune image,
// and the source-native WELCOME text delivered in that same stage. No answer consulted here.
const hint=read('resources/external/derived/2014-stage04/03-outguess.asc');
assert.ok(clearBody(hint).startsWith('Let the text guide you.'));
const cipher='ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ';
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')).sections.find(s=>s.name==='0_welcome').source_text;
const runes=corpus.runes, labels=corpus.translit, pos=new Map(runes.map((x,i)=>[x,i]));
const sourceRunes=[...source].filter(x=>pos.has(x)),sourceIdx=sourceRunes.map(x=>pos.get(x));
const c=[...cipher],n=c.filter(x=>pos.has(x)).length;
const letters=labels.map(l=>({U:['U','V'],C:['C','K'],S:['S','Z'],NG:['NG','ING'],IA:['IA','IO']}[l]||[l]));
// Input selection rule is frozen: any contiguous, rune-aligned n-symbol window in the
// co-delivered source text, no word-list or expected answer, both signs and GP reflection.
// Direct constant shifts are included as a rival; no fitted arbitrary keys.
const candidates=[];
for(const reflected of [false,true])for(const sign of [-1,1]){
 const tests=[...Array.from({length:sourceIdx.length-n+1},(_,i)=>({kind:'co-delivered text window',start:i,key:sourceIdx.slice(i,i+n)})),...Array.from({length:29},(_,i)=>({kind:'constant shift',start:null,key:Array(n).fill(i)}))];
 for(const t of tests){
  let j=0;const output=c.map(x=>pos.has(x)?letters[((reflected?28-pos.get(x):pos.get(x))+sign*t.key[j++]+58)%29]:[x]);
  // A v2 host uses exactly 16 base32 ASCII characters followed by ONION (dot implicit).
  // Enforce output byte length, not just number of glyphs; branching aliases are explicit.
  let paths=[''];for(const choices of output){
   paths=paths.flatMap(s=>choices.map(ch=>s+ch)).filter(s=>s.length<=21&&[...s].every((ch,i)=>i<16?/[A-Z2-7]/.test(ch):ch==='ONION'[i-16]));
   if(!paths.length)break;
  }
  const hosts=[...new Set(paths.filter(s=>s.length===21).map(s=>s.slice(0,16).toLowerCase()+'.onion'))];
  if(hosts.length)candidates.push({kind:t.kind,start:t.start,key:t.key,sign,reflected,hosts});
 }
}
const selected={dev1,dev2,heldout:{cipher,n,sourceRuneCount:sourceIdx.length,sourceWindowCount:sourceIdx.length-n+1,candidates}};
console.log(JSON.stringify(selected,null,2));
// These expected results are read only after candidate enumeration. They are the
// historically independently validated outputs, not a selector or ranking signal.
const expected1='Come to emiwp4muu2ktwknf.onionWe shall await you there.Good luck.3301';
const expected2=read(historical+'cicada2013-second-onion-icmp-echo.asc');
const expected3='avowyfgl5lkzfj3n.onion';
assert.equal(dev1.length,1);assert.equal(dev1[0].text,expected1);
assert.equal(dev2.length,1);assert.equal(dev2[0].serializedSHA,sha(expected2));
const compare={knownHostMatches:candidates.filter(x=>x.hosts.includes(expected3)).length,distinctHostBytes:[...new Set(candidates.flatMap(x=>x.hosts))],uniqueExactByteSolution:false};
compare.uniqueExactByteSolution=compare.distinctHostBytes.length===1&&compare.distinctHostBytes[0]===expected3;
const result={scope:'Retrospective source-only computational candidate selector, answer-known investigator; no human blindness',packets:{whitespaceSHA:sha(input1),icmpHexSHA:sha(input2),icmpHintSHA:sha(signedHint),stage04HintSHA:sha(hint),nativeWelcomeSHA:sha(Buffer.from(source)),mixedRuneTranscriptionBlob:'9a4c24fc6b6b3586fb85e5bb7453ba6e718a160b'},...selected,compare};
console.log(JSON.stringify(compare,null,2));fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify(result,null,2)+'\n');
