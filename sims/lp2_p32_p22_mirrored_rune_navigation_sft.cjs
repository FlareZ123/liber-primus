"use strict";

/**
 * Source-fixed p32 -> p22 -> p28 mirrored Rune-Poem navigation composition.
 *
 * This SFT does NOT infer image semantics. It composes already independently
 * frozen source facts:
 *   p32 artwork = oak/Ac and p32 tree is horizontally reflected;
 *   p2-trained literal GP glyph mirror map;
 *   ordinary 29-stanza Rune-Poem ordinal -> ordinary LP2 page ordinal;
 *   p22 has a unique EA-EA doublet and independently certified corpse art;
 *   EA/Ear is self-mirrored by the same frozen glyph map.
 *
 * It checks that the composition is exact and origin-consistent:
 *   p32 Ac/A --mirror--> OE (stanza23) --> physical p22
 *   p22 Ear/EA --mirror--> EA (stanza29) --> physical p28
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const poem=read("resources/external/dickins1915-rune-poem-old-english.txt");
const transcript=read("resources/liber-primus/lp2-transcription.txt");
const stanzas=poem.trim().split(/\n\s*\n/);
assert.equal(stanzas.length,29);

// Frozen p2-trained horizontal glyph-reflection class map in GP29 order.
const mirrorOutputs=[
  "X","M","J","S","G","X","G","X","H","N","I","J","EO","E","X",
  "O","T","OE","E","E","X","NG","OE","D","OE","S","M","IA","EA"
];
assert.equal(mirrorOutputs.length,29);

const AC=24, OE=22, EAR=28;
assert.equal(corpus.translit[AC],"A");
assert.equal(corpus.translit[OE],"OE");
assert.equal(corpus.translit[EAR],"EA");
assert.match(stanzas[AC],/^Ac\b/);
assert.match(stanzas[OE],/^(?:Ethel|Eðel|Eþel|Œthel|Oe)/i,
  "stanza23 should be the OE/Ethel rune");
assert.match(stanzas[EAR],/^Ear\b/);

// The independently frozen mirror map supplies the exact two navigation edges.
assert.equal(mirrorOutputs[AC],"OE","horizontal reflection must map A/Ac -> OE");
assert.equal(mirrorOutputs[EAR],"EA","EA/Ear must be self-mirrored");
const physicalPageFromRuneIndex=i=>(i+1)-1; // one-based stanza -> one-based LP2 ordinal -> physical p#
assert.equal(physicalPageFromRuneIndex(OE),22);
assert.equal(physicalPageFromRuneIndex(EAR),28);

// P32's separately discovered checksum selects Ac over the repeated p55 tree.
const p32=corpus.pages.find(p=>p.page===32);
const p55=corpus.pages.find(p=>p.page===55);
assert.equal(corpus.prime[AC],97);
assert.equal(p32.runic_count,121);
assert.equal(corpus.prime[AC]+AC,121);
assert.equal(p55.runic_count,76);
assert.notEqual(corpus.prime[AC]+AC,p55.runic_count);

// P22 contains exactly one adjacent equality and it is EA-EA.
const p22=corpus.pages.find(p=>p.page===22);
const doubles=[];
for(let i=0;i<p22.indices.length-1;i++){
  if(p22.indices[i]===p22.indices[i+1])doubles.push({offset:i,index:p22.indices[i]});
}
assert.deepEqual(doubles,[{offset:100,index:EAR}]);

// EAR's source stanza is uniquely selected by the literal corpse noun hraw.
const hraw=stanzas.flatMap((s,i)=>/\bhraw\b/i.test(s)?[i]:[]);
assert.deepEqual(hraw,[EAR]);

// Independent p28 recipient control used by the established p57/DH route:
// physical p28 line 6 begins DH and has 23 runes.
const p28Block=transcript.split("\n%\n")[28];
const p28Lines=p28Block.split("\n").filter(Boolean);
assert.ok(p28Lines.length>=6);
const line6Runes=[...p28Lines[5]].filter(ch=>corpus.runes.includes(ch));
assert.equal(corpus.translit[corpus.runes.indexOf(line6Runes[0])],"D");
assert.equal(corpus.translit[corpus.runes.indexOf(line6Runes[1])],"H");
assert.equal(line6Runes.length,23);

console.log(JSON.stringify({
  rule:"mirrored artwork semantic rune -> fixed horizontal glyph mirror -> same one-based Rune-Poem/LP2 ordinal",
  p32:{
    semanticRune:"Ac/A",gp0:AC,prime:corpus.prime[AC],runicCount:p32.runic_count,
    checksum:"97+24=121",
    mirroredRune:mirrorOutputs[AC],
    mirroredRuneGp0:OE,
    targetPhysicalPage:physicalPageFromRuneIndex(OE)
  },
  p22:{
    semanticRune:"Ear/EA",gp0:EAR,
    uniqueAdjacentDoublet:doubles[0],
    mirroredRune:mirrorOutputs[EAR],
    targetPhysicalPage:physicalPageFromRuneIndex(EAR)
  },
  p28Control:{line6Prefix:"DH",line6Runes:line6Runes.length},
  decision:"EXACT_SOURCE_COMPOSITION_P32_AC_MIRROR_TO_P22_EAR_SELF_MIRROR_TO_P28"
},null,2));
