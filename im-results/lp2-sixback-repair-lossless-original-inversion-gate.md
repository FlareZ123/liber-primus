# Six-back collision repair: exact lossless-inverse requirement on original LP2

**Decision, 16 November 2026 (Agent 8, Director Issue [#1187](https://github.com/FlareZ123/liber-primus/issues/1187)):** The externally proposed M1 six-back **overwriting** repair is many-to-one on the intact original 12,956-rune ciphertext, even with its base cipher key fixed. There are 79 independently selectable, full-book source-input ambiguities supported by the original glyphs. Without a source-selected restoration state, this stochastic overwrite is not a lossless cipher inverse. No unknown-page plaintext, authentic key, required restoration channel, or recovered destination follows. An unrelated invertible cipher with a six-back dependency remains possible.

## Upstream evidence and precisely tested architecture

The relation `C[j] = (24 - 2*C[j-6]) mod 29` for positions `j>=6` within each printed word is **prior art**. It holds at 80/1,290 original positions in 74 words; the strongest candidate of the earlier full 5,684 affine-map/lag search has familywise empirical p approximately 0.013 under that search's exact null. [Earlier complete original-site census](lag6-conditioned-echo.md) and [its signed-2013 DH source bridge](2013-signed-dh6-original-lag6-source-bridge.md) establish both the ciphertext relation and the period-authentic numbers before this test.

The independent [pnotisdev Phase 25 mechanism report](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase25_mechanisms.md) and [actual M1 emitter](https://github.com/pnotisdev/cicada3301/blob/main/work/mech25/sim25.py) define a concrete candidate:

1. At each original plaintext rune, compute an unobserved base `x=(P+K) mod29`.
2. If `x` equals the **previous emitted ciphertext rune**, a random repair event occurs with probability `q=0.81`.
3. When at least six earlier emitted runes are present **within the same word**, replace the current emission with `T(C[j-6]) = 24-2*C[j-6] mod29`.
4. If that replacement equals the preceding emitted rune, the external implementation substitutes an additional random different rune. For positions before the sixth word-local step it uses an M0 random-other fallback.
5. Key consumption is one base key value per plaintext rune in M1, with no flag or repaired source rune emitted.

The exact original-source [CommonJS SFT](../sims/lp2_sixback_original_inverse_sft.cjs) reads `resources/liber-primus/lp2-transcription.txt` and asserts equality with the complete original `lp2-corpus.json` GP29 stream, 2,896 words, 12,956 runes, and 32 physical-page carry words. It evaluates only the j>=6 word-local branch, where the information-loss conclusion is already decisive. For the constructed ambiguity sites, the final fallback is *never* invoked because `T(C[j-6])` differs from `C[j-1]`.

## Original-cipher inverse and exact collision accounting

The observed source positions split as follows:

| Original source condition, within a printed word j>=6 | Number |
|---|---:|
| Eligible word-local positions | **1,290** |
| `C[j] == T(C[j-6])` | **80** |
| `T(C[j-6]) == C[j-1]` | **33** |
| T6 matches with `T(C[j-6]) != C[j-1]` | **79** |
| T6 matches with target equal to predecessor | **1** |
| Observed immediate doublets at nondegenerate target positions | **8** |
| Original page-carry words | **32**, with **43** j>=6 positions |
| T6 matches in those page-carry words | **3**, all located after the physical-page seam |

At each of the **79** nondegenerate T6 matches, put `a=C[j-1]`, `b=T(C[j-6])`, so `a!=b` and the visible glyph is `C[j]=b`. Two source possibilities produce **exactly the same** output:

- **Ordinary:** unmodified base `x=b`, no collision repair, emits `b`.
- **Repair:** unmodified base `x=a`, collision repair succeeds, emits `b`.

The emitted past and future ciphertext is identical in both cases. No decision at one of these sites changes the state visible to the next source position. Hence independently choosing either input at all 79 sites yields **at least `2^79` distinct original-length source tapes** emitting the exact **same whole original ciphertext**. With any fixed additive key schedule that does not advance differently on repair, these 79 distinct base-input positions correspond to 79 distinct plaintext GP29 runes. The SFT constructs **two complete 12,956-rune input tapes** differing at all 79 sites, then independently forward-emits the original glyph at every position under both choices with the *same* illustrative full-length key. This is a source-input non-injectivity witness, not a synthetic English plaintext claim.

A unique source reconstruction in this concrete architecture therefore requires **at least 79 binary decisions in the worst-case witness**, or an independently available constraint supplying equivalent information. A Bayesian prior can rank the alternatives but does not make the exact cipher inverse unique. Under the idealized uniform-base stochastic model with `q=.81`, the conditional probability of the repaired branch given one nondegenerate T6 match is `q/(1+q)`, yielding approximately **78.37 Shannon bits across 79 sites**. This probabilistic figure is model-dependent; the 79-bit distinguishability witness is exact.

### A useful rate prediction, and its scope

The same original j>=6 positions offer two distinct observable event counts among the **1,257** cases where `T(C[j-6]) != C[j-1]`:

- **8** immediate repeats imply `q_hat = 1 - 29*(8/1257) = 0.815433572` if the unseen base is uniform GP29.
- **79** T6 matches imply `q_hat = 29*(79/1257)-1 = 0.822593477` under that same idealized base model.
- Using the first estimate alone, the predicted number of T6 matches is **78.689655** versus the actual **79**.

This is a compact **joint consistency diagnostic** for collision suppression and six-back overwriting. It does not identify a historical repair rule: the T6 relation was selected after inspecting this same book, uniform base/key is unestablished, and both event counts use overlapping original material. The external simulations themselves fail to reproduce the S-specific lag-five carrier and printed word-length histogram.

The original chapter counts for eligibility/matches are: p0–2 **79/6**, p3–7 **106/6**, p8–14 **184/10**, p15–22 **178/13**, p23–26 **100/5**, p27–32 **144/11**, p33–39 **162/9**, p40–53 **302/20**, and p54–55 **35/0**. These demonstrate that the ambiguity cannot be repaired by treating only the beginning of a word as a special case. Across the 32 authentic page-carry words, there are 24 eligible after-seam positions with three target matches, two in consecutive positions of the p45→46 word. An ordinary physical-page reset would have to explain this original continuation, not delete it.

### Independent null implementation, no new discovery claim

A deterministic 5,000-repetition null fixes *each actual printed word's* multiset, length and adjacent-equal-pair count. It evaluates **812** possible invertible affine maps at word-local lag six (seed `0x6b31a250`). Original T6 is rank 1: **80** matches versus null **45.6694 ± 6.5611**, standardized score **5.23244**. Three of 5,000 whole-book nulls have an affine maximum at least this high; familywise add-one p **4/5,001 = 0.00079984**. This only corrects *812 maps at the already selected lag six*, and is nested inside the **earlier, wider 5,684-map/lag family** with corrected p approximately 0.013. It is a software and calibration control; it does not establish an independent source clue, cipher, plaintext or recovered key.

## Full M1 generator also fails the five-apart S carrier

The previous original-cipher research identified **11** word-local five-apart echoes of the literal GP29 S=index15. Of the 2,105 eligible j≥5 positions on the unchanged manuscript, **74** have S exactly five runes earlier. Crucially, none of those 74 original sites has the T6 overwrite target equal to S, so the six-back M1 overwrite cannot preferentially generate any of these eleven events.

With q=0.81543357 estimated from the distinct **eight** surviving j≥6 doublets, the exact published M1 emission probabilities conditional on the original preceding runes yield only **2.51858460** S5 events expected among those 74 sites. Tuning q from0 to1 moves the expectation only from **2.55172414** to **2.51108374**.

The [new source-exact M1 generator SFT](../sims/lp2_sixback_m1_s5_generator_sft.cjs) runs 15,000 seeded complete stochastic M1 books with the original **2,896 word lengths, 32 page-carry words, nine section resets and 12,956 symbols**. It implements iid uniform GP29 pre-repair bases, M1's q collision probability, six-back target and uniform-other fallback, including the final no-repeat guard. The fixed seed is `0x152ff00d`.

| Observable | Original | M1 simulated mean |
|---|---:|---:|
| Section-internal adjacent doublets | **86** | **82.4331** |
| Word-local T6 matches | **80** | **78.2686** |
| S at five-back eligible sites | **74** | **72.5115** |
| Five-apart S→S matches | **11** | **2.5059** |

Exactly **1/15,000** generated books reaches at least eleven S5 echoes; add-one empirical p **2/15,001≈0.0001333**. No generated book reaches both the actual S5 and T6 thresholds. This tests the completeness of one frozen generator against an **already-discovered** S5 anomaly, so the p-value is conditional model adequacy, not a discovery-wide significance assessment. M1 fits broad six-back/doublet counts yet fails the value-specific S carrier. A second S-specific operation would require independent source selection and a reversible restoration mechanism; varying q alone cannot supply it.

## Completion and next causal decision

The literal Phase 25 M1 operator cannot be a **lossless stand-alone inverse** of original LP2 while emitting only the original 29-way rune and keeping the next key phase fixed. The source material supplies a historical numeric way to *write down T6*; it does **not** supply the additional event flags, source-register restoration values, key-pointer jumps, or an independently specified word-local locator needed to recover one unique input.

**Do not** search another family of affine functions or retune the 0.81 repair probability to evade this information loss. A new branch merits implementation only after an **independently identified original-image instruction, historical 2014 operation or reconstructible external register** selects its restoration or state rule *before* decoding the same original runes. The separate Director [#1188](https://github.com/FlareZ123/liber-primus/issues/1188) concerns a genuinely length-changing insertion channel and should not be conflated with this exact-length overwrite.

**Reproduction:** [original-input Node22 CommonJS SFT](../sims/lp2_sixback_original_inverse_sft.cjs), [manual-only Windows Actions execution](https://github.com/FlareZ123/liber-primus/actions/runs/43793880343). The same committed SFT was directly executed against the exact canonical source bytes in a JavaScript runtime with all assertions passing and the complete 5,000-null output above; the linked native Windows workflow may have a separate queue delay.
