# Five-back GF29 power-feedback encoder: secret-independent original-input gate

**22 November 2026 · Agent7 · Director #2083. Outcome:** the *source-motivated* fifth-back cubic and inverse-cubic power-feedback family is incompatible with source-native, unchanged-word English under three original-layout word-length-matched controls. No unknown-page plaintext, historical key, opcode, or destination is recovered. This is a new bounded lag-five test, distinct from #2083's earlier lag-one and lag-six exponents and from the previously rejected fixed five-back echo marker.

## Source-motivated hypothesis and its independent rival

Cicada's 2013 DH arithmetic involves exponent **3**, and the original p8 Roman **XIX** supplies **19**, its multiplicative inverse modulo 28. Original p7 has five red words whose GP29 index products are independently established as `[11,26,8,15,2]`. Source-printed words exhibit an excess of exact five-back rune echoes, and the ciphertext has far fewer immediate repeats than native GP English. These facts motivate one genuinely *lossless*, word-local, five-back **plaintext** feedback candidate:

`C[w,j] = C[w,j−1] + k[w,j]·(P[w,j] − P[w,j−5]^e) mod 29`, for `j≥5`.

The first five runes per word are initialized without constraints. Every later multiplier `k[w,j]` may be an arbitrary, independently chosen **nonzero GF29 value**, unrelated to a periodic schedule, page or word seed; its value is deliberately **not** optimized. The inverse is `P[w,j] = P[w,j−5]^e + (C[w,j]−C[w,j−1]) / k[w,j] mod29` with known preceding plaintext and nonzero key. Thus at every eligible site, independently of *all* secret multiplier keys, the model demands:

`C[w,j] = C[w,j−1]  ⇔  P[w,j] = P[w,j−5]^e`.

The necessary condition is exact even for the nonbijective **power transform** `x^e`: the encoder is bijective in the *current* plaintext rune. The original source selects neither this recurrence nor any actual secret-key recovery procedure. The stronger rival is that low repeats arise from some other stateful output encoding or typography that does not preserve this equality.

## Frozen original cipher and native-control experiment

The [read-only Windows Node22 CommonJS reproducer](../sims/lp2_lag5_power_feedback_allsecret_original_sft.cjs) parses the untouched original `lp2-corpus.json` and `lp2-transcription.txt`, asserting **12,956** runes, **2,896** complete printed words, and exact word concatenation. Source line joins and 32 page-crossing words remain joined. Only a fifth-back site with both runes physically on the same page is eligible, leaving **2,073** sites across p0–55; **15** have equal adjacent ciphertext runes, including **3** in p40–53 floral pages.

Native controls are source-attested GP orthographic renderings of Shakespeare's first300k, Gibran's Prophet and Emerson's Essays from pinned `resources/control`. For each corpus, **300** deterministic seeded trials sample a complete native word of the *same GP rune length* as every original printed word; they retain the original printed-word positions, physical-page masks and output count. A full **12,956/12,956** inverse planted on native GP words under changing nonzero keys and the complete **2,073/2,073** zero-step equivalences succeed for each control. This establishes decoder validity without mistaking a planted cipher for creator evidence.

| Source-native control | e=3 predicted repeats ±SD | e=19 predicted repeats ±SD | Original |
| --- | ---: | ---: | ---: |
| Shakespeare | 77.37 ± 8.18 | 58.78 ± 8.14 | 15 |
| Gibran | 48.02 ± 6.94 | 79.59 ± 7.93 | 15 |
| Emerson | 68.69 ± 8.44 | 64.59 ± 8.41 | 15 |

The predicted counts for both *pre-source-motivated* exponents are many SD above original on all three controls. This **rules out the stated power-feedback model as a normal-word GP-English book encoder under the calibrated source register**, regardless of its secret multipliers. It does not exclude exotic plaintext, deliberately changed word breaks, a per-position change of power `e`, nonlinear transforms not captured by `x^e`, or an independent anti-repeat output stage.

### Full 28-exponent scope and no postselected rescue

The reproducer additionally computes all exponents **1–28** on the same controls *as exploratory, search-penalized alternatives*. Only **e=21** is within 2 SD of the original on all three *whole-book* controls: predicted **24.97, 19.44 and 19.38** repeats respectively. This exponent was selected by fit after observing LP2 and has **no independently supplied author opcode, key or receiver**. Its 21st-power transformation collapses nonzero GF29 values into four possible outputs, plausibly explaining the low rate without authenticating a historical cipher. The all-exponent family must not be reported as plaintext recovery, nor should e21 be used to justify another tuned key search.

The unusual printed p27 word `ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ` (global word1476, offset6606), already independently established by [the p27 two-disjoint-repeat original-image audit](lp2-p27-two-disjoint-doublets-one-null-hard-obstruction.md), creates two adjacent-repeat events at local offsets 5 and11. As an exploratory sensitivity check, a pinned TextBlob GP12 lexicon of **772** source-encoded unique English words gives **zero** candidate words with exactly these power-marker positions under **e3, e19 or e21**. A few postselected exponents admit ordinary English candidates, but those do not supply or constrain a historical decryption key. This observation remains finite-dictionary evidence; the complete original-page cipher is unsolved.

## Decision and next useful input

Retire fifth-back single-`e` **cubic/inverse-cubic** GP29 feedback with arbitrary nonzero per-position multipliers as a model of unchanged native GP English across the book. Do **not** try more multiplier sequences, all-secret seed scans, or a synthetic decoder under these exact rules: their zero-step signatures are already wrong before any key is selected.

The missing breakthrough is a **first-party source-selected output operation or key state** that acts on original ciphertext and predicts independent authentic plaintext. A candidate explanation for the rare doublets must also account for five-back echoes and line/page behavior without tuning the same observations repeatedly. Keep Director #2083 open for such a genuinely different mechanism.

**Reproduction:** [Windows Node22 PASS, run 44994928510](https://github.com/FlareZ123/liber-primus/actions/runs/44994928510). SFT: `node sims/lp2_lag5_power_feedback_allsecret_original_sft.cjs` from the repository root.
