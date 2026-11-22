# Nonlinear predecessor zero-map: full-secret original LP2 exclusion

**Classification: intermediate, source-conditioned, key-independent constraint.** No unknown LP2 plaintext, key, or author-selected cipher is recovered. This result extends the earlier exact-equality delta model to five **distinct fixed predecessor maps**. It does not exclude general nonlinear feedback, a freely chosen predictor, or ciphertext whose printed words are not plaintext word boundaries.

## Reversible proposed cipher and exact zero observable

For every noninitial rune within each original page, work over the 29-element prime field with an independently arbitrary unknown nonzero secret (k_i):

[
C_i=C_{i-1}+k_i(P_i-m(P_{i-1}))\pmod{29},\quad k_i\in\{1,\ldots,28\}.
]

Each physical page can start with its own independent seed. With the key and first plaintext rune, this operation has an exact inverse:

[
P_i=m(P_{i-1})+k_i^{-1}(C_i-C_{i-1})\pmod{29}.
]

The field has no zero divisors, so **every key, every starting state, and every key clock** must obey

[
[C_i=C_{i-1}]\iff[P_i=m(P_{i-1})].
]

This is a stronger algebraic gate than fitting a few short keys or a few synthetic samplers. It tests an explicit family of truly reversible ciphers regardless of the number of unknown secret multipliers.

The source candidates are five *fixed* 29-entry functions of the previous plaintext rune (x):

| Candidate (m(x)) | Motivation and limit |
| --- | --- |
| Prime weight of rune (x) modulo29 | Literal original Gematria Primus prime chart |
| Prime weight minus one modulo29 | The known prime-totient operation on solved p56 |
| (x^3\pmod{29}) | Source-motivated by the p28 Diffie-Hellman candidate exponent3 |
| (x^{27}\pmod{29}) | An inverse-like nontrivial field power; not an authenticated instruction |
| (8x+19\pmod{29}) | The p28 candidate DH packet's visible state fields (A=8,B=19) |

The GP prime chart and solved p56 totient are established. The p28 DH values and power choices are investigator interpretations; they do **not** make this whole-cipher recurrence a historical Cicada instruction. There is no fitted parameter, postselected orientation, ciphertext-dependent zero-map update, or ad hoc exemption.

## Actual original-input observable

From the source-exact `resources/lp2-transcription.txt` and independently checked `lp2-corpus.json`:

- 55 unknown rune-bearing physical pages, 12,956 original ciphertext runes.
- 2,896 complete printed words; all32 cross-page carries are retained rather than falsely separated into new words.
- 10,028 adjacent positions inside the same complete printed word **and** same physical page.
- Exactly **63** of those 10,028 ciphertext positions have equal adjacent runes. The remaining 23 of the book's 86 original within-page doublets fall between printed words.

For each proposed (m), the original cipher necessarily demands **exactly 63** plaintext (m)-successions at the 10,028 eligible sites, no matter how the unknown (k_i) values are chosen. We assessed that demand by drawing native-GP29 words with replacement from three fixed literary controls, matching **every one** of the manuscript's actual printed rune word lengths and its physical-page reset eligibility. The 2,896 words partition into 34 exact length/page-mask groups.

| Fixed predecessor map | Shakespeare expected count | Gibran expected count | Emerson expected count | Most permissive rigorous log10 upper bound on P(X ≤63) |
| --- | ---: | ---: | ---: | ---: |
| GP prime mod29 | 425.090 | 401.760 | 413.610 | **−105.67** |
| GP prime-totient mod29 | 452.320 | 440.609 | 474.317 | **−122.53** |
| GP cubic power | 153.885 | 183.864 | 195.773 | **−15.22** |
| GP exponent27 | 185.787 | 146.384 | 159.124 | **−13.85** |
| DH-affine 8,19 | 129.715 | 103.845 | 92.585 | **−2.38** |

The tail values use a mathematically explicit Chernoff bound optimized over positive tilts. Their probability model is **only** independent with-replacement source-English whole-word sampling matched to the manuscript's 34 exact length/page masks. They are *not* the probability Cicada used any particular cryptosystem, nor are they valid for other languages, deliberately engineered unnatural prose, or words transformed before encryption. The DH-affine candidate is substantially less disfavored under Emerson than the others, yet it does not produce an original plaintext receiver.

## The original p27 doublet-bearing long-word discriminator

The unique page-local 12-rune word at p27 rune offset79 is originally

`ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ` (EO R N S O O C A E Y E E).

Its complete within-word equal-output mask has events at zero-based word positions **5 and 11**. Hence under the proposed cipher its unobserved plaintext would have to satisfy (P_5=m(P_4)), (P_{11}=m(P_{10})), and exactly zero other eleven-position (m)-successions. In the pinned TextBlob word-frequency lexicon there are **890** representable, distinct 12-GP-rune English types. **Zero** have this entire mask for *any* of the five frozen predecessor maps. This is a finite-lexicon support gate, not a proof that no English word could ever match the mask.

## Positive original-layout inverse and scope

The [single-file Node 22 source-exact reproducer](../sims/lp2_nonlinear_zero_map_allsecret_source_gate_sft.cjs) decodes and re-encrypts a 12,956-rune Shakespeare-derived **native GP English plant** for **each** of the five maps. Each plant keeps all 2,896 original word lengths, original 55 page resets and 32 carries, with an independently changing nonzero multiplier at every eligible original position. All 12,956 decoded runes exactly match their source inputs, and the zero-step equivalence is checked at every within-page successor. The same script asserts all original counts, p27 word, 890-type mask obstruction, each fixed expected value, and every tail bound.

**Decision for Director #2083:** retire these five specific fixed nonlinear predecessor maps as explanations for **ordinary native-GP English while respecting printed word breaks**. This is an algebraic family-wide exclusion across all position-dependent keys for those maps, more general than previous (m(x)=x) or fixed-EA-marker tests. A productive successor needs source evidence selecting a *different exact predictor* and a key-clock/initialization rule; expanding ad hoc function families or tuning English register scores alone would not unlock the ciphertext.

The unconditional fact is the zero-step equivalence under the written recurrence. The native-English discrimination and finite dictionary coverage are explicitly **conditional**. No actual unknown plaintext, source-selected key, or solved page has been established.
