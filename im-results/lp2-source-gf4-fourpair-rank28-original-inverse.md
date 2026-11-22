# Original p7 GF4/four-anagram source key as a complete rank28 anti-repeat decoder

**Agent 4, 22 November 2026. Negative bounded mechanism test.** The independently observed fourth black/red source-word anagram is a correctly held-out original source equality under a previously frozen p7-GF4/radix59 key. Here that exact key is additionally tested as a *candidate* source-derived rune-value-changing anti-repeat decoder. No author-signed instruction has been found to select this rank28 decoder, and **no unknown LP2 page plaintext is recovered**.

## Frozen source, operation and original receiver

The previous [four-pair report](lp2-scroll255-gf4-radix59-untrained-anagram-fourth-equality.md) verifies that the 255 scroll words on p3–p7, the p7 last red-word products `[11,26,8,15,2]`, the four-tap GF(4) 255-address state, and the 256 printed p49–p51 numeral cells read as radix59 yield a source key `K[0..254]`. The key makes all four source repeated-multiset word-pairs equal, including the newly held-out cross-ink anagram `EO·X / X·EO`. No key parameter is changed for this experiment.

The proposed decoder reads the full unmodified **10,827 original GP29 ciphertext runes on p9–p55**, with previous cipher rune equal to the **actual final p8 rune**. Compute each modulo29 difference `d=(C[i]-C[i-1]) mod29`. Decode repeated difference zero as the reserved GP index28; otherwise decode `P=(d-1 ± K[clock(i)]) mod28`. The sign is both ±, and the key clock is either original rune ordinal modulo255 or original complete-printed-word ordinal modulo255, explicitly preserving line/page wraps. The repeat exception allows exact inverse encryption: index28 emits an unchanged previous ciphertext rune, while every other output selects one of the 28 nonzero adjacent cipher differences. The table and source key are fixed independently of the original output; **the repeat-escape index and rank28 arithmetic are not historically authenticated**.

## Result

All four original full-length inverse streams remain effectively uniform GP29-like output, not readable native Liber Primus prose. Whole-output coincidence indices:

| Key sign | Clock | Full p9–p55 IoC |
| --- | --- | ---: |
| − | Rune | 0.035296105379 |
| − | Word | 0.035265869851 |
| + | Rune | 0.035271039922 |
| + | Word | 0.035271142299 |

Each uses **73 original zero-difference repeat escapes**. Page-local p9, p16, and p40 outputs are likewise not sustained GP-native prose. By contrast genuine solved p57 has a source-native 95-rune GP29 coincidence index **0.062709966405**. Both rune-clock inverses **reencrypt exactly the original 10,827 ciphertext runes**. The same fixed rune-clock operations recover **all 95/95 genuine solved-p57 GP runes** from independently produced planted ciphertext for both signs, including an inserted index28 repeated-ciphertext exception. These planted results are implementation controls, not decipherment of original unknown text.

The [reproducible Windows Node22 SFT](../sims/lp2_source_gf4_fourpair_rank28_original_cipher_sft.cjs) reads the original committed corpus, numeral panel and physical transcription and ran successfully from the exact committed source against original GitHub source material. No language-model-generated plaintext, key tuning or omitted original glyphs are used.

## Decision

The new source constraint **4/4 Parikh equalities** remains valid as conditional evidence that a mathematical relation may exist between the scroll words and p8. The **four direct rank28 prior-cipher anti-repeat consumers tested here all fail to recover native plaintext**. This rejects only those four concrete sign/clock versions, not every source GF4 consumer or the underlying original anagram equality. Further productive work must derive a **source-authorized nonlinear, permutation-invariant whole-word digest or source-selected downstream cipher operation**, not rescue the rejected decoder with unconstrained phases or output-optimized keys. Prior original [12-phase secret-additive checksum obstruction](../sims/lp2_scroll255_gf4_radix59_secret_wordhash_obstruction_sft.cjs) precludes an ordinary additive rune-weighted digest in this exact source registration.
