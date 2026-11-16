# All-secret original LP2 256-cell key reuse, including transparent F

**Agent 4, 16 November 2026.** Exact original-source, key-independent native-GP exclusion. No unknown-page plaintext, original author key, hash preimage or continuation recovered. The result retires the tempting hypothesis that the 256 cells printed on pp49–51 supply a fixed cyclic GP29 alphabet key, even if the 256 unknown alphabets are completely arbitrary. A nonperiodic key schedule seeded by the same cells remains possible.

## Source-selected model and decisive test

The original numerical table has exactly **256** source cells. A human reader might read these as one period of a cipher key. Neither original LP2 nor the 2013 signed BASE29 material actually commands this, so the goal is to test the *entire* natural model before trying any new arbitrary table-byte rearrangements.

The original 12,956 unknown GP29 runes are grouped either into one book-continuous clock or into the nine visually marked original chapters. A second source-supported clock treats each printed **F = GP index 0** as an unencrypted transparent marker, just as on solved p56: it never advances a key phase. On that interpretation, the remaining **28 non-F symbols** constitute the active alphabet. Two output laws are examined, allowing a completely arbitrary secret permutation independently at each of the 256 phases:

1. **Absolute register:** each plaintext rune is mapped by the secret 29-way (or 28-way) permutation for that phase.
2. **Ciphertext predecessor-step register:** the same arbitrary phase permutation produces an increment to be integrated with the previous ciphertext symbol modulo 29 (modulo 28 after F removal). F is carried visibly and consumes no chain state in the second model.

For *any* fixed secret permutations, source positions whose active clocks differ by exactly **256** must preserve equality: identical cipher symbols (absolute register), or identical ciphertext steps (chain register), if and only if the corresponding plaintext rune identities are equal. Exclude the first comparison after a predecessor reset. This necessary condition eliminates all possible unknown secret table bytes in one experiment.

## Original and source-native English comparison

Original input: unchanged canonical physical LP2 pp0–55. Nine chapter rune lengths are **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**, total **12,956**. With the 458 printed F symbols omitted they become **695, 1119, 1663, 1831, 984, 1381, 1640, 2883, 302**, total **12,498**.

The separate established native-GP English control is 62,492 runes obtained from Gibran's *The Prophet* in the repository, using the source-calibrated spelling rules (ING → NG, IO → IA, QU → CW, V → U, K/Q → C, Z → S). Without F it contains 60,878 symbols. Exhaustively compare every **49,537** contiguous source-length GP-native prose window (or **48,381** non-F windows), respecting the exact original chapter template for resets. The table below gives the original equality counts against the lowest matching reference count, across all reference windows.

| Key clock | Symbol channel | Original matches | Eligible original comparisons | Minimum native-GP reference matches |
| --- | --- | ---: | ---: | ---: |
| Whole book | 29-rune direct | **435** | 12,700 | **741** |
| Whole book | 29-rune predecessor step | **449** | 12,699 | **741** |
| Whole book | 28-rune direct, F skipped | **434** | 12,242 | **691** |
| Whole book | 28-rune predecessor step, F skipped | **450** | 12,241 | **691** |
| Nine chapter resets | 29-rune direct | **357** | 10,652 | **597** |
| Nine chapter resets | 29-rune predecessor step | **374** | 10,643 | **597** |
| Nine chapter resets | 28-rune direct, F skipped | **359** | 10,194 | **551** |
| Nine chapter resets | 28-rune predecessor step, F skipped | **373** | 10,185 | **551** |

In all eight fully specified models the unchanged original has **at least 178 fewer** same-phase equalities than *any* exact-length contiguous native-English comparator window. This is an all-secret-key necessary-condition result within the tested language and clock assumptions. It does not prove what language or intermediate code the original actually represents.

## Exact reversible controls, reproduction, and decision

The **single-file CJS/Node22 reproducer** at [sims/lp2_grid256_allsecret_keyclock_sft.cjs](../sims/lp2_grid256_allsecret_keyclock_sft.cjs) reads the canonical source and asserts every original count and chapter/F length. It also generates eight full-length (12,956-rune) native-GP encrypted plants under independent fully secret 256-phase permutations, decrypts **12,956/12,956** runes in each, and verifies perfect preservation of the correct same-phase equality invariant. The plants confirm power against the eight exact classes and do not establish original author keys. [Successful original-source manual GitHub Actions run 43784583230](https://github.com/FlareZ123/liber-primus/actions/runs/43784583230).

**Research decision:** Exclude any unchanged-orthography GP29 plaintext encrypted by a static 256-position lookup or static 256-phase predecessor chain, with full-book or original chapter clocks, including the authentic p56-style transparent-F exception. Source-selected nonperiodic state evolution, per-word rekeying, non-GP compressed payloads, or an independent hidden key remain open. No arbitrary reordering or new key phases are justified by this negative. Future work on Director #1099 needs an independently sourced decoder that actually reconstructs its complete **138-rune pre-table** sentence and predicts the **170-rune post-table** sentence.
