# P23 red midpoint recovers the 2013 H quadratic projectively, but supplies no ciphertext receiver

**21 November 2026, Agent25. Classification: newly identified, exact original-source structural bridge, not a recovered original-cipher key, unknown plaintext or author-selected operation.** Original p23 (scan `40.jpg`) has a uniquely centered word boundary in its red 16-rune heading. One natural but as-yet unauthenticated 2-left/1-right reading across that midpoint yields a nonzero scalar multiple of the independently signed 2013 BASE29 polynomial that already divides the 256-value LP2 table. Combining it with the separately printed red p39 polynomial gives an exact in-manuscript factorization of the p49–51 table. The test below evaluates the larger red-boundary discovery family and directly tries the resulting quotient against original ciphertext. It does **not** establish the creator's extraction rule.

## Source coordinates and the new bridge

The original LP2 p23 red heading starts at local rune 0 and has precisely sixteen runes, divided into four original printed words of lengths **[2,6,3,5]**:

```
original indices: 1 24 | 7 21 6 14 23 6 | 10 17 10 | 12 16 17 10 26
original runes:   U A   W NG G X D G       I B I       EO T B I Y
```

Its word boundary at zero-based rune offset **8** lies at the exact midpoint **8|8**. A census of **all 18** original red-rune spans recorded in `resources/liber-primus/lp2-ink-annotations.json`, with every original printed internal word break from `lp2-transcription.txt`, finds **p23 alone** with any internal word boundary exactly at the center of an even-length red span. The original scan `40.jpg` is byte-pinned at SHA-256 `d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee`.

The fixed three-rune reading formed from the **last two before** and **first after** that source-visible midpoint is the original p23 local offset **6,7,8**:

```
                 D   G | I
GP29 indices:   23   6 | 10
R(X) = 23 + 6X + 10X².
```

The PGP-signed 2013 TCP BASE29 example `3301 -> 3QO` already provides `H_2013(X)=3+26X+24X²`, with coefficients in ascending power order. In GF(29), the new independent red sequence satisfies **R(X)=27 H_2013(X)** exactly, including all three coefficients. The already recognized isolated three-rune physical p39 red group, scan `56.jpg`, remains `G_39(X)=27+5X+15X²`.

Reading the exact original 256 two-character p49–51 source cells as **conditional base60 bytes**, reducing each modulo29, and arranging them as descending polynomial coefficients gives

```
R(X)G_39(X) = 12 + 16X + 7X² + 24X³ + 5X⁴  (mod29).
B_table(X)  = [R(X)G_39(X)] Q_new(X), remainder = [0,0,0,0].
degree(Q_new) <= 251; 252 descending quotient symbols.
Q_new begins [0,23,10,15,28,2,3,4,20,15,4,6,...].
```

This is the same established GF29 table codeword under an **internally printed second selector for H**. Because `R=27H`, its quotient is exactly `Q_new=14 Q_old` modulo29 (since 27·14=1 modulo29). The bridge adds no new entropy or independently authenticated key. It is a source connection, not a previously unknown table factor. The original base59 reading fails this H/G factorization, as documented in the earlier radix discriminator; our conclusion remains conditional on the historical choice of base60.

## Fully charged source-boundary search, with a discovery-aware control

We enumerated *both* natural triples at every word boundary **inside every original red span**: 2-left/1-right and 1-left/2-right. This produced **69 candidate triples** over 35 actual internal red word boundaries, including 2014 pages and the solved pages. Exactly **one of 69** is a factor of the original table: p23 offset6 `[23,6,10]`. The adjacent 1-left/2-right triple `[6,10,17]` is **not** a table factor; its quadratic remainder is `[25,25]`. The p39 G triad is separately marked red but has no internal word boundary, so it is not one of the 69 cross-boundary candidates.

The full original table has exactly **two monic quadratic factors** over GF29, `[11,18,1]` (H) and `[25,10,1]` (G), so the search and negative decisions do not depend on scanning many arbitrary polynomial families. A seed-locked **200,000-draw** calibration permutes rune values **within each of the 18 genuine red spans**, preserving each span's rune multiset, length, actual location, all 35 word boundaries, both orientations and every original table value. The same factor test is re-run on all 69 resulting candidate triples. At least one arbitrary boundary-window factor occurs in **25,122/200,000 = 12.561%** of the shuffled controls. This is the proper warning against calling the one global hit compelling by itself.

Focusing on the source-visible, uniquely central p23 boundary, a factor at either of its two crossing orientations occurs in **824/200,000 = 0.412%** of same-inventory shuffled controls. For the exact central 2-left/1-right slot alone, the combinatorial probability is **7/3,360 = 0.20833%**, counting both monic factors and all scalar equivalents compatible with the original p23 red-rune multiset. These conditional statistics are **not a global discovery-adjusted authorship probability**: the arithmetic rule, candidate source factors, and attention to this heading were discovered after extensive earlier investigation. They make a distinctive center-conditioned pattern worth retaining, without establishing an intended human move.

## Ciphertext consequence tested

The new quotient `Q_new` was tested as a literal period-252 GP29 additive key with both signs and phase zero against unchanged canonical original p23 (213 runes), p55 (76 runes), and the immediate posttable pp51–52 concatenation (355 runes). Each direct output remains ciphertext-like; all indices are original rune positions, with no fitted phase or historical F bypass. Output indices of coincidence:

| Original target | C−Q_new | C+Q_new |
|---|---:|---:|
| p23, 213 | 0.034591 | 0.034193 |
| p55, 76 | 0.030175 | 0.037193 |
| p51+p52, 355 | 0.035108 | 0.033278 |

Uniform GP29 baseline is about 0.034483; genuinely clear p57 has 0.062710. The readings contain no coherent original GP-English plaintext. Earlier Q_old direct, RC4 and nine-chapter key consumers are already negative; scaling Q does not justify re-running other source-agnostic key families. **No authentic new plaintext, GP key, original-cipher inverse or destination was found.**

## Decision and next useful gate

Preserve the **p23 source-only H projector** as a provisional, unusually centered in-manuscript echo of the independently signed 2013 H factor. The strongest objection is decisive: the original heading visibly fixes a boundary, but it does **not tell a solver to take two runes on the left and one on the right**. A future claim must obtain that 2|1 rule independently from the original 2014 visual artwork, authenticated historical clue, or a blind original-cipher prediction, and must identify a reversible *ciphertext consumer* of the p50 quotient or factor. More fitted polynomial factors, source-shuffled duplicate counts or arbitrary Q key phases cannot solve that missing operation.

Reproduce with [single-file Windows Node22 original-source test](../sims/lp2_p23_red_midpoint_dualfactor_original_sft.cjs), which pins the five relevant original scans and complete 256-byte source, verifies red-span and punctuation offsets, enumerates the 69-boundary comparison family, asserts the factorization and quotient, executes the 200,000-draw shuffled controls, and prints the three actual original-cipher readouts. Relevant earlier independent factor report: [2013 H and p39 G table link](2013-base29-gf29-grid-factor.md).
