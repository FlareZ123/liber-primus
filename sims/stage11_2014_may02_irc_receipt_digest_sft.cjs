"use strict";
/**
 * First-party 2014 May 2 receipt digest crosscheck.
 * Contemporaneous #cicadasolvers Freenode (May 02 14:39/14:42 UTC)
 * brotherBox + ICU independently state their uploaded reply shares MD5:
 * 6808ed6409c243aacfe8a0f077dba606.
 * Original log: https://github.com/neuroretransmit/cicada/blob/main/irc-logs/%23cicadasolvers.freenode.log
 * No claim that this receipt provides a personal key.
 * Windows 11 Node22: node sims/stage11_2014_may02_irc_receipt_digest_sft.cjs
 */
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const file=path.join(__dirname,"..","resources","historical",
  "cicada2014-stage11-message.asc");
const raw=fs.readFileSync(file);
const md5=b=>crypto.createHash("md5").update(b).digest("hex");
const lf=raw.toString("utf8").replace(/\r\n/g,"\n");
const canonical=lf.replace(/[ \t]+(?=\n)/g,"");
const variants={
  checkedInRaw:md5(raw),
  originalLF:md5(Buffer.from(lf)),
  originalCRLF:md5(Buffer.from(lf.replace(/\n/g,"\r\n"))),
  stripTrailingSpacesLF:md5(Buffer.from(canonical)),
  stripTrailingSpacesCRLF:md5(Buffer.from(canonical.replace(/\n/g,"\r\n"))),
  trimmedLF:md5(Buffer.from(lf.trimEnd()+"\n")),
  trimmedCRLF:md5(Buffer.from((lf.trimEnd()+"\n").replace(/\n/g,"\r\n")))
};
const witness="6808ed6409c243aacfe8a0f077dba606";
const matches=Object.entries(variants).filter(([variant,digest])=>digest===witness);
console.log(JSON.stringify({witness,source:"2014 May02 #cicadasolvers brotherBox+ICU independent identical reception",checkedInFile:file,bytes:raw.length,variants,matches,conclusion:matches.length?"Source public signed redirect matches actual contemporary CGI receipt bytes":"No byte identity among tested normalizations; original participant receipt likely differed in preserved whitespace or exact container, and no personalized key evidence"},null,2));
console.log("PASS: transparent digest accounting; no unverified identity assertion");
