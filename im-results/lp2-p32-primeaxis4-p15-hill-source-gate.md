# P32's prime-sum row/column intersection as a source-sized 4×4 p15 Hill receiver

**Agent 1, 23 November 2026. Evidence class: new original-cipher, fixed-source 4×4 key gate; negative for the twelve strict Hill operations. No previously unknown LP2 plaintext, authenticated new key, cipher, or destination recovered.**

## A source-motivated but uncommanded 4×4 receiver

The authenticated 2016 JPEG is 563×569 pixels. Original physical p32 has 121 runes and an independently selected 11×11 row-major reflow. Its eleven GP-prime row sums, in source order, are:

`[563,617,287,540,743,513,577,579,603,537,486]`.

Its eleven GP-prime column sums are:

`[569,429,641,669,518,611,463,690,378,578,499]`.

The first row and column coincide with the original JPEG dimensions, already known. **New finite register:** exactly **four rows** have prime sums, at zero-based indices **[0,1,4,6]**, and exactly **four columns** have prime sums, at **[0,2,6,10]**. The corresponding unchanged *intersection* of p32's 121 runes is:

```text
GP29 rune indices, physical row and column order:
20 25 13 21
 8 17 18  7
21 12  7 14
15 14  1  7
```

The original p15 image independently prints a visually explicit **4×4 numerical square** whose authentic Fibonacci-at-prime-index rule is known and exactly reproduced. The two artifacts therefore supply a geometrically natural 4×4 ciphertext candidate and three **source-exact** numerical key representations: the 16 **printed magnitudes**, the 16 **reconstructed prime ordinals**, and the corresponding 16 **actual primes**, all in their original p15 physical cell positions. This is preferable to inventing a secret 4×4 matrix.

**Weakest premise:** neither original page nor the signed 2016 sentence tells the player to select the other prime-sum rows/columns, intersect them, or use p15's numbers as a Hill matrix. The apparent 4×4 match was noticed retrospectively. It is a specific test of a possible reversible operation, not proof that the author chose it.

## Exact complete original-cipher inverse

Reduce each of the three fixed 4×4 p15 matrices modulo29. Each is invertible; their respective determinants modulo29 are:

- original printed magnitudes: **17**;
- Fibonacci prime *indices*: **21**;
- Fibonacci-indexed actual primes: **10**.

Without key tuning, page rotations, transposing physical source grids, arbitrary padding, or choosing a favorable offset, test all four conventional row/column Hill orientations on the original 4×4 receiver C:

`M·C`, `C·M`, `M⁻¹·C`, `C·M⁻¹`, all modulo29.

This is **12 predeclared complete 16-rune readouts**, each determined entirely by two original manuscript artifacts. The strict would-be decryption direction is the inverse; forward products serve as sign/orientation checks.

| P15 key | Forward-left | Forward-right | Inverse-left | Inverse-right |
| --- | --- | --- | --- | --- |
| Printed magnitudes | `BHIAIAYSUGMLNIAWMEEO` | `YEAODWJSJPBTBOAEUF` | `HYLELSEAAXNLAEATPC` | `BOXPEATYNGAEEAOEHWGNGOE` |
| Actual Fibonacci-indexed primes | `JFIETHOEWINBEAETHOEBOE` | `YUHBHGAEFSSROMEABE` | `BXBJFOAEOGPXNATHEAW` | `IMOEAWOXAIAJAECMIAO` |
| Prime ordinals | `UXNAEXEWPEOOEYOELHPY` | `THIAMIEIALHHJOEHXEOY` | `GXMEAEXMPFAEYEAIAIOENG` | `CLIFAEAEILNGOESAXYAEOE` |

Outputs use canonical GP29 Latin transliteration, so a 16-rune output can have more than 16 displayed Latin characters. None of the twelve produces an intelligible full message, instruction, phrase or authenticated word of Liber Primus.

## Positive control and decision

The read-only CommonJS original-source reproducer [`sims/lp2_p32_primeaxis4_p15_hill_source_sft.cjs`](../sims/lp2_p32_primeaxis4_p15_hill_source_sft.cjs) loads the canonical p32/p57 GP29 corpus, asserts **all 22 original 11×11 row/column sums**, the selected 4×4 source indices and all sixteen p15 numerical relationships, then computes every inverse. For each of the three authentic matrices, it encrypts a complete independently solved **16-rune** p57 GP29 plant by row-left and row-right Hill encoders and exactly recovers the plant with the corresponding inverse. These controls test functional reversibility independently of unknown ciphertext.

**Decision:** retain the 4×4 prime-axis intersection as an original-source mathematical observation with a clearly unselected operation; reject **these twelve ordinary p15-keyed Hill receivers** as unknown p32 plaintext. No broader assumption that all prime-axis intersections, p15 uses, or other author-prescribed field operations are impossible follows. Another attack needs a contemporary clue specifying a stronger consumer, ideally a locked original-page prediction.