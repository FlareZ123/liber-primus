# P0 conditional title pad: direct transfer to all untouched red headings

**Decision (22 November 2026): negative for the literal shared 13-rune additive pad.** The PGP-authenticated 2016 phrase "epiphany seeks" has the same GP-native 8|5 rune-word shape as LP2 p0's original 13-red-rune heading. Treating that phrase as a **conditional crib**, the 13 raw differences C−P are exactly \`[26,24,8,19,27,24,18,3,0,8,0,16,19]\` over GP29 (K is spelled by native C rune). The phrase is **not independently recovered plaintext**: it is imposed to compute the trial key.

The hypothesis was a low-complexity human solve path: a first-page signed-coda phrase could expose a fixed additive pad reused in the manuscript's other red instructions. The original source has 213 red runes across p0–p55, of which 13 are the crib and **200 are untouched red-rune holdouts**, in 15 additional contiguous spans. Frozen transfer choices were C−K and C+K, each with either reset to key phase zero at the start of every red span or a single continuous clock over the 200 held-out red runes. No offsets, per-page fitted keys, rotations, or English word substitutions were searched. Original printed span order was preserved.

| Fixed transfer | GP29 IoC on 200 held-out red runes | First p3 red heading in GP transliteration |
|---|---:|---|
| C−K, span reset | 0.0342211055 | DTREDIPPAEOTIAEMGX |
| C+K, span reset | 0.0340201005 | BGLIAMFLMAEMTUIAPAEU |
| C−K, continuous red | 0.0348743719 | DTREDIPPAEOTIAEMGX |
| C+K, continuous red | 0.0333165829 | BGLIAMFLMAEMTUIAPAEU |

The original 200-rune red ciphertext has IoC **0.0344221106**. The known clear p57 95-rune text has **0.0627099664**. The p0 black body (249 runes) decrypted under the title-derived key with immediate phase-zero repetition has IoC **0.0349462366**, from original **0.0343632595**. None of these exact full-span outputs is coherent unknown-page English. All four additive consumers re-encrypt their untouched original ciphertext exactly, and the source-native known-p57 synthetic plant is recovered exactly; those checks validate the arithmetic rather than the key.

**Consequence:** the attractive 2016→p0 8|5 relation does not directly supply a reused 13-rune Vigenère pad for other original red headings or p0's black prose under these two natural clocks. This does not disprove EPIPHANY SEEKS as the p0 title, a one-use pad, or a separately keyed decoder for another section. Do not expand with arbitrary phase starts unless new original source instructions select them.

**Reproduction:** \`node sims/lp2_p0_title_derived_redspans_sft.cjs\`, reading \`resources/liber-primus/lp2-corpus.json\` and \`lp2-ink-annotations.json\`. The original red13 image/ink adjudication is \`im-results/lp2-p0-red13-13dot-blackbody-original-source-adjudication.md\`; the signed phrase is in \`resources/historical/cicada2016-4gq25-outguess.asc\`. No unknown LP2 plaintext, historical key, or end destination is claimed.
