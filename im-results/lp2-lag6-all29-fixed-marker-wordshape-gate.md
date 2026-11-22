# All-29 source-conditioned fixed-marker test for the LP2 lag-six affine echo

**Agent 1, 15 November 2026. Scoped new necessary-condition decision.** The original ciphertext's previously established lag-six DH-derived affine echo is **not a stable one-letter plaintext reveal under any fixed GP29 rune** when calibrated against three separate native-GP English registers. This is a complete test of the specified *iff* marker family across all 29 source symbols, **not** a new decryption, a proof against all stateful ciphers, or an independent authentication of the retrospective 2013 DH interpretation.

## Decoder hypothesis and source-selected positions

The original 2013 signed worked Diffie–Hellman exchange supplies the already published affine relation `T(x)=(24−2x) mod29`, whose six-rune word-local echoes in unknown LP2 were studied independently before this test. In its original, immutable word stream, **80 of 1,290 eligible word-internal positions at offset ≥6** satisfy `C[i]=T(C[i−6])`; **32** of these are word-terminal. The artifact has **2,896 printed complete words / 12,956 rune glyphs**. Original page continuation, GP rune order and within-word offset are retained.

A simple **reversible** explanation is that one unknown fixed plaintext GP rune `r` is always emitted by this source-suggested affine sixth-back echo, and that **all 28 other plaintext runes** are mapped bijectively to the remaining 28 ciphertext outputs. The exact, key-independent necessary condition is

`C[i]=T(C[i−6]) ⇔ P[i]=r`, for every within-word `i≥6`.

No secret alphabet, output permutation, cipher key or feedback seed can change those implied plaintext-marker positions. The original first six runes of each word are outside this equation. An explicit reversible synthetic encoder/decoder in the reproducer proves this model could transport actual GP29 prose, including source-native markers, without changing the observation rule. Neither the original sources nor the 2016 signed words/meaning/numbers hint explicitly selects a marker `r` or specifies this iff relation.

## All-symbol original-source experiment

For **every** `r∈{0,…,28}`, the [single-file Node22 CommonJS SFT](../sims/lp2_lag6_all29_reserved_marker_wordshape_sft.cjs) evaluates the complete fixed 80-hit indicator vector against the expected location of `r` in actual GP-normalized English words. It retains **all 559 original word lengths ≥7** and all 1,290 relevant within-word sites, estimating symbol probabilities separately for each exact `(word length, offset)` cell. English→GP normalization matches the source-attested conventional `QU→CW, V→U, K→C, Z→S` and GP digraphs.

Each of three pinned sources supplies its own length-matched word pool: **Shakespeare first 300k characters, Gibran's *Prophet*, and Emerson's *Essays*.** For every source, the script computes the log likelihood of the untouched original indicator for all 29 markers, then compares it with **2,000 deterministic complete native-GP word-book resamples** drawn independently at every original printed word length, using xorshift32 seed `0x33012026` continued across the three registers. A native control is tested under the *same* preselected marker and position-probability model. Counts near **1,000/2,000** indicate a central native score; counts near **zero** or **2,000** are opposite-sided anomalies. The in-sample control likelihood can favor native words drawn from the same source, so the result should be read alongside the three-source disagreement.

| Assumed echo-marked plaintext rune | Shakespeare controls at/below original | Gibran | Emerson |
| --- | ---: | ---: | ---: |
| **R** | **652 / 2,000** | **3 / 2,000** | **2 / 2,000** |
| L | 0 | 0 | 6 |
| N | 1,906 | 1,929 | 2,000 |
| T | 1,917 | 1,999 | 2,000 |
| S | 2,000 | 1,999 | 2,000 |
| E | 2,000 | 2,000 | 2,000 |
| H (earlier source-fixed-point candidate) | 0 | 0 | 0 |

The highest original log-likelihood candidate in Shakespeare is **R** at **−313.51**, but in Gibran the highest is **L** at −321.30, and in Emerson it is **L** at −308.26. The complete SFT writes all 29 candidates for each source and asserts the original source totals, plus an exact decrypt/encrypt plant for eight different fixed-marker choices. **No one marker is centrally typical in all three independent native-GP registers** under the specified original word positions. R's plausible Shakespeare fit is a genuine conditional survivor for that one prose register; it cannot be promoted to an LP2 plaintext letter, and the severe mismatch to the other two controls must be retained.

The experiment includes an exact forward and inverse GP29 construction: for each position with `i≥6`, reserve `T(C[i−6])` for the designated marker and assign the remaining GP28 symbols in sorted-rank order to the 28 other ciphertext values. The decoder recognizes the echo, then inverts the skipped-value rank for all remaining values. Exact synthetic roundtrips confirm that native-GP words can generate the posited indicator with no ambiguity. This plant is an implementation control, not proof of any unknown original decoding.

## Cryptanalytic decision

**Do not use the original 80 six-back affine matches as authenticated positions of one fixed plaintext letter under a universal “match iff marker” rule.** The length/position-conditioned original pattern is atypical of the tested native-English registers for every common fixed rune. This extends the earlier fixed-**H** test to all **29** possible markers, rather than repeatedly selecting an appealing letter after seeing a short readable fragment. It is a conditional language-model exclusion, not a cipher-family impossibility for arbitrary plaintext languages.

A **one-directional** rule where an echo only *sometimes* reveals `r`, state-conditioned opcodes, variable word registers or an external source-selected key can evade the iff claim. The signed historical numbers alone do not specify the echo as a plaintext channel. A productive successor needs a source-authenticated operation predicting previously untapped original ciphertext or genuine plaintext, rather than trying more letter names. No unknown LP2 plaintext, source-authenticated key or deep-web destination was recovered.
