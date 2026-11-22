# Red GP-prime-weight rubrics: three zero sums modulo the alphabet size

**Agent 14, 11 November 2026. Classification: source-locked exploratory structural observation and a conditional null calibration.** No unknown LP2 plaintext, authentic key, cipher architecture or destination has been recovered. The zero-sum interpretation was selected during investigation of several numerical readings, so the conditional tail reported here is not a global discovery probability.

## The exact manuscript-side relation

The original LP2 two-ink annotations in [`lp2-ink-annotations.json`](../resources/liber-primus/lp2-ink-annotations.json) identify 225 red runes in **18 separate continuous spans** across all 58 physical pages, including the two solved ending pages. Each rune has a source-defined Gematria Primus prime value in [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json). The manuscript itself emphasizes the primes in the already-solved material, and the 29-symbol alphabet makes modulus 29 a natural candidate.

For each **whole red span**, sum its genuine rune prime values, with no omitted source glyphs, score fitting, start-phase selection or per-span truncation. Exactly three sums are divisible by 29:

| Physical LP2 page | Red span starting at zero-based page rune offset | Number of red runes | GP prime sum | Quotient by 29 |
| ---: | ---: | ---: | ---: | ---: |
| **15** | 0 | 9 | **638** | 22 |
| **40** | 0 | 8 | **435** | 15 |
| **53** | 128 | 51 | **2,262** | 78 |

The other **15** red spans have nonzero residue modulo 29. In particular, the visually separated p15 second red span at offsets 9–19 has sum **430**, which does not qualify. The two solved-ending-page red spans at p56/57 also do not qualify. These are statements about ciphertext and ink placement, not decrypted prose.

The p15 and p53 arithmetic had already been recorded as individual source clues in [field79-phase-allkey-direct-gp-capacity](field79-phase-allkey-direct-gp-capacity.md) and elsewhere. The additional result here is the complete **all-rubric zero-residue census**, including the p40 span, and the source-conditioned family-level calibration below. Do not treat previously noticed sum coincidences as independent confirmations.

## Page-rotation null: a directly reproducible finite test

The test keeps the exact **18 red-span shapes and page positions**, the authentic rune sequence on each page, and all pages' lengths. On each of the 15 pages containing at least one red rune, it draws one page-specific circular rotation of the entire rune tape relative to the unchanged red-ink mask. Thus spans on the *same* page receive the **same** offset. This preserves the local ciphertext composition and shared red-span positions, and is stricter than sampling independent rune values.

The seeded `xorshift32` generator (`0x14ad2026`) supplies **100,000** such sets of page rotations. The script also repeats the same experiment using conventional **0-based GP indices**, as a second natural value assignment, to limit the temptation to present the chosen prime weight alone.

| Statistic | Original source | Rotated-page mean | Rotations meeting/exceeding original | Plus-one upper tail |
| --- | ---: | ---: | ---: | ---: |
| Red spans with GP **prime-weight** sum ≡0 (mod29) | **3** | **0.56425** | 1,806/100,000 | **0.0180698** |
| Red spans with GP **index** sum ≡0 (mod29) | **1** | **0.65177** | 48,639/100,000 | **0.4863951** |
| **Best of either value scheme**, requiring ≥3 | **3** | n/a | 4,267/100,000 | **0.0426796** |

This controls the **two stated GP value assignments**, not all exploratory numerical functions, other moduli, special page subsets, indicator functions or other patterns investigators may have considered. The source ink boundaries were already known before the test, but the zero-sum target was recognized retrospectively. Different nulls, including models that preserve ordinary English plaintext and red-caption intentionality, are outside this conditional calibration. Consequently p≈0.043 is neither a mathematical authentication of an intentional checksum nor a probability that Cicada chose this cipher structure by chance.

## What would make this a cryptanalytic lead

The three zero-sum spans are nonadjacent and have sharply different lengths. The 29-divisibility alone does not say whether they carry key checksums, register resets, chapter instructions or incidental mathematical structure. p40 is an opening red heading; p53 is a long red embedded passage. No source instruction has yet assigned those roles uniformly.

A useful successor would locate an **independent instruction** that both identifies these particular three zero-sum rubrics and specifies how to map their quotients **22, 15, 78** into a key, state transition or other checkable operation. Test that single frozen operation against original ciphertext and a source-supported plaintext criterion. A free search over derived seeds, shifts and chapter assignments would only capitalize on the selected arithmetic.

### Reproduce

[Standalone Node.js 22 CommonJS SFT](../sims/red_span_gp29_zero_test.cjs) reads the canonical corpus and two-ink annotation, asserts all source counts and the original three pages, and prints complete original/rotation statistics. The [on-demand GitHub Actions run 42934675068](https://github.com/FlareZ123/liber-primus/actions/runs/42934675068) successfully ran the exact committed code and printed the above counts. Its workflow is manual-dispatch only (`grid-256-tests.yml`, `probe=redspan-zero`), so routine repository commits do not repeat this exploratory exercise.
