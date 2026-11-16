# PARABLE's nineteen one-boundary deletions and the original 76-rune ending

**Decision (16 November 2026):** A simple source-derived length relation is real, but it does **not** decrypt LP2 p55. Under either literal one-boundary deletion, every positional rearrangement and every *single global GP29 alphabet permutation*, even when combined, is mathematically excluded by the authentic original symbol inventories. The solved p56 plaintext-F-transparent algorithm is also incompatible with either proposed cleartext. Dynamic, keyed and boundary-changing encoders are outside this narrow result.

## Original clue and the proposed operation

The original LP2 p57 prints a **7-rune** PARABLE rubric followed by **19 complete body words**. The canonical transcription records **95 GP29 runes** in that page. The preceding unknown p55 contains exactly **76 GP29 runes**. Therefore retaining the rubric and deleting exactly **one** of the two boundary glyphs in every p57 body word gives **95 − 19 = 76** runes.

This is an independent possible *single-boundary* reading of the clear p57 instruction to shed circumferences, distinct from the already examined two-sided body-word peel (38 shed exterior glyphs). It is an exploratory interpretation: the text speaks of *circumferences* and does not instruct the solver to remove only the first or only the final glyph. The p55 first rune is actually the completion of an incoming p54 word; source word boundaries are not presumed preserved in a hypothetical further cipher.

All input comes from the original-runic `resources/lp2-transcription.txt` and indexed `resources/liber-primus/lp2-corpus.json`. The input check requires the entire parsed 95-rune p57 to equal the canonical source indices, so no Latin-letter transliteration length or modern spelling is silently substituted.

## Frozen, all-position original p55 tests

For each of the only two literal one-edge choices, retain all seven title runes and all other body runes in their printed order. The target is **all 76 original p55 ciphertext runes**, with no shift, rotation, title deletion, fitted segment or selected smaller score window.

| Original 76-rune stream | GP29 index of coincidence | Identical positions against p55 | Minimum changes under arbitrary *same-alphabet* transposition | Plaintext F indices |
| --- | ---: | ---: | ---: | --- |
| Original p55 ciphertext | **0.037894736842** | 76 | 0 | **15, 25, 41** |
| p57 keep rubric, remove **first** glyph of each body word | **0.075438596491** | **3** | **39** | 26, 46 |
| p57 keep rubric, remove **last** glyph of each body word | **0.056491228070** | **1** | **34** | 27, 47, 54 |

The two candidate frequency *multisets* also differ from p55's, making the impossibility robust to **any global monoalphabetic GP29 relabeling as well as any transposition**. The IoC differences are strict invariants under these operations. Thus a transposition/Atbash/substitution-only explanation cannot map either literal 76-rune p57 derived text to source p55, regardless of its unknown key or readout order.

The authentic solved p56 mode makes **plaintext GP index 0 (F) emerge unchanged as ciphertext F without advancing the prime key clock**. The converse need not hold: encrypted non-F symbols can also appear as ciphertext F. Under that *necessary implication*, both candidate p55 plaintexts fail immediately: first-glyph removal requires ciphertext F at 26 and 46, and last-glyph removal requires it at 27, 47 and 54. None of these positions is a ciphertext F in p55. No phase of the p56 prime clock can repair that violation.

## Consequence

The numerical 95→76 match alone is insufficient to provide a plaintext crib for p55. The two nearest human-readable operations have an exact, no-secret exclusion for direct transposition/static substitution and for transfer of the **known** p56 transparent-F cipher. An actual unknown p55 decoder would have to change rune values through a **different** justified mechanism, or use p57 as a key/input in some other specified way. This experiment supplies no such missing cipher, authentic key or unknown plaintext.

[Single-file original-input CommonJS reproducer](../sims/lp2_p57_one_boundary_76_sft.cjs). Related earlier work, without duplication: [literal two-sided circumference peels](lp2-word-circumference-literal-peel.md), [p55 authentic carried-word boundary and 43-rune interior](lp2-2016-p50-p55-43unit-source-selector-gate.md), and [p56 exact F handling](lp2-ftransparent-word-lexical-viterbi.md).
