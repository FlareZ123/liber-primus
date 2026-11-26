# LP2 opening marginal staves: provisional Cistercian reading and totient partition

**Status: intermediate hypothesis, not an established result. No LP2 plaintext or cipher key has been recovered by this observation.**

## Observation and candidate reading

The original LP2 images `resources/liber-primus/17.jpg`, `18.jpg`, and `19.jpg` repeat two wood-like vertical staves at opposite page corners. Each has a central vertical stem and strokes occupying upper/lower left/right quadrants.

A candidate interpretation is the common **vertical Cistercian numeral** convention. In that convention the units occupy the upper-right quadrant, tens upper-left, hundreds lower-right, and thousands lower-left. The standard reference and glyph chart are documented in Jonathan P. Spratte, [*The xistercian package*, Figure 1 and introduction](https://ctan.math.utah.edu/pub/ctan/tex-archive/graphics/pgf/contrib/xistercian/xistercian.pdf), especially the description of vertical place-value groups.

Reading the prominent strokes as Cistercian digits gives:

| Image glyph | Thousands | Hundreds | Tens | Units | Candidate value |
|---|---:|---:|---:|---:|---:|
| Lower-left stave | 1 | 1 | 3 | 3 | **1133** |
| Upper-right stave | 3 | 3 | 1 | 1 | **3311** |

The two candidate values are digit reversals, and their Cistercian quadrant patterns are corresponding 180-degree rotations. The physical rendering is stylized: the small dots/knots and irregular branch ends are not explained by the numeral model. A branch-rune/cipher-stave interpretation or purely decorative wooden-stave motif remains a serious alternative. The visual identification is therefore provisional; the arithmetic below does not prove it.

## Exact arithmetic consequence

The candidate values factor as:

```text
1133 = 11 × 103
3311 = 7 × 11 × 43
```

Applying Euler's totient to the prime factors of 3311:

```text
φ(7)  = 6
φ(11) = 10
φ(43) = 42
6 + 10 + 42 = 58
6 × 10 × 42 = 2520 = φ(3311)
```

The LP2 release contains 58 images, pages 0–57. These values give an exact contiguous partition:

| Candidate section | LP2 pages | Number of pages |
|---|---:|---:|
| 1 | 0–5 | 6 |
| 2 | 6–15 | 10 |
| 3 | 16–57 | 42 |
| **Total** | **0–57** | **58** |

The last section includes 40 unresolved pages (16–55) and the two solved control pages (56–57). This is an exact arithmetic partition, not yet proof that the manuscript uses these as cipher chapters or reset boundaries.

The companion value also gives:

```text
φ(1133) = φ(11) × φ(103) = 10 × 102 = 1020
```

The repeated factor 11 and its totient 10 are notable because 10 is the middle partition length.

## Cross-page structural correspondences

The prime factors 7, 11, and 43 have independent-looking counterparts in existing LP2 analyses:

- **7:** page 33 has a 49-word register, (49=7^2). See `im-results/lp2-p33-complete49word-2014-magic99-pair-gate.md`.
- **11:** page 32 contains 121 runes, (121=11^2), in the corpus. The 11×11 reflow is an interpretation, not a proven layout. See `im-results/lp2-p32-11x11-121state-prevmod11-allsecret-capacity.md`.
- **43:** page 55 has a strict full-page graphic interior/exterior split of 43/33; a different complete-page-local group peel gives 43/32. These are distinct segmentations, so 43 is not an invariant under every parse. See `results/README.md` and `im-results/lp2-p55-inner43-divinity-exact-gate.md`.

The factor-to-page correspondence is a useful selector hypothesis, but the underlying page counts and layouts must not be conflated: 121 is a raw rune count, the p33 49 is a word-register count, and p55's 43 is tied to a specified graphic segmentation.

## Possible relation to the known prime constants

The candidate Cistercian values differ from the known 2014/LP2 prime constants by powers of ten:

```text
1133 − 1033 = 100 = 10²
3311 − 3301 = 10
```

The values 1033 and 3301 occur in the known magic-square/cuneiform material. Since φ(11)=10, the offsets may be meaningful. The LP2 p57 line about shedding circumferences could conceivably select removal of these extra place-value contributions, leaving 1033 and 3301. This is only a conjectural bridge: no geometric rule currently selects those exact digit removals. Do not treat it as a decryption.

The solved LP1 p5 text explicitly invokes primes and the totient function. That is a plausible historical clue for factoring these candidate values and applying φ, but it does not by itself prove that the p0 staves are Cistercian or specify a cipher receiver.

## Prior-work boundary

The repository already contains p0 Rök/cross-arm, base-60, and prime/totient investigations; none of the searched repository files identifies the staves as Cistercian. This is a distinct visual hypothesis, not a revival of the Rök cross-arm test.

Do **not** repeat the already-tested p5-derived φ(1033)/φ(3301) two-residue additive key or p5 totient-Hill families. The existing LP1 p5 totient/Hill report records negative results. The new contribution here is the proposed **1133/3311 visual reading**, its prime-factor selector, and the exact 6/10/42 page-count correspondence.

## Decisive next tests

1. **Blind glyph recognition.** Give an independent reviewer only the p0–2 stave crops, without the candidate values or factorization. Ask whether they recognize a known numeral system and to transcribe both glyphs. A failure to identify Cistercian or a different consistent reading rejects this branch.
2. **Stroke-level comparison.** Compare the original glyphs against standard vertical Cistercian 1133 and 3311, allowing only the kind of stylization visible in the original. Explicitly compare the branch-rune/cipher-stave alternative. Do not use the desired factorization to choose stroke assignments.
3. **Section-boundary prediction.** Test whether pages 0–5, 6–15, and 16–57 show independently motivated changes in layout, cipher state, or key schedule. The p15 numeric grid and the p56–57 solved controls are useful landmarks, but section boundaries must be supported by original evidence rather than selected after seeing the arithmetic.
4. **Source-selected 7×11×43 consumer.** If the numeral reading survives, formulate one locked extraction/order rule connecting the p33 7-based register, p32 11-based page, and p55 43-rune interior. Test it on original ciphertext with p56/p57 and independent plaintext controls. The 2520-cell interior (6×10×42) is a possible structural model, not permission to enumerate arbitrary 3D layouts.

**Current conclusion:** the Cistercian reading is a promising, falsifiable structural hypothesis. The exact totient partition and factor/page correspondences justify an independent test; they do not yet establish creator intent, a key, or plaintext.

## Test of a distinct cipher regime at the proposed section boundaries

A cheap, locked diagnostic checked whether the candidate 0–5 / 6–15 / 16–57 partition corresponds to obvious rune-level substitution changes. Using the canonical GP29 indices directly:

| Candidate section | Runes | Shannon entropy (bits/rune) | IoC |
|---|---:|---:|---:|
| p0–5 | 1,470 | 4.84454 | 0.03445817 |
| p6–15 | 2,292 | 4.84679 | 0.03460540 |
| p16–57 | 9,374 | 4.85545 | 0.03450079 |

The Jensen–Shannon divergences between aggregate section distributions are small: 0.00481 bits (first/second), 0.00359 (second/third), and 0.00524 (first/third). The two proposed adjacent page boundaries are not unusual among the 57 physical transitions: p5|p6 has JSD 0.04079 (rank 30/57); p15|p16 has 0.05206 (rank 42/57). The largest shifts occur near the solved terminal pages, not at the proposed 6/10/42 boundaries.

**Decision:** this does not support three visibly different simple substitution regimes or obvious frequency resets at those boundaries. It does not reject a structural grouping used for transposition, page navigation, or a shared cipher. Do not claim the partition identifies three distinct ciphers. The updated arithmetic/distribution SFT reproduces these statistics.
