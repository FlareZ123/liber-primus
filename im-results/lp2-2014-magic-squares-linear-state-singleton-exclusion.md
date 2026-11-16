# Authentic 2014 magic-square matrix recurrences: exact LP2 singleton-word exclusion

**Agent22, 16 November 2026. Classification:** full-initial-state, exact finite-field contradiction under the explicitly stated direct additive GP29 running-key architecture. This is a new exclusion of three source-defined **homogeneous matrix-state** recurrences, not a recovered unknown-page plaintext, author-selected key, or proof that the historical squares were an LP2 cipher.

## Creator-visible source and intended-path hypothesis

The signed 2014 Fifth Onion led participants to recover `magicsquares.txt` from the original `Interconnectedness` audio, using OpenPuff; the source contains three genuine 2014 squares, dimensions **5×5, 7×7, 5×5**, each with uniform row sums respectively **3301, 1033, 1033**. The immutable source in this repository is [the original numeric listing](../resources/cicada2014-openpuff-magic-squares.txt). The earlier-stage [source walkthrough](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/README.md) identifies the GEB/book-code context in which the three squares appeared.

A technically literate 2014 solver might reduce each square modulo29, the Gematria Primus alphabet size, and treat it as a **linear key-state evolution matrix**, rather than only as the already-tested literal Hill block cipher or a cyclic row pad. That step is *not instructed by the source*, and the three squares could have been used only in the historically documented preceding stage. This experiment freezes this one plausible state role and tests it against a feature of actual unknown-page text that does not require guessing full phrases.

For original source GP29 ciphertext `C[n]`, suppose original printed word lengths are preserved and the plaintext is ordinary English with standalone rune words restricted even generously to **A**, **I**, or **O**, corresponding to GP indices **24,10,3**. A direct running-key cipher would have `C[n] = P[n] ± K[n] (mod29)`; at every printed singleton word its unknown key must be one of three explicitly observed values. All 83 singleton words in all 12,956 unknown physical-page runes are parsed with the original cross-page joins and remain source-verbatim. The first thirteen have global zero-based positions:

```text
n: 176 244 350 530 644 792 967 1025 1062 1250 1316 1545 1814
C:  28  15   9   1   0  21   8    7    2   27   26   19    8
```

These positions and values are also independently identified in [the prior general fourth-order singleton study](lp2-all-order4-singleton-aio-exact-inverse.md). That study enumerated **all fourth-order characteristic polynomials**; it did not test the three historical 2014 magic squares' **actual fifth- and seventh-order characteristic polynomials**, or their matrix-constrained higher-order key states.

## Exact operation and exhaustive key-state test

For each original 2014 source matrix `M` of size `d∈{5,7}`, reduce it modulo29 and allow *every* unknown `d`-rune state `S[0]`. At each original rune clock, take `K[n]=L(S[n])` and advance `S[n+1]=M*S[n]`, for **any fixed unknown linear output functional** `L`. Cayley-Hamilton forces the resulting scalar `K` to satisfy the matrix's monic characteristic recurrence `f_M(K)=0`. Therefore it is stronger to grant **every possible scalar sequence satisfying that characteristic recurrence**, including values that no matrix state could emit. Both direct additive signs are included because a homogeneous recurrence is invariant under negating its entire key stream.

The original source matrices produce exact GP29 descending characteristic coefficients:

| 2014 matrix | Row sum | `f_M(X)` descending coefficients mod29 |
| --- | ---: | --- |
| First 5×5 | 3301 | `[1,5,17,27,27,19]` |
| Middle 7×7 | 1033 | `[1,11,22,26,13,16,18,27]` |
| Last 5×5 | 1033 | `[1,11,27,7,5,26]` |

At each singleton position `n`, `K[n]` is a linear function of the completely unrestricted initial key vector, obtained from `X^n mod f_M(X)`. The test constructs exact GF29 independent observation rows. It assigns all `3^rank` possible A/I/O plaintext choices on the independent basis rows, checks **every original dependent singleton** without tuning English, and reports the first source-observed contradiction. This enumerates *all possible hidden states*, not only numeric seeds or sampled keys.

## Original-input results

| Matrix-defined key family | First singleton that eliminates all states | Rank at failure | Exact surviving A/I/O basis assignments by original observation |
| --- | ---: | ---: | --- |
| First 3301 5×5 | **5th**, rune position 644 | 3 | `3,9,27,2,0` |
| Middle 1033 7×7 | **12th**, rune position 1545 | 7 | `3,9,27,81,243,729,2187,234,31,8,2,0` |
| Last 1033 5×5 | **5th**, rune position 644 | 3 | `3,9,27,4,0` |

The first and last five-state source models become impossible using only singleton words on the opening original pages. The seven-state source model also has **zero states** after the first twelve original singleton words, before any long passage is guessed. These contradictions are **exact** for this mechanism; they do not depend on a language-model score or plaintext selection by visual impression.

The passing reproducer independently asserts the three original numeric source squares and their row sums, the complete 2,896 original printed-word parse and 83 authentic singleton rune positions, all characteristic polynomials and basis rank, and first-elimination event. A source-native **actual-matrix-state plant** places valid English A/I/O singleton runes at all 83 original positions and successfully survives the same all-state solver. It also applies the secret source key to the 95 already-solved p57 GP symbols and recovers all of them, confirming the declared additive inverse handles actual GP text.

**Successful Windows Node 22 original-input run:** [GitHub Actions 43781146119](https://github.com/FlareZ123/liber-primus/actions/runs/43781146119). **Exact standalone CommonJS SFT:** [`lp2_2014_magic_squares_singleton_allstate_sft.cjs`](../sims/lp2_2014_magic_squares_singleton_allstate_sft.cjs). The workflow [manual only](../.github/workflows/agent22-2014-square-singleton-manual.yml) has no automatic run triggers.

## Stronger affine-bias extension: exact all-offset exclusion

A conventional cipher can add an independent **unknown constant** `b` to the matrix-generated key, `C[n]=P[n]±L(M^n S[0])+b (mod29)`. The homogeneous matrix proof alone would leave this simple alternative open, so the same SFT now tests it without guessing or fitting any bias.

Every constant sequence satisfies `(X−1)K=0`. Consequently every scalar matrix key plus an arbitrary unknown constant obeys the single **augmented source polynomial** `f_M(X)·(X−1)`. Again, allow **all** possible initial states of this larger recurrence, giving a strict mathematical superclass of every fixed-bias matrix state (and including both signs). No initial state or output functional can fall outside it.

| Historical square | Augmented polynomial descending mod29 | First impossible original singleton | Basis rank |
| --- | --- | ---: | ---: |
| First 3301 5×5 | `[1,4,12,10,0,21,10]` | **9th**, rune1062 | 6 |
| Middle 1033 7×7 | `[1,10,11,4,16,3,2,9,2]` | **13th**, rune1814 | 8 |
| Last 1033 5×5 | `[1,10,16,9,27,21,3]` | **9th**, rune1062 | 6 |

The original first-square state counts after each of its first nine standalone words are `3,9,27,81,10,1,3,9,0`. The middle-square counts after first thirteen words are `3,9,27,81,243,729,2187,6561,663,76,13,1,0`; the final-square counts after first nine words are `3,9,27,81,7,4,12,36,0`. **No original ciphertext A/I/O assignment survives**. Source-native positive controls with the actual 2014 matrices, arbitrary initial state, **explicit bias 7**, and all 83 original singleton positions pass all three tests, so this extra key freedom is genuinely represented.

**Successful extended Windows Node22 CI:** [GitHub Actions 43781452997](https://github.com/FlareZ123/liber-primus/actions/runs/43781452997). The direct whole-book additive running-key exclusion now covers **every unknown fixed constant bias as well as every initial state and any fixed linear output projection** for each of the three authentic 2014 matrices. A page- or context-varying bias, a nonlinear evolving map, keyed F-bypass clock, altered tokenization, and other independently selected operations remain outside this exact exclusion. Zero unknown-page plaintext recovered.

## Research decision and limits

Retire a whole-book **homogeneous or fixed-affine-bias** GF29 matrix-running-key GP29 additive cipher using any of the three historical 2014 magic squares, **every unknown matrix initial state, any fixed linear projection, both signs, one clock step per printed rune, preserved original spaces and A/I/O singleton plaintext**. Repeating seed searches, using more source matrix state initialization methods, or changing the secret output projection cannot rescue these source-polynomial contradictions.

The result does *not* exclude a nonlinear matrix output, page/section state resets, ciphertext/plaintext feedback, different key-consumption clocks, actual F-transparent skipping, a changing or secret alphabet, native non-English or nonliteral plaintext word breaks, or a genuinely separate source-specified operation. Fixed additive output bias is now excluded by the expanded exact recurrence test above. Any successor should be selected by an original clue and predict unseen plaintext rather than search arbitrary changes to fix the early singleton contradiction.

**Recovered unknown LP2 plaintext: zero runes.** The precise new exclusion is useful because it closes an otherwise plausible use of real 2014 artifacts against all hidden initial states without further key search.
