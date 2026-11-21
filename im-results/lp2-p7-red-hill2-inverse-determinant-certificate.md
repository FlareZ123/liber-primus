# P7's five red words form a complete GP29 Hill-2 matrix and inverse-determinant certificate

**Agent46, 21 November 2026. Intermediate original-source key-like structure; direct p8 receiver negative.** This is one new finite algebraic interpretation of the p7 red-word product packet. Its last value exactly certifies the determinant inverse of the 2×2 matrix formed by the first four words, enabling an entirely reversible cipher **key** without fitting any secret. A literal adjacent-page consumer fails. **No previously unknown plaintext, authentic cipher instruction, or destination has been recovered.**

## Independent original inputs

Original physical LP2 p7 (24.jpg) ends with a source-red five-word colophon at rune offsets 194–207. The five words, unmodified original GP29 zero-based symbol indices, are

```text
[23,3] [22,16,2,25] [5,7,11] [14,28] [6,28,19]
```

Their **word products modulo29** in printed order are

```text
q = [11,26,8,15,2].
```

The source word-product rule was discovered independently in the existing [p7 multiplicative DH23 packet](lp2-p7-red-multiplicative-inverse-dh-packet.md), which establishes the correspondence `[A^-1,B^-1,A,K^-1,K]` for the source-derived state `A=8,B=19,K=2`. This report does not claim a second independent choice of multiplication or a new DH parameter. The **additional algebraic relationship here is a complete Hill-2 key, determinant, and certificate using all five products in their existing printed order**.

## Exact complete reversible register

Consume the first four printed products as a conventional row-major 2×2 matrix over the source's prime-sized GP29 field:

```text
M = [[11,26],
     [ 8,15]]

det(M) = 11*15 - 26*8 = -43 = 15 mod29.
q5 = 2 = inverse(15) mod29.
M^-1 = q5 * [[15,-26],[-8,11]] mod29
     = [[1,6],
        [13,22]].
```

The fifth original red word therefore supplies **exactly the inverse of the determinant**, so a human solver can recover a complete inverse matrix from all five word products using no chosen key byte or solver-fitted parameter. Both `M*M^-1` and `M^-1*M` are identity modulo29. The inverse's 6 also equals the previously authenticated DH23 exponent a=6, its 13 equals the common original LP2 thirteen-dot marker count, and 22 equals DH23 group order p−1; these secondary numerical observations are *post-discovery* and do not authenticate a Hill cipher.

This is an interesting independent algebraic *use* of the packet, but the source supplies **no printed 2×2 matrix bracket, matrix multiplication command, padding convention, pair clock, selected receiver, or encryption direction**. A determinant certificate could be accidental among the project-wide numbers and other studied transforms. It cannot be promoted to a genuine historical key without a plaintext witness.

## Finite source population: generic certificates are frequent

Freeze the five-word row-major rule exactly as above for all **2,729 original same-physical-page consecutive five-word windows** on unknown LP2 p0–55. For each candidate `q0..q4` of word products, count:

- Hill certificate `det([[q0,q1],[q2,q3]])*q4 = 1 mod29`: **83 windows**.
- The independently reported original p7 fixed DH reciprocal pair arrangement `q0*q2=1` and `q3*q4=1`: **1 window**.
- Their **intersection**: exactly **one**, p7 start rune194, products `[11,26,8,15,2]`.

The original matrix certificate is thus an exact extra relation inside a source-selected unusual packet, while **83/2,729** generic same-page five-word windows pass the certificate equation. This census is an arithmetic source diagnostic, *not* a pre-registered empirical p-value for authorship. The p7 DH pairing came from prior packet research, and the Hill interpretation was noticed only after its products were visible. All 15 alternative pairing layouts were charged in the existing DH report; this test does not retune their positions.

## One fixed first-party-adjacent receiver, with a solved-page positive

P7's red colophon immediately precedes physical p8, suggesting a single simple human experiment: consume **p8's original GP29 ciphertext in consecutive pairs from its first rune**, decode `P=M^-1*C mod29`, and leave the last unmatched rune of this 255-rune page outside the tested paired interval. Do not search offsets, signs, matrix orientations, key squares, padding, or phases. This exact decoder reencrypts every one of its 254 paired source runes. The original p8 decoded normalized IoC (`29×IoC`) is **0.9350471507**, below its corresponding original first254 ciphertext IoC **0.9964209019**, far below source-native GP English. Its source-prefix transliteration is

```text
TAEEOLIATHLNOEOEEWDIAIEOCRSSRRYEAEAEAEPJJMEJLIIAMYTHXUOEBIYWTHDPNCLLENEOIHOEDBOWIACTHOEAS
```

and is not coherent linguistic text.

As a second source-bound length check, apply the same pair rule without refitting to the first **1,728** ciphertext runes of the following original p8–14 illustrated section, leaving its 1,729th rune unpaired. The decoded normalized IoC is **1.0005113502** and the paired entire section reencrypts exactly. There is no plaintext passage.

The test separately encrypts all 94 paired native-clear GP29 runes of authentic solved p57 under `M` and recovers **94/94** exactly under `M^-1`; this confirms the matrix consumer would recover a genuine source-native positive when the proposed key really was used. Matrix inversion/replay is mathematical correctness, not authenticity.

## Source-selected five-dot composite receiver: complete 1,730-rune negative

The adjacent p7 **five-dot artwork** has independently recorded top-to-bottom column order `[2,4,0,3,1]`. The following physical illustrated pp8–14 contain **1,729 original runes**, and the printed p10 inline numeral `7` occurs after original rune692. Earlier [p7-dot / 2014-square Hill-5 study](lp2-p7-3301-hill5-gate.md) already fixed the literal human-readable operation: insert the numeral as GP index7, giving **1,730 symbols = 5 columns ×346**; interleave those columns in the authentic p7 five-dot order. This moves the inserted `7` to output position zero, an independent structural control. That earlier study tried the **2014 5×5 magic-square** matrix and got a negative. The **new p7 red-word matrix** is a distinct, exact and independently available smaller key.

Freeze one composite without altering the established dot order or seeking offsets: perform the above unique 1,730-symbol source-selected interleave, then `P=M^-1*C` in 865 consecutive **two-rune** column vectors, with `M^-1=[[1,6],[13,22]]`. Unlike a naked p8 255-rune interval, this concrete receiver has **no unmatched symbol**, recovers precisely the embedded original numeral, and supplies an exact inverse for the entire 1,730-symbol stream. Each runic plaintext candidate can be reencrypted and deinterleaved with no loss.

On the original source, normalized GP29 IoC is **0.9992651705** after fixed dot interleave and **1.0002153004** after the Hill-2 inverse, both essentially uniform. Decoded prefix:

```text
NGWIABMIANGORWHPNNRTLHWOETHJFMOTHGMSMSIAEOEANNGTHWEOTHNSXEOJEONIATHTHICIYA
```

This source-composed, fully typed 1,730-symbol reversible consumer **fails to recover coherent language** and does not explain the source's original word-boundary semantics. It was added to the same [exact SFT](../sims/lp2_p7_red_hill2_certificate_sft.cjs) with explicit assertions of the seven original page lengths, 1,730-byte receiver length, unique numeral-first property, full inverse, and unchanged inputs. Full 1,730/1,730 re-encryption succeeds, proving only implementation correctness. No further dot order / Hill sign / key phase / padding permutation was searched.

## P6/p7 red-bracketed 28×11 interval: exact matrix-order consumer

A second original, source-addressable receiver follows directly from the colophons themselves. The physical p6 red11 ends at rune82, and the physical p7 red14 begins at rune194, so the intervening original black ciphertext contains **114+194=308 runes = 28 rows ×11 columns**. The 11 derives from the first red colophon length; 28 from the GP29 unit-group size and, crucially, **from the exact multiplicative order of the new p7 matrix**. Repeated multiplication shows `M^28=I mod29` with no earlier positive power yielding identity. The matrix's eigenvalues are 10 (order28) and16 (order7) in GF29; its order28 is source-computable without an assumed seed. This source correspondence is post-discovery and does not by itself specify where to place the matrix.

One bounded complete receiver treats the 308 unchanged rune values as **28 consecutive 11-rune rows**, applies `M^-1` to each vertically adjacent pair of row entries at each of the 11 column positions, and reads the 28×11 result in original row-major order. Every source rune has exactly one partner and the operation is algebraically reversible, with **308/308** exact re-encryption. The output has normalized GP29 IoC **0.9832691738** against source ciphertext **0.9961504294**, and its first 80 decoded rune transliterations read

```text
PYNSSOEAEAEYAEMWSXHAGYFEONUXXFGMDOCSAYTHIEEAIUTHIAEAOEOOJIAGRRUTMCTLEABNBFIRDEYGNTHLLXEONGONNGCEH
```

This yields **no coherent unknown LP2 plaintext**. It supersedes any temptation to tune 28×11 phases or pairing directions in the absence of a first-party instruction. The same [SFT](../sims/lp2_p7_red_hill2_certificate_sft.cjs) asserts the original source brackets, exact matrix order, word-width, GP29 output statistic and full inverse.

## A complete source-seeded 28-step matrix pad also fails

The source p6 red11 immediately before the 308-rune black interval provides an exact **eleven-value original seed** and the later p7 red matrix provides an exact **28-step invertible state update**. One simple nonstationary key construction needing no guessed parameter initializes, for each of the eleven columns, a state `s_j=[p6_red11[j],1]`. The `1` is the source field's multiplicative identity, a hypothesis rather than a printed instruction. For each of 28 consecutive 11-rune rows, take the state first coordinate as the GP29 additive keystream, then advance `s_j <- M*s_j`. Because the actual matrix has order28, after the 28th row **every original column state returns to its starting pair**, providing a round-trip internal consistency check. The decoder is `P[r,j]=(C[r,j]-s_j[0]) mod29`, and the complete source-bracketed interval reencrypts exactly.

On the unchanged **308** original black-runic source the decoded normalized IoC is **1.0127120437**, with prefix

```text
JOEXHTSAEEAUTHLGEASIAPFGNUINSPFGNWNEELOMFAATBDBNSDBDFAEHUAECITYWXIAEOHLIANWJHDYONTRBHIAAOEOHA
```

This fully reproducible, source-shaped **nonstationary matrix-pad candidate is also negative** as a direct GP29 English decoder. No alternate affine offset, second seed coordinate, multiplication sign, row direction, carrier, or additional key phase was tuned. Matrix period and interval arithmetic alone are insufficient to identify a decipherment.

## Research decision

Preserve the source-exact p7 five-word Hill-2 inverse-determinant **candidate key packet** as a distinct interpretation of the DH inverse-state register. **Reject** its three natural complete source-bound consumers: the literal next-illustrated-page phase-zero Hill-2 receiver, and the manuscript's independently discovered p7 five-dot interleaver + p10 numeral7 + Hill-2 inverse across the entire 1,730-symbol p8–14 section. The 28×11 red-bracketed vertical Hill-2 consumer, the source-seeded 28-step matrix pad, and a continuous p8–14 raw paired-section inverse also fail. The packet is not a verified Liber Primus encryption key. Do not rescue this negative with extra pair offsets, changed read direction, nonlinear key adaptations, other original pages chosen by IoC, or a free Hill-family search.

To make this a genuine plaintext route, an independent original Cicada clue must specify which ciphertext is consumed, the block origin and the handling of odd input lengths. An unseen 150-rune prediction and exact native-language recovery would then distinguish a valid cipher from the algebraic coincidence.

**Reproducer:** [`sims/lp2_p7_red_hill2_certificate_sft.cjs`](../sims/lp2_p7_red_hill2_certificate_sft.cjs), source-exact CommonJS; executed successfully against the fetched original repository sources with all five-word census, matrix identities, original inverse, five-dot source-composed receiver, 28×11 red-bracketed receiver, source-seeded matrix pad, and known-clear positive.
