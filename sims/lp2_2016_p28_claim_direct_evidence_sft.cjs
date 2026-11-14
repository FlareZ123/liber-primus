'use strict';
/**
 * Targeted single-capture follow-up for Director issue #960.
 * Recover the identity and direct evidence of the speaker who claimed p28 was
 * "translated" in the preserved 2016 Titanpad chat.
 * Run: node sims/lp2_2016_p28_claim_direct_evidence_sft.cjs
 */
const crypto = require('node:crypto');
const source = 'https://web.archive.org/web/20160702002913id_/https://titanpad.com/vFCy7T5p0O';
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const emit = value => console.log(JSON.stringify(value));
async function main() {
  const res = await fetch(source, {signal:AbortSignal.timeout(45000)});
  if (res.status !== 200) throw Error('Source response HTTP '+res.status);
  const body = await res.text();
  const messages = [...body.matchAll(/\{"time":\d{13},"userId":"[^"]+","lineText":"(?:\\.|[^"\\])*"\}/g)]
    .map(m => JSON.parse(m[0])).sort((a,b) => a.time-b.time);
  const candidates = messages.filter(m => /page\s*28\s+has\s+been\s+translated/i.test(m.lineText));
  if (candidates.length !== 1) throw Error('Expected one exact p28 claim, got '+candidates.length);
  const claim = candidates[0];
  const ts = m => new Date(m.time).toISOString();
  const same = messages.filter(m => m.userId === claim.userId);
  const position = messages.indexOf(claim);
  const near = messages.slice(Math.max(0,position-5),position+6);
  const linkPattern = /(?:https?:\/\/|www\.)[^\s<>"\\]{4,200}/gi;
  const speakerLinks = same.flatMap(m => [...m.lineText.matchAll(linkPattern)].map(x=>x[0]));
  const speakerId = claim.userId;
  const contexts = [];
  let offset = 0;
  while (contexts.length < 12) {
    const i = body.indexOf(speakerId,offset);
    if (i < 0) break;
    contexts.push(body.slice(Math.max(0,i-160),Math.min(body.length,i+220)));
    offset = i + speakerId.length;
  }
  const padMatch = body.match(/"initialAttributedText"\s*:\s*\{\s*"text"\s*:\s*("(?:\\.|[^"\\])*")/s);
  if (!padMatch) throw Error('Missing original pad text');
  const padText = JSON.parse(padMatch[1].replace(/\\x([0-9a-f]{2})/gi,(_,x)=>String.fromCharCode(parseInt(x,16))));
  const lines = padText.split(/\r?\n/);
  const pageHeads = lines.flatMap((line,i) => /\bpage\s*28\b/i.test(line)?[i]:[]);
  const padPage = pageHeads.map(i => ({line:i+1,excerpt:lines.slice(Math.max(0,i-3),i+55).join('\n').slice(0,4300)}));
  emit({source,bodyBytes:Buffer.byteLength(body),bodySha256:digest(body),padSha256:digest(padText),
    allChatCount:messages.length,claim:{timestamp:ts(claim),userId:speakerId,lineText:claim.lineText},
    sameSpeakerCount:same.length,sameSpeakerMessages:same.map(m=>({timestamp:ts(m),lineText:m.lineText})),
    neighboringMessages:near.map(m=>({timestamp:ts(m),sameSpeaker:m.userId===speakerId,lineText:m.lineText})),
    speakerLinks:[...new Set(speakerLinks)],speakerIdHtmlContexts:contexts,
    page28PadHeadings:padPage});
}
main().catch(e=>{console.error(e.stack??e);process.exitCode=1});
