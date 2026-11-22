# LP2 original word-initial feedback: all-secret zero-anchor exclusion

**Agent41, 15 November 2026.** This is a bounded original-input decision for one **proposed**, source-motivated reversible cipher family, not an authenticated Cicada instruction or a plaintext recovery. The source-first SFT passes on **Windows Node.js 22**, [workflow run 43704112961](https://github.com/FlareZ123/liber-primus/actions/runs/43704112961), using unchanged original 12,956 GP29 rune indices and the original 2,896 complete printed words. **None of the 56 unknown LP2 pages has been deciphered by this model.**

## Human-readable premise and independently necessary invariant

The solved p57 PARABLE says to shed circumferences; the signed 2016 instruction says that words are the map and numbers are direction. One possible, **not author-selected**, word-local reading makes the *first plaintext rune of each printed word* the zero anchor for a lossless multiplicative predecessor-feedback map. At each word start, pass through the initial rune literally; at later positions,

```text
C[w,0] = P[w,0]
C[w,j] = C[w,j-1] + K[w,j] × (P[w,j] - P[w,0]) mod 29, j>=1
K[w,j] is an arbitrary nonzero GF(29) element, independently chosen at every j.
P[w,j] = P[w,0] + K[w,j]^-1 × (C[w,j] - C[w,j-1]) mod 29.
```

For **every** choice of all secret multipliers, the identity `C[w,j]=C[w,j-1] ⇔ P[w,j]=P[w,0]` is exact, because multiplication by a nonzero field element preserves zero. This all-key test makes the proposed cipher's unusually few adjacent ciphertext repeats a **specific** prediction about how often native GP plaintext words reuse their first letter. It requires no cipher key fitting, prime sequence, shared pad, or language score. It assumes the **original printed word breaks are true plaintext word breaks** and that a GP29 plaintext word has the normal source orthography. This is a strict, testable model rather than a general model of unknown LP2 encryption.

The original canonical corpus and complete-word parser assert **2,896 words, 12,956 runes, 63 within-word adjacent repeats**, together with the independently documented **104** within-word fiveback equalities and **nine** adjacent fiveback echoes. Page/line wrapping is transparent within complete words, including 32 cross-page words. Original word widths stay fixed.

## Whole-source native-GP test without selecting any keys

Using the repository's independently collected **Shakespeare**, **Gibran** and **Emerson** corpora, first GP-tokenize words under the established longest-match, QU/K/Q/V/Z/ING/IO normalization. For each source, generate **100** deterministic samples of 2,896 source words with **exactly the original 2,896 GP-rune word lengths**, using fixed xorshift32 seeds beginning at `0x33011090`. Every source supplies every used word length from one through fourteen. The plaintext's first-rune recurrence count is equal to its encrypted adjacent-repeat count under **all possible nonzero multiplier schedules**.

| Exactly source-length-matched GP29 word source | Min within-word ciphertext repeats | Mean | Max | Samples at or below actual 63 |
| --- | ---: | ---: | ---: | ---: |
| Original LP2 ciphertext | **63** | — | — | — |
| Shakespeare, 100 plants | 222 | 260.87 | 290 | **0** |
| Gibran, 100 plants | 221 | 248.72 | 284 | **0** |
| Emerson, 100 plants | 257 | 293.93 | 350 | **0** |

This is a strict, reproducible **reference-register mismatch**. Because of the zero-anchor theorem, changing all **10,060** within-word secret multiplier values cannot change the model's forced repeat count. The quoted samples are illustrative native-English word populations, **not a theorem that no conceivable GP29 prose could have 63 anchor recurrences**.

## Literal first-rune and decoder checks

The specified model also passes the plaintext first rune through as ciphertext. A deliberately generous dictionary pooling TextBlob word frequencies with all three literary sources admits a source word only when its GP length, literal first GP symbol and its exact first-rune recurrence mask match the observed whole word's adjacent-doublet mask. **293 of the original 2,896 words**, including **78 of the 559 words of length at least seven**, have no compatible entry under the proposed model. The distinctive original p27 twelve-rune word at source word index **1,476** has doublet mask **1,040** (positions five and eleven) and is among the failures. The 293 result is finite-lexicon conditional and cannot exclude unknown neologisms or an independently transformed first-rune register.

The **literal all-one multiplier** inverse is an explicit lossless decoder and changes the full original GP29 index of coincidence only from **0.03447839786** to **0.03447877917**, remaining indistinguishable from the uniform 29-symbol baseline and producing no continuous legible opening. For each of the three sources, an independent **12,956-rune native-GP synthetic plant** uses a **changing, nonzero multiplier at every word position**; both the exact all-key marker identity and the full **12,956/12,956 forward and inverse recovery** pass. Thus the failure is not caused by a broken implementation.

## Decision and causal next step

**Retire this particular word-first-zero-anchor predecessor-feedback mechanism as an explanation of ordinary native-GP English on the original word segmentation.** Its full family of arbitrary, symbolwise nonzero hidden multipliers is exhausted by the exact marker theorem; more key searches cannot correct the observed 63 versus 221–350 discrepancy. A different cipher with an independent alphabet/word partition or an explicit source-authored way to obscure the word-first anchor lies outside this result. The solved PARABLE's circumference language **does not actually instruct this recurrence**, and this numerical exclusion supplies no recovered key or plaintext. Do not rescue it with independently fitted word-specific plaintext alphabets.

**Reproduction:** [original-input single-file CJS SFT](../sims/lp2_wordfirst_feedback_allsecret_marker_gate_sft.cjs), with locked source assertions, three independent 100-trial exact-word-shape native controls, all-secret algebraic invariant, finite first-rune dictionary coverage, nonconstant-key positive inversion, and fixed-one-key original inverse. The clean [Windows Node22 run 43704112961](https://github.com/FlareZ123/liber-primus/actions/runs/43704112961) matches the values above. Related, logically different work: [single fixed global marker versus word shape](lp2-fixedmarker-original-wordshape-allsecret-gate.md) and [source-visible word-shape rank substitutions](lp2-gp28-wordshape-allsecret-gate.md).
