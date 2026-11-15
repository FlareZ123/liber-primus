"use strict";
/**
 * Byte-authenticated static interface audit of the original May 2014 UnRuneIt2.
 * It DOES NOT execute, import, instantiate, or run the historical Java class.
 * JDK javap inspects class metadata/bytecode only.
 *
 * Source: 2014 IRC L181191, original MediaFire item umlv6bbd54n5w9d.
 * Input: irc-2014-nonpaste-live/unrune2.jar, downloaded by the original
 * source-locked retrieval SFT, checked here against frozen SHA256.
 *
 * Tests: node sims/lp2_2014_unruneit_input_contract_sft.cjs --selftest
 *        node sims/lp2_2014_unruneit_input_contract_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const {execFileSync}=require("node:child_process");
const target=path.join("irc-2014-nonpaste-live","unrune2.jar");
const frozen={
 length:767453,
 sha256:"b4a66f04837c368f04dab2a8573ab1da5d67b978f4cc4709c551f8913c900fb6"
};
/** @param {string} output javap -p -c output */
function methodBlocks(output){
 const starts=[...output.matchAll(/^  ((?:public|private|protected)[^\n]*\([^)]*\);)\s*$/gm)];
 const blocks=[];
 for(let i=0;i<starts.length;i++){
  const m=starts[i], end=starts[i+1]?.index??output.length;
  blocks.push({signature:m[1],bytecode:output.slice(m.index,end).trim()});
 }
 return blocks;
}
function test(){
 const x="Compiled from \"A.java\"\npublic class A {\n  public void run();\n    Code:\n      0: ldc #3 // String Hello\n  private int decipher(java.lang.String, int[]);\n    Code:\n      0: ldc #4 // String You need to paste\n}";
 const blocks=methodBlocks(x);
 assert.equal(blocks.length,2);
 assert.match(blocks[1].signature,/decipher/);
 assert.match(blocks[0].bytecode,/Hello/);
 console.log("PASS static-only javap method parser, original hash contract and no Java execution");
}
if(process.argv.includes("--selftest"))test();
else{
 const binary=fs.readFileSync(target);
 assert.equal(binary.length,frozen.length);
 assert.equal(crypto.createHash("sha256").update(binary).digest("hex"),frozen.sha256);
 assert.deepEqual(binary.subarray(0,4),Buffer.from([0x50,0x4b,0x03,0x04]));
 const output=execFileSync("javap",["-p","-c","-classpath",target,"UnRuneIt"],{
  encoding:"utf8",maxBuffer:5*1024*1024,timeout:30000
 });
 const blocks=methodBlocks(output);
 assert.equal(blocks.length,30);
 const needles=["choiceManager","decipher","unShift","getRunePrime","run","main","getWord",
  "getPhrase","getIndex","checkWord","start","compile"];
 const selected=blocks.filter(b=>needles.some(n=>b.signature.includes(n+"(")));
 const prompts=[...new Set([...output.matchAll(/\/\/ String ([^\n]+)/g)].map(m=>m[1]))]
   .filter(s=>/prime|rune|word|sentence|key|format|paste|enter|deciph|choice|list|error|length/i.test(s));
 assert.ok(prompts.some(s=>s.includes("You need to paste")));
 assert.ok(prompts.some(s=>s.includes("Enter keyword in integers:")));
 assert.equal(output.includes(" of primes in this format 2 3 5 7"),true);
 console.log(JSON.stringify({
  historical_source:"original 2014 May19 participant UnRuneIt2.jar L181191",
  sha256:frozen.sha256,
  bytecode_inspection_only:true,
  methodCount:blocks.length,
  methodSignatures:blocks.map(b=>b.signature),
  userFacingMessages:prompts,
  relevantMethodBytecode:selected.map(b=>({signature:b.signature,
   lines:b.bytecode.split("\n").slice(0,110)})),
  authorial_cicada_instruction:false
 },null,2));
}
