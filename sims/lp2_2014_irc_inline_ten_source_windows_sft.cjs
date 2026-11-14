"use strict";
/** Issue #899 fixed ten original 2014 IRC source-context windows only.
 * No source inference, cipher search, nor key fitting.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const filepath=process.argv[2];
assert(filepath && filepath.endsWith("#cicadasolvers.freenode.log"));
const b=fs.readFileSync(filepath);
assert.equal(b.length,18487233);
const blob=crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
assert.equal(blob,"bdd277c14f94c34b5ae714cd00c238065beeed4e");
const rows=b.toString("latin1").split(/\r?\n/);
const windows=[
  [185125,12,"p25 guessed CONDITIONEDNESS shifts"],
  [198163,12,"page34-37 s=x+r+p search"],
  [212393,17,"claim p0-15 new prime sequence"],
  [212618,12,"Nem0 participant m-key and p-key"],
  [217607,25,"p15 source-derived 29-cycle sequence"],
  [217752,12,"page27 primestream minus4 question"],
  [223015,12,"p0 numeric transposition operand"],
  [226753,12,"p0 PS minus57 modulo29"],
  [235145,12,"p55 ENLIGHTENMENT crib shifts"],
  [235620,20,"rumored Fibonacci F0=1,F1=4"]
];
for(const [center,delta,topic] of windows){
  assert(rows[center-1].startsWith("2014 "),"Unexpected source era at "+center);
  console.log("ORIGINAL-2014-WINDOW "+center+" "+topic);
  for(let n=center-delta;n<=center+delta;n++){
    const line=rows[n-1];
    if(line?.startsWith("2014 "))console.log("L"+n+" "+line.slice(0,470));
  }
}
console.log("ORIGINAL-2014 TEN-WINDOW SOURCE SHA and source line indexes: PASS");
