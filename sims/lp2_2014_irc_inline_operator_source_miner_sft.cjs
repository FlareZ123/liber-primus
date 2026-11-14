"use strict";
/**
 * Original 2014 IRC inline GP29 operator / key candidate screen, Issue #899.
 * Exactly bounded May-Aug 2014, preserved IRC bytes, original source hash.
 * This identifies contemporaneous participant hypotheses only, never
 * authentic Cicada plaintext/key without original held-out inversion.
 *
 * Usage internally: node sims/lp2_2014_irc_inline_operator_source_miner_sft.cjs
 *   PATH_TO_18MB_LOG [PATH_TO_8MB_SECOND_CHANNEL]
 *   or --selftest.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");

/** @typedef {{name:string,bytes:number,blob:string}} Source */
const sources=[
  {name:"#cicadasolvers.freenode.log",bytes:18487233,
    blob:"bdd277c14f94c34b5ae714cd00c238065beeed4e"},
  {name:"#33012014.freenode.log",bytes:8629610,
    blob:"a2880b1db31ce523599ef30ca2e55291bf295900"}
];
/** @param {Buffer} bytes @returns {string} */
const blobSha=bytes=>crypto.createHash("sha1")
  .update("blob "+bytes.length+"\0").update(bytes).digest("hex");
/** @param {string} raw @param {number} line @param {string} source */
function entry(raw,line,source) {
  const m=raw.match(/^(2014 (?:May|Jun|Jul|Aug) \d\d \d\d:\d\d) <([^>]+)> ?(.*)$/);
  return m?{source,line,when:m[1],nick:m[2],body:m[3]}:null;
}
const pagePattern=/\b(?:p(?:ages?)?\s*0?[0-9]\b|p(?:ages?)?\s*[1-4]\d\b|p(?:ages?)?\s*5[0-5]\b|first\s+page|last\s+(?:encrypted\s+)?page|liber\s+primus|lp2|unsolved\s+(?:page|section))\b/i;
const p56Pattern=/\b(?:p(?:age)?\s*56|an\s+end|deep\s+web)\b/i;
const keyPattern=/\b(?:key|seed|shift|offset|alphabet|permutation|rotor|map(?:ping)?)\s*(?:=|:|->|is)\s*[\[\{(0-9'"A-Za-z_]/i;
const codePattern=/\b(?:def\s+[A-Za-z_]\w*\s*\(|lambda\s|for\s+[A-Za-z_]\w*\s+in\s|while\s*\(|range\s*\(|function\s+[A-Za-z_]\w*\s*\(|print\s*\(|python\s+-c|mod(?:ulo)?\s*29)\b/i;
const longNumericPattern=/(?:^|[^0-9])\d{1,4}(?:[\s,;:|]+\d{1,4}){7,}(?=$|[^0-9])/;
const alphabetPattern=/\b(?:GP29|rune\s+index|rune\s+shift|rune\s+mapping|vigenere|atbash|autokey|ciphertext|plaintext)\b/i;
const executablePattern=/[\w][\w.]*\s*=\s*(?:(?:\[[\d\s,;:+*%()-]{10,}\])|(?:[\w()]+ ?[-+*/%] ?[\w()]+))/;
const onlyUrls=/https?:\/\/\S+/g;

/** @param {string} body @returns {number} */
function codeStrength(body) {
  const s=body.replace(onlyUrls,"");
  let n=0;
  if(keyPattern.test(s))n+=9;
  if(codePattern.test(s))n+=9;
  if(longNumericPattern.test(s))n+=8;
  if(executablePattern.test(s))n+=6;
  if(/\b(?:subtract|add|reverse|multiply|iterate|modulo)\b.{0,45}\b(?:rune|29|key|cipher)\b/i.test(s))n+=5;
  if(/(?:\b(?:[A-Z_]{2,}|[a-z_]{2,})\s*=\s*){2,}/.test(s))n+=3;
  return n;
}
/**
 * @param {Array<ReturnType<typeof entry>>} entries @param {string} source
 * @returns {{score:number,hit:any,context:any[]}[]}
 */
function scan(entries,source) {
  const candidates=[];
  for(let i=0;i<entries.length;i++) {
    const e=entries[i];
    if(!e)continue;
    const strength=codeStrength(e.body);
    if(strength<6)continue;
    const context=entries.slice(Math.max(0,i-5),Math.min(entries.length,i+6))
      .filter(Boolean);
    const relevant=context.filter(x=>pagePattern.test(x.body)&&
      (!p56Pattern.test(x.body)||pagePattern.test(x.body.replace(p56Pattern,""))));
    const near=relevant.some(x=>Math.abs(x.line-e.line)<=3);
    if(!near&&!pagePattern.test(e.body))continue;
    let score=strength+(pagePattern.test(e.body)?10:0)+(near?5:0);
    if(alphabetPattern.test(e.body))score+=3;
    if(p56Pattern.test(e.body)&&!/\bp(?:age)?\s*(?:[0-9]|[1-4]\d|5[0-5])\b/i.test(e.body))score-=10;
    if(/https?:\/\//.test(e.body)&&strength<9)score-=3;
    if(score<12)continue;
    candidates.push({score,hit:e,context:context
      .filter(v=>Math.abs(v.line-e.line)<=3)
      .map(v=>({line:v.line,when:v.when,nick:v.nick,
        body:v.body.slice(0,320)}))});
  }
  const sorted=candidates.sort((a,b)=>b.score-a.score||a.hit.line-b.hit.line);
  const groups=[];
  // Deduplicate messages from the same local conversation.
  for(const cand of sorted) {
    if(groups.some(x=>x.hit.source===cand.hit.source&&
      Math.abs(x.hit.line-cand.hit.line)<=15))continue;
    groups.push(cand);
  }
  return groups.sort((a,b)=>b.score-a.score||a.hit.line-b.hit.line);
}
/** @param {string} pathname */
function load(pathname) {
  const source=sources.find(s=>pathname.endsWith(s.name));
  assert(source,"unexpected original IRC source "+pathname);
  const bytes=fs.readFileSync(pathname);
  assert.equal(bytes.length,source.bytes,source.name+" original size");
  assert.equal(blobSha(bytes),source.blob,source.name+" original SHA1");
  const lines=bytes.toString("latin1").split(/\r?\n/);
  const es=lines.map((v,i)=>entry(v,i+1,source.name));
  const eligible=es.filter(Boolean);
  console.log("SOURCE-VERIFIED "+source.name+" size="+bytes.length+
    " datedMayAug2014="+eligible.length);
  const result=scan(es,source.name);
  console.log("RANKED eligible source conversations="+result.length);
  return result;
}
function selftest() {
  const plant=[
    "2014 Jul 01 12:00 <alice> examining Liber Primus page 2 now",
    "2014 Jul 01 12:01 <alice> key = [1,2,3,5,8,13,21,34]",
    "2014 Jul 01 12:02 <bob> try subtracting the sequence from rune ciphertext",
    "2014 Jul 01 12:03 <alice> perhaps",
    "2014 Aug 02 12:00 <bob> page 56 AN END solved",
    "2014 Aug 02 12:01 <bob> key = [1,2,3,5,8,13,21,34]",
    "2014 Apr 02 12:01 <bob> page 1 key = [1,2,3,5,8,13,21,34]"
  ].map((x,i)=>entry(x,i+1,"plant"));
  const hits=scan(plant,"plant");
  assert(hits.some(x=>x.hit.line===2));
  assert(!hits.some(x=>x.hit.line===6));
  assert.equal(blobSha(Buffer.from("test")),"30d74d258442c7c65512eafab474568dd706c430");
  console.log("PASS: synthetically planted inline key, period gate, excluded p56, original Git SHA");
}
function main() {
  selftest();
  if(process.argv.includes("--selftest"))return;
  const paths=process.argv.slice(2);
  assert(paths.length>=1 && paths.length<=2);
  const result=paths.flatMap(load).sort((a,b)=>b.score-a.score||a.hit.line-b.hit.line);
  console.log("ALL SOURCE conversations (distinct local hits)="+result.length);
  console.log("OUTPUT top 45 for human original-page/code qualification; no plaintext scoring");
  result.slice(0,45).forEach((x,i)=>console.log("INLINE-OPERATOR "+(i+1)+" "+
    JSON.stringify(x)));
}
main();
