# Original LP2 five-phase language gate after a lossless cyclic GP28 successor codec

**Status (16 November 2026): bounded *whole-original* negative for one explanatory anti-repeat/five-back mechanism; no unknown plaintext or source-derived key.** 

## Why this candidate deserves a test

The original 12,956 unknown LP2 runes exhibit only **86 same-page adjacent doublets** and a significant within-word equality surplus at distance five. Source-image five-dot motifs and several earlier Cicada five-way operations make a five-phase construction a defensible *hypothesis*, although no authentic LP2 instruction selects this precise cipher. A low-parameter combination might explain both anomalies: a word-local five-phase substitution alphabet followed by a 29-state *anti-repeat emitter*. It must admit literal repeat ciphertext when the encoded state is its reserved rank28, as the original contains 86 real doublets.

This experiment admits **arbitrary secret 29! substitution alphabets for each of the five word-local phases on each original page** (55×5 independent secret alphabets in the largest version). It cannot be rescued by choosing different phase alphabets after seeing the original, because a bijection preserves the frequency of equal values *within each phase*. This makes a hard diagnostic possible without fitting a secret key.

### Fully reversible source-shaped receiver

For each subsequent rune of an original printed word, let `d = (cipher[i] - cipher[i-1] + 29) mod29`. Convert `d=0` to rank28, or `d>0` to rank`d-1`. This bijection of all 29 symbols can be forward-emitted using only the immediately previous ciphertext rune. The initial glyph of every word is excluded from scoring (it may be any IV). Following it, the word-local phase is `i mod5`, and original physical page is determined for each glyph (including the 32 words crossing visual pages). Neither the ciphertext's rune labels nor the actual 275 secret alphabets can affect collisions within a given (page,phase).

The unmodified community original-runic transcription parses to **2,896 printed words**, **12,956 rune glyphs**, **10,060 within-word successor positions** and **275 nonempty page-phase strata**, with **462,380 ordered within-stratum pairs**.

## Original-input gate and original solved-prose control

| Statistic | Source ciphertext directly | After reversible cyclic GP28 inverse | Genuine solved LP1 rune prose, source-matched to all 2,896 target word lengths |
| --- | ---: | ---: | ---: |
| Within-(page,phase) coincidence rate | 0.03449544 | **0.03580172** | **0.08699338** |
| Matching within-stratum unordered pairs | 7,975 | **8,277** | **20,112** |
| Available tested positions | 10,060 | 10,060 | 10,060 |

The LP1 control is made by selecting a *pre-existing authentic solved runic word* of exactly the same GP-rune length for each original unknown word, while maintaining the original page/glyph boundary metadata. All 14 source word lengths are supported by the independently published solved LP1 control corpus; this is **not an inferred unknown plaintext**. The control makes no assumption about exact word identities in LP2. The test additionally encrypts this native control with fully invertible, secret page-phase affine alphabets followed by the same GP28 anti-repeat mapping; it then inverts **all 12,956 planted runes exactly** and preserves the full native control collision statistic.

The original cyclic rank stream retains almost uniform symbol frequencies in each five-phase/page stratum. If ordinary native Gematria Primus prose underlay *pagewise fixed five-phase substitution alphabets*, the cipher receiver would retain native collision frequencies regardless of the unknown permutations. The observed conditional statistic is barely above the uniform `1/29` baseline and well below the matched source-native control. An independent per-word secret alphabet would evade this test but introduces thousands of new unprinted key choices, and is not established by this result.

### Boundaries and next decision

This is a **statistical exclusion of a source-shaped register**, not a mathematical proof that no possible atypical/artificial plaintext could be used. It does not exclude arbitrary nonlocal mixers, page-dependent positional streams, a codec whose last stage is *different* from cyclic GP28 ranking, or a five-phase key varying within words. It establishes that the straightforward layered explanation for anti-repeat plus five-back does not produce recognizably native GP29 text, even with entirely unknown five-phase alphabets and independently resetting keys on all pages.

A future decoder should explain where an **authentic key/operation** comes from before adding more degrees of freedom to this failed family. The source data is unchanged, and no trial plaintext is asserted.

Reproduce: [Node22 CommonJS SFT](../sims/lp2_rank28_fivephase_pageallsecret_native_gate_sft.cjs) · source [exact LP2 runes and word punctuation](../resources/lp2-transcription.txt) · [original native solved LP1 runic control](../resources/external/relikd-solved-gp29-native-v1.json) · [source corpus and GP29 alphabet](../resources/liber-primus/lp2-corpus.json).
