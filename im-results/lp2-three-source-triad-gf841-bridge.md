# Three independently marked LP2 triads form an order-840 GF29 matrix

**Classification (Agent 35, 11 November 2026):** exact original-source algebra, independently checkable cross-artifact correspondence and a frozen *negative* original-cipher inverse. The candidate matrix is a modeling choice discovered retrospectively. No unknown plaintext, authenticated key or Cicada destination is recovered. This is an intermediate research result, not an established decryption.

## A concrete cross-source construction

The original red *three-rune* inscriptions at the same local rune offset **119** on physical pages **3** and **39** provide the ordered GP29 triples

- p3 `r₁=[13,23,2]`; as ascending coefficients, `13+23u+2u²=0` defines `u²=3u+8` in GF(29²). This element is primitive, order **840**, and its field norm is **21**.
- p39 `r₂=[27,5,15]`; its ascending polynomial is `15(X−24)²`. The enlarged Ac on p54 independently has ordinal 24.

The separately recorded **2016 signed-message → MY FOLD → terminal p55** navigation hypothesis selects three folded totals **398, 376, 365** (the prime sums of CIRCUMFERENCE, DIVINITY and the historical A-KOAN spelling FIRFUMFERENFE). Reusing its fixed zero-based base-58 page/word address rule selects **p50:w6 = printed `1p`**, **p28:w6 = NG**, and **p17:w6 = NGAELOEIEOY**. Under conventional unsuppressed **radix60**, `1p=111`, and the three residues modulo29 are

`r₃=[111 mod29,79 mod29,511 mod29]=[24,21,18]`.

Arrange the two source-visible red triples, then this separately derived fold triple, in historical page order as rows of a 3×3 matrix:

```text
M = [13 23  2]
    [27  5 15]
    [24 21 18]  (mod 29)
```

This arrangement is a **new hypothesis**. Neither a source image nor the signed instruction explicitly commands solvers to assemble this matrix or apply a Hill cipher. Its historical source parts are fixed independently of their later numerical relationship.

## Exact algebraic identities and the 2016 page50 selector

The original two red rows themselves exhibit a rank-one relation for the p3 field norm **21**:

`r₂−21e₂ = 22(r₁−21e₁) (mod29)`,

where `e₁=(1,0,0)` and `e₂=(0,1,0)`. Consequently **21 is an eigenvalue of every 3×3 completion using these two rows**, regardless of the third row. This matters when assessing how much independent evidence the completed determinant and characteristic polynomial contain; one eigenvalue is forced by the first two rows.

For the exact radix60 fold third row, direct modular arithmetic yields

```text
det(M) = 1 mod29
χ_M(X) = X³ − 7X² + 14X − 1
       = (X − 21)(X² − 15X + 18) mod29
M^840 = I, and no smaller positive power is I
M^(-1) = [ 7  5 16]
         [19 12  4]
         [12 18 24]  (mod29)
```

The p3 field element `u` has these exact powers:

`u^83=18+22u`, `u^727=26+7u` (the latter is the Frobenius conjugate: `727=29×83 mod840`).

Both have trace **15** and norm **18** in GF(29²), so they are exactly the two roots of `X²−15X+18`. Therefore

`χ_M(X)=(X−21)(X−u^83)(X−u^727)` over GF(29²).

The exponent **83** is the *original global row-major offset* of the printed `3D` at p50-local cell3, previously selected (under the provisional signed-word map) by the source word **lies**. This is a very specific, reproducible cross-source meeting relation. The exponent was identified **after** assembling the matrix, and the matrix arrangement itself is not a contemporaneously documented instruction. Do not assign it a naive `1/840` discovery-wide probability or treat the equality as recovered key material.

## Critical base59 correction

The `f`-omitting alternative **radix59** codec maps printed `1p` to **109**: digit `p` is 50 in the compressed alphabet, and `1×59+50=109`. The resulting GP29 residue is **22**. Earlier Issue #118 / #116 wording accidentally said **23**, evidently retaining a radix60 place value after compressing the alphabet. That is not the specified positional base59 codec.

The correct competing third row is therefore **[22,21,18]**, with

```text
det(M59) = 27 mod29
χ_M59(X) = (X−21)(X²+14X−7) mod29
order(M59) = 84
```

The radix60 candidate has an order-840 primitive quadratic factor while the corrected radix59 version has order84. This discriminates the **two proposed matrix models**, conditional on the retrospective row construction. It does not independently settle the original table codec, and the derived [24,21,18] state remains conditional on the base60 reading. This correction was sent directly to Director Issues #118 and #116.

## Frozen original ciphertext inverse and positive control

There are two source-marked triple-aligned terminal spans worth testing without tuning: physical **p53 red51** (17 blocks of three) and the **last 75** of p55's 76 runes (25 blocks of three, after the page-start rune that continues a p54 word). Apply the literal Hill3 decryption `P_block=M⁻¹·C_block mod29` in printed order, with zero extra key, phase, feedback or alphabet adjustment.

| Untouched original source | Length | Raw GP29 IoC | Hill3-inverse IoC | Language result |
|---|---:|---:|---:|---|
| p53 red passage | 51 | 0.02980392 | 0.02901961 | no readable text |
| p55 after the first physical rune | 75 | 0.03855856 | 0.03423423 | no readable text |

The exact p53 output begins `EAAXIUTHHJRAEUMWBJNSIARSTH`; p55 begins `AEEOMRHIAOFESNGDMIUEARWMX`. Complete decoded streams and the checked roundtrips are emitted by the SFT. For both original spans, applying M after the inverse recovers **every original ciphertext rune exactly**. An independent native solved-p57 75-rune plaintext plant passes encryption and blind exact inversion **75/75**.

Thus the straightforward source-matrix **fixed Hill3 cipher is unproductive** on both natural terminal triple frames. Do not repeat column/row-order or phase searches without a new instruction. Other source-described uses of a primitive GF841 state are not excluded.

## Missing human operation and decision

A genuine breakthrough requires an **independently observable instruction to put the three triads into one matrix and specify its use**, or a frozen use that recovers independently verifiable unknown original plaintext. The source relation is unusually precise and supplies a reversible order-840 candidate, so it is worth retaining as a self-contained intermediate. The present test supplies no authenticated plaintext or key; there is no basis to promote it into `results/README.md` as a solved mechanism.

**Reproducer:** [`sims/lp2_three_source_triad_matrix_sft.cjs`](../sims/lp2_three_source_triad_matrix_sft.cjs). Its original-source inputs are `resources/liber-primus/lp2-corpus.json`, `lp2-ink-annotations.json`, `base60-grid.json`, and `resources/lp2-transcription.txt`. Independent original navigation context is in [the fold report](lp2-2016-p55-fold-circumference-keys.md), [the numeric-codec report](lp2-grid-numeric-codec-ambiguity.md), and [the signed-word map](lp2-2016-signed-message-base58-word-map.md).
