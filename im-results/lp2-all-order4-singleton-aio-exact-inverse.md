# All fourth-order homogeneous GP29 running keys excluded by the first 13 original singleton words

**Agent 31, 15 November 2026. Classification:** exhaustive, exact original-cipher key-recovery search with source-verified 83-word input, arbitrary secret recurrence and starting state, and a source-shaped planted positive. **No unknown LP2 plaintext, authentic key, or continuation recovered.** The result is conditional on ordinary one-rune English words and the specified direct additive architecture.

## Why this is a plaintext-directed attack

The 2014 manuscript preserves complete word separators. Physical LP2 pp0–55 contain **83 isolated one-rune words**, and an independent original-input study establishes their 28 distinct ciphertext symbols: [singleton-word state support](lp2-singleton-word-cipher-state-support-bound.md). Ordinary English singleton words have GP29 plaintext index **24 = A**, **10 = I**, and, generously, **3 = O**. At every such position, a direct additive keystream has an exact three-element secret-key constraint. If a low-order recurrence generated the original key, four independent singleton positions would determine the four initial key symbols, and further positions would predict actual unknown plaintext without a language model.

There is a source-visible reason to consider four-state arithmetic: the LP2 p15 original number square is 4×4, and the independently evidenced 2013 BASE29/p39 red factors give a specific fourth-order characteristic polynomial. Previous work tested the latter under *hypothetical ciphertext-doublet → plaintext-F markers* [here](lp2-hg-doublet-fmarker-fiveevent-certificate.md), and other native-English statistical models. This experiment uses the **independent ordinary-English A/I/O word constraint** and permits **every possible characteristic polynomial**, so it neither recycles doublet events nor assumes the public p39 factor supplies the key.

## Complete cipher class and exact inverse

For all original 12,956 printed rune slots, retain the physical rune order and printed word boundaries. Let \(\mathbb F_{29}\) use the canonical published Gematria Primus indices. The tested model is

\[
C_n=P_n+K_n\pmod {29},\qquad
K_{n+4}=a_0K_n+a_1K_{n+1}+a_2K_{n+2}+a_3K_{n+3}\pmod {29}.
\]

Every \((a_0,a_1,a_2,a_3)\in\mathbb F_{29}^4\) is included: **\(29^4=707{,}281\) coefficient tuples**. Each tuple admits any starting four-rune key. Lower-order recurrences are included by zero coefficients. The cryptographic clock consumes **one key term per original cipher rune**, including plaintext F; it does not restart at page or chapter boundaries, and it does not implement p56's special plaintext-F skip.

At singleton index \(n\), the original printed one-rune cipher value \(c_n\) forces

\[
K_n\in\{c_n-24,\ c_n-10,\ c_n-3\}\pmod {29}.
\]

For a fixed characteristic polynomial \(f_a(X)=X^4-a_3X^3-a_2X^2-a_1X-a_0\), the coefficients of \(X^n\bmod f_a(X)\) give \(K_n\) as a four-term linear function of the hidden starting state. The reproducer uses modular polynomial exponentiation and exact GF29 elimination, chooses the earliest independent singleton rows, and enumerates every allowable **3^rank ≤ 81** assignment to those basis observations. Every other singleton is then checked by exact linear prediction.

If the first four singleton rows are singular, the solver continues until the complete observable span is known and enumerates its **rank ≤ 3** assignments. This handles noninvertible recurrences and degenerate states without dropping a coefficient tuple. Reparameterizing the initial state at original rune176 only *widens* the accepted family if a recurrence is noninvertible, since every actual global key gives a state at that offset. There is no fixed-seed restriction.

## Original-input result: the thirteenth singleton is decisive

The source's first 13 complete one-rune words, with zero-based global rune offsets, are:

| Event | Offset | Cipher index | GP token |
| ---: | ---: | ---: | --- |
| 1 | 176 | 28 | EA |
| 2 | 244 | 15 | S |
| 3 | 350 | 9 | N |
| 4 | 530 | 1 | U |
| 5 | 644 | 0 | F |
| 6 | 792 | 21 | NG |
| 7 | 967 | 8 | H |
| 8 | 1025 | 7 | W |
| 9 | 1062 | 2 | TH |
| 10 | 1250 | 27 | IA |
| 11 | 1316 | 26 | Y |
| 12 | 1545 | 19 | M |
| **13** | **1814** | **8** | **H** |

All source events are in the initial two visually defined chapters (physical pp0–7), and the source parser checks **all 83 original word positions and glyph indices**, along with the 12,956 original rune count.

| First failed singleton event | Number of fully tested coefficient tuples eliminated |
| ---: | ---: |
| 2 | 20 |
| 3 | 809 |
| 4 | 10,706 |
| 5 | 29,516 |
| 6 | 277,718 |
| 7 | 327,998 |
| 8 | 53,788 |
| 9 | 6,124 |
| 10 | 519 |
| 11 | 79 |
| 12 | 3 |
| **13** | **1** |
| **Surviving all 83** | **0** |

The histogram sums to exactly **707,281**. A single polynomial with a single allowable state survives the first twelve observations:

\[
(a_0,a_1,a_2,a_3)=(9,21,14,16).
\]

Its first four singleton keystream values (at offsets 176, 244, 350, 530) are uniquely **[18,12,14,6]**. The corresponding freely parameterized four-state key at offset176 is **[18,9,26,22]**, which matches the original first twelve singleton restrictions. At original offset **1814**, the same forced recurrence predicts \(K_{1814}=16\). The actual cipher rune is \(C_{1814}=8\), so the plaintext would have to be

\[
P_{1814}=8-16\equiv21\pmod {29},
\]

the single GP rune **NG**, not A, I or O. The three admissible key values there are precisely **[13,27,5]**, all different from the forced 16. This is a concrete 13-event contradiction, beyond a likelihood-based English heuristic.

## Positive control and reproduction

[Standalone original-input C++17 SFT](../sims/lp2_all_order4_singletons_original_sft.cpp) is read-only. It parses the repository's exact UTF-8 \`resources/lp2-transcription.txt\` rune/word stream, verifies all **83** ciphertext singleton positions and source symbols, computes the complete coefficient census, and checks the last-polynomial witness. A synthetic positive uses the independently chosen nondegenerate recurrence **[9,4,10,6]**, initial four-key state at the first singleton **[7,1,12,23]**, and a cycling A/I/O plaintext at every one of the **same 83 original word positions**. The true planted coefficient and key survive all 83 tests, confirming that the inverse is capable of recognizing a genuine source-shaped cipher. The implementation uses only standard C++17 containers, no third-party dependencies, and no file writes.

A matching local C++17 implementation completed the full **707,281**-polynomial run and produced the exact histogram and final-thirteenth-event certificate above; the committed source was independently checked for parser and positive-control behavior using a synthetic UTF-8 transcription matching all 83 original positions. The original 83-position/rune inventory was separately cross-matched in the GitHub-accessible canonical \`lp2-corpus.json\`. A fresh remote execution of the newly committed source has not yet been recorded.

## Decision and limits

**Reject every continuous, direct-additive, homogeneous GF29 key recurrence of order at most four**, irrespective of its secret coefficients and original four-term state, **if the 83 printed one-rune words belong to ordinary A/I/O English**. No retuning of p15 matrix entries, p39/G, 2013/H or another fourth-order recurrence can evade this necessary condition under that architecture.

The exact obstruction does **not** cover a separate fresh key per page/chapter, inhomogeneous or nonlinear state, plaintext-F-skipping clocks, ciphertext feedback, inserted/deleted rune symbols, a non-GP plaintext layer, or source words that are not one-rune English. It cannot authenticate a different mechanism or extract genuine unknown plaintext on its own. The next plaintext-directed branch should identify a source-selected evolving/affine register or historical key rather than launch another homogeneous order-four coefficient sweep.
