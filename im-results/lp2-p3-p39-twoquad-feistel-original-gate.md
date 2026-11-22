# The original red p3/p39 quadratics as two-rune Feistel rounds: complete frozen original inverse

**14 November 2026, Agent 6 · Director #867. Source-conditioned finite negative. No unknown-page plaintext, creator key, complete original cipher, or destination recovered.**

## A reversible operation actually motivated by the visible mathematics

Two original independent red triads give GP29 polynomial coefficients:

- **p3:** `[13,23,2]`, or `P(x)=13+23x+2x² mod29`.
- **p39:** `[27,5,15]`, or `Q(x)=27+5x+15x²=15(x−24)² mod29`.

The latter is noninjective on F29, so **directly treating Q as a substitution loses information**. A standard two-register Feistel transform makes any such polynomial a reversible, 29×29-symbol encryption round without needing its inverse. The original p15 has a separate 4×4 number square and an infinity mark; those visible forms motivate testing a small number of repeated source-polynomial rounds. **No first-party instruction specifies Feistel, a round order, a key, or a block clock**, so this is a bounded proposed direct consumer rather than recovered historical practice.

For a pair of adjacent GP29 plaintext indices `(L,R)`, one round using source `F∈{P,Q}` is:

`(L,R) → (R,(L+F(R)) mod29)`.

The exact inverse of a round is `(L,R) → ((R−F(L)) mod29,L)`. Noninvertibility of F is irrelevant to the pair cipher. The entire original unknown manuscript has **12,956 even-indexed rune positions** and p55 has **76**, so neither requires padding or an invented symbol. Use printed *rune order* uninterrupted, with the paired register allowed to cross original printed word and page boundaries. This is a deliberate unverified clock assumption.

## Finite, no-key original test

The single-file source SFT tests **40 complete original inverses**: 1, 2, 4, 8 and 16 Feistel rounds; constant P, constant Q, alternating PQ and QP round functions; and both directions of pairing each original adjacent-rune pair. Each chosen forward operation is inverted on *all* 12,956 original unknown runes, then forward-applied to the reconstructed candidate to confirm **12,956/12,956 exact re-encryption**. For every one of the same 40 models, the original already-solved **p57 first 94 clear GP runes** are encrypted as a positive control, decoded, and recovered **94/94**, confirming the genuine inverse independently of plaintext guesses.

| Observable GP29 IoC | Value |
| --- | ---: |
| Original 12,956-rune unknown ciphertext | **0.034478397865** |
| Lowest across all 40 complete Feistel inverses | **0.034456878007** |
| Highest across all 40 complete Feistel inverses | **0.034561069387** |
| GP29 uniform theoretical reference | **1/29 ≈ 0.034482758621** |

None approaches the native solved/plain-English GP register (~0.06). The best-by-IoC (postselected) candidate uses 16 rounds alternating P,Q, reversed original pair order, and opens `U W X U R U C A R D IA O EA EA M D A D F OE D W S H`, not recognizable contiguous original prose. Another high-IoC result at two PQ rounds starts `F J T X Y TH M I TH F C O Y I G D D X O I EO G I EA`. These are diagnostics only; neither creates a credible plaintext or creator-selected key. The case count is a **finite operation screen**, not an exhaustive theorem over all Feistel designs.

## Interpretation and next decision

**Reject the direct unkeyed two-rune p3/p39 red-quadratic Feistel reading, with exactly the above fixed 40 register and round conventions.** It efficiently addresses the mathematical irreversibility of Q, and its implementation passes original-source and independently authentic cleartext controls, but produces no recognizable English GP output from actual unknown ciphertext.

This does not eliminate a source-authenticated nonzero round key, a four-rune state, a word-boundary-dependent Feistel system, a different output register or unknown cipher layering. Additional unconstrained Feistel round counts, byte-order rotations or invented whitening constants would be a low-value expansion until an independent original clue selects them.

**Reproduce:** [standalone Node22 CommonJS source SFT](../sims/lp2_p3_p39_twoquad_feistel_original_sft.cjs) using [original LP2 GP29 source](../resources/liber-primus/lp2-corpus.json). [Successful manual original-source CI run 43623268172](https://github.com/FlareZ123/liber-primus/actions/runs/43623268172).
