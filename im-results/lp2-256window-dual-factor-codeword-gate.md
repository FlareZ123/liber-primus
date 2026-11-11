# Source-linked 256-rune polynomial codewords: exhaustive original LP2 window gate

**Agent 17, 11 November 2026. Classification:** a source-defined mechanism is tested over every eligible original ciphertext window. **No unknown plaintext, key or cipher was recovered.** The negative sharply distinguishes a *reused literal 256-coefficient codeword format* from the verified special-factor structure of the numeric grid.

## Reason for this exact test

The original LP2 p49–51 table contains exactly **256 two-character numeric cells**. Their conventional base60 byte readings satisfy two algebraic divisibility constraints over GF29:

- `H(X)=3+26X+24X²` comes from the Cicada-signed 2013 `BASE29 3301 → 3QO` example, read using the source-linked red-triad ascending-coefficient convention;
- `G(X)=27+5X+15X²` comes from the original p39 marked red rune triad, with an exact repeated root24.

The same source table passes **both** polynomial tests without changing a byte. The [exact-factor report](2013-base29-gf29-grid-factor.md) establishes the factors independently and reconstructs archival table ambiguities with them. This motivates a single *conditional* hypothesis: if LP2's 256 printed cells model a reusable GF29 codeword format, its ciphertext runes might contain other contiguous blocks of 256 coefficients divisible by both H and G. The source fixed the window length and polynomials before this scan; no phase, polynomial, key or language score is fitted.

## Original-input scan

Source: [canonical 12,956-rune LP2 corpus](../resources/liber-primus/lp2-corpus.json) on original physical pages0–55, retaining all 29 GP runes in printed order (rune-free numerical page50 contributes no rune). Use **every possible contiguous 256-rune window**, including page boundaries, not just page starts or the 31 large marks. This is **12,701 windows**, starting at global offsets 0–12,700. Each window is a descending-power coefficient string; divide separately by `H` and `G` using the exact original-table convention. Also test the two reversed polynomial orientations as a wrong-orientation control. The source table itself is a fully verified positive `H=G=0` codeword.

| Test | Original ciphertext 256-rune windows | Under iid uniform 29-symbol coefficients (rough reference) |
|---|---:|---:|
| Divisible by H | **22** | 15.1 |
| Divisible by G | **11** | 15.1 |
| Divisible by both H and G | **0** | 0.01796 |
| Divisible by both reversed-polynomial controls | **0** | 0.01796 |

The individual passing windows intersect **nowhere**. As an independent positive-control plant, splice the exact 256 numerical-grid coefficients into a fixed synthetic GP29 stream at the deliberately unaligned offset **111**: the same scan finds a dual match at 111. Thus the null result is a genuine exhaustive original-cipher observation, not a missed-window programming artifact.

The low expected dual count means that observing zero was already likely under the random/no-reused-format null. It is **not** strong statistical evidence against all encrypted codewords. Its decisive scope is purely logical: **there is no exact contiguous 256-rune coefficient window anywhere in the original GP ciphertext with both of these source-selected divisibility properties**. There can still be another encoding length, an independently specified pre-conversion, an interleaved key, a different field or a codeword in a separate artifact. Neither the 2013 protocol nor the manuscript explicitly says to reuse this table code on its GP ciphertext, so these possibilities remain speculation pending a new original instruction.

## Decision and reproduction

Retire the literal hypothesis that some hidden contiguous 256-rune LP2 passage is encoded as another unchanged H/G-constrained grid codeword. Continue to treat the original p49–51 **256 numerical cells** as a special object whose exact factors may be meaningful, without assuming the same polynomial generator was also used on page text. The established table error-correction result remains intact. If a new original clue specifies a mapping from a *different* LP2 register into 256 field coefficients, it would supply a genuinely new test.

[Single runnable CommonJS source test](../sims/lp2_256window_dual_factor_codeword_sft.cjs) checks the numeric-table SHA256, original dual factor remainders, every original window, wrong-orientation controls, global offsets and source-codeword insertion. The test contains no OCR, hand-edited plaintext, phase search or subjective candidate selection.
