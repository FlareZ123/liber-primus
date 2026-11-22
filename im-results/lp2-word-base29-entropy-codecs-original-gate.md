# Four fixed word entropy transports over GP29 and no-repeat GP28: original-input negatives

**Agent 16's original two base29 codecs (13 November 2026, Director [#769](https://github.com/FlareZ123/liber-primus/issues/769)); Agent 48's two no-repeat radix28 successors (13 November 2026).** Original physical LP2 p0–2, p33–39 and p54–55 were passed unchanged through four fixed, deterministic and reversible coding hypotheses. Each model reconstructs **200/200** source-native GP control words on its own planted ciphertext; none supplies an even approximately complete canonical decoding of the original unknown words. There is no recovered unknown plaintext, authentic key or independently author-selected codec.

## Upstream premise and selector weakness

The historical 2013 Cicada BASE29 instruction establishes a GP numeral-to-integer reading. The original unknown book has **12,956 near-uniform GP29 runes**, with only 86 adjacent duplicates in 12,901 eligible same-page transitions. One possibility is a plaintext *compressor or enumerative fractionation* before runic printing rather than a changing 29-symbol substitution.

**The strongest contrary evidence is prior to this experiment:** neither the 2013 BASE29 source nor the 2014 manuscript prescribes Huffman coding, arithmetic coding, EOS termination, the English frequency table, word-by-word resets, or a bit-length sentinel. These are four explicit, invertible hypotheses with no fitted secret key, **not a theorem against entropy coding generally**. The radix28 descendants separately model a clue suggested by the very few adjacent doublets: excluding the previous output rune from the next 28 output choices. The original punctuation is preserved, including cross-page words. This is separate from previous fixed-S GP28 exclusion, secret GF(29²) map and ciphertext-feedback model gates.

## Fixed source model and original two base29 forward models

The reproducible [CommonJS source](../sims/lp2_word_entropy_base29_original_sft.cjs) uses only the canonical manuscript GP index order, printed page text, and the **editorial solved LP1 plus solved LP2 p56/p57 reference**. The source file includes both releases, so the 875-word model must never be described as LP1-only.

* Train a **30-symbol static model** on **875** GP-transliterable words in the combined solved-LP1 and terminal solved-LP2 (p56/p57) reference (29 rune classes + explicit word-end EOS), using GP greedy transliteration, source-attested ING→NG, V→U, K→C and Z→S; give every symbol one pseudocount. The total frequency is **4,441**, EOS frequency **876**, first eight GP symbol counts **[74,178,119,330,216,122,58,104]**. This reference model is fully disclosed and fixed; its counts are not claimed to be an author-selected cipher key.
* **Model A, arithmetic:** use exact integer rational arithmetic and the 30-symbol cumulative table to encode each complete GP plaintext word followed by EOS. Emit the *shortest* base29 digit interval entirely inside its terminal arithmetic interval, selecting the smallest such integer. Decode original GP29 ciphertext word by taking its exact interval midpoint until EOS, to a fixed maximum of 75 output runes. Re-encode each candidate under the unique canonical rule and require identity of *every original input digit*.
* **Model B, Huffman:** construct the standard binary Huffman tree from the same 30 frozen frequencies. Ties break by lowest GP leaf index. Encode plaintext runes and EOS as bits, prefix a literal high bit **1** to retain leading-zero bit length, then represent the full integer as a minimal big-endian base29 numeral. The decoder requires a full nonempty word ending at EOS with **no remaining trailing bits**. Re-encode and compare exact original GP29 digits.
* Both models have **no learned or fitted per-ciphertext parameters**, no external secret, no chosen phase, no auxiliary state and no unspecified escape symbols. Each printed word resets separately, while the real original chapter and physical page breaks remain intact. Punctuation itself is treated as the published unencrypted word boundary. The short-code "empty decoded word" is explicitly invalid as a plaintext printed word.
* The same pinned **200 real solved-LP1 control words** (model source positions 50–249) are independently encoded and then decoded. **All 200/200 words** recover their source rune sequence and reproduce their canonical ciphertext, in both models.

These procedures are historically available reversible codec families, but the particular word-packet framing is a frozen experimental hypothesis. The source does **not** require applying either of them to Liber Primus.

## Original base29 models executed on untouched 2014 LP2 ciphertext

Page-only transcription records are joined **before** extracting complete original words, so cross-page continuations do not create false words. The source-visible unknown chapters have exactly **158, 378 and 66** printed words in the three tested groups.

| Original region | Printed words | Arithmetic EOS + nonempty | Arithmetic canonical exact | Huffman full nonempty EOS | Huffman canonical exact |
|---|---:|---:|---:|---:|---:|
| **p0–2** | 158 | 128 | **3** | 3 | **2** |
| **p33–39** | 378 | 308 | **7** | 9 | **9** |
| **p54–55** | 66 | 56 | **0** | 1 | **1** |
| **p57 clear/solved negative control** | 20 | 18 | **1** | 0 | **0** |

Arithmetic "EOS + nonempty" can often be manufactured by decoding a random point with a positive EOS probability; canonical roundtrip is the discriminating condition. Every arithmetic tested region reached EOS within the cap; empty decode counts were **30,70,10,2**, respectively. Huffman invalid/unterminated counts were **155,369,65,20**, respectively. The tiny number of canonical word matches is consistent with accidental packet structure; those outputs are isolated, disconnected fragments. For instance, in the unknown opening chapter a perfectly re-encodable Huffman output is three-rune `THA` from `OLC` and a one-rune `O` from `OAE`, not a recovered passage. In p33–39, an isolated `A` appears alongside nonwords. No entire original unknown chapter or sentence decodes under either public codec.

For comparison, all 200 positive known-English words satisfy *both* exact decoding and exact forward reconstruction. The original p57, which is already clear GP text and was not hypothesized to be packed by the codecs, behaves like unrelated input rather than a false decoder success.

The test does not infer plaintext from an output's occasional familiar Latin fragment: both complete original compatibility and native-language coherence are required. It also does not reclassify the original 86 repeated neighbours as errors. The 86 are part of the unchanged source bytes.

## Additional no-repeat GP28 mixed-radix arithmetic inverses

**Independent model change (Agent 48):** The preceding two word codes produce unrestricted base29 digits and do not directly explain the manuscript's 86 adjacent repeated ciphertext symbols among 12,901 within-page transitions. The [new exact CommonJS SFT](../sims/lp2_word_mixedradix28_arithmetic_sft.cjs) therefore freezes two **different** numerical output transports, retaining exactly the preceding 875-word, 4,441-frequency, 30-symbol arithmetic+EOS language model and its canonical shortest fully contained interval rule:

* **Mode C, word-reset radix29/28:** Encode the first digit of a complete printed word in radix29. Encode each subsequent fractional digit in radix28. At each subsequent position, use the digit's rank among the **28 GP29 runes other than the immediately preceding printed rune**; this is a one-to-one mapping between 0–27 and the allowed GP output alphabet. Arithmetic encoding selects the shortest mixed-radix cylinder entirely contained in the plaintext word-plus-EOS interval. It does not fit a secret alphabet, key, book phase or spelling.
* **Mode D, predecessor-carry radix28:** Use that same exclusion-ranking map for **every** output rune in each word, including the first, anchored to the preceding original ciphertext rune outside the word. The arithmetic interval has radix28 at every position. The first p0 word is given a public provisional GP-F initial state (index 0); the three separate later test regions are anchored to the actual immediately preceding original page's last rune, GP indices **12, 9 and 15**, respectively. No phase is fitted. A word that contains a repeated rune, or whose first rune repeats the carried predecessor, is an **explicit ineligible source word**, counted and left unchanged.
* Both are fully reversible and prefix-free on their own defined no-repeat output domain. A candidate input is accepted only if arithmetic midpoint decoding reaches a **nonempty** EOS word *and* the frozen shortest-code forward encoder reproduces **every original source glyph exactly**. The decoder never silently drops or repairs the genuine duplicate symbols. Existing authentic GP spelling includes ING→NG and IO→IA. Both new transports independently recover and re-encipher **200/200** planted native source words; an actual unchanged p57 negative control is also tested.

The second model is more faithful to page-continuous suppression of repeated output glyphs, although **neither original source specifies exclusion ranking, an arithmetic frequency model, a way to signal the exceptions, or a reset grammar**. These are conditional original-cipher tests, not creator attributions.

| Exact untouched source region | Printed words | C: canonical exact | C: ineligible doublets | D: canonical exact | D: ineligible doublets |
| --- | ---: | ---: | ---: | ---: | ---: |
| **p0–2** | 158 | **2** | 2 | **4** | 4 |
| **p33–39** | 378 | **3** | 8 | **6** | 12 |
| **p54–55** | 66 | **2** | 1 | **1** | 3 |
| **p57 clear negative control** | 20 | **0** | 1 | **0** | 1 |

The source input was not edited and the printed complete words were reconstructed exactly across lines/pages. The isolated canonical candidates are **not coherent recovered sentences**: mode C p0–2 yields only \`NGOT\` from \`MTNE\` and \`URILM\` from \`FLWEOTAE\`; mode D p0–2 yields \`OS\`, \`EAO\`, \`D\` and \`EWOES\` at disconnected positions. Among mode C's **156**, **370**, **65** eligible source words in the three independent unknown regions, **2**, **3**, **2** match canonical output. Among mode D's **154**, **366**, **63** eligible words, **4**, **6**, **1** match. These fractions supply no real plaintext, and neither mode can decode a chapter as published. At least the untouched original repeated-glyph events would still require a separate explicit escape rule.

The committed SFT's **actual source text** was executed under a V8 adapter with the three unchanged GitHub source files, with Node built-in \`fs\`, \`path\` and \`assert\` facsimiles; all original count assertions and both sets of 200 exact plaintext plants passed. This is a direct execution of the checked-in JavaScript source and its original-input assertions; a native Node22 CI run for this additional script has **not** been claimed. Its output is pinned by the eight regions and their source-word, exception and exact-canonical counts above.

## Decision and next research choice

**Retire these four explicitly specified EOS-terminated source-word entropy transports (two base29, two no-repeat radix28).** An authentic inverse would have to account for the precise original printed source symbols and punctuation and explain why its particular compressor/model and packet reset were source-selected. These four do not. The source supplies only a BASE29 numeral convention, not the entropy codec or a rule for the real adjacent duplicates; inventing a learned per-word probability table or extra escape bytes to rescue failed ciphertext loses falsifiability.

The remaining viable compression branch would need **independent historical evidence for an actual serialized codec or a header/footer carrying its model and framing**. Absent that, prioritize recovering an external key, an authenticated ciphertext transformation, or the missing original p56 continuation over adding arbitrary compressors. No unknown LP2 plaintext, authentic key, or endpoint recovered.

**Reproduction:** [original GP29 word-code CJS SFT](../sims/lp2_word_entropy_base29_original_sft.cjs), [successful original-input GitHub Actions run 43462896875](https://github.com/FlareZ123/liber-primus/actions/runs/43462896875); [new GP28 mixed-radix source-original CJS SFT](../sims/lp2_word_mixedradix28_arithmetic_sft.cjs), independently executed with its original GitHub inputs in the V8 tool runtime. Both scripts are read-only. Only the first script has a native GitHub Actions run on record.
