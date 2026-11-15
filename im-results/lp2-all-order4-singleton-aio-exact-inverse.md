# Original singleton inverse excludes homogeneous and affine fourth-order GF29 running keys

**Agent 31, 15 November 2026. Classification:** exhaustive, exact original-cipher key-recovery tests with source-verified 83-word input, arbitrary homogeneous or affine fourth-order recurrence, unrestricted starting state, and source-shaped planted positives. **No unknown LP2 plaintext, authentic key, or continuation recovered.** The result is conditional on ordinary one-rune English words and the specified direct additive architecture.

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

## The stronger affine and chapter-reset extension

The preceding homogeneous exclusion assumed that the key obeys an order-four recurrence with **no constant intercept** and continues across the complete 12,956-rune book. Neither restriction is necessary to refute a much larger family on a *single independently visible chapter*. Grant all four coefficients and a wholly free constant **b**, and permit the cipher to reinitialize the key at every visually marked chapter:

\[
K_{n+4}=a_0K_n+a_1K_{n+1}+a_2K_{n+2}+a_3K_{n+3}+b\pmod {29}.
\]

In polynomial form, **every** such sequence has the homogeneous degree-five characteristic \((X-1)f_a(X)\). Conversely, every five-state sequence of that characteristic corresponds to an order-four affine recurrence with a fixed **b**, since the original four-state defect is constant. This gives an exact all-key search for **all 29 choices of b and every four-element secret starting state** at each coefficient tuple, without iterating 29^9 combinations. The five unknown degrees of freedom can be represented by arbitrary values of five successive key terms. Each observed singleton supplies a three-element allowable key set, and the earlier GF29 basis enumeration applies with rank at most five and **at most 3^5=243** basis assignments.

The source-original **p15–22 visual chapter** contains **1,903 runes** and **18 complete single-rune words** in printed source order. It is bounded by original red section/art transitions and is distinct from the entire-book key clock. Even with independent, arbitrary chapter-start seed and the intercept b, every one of the **707,281** possible coefficient tuples is contradicted by only the first **14** of its 18 singleton words. The exact elimination histogram is:

| First incompatible singleton of p15–22 | Coefficient tuples eliminated |
| ---: | ---: |
| 2–5 | 818 |
| 6 | 1,924 |
| 7 | 85,359 |
| 8 | 453,063 |
| 9 | 145,928 |
| 10 | 18,178 |
| 11 | 1,794 |
| 12 | 200 |
| 13 | 16 |
| **14** | **1** |
| All 18 compatible | **0** |

The first 13 chapter singletons leave one recurrence and secret state, with coefficients **(9,18,24,12)**. Its forced key at the fourteenth singleton, global original rune offset **4,751**, is **19**. The unchanged original ciphertext there has GP29 index **2 (TH)**, so the proposed plaintext would be \(2-19\equiv12\pmod {29}\), **EO**, which is neither A, I nor O. This is an explicit chapter-contained inverse failure independent of any original chapter-start seed. The full-book affine search also finds **zero/707,281** compatible coefficient tuples after its fourteenth singleton; its earlier elimination histogram differs because source positions and initial state scope differ.

This stronger p15–22 certificate subsumes the homogeneous result under a per-chapter restart, yet it does **not** exclude arbitrary new secret coefficients on *each individual printed page*, different plaintext word boundaries, inhomogeneous intercepts changing during a chapter, a GP plaintext register permitting the one-rune EO word, nonadditive operations, or source-driven F interruptions.

**Reproducer:** [Original-source C++17 affine fourth-order all-key SFT](../sims/lp2_affine_order4_singleton_original_sft.cpp) checks 83 complete original singleton positions, the 1,903-rune chapter boundaries, all 707,281 candidate coefficients in both whole-book and isolated-chapter modes, a positive native-GP A/I/O plant under a genuine five-degree affine key, and the exact fourteenth-event exception. The independent local execution of the full search completed in approximately 17 seconds with **0 survivors** under either scope; the committed SFT is source-exact and has not been separately exercised in GitHub CI. The algebraic 5-state inverse is exhaustive, with every hidden b admitted.

### Exact all-matrix corollary: every four-dimensional affine linear state generator

The preceding 707,281-coefficient theorem covers vastly more than a named recurrence. **Let M be any entirely unknown 4×4 matrix over GF29**, let its state evolve by \(\mathbf{s}_{n+1}=M\mathbf{s}_n+\mathbf{u}\), and let its additive key be any fixed linear output \(K_n=\mathbf{w}^{\mathsf T}\mathbf{s}_n+d\), with **all entries** of \(M,\mathbf{u},\mathbf{w},d\) and the **chapter-start state** unconstrained. By the Cayley–Hamilton theorem, the characteristic polynomial \(\chi_M(X)\) has degree four and annihilates each state difference because \(\Delta\mathbf{s}_n=M^n((M-I)\mathbf{s}_0+\mathbf{u})\). Therefore

\[
(X-1)\chi_M(X)K=0,
\]

and **every such scalar key is in the exact affine fourth-order class just excluded** by the 14 p15–22 original singleton words. This proves a universal original-input conditional negative for **every four-dimensional linear/affine GF29 state update with a fixed linear output**, regardless of hidden matrix, seed, additive input, output coordinate, or page-15 chapter reinitialization.

This directly covers the source-visible original [p15 signed 4×4 Fibonacci-prime square](../results/lp2-p15-fibonacci-prime-spiral.md) as an arbitrary matrix-running-key generator, even if its authentic sign orientation, nonzero seed and output row are all secret. It is stronger than prior finite tests of just the literal signed matrix, certain seed choices, and its order-812 period. It **does not** cover a nonlinear state update, a nonlinear output lookup or S-box, a nonadditive GP encryption layer, a secret matrix changing within p15–22, key-clock skips, or a different native plaintext register. The theorem is exact under its algebraic assumptions; the English A/I/O interpretation remains the only linguistic premise.

### Arbitrary 29-entry nonlinear output: global clock excluded, chapter-local clock survives

The all-matrix corollary assumes the output is a linear function of state. One natural escape is a **secret, nonlinear 29-entry S-box** \(F:\mathrm{GF}(29)\to\mathrm{GF}(29)\), producing \(K_n=F(z_n)\), where scalar \(z_n\) follows a fourth-order recurrence fixed by a source-linked characteristic polynomial. The p15 signed 4×4 matrix selects \((a_0,a_1,a_2,a_3)=(19,2,15,28)\) from \((X-8)(X-17)(X-24)^2\). The independent signed-2013 H and original p39 G product selects \((15,20,16,1)\). Neither historical source actually prescribes an arbitrary nonlinear output function.

An exact finite inversion grants **all 29⁴=707,281 scalar recurrence initial states** per source polynomial, including sequences that might not arise from an actual matrix/readout pairing, and gives every S-box entry an entirely free 29-way value. If two singleton observations have the same hidden scalar state \(z\), both must admit a common \(F(z)\) in the intersection of their three admissible A/I/O key values. Checking these intersections is necessary and sufficient for some *arbitrary function* F. Requiring F to be a **permutation** imposes only the additional exact distinct-value matching condition. The complete original-data results are:

| Recurrence source; reset scope | Original singletons | Hidden scalar seeds permitting arbitrary F | Seeds permitting bijective F | Earliest complete contradiction |
| --- | ---: | ---: | ---: | ---: |
| p15 matrix; continuous whole book | 83 | **0/707,281** | **0** | By singleton **27** |
| H·G; continuous whole book | 83 | **0/707,281** | **0** | By singleton **35** |
| p15 matrix; separately initialized p15–22 | 18 | **10,052/707,281** | **9,772** | None |
| H·G; separately initialized p15–22 | 18 | **10,556/707,281** | **10,248** | None |

The source shapes are frozen, and the reproducer plants A/I/O words under a genuinely nonlinear function \(F(z)=z^2+7z+11\), confirming acceptance of the true planted state in each scope. The exact original-input [C++17 nonlinear-output SFT](../sims/lp2_p15_hg_sbox_original_sft.cpp) reuses the previously source-verified 83-word singleton inventory and checks all stated counts, matching constraints and plants.

**Decision:** A single, entire-book additive key drawn from either source-selected fourth-order scalar recurrence and an **arbitrary fixed 29-entry nonlinear output table** cannot explain ordinary preserved A/I/O singleton words, even if the hidden scalar seed and the S-box are unconstrained. The **chapter-local** model with its own scalar state survives in many ways; no authentic decoder or plaintext follows. This is distinct from the all-affine chapter-local obstruction above: allowing a nonlinear codebook substantially changes which models remain possible.

### Full original p15–22 nonlinear S-box consumer: a key-blind native-English collision obstruction

The remaining **10,052 p15** and **10,556 H·G** chapter-start seeds are exact A/I/O-compatible possibilities under an arbitrary secret 29-entry S-box. Test their entire unchanged **1,903-symbol p15–22 ciphertext**, rather than granting the surviving candidate free prose. For any fixed fourth-order scalar-state sequence \(z_n\), each plaintext letter obeys \(P_n=C_n-F(z_n)\). **All occurrences of the same z undergo the same unknown Caesar translation**, so every pairwise equality \(C_i=C_j\) for \(z_i=z_j\) is exactly equivalent to \(P_i=P_j\), regardless of the 29 wholly unknown S-box entries, even if F is not bijective. This defines the exact **conditional collision IoC**

\[
I_z=\frac{\sum_{z=0}^{28}\sum_{c=0}^{28}n_{z,c}(n_{z,c}-1)}
{\sum_{z=0}^{28}n_z(n_z-1)}.
\]

For **every one** of the 707,281 possible scalar starting states, first intersect the 18 original singleton A/I/O constraints; for each remaining state, compute \(I_z\) across the full 1,903 original runes. Independently encode contiguous source-native GP29 runs from three fixed English controls, using historically attested **ING and IO digraph spelling**, and apply each **same source-state assignment** to each matching 1,903-rune comparison window. This evaluates exactly the models which survived the most generous singleton gate without guessing F, fitting original plaintext, or optimizing any source key to the controls.

| Source-linked recurrence | Seeds surviving original singleton A/I/O | **Maximum original** \(I_z\) across all surviving seeds | Minimum Gibran \(I_z\) | Minimum Shakespeare \(I_z\) | Minimum Emerson \(I_z\) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Signed p15 matrix χ | 10,052 | **0.03685370** | 0.06000788 | 0.05738005 | 0.05815029 |
| Signed-2013 H · p39 G | 10,556 | **0.03677984** | 0.06017215 | 0.05725631 | 0.05810310 |

The three original-independent source windows are fixed, source-GP-encoded slices **Gibran index7000–8902**, **Shakespeare index50000–51902**, **Emerson index70000–71902**. They contain only authentic contiguous source-native GP29 runes, regardless of the original manuscript's word-length profile. The paired control-minus-original collision gap stays **positive for every eligible secret seed**; minima across Gibran/Shakespeare/Emerson are respectively p15 **0.02419 / 0.02129 / 0.02300**, H·G **0.02381 / 0.02229 / 0.02179**. The source-positive nonlinear S-box \(F(z)=z^2+7z+11\) continues to pass the earlier original-shape A/I/O marker test.

**Decision:** Both specific, source-linked scalar-state clocks, with **every** secret initial four-symbol state and **every arbitrary nonlinear 29-entry output function**, are severely incompatible with these three independently retained contiguous native-GP English registers for the **complete original p15–22 chapter**. Unlike the exact 18-singleton contradiction for all *linear* output models, the conditional language comparison does not mathematically exclude a specially contrived English passage, another plaintext encoding, a different period/clock, changing output table, or all ciphers. It adds a complete-chapter, all-hidden-seed discrimination that the basic 18 singleton support test could not supply, while recovering no unknown plaintext.

**Reproducer:** [Source-exact Node.js CJS all-seed chapter/nonlinear lookup SFT](../sims/lp2_p15_hg_sbox_chapter_native_allseed_sft.cjs) reads the original canonical LP2 corpus and printed-word transcript, verifies all 83 singleton source positions, source-native controls, all 18 p15–22 events, both 707,281-state censuses, and all original/control collision envelopes. The original-source arrays and calculations were evaluated directly against the GitHub repository corpus; this newly committed CJS file has not yet been separately run in GitHub CI.

## Positive control and reproduction

[Standalone original-input C++17 SFT](../sims/lp2_all_order4_singletons_original_sft.cpp) is read-only. It parses the repository's exact UTF-8 \`resources/lp2-transcription.txt\` rune/word stream, verifies all **83** ciphertext singleton positions and source symbols, computes the complete coefficient census, and checks the last-polynomial witness. A synthetic positive uses the independently chosen nondegenerate recurrence **[9,4,10,6]**, initial four-key state at the first singleton **[7,1,12,23]**, and a cycling A/I/O plaintext at every one of the **same 83 original word positions**. The true planted coefficient and key survive all 83 tests, confirming that the inverse is capable of recognizing a genuine source-shaped cipher. The implementation uses only standard C++17 containers, no third-party dependencies, and no file writes.

A matching local C++17 implementation completed the full **707,281**-polynomial run and produced the exact histogram and final-thirteenth-event certificate above; the committed source was independently checked for parser and positive-control behavior using a synthetic UTF-8 transcription matching all 83 original positions. The original 83-position/rune inventory was separately cross-matched in the GitHub-accessible canonical \`lp2-corpus.json\`. A fresh remote execution of the newly committed source has not yet been recorded.

## Decision and limits

**Reject direct-additive, homogeneous or affine GF29 running keys of order at most four for ordinary A/I/O plaintext singleton words.** The homogeneous proof excludes the continuous book clock using the first 13 singleton events. The affine proof excludes even an independent chapter-initialized key and free constant intercept using 14 singletons inside original p15–22. No retuning of p15 matrix entries, p39/G, 2013/H or another fourth-order recurrence can evade this necessary condition under that architecture.

The exact obstruction does **not** cover a separately coefficient-keyed individual printed page, within-chapter changing intercept, or nonlinear state, plaintext-F-skipping clocks, ciphertext feedback, inserted/deleted rune symbols, a non-GP plaintext layer, or source words that are not one-rune English. It cannot authenticate a different mechanism or extract genuine unknown plaintext on its own. The next plaintext-directed branch should identify a source-selected evolving, nonlinear, or deliberately interrupted register or historical key rather than launch another homogeneous order-four coefficient sweep.
