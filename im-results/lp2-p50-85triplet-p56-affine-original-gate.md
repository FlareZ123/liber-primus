# Original p50 table as 85 adjacent three-byte fields: all-secret affine bridge to solved p56

**Agent37, 16 November 2026. Classification: bounded source-original impossibility for a direct affine output rule.** The original printed 256-cell table admits `256 = 85×3 + 1`, while the **independently solved** original physical p56 prints 85 rune symbols. Under the eight natural whole-table readings, **no affine map with any secret four-coefficient key over GF(29)** turns the corresponding 85 triples into (a) the genuine p56 ciphertext, (b) its genuine recovered plaintext, or (c) the authentic prime-totient key tape with one literal-F bypass. This is a necessary-condition result, not an LP2 decryption. It neither provides a p50 caption plaintext nor authenticates any author's field grouping.

## Original-source motivation and exact scope

The 2014 original scans `66.jpg`–`68.jpg` print 32 rows of eight two-character sexagesimal tokens over physical pp49–51. The independently image-adjudicated conventional base60 serialization in [the source table](../resources/liber-primus/lp2-grid-256.json) contains **256 bytes**, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The exact 85-rune encrypted p56 source is [the original LP2 corpus](../resources/liber-primus/lp2-corpus.json); its actual consecutive-prime-minus-one inverse uses **84 key consumptions** because the 57th printed rune (index 56) is a literal plaintext F and bypasses the prime clock.

There is a plausible player-visible reason to test **three printed bytes per output rune** and **one leftover byte**, since it uses the entire 256-cell table and the independently established solved-page length. The key missing premise is historical instruction: neither artifact says to map triplets to the solved page, specifies a field function, or indicates which lone cell is omitted. The present test deliberately grants all unknown affine coefficients rather than guessing a 3301-derived key.

Read all **256 original bytes**, under either printed row-major order or column-major order of the original 32×8 grid, each forward or reversed. Exclude either the first or the last byte. These give **eight fixed candidate input tapes** of 85 contiguous ordered triples `[a_i,b_i,c_i]` and one spare source byte. For each layout, test all possible keys in the complete affine family

`output_i = A·a_i + B·b_i + C·c_i + D (mod 29)`, with `A,B,C,D` arbitrary in `GF(29)`.

The three independent exact target streams are:

1. The **85 original printed p56 ciphertext** symbols, unchanged.
2. The **85 authentic solved p56 plaintext** symbols, including the literal F at index 56, independently recovered using the known prime-totient inverse.
3. The **85-position authenticated p56 prime-key alignment**: 84 successive `prime_j−1 mod29` residues and the bypass position marked `0` for testing a complete 85-position output. That inserted zero is a specified convenience, not an authenticated 85th key consumption. A different escape-value convention would constitute a different model.

The 84 consumed residues are obtained from the real solved-page key schedule; no putative key or plaintext is inferred by fitting the encrypted p50 passage.

## Exact impossibility independent of secret coefficients

For every layout form the full 85×4 feature matrix `X` with rows `[a_i mod29,b_i mod29,c_i mod29,1]`. Let `y` denote one of the three source-target vectors. A necessary and sufficient condition for the existence of a secret affine map is

`rank_GF29(X) = rank_GF29([X|y])`.

Exact modular Gaussian elimination over all **85 original positions** gives `rank(X)=4` for each layout and **`rank([X|y])=5` for every one of the 24 layout×target combinations**. Hence there is **no coefficient vector** in `29^4=707,281` possible maps that satisfies any of these originals. No optimization, language score, null model, fitting window or key guess is needed.

As a diagnostic only, solve for coefficients using four independent source positions (which are the first four for every tested layout). These coefficients are forced on an arbitrary affine hypothesis but predict only **4–11 of all 85 original symbols** across the 24 branches, with the initial four forced by construction. This count is *not* the global maximum of approximate matches over 707,281 keys; the rank contradiction alone supports the exact exclusion.

| Source layout choices | Solved p56 target registers | Complete systems with a GF29 solution | Feature rank | Augmented rank |
| --- | --- | ---: | ---: | ---: |
| Printed rows / printed columns × forward / reverse × spare first / last = **8** | original ciphertext / authentic plaintext / known prime-key alignment = **3** | **0/24** | **4 in all 24** | **5 in all 24** |

**Positive control:** For each of the eight original-shape feature tapes, construct 85 artificial target runes with the frozen coefficients `[A,B,C,D]=[7,11,3,13]`. The same field rank test accepts the affine plant, and coefficients fitted only from the first four source positions predict all **85/85** held-out planted symbols, for **8/8 independent layouts**. The original source bytes and solved p56 streams remain unmodified.

## Scientific decision

The exact `256=85×3+1` alignment is a source-based exploratory bridge; the original artifacts do not authenticate it. The negative eliminates **all secret GF29 affine maps of contiguous triple bytes** for the eight directly source-supported whole-table orders, applied to any of the three known genuine p56 outputs. It does **not** eliminate nonlinear byte-to-rune functions, a 256-position permutation, a state-changing generator, other spare-cell choices, grouping fields after an author-specified visual traversal, radix59, or a different key/receiver. Those extra operations would need an independent first-party selector before more computation. The complete 56-page LP2 plaintext remains unknown.

**Reproducible source and controls:** [Node22 CommonJS SFT](../sims/lp2_p50_85triplet_p56_affine_sft.cjs). The SFT pins the original byte SHA-256, exact 85/84 source lengths, literal-F p56 slot, all 24 rank obstructions and eight successful full-source-shaped affine plants. [Manual Windows runner](../.github/workflows/agent37-p50-85triplet-affine-manual.yml). **Decision:** Retire this direct affine triplet/solved-page transfer; concentrate on newly sourced, nonstationary state rules that can actually decode a new original ciphertext interval.
