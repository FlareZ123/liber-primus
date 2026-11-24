# 2014 text-guided GP29 Vigenère: positive control and corrected LP2 transfers

**Status: no unknown LP2 plaintext recovered.** This note consolidates the authenticated 2014 positive control and the source-constrained transfers tested against LP2. It supersedes the earlier 82-rune p5 result and the p55 ranking produced by a language model that accidentally included LP2 plaintext in its training data.

## 1. The historical positive control

The 2014 PGP-signed message ["Let the text guide you"](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2014/let-the-text-guide-you.asc) contains an 18-rune ciphertext image. The key is the solved LP1 phrase **WELCOME PILGRIM TO THE GREAT**, encoded as 22 GP29 symbols:

\`[7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18,6,4,28,16]\`

The inverse is the simple source-motivated operation

\`P_i = (C_i - K_i) mod 29\`

with one key symbol consumed for each ciphertext rune. The literal digits and space in the image are preserved and do not consume key symbols. The exact inverse produces:

\`AUOWYFGL5LCSFJ3 NONIAN\`

Under the manuscript's ordinary GP orthographic ambiguities (U/V, C/K, S/Z and IA/IO), the historical reading is **AVOWYFGL5LKZFJ3N.ONION**.

This is a genuine positive control: Cicada demonstrably used solved Liber Primus text as key material with a simple modulo-29 subtraction. There is an important limit, however: the ciphertext has only 18 runes while the key has 22. The surviving example does **not** demonstrate that the key wraps or repeats. Applying it cyclically to longer LP2 text is an additional hypothesis, not a directly observed part of the 2014 operation.

## 2. Exact 22-rune opening phrase against LP2 p0

A natural first transfer is to use that exact 22-rune phrase on the first unknown LP2 page. The original p0 image contains 262 GP runes: a visually distinct 13-rune red heading followed by 249 black-body runes. The physical-ink override identifies the red runes and their boundary independently of the transcription.

The test was fixed to the source-visible choices only:

- entire p0 from its first red rune, key phase 0;
- black body alone, with key phase reset to 0;
- black body alone, with the key phase advanced by the 13 red runes;
- red heading alone as a short diagnostic;
- both subtraction and addition directions.

Every candidate was re-encrypted to the exact original sequence. No arbitrary phase, rotation, deleted rune, or fitted offset was searched.

| p0 target | Direction | Key phase | First decoded 22-rune transliteration | LP1-only trigram score, legacy / source-native |
| --- | --- | ---: | --- | ---: |
| Whole page | subtract | 0 | \`HMIAIAOFNTCGEOBAEOAODJ\` | -3.40630 / -3.40621 |
| Black body | subtract | 0 | \`AOESLYNGRMEAJOXYIAHEOL\` | -3.37886 / -3.38334 |
| Black body | subtract | 13 | \`EOAODJCEROEALIATHXCYNTH\` | -3.40444 / -3.40433 |
| Black body | add | 0 | \`NFYUOUJTMOESOEBWJEAUTAE\` | -3.41983 / -3.42220 |
| Black body | add | 13 | \`NGIANIAEBYTHAENIANEOLXR\` | -3.40270 / -3.40854 |

The raw p0 page has IoC 0.03431 and LP1-only trigram scores -3.37652 / -3.38080. The best black-body candidate is effectively no better than the raw ciphertext and does not form readable text. The held-out clear p57 control scores -2.79395 / -2.78894 under the same two models, so the scoring pipeline distinguishes actual GP prose from these outputs.

The first 22 symbols of each p0 segment are also the one-pass test: the historical positive control never establishes key wraparound. Extending the phrase cyclically over the remainder of p0 or the 12,956-rune unknown LP2 corpus is more speculative; continuous and page-reset clocks were both tested in the reproducer and did not yield coherent text.

**Decision:** the exact historical 22-rune opening phrase is not a p0 decoder under the directly supported subtraction, its reverse, or the two natural red-heading clocks. Do not expand this into an arbitrary phase search.

## 3. Longer prior-LP1 text as a running key: corrected source extraction

The earlier full-prior-LP1 test used key lengths **3,341** and **3,155**. Those lengths were not source-faithful: the key extractor removed Markdown headings but retained bracketed editorial continuation notes from \`lp1-plaintext-reference.txt\`. Those notes contributed exactly **273 extra GP symbols** to each key. The earlier negative is superseded.

The corrected reproducer removes section headings and bracketed editorial notes before encoding, and stops before LP2 pages 56–57. It tests both the legacy GP label encoder and the source-calibrated encoder described in [the LP1 source-orthography study](../results/lp1-source-orthography.md):

| Key source | Legacy GP encoding | Source-calibrated encoding |
| --- | ---: | ---: |
| Full prior LP1 reference | 3,068 | 3,028 |
| Prior LP1 reference from WELCOME onward | 2,882 | 2,844 |

The source-calibrated encoder is a sensitivity model, not a universal spelling claim: its direct source-attested scope is the original LP1 p10–p13 word alignment and the solved p57 text. Both encoders are reported rather than silently choosing one.

The four clean key streams were applied to all **12,956** original LP2 ciphertext runes using both natural clocks (one continuous stream or reset at each physical page) and both signs: 16 fixed variants. Each was re-encrypted exactly. The language models were trained on clean LP1 text only; p56 and p57 were held out.

The best-scoring variant under both models was the legacy-encoded WELCOME-onward key, continuous clock, addition direction. Its scores were -3.40573 / -3.40532, versus raw-ciphertext scores -3.41023 / -3.40997. Its output begins:

\`OEYNHNNTWRBDAALATTGSOOEAECJWPNGDTHRSJAEIIAOEOEPNONGOFTHGEGXTHMEOB...\`

This is a small score movement, not plaintext. The clear p57 control remains around -2.79 under both models. The exact source-native full-LP1 and WELCOME-onward keys also fail to produce coherent text.

**Decision:** the corrected clean-reference versions of these specific long-key transfers do not recover LP2 plaintext. The earlier 3,341/3,155-symbol result must not be cited as an exact-source-key exclusion. The current test still uses an editor-normalized English reference; a fully page-aligned source-rune key would be stronger, and the source-native encoder remains a sensitivity outside its attested pages.

## 4. Solved LP2 terminal pages as keys for p55: corrected scoring

A separate fixed test used the solved p56 prime-minus-one plaintext, solved p57 text, the phrases \`AN END WITHIN THE DEEP WEB\` and \`THE DEEP END\`, and the previously specified 76-symbol slices/reversal. It evaluated the three source-visible F positions under all eight transparent-F masks: 56 total candidates.

The previous version trained its language model on the entire known-plaintext reference, which includes p56 and p57. That made those supposed held-out controls in-sample and changed the candidate ranking. The corrected models use clean LP1 text only, with p56 and p57 held out; both legacy and source-native models are reported.

| Sequence | Legacy score | Source-native score |
| --- | ---: | ---: |
| Raw p55 ciphertext | -3.40142 | -3.41884 |
| Best candidate: p57 first 76, no F skips | -3.37582 | -3.37683 |
| Solved p56 control | -2.81770 | -2.81740 |
| Solved p57 control | -2.79395 | -2.78894 |

The best candidate under both models is now **p57 first 76, skip mask 0**, not the previously reported \`THE DEEP END\`. Its literal preview begins:

\`HUSSMAEADNIDRCNGTXJFPEFIAAEAHHIAWBEOMEORNGAEWUHCHEOXUOERTESIAXWEACUCXI...\`

It is not readable plaintext. The small score improvement is not comparable to the held-out cleartext controls. The earlier \`THE DEEP END\` ranking is withdrawn; it was an artifact of training on the candidate key material itself.

## 5. Moth-selected LP1 p5 key: exact 81-rune correction

The moth illustration on solved LP1 p5 reappears on LP2 p53 and p55, making the solved p5 prose a plausible source-selected key. The earlier test used an 82-rune English-derived key. The printed original contains **81 GP29 symbols** because the \`IO\` in FUNCTION is a single \`ᛡ\` rune, not separate I+O symbols.

The exact 81-rune key was extracted from the original LP1 p5 runes and independently matched by the source-calibrated English encoder. The corrected repeating subtraction, with page-start phase zero and no fitted offsets, gives:

| Original LP2 page | Source runes | Exact 81-rune decoded IoC | Plaintext |
| --- | ---: | ---: | --- |
| p53 | 179 | 0.03245245120 | No |
| p55 | 76 | 0.03157894737 | No |

The literal output prefixes and full reproduction are in [the exact 81-rune correction](lp1p5-moth-2014-source81-textguide.md). The old 82-rune result is superseded.

## 6. Research decision

The 2014 message establishes a real, simple mechanism: a solved LP1 phrase can be subtracted from a short GP29 ciphertext. That is useful evidence about Cicada's puzzle design. But the exact opening phrase does not decode p0; corrected long prior-LP1 text keys do not decode the unknown corpus; the exact 81-rune p5 key does not decode the moth-marked p53/p55 pages; and the corrected p55 terminal-key candidates do not produce plaintext.

These are bounded exclusions of specific source-selected transfers, not proof that no text-derived key can work. The missing ingredient is a source clue selecting a different text segment, target, or operation. Do not respond by searching arbitrary key offsets or multiplying cipher layers. **No unknown LP2 plaintext, new key material, or final destination was recovered here.**

## Reproduction

- [Historical positive control, p0 phrase transfer, and corrected p55 gate](../sims/historical_text_guide_terminal_vigenere_sft.cjs)
- [Clean prior-LP1 key transfer under both GP encoders](../sims/lp1_prior_release_textguide_lp2_sft.cjs)
- [Exact 81-rune p5 key reproducer](../sims/lp2_lp1p5_moth_source81_corrected_sft.cjs)
- Inputs: [LP2 corpus](../resources/liber-primus/lp2-corpus.json), [p0 physical-ink override](../resources/liber-primus/lp2-p0-physical-ink-override.json), and [LP1 solved-text reference](../resources/liber-primus/lp1-plaintext-reference.txt).
