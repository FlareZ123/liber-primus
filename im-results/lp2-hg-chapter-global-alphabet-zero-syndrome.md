# A global hidden GP29 alphabet cannot make the nine original chapters H/G codewords

**Agent14, 15 November 2026. Classification: exact all-secret-alphabet necessary-condition exclusion of one source-shaped cyclic-code interpretation. No new LP2 plaintext, author-selected key or cipher is recovered.**

## Causal solve-path hypothesis

The original pp49–51 table has 256 printed base60 tokens. On their canonical GF(29) residue interpretation, its high-to-low polynomial is exactly divisible by two independently indicated quadratics:

- The signed January 2013 `BASE29 3301 → 3QO` example fixes the ascending-coefficient quadratic `H(X)=3+26X+24X²`.
- The original p39 red GP triad fixes `G(X)=27+5X+15X²`, proportional to `(X+5)²`.

Their monic product is

`F(X)=X⁴+28X³+13X²+9X+14 (mod 29)`.

The original table is an exact F-codeword: its four-coefficient polynomial remainder is zero. [Original source and factor evidence](2013-base29-gf29-grid-factor.md) and [complete factorization](lp2-grid-complete-gf29-factorization.md) document this arithmetic.

An appealing direct decipherment is that the **same four-check code** might be used on the nine independently drawn red-heading chapters of the original unknown runic manuscript. The already-performed [literal-index test](lp2-dualquadratic-allchapter-polynomial-original-gate.md) found nine nonzero chapter remainders. Its strongest inexpensive rescue is a **single unknown, fixed permutation of the 29 GP rune labels**: perhaps the manuscript uses a secret numerical alphabet, and applying that alphabet first would make all chapters valid F-codewords. This is relevant to decipherment because a valid hidden alphabet could be recovered without knowing the plaintext or brute-forcing 29! keys.

**Most important unsupported premise:** Neither signed Cicada text nor a decoded unknown-page instruction explicitly commands polynomial coding of these nine rune chapters. The table's divisibility does not itself prove that the manuscript text is a codeword. This test asks whether the candidate survives its own lossless algebraic requirement, without language fitting.

## Exact all-key inversion

Preserve all **12,956 original unsolved LP2 GP29 symbols**, the source-supported nine visual chapter cuts and each chapter's full printed rune order. The chapter rune counts are

`[729,1145,1729,1903,1021,1433,1680,3008,308]`.

Let `C[j,i]` be the authentic rune label at position `i` of chapter `j`. Leave all 29 values of an unknown decoder `g:{0,…,28}→GF(29)` completely free. The hypothetical decoded polynomial in descending order is

`T_j(X)=Σ_i g(C[j,i]) X^(n_j−1−i)`.

For `T_j` to be divisible by F, its four-coefficient remainder must vanish. Polynomial remainder is linear in the coefficients, so this produces four **homogeneous linear equations** in the 29 unknown lookup values `g(0),…,g(28)` for each chapter, independent of whether `g` is affine, nonlinear or otherwise arbitrary. Stack them into a 36×29 matrix `A` over GF(29). A valid secret alphabet must be a *permutation* and satisfy `A·g=0`. Consequently a full-column-rank A excludes **every** secret permutation before any language scoring.

The [standalone CommonJS 22 SFT](../sims/lp2_hg_global_alphabet_codeword_sft.cjs) computes all indicator-remainders directly from the canonical original `lp2-corpus.json`. It independently verifies the source table SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` and its zero F remainder, then uses exact modular Gaussian elimination.

| Source prefix (complete chapters) | Equations | Rank over GF(29) |
| --- | ---: | ---: |
| p0–2 | 4 | 4 |
| through p3–7 | 8 | 8 |
| through p8–14 | 12 | 12 |
| through p15–22 | 16 | 16 |
| through p23–26 | 20 | 20 |
| through p27–32 | 24 | 24 |
| through p33–39 | 28 | **28** |
| through p40–53 | 32 | **29** |
| through p54–55 | 36 | **29** |

**Key-independent result:** The original nine-chapter matrix has **rank 29**, so its only null vector is zero. A zero map is not a valid alphabet, much less a bijection. Reversing the rune order *within each of the same nine chapters* also gives rank 29.

There is an earlier, tighter bijection obstruction. The first **seven** chapters have rank 28 and a one-dimensional nullspace. Normalizing its only free coordinate (GP label28) to 1 yields the complete candidate

`[0,4,6,8,27,9,2,0,9,21,12,2,17,24,15,10,26,24,12,6,7,8,14,22,6,19,23,9,1]`.

It contains only **20 distinct GF29 values**. Multiplying it by any nonzero field scalar preserves these collisions, so **even the first seven original chapters have no admissible common secret permutation** under this model. The eighth chapter closes the larger linear space before requiring bijectivity.

## Native plaintext-positive calibration

To check that the method can genuinely recover a secret alphabet when the proposed cipher is present, take the **95 authenticated clear GP rune indices of original p57**, repeat their order into each of the nine source-matched lengths minus four, and multiply each resulting high-to-low polynomial by exactly F. This constructs nine genuine F-codewords of the original lengths, with complete reversible plaintext and four check coefficients each.

Apply an independently fixed hidden 29-symbol output permutation: the decoder is `g(c)=(7c+3) mod29`, and the synthetic printed label is its exact inverse `c=25·(g−3) mod29`. Compute the **same** 36×29 syndrome matrix, leaving all 29 decoder values unknown to the solver. The synthetic matrix has rank **28**, a one-dimensional nullspace, and its normalized nonzero generator exactly matches the planted secret alphabet up to an inevitable nonzero scalar. All 29 entries are distinct. Every codeword independently verifies a zero source-factor remainder. This control demonstrates all-secret recovery, not merely synthetic round-trip correctness.

## Decision and boundaries

**Reject the precise hypothesis:** the unknown LP2 printed rune sequence, read as nine complete source-visible chapters, is a set of zero-remainder H/G cyclic codewords after any *single common secret permutation* of its 29 rune labels. Source-original algebra excludes the whole 29! family; supplying a guessed alphabet, wordlist, cipher key or more compute cannot rescue it.

This finding does **not** reject the established original table factors, which have independent arithmetic provenance. It does not cover chapter-specific relabeling, nonzero syndrome fields, different coding boundaries, a key-stream transformation before the code, the quotient as separate binary data, or a code used only for the table. No source instruction currently selects those alternatives. The most productive new work remains recovery of an independently selected table consumer or a reversible original-cipher key. In particular, do not open an unconstrained phase/offset sweep to preserve an unsupported chapter-code reading.

**Reproducer:** [`sims/lp2_hg_global_alphabet_codeword_sft.cjs`](../sims/lp2_hg_global_alphabet_codeword_sft.cjs), no third-party packages, pure Node.js 22, original source files read-only. The exact original-source ranks and positive-control decoder were also independently computed in the invocation before this report was committed.
