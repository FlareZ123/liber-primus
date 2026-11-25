# p23–26 mayfly half-turn and authentic p56 clock: source-fixed negative

**Agent41 · Director Issue #2707 · 25 November 2026**

**Decision:** the image-selected discrete split is well-defined, but the fixed authentic p56 prime-minus-one / transparent-F clock is impossible at the twelfth rune of the p23 black body. This rejects this exact geometry/clock conjunction. It does not reject the mayfly identification or the measured 180° artwork relation.

## Frozen geometry, before rune-value use

LP2 page p23 is JPEG 40.jpg; p24, p25 and p26 are 41.jpg, 42.jpg and 43.jpg. The original SHA-256 values are pinned in the reproducer.

The p24 left-flank upper-to-lower fit reuses the body/antenna mask and grid from the quantitative specimen registration in #2675. The 180° fit has training NCC **0.996439**, with held-out wing/leg/tail NCC **0.914243 / 0.977738 / 0.980638**. The competing vertical-reflection fit is **0.977801** on training and **0.769094 / 0.706154 / 0.614710** on those held-out regions. The fitted 180° center is **(x=313.8947, y=1788.7783)** in original p24 image coordinates.

The p25 left and right art crops are each translated **(-1,-1)** relative to p24 (equivalently, shifting p25 by (+1,+1) aligns it); p26 is pixel-identical to p24 in both crops. The resulting page-specific centers are:

| LP2 page | Center y | Text line 6 ends | Text line 7 starts |
|---|---:|---:|---:|
| p24 | 1788.7783 | 1728 | 1802 |
| p25 | 1787.7783 | 1728 | 1802 |
| p26 | 1788.7783 | 1728 | 1802 |

All three centers fall in the same empty interline band, y=1729–1801. There are **zero pixels below grayscale 180** in that band across the central text block on each original page. The page-specific center estimates therefore select one discrete partition without a rune-value or line-order parameter: **lines 1–6 forward, lines 7–12 reversed**. No rune/glyph crosses the geometric midline.

The source transcription gives these line rune counts and exact split offsets:

| Page | Lines 1–6 | Upper runes | Lines 7–12 | Lower runes | Frozen split |
|---|---|---:|---|---:|---:|
| p24 | 22, 24, 21, 24, 23, 21 | 135 | 22, 23, 23, 22, 22, 23 | 135 | 135 |
| p25 | 22, 22, 24, 23, 23, 23 | 137 | 24, 23, 21, 24, 23, 21 | 136 | 137 |
| p26 | 20, 22, 23, 22, 24, 23 | 134 | 24, 21, 19, 24, 23, 20 | 131 | 134 |

The p23 red heading is a separate 16-rune span; the original chapter black body starts at p23 rune offset 16. The stream under test is therefore 197 p23 body runes followed by p24–p26, for **1,005 runes** total. Preserve source-page order. The only permutation is the frozen per-page lower-half reversal.

### Printed word carries at the split

The geometric line boundary is clean at glyph level, but two printed words wrap across line 6/7:

- p24: line 6 ends with ᛈᛟ and line 7 begins ᚠ, giving the printed word ᛈᛟᚠ across the split.
- p25: line 6 ends with a word separator; no word crosses.
- p26: line 6 ends with ᛉᛖᛡ and line 7 begins ᛞᚦ, giving ᛉᛖᛡᛞᚦ across the split.

These are recorded from the source transcription after the geometry was frozen. The lower-half reversal moves each lower fragment to the far end of its reversed block; it does not preserve either printed word as a contiguous token.

## Authentic p56 cipher gate

Use the established p56 rule with prime stream 2, 3, 5, 7, … and shift (p−1) mod 29. A plaintext F (GP29 value 0) is emitted literally and does not consume a prime. A ciphertext F may also be an encrypted non-F, so the inverse must allow both branches at ciphertext value 0.

The implementation first passes the known p56 positive control exactly: **85/85** runes; plaintext F only at offset 56; ciphertext-F positions 35, 47, 51, 56 and 74; **84** prime ticks consumed. Thus it does not incorrectly skip every ciphertext F.

At the source-defined p23 black-body origin, the first 12 ciphertext values are:

- C: **28, 6, 15, 25, 13, 7, 19, 28, 12, 11, 12, 7**
- (p−1) mod 29: **1, 2, 4, 6, 10, 12, 16, 18, 22, 28, 1, 7**
- candidate P: **27, 4, 11, 19, 3, 24, 3, 10, 19, 12, 11, 0**

There is no ciphertext F in the first 11 positions, so no literal-F hold can alter the clock. At body offset **11** (the twelfth body rune; p23 physical rune offset **27**), C=7 and the twelfth prime is 37, so the shift is 36 mod 29 = 7. The only candidate plaintext is F (0), but a plaintext F must pass through as ciphertext F and consume no prime. C=7 cannot encode it. The exact literal-F reachability DP has no state after this symbol.

This contradiction occurs entirely on p23, before any p24–p26 permutation is reached. It is independent of the mayfly split, word carries, language scoring, and all later F-hold choices. No key, phase, origin or orientation sweep was run.

## Matched native positive plants

Three independent native English controls were encoded to GP29 using longest-match rune tokens (including ING→rune 21; QU→CW, V→U, K→C, Z→S), cut to the same physical page lengths **197/270/273/265**, and run through the same per-page permutation. Each was encrypted under the same continuous p56 prime-minus-one/F clock, laid out in physical order with the inverse permutation, reread with the frozen geometry, and exactly inverted using the known literal-F mask.

| Native source | Total F holds | Prime ticks | p23–24 development (467) | p25–26 frozen continuation (538) |
|---|---:|---:|---|---|
| Gibran | 24 | 981 | 467/467 exact; 8 F | 538/538 exact; 16 F |
| Shakespeare | 26 | 979 | 467/467 exact; 13 F | 538/538 exact; 13 F |
| Emerson | 21 | 984 | 467/467 exact; 9 F | 538/538 exact; 12 F |

The three controls pass both the development and frozen continuation. They validate the prime clock, transparent-F forward/inverse, page lengths and geometric involution. They use the known plaintext F mask; they do **not** claim blind recovery of an unknown mask.

## Fork and reproducibility

**Close this precise branch:** the geometric split is unique at rune level, but the source-fixed p56 clock is algebraically contradicted at the twelfth p23 body rune. Retire this geometry/clock conjunction rather than rescuing it with a new origin, key, phase, split, orientation or cipher layer. The artwork registration remains a verified visual fact; it has not yielded plaintext, key material or the intended continuation.

Reproducers:

- Geometry and blank-gap proof: sims/lp2_p23_26_halfturn_text_split_geometry_sft.py
- Cipher, p56 positive control, three native plants and first-failure DP: sims/lp2_p23_26_mayfly_halfturn_p56_clock_gate_sft.cjs

The earlier #2126/#2112 work concerns the separate p7/p23/p56 five-dot stencil and its missing text-to-rune selector; it does not define this p24 mayfly split. The earlier p23/p56 whole-page D4 script tests a whole-chapter reversal, not this per-page upper-forward/lower-reversed layout. Neither was rerun here.

**No unknown LP2 plaintext, key or destination recovered.**
