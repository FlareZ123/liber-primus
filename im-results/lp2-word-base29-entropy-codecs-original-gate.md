# Two lossless word-reset GP29 entropy codecs: original-input negative

**Agent 16, 13 November 2026, Director Issue [#769](https://github.com/FlareZ123/liber-primus/issues/769).** Original physical LP2 p0–2, p33–39 and p54–55 were passed unchanged through two deterministic, reversible, public pre-2014 coding families. Both codecs correctly encode, decode and forward-reconstruct **200/200** fixed native solved-LP1 GP words. Neither yields coherent unknown plaintext or an even approximately complete canonical decode on any of the three original unknown chapters. No key or independent human solve-path selector was recovered.

## Upstream premise and selector weakness

The historical 2013 Cicada BASE29 instruction establishes a GP numeral-to-integer reading. The original unknown book has **12,956 near-uniform GP29 runes**, with only 86 adjacent duplicates in 12,901 eligible same-page transitions. One possibility is a plaintext *compressor or enumerative fractionation* before runic printing rather than a changing 29-symbol substitution.

**The strongest contrary evidence is prior to this experiment:** neither the 2013 BASE29 source nor the 2014 manuscript prescribes Huffman coding, arithmetic coding, EOS termination, the English frequency table, word-by-word resets, or a bit-length sentinel. The tests below are two exact illustrative invertible decoders with no unknown keys, **not a theorem against entropy coding generally**. The original punctuation is preserved, including cross-page words. This is separate from previous fixed-S GP28 exclusion, secret GF(29²) map and ciphertext-feedback model gates.

## Exact fixed input and forward models

The reproducible [CommonJS source](../sims/lp2_word_entropy_base29_original_sft.cjs) uses only the canonical manuscript GP index order, printed page text, and the independently solved LP1 reference.

* Train a **30-symbol static model** on the LP1 source's **875** GP-transliterable words (29 rune classes + explicit word-end EOS), using GP greedy transliteration, source-attested ING→NG, V→U, K→C and Z→S; give every symbol one pseudocount. The total frequency is **4,441**, EOS frequency **876**, first eight GP symbol counts **[74,178,119,330,216,122,58,104]**. This reference model is fully disclosed and fixed; its counts are not claimed to be an author-selected cipher key.
* **Model A, arithmetic:** use exact integer rational arithmetic and the 30-symbol cumulative table to encode each complete GP plaintext word followed by EOS. Emit the *shortest* base29 digit interval entirely inside its terminal arithmetic interval, selecting the smallest such integer. Decode original GP29 ciphertext word by taking its exact interval midpoint until EOS, to a fixed maximum of 75 output runes. Re-encode each candidate under the unique canonical rule and require identity of *every original input digit*.
* **Model B, Huffman:** construct the standard binary Huffman tree from the same 30 frozen frequencies. Ties break by lowest GP leaf index. Encode plaintext runes and EOS as bits, prefix a literal high bit **1** to retain leading-zero bit length, then represent the full integer as a minimal big-endian base29 numeral. The decoder requires a full nonempty word ending at EOS with **no remaining trailing bits**. Re-encode and compare exact original GP29 digits.
* Both models have **no learned or fitted per-ciphertext parameters**, no external secret, no chosen phase, no auxiliary state and no unspecified escape symbols. Each printed word resets separately, while the real original chapter and physical page breaks remain intact. Punctuation itself is treated as the published unencrypted word boundary. The short-code "empty decoded word" is explicitly invalid as a plaintext printed word.
* The same pinned **200 real solved-LP1 control words** (model source positions 50–249) are independently encoded and then decoded. **All 200/200 words** recover their source rune sequence and reproduce their canonical ciphertext, in both models.

These procedures are historically available reversible codec families, but the particular word-packet framing is a frozen experimental hypothesis. The source does **not** require applying either of them to Liber Primus.

## Executed on untouched 2014 LP2 ciphertext

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

## Decision and next research choice

**Retire the two explicitly specified word-reset, EOS-terminated base29 entropy transports.** An authentic inverse would have to account for the precise original printed source symbols and punctuation and explain why its particular compressor/model and packet reset were source-selected. These two do not. The source supplies only a BASE29 numeral convention, not the entropy codec; inventing a learned per-word probability table or extra escape bytes to rescue failed ciphertext loses falsifiability.

The remaining viable compression branch would need **independent historical evidence for an actual serialized codec or a header/footer carrying its model and framing**. Absent that, prioritize recovering an external key, an authenticated ciphertext transformation, or the missing original p56 continuation over adding arbitrary compressors. No unknown LP2 plaintext, authentic key, or endpoint recovered.

**Reproduction:** [Node 22 CJS SFT](../sims/lp2_word_entropy_base29_original_sft.cjs); [successful original-input GitHub Actions run 43462896875](https://github.com/FlareZ123/liber-primus/actions/runs/43462896875). That run includes exact original words, positive assertions, canonical roundtrip status and all four frozen region counts. The source and CI remain read-only.
